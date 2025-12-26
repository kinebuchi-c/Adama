# AWS + Lark カレンダー連携 要件定義書

## 1. プロジェクト概要

### 1.1 目的
Customer Cloud International Project Dashboard のイベント（活動予定）を、担当者のLarkカレンダーに自動連携する機能を実装する。

### 1.2 スコープ

| 対象 | 内容 |
|------|------|
| フロントエンド | React (Vite) - 既存アプリ |
| バックエンド | AWS Lambda + API Gateway |
| 外部連携 | Lark Open Platform Calendar API |
| データベース | Amazon DynamoDB（Lark設定用） + 既存IndexedDB |

---

## 2. 機能要件

### 2.1 Lark連携設定機能

#### FR-001: Lark連携ON/OFF
- ユーザーはLark連携の有効/無効を切り替えられる
- デフォルトは無効

#### FR-002: Lark認証情報設定
- Lark App ID の入力・保存
- Lark App Secret の入力・保存（暗号化必須）
- 接続テスト機能

#### FR-003: 担当者マッピング管理
- 担当者の表示名とLarkメールアドレスの紐付け登録
- 一覧表示・編集・削除
- CSVインポート/エクスポート

### 2.2 カレンダー同期機能

#### FR-004: 予定作成時の自動同期
- 「予定」タイプのイベント作成時、Larkカレンダーに自動登録
- 同期対象: タイトル、日時、説明、参加者
- 同期成功/失敗のステータス表示

#### FR-005: 予定更新時の同期
- イベント編集時、Larkカレンダーも更新
- 日時変更、タイトル変更、参加者変更に対応

#### FR-006: 予定削除時の同期
- イベント削除時、Larkカレンダーからも削除
- 削除確認ダイアログにLark連携解除の表示

#### FR-007: 手動再同期
- 同期失敗したイベントの手動再同期ボタン
- 一括再同期機能

### 2.3 参加者通知機能

#### FR-008: Lark招待送信
- イベント作成時、参加者にLark招待を送信
- 招待の承諾/辞退ステータスの取得（オプション）

#### FR-009: リマインダー設定
- イベント前のリマインダー時間設定（15分/30分/1時間/1日前）
- デフォルト値の設定

---

## 3. 非機能要件

### 3.1 セキュリティ

#### NFR-001: 認証情報の保護
- Lark App Secretは AWS Secrets Manager で管理
- フロントエンドには認証情報を含めない
- 全API通信はHTTPS

#### NFR-002: アクセス制御
- API GatewayでCORS設定
- Lambda関数へのアクセスは認証済みリクエストのみ

### 3.2 パフォーマンス

#### NFR-003: レスポンス時間
- イベント作成+Lark同期: 3秒以内
- 設定画面の読み込み: 1秒以内

#### NFR-004: スケーラビリティ
- 同時100リクエストに対応
- Lark API Rate Limit（5000 req/min）を考慮

### 3.3 可用性

#### NFR-005: エラーハンドリング
- Lark API障害時もローカル保存は成功させる
- リトライ機能（Exponential Backoff）
- エラーログ記録（CloudWatch Logs）

#### NFR-006: オフライン対応
- Lark連携失敗時は「同期待ち」としてキューイング
- オンライン復帰時に自動再同期

---

## 4. システム構成

### 4.1 AWSアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         VPC (Optional)                             │  │
│  │                                                                    │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │  │
│  │  │   Amazon    │    │   AWS       │    │   AWS Secrets       │   │  │
│  │  │   S3        │    │   Lambda    │←──→│   Manager           │   │  │
│  │  │  (Frontend) │    │             │    │  (Lark Credentials) │   │  │
│  │  └─────────────┘    └──────┬──────┘    └─────────────────────┘   │  │
│  │         │                  │                                      │  │
│  │         │                  │                                      │  │
│  │  ┌──────▼──────┐    ┌──────▼──────┐    ┌─────────────────────┐   │  │
│  │  │  CloudFront │    │ API Gateway │    │   DynamoDB          │   │  │
│  │  │  (CDN)      │    │ (REST API)  │    │  - LarkSettings     │   │  │
│  │  └─────────────┘    └─────────────┘    │  - UserMappings     │   │  │
│  │                                        │  - SyncQueue        │   │  │
│  │                                        └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│   Web Browser   │    │  Lark Open Platform │
│  (React App)    │    │  - Calendar API     │
│  + IndexedDB    │    │  - Contact API      │
└─────────────────┘    └─────────────────────┘
```

### 4.2 コンポーネント一覧

| コンポーネント | サービス | 用途 |
|---------------|----------|------|
| フロントエンド | S3 + CloudFront | Reactアプリホスティング |
| API | API Gateway | RESTful API エンドポイント |
| ビジネスロジック | Lambda (Node.js 20.x) | Lark API連携処理 |
| 設定データ | DynamoDB | Lark設定、ユーザーマッピング |
| シークレット | Secrets Manager | Lark App Secret |
| ログ | CloudWatch Logs | エラーログ、監査ログ |
| 監視 | CloudWatch Alarms | エラー率監視 |

---

## 5. API設計

### 5.1 エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/lark/settings | Lark設定取得 |
| PUT | /api/lark/settings | Lark設定更新 |
| POST | /api/lark/test-connection | 接続テスト |
| GET | /api/lark/user-mappings | ユーザーマッピング一覧 |
| POST | /api/lark/user-mappings | ユーザーマッピング追加 |
| PUT | /api/lark/user-mappings/{id} | ユーザーマッピング更新 |
| DELETE | /api/lark/user-mappings/{id} | ユーザーマッピング削除 |
| POST | /api/lark/events | Larkイベント作成 |
| PUT | /api/lark/events/{larkEventId} | Larkイベント更新 |
| DELETE | /api/lark/events/{larkEventId} | Larkイベント削除 |
| POST | /api/lark/events/sync | 手動同期実行 |

### 5.2 API詳細

#### POST /api/lark/events

リクエスト:
```json
{
  "localEventId": "uuid-xxxx",
  "title": "大使館訪問",
  "description": "初回ミーティング",
  "startTime": "2025-01-15T10:00:00+09:00",
  "endTime": "2025-01-15T11:00:00+09:00",
  "participants": ["kinoshita@example.com", "tanaka@example.com"],
  "reminderMinutes": 30
}
```

レスポンス（成功）:
```json
{
  "success": true,
  "larkEventId": "lark-event-xxxx",
  "larkCalendarId": "primary",
  "attendeeStatus": {
    "kinoshita@example.com": "needs_action",
    "tanaka@example.com": "needs_action"
  }
}
```

レスポンス（エラー）:
```json
{
  "success": false,
  "error": {
    "code": "LARK_API_ERROR",
    "message": "Failed to create event",
    "details": "Rate limit exceeded"
  },
  "retryable": true
}
```

---

## 6. データモデル

### 6.1 DynamoDB テーブル設計

#### LarkSettings テーブル

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | "SETTINGS" (固定) |
| SK | String | "MAIN" (固定) |
| enabled | Boolean | 連携有効フラグ |
| appId | String | Lark App ID |
| defaultCalendarId | String | デフォルトカレンダーID |
| autoSync | Boolean | 自動同期フラグ |
| eventDurationMinutes | Number | デフォルト所要時間 |
| reminderMinutes | Number | リマインダー時間 |
| updatedAt | String | 更新日時 (ISO8601) |

#### UserMappings テーブル

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | "USER" |
| SK | String | ユーザーID (UUID) |
| displayName | String | 表示名（例: "木下"） |
| larkEmail | String | Larkメールアドレス |
| larkUserId | String | Lark User ID（キャッシュ） |
| createdAt | String | 作成日時 |
| updatedAt | String | 更新日時 |

#### SyncQueue テーブル

| 属性 | 型 | 説明 |
|------|-----|------|
| PK | String | "QUEUE" |
| SK | String | ローカルイベントID |
| action | String | "CREATE" / "UPDATE" / "DELETE" |
| eventData | Map | イベントデータ |
| status | String | "PENDING" / "PROCESSING" / "FAILED" |
| retryCount | Number | リトライ回数 |
| lastError | String | 最後のエラー |
| createdAt | String | 作成日時 |
| TTL | Number | 有効期限（7日後） |

---

## 7. セキュリティ設計

### 7.1 認証・認可フロー

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ API Gateway │────▶│  Lambda  │────▶│  Lark    │
│          │     │  + Cognito  │     │          │     │   API    │
└──────────┘     └─────────────┘     └──────────┘     └──────────┘
     │                 │                   │                │
     │  1. JWT Token   │                   │                │
     │────────────────▶│                   │                │
     │                 │  2. Validate      │                │
     │                 │─────────────────▶│                │
     │                 │                   │  3. Get Secret │
     │                 │                   │───────────────▶│
     │                 │                   │                │ Secrets
     │                 │                   │◀───────────────│ Manager
     │                 │                   │                │
     │                 │                   │  4. API Call   │
     │                 │                   │───────────────▶│
     │                 │                   │◀───────────────│
     │◀────────────────│◀──────────────────│                │
     │  5. Response    │                   │                │
```

### 7.2 Secrets Manager 設定

シークレット名: `adama/lark/credentials`

```json
{
  "appId": "cli_xxxxxxxxxxxxx",
  "appSecret": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### 7.3 IAMポリシー

Lambda実行ロール:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:ap-northeast-1:*:secret:adama/lark/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ap-northeast-1:*:table/Adama*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 8. エラーハンドリング

### 8.1 エラーコード一覧

| コード | HTTPステータス | 説明 | 対処 |
|--------|---------------|------|------|
| LARK_AUTH_FAILED | 401 | Lark認証失敗 | 認証情報を確認 |
| LARK_RATE_LIMIT | 429 | レート制限 | リトライ（Backoff） |
| LARK_API_ERROR | 502 | Lark API エラー | リトライ |
| LARK_USER_NOT_FOUND | 404 | ユーザー未発見 | マッピング確認 |
| LARK_CALENDAR_NOT_FOUND | 404 | カレンダー未発見 | カレンダーID確認 |
| INVALID_REQUEST | 400 | リクエスト不正 | リクエスト修正 |
| INTERNAL_ERROR | 500 | 内部エラー | サポート連絡 |

### 8.2 リトライ戦略

```javascript
const retryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableErrors: [
    'LARK_RATE_LIMIT',
    'LARK_API_ERROR',
    'INTERNAL_ERROR'
  ]
};

// Exponential Backoff
const delay = Math.min(
  baseDelayMs * Math.pow(2, retryCount),
  maxDelayMs
);
```

---

## 9. 実装計画

### Phase 1: AWS基盤構築（1日）
- [ ] DynamoDBテーブル作成
- [ ] Secrets Manager設定
- [ ] Lambda関数のスケルトン作成
- [ ] API Gateway設定
- [ ] IAMロール/ポリシー設定

### Phase 2: バックエンドAPI実装（2日）
- [ ] Lark SDK統合
- [ ] 認証・トークン管理
- [ ] イベントCRUD API実装
- [ ] ユーザーマッピングAPI実装
- [ ] エラーハンドリング

### Phase 3: フロントエンド実装（2日）
- [ ] 設定画面コンポーネント
- [ ] ユーザーマッピング管理UI
- [ ] ProjectHistoryへのLark連携追加
- [ ] 同期ステータス表示
- [ ] エラー通知UI

### Phase 4: テスト・デプロイ（1日）
- [ ] 単体テスト
- [ ] 結合テスト
- [ ] 本番デプロイ
- [ ] 動作確認

---

## 10. コスト見積もり

### 月間コスト（想定使用量）

| サービス | 使用量 | 月額（USD） |
|----------|--------|-------------|
| Lambda | 10,000リクエスト/月 | $0.00 (無料枠内) |
| API Gateway | 10,000リクエスト/月 | $0.04 |
| DynamoDB | 1GB, 低頻度アクセス | $0.25 |
| Secrets Manager | 1シークレット | $0.40 |
| CloudWatch Logs | 1GB | $0.50 |
| **合計** | | **約 $1.20/月** |

※ S3 + CloudFrontは既存デプロイ費用に含む

---

## 11. 今後の拡張案

### 11.1 短期（実装後）
- 双方向同期（Lark → アプリ）
- 繰り返しイベント対応
- タイムゾーン設定

### 11.2 中期
- Larkボット通知
- ビデオ会議リンク自動生成
- 複数カレンダー対応

### 11.3 長期
- Google Calendar連携
- Outlook連携
- iCal形式エクスポート

---

*文書バージョン: 1.0*
*作成日: 2025-12-26*
*作成者: Claude Code*
