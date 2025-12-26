# Lark カレンダー連携 設計書

## 1. 概要

### 目的
プロジェクトの活動予定（イベント）を作成した際に、担当者のLarkカレンダーに自動でスケジュールを登録する。

### 期待される動作
1. ユーザーが活動履歴で「予定」を追加
2. 参加者を指定
3. 自動的にLarkカレンダーに予定が作成され、参加者に通知

---

## 2. 技術調査結果

### 2.1 Lark Open Platform

| 項目 | 値 |
|------|-----|
| ドキュメント | https://open.larksuite.com/document |
| カレンダーAPI | https://open.larksuite.com/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4 |
| SDK (Node.js) | @larksuiteoapi/node-sdk |
| 認証方式 | OAuth 2.0 / App Access Token / Tenant Access Token |

### 2.2 必要なAPI

| API | 用途 | エンドポイント |
|-----|------|---------------|
| カレンダーイベント作成 | 予定の作成 | POST /calendar/v4/calendars/:calendar_id/events |
| 参加者追加 | 担当者を予定に追加 | POST /calendar/v4/calendars/:calendar_id/events/:event_id/attendees |
| ユーザー検索 | メールアドレスからUser ID取得 | GET /contact/v3/users/batch_get_id |
| カレンダー一覧取得 | ユーザーのカレンダー取得 | GET /calendar/v4/calendars |

### 2.3 必要な権限スコープ

```
calendar:calendar              # カレンダー読み取り
calendar:calendar:write        # カレンダー書き込み
calendar:calendar.event        # イベント読み取り
calendar:calendar.event:write  # イベント作成・更新
contact:user.id:readonly       # ユーザーID取得
contact:user.email:readonly    # ユーザーメール取得
```

---

## 3. アーキテクチャ設計

### 3.1 推奨構成: Serverless Functions

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │ ProjectHistory │→→│ LarkService    │→→│ API Call       │      │
│  │ (イベント作成)  │  │ (クライアント)  │  │ /api/lark/*   │      │
│  └────────────────┘  └────────────────┘  └────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Serverless Functions                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/lark/create-event                                     │  │
│  │   - リクエスト検証                                          │  │
│  │   - Lark Access Token取得                                  │  │
│  │   - カレンダーイベント作成                                   │  │
│  │   - 参加者追加                                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/lark/lookup-users                                     │  │
│  │   - メールアドレス → Lark User ID 変換                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Lark Open API                             │
│  - Calendar API                                                   │
│  - Contact API                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 データフロー

```
1. ユーザーが予定を作成
   │
   ▼
2. フロントエンドがLark連携ON確認
   │
   ├─ OFF → IndexedDBに保存のみ
   │
   └─ ON ─┐
          ▼
3. /api/lark/create-event を呼び出し
   │
   ▼
4. サーバーがLark APIを呼び出し
   │
   ├─ 成功 → イベントIDを返却、ローカルに保存
   │
   └─ 失敗 → エラーハンドリング、リトライオプション表示
```

---

## 4. データベース変更

### 4.1 ProjectEvent に追加するフィールド

```typescript
interface ProjectEvent {
  // 既存フィールド
  id: string
  projectId: string
  date: Date
  title: string
  description?: string
  participants?: string
  eventType: 'completed' | 'scheduled'

  // 追加フィールド
  larkEventId?: string           // LarkカレンダーのイベントID
  larkCalendarId?: string        // LarkカレンダーID
  larkSyncStatus?: 'pending' | 'synced' | 'failed' | 'not_synced'
  larkSyncError?: string         // 同期エラーメッセージ
  larkLastSyncAt?: Date          // 最終同期日時
}
```

### 4.2 新規テーブル: LarkUserMapping

担当者名とLark User IDのマッピング

```typescript
interface LarkUserMapping {
  id: string
  displayName: string      // アプリ内の表示名（例: "木下"）
  larkUserId: string       // Lark User ID
  larkEmail?: string       // Larkのメールアドレス
  createdAt: Date
  updatedAt: Date
}
```

### 4.3 新規テーブル: LarkSettings

Lark連携設定

```typescript
interface LarkSettings {
  id: 'main'
  enabled: boolean                    // 連携ON/OFF
  appId?: string                      // Lark App ID（暗号化推奨）
  defaultCalendarId?: string          // デフォルトカレンダー
  autoSync: boolean                   // 自動同期ON/OFF
  syncCompletedEvents: boolean        // 完了イベントも同期するか
  eventDurationMinutes: number        // デフォルトイベント時間（分）
  reminderMinutes: number             // リマインダー時間（分）
  updatedAt: Date
}
```

---

## 5. UI設計

### 5.1 設定画面（新規）

```
┌─────────────────────────────────────────────┐
│  ⚙️ Lark連携設定                            │
├─────────────────────────────────────────────┤
│                                             │
│  🔗 連携ステータス: [未接続]                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ App ID                              │   │
│  │ [____________________________]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ App Secret                          │   │
│  │ [____________________________]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [接続テスト]  [保存]                        │
│                                             │
├─────────────────────────────────────────────┤
│  📋 担当者マッピング                          │
├─────────────────────────────────────────────┤
│  表示名          Larkメール                  │
│  ─────────────────────────────────────────  │
│  木下            kinoshita@example.com      │
│  田中            tanaka@example.com         │
│  [+ 追加]                                   │
└─────────────────────────────────────────────┘
```

### 5.2 予定作成時のUI変更

```
┌─────────────────────────────────────────────┐
│  + 新しいイベントを追加                       │
├─────────────────────────────────────────────┤
│  種別: [✓ 完了] [📅 予定]                    │
│                                             │
│  日付: [2025-01-15]                         │
│                                             │
│  イベント: [大使館訪問____________]          │
│                                             │
│  参加者: [木下, 田中_____________]           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔗 Larkカレンダーに登録              │   │ ← 新規追加
│  │ [✓] 参加者のカレンダーに予定を作成    │   │
│  │                                     │   │
│  │ ⏰ 開始時刻: [10:00]                 │   │
│  │ ⏱️ 所要時間: [60分]                  │   │
│  │ 🔔 リマインダー: [30分前]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [キャンセル]  [追加]                        │
└─────────────────────────────────────────────┘
```

### 5.3 同期ステータス表示

```
┌─────────────────────────────────────────────┐
│  📅 これからの予定                           │
├─────────────────────────────────────────────┤
│  12月29日  初回コンタクト                    │
│            ポーランド / お                   │
│            👥 木下                          │
│            🔗 Lark同期済み ✓                │ ← 同期ステータス
└─────────────────────────────────────────────┘
```

---

## 6. セキュリティ考慮事項

### 6.1 認証情報の管理

| 項目 | 保存場所 | 暗号化 |
|------|----------|--------|
| App ID | 環境変数 (.env) | 不要 |
| App Secret | 環境変数 (.env) | 必須（サーバー側のみ） |
| Access Token | メモリ（キャッシュ） | - |
| Refresh Token | サーバー側ストレージ | 必須 |

### 6.2 推奨事項

1. **App Secretは絶対にフロントエンドに含めない**
2. Access Tokenの有効期限管理（2時間）
3. Rate Limit対応（5000 req/min）
4. エラー時のリトライ戦略（Exponential Backoff）

---

## 7. 実装ステップ

### Phase 1: 基盤整備
- [ ] Lark Developerでアプリ作成
- [ ] 必要な権限の申請・承認
- [ ] Serverless Functions環境構築（Vercel/Netlify）
- [ ] 環境変数設定

### Phase 2: バックエンド実装
- [ ] /api/lark/auth - 認証エンドポイント
- [ ] /api/lark/create-event - イベント作成
- [ ] /api/lark/update-event - イベント更新
- [ ] /api/lark/delete-event - イベント削除
- [ ] /api/lark/lookup-users - ユーザー検索

### Phase 3: フロントエンド実装
- [ ] LarkSettings テーブル追加（database.ts）
- [ ] LarkUserMapping テーブル追加
- [ ] ProjectEvent にLarkフィールド追加
- [ ] 設定画面コンポーネント作成
- [ ] LarkService クラス作成
- [ ] ProjectHistory にLark連携UI追加

### Phase 4: テスト・改善
- [ ] 接続テスト機能
- [ ] エラーハンドリング
- [ ] リトライ機能
- [ ] 同期状況の可視化

---

## 8. 参考リンク

- [Lark Open Platform](https://open.larksuite.com/)
- [Calendar API Documentation](https://open.larksuite.com/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4)
- [@larksuiteoapi/node-sdk (npm)](https://www.npmjs.com/package/@larksuiteoapi/node-sdk)
- [GitHub: larksuite/node-sdk](https://github.com/larksuite/node-sdk)
- [Lark MCP Tool](https://github.com/larksuite/lark-openapi-mcp)

---

## 9. 想定工数

| フェーズ | 作業内容 | 想定工数 |
|----------|----------|----------|
| Phase 1 | 基盤整備 | 0.5日 |
| Phase 2 | バックエンド実装 | 1-2日 |
| Phase 3 | フロントエンド実装 | 1-2日 |
| Phase 4 | テスト・改善 | 0.5-1日 |
| **合計** | | **3-5.5日** |

---

*作成日: 2025-12-26*
*バージョン: 1.0*
