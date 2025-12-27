// 外交フェーズ（0-4）
export type DiplomacyPhase = 0 | 1 | 2 | 3 | 4

// 事業進行ステータス（簡略化）
export type ProjectStatus =
  | 'not_started'  // 未着手
  | 'preparing'    // 準備中
  | 'in_progress'  // 進行中
  | 'completed'    // 完了

// イベント種別
export type EventType = 'completed' | 'scheduled'

// 活動カテゴリ（訪問 or 内部準備）
export type ActivityCategory = 'external' | 'internal'

// プロジェクトイベント（ヒストリー）
export interface ProjectEvent {
  id: string
  projectId: string
  date: Date               // イベント発生日/予定日
  title: string            // イベントタイトル（例：大使館訪問）
  description?: string     // 詳細説明
  imageUrl?: string        // 写真（base64 data URL）
  eventType: EventType     // 完了済み or 予定
  participants?: string    // 参加者・訪問者（カンマ区切り）- 後方互換性のため残す
  internalParticipants?: string  // 社内参加者（カンマ区切り）
  externalParticipants?: string  // 社外参加者（カンマ区切り）
  activityCategory?: ActivityCategory  // 訪問 or 内部準備
  createdAt: Date
  // Lark連携フィールド
  larkEventId?: string           // LarkカレンダーのイベントID
  larkCalendarId?: string        // LarkカレンダーID
  larkSyncStatus?: 'pending' | 'synced' | 'failed' | 'not_synced'
  larkSyncError?: string         // 同期エラーメッセージ
  larkLastSyncAt?: Date          // 最終同期日時
  // イベント時間（Lark連携用）
  startTime?: string             // 開始時刻 (HH:mm)
  endTime?: string               // 終了時刻 (HH:mm)
}

// よく使うイベントタイプ
export const EVENT_PRESETS = [
  '大使館訪問',
  '政府関係者との面談',
  '現地視察',
  'MOU締結',
  '契約締結',
  '初回コンタクト',
  'オンライン会議',
  '資料送付',
  '提案書提出',
  'その他',
]

// イベント→フェーズ/ステータス自動更新マッピング
export interface EventAutoUpdate {
  diplomacyPhase?: DiplomacyPhase
  status?: ProjectStatus
}

export const EVENT_AUTO_UPDATE: Record<string, EventAutoUpdate> = {
  '初回コンタクト': { diplomacyPhase: 1, status: 'in_progress' },
  '資料送付': { status: 'in_progress' },
  '提案書提出': { status: 'in_progress' },
  'オンライン会議': { diplomacyPhase: 1 },
  '大使館訪問': { diplomacyPhase: 2 },
  '政府関係者との面談': { diplomacyPhase: 3 },
  '現地視察': { diplomacyPhase: 3 },
  'MOU締結': { diplomacyPhase: 4, status: 'completed' },
  '契約締結': { status: 'completed' },
}

// イベント→活動カテゴリマッピング
export const EVENT_CATEGORY: Record<string, ActivityCategory> = {
  '大使館訪問': 'external',
  '政府関係者との面談': 'external',
  '現地視察': 'external',
  'MOU締結': 'external',
  '契約締結': 'external',
  'オンライン会議': 'external',
  '初回コンタクト': 'internal',
  '資料送付': 'internal',
  '提案書提出': 'internal',
  'その他': 'internal',
}

// 活動カテゴリのラベル
export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  external: '訪問',
  internal: '内部',
}

// 活動カテゴリの色
export const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  external: '#059669',  // green
  internal: '#6366f1',  // indigo
}

// 連絡先の人物情報
export interface ContactPerson {
  name: string
  notes?: string               // 備考
  startDate?: string           // 就任日
  endDate?: string             // 退任日（空なら現任）
}

// ========================================
// マスターデータ: 関係者・機関
// ========================================

// 社内スタッフ（担当者）
export interface StaffMember {
  id: string
  name: string                 // 名前
  email?: string               // メールアドレス
  department?: string          // 部署
  notes?: string               // 備考
  isActive: boolean            // アクティブフラグ
  createdAt: Date
}

// 機関種別
export type OrganizationType =
  | 'introducer'      // 紹介機関（太平洋諸島センターなど）
  | 'government'      // 政府機関
  | 'embassy'         // 大使館
  | 'company'         // 企業
  | 'ngo'             // NGO/NPO
  | 'international'   // 国際機関
  | 'other'           // その他

// 機関種別ラベル
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  introducer: '紹介機関',
  government: '政府機関',
  embassy: '大使館',
  company: '企業',
  ngo: 'NGO/NPO',
  international: '国際機関',
  other: 'その他',
}

// 機関（紹介機関・関与機関など）
export interface Organization {
  id: string
  name: string                 // 機関名
  type: OrganizationType       // 機関種別
  countryCodes?: string[]      // 関連国コード（複数可）
  contactPerson?: string       // 窓口担当者名
  contactEmail?: string        // 連絡先メール
  contactPhone?: string        // 連絡先電話
  address?: string             // 住所
  website?: string             // Webサイト
  notes?: string               // 備考
  isActive: boolean            // アクティブフラグ
  createdAt: Date
}

// 外部コンタクト（紹介者など個人）
export interface ExternalContact {
  id: string
  name: string                 // 名前
  organizationId?: string      // 所属機関ID（Organizationへの参照）
  organizationName?: string    // 所属機関名（手入力用）
  title?: string               // 役職
  email?: string               // メールアドレス
  phone?: string               // 電話番号
  countryCodes?: string[]      // 関連国コード（複数可）
  notes?: string               // 備考
  isActive: boolean            // アクティブフラグ
  createdAt: Date
}

// プロジェクトとの関連（リンク）
export type ProjectRelationType =
  | 'assignee'        // 担当者
  | 'introducer_org'  // 紹介機関
  | 'introducer'      // 紹介者（個人）
  | 'partner_org'     // パートナー機関
  | 'partner'         // パートナー（個人）
  | 'other'           // その他

// プロジェクトリンク
export interface ProjectLink {
  id: string
  projectId: string
  relationType: ProjectRelationType
  staffId?: string             // StaffMemberへの参照
  organizationId?: string      // Organizationへの参照
  contactId?: string           // ExternalContactへの参照
  notes?: string               // 備考
  createdAt: Date
}

// 国の連絡先情報
export interface CountryContact {
  id: string
  countryCode: string
  president?: ContactPerson              // 現任大統領/首相
  presidentHistory?: ContactPerson[]     // 過去の大統領/首相
  japanAmbassador?: ContactPerson        // 現任在日大使
  japanAmbassadorHistory?: ContactPerson[] // 過去の在日大使
  additionalContacts: Array<{            // その他連絡先
    role: string                         // 役職
    name: string                         // 名前
    notes?: string                       // 備考
    history?: ContactPerson[]            // 過去の担当者
  }>
  updatedAt: Date
}

// プロジェクト
export interface Project {
  id: string
  countryCode: string      // ISO 3166-1 alpha-2 (例: "JP", "US")
  name: string
  status: ProjectStatus
  diplomacyPhase: DiplomacyPhase  // 外交フェーズ
  assignee?: string        // 担当者
  notes?: string
  referrer?: string        // 紹介者
  managementUrl?: string   // 管理ページURL
  events?: ProjectEvent[]  // ヒストリー
  createdAt: Date
  updatedAt: Date
}

// 外交フェーズのラベル
export const DIPLOMACY_PHASE_LABELS: Record<DiplomacyPhase, string> = {
  0: '未接触',
  1: '日本側と接続',
  2: '現地大使館と接続',
  3: '現地政府と接続',
  4: 'MOU締結',
}

// 外交フェーズの色
export const DIPLOMACY_PHASE_COLORS: Record<DiplomacyPhase, string> = {
  0: '#9CA3AF',  // gray
  1: '#3B82F6',  // blue
  2: '#8B5CF6',  // purple
  3: '#F97316',  // orange
  4: '#22C55E',  // green
}

// 国の基礎情報
export interface CountryInfo {
  code: string
  name: string
  capital: string
  population: string
  language: string
  currency: string
  timezone: string
  religions?: string[]  // 上位3位の宗教と割合
  ethnicities?: string[]  // 上位3位の民族
  industries?: string[]  // 主要産業（上位3位）
  ageStructure?: string  // 年齢構成（例: 若年30%/生産65%/高齢5%）
  populationGrowth?: string  // 人口増加率
}

// 主要国の基礎情報データ（時差は日本基準）
export const COUNTRY_INFO: Record<string, CountryInfo> = {
  JP: { code: 'JP', name: '日本', capital: '東京', population: '1.25億人', language: '日本語', currency: '円 (JPY)', timezone: '±0時間', religions: ['神道 70%', '仏教 67%', 'キリスト教 1.5%'], ethnicities: ['日本人 98%', '中国系 0.5%', '韓国・朝鮮系 0.4%'], industries: ['自動車', '電子機器', '機械'], ageStructure: '0-14歳 12%/15-64歳 59%/65歳以上 29%', populationGrowth: '-0.4%' },
  US: { code: 'US', name: 'アメリカ', capital: 'ワシントンD.C.', population: '3.31億人', language: '英語', currency: 'ドル (USD)', timezone: '-14〜-19時間', religions: ['キリスト教 65%', '無宗教 26%', 'ユダヤ教 2%'], ethnicities: ['白人 58%', 'ヒスパニック 19%', '黒人 12%'], industries: ['IT・テック', '金融', '医療'], ageStructure: '0-14歳 18%/15-64歳 65%/65歳以上 17%', populationGrowth: '+0.4%' },
  CN: { code: 'CN', name: '中国', capital: '北京', population: '14.1億人', language: '中国語', currency: '人民元 (CNY)', timezone: '-1時間', religions: ['無宗教 52%', '民間信仰 22%', '仏教 18%'], ethnicities: ['漢民族 92%', 'チワン族 1.3%', '満州族 0.8%'], industries: ['製造業', 'IT・テック', '建設'], ageStructure: '0-14歳 17%/15-64歳 70%/65歳以上 13%', populationGrowth: '-0.1%' },
  GB: { code: 'GB', name: 'イギリス', capital: 'ロンドン', population: '6,700万人', language: '英語', currency: 'ポンド (GBP)', timezone: '-9時間', religions: ['キリスト教 46%', '無宗教 37%', 'イスラム教 7%'], ethnicities: ['白人 82%', 'アジア系 10%', '黒人 4%'], industries: ['金融', 'サービス', '製造業'], ageStructure: '0-14歳 18%/15-64歳 64%/65歳以上 18%', populationGrowth: '+0.5%' },
  DE: { code: 'DE', name: 'ドイツ', capital: 'ベルリン', population: '8,300万人', language: 'ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['キリスト教 52%', '無宗教 40%', 'イスラム教 5%'], ethnicities: ['ドイツ人 80%', 'トルコ系 4%', 'ポーランド系 2%'], industries: ['自動車', '機械', '化学'], ageStructure: '0-14歳 14%/15-64歳 64%/65歳以上 22%', populationGrowth: '+0.1%' },
  FR: { code: 'FR', name: 'フランス', capital: 'パリ', population: '6,700万人', language: 'フランス語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['キリスト教 51%', '無宗教 40%', 'イスラム教 6%'], ethnicities: ['フランス人 85%', '北アフリカ系 7%', 'アフリカ系 3%'], industries: ['観光', '航空宇宙', '農業'], ageStructure: '0-14歳 18%/15-64歳 62%/65歳以上 20%', populationGrowth: '+0.2%' },
  KR: { code: 'KR', name: '韓国', capital: 'ソウル', population: '5,200万人', language: '韓国語', currency: 'ウォン (KRW)', timezone: '±0時間', religions: ['無宗教 56%', 'プロテスタント 20%', '仏教 16%'], ethnicities: ['韓国人 96%', '中国系 2%', 'その他 2%'], industries: ['半導体', '自動車', '造船'], ageStructure: '0-14歳 12%/15-64歳 71%/65歳以上 17%', populationGrowth: '-0.2%' },
  IN: { code: 'IN', name: 'インド', capital: 'ニューデリー', population: '14億人', language: 'ヒンディー語・英語', currency: 'ルピー (INR)', timezone: '-3.5時間', religions: ['ヒンドゥー教 80%', 'イスラム教 14%', 'キリスト教 2%'], ethnicities: ['インド・アーリア 72%', 'ドラヴィダ 25%', 'モンゴロイド 3%'], industries: ['IT', '農業', '繊維'], ageStructure: '0-14歳 26%/15-64歳 67%/65歳以上 7%', populationGrowth: '+0.9%' },
  BR: { code: 'BR', name: 'ブラジル', capital: 'ブラジリア', population: '2.1億人', language: 'ポルトガル語', currency: 'レアル (BRL)', timezone: '-12時間', religions: ['カトリック 65%', 'プロテスタント 22%', '無宗教 8%'], ethnicities: ['混血 43%', '白人 47%', '黒人 8%'], industries: ['農業', '鉱業', '製造業'], ageStructure: '0-14歳 21%/15-64歳 69%/65歳以上 10%', populationGrowth: '+0.5%' },
  AU: { code: 'AU', name: 'オーストラリア', capital: 'キャンベラ', population: '2,600万人', language: '英語', currency: '豪ドル (AUD)', timezone: '+1時間', religions: ['キリスト教 44%', '無宗教 39%', 'イスラム教 3%'], ethnicities: ['欧州系 58%', 'アジア系 17%', '先住民 3%'], industries: ['鉱業', '農業', 'サービス'], ageStructure: '0-14歳 19%/15-64歳 65%/65歳以上 16%', populationGrowth: '+1.1%' },
  SG: { code: 'SG', name: 'シンガポール', capital: 'シンガポール', population: '560万人', language: '英語・中国語・マレー語・タミル語', currency: 'シンガポールドル (SGD)', timezone: '-1時間', religions: ['仏教 31%', 'キリスト教 19%', 'イスラム教 15%'], ethnicities: ['中国系 74%', 'マレー系 13%', 'インド系 9%'], industries: ['金融', '電子機器', '石油化学'], ageStructure: '0-14歳 12%/15-64歳 73%/65歳以上 15%', populationGrowth: '+0.9%' },
  TH: { code: 'TH', name: 'タイ', capital: 'バンコク', population: '7,000万人', language: 'タイ語', currency: 'バーツ (THB)', timezone: '-2時間', religions: ['仏教 94%', 'イスラム教 5%', 'キリスト教 1%'], ethnicities: ['タイ族 75%', '中国系 14%', 'マレー系 3%'], industries: ['観光', '自動車', '電子機器'], ageStructure: '0-14歳 17%/15-64歳 70%/65歳以上 13%', populationGrowth: '+0.2%' },
  VN: { code: 'VN', name: 'ベトナム', capital: 'ハノイ', population: '9,700万人', language: 'ベトナム語', currency: 'ドン (VND)', timezone: '-2時間', religions: ['民間信仰 45%', '無宗教 30%', '仏教 16%'], ethnicities: ['キン族 86%', 'タイー族 2%', 'ムオン族 1.5%'], industries: ['製造業', '農業', 'IT'], ageStructure: '0-14歳 23%/15-64歳 69%/65歳以上 8%', populationGrowth: '+0.9%' },
  ID: { code: 'ID', name: 'インドネシア', capital: 'ジャカルタ', population: '2.7億人', language: 'インドネシア語', currency: 'ルピア (IDR)', timezone: '-2〜±0時間', religions: ['イスラム教 87%', 'キリスト教 10%', 'ヒンドゥー教 2%'], ethnicities: ['ジャワ族 40%', 'スンダ族 15%', 'マレー族 4%'], industries: ['石油・ガス', 'パーム油', '製造業'], ageStructure: '0-14歳 26%/15-64歳 68%/65歳以上 6%', populationGrowth: '+0.8%' },
  PH: { code: 'PH', name: 'フィリピン', capital: 'マニラ', population: '1.1億人', language: 'フィリピノ語・英語', currency: 'ペソ (PHP)', timezone: '-1時間', religions: ['カトリック 79%', 'イスラム教 6%', 'プロテスタント 5%'], ethnicities: ['タガログ族 24%', 'ビサヤ族 12%', 'セブアノ族 10%'], industries: ['BPO', '電子機器', '農業'], ageStructure: '0-14歳 30%/15-64歳 65%/65歳以上 5%', populationGrowth: '+1.4%' },
  MY: { code: 'MY', name: 'マレーシア', capital: 'クアラルンプール', population: '3,200万人', language: 'マレー語・英語', currency: 'リンギット (MYR)', timezone: '-1時間', religions: ['イスラム教 61%', '仏教 20%', 'キリスト教 9%'], ethnicities: ['マレー系 62%', '中国系 21%', 'インド系 6%'], industries: ['電子機器', '石油・ガス', 'パーム油'], ageStructure: '0-14歳 23%/15-64歳 70%/65歳以上 7%', populationGrowth: '+1.1%' },
  NG: { code: 'NG', name: 'ナイジェリア', capital: 'アブジャ', population: '2.1億人', language: '英語', currency: 'ナイラ (NGN)', timezone: '-8時間', religions: ['イスラム教 50%', 'キリスト教 40%', '伝統宗教 10%'], ethnicities: ['ハウサ族 30%', 'ヨルバ族 15%', 'イボ族 15%'], industries: ['石油', '農業', '通信'], ageStructure: '0-14歳 43%/15-64歳 54%/65歳以上 3%', populationGrowth: '+2.4%' },
  KE: { code: 'KE', name: 'ケニア', capital: 'ナイロビ', population: '5,400万人', language: 'スワヒリ語・英語', currency: 'ケニアシリング (KES)', timezone: '-6時間', religions: ['キリスト教 86%', 'イスラム教 11%', '伝統宗教 2%'], ethnicities: ['キクユ族 17%', 'ルヒヤ族 14%', 'カレンジン族 13%'], industries: ['農業', '観光', 'IT・フィンテック'], ageStructure: '0-14歳 38%/15-64歳 59%/65歳以上 3%', populationGrowth: '+2.2%' },
  ZA: { code: 'ZA', name: '南アフリカ', capital: 'プレトリア', population: '6,000万人', language: '英語他11言語', currency: 'ランド (ZAR)', timezone: '-7時間', religions: ['キリスト教 80%', '無宗教 15%', '伝統宗教 4%'], ethnicities: ['黒人 81%', '白人 8%', 'カラード 9%'], industries: ['鉱業', '自動車', '金融'], ageStructure: '0-14歳 28%/15-64歳 66%/65歳以上 6%', populationGrowth: '+1.0%' },
  EG: { code: 'EG', name: 'エジプト', capital: 'カイロ', population: '1億人', language: 'アラビア語', currency: 'エジプトポンド (EGP)', timezone: '-7時間', religions: ['イスラム教 90%', 'キリスト教 10%'], ethnicities: ['アラブ人 99%', 'ヌビア人 0.5%', 'その他 0.5%'], industries: ['観光', '石油・ガス', '農業'], ageStructure: '0-14歳 33%/15-64歳 62%/65歳以上 5%', populationGrowth: '+1.7%' },
  MR: { code: 'MR', name: 'モーリタニア', capital: 'ヌアクショット', population: '470万人', language: 'アラビア語・フランス語', currency: 'ウギア (MRU)', timezone: '-9時間', religions: ['イスラム教 100%'], ethnicities: ['アラブ・ベルベル系 70%', 'アフリカ系 30%'], industries: ['鉄鉱石', '水産業', '畜産'], ageStructure: '0-14歳 38%/15-64歳 58%/65歳以上 4%', populationGrowth: '+2.5%' },
  SN: { code: 'SN', name: 'セネガル', capital: 'ダカール', population: '1,700万人', language: 'フランス語', currency: 'CFAフラン (XOF)', timezone: '-9時間', religions: ['イスラム教 95%', 'キリスト教 4%', '伝統宗教 1%'], ethnicities: ['ウォロフ族 43%', 'フラニ族 24%', 'セレール族 15%'], industries: ['農業', '水産業', '鉱業'], ageStructure: '0-14歳 42%/15-64歳 55%/65歳以上 3%', populationGrowth: '+2.6%' },
  DZ: { code: 'DZ', name: 'アルジェリア', capital: 'アルジェ', population: '4,500万人', language: 'アラビア語・フランス語', currency: 'ディナール (DZD)', timezone: '-8時間', religions: ['イスラム教 99%', 'キリスト教 0.3%'], ethnicities: ['アラブ・ベルベル系 99%'], industries: ['石油・天然ガス', '鉄鋼', '農業'], ageStructure: '0-14歳 30%/15-64歳 63%/65歳以上 7%', populationGrowth: '+1.6%' },
  MX: { code: 'MX', name: 'メキシコ', capital: 'メキシコシティ', population: '1.3億人', language: 'スペイン語', currency: 'ペソ (MXN)', timezone: '-15時間', religions: ['カトリック 78%', 'プロテスタント 11%', '無宗教 8%'], ethnicities: ['メスティーソ 62%', '先住民 21%', '白人 12%'], industries: ['自動車', '電子機器', '石油'], ageStructure: '0-14歳 26%/15-64歳 66%/65歳以上 8%', populationGrowth: '+0.8%' },
  CA: { code: 'CA', name: 'カナダ', capital: 'オタワ', population: '3,800万人', language: '英語・フランス語', currency: 'カナダドル (CAD)', timezone: '-12.5〜-17時間', religions: ['キリスト教 53%', '無宗教 35%', 'イスラム教 4%'], ethnicities: ['欧州系 73%', 'アジア系 18%', '先住民 5%'], industries: ['資源', '金融', 'IT'], ageStructure: '0-14歳 16%/15-64歳 66%/65歳以上 18%', populationGrowth: '+0.9%' },
  IT: { code: 'IT', name: 'イタリア', capital: 'ローマ', population: '6,000万人', language: 'イタリア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 74%', '無宗教 20%', 'イスラム教 4%'], ethnicities: ['イタリア人 92%', 'ルーマニア系 2%', 'アルバニア系 1%'], industries: ['ファッション', '自動車', '観光'], ageStructure: '0-14歳 13%/15-64歳 64%/65歳以上 23%', populationGrowth: '-0.2%' },
  ES: { code: 'ES', name: 'スペイン', capital: 'マドリード', population: '4,700万人', language: 'スペイン語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 58%', '無宗教 36%', 'イスラム教 3%'], ethnicities: ['スペイン人 86%', 'モロッコ系 2%', 'ルーマニア系 1%'], industries: ['観光', '自動車', '農業'], ageStructure: '0-14歳 15%/15-64歳 65%/65歳以上 20%', populationGrowth: '+0.1%' },
  RU: { code: 'RU', name: 'ロシア', capital: 'モスクワ', population: '1.4億人', language: 'ロシア語', currency: 'ルーブル (RUB)', timezone: '-7〜+3時間', religions: ['ロシア正教 71%', '無宗教 15%', 'イスラム教 10%'], ethnicities: ['ロシア人 78%', 'タタール人 4%', 'ウクライナ人 1%'], industries: ['石油・ガス', '鉱業', '軍事'], ageStructure: '0-14歳 18%/15-64歳 67%/65歳以上 15%', populationGrowth: '-0.2%' },
  TR: { code: 'TR', name: 'トルコ', capital: 'アンカラ', population: '8,500万人', language: 'トルコ語', currency: 'リラ (TRY)', timezone: '-6時間', religions: ['イスラム教 98%', '無宗教 1%', 'キリスト教 0.3%'], ethnicities: ['トルコ人 70%', 'クルド人 18%', 'その他 12%'], industries: ['繊維', '自動車', '観光'], ageStructure: '0-14歳 23%/15-64歳 68%/65歳以上 9%', populationGrowth: '+0.7%' },
  SA: { code: 'SA', name: 'サウジアラビア', capital: 'リヤド', population: '3,500万人', language: 'アラビア語', currency: 'リヤル (SAR)', timezone: '-6時間', religions: ['イスラム教 93%', 'キリスト教 4%', 'ヒンドゥー教 1%'], ethnicities: ['アラブ人 90%', 'アフロアジア系 3%', '南アジア系 3%'], industries: ['石油', '石油化学', '金融'], ageStructure: '0-14歳 25%/15-64歳 71%/65歳以上 4%', populationGrowth: '+1.5%' },
  AE: { code: 'AE', name: 'アラブ首長国連邦', capital: 'アブダビ', population: '1,000万人', language: 'アラビア語', currency: 'ディルハム (AED)', timezone: '-5時間', religions: ['イスラム教 76%', 'キリスト教 9%', 'ヒンドゥー教 6%'], ethnicities: ['エミラティ 11%', '南アジア系 59%', 'その他アジア系 17%'], industries: ['石油', '観光', '金融'], ageStructure: '0-14歳 14%/15-64歳 84%/65歳以上 2%', populationGrowth: '+1.0%' },
  NL: { code: 'NL', name: 'オランダ', capital: 'アムステルダム', population: '1,800万人', language: 'オランダ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['無宗教 56%', 'カトリック 17%', 'プロテスタント 14%'], ethnicities: ['オランダ人 79%', '欧州系 6%', 'トルコ系 2%'], industries: ['農業・食品', '化学', '物流'], ageStructure: '0-14歳 16%/15-64歳 64%/65歳以上 20%', populationGrowth: '+0.4%' },
  CH: { code: 'CH', name: 'スイス', capital: 'ベルン', population: '900万人', language: 'ドイツ語・フランス語・イタリア語', currency: 'フラン (CHF)', timezone: '-8時間', religions: ['キリスト教 56%', '無宗教 36%', 'イスラム教 6%'], ethnicities: ['スイス人 60%', 'ドイツ系 10%', 'イタリア系 6%'], industries: ['金融', '製薬', '精密機器'], ageStructure: '0-14歳 15%/15-64歳 66%/65歳以上 19%', populationGrowth: '+0.7%' },
  SE: { code: 'SE', name: 'スウェーデン', capital: 'ストックホルム', population: '1,060万人', language: 'スウェーデン語', currency: 'クローナ (SEK)', timezone: '-8時間', religions: ['ルーテル教会 54%', '無宗教 37%', 'その他 9%'], ethnicities: ['スウェーデン人 80%', 'シリア系 2%', 'フィンランド系 1%'], industries: ['機械', '自動車', 'IT'], ageStructure: '0-14歳 17%/15-64歳 62%/65歳以上 21%', populationGrowth: '+0.5%' },
  PL: { code: 'PL', name: 'ポーランド', capital: 'ワルシャワ', population: '3,750万人', language: 'ポーランド語', currency: 'ズウォティ (PLN)', timezone: '-8時間', religions: ['カトリック 87%', 'プロテスタント 0.4%', '正教 0.3%'], ethnicities: ['ポーランド人 97%', 'シレジア人 1%', 'ドイツ系 0.2%'], industries: ['自動車', '機械', '食品'], ageStructure: '0-14歳 15%/15-64歳 66%/65歳以上 19%', populationGrowth: '-0.4%' },
  TW: { code: 'TW', name: '台湾', capital: '台北', population: '2,400万人', language: '中国語', currency: '台湾ドル (TWD)', timezone: '-1時間', religions: ['仏教 35%', '道教 33%', '無宗教 19%'], ethnicities: ['漢民族 95%', '先住民族 2%', 'その他 3%'], industries: ['半導体', '電子機器', '石油化学'], ageStructure: '0-14歳 12%/15-64歳 70%/65歳以上 18%', populationGrowth: '-0.2%' },
  HK: { code: 'HK', name: '香港', capital: '香港', population: '750万人', language: '広東語・英語', currency: '香港ドル (HKD)', timezone: '-1時間', religions: ['無宗教 61%', '仏教・道教 27%', 'キリスト教 12%'], ethnicities: ['漢民族 92%', 'フィリピン系 3%', 'インドネシア系 2%'], industries: ['金融', '貿易・物流', '観光'], ageStructure: '0-14歳 10%/15-64歳 67%/65歳以上 23%', populationGrowth: '-0.5%' },
  GL: { code: 'GL', name: 'グリーンランド', capital: 'ヌーク', population: '5.6万人', language: 'グリーンランド語・デンマーク語', currency: 'デンマーク・クローネ (DKK)', timezone: '-12時間', religions: ['ルーテル教会 95%', 'その他 5%'], ethnicities: ['イヌイット 88%', 'デンマーク系 12%'], industries: ['水産業', '鉱業', '観光'], ageStructure: '0-14歳 21%/15-64歳 68%/65歳以上 11%', populationGrowth: '-0.1%' },
  IS: { code: 'IS', name: 'アイスランド', capital: 'レイキャビク', population: '38万人', language: 'アイスランド語', currency: 'クローナ (ISK)', timezone: '-9時間', religions: ['ルーテル教会 62%', '無宗教 25%', 'カトリック 4%'], ethnicities: ['アイスランド人 93%', 'ポーランド系 3%', 'その他 4%'], industries: ['水産業', '観光', 'アルミ'], ageStructure: '0-14歳 19%/15-64歳 65%/65歳以上 16%', populationGrowth: '+1.8%' },
  NO: { code: 'NO', name: 'ノルウェー', capital: 'オスロ', population: '560万人', language: 'ノルウェー語', currency: 'クローネ (NOK)', timezone: '-8時間', religions: ['ルーテル教会 62%', '無宗教 18%', 'イスラム教 3%'], ethnicities: ['ノルウェー人 83%', '欧州系 9%', 'アジア系 4%'], industries: ['石油・ガス', '水産業', '海運'], ageStructure: '0-14歳 17%/15-64歳 65%/65歳以上 18%', populationGrowth: '+0.8%' },
  FI: { code: 'FI', name: 'フィンランド', capital: 'ヘルシンキ', population: '560万人', language: 'フィンランド語・スウェーデン語', currency: 'ユーロ (EUR)', timezone: '-7時間', religions: ['ルーテル教会 67%', '無宗教 29%', '正教 1%'], ethnicities: ['フィンランド人 91%', '欧州系 5%', 'その他 4%'], industries: ['林業・製紙', '機械', 'IT'], ageStructure: '0-14歳 16%/15-64歳 62%/65歳以上 22%', populationGrowth: '+0.2%' },
  DK: { code: 'DK', name: 'デンマーク', capital: 'コペンハーゲン', population: '590万人', language: 'デンマーク語', currency: 'クローネ (DKK)', timezone: '-8時間', religions: ['ルーテル教会 74%', '無宗教 15%', 'イスラム教 5%'], ethnicities: ['デンマーク人 86%', '欧州系 5%', '中東系 4%'], industries: ['製薬', '食品', '海運'], ageStructure: '0-14歳 16%/15-64歳 64%/65歳以上 20%', populationGrowth: '+0.5%' },
  IE: { code: 'IE', name: 'アイルランド', capital: 'ダブリン', population: '520万人', language: '英語・アイルランド語', currency: 'ユーロ (EUR)', timezone: '-9時間', religions: ['カトリック 69%', '無宗教 15%', 'その他キリスト教 6%'], ethnicities: ['アイルランド人 82%', '欧州系 10%', 'アジア系 3%'], industries: ['IT・テック', '製薬', '金融'], ageStructure: '0-14歳 19%/15-64歳 66%/65歳以上 15%', populationGrowth: '+1.2%' },
  PT: { code: 'PT', name: 'ポルトガル', capital: 'リスボン', population: '1,080万人', language: 'ポルトガル語', currency: 'ユーロ (EUR)', timezone: '-9時間', religions: ['カトリック 81%', '無宗教 15%', 'その他 4%'], ethnicities: ['ポルトガル人 95%', 'ブラジル系 2%', 'アフリカ系 1%'], industries: ['観光', '繊維', 'コルク'], ageStructure: '0-14歳 13%/15-64歳 64%/65歳以上 23%', populationGrowth: '+0.1%' },
  GR: { code: 'GR', name: 'ギリシャ', capital: 'アテネ', population: '1,040万人', language: 'ギリシャ語', currency: 'ユーロ (EUR)', timezone: '-7時間', religions: ['ギリシャ正教 90%', '無宗教 4%', 'イスラム教 2%'], ethnicities: ['ギリシャ人 93%', 'アルバニア系 4%', 'その他 3%'], industries: ['観光', '海運', '農業'], ageStructure: '0-14歳 14%/15-64歳 63%/65歳以上 23%', populationGrowth: '-0.3%' },
  AT: { code: 'AT', name: 'オーストリア', capital: 'ウィーン', population: '910万人', language: 'ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 55%', '無宗教 24%', 'イスラム教 8%'], ethnicities: ['オーストリア人 80%', 'ドイツ系 4%', 'トルコ系 3%'], industries: ['機械', '観光', '食品'], ageStructure: '0-14歳 14%/15-64歳 66%/65歳以上 20%', populationGrowth: '+0.4%' },
  BE: { code: 'BE', name: 'ベルギー', capital: 'ブリュッセル', population: '1,160万人', language: 'オランダ語・フランス語・ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 50%', '無宗教 33%', 'イスラム教 6%'], ethnicities: ['ベルギー人 75%', 'イタリア系 4%', 'モロッコ系 4%'], industries: ['化学', 'ダイヤモンド', '製薬'], ageStructure: '0-14歳 16%/15-64歳 64%/65歳以上 20%', populationGrowth: '+0.5%' },
  CZ: { code: 'CZ', name: 'チェコ', capital: 'プラハ', population: '1,050万人', language: 'チェコ語', currency: 'コルナ (CZK)', timezone: '-8時間', religions: ['無宗教 72%', 'カトリック 10%', 'その他 18%'], ethnicities: ['チェコ人 90%', 'モラヴィア人 4%', 'スロバキア人 2%'], industries: ['自動車', '機械', 'ビール'], ageStructure: '0-14歳 16%/15-64歳 64%/65歳以上 20%', populationGrowth: '+0.2%' },
  AR: { code: 'AR', name: 'アルゼンチン', capital: 'ブエノスアイレス', population: '4,600万人', language: 'スペイン語', currency: 'ペソ (ARS)', timezone: '-12時間', religions: ['カトリック 63%', '無宗教 19%', 'プロテスタント 15%'], ethnicities: ['欧州系 85%', 'メスティーソ 11%', '先住民 2%'], industries: ['農業', '自動車', '石油化学'], ageStructure: '0-14歳 24%/15-64歳 64%/65歳以上 12%', populationGrowth: '+0.8%' },
  CL: { code: 'CL', name: 'チリ', capital: 'サンティアゴ', population: '1,950万人', language: 'スペイン語', currency: 'ペソ (CLP)', timezone: '-13時間', religions: ['カトリック 55%', '無宗教 25%', 'プロテスタント 16%'], ethnicities: ['メスティーソ 67%', '欧州系 25%', 'マプチェ族 5%'], industries: ['銅鉱業', 'ワイン', '水産業'], ageStructure: '0-14歳 19%/15-64歳 68%/65歳以上 13%', populationGrowth: '+0.7%' },
  CO: { code: 'CO', name: 'コロンビア', capital: 'ボゴタ', population: '5,200万人', language: 'スペイン語', currency: 'ペソ (COP)', timezone: '-14時間', religions: ['カトリック 73%', 'プロテスタント 16%', '無宗教 7%'], ethnicities: ['メスティーソ 53%', '白人 27%', 'アフリカ系 11%'], industries: ['石油', 'コーヒー', '花卉'], ageStructure: '0-14歳 22%/15-64歳 68%/65歳以上 10%', populationGrowth: '+0.6%' },
  PE: { code: 'PE', name: 'ペルー', capital: 'リマ', population: '3,400万人', language: 'スペイン語', currency: 'ソル (PEN)', timezone: '-14時間', religions: ['カトリック 76%', 'プロテスタント 14%', '無宗教 5%'], ethnicities: ['メスティーソ 60%', '先住民 26%', '欧州系 6%'], industries: ['鉱業', '農業', '水産業'], ageStructure: '0-14歳 25%/15-64歳 66%/65歳以上 9%', populationGrowth: '+1.0%' },
  NZ: { code: 'NZ', name: 'ニュージーランド', capital: 'ウェリントン', population: '530万人', language: '英語・マオリ語', currency: 'NZドル (NZD)', timezone: '+3時間', religions: ['無宗教 52%', 'キリスト教 32%', 'ヒンドゥー教 3%'], ethnicities: ['欧州系 64%', 'マオリ 17%', 'アジア系 16%'], industries: ['乳製品', '観光', '林業'], ageStructure: '0-14歳 19%/15-64歳 65%/65歳以上 16%', populationGrowth: '+1.1%' },
  PK: { code: 'PK', name: 'パキスタン', capital: 'イスラマバード', population: '2.4億人', language: 'ウルドゥー語・英語', currency: 'ルピー (PKR)', timezone: '-4時間', religions: ['イスラム教 96%', 'ヒンドゥー教 2%', 'キリスト教 2%'], ethnicities: ['パンジャーブ族 45%', 'パシュトゥーン族 15%', 'シンド族 14%'], industries: ['繊維', '農業', 'IT'], ageStructure: '0-14歳 35%/15-64歳 60%/65歳以上 5%', populationGrowth: '+2.1%' },
  BD: { code: 'BD', name: 'バングラデシュ', capital: 'ダッカ', population: '1.7億人', language: 'ベンガル語', currency: 'タカ (BDT)', timezone: '-3時間', religions: ['イスラム教 91%', 'ヒンドゥー教 8%', '仏教 1%'], ethnicities: ['ベンガル人 99%', 'チャクマ族 0.5%', 'その他 0.5%'], industries: ['繊維・衣料', '製薬', 'IT'], ageStructure: '0-14歳 27%/15-64歳 67%/65歳以上 6%', populationGrowth: '+1.0%' },
  IL: { code: 'IL', name: 'イスラエル', capital: 'エルサレム', population: '990万人', language: 'ヘブライ語・アラビア語', currency: 'シェケル (ILS)', timezone: '-7時間', religions: ['ユダヤ教 73%', 'イスラム教 18%', 'キリスト教 2%'], ethnicities: ['ユダヤ人 73%', 'アラブ人 21%', 'その他 6%'], industries: ['IT・ハイテク', 'ダイヤモンド', '製薬'], ageStructure: '0-14歳 28%/15-64歳 60%/65歳以上 12%', populationGrowth: '+1.5%' },
  MM: { code: 'MM', name: 'ミャンマー', capital: 'ネーピードー', population: '5,500万人', language: 'ビルマ語', currency: 'チャット (MMK)', timezone: '-2.5時間', religions: ['仏教 88%', 'キリスト教 6%', 'イスラム教 4%'], ethnicities: ['ビルマ族 68%', 'シャン族 9%', 'カレン族 7%'], industries: ['農業', '天然ガス', '宝石'], ageStructure: '0-14歳 26%/15-64歳 68%/65歳以上 6%', populationGrowth: '+0.7%' },
  // 太平洋
  FJ: { code: 'FJ', name: 'フィジー', capital: 'スバ', population: '90万人', language: '英語・フィジー語', currency: 'フィジードル (FJD)', timezone: '+3時間', religions: ['キリスト教 64%', 'ヒンドゥー教 28%', 'イスラム教 6%'], ethnicities: ['フィジー系 57%', 'インド系 37%', 'その他 6%'], industries: ['観光', '砂糖', '水産業'], ageStructure: '0-14歳 28%/15-64歳 66%/65歳以上 6%', populationGrowth: '+0.4%' },
  PG: { code: 'PG', name: 'パプアニューギニア', capital: 'ポートモレスビー', population: '900万人', language: '英語・トクピシン', currency: 'キナ (PGK)', timezone: '+1時間', religions: ['キリスト教 96%', '伝統宗教 3%', 'その他 1%'], ethnicities: ['メラネシア系 95%', 'パプア系 3%', 'その他 2%'], industries: ['鉱業', '農業', 'LNG'], ageStructure: '0-14歳 36%/15-64歳 60%/65歳以上 4%', populationGrowth: '+1.9%' },
  SB: { code: 'SB', name: 'ソロモン諸島', capital: 'ホニアラ', population: '70万人', language: '英語', currency: 'ソロモンドル (SBD)', timezone: '+2時間', religions: ['キリスト教 97%', '伝統宗教 2%', 'その他 1%'], ethnicities: ['メラネシア系 95%', 'ポリネシア系 3%', 'ミクロネシア系 1%'], industries: ['林業', '水産業', '農業'], ageStructure: '0-14歳 40%/15-64歳 57%/65歳以上 3%', populationGrowth: '+2.2%' },
  VU: { code: 'VU', name: 'バヌアツ', capital: 'ポートビラ', population: '31万人', language: '英語・フランス語・ビスラマ語', currency: 'バツ (VUV)', timezone: '+2時間', religions: ['キリスト教 82%', '伝統宗教 8%', 'その他 10%'], ethnicities: ['メラネシア系 99%', 'その他 1%'], industries: ['農業', '観光', '水産業'], ageStructure: '0-14歳 36%/15-64歳 60%/65歳以上 4%', populationGrowth: '+1.8%' },
  WS: { code: 'WS', name: 'サモア', capital: 'アピア', population: '20万人', language: 'サモア語・英語', currency: 'タラ (WST)', timezone: '+4時間', religions: ['キリスト教 98%', 'その他 2%'], ethnicities: ['サモア人 96%', 'ユーロネシア 2%', '欧州系 1%'], industries: ['農業', '観光', '水産業'], ageStructure: '0-14歳 38%/15-64歳 57%/65歳以上 5%', populationGrowth: '+0.6%' },
  TO: { code: 'TO', name: 'トンガ', capital: 'ヌクアロファ', population: '10万人', language: 'トンガ語・英語', currency: 'パアンガ (TOP)', timezone: '+4時間', religions: ['キリスト教 98%', 'その他 2%'], ethnicities: ['トンガ人 97%', '混血 2%', 'その他 1%'], industries: ['農業', '水産業', '観光'], ageStructure: '0-14歳 34%/15-64歳 60%/65歳以上 6%', populationGrowth: '-0.2%' },
  NC: { code: 'NC', name: 'ニューカレドニア', capital: 'ヌメア', population: '29万人', language: 'フランス語', currency: 'CFPフラン (XPF)', timezone: '+2時間', religions: ['キリスト教 60%', '無宗教 30%', 'その他 10%'], ethnicities: ['カナク族 40%', '欧州系 30%', '混血 20%'], industries: ['ニッケル', '観光', '水産業'], ageStructure: '0-14歳 22%/15-64歳 68%/65歳以上 10%', populationGrowth: '+1.1%' },
  // アフリカ追加
  GH: { code: 'GH', name: 'ガーナ', capital: 'アクラ', population: '3,100万人', language: '英語', currency: 'セディ (GHS)', timezone: '-9時間', religions: ['キリスト教 71%', 'イスラム教 18%', '伝統宗教 5%'], ethnicities: ['アカン族 48%', 'モレ・ダグバニ族 17%', 'エウェ族 14%'], industries: ['金', 'カカオ', '石油'], ageStructure: '0-14歳 38%/15-64歳 58%/65歳以上 4%', populationGrowth: '+2.1%' },
  CI: { code: 'CI', name: 'コートジボワール', capital: 'ヤムスクロ', population: '2,600万人', language: 'フランス語', currency: 'CFAフラン (XOF)', timezone: '-9時間', religions: ['イスラム教 43%', 'キリスト教 34%', '伝統宗教 12%'], ethnicities: ['アカン族 28%', 'ボルタ族 16%', 'マンデ族 15%'], industries: ['カカオ', '石油', '農業'], ageStructure: '0-14歳 41%/15-64歳 56%/65歳以上 3%', populationGrowth: '+2.2%' },
  TZ: { code: 'TZ', name: 'タンザニア', capital: 'ドドマ', population: '6,000万人', language: 'スワヒリ語・英語', currency: 'シリング (TZS)', timezone: '-6時間', religions: ['キリスト教 61%', 'イスラム教 35%', '伝統宗教 2%'], ethnicities: ['スクマ族 16%', 'チャガ族 6%', 'ハヤ族 5%'], industries: ['農業', '観光', '鉱業'], ageStructure: '0-14歳 44%/15-64歳 53%/65歳以上 3%', populationGrowth: '+2.9%' },
  UG: { code: 'UG', name: 'ウガンダ', capital: 'カンパラ', population: '4,500万人', language: '英語・スワヒリ語', currency: 'シリング (UGX)', timezone: '-6時間', religions: ['キリスト教 85%', 'イスラム教 14%', '伝統宗教 1%'], ethnicities: ['バガンダ族 17%', 'バニャンコレ族 10%', 'バソガ族 8%'], industries: ['農業', '観光', '水産業'], ageStructure: '0-14歳 48%/15-64歳 50%/65歳以上 2%', populationGrowth: '+3.0%' },
  ET: { code: 'ET', name: 'エチオピア', capital: 'アディスアベバ', population: '1.2億人', language: 'アムハラ語', currency: 'ブル (ETB)', timezone: '-6時間', religions: ['キリスト教 62%', 'イスラム教 34%', '伝統宗教 3%'], ethnicities: ['オロモ族 35%', 'アムハラ族 27%', 'ソマリ族 6%'], industries: ['農業', '繊維', '皮革'], ageStructure: '0-14歳 40%/15-64歳 57%/65歳以上 3%', populationGrowth: '+2.5%' },
  MA: { code: 'MA', name: 'モロッコ', capital: 'ラバト', population: '3,700万人', language: 'アラビア語・ベルベル語', currency: 'ディルハム (MAD)', timezone: '-8時間', religions: ['イスラム教 99%', 'キリスト教 0.5%', 'ユダヤ教 0.2%'], ethnicities: ['アラブ・ベルベル 99%', 'その他 1%'], industries: ['観光', 'リン鉱石', '繊維'], ageStructure: '0-14歳 26%/15-64歳 66%/65歳以上 8%', populationGrowth: '+1.0%' },
  TN: { code: 'TN', name: 'チュニジア', capital: 'チュニス', population: '1,200万人', language: 'アラビア語', currency: 'ディナール (TND)', timezone: '-8時間', religions: ['イスラム教 99%', 'キリスト教 0.5%', 'ユダヤ教 0.1%'], ethnicities: ['アラブ 98%', 'ベルベル 1%', '欧州系 1%'], industries: ['観光', '石油', '繊維'], ageStructure: '0-14歳 23%/15-64歳 68%/65歳以上 9%', populationGrowth: '+0.9%' },
  // 中東追加
  QA: { code: 'QA', name: 'カタール', capital: 'ドーハ', population: '290万人', language: 'アラビア語', currency: 'リヤル (QAR)', timezone: '-6時間', religions: ['イスラム教 65%', 'キリスト教 14%', 'ヒンドゥー教 14%'], ethnicities: ['カタール人 12%', '南アジア系 50%', 'アラブ系 20%'], industries: ['石油・ガス', '金融', '建設'], ageStructure: '0-14歳 13%/15-64歳 85%/65歳以上 2%', populationGrowth: '+1.5%' },
  KW: { code: 'KW', name: 'クウェート', capital: 'クウェート', population: '430万人', language: 'アラビア語', currency: 'ディナール (KWD)', timezone: '-6時間', religions: ['イスラム教 75%', 'キリスト教 18%', 'ヒンドゥー教 5%'], ethnicities: ['クウェート人 31%', '南アジア系 38%', 'アラブ系 15%'], industries: ['石油', '石油化学', '金融'], ageStructure: '0-14歳 21%/15-64歳 76%/65歳以上 3%', populationGrowth: '+1.3%' },
  OM: { code: 'OM', name: 'オマーン', capital: 'マスカット', population: '510万人', language: 'アラビア語', currency: 'リアル (OMR)', timezone: '-5時間', religions: ['イスラム教 86%', 'キリスト教 7%', 'ヒンドゥー教 5%'], ethnicities: ['オマーン人 58%', '南アジア系 30%', 'その他 12%'], industries: ['石油・ガス', '観光', '漁業'], ageStructure: '0-14歳 22%/15-64歳 74%/65歳以上 4%', populationGrowth: '+2.0%' },
  BH: { code: 'BH', name: 'バーレーン', capital: 'マナーマ', population: '150万人', language: 'アラビア語', currency: 'ディナール (BHD)', timezone: '-6時間', religions: ['イスラム教 74%', 'キリスト教 10%', 'ヒンドゥー教 10%'], ethnicities: ['バーレーン人 46%', '南アジア系 45%', 'その他 9%'], industries: ['金融', 'アルミ', '石油'], ageStructure: '0-14歳 18%/15-64歳 79%/65歳以上 3%', populationGrowth: '+1.0%' },
  JO: { code: 'JO', name: 'ヨルダン', capital: 'アンマン', population: '1,100万人', language: 'アラビア語', currency: 'ディナール (JOD)', timezone: '-7時間', religions: ['イスラム教 97%', 'キリスト教 2%', 'その他 1%'], ethnicities: ['アラブ人 98%', 'チェルケス人 1%', 'アルメニア人 1%'], industries: ['観光', 'リン鉱石', '製薬'], ageStructure: '0-14歳 32%/15-64歳 64%/65歳以上 4%', populationGrowth: '+0.8%' },
  LB: { code: 'LB', name: 'レバノン', capital: 'ベイルート', population: '530万人', language: 'アラビア語', currency: 'ポンド (LBP)', timezone: '-7時間', religions: ['イスラム教 55%', 'キリスト教 40%', 'ドルーズ教 5%'], ethnicities: ['アラブ人 95%', 'アルメニア人 4%', 'その他 1%'], industries: ['金融', '観光', '不動産'], ageStructure: '0-14歳 22%/15-64歳 68%/65歳以上 10%', populationGrowth: '-0.7%' },
  IQ: { code: 'IQ', name: 'イラク', capital: 'バグダッド', population: '4,400万人', language: 'アラビア語・クルド語', currency: 'ディナール (IQD)', timezone: '-6時間', religions: ['イスラム教 95%', 'キリスト教 1%', 'その他 4%'], ethnicities: ['アラブ人 75%', 'クルド人 20%', 'トルクメン人 3%'], industries: ['石油', '農業', '建設'], ageStructure: '0-14歳 38%/15-64歳 59%/65歳以上 3%', populationGrowth: '+2.2%' },
  IR: { code: 'IR', name: 'イラン', capital: 'テヘラン', population: '8,800万人', language: 'ペルシア語', currency: 'リアル (IRR)', timezone: '-5.5時間', religions: ['シーア派イスラム 90%', 'スンニ派イスラム 9%', 'その他 1%'], ethnicities: ['ペルシア人 61%', 'アゼルバイジャン人 16%', 'クルド人 10%'], industries: ['石油・ガス', '石油化学', '自動車'], ageStructure: '0-14歳 24%/15-64歳 70%/65歳以上 6%', populationGrowth: '+1.0%' },
  // 中央アジア
  KZ: { code: 'KZ', name: 'カザフスタン', capital: 'アスタナ', population: '2,000万人', language: 'カザフ語・ロシア語', currency: 'テンゲ (KZT)', timezone: '-4〜-3時間', religions: ['イスラム教 70%', 'キリスト教 26%', '無宗教 3%'], ethnicities: ['カザフ人 70%', 'ロシア人 18%', 'ウズベク人 3%'], industries: ['石油・ガス', '鉱業', '農業'], ageStructure: '0-14歳 28%/15-64歳 64%/65歳以上 8%', populationGrowth: '+1.2%' },
  UZ: { code: 'UZ', name: 'ウズベキスタン', capital: 'タシケント', population: '3,500万人', language: 'ウズベク語', currency: 'スム (UZS)', timezone: '-4時間', religions: ['イスラム教 88%', '正教 9%', 'その他 3%'], ethnicities: ['ウズベク人 84%', 'タジク人 5%', 'カザフ人 2%'], industries: ['綿花', '天然ガス', '金'], ageStructure: '0-14歳 28%/15-64歳 67%/65歳以上 5%', populationGrowth: '+1.5%' },
  // 東欧
  UA: { code: 'UA', name: 'ウクライナ', capital: 'キーウ', population: '3,700万人', language: 'ウクライナ語', currency: 'フリヴニャ (UAH)', timezone: '-7時間', religions: ['正教 67%', 'ギリシャカトリック 10%', '無宗教 16%'], ethnicities: ['ウクライナ人 78%', 'ロシア人 17%', 'その他 5%'], industries: ['農業', 'IT', '鉄鋼'], ageStructure: '0-14歳 16%/15-64歳 67%/65歳以上 17%', populationGrowth: '-0.5%' },
  RO: { code: 'RO', name: 'ルーマニア', capital: 'ブカレスト', population: '1,900万人', language: 'ルーマニア語', currency: 'レイ (RON)', timezone: '-7時間', religions: ['正教 81%', 'カトリック 5%', 'プロテスタント 6%'], ethnicities: ['ルーマニア人 89%', 'ハンガリー人 6%', 'ロマ 3%'], industries: ['自動車', 'IT', '農業'], ageStructure: '0-14歳 16%/15-64歳 65%/65歳以上 19%', populationGrowth: '-0.5%' },
  HU: { code: 'HU', name: 'ハンガリー', capital: 'ブダペスト', population: '970万人', language: 'ハンガリー語', currency: 'フォリント (HUF)', timezone: '-8時間', religions: ['カトリック 37%', '無宗教 27%', 'カルヴァン派 12%'], ethnicities: ['マジャール人 85%', 'ロマ 3%', 'ドイツ系 2%'], industries: ['自動車', '電子機器', '製薬'], ageStructure: '0-14歳 14%/15-64歳 66%/65歳以上 20%', populationGrowth: '-0.3%' },
  SK: { code: 'SK', name: 'スロバキア', capital: 'ブラチスラバ', population: '540万人', language: 'スロバキア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 62%', '無宗教 24%', 'プロテスタント 6%'], ethnicities: ['スロバキア人 81%', 'ハンガリー人 8%', 'ロマ 2%'], industries: ['自動車', '電子機器', '機械'], ageStructure: '0-14歳 15%/15-64歳 68%/65歳以上 17%', populationGrowth: '+0.1%' },
  HR: { code: 'HR', name: 'クロアチア', capital: 'ザグレブ', population: '390万人', language: 'クロアチア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 86%', '正教 4%', '無宗教 4%'], ethnicities: ['クロアチア人 91%', 'セルビア人 4%', 'その他 5%'], industries: ['観光', '造船', '食品'], ageStructure: '0-14歳 14%/15-64歳 64%/65歳以上 22%', populationGrowth: '-0.4%' },
  RS: { code: 'RS', name: 'セルビア', capital: 'ベオグラード', population: '680万人', language: 'セルビア語', currency: 'ディナール (RSD)', timezone: '-8時間', religions: ['正教 85%', 'カトリック 5%', 'イスラム教 3%'], ethnicities: ['セルビア人 83%', 'ハンガリー人 4%', 'ロマ 2%'], industries: ['自動車部品', '農業', '食品'], ageStructure: '0-14歳 14%/15-64歳 65%/65歳以上 21%', populationGrowth: '-0.5%' },
  BG: { code: 'BG', name: 'ブルガリア', capital: 'ソフィア', population: '680万人', language: 'ブルガリア語', currency: 'レフ (BGN)', timezone: '-7時間', religions: ['正教 76%', '無宗教 10%', 'イスラム教 10%'], ethnicities: ['ブルガリア人 85%', 'トルコ人 9%', 'ロマ 5%'], industries: ['IT', '観光', '農業'], ageStructure: '0-14歳 14%/15-64歳 64%/65歳以上 22%', populationGrowth: '-0.7%' },
  // 中米・カリブ
  CU: { code: 'CU', name: 'キューバ', capital: 'ハバナ', population: '1,110万人', language: 'スペイン語', currency: 'ペソ (CUP)', timezone: '-14時間', religions: ['カトリック 60%', '無宗教 23%', 'サンテリア 15%'], ethnicities: ['混血 51%', '白人 37%', '黒人 11%'], industries: ['観光', '砂糖', 'タバコ'], ageStructure: '0-14歳 16%/15-64歳 68%/65歳以上 16%', populationGrowth: '-0.2%' },
  DO: { code: 'DO', name: 'ドミニカ共和国', capital: 'サントドミンゴ', population: '1,130万人', language: 'スペイン語', currency: 'ペソ (DOP)', timezone: '-13時間', religions: ['カトリック 47%', 'プロテスタント 28%', '無宗教 19%'], ethnicities: ['混血 73%', '白人 16%', '黒人 11%'], industries: ['観光', 'フリーゾーン', '農業'], ageStructure: '0-14歳 26%/15-64歳 66%/65歳以上 8%', populationGrowth: '+1.0%' },
  JM: { code: 'JM', name: 'ジャマイカ', capital: 'キングストン', population: '290万人', language: '英語', currency: 'ドル (JMD)', timezone: '-14時間', religions: ['プロテスタント 64%', 'カトリック 2%', 'ラスタファリ 1%'], ethnicities: ['黒人 92%', '混血 6%', 'その他 2%'], industries: ['観光', 'ボーキサイト', '農業'], ageStructure: '0-14歳 22%/15-64歳 68%/65歳以上 10%', populationGrowth: '+0.1%' },
  PA: { code: 'PA', name: 'パナマ', capital: 'パナマシティ', population: '440万人', language: 'スペイン語', currency: 'バルボア (PAB)', timezone: '-14時間', religions: ['カトリック 63%', 'プロテスタント 25%', '無宗教 8%'], ethnicities: ['メスティーソ 65%', '黒人 12%', '白人 10%'], industries: ['運河・物流', '金融', '観光'], ageStructure: '0-14歳 26%/15-64歳 66%/65歳以上 8%', populationGrowth: '+1.5%' },
  CR: { code: 'CR', name: 'コスタリカ', capital: 'サンホセ', population: '520万人', language: 'スペイン語', currency: 'コロン (CRC)', timezone: '-15時間', religions: ['カトリック 52%', 'プロテスタント 25%', '無宗教 17%'], ethnicities: ['メスティーソ 84%', '白人 7%', '黒人 4%'], industries: ['観光', 'マイクロチップ', '農業'], ageStructure: '0-14歳 21%/15-64歳 68%/65歳以上 11%', populationGrowth: '+0.9%' },
  GT: { code: 'GT', name: 'グアテマラ', capital: 'グアテマラシティ', population: '1,850万人', language: 'スペイン語', currency: 'ケツァル (GTQ)', timezone: '-15時間', religions: ['カトリック 45%', 'プロテスタント 42%', '伝統宗教 7%'], ethnicities: ['メスティーソ 56%', 'マヤ族 42%', '白人 2%'], industries: ['繊維', '農業', '観光'], ageStructure: '0-14歳 33%/15-64歳 62%/65歳以上 5%', populationGrowth: '+1.6%' },
  // 南米追加
  VE: { code: 'VE', name: 'ベネズエラ', capital: 'カラカス', population: '2,850万人', language: 'スペイン語', currency: 'ボリバル (VES)', timezone: '-13時間', religions: ['カトリック 71%', 'プロテスタント 17%', '無宗教 8%'], ethnicities: ['メスティーソ 52%', '白人 43%', '黒人 4%'], industries: ['石油', '鉱業', '農業'], ageStructure: '0-14歳 27%/15-64歳 65%/65歳以上 8%', populationGrowth: '-0.3%' },
  EC: { code: 'EC', name: 'エクアドル', capital: 'キト', population: '1,810万人', language: 'スペイン語', currency: '米ドル (USD)', timezone: '-14時間', religions: ['カトリック 74%', 'プロテスタント 13%', '無宗教 8%'], ethnicities: ['メスティーソ 72%', '先住民 7%', '白人 6%'], industries: ['石油', 'バナナ', 'エビ'], ageStructure: '0-14歳 27%/15-64歳 65%/65歳以上 8%', populationGrowth: '+1.3%' },
  UY: { code: 'UY', name: 'ウルグアイ', capital: 'モンテビデオ', population: '350万人', language: 'スペイン語', currency: 'ペソ (UYU)', timezone: '-12時間', religions: ['カトリック 42%', '無宗教 41%', 'プロテスタント 8%'], ethnicities: ['欧州系 88%', 'メスティーソ 8%', '黒人 4%'], industries: ['畜産', '農業', 'IT'], ageStructure: '0-14歳 20%/15-64歳 65%/65歳以上 15%', populationGrowth: '+0.3%' },
  PY: { code: 'PY', name: 'パラグアイ', capital: 'アスンシオン', population: '720万人', language: 'スペイン語・グアラニー語', currency: 'グアラニー (PYG)', timezone: '-13時間', religions: ['カトリック 89%', 'プロテスタント 7%', 'その他 4%'], ethnicities: ['メスティーソ 95%', '白人 3%', '先住民 2%'], industries: ['農業', '畜産', '水力発電'], ageStructure: '0-14歳 29%/15-64歳 64%/65歳以上 7%', populationGrowth: '+1.2%' },
  BO: { code: 'BO', name: 'ボリビア', capital: 'ラパス', population: '1,220万人', language: 'スペイン語', currency: 'ボリビアーノ (BOB)', timezone: '-13時間', religions: ['カトリック 70%', 'プロテスタント 17%', '伝統宗教 8%'], ethnicities: ['メスティーソ 68%', '先住民 20%', '白人 5%'], industries: ['天然ガス', '鉱業', '農業'], ageStructure: '0-14歳 30%/15-64歳 63%/65歳以上 7%', populationGrowth: '+1.3%' },
  // 南アジア追加
  LK: { code: 'LK', name: 'スリランカ', capital: 'スリジャヤワルダナプラコッテ', population: '2,200万人', language: 'シンハラ語・タミル語', currency: 'ルピー (LKR)', timezone: '-3.5時間', religions: ['仏教 70%', 'ヒンドゥー教 13%', 'イスラム教 10%'], ethnicities: ['シンハラ人 75%', 'タミル人 15%', 'ムーア人 9%'], industries: ['繊維', '観光', '茶'], ageStructure: '0-14歳 23%/15-64歳 65%/65歳以上 12%', populationGrowth: '+0.5%' },
  NP: { code: 'NP', name: 'ネパール', capital: 'カトマンズ', population: '3,100万人', language: 'ネパール語', currency: 'ルピー (NPR)', timezone: '-3.25時間', religions: ['ヒンドゥー教 81%', '仏教 9%', 'イスラム教 4%'], ethnicities: ['ブラーマン族 13%', 'チェトリ族 17%', 'マガール族 7%'], industries: ['観光', '農業', '繊維'], ageStructure: '0-14歳 28%/15-64歳 66%/65歳以上 6%', populationGrowth: '+1.0%' },
  KH: { code: 'KH', name: 'カンボジア', capital: 'プノンペン', population: '1,700万人', language: 'クメール語', currency: 'リエル (KHR)', timezone: '-2時間', religions: ['仏教 97%', 'イスラム教 2%', 'キリスト教 0.4%'], ethnicities: ['クメール人 97%', 'ベトナム人 2%', '中国系 1%'], industries: ['繊維', '観光', '農業'], ageStructure: '0-14歳 30%/15-64歳 66%/65歳以上 4%', populationGrowth: '+1.3%' },
  LA: { code: 'LA', name: 'ラオス', capital: 'ビエンチャン', population: '760万人', language: 'ラオ語', currency: 'キープ (LAK)', timezone: '-2時間', religions: ['仏教 65%', '精霊信仰 32%', 'キリスト教 2%'], ethnicities: ['ラオ族 55%', 'カム族 11%', 'モン族 8%'], industries: ['水力発電', '鉱業', '農業'], ageStructure: '0-14歳 31%/15-64歳 65%/65歳以上 4%', populationGrowth: '+1.4%' },
  BN: { code: 'BN', name: 'ブルネイ', capital: 'バンダルスリブガワン', population: '45万人', language: 'マレー語', currency: 'ドル (BND)', timezone: '-1時間', religions: ['イスラム教 79%', '仏教 9%', 'キリスト教 8%'], ethnicities: ['マレー系 66%', '中国系 10%', 'その他 24%'], industries: ['石油・ガス', '石油化学', '金融'], ageStructure: '0-14歳 22%/15-64歳 72%/65歳以上 6%', populationGrowth: '+0.9%' },
  MN: { code: 'MN', name: 'モンゴル', capital: 'ウランバートル', population: '340万人', language: 'モンゴル語', currency: 'トゥグルグ (MNT)', timezone: '-1時間', religions: ['仏教 53%', '無宗教 39%', 'イスラム教 3%'], ethnicities: ['ハルハ族 85%', 'カザフ族 4%', 'その他 11%'], industries: ['鉱業', '畜産', 'カシミヤ'], ageStructure: '0-14歳 30%/15-64歳 66%/65歳以上 4%', populationGrowth: '+1.4%' },
  // 太平洋の小国
  NU: { code: 'NU', name: 'ニウエ', capital: 'アロフィ', population: '1,600人', language: 'ニウエ語・英語', currency: 'NZドル (NZD)', timezone: '-20時間', religions: ['キリスト教 90%', '伝統宗教 10%'], ethnicities: ['ニウエ人 67%', 'ニウエ・欧州混血 13%', 'その他 20%'], industries: ['農業', '観光', '漁業'], ageStructure: '0-14歳 21%/15-64歳 66%/65歳以上 13%', populationGrowth: '-2.0%' },
  PW: { code: 'PW', name: 'パラオ', capital: 'マルキョク', population: '1.8万人', language: 'パラオ語・英語', currency: '米ドル (USD)', timezone: '±0時間', religions: ['カトリック 46%', 'プロテスタント 26%', '伝統宗教 6%'], ethnicities: ['パラオ人 73%', 'フィリピン系 16%', '中国系 5%'], industries: ['観光', '漁業', '農業'], ageStructure: '0-14歳 18%/15-64歳 72%/65歳以上 10%', populationGrowth: '+0.4%' },
  FM: { code: 'FM', name: 'ミクロネシア連邦', capital: 'パリキール', population: '11万人', language: '英語', currency: '米ドル (USD)', timezone: '+1〜+2時間', religions: ['カトリック 55%', 'プロテスタント 42%', 'その他 3%'], ethnicities: ['チューク人 49%', 'ポンペイ人 24%', 'コスラエ人 6%'], industries: ['漁業', '農業', '観光'], ageStructure: '0-14歳 28%/15-64歳 67%/65歳以上 5%', populationGrowth: '-0.6%' },
  MH: { code: 'MH', name: 'マーシャル諸島', capital: 'マジュロ', population: '5.9万人', language: 'マーシャル語・英語', currency: '米ドル (USD)', timezone: '+3時間', religions: ['プロテスタント 80%', 'カトリック 8%', 'その他 12%'], ethnicities: ['マーシャル人 92%', '混血 6%', 'その他 2%'], industries: ['漁業', 'コプラ', '観光'], ageStructure: '0-14歳 32%/15-64歳 64%/65歳以上 4%', populationGrowth: '+1.4%' },
  NR: { code: 'NR', name: 'ナウル', capital: 'ヤレン', population: '1万人', language: 'ナウル語・英語', currency: '豪ドル (AUD)', timezone: '+3時間', religions: ['プロテスタント 60%', 'カトリック 33%', 'その他 7%'], ethnicities: ['ナウル人 58%', '太平洋諸島系 26%', '中国系 8%'], industries: ['リン鉱石', '漁業', '金融'], ageStructure: '0-14歳 31%/15-64歳 65%/65歳以上 4%', populationGrowth: '+0.4%' },
  KI: { code: 'KI', name: 'キリバス', capital: 'タラワ', population: '12万人', language: '英語・キリバス語', currency: '豪ドル (AUD)', timezone: '+3〜+5時間', religions: ['カトリック 57%', 'プロテスタント 33%', 'その他 10%'], ethnicities: ['キリバス人 96%', '混血 2%', 'その他 2%'], industries: ['漁業', 'コプラ', '観光'], ageStructure: '0-14歳 35%/15-64歳 61%/65歳以上 4%', populationGrowth: '+1.1%' },
  TV: { code: 'TV', name: 'ツバル', capital: 'フナフティ', population: '1.1万人', language: 'ツバル語・英語', currency: '豪ドル (AUD)', timezone: '+3時間', religions: ['キリスト教 97%', 'バハイ教 2%', 'その他 1%'], ethnicities: ['ポリネシア系 96%', 'ミクロネシア系 4%'], industries: ['漁業', '農業', '観光'], ageStructure: '0-14歳 29%/15-64歳 65%/65歳以上 6%', populationGrowth: '+0.8%' },
  CK: { code: 'CK', name: 'クック諸島', capital: 'アバルア', population: '1.7万人', language: '英語・クック諸島マオリ語', currency: 'NZドル (NZD)', timezone: '-19時間', religions: ['キリスト教 90%', '無宗教 8%', 'その他 2%'], ethnicities: ['ポリネシア系 81%', '混血 15%', '欧州系 4%'], industries: ['観光', '漁業', '真珠'], ageStructure: '0-14歳 21%/15-64歳 66%/65歳以上 13%', populationGrowth: '-2.4%' },
  TK: { code: 'TK', name: 'トケラウ', capital: 'アタフ', population: '1,500人', language: 'トケラウ語・英語', currency: 'NZドル (NZD)', timezone: '+4時間', religions: ['キリスト教 100%'], ethnicities: ['トケラウ人 64%', 'サモア系 9%', 'NZ系 15%'], industries: ['漁業', '農業', '工芸'], ageStructure: '0-14歳 38%/15-64歳 57%/65歳以上 5%', populationGrowth: '-0.9%' },
  PF: { code: 'PF', name: 'フランス領ポリネシア', capital: 'パペーテ', population: '28万人', language: 'フランス語・タヒチ語', currency: 'CFPフラン (XPF)', timezone: '-19時間', religions: ['プロテスタント 54%', 'カトリック 30%', 'その他 16%'], ethnicities: ['ポリネシア系 78%', '混血 12%', '欧州系 10%'], industries: ['観光', '真珠養殖', '漁業'], ageStructure: '0-14歳 22%/15-64歳 68%/65歳以上 10%', populationGrowth: '+0.7%' },
  GU: { code: 'GU', name: 'グアム', capital: 'ハガニア', population: '17万人', language: '英語・チャモロ語', currency: '米ドル (USD)', timezone: '+1時間', religions: ['カトリック 75%', 'プロテスタント 15%', 'その他 10%'], ethnicities: ['チャモロ人 37%', 'フィリピン系 26%', '白人 7%'], industries: ['観光', '米軍基地', '建設'], ageStructure: '0-14歳 25%/15-64歳 63%/65歳以上 12%', populationGrowth: '+0.2%' },
  AS: { code: 'AS', name: 'アメリカ領サモア', capital: 'パゴパゴ', population: '5.5万人', language: '英語・サモア語', currency: '米ドル (USD)', timezone: '-20時間', religions: ['キリスト教 98%', 'その他 2%'], ethnicities: ['サモア系 89%', 'トンガ系 4%', 'その他 7%'], industries: ['ツナ缶詰', '観光', '農業'], ageStructure: '0-14歳 27%/15-64歳 66%/65歳以上 7%', populationGrowth: '-1.3%' },
  MP: { code: 'MP', name: '北マリアナ諸島', capital: 'サイパン', population: '5.2万人', language: '英語・チャモロ語', currency: '米ドル (USD)', timezone: '+1時間', religions: ['カトリック 65%', 'プロテスタント 25%', 'その他 10%'], ethnicities: ['フィリピン系 35%', '中国系 23%', 'チャモロ人 22%'], industries: ['観光', '縫製', '農業'], ageStructure: '0-14歳 17%/15-64歳 75%/65歳以上 8%', populationGrowth: '-0.3%' },
  // ヨーロッパの小国
  LU: { code: 'LU', name: 'ルクセンブルク', capital: 'ルクセンブルク', population: '68万人', language: 'ルクセンブルク語・フランス語・ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 41%', '無宗教 49%', 'イスラム教 3%'], ethnicities: ['ルクセンブルク人 53%', 'ポルトガル系 15%', 'フランス系 8%'], industries: ['金融', '鉄鋼', 'IT'], ageStructure: '0-14歳 16%/15-64歳 69%/65歳以上 15%', populationGrowth: '+1.5%' },
  MT: { code: 'MT', name: 'マルタ', capital: 'バレッタ', population: '54万人', language: 'マルタ語・英語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 83%', '無宗教 5%', 'イスラム教 4%'], ethnicities: ['マルタ人 95%', 'イギリス系 2%', 'その他 3%'], industries: ['観光', '金融', '造船'], ageStructure: '0-14歳 14%/15-64歳 66%/65歳以上 20%', populationGrowth: '+1.5%' },
  MC: { code: 'MC', name: 'モナコ', capital: 'モナコ', population: '3.9万人', language: 'フランス語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 86%', '無宗教 12%', 'ユダヤ教 3%'], ethnicities: ['モナコ人 22%', 'フランス人 35%', 'イタリア人 18%'], industries: ['観光', 'カジノ', '金融'], ageStructure: '0-14歳 11%/15-64歳 63%/65歳以上 26%', populationGrowth: '+0.5%' },
  LI: { code: 'LI', name: 'リヒテンシュタイン', capital: 'ファドゥーツ', population: '3.9万人', language: 'ドイツ語', currency: 'スイスフラン (CHF)', timezone: '-8時間', religions: ['カトリック 73%', 'プロテスタント 7%', '無宗教 11%'], ethnicities: ['リヒテンシュタイン人 66%', 'スイス人 10%', 'オーストリア人 6%'], industries: ['金融', '精密機器', '歯科技術'], ageStructure: '0-14歳 15%/15-64歳 67%/65歳以上 18%', populationGrowth: '+0.7%' },
  AD: { code: 'AD', name: 'アンドラ', capital: 'アンドラ・ラ・ベリャ', population: '7.8万人', language: 'カタルーニャ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 90%', '無宗教 8%', 'その他 2%'], ethnicities: ['アンドラ人 33%', 'スペイン人 43%', 'ポルトガル人 11%'], industries: ['観光', '小売', '金融'], ageStructure: '0-14歳 13%/15-64歳 71%/65歳以上 16%', populationGrowth: '+1.0%' },
  SM: { code: 'SM', name: 'サンマリノ', capital: 'サンマリノ', population: '3.4万人', language: 'イタリア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 97%', '無宗教 2%', 'その他 1%'], ethnicities: ['サンマリノ人 85%', 'イタリア人 14%', 'その他 1%'], industries: ['観光', '銀行', '繊維'], ageStructure: '0-14歳 14%/15-64歳 65%/65歳以上 21%', populationGrowth: '+0.3%' },
  VA: { code: 'VA', name: 'バチカン市国', capital: 'バチカン', population: '800人', language: 'ラテン語・イタリア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 100%'], ethnicities: ['イタリア人 50%', 'スイス人 25%', 'その他 25%'], industries: ['宗教活動', '観光', '出版'], ageStructure: 'N/A', populationGrowth: '0%' },
  SI: { code: 'SI', name: 'スロベニア', capital: 'リュブリャナ', population: '210万人', language: 'スロベニア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['カトリック 58%', '無宗教 10%', '正教 2%'], ethnicities: ['スロベニア人 83%', 'セルビア人 2%', 'クロアチア人 2%'], industries: ['製造業', '観光', 'IT'], ageStructure: '0-14歳 15%/15-64歳 65%/65歳以上 20%', populationGrowth: '+0.1%' },
  BA: { code: 'BA', name: 'ボスニア・ヘルツェゴビナ', capital: 'サラエボ', population: '330万人', language: 'ボスニア語・クロアチア語・セルビア語', currency: 'マルカ (BAM)', timezone: '-8時間', religions: ['イスラム教 51%', '正教 31%', 'カトリック 15%'], ethnicities: ['ボシュニャク人 50%', 'セルビア人 31%', 'クロアチア人 15%'], industries: ['金属', '木材', '繊維'], ageStructure: '0-14歳 15%/15-64歳 68%/65歳以上 17%', populationGrowth: '-0.8%' },
  ME: { code: 'ME', name: 'モンテネグロ', capital: 'ポドゴリツァ', population: '63万人', language: 'モンテネグロ語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['正教 71%', 'イスラム教 20%', 'カトリック 3%'], ethnicities: ['モンテネグロ人 41%', 'セルビア人 33%', 'ボシュニャク人 9%'], industries: ['観光', 'アルミ', '農業'], ageStructure: '0-14歳 18%/15-64歳 67%/65歳以上 15%', populationGrowth: '-0.3%' },
  MK: { code: 'MK', name: '北マケドニア', capital: 'スコピエ', population: '200万人', language: 'マケドニア語', currency: 'デナール (MKD)', timezone: '-8時間', religions: ['正教 46%', 'イスラム教 32%', 'その他 22%'], ethnicities: ['マケドニア人 64%', 'アルバニア人 25%', 'トルコ人 4%'], industries: ['繊維', '鉄鋼', '農業'], ageStructure: '0-14歳 16%/15-64歳 69%/65歳以上 15%', populationGrowth: '-0.2%' },
  AL: { code: 'AL', name: 'アルバニア', capital: 'ティラナ', population: '240万人', language: 'アルバニア語', currency: 'レク (ALL)', timezone: '-8時間', religions: ['イスラム教 37%', '無宗教 34%', '正教 8%'], ethnicities: ['アルバニア人 99%', 'ギリシャ人 0.6%', 'その他 0.4%'], industries: ['繊維', '鉱業', '観光'], ageStructure: '0-14歳 17%/15-64歳 69%/65歳以上 14%', populationGrowth: '-0.6%' },
  XK: { code: 'XK', name: 'コソボ', capital: 'プリシュティナ', population: '160万人', language: 'アルバニア語・セルビア語', currency: 'ユーロ (EUR)', timezone: '-8時間', religions: ['イスラム教 94%', '正教 2%', 'カトリック 2%'], ethnicities: ['アルバニア人 92%', 'セルビア人 4%', 'ボシュニャク人 2%'], industries: ['鉱業', '建設', '繊維'], ageStructure: '0-14歳 25%/15-64歳 67%/65歳以上 8%', populationGrowth: '-0.3%' },
  MD: { code: 'MD', name: 'モルドバ', capital: 'キシナウ', population: '260万人', language: 'ルーマニア語', currency: 'レイ (MDL)', timezone: '-7時間', religions: ['正教 95%', 'バプテスト 1%', 'その他 4%'], ethnicities: ['モルドバ人 77%', 'ルーマニア人 8%', 'ウクライナ人 5%'], industries: ['農業', 'ワイン', '繊維'], ageStructure: '0-14歳 16%/15-64歳 68%/65歳以上 16%', populationGrowth: '-0.5%' },
  BY: { code: 'BY', name: 'ベラルーシ', capital: 'ミンスク', population: '930万人', language: 'ベラルーシ語・ロシア語', currency: 'ルーブル (BYN)', timezone: '-6時間', religions: ['正教 59%', 'カトリック 7%', '無宗教 30%'], ethnicities: ['ベラルーシ人 85%', 'ロシア人 8%', 'ポーランド人 3%'], industries: ['機械', '石油化学', 'IT'], ageStructure: '0-14歳 17%/15-64歳 66%/65歳以上 17%', populationGrowth: '-0.3%' },
  LT: { code: 'LT', name: 'リトアニア', capital: 'ビリニュス', population: '290万人', language: 'リトアニア語', currency: 'ユーロ (EUR)', timezone: '-7時間', religions: ['カトリック 75%', '正教 4%', '無宗教 6%'], ethnicities: ['リトアニア人 85%', 'ポーランド人 7%', 'ロシア人 5%'], industries: ['電子機器', '食品', '家具'], ageStructure: '0-14歳 15%/15-64歳 65%/65歳以上 20%', populationGrowth: '-0.4%' },
  LV: { code: 'LV', name: 'ラトビア', capital: 'リガ', population: '190万人', language: 'ラトビア語', currency: 'ユーロ (EUR)', timezone: '-7時間', religions: ['ルーテル派 25%', 'カトリック 23%', '正教 20%'], ethnicities: ['ラトビア人 63%', 'ロシア人 24%', 'ベラルーシ人 3%'], industries: ['木材', '食品', '運輸'], ageStructure: '0-14歳 16%/15-64歳 63%/65歳以上 21%', populationGrowth: '-0.5%' },
  EE: { code: 'EE', name: 'エストニア', capital: 'タリン', population: '137万人', language: 'エストニア語', currency: 'ユーロ (EUR)', timezone: '-7時間', religions: ['無宗教 45%', '正教 25%', 'ルーテル派 20%'], ethnicities: ['エストニア人 69%', 'ロシア人 25%', 'ウクライナ人 2%'], industries: ['IT', '電子機器', '木材'], ageStructure: '0-14歳 16%/15-64歳 64%/65歳以上 20%', populationGrowth: '+0.1%' },
  CY: { code: 'CY', name: 'キプロス', capital: 'ニコシア', population: '120万人', language: 'ギリシャ語・トルコ語', currency: 'ユーロ (EUR)', timezone: '-7時間', religions: ['正教 73%', 'イスラム教 25%', 'その他 2%'], ethnicities: ['ギリシャ系 80%', 'トルコ系 18%', 'その他 2%'], industries: ['観光', '金融', '海運'], ageStructure: '0-14歳 16%/15-64歳 70%/65歳以上 14%', populationGrowth: '+1.0%' },
  // カリブ海追加
  BS: { code: 'BS', name: 'バハマ', capital: 'ナッソー', population: '42万人', language: '英語', currency: 'ドル (BSD)', timezone: '-14時間', religions: ['プロテスタント 80%', 'カトリック 15%', 'その他 5%'], ethnicities: ['アフリカ系 91%', '白人 5%', '混血 3%'], industries: ['観光', '金融', '漁業'], ageStructure: '0-14歳 20%/15-64歳 70%/65歳以上 10%', populationGrowth: '+0.9%' },
  BB: { code: 'BB', name: 'バルバドス', capital: 'ブリッジタウン', population: '29万人', language: '英語', currency: 'ドル (BBD)', timezone: '-13時間', religions: ['プロテスタント 66%', 'カトリック 4%', '無宗教 20%'], ethnicities: ['アフリカ系 92%', '混血 4%', '白人 3%'], industries: ['観光', '砂糖', '金融'], ageStructure: '0-14歳 17%/15-64歳 68%/65歳以上 15%', populationGrowth: '+0.2%' },
  TT: { code: 'TT', name: 'トリニダード・トバゴ', capital: 'ポートオブスペイン', population: '154万人', language: '英語', currency: 'ドル (TTD)', timezone: '-13時間', religions: ['キリスト教 63%', 'ヒンドゥー教 20%', 'イスラム教 6%'], ethnicities: ['インド系 35%', 'アフリカ系 34%', '混血 24%'], industries: ['石油・ガス', '化学', '観光'], ageStructure: '0-14歳 20%/15-64歳 68%/65歳以上 12%', populationGrowth: '-0.2%' },
  HT: { code: 'HT', name: 'ハイチ', capital: 'ポルトープランス', population: '1,140万人', language: 'フランス語・ハイチ語', currency: 'グールド (HTG)', timezone: '-14時間', religions: ['カトリック 55%', 'プロテスタント 30%', 'ブードゥー教 10%'], ethnicities: ['アフリカ系 95%', '混血 5%'], industries: ['繊維', '農業', '観光'], ageStructure: '0-14歳 32%/15-64歳 63%/65歳以上 5%', populationGrowth: '+1.2%' },
  PR: { code: 'PR', name: 'プエルトリコ', capital: 'サンフアン', population: '320万人', language: 'スペイン語・英語', currency: '米ドル (USD)', timezone: '-13時間', religions: ['カトリック 56%', 'プロテスタント 33%', '無宗教 8%'], ethnicities: ['混血 75%', '白人 12%', 'アフリカ系 12%'], industries: ['製薬', '電子機器', '観光'], ageStructure: '0-14歳 14%/15-64歳 65%/65歳以上 21%', populationGrowth: '-1.0%' },
  AW: { code: 'AW', name: 'アルバ', capital: 'オラニエスタッド', population: '11万人', language: 'オランダ語・パピアメント語', currency: 'フロリン (AWG)', timezone: '-13時間', religions: ['カトリック 75%', 'プロテスタント 10%', 'その他 15%'], ethnicities: ['混血 75%', 'オランダ系 10%', 'その他 15%'], industries: ['観光', '石油精製', '金融'], ageStructure: '0-14歳 17%/15-64歳 68%/65歳以上 15%', populationGrowth: '+0.6%' },
  CW: { code: 'CW', name: 'キュラソー', capital: 'ウィレムスタッド', population: '16万人', language: 'オランダ語・パピアメント語', currency: 'ギルダー (ANG)', timezone: '-13時間', religions: ['カトリック 72%', 'プロテスタント 10%', 'その他 18%'], ethnicities: ['混血 75%', 'オランダ系 6%', 'その他 19%'], industries: ['観光', '石油精製', '金融'], ageStructure: '0-14歳 19%/15-64歳 66%/65歳以上 15%', populationGrowth: '+0.2%' },
  // 中米追加
  BZ: { code: 'BZ', name: 'ベリーズ', capital: 'ベルモパン', population: '40万人', language: '英語', currency: 'ドル (BZD)', timezone: '-15時間', religions: ['カトリック 40%', 'プロテスタント 32%', 'その他 28%'], ethnicities: ['メスティーソ 52%', 'クレオール 26%', 'マヤ 10%'], industries: ['観光', '農業', '水産業'], ageStructure: '0-14歳 29%/15-64歳 66%/65歳以上 5%', populationGrowth: '+1.5%' },
  HN: { code: 'HN', name: 'ホンジュラス', capital: 'テグシガルパ', population: '1,080万人', language: 'スペイン語', currency: 'レンピラ (HNL)', timezone: '-15時間', religions: ['プロテスタント 43%', 'カトリック 36%', '無宗教 15%'], ethnicities: ['メスティーソ 90%', '先住民 7%', 'アフリカ系 2%'], industries: ['繊維', 'コーヒー', 'バナナ'], ageStructure: '0-14歳 30%/15-64歳 65%/65歳以上 5%', populationGrowth: '+1.4%' },
  SV: { code: 'SV', name: 'エルサルバドル', capital: 'サンサルバドル', population: '630万人', language: 'スペイン語', currency: '米ドル (USD)', timezone: '-15時間', religions: ['カトリック 50%', 'プロテスタント 36%', '無宗教 10%'], ethnicities: ['メスティーソ 86%', '白人 12%', '先住民 1%'], industries: ['繊維', '食品加工', '金融'], ageStructure: '0-14歳 25%/15-64歳 66%/65歳以上 9%', populationGrowth: '+0.4%' },
  NI: { code: 'NI', name: 'ニカラグア', capital: 'マナグア', population: '690万人', language: 'スペイン語', currency: 'コルドバ (NIO)', timezone: '-15時間', religions: ['カトリック 50%', 'プロテスタント 33%', '無宗教 12%'], ethnicities: ['メスティーソ 69%', '白人 17%', 'アフリカ系 9%'], industries: ['農業', '繊維', '鉱業'], ageStructure: '0-14歳 27%/15-64歳 67%/65歳以上 6%', populationGrowth: '+1.0%' },
  // アフリカ追加
  AO: { code: 'AO', name: 'アンゴラ', capital: 'ルアンダ', population: '3,800万人', language: 'ポルトガル語', currency: 'クワンザ (AOA)', timezone: '-8時間', religions: ['カトリック 41%', 'プロテスタント 38%', '伝統宗教 8%'], ethnicities: ['オビンブンドゥ族 37%', 'キンブンドゥ族 25%', 'バコンゴ族 13%'], industries: ['石油', 'ダイヤモンド', '農業'], ageStructure: '0-14歳 46%/15-64歳 51%/65歳以上 3%', populationGrowth: '+3.3%' },
  MZ: { code: 'MZ', name: 'モザンビーク', capital: 'マプト', population: '3,300万人', language: 'ポルトガル語', currency: 'メティカル (MZN)', timezone: '-7時間', religions: ['キリスト教 57%', 'イスラム教 18%', '伝統宗教 13%'], ethnicities: ['マクア族 26%', 'ツォンガ族 11%', 'マラウイ族 8%'], industries: ['アルミ', '天然ガス', '農業'], ageStructure: '0-14歳 44%/15-64歳 53%/65歳以上 3%', populationGrowth: '+2.6%' },
  ZW: { code: 'ZW', name: 'ジンバブエ', capital: 'ハラレ', population: '1,600万人', language: '英語・ショナ語', currency: 'ジンバブエドル (ZWL)', timezone: '-7時間', religions: ['キリスト教 87%', '伝統宗教 10%', 'その他 3%'], ethnicities: ['ショナ族 82%', 'ンデベレ族 14%', 'その他 4%'], industries: ['鉱業', 'タバコ', '農業'], ageStructure: '0-14歳 40%/15-64歳 56%/65歳以上 4%', populationGrowth: '+1.5%' },
  ZM: { code: 'ZM', name: 'ザンビア', capital: 'ルサカ', population: '2,000万人', language: '英語', currency: 'クワチャ (ZMW)', timezone: '-7時間', religions: ['プロテスタント 75%', 'カトリック 20%', 'イスラム教 3%'], ethnicities: ['ベンバ族 21%', 'トンガ族 14%', 'ロジ族 6%'], industries: ['銅', '農業', '観光'], ageStructure: '0-14歳 44%/15-64歳 53%/65歳以上 3%', populationGrowth: '+2.8%' },
  BW: { code: 'BW', name: 'ボツワナ', capital: 'ハボローネ', population: '260万人', language: '英語・ツワナ語', currency: 'プラ (BWP)', timezone: '-7時間', religions: ['キリスト教 79%', '伝統宗教 6%', '無宗教 16%'], ethnicities: ['ツワナ族 79%', 'カランガ族 11%', 'その他 10%'], industries: ['ダイヤモンド', '観光', '畜産'], ageStructure: '0-14歳 32%/15-64歳 64%/65歳以上 4%', populationGrowth: '+1.4%' },
  NA: { code: 'NA', name: 'ナミビア', capital: 'ウィントフック', population: '260万人', language: '英語', currency: 'ドル (NAD)', timezone: '-7時間', religions: ['キリスト教 90%', '伝統宗教 6%', 'その他 4%'], ethnicities: ['オバンボ族 50%', 'カバンゴ族 9%', '白人 6%'], industries: ['鉱業', '水産業', '観光'], ageStructure: '0-14歳 35%/15-64歳 61%/65歳以上 4%', populationGrowth: '+1.7%' },
  MW: { code: 'MW', name: 'マラウイ', capital: 'リロングウェ', population: '2,100万人', language: '英語・チェワ語', currency: 'クワチャ (MWK)', timezone: '-7時間', religions: ['キリスト教 82%', 'イスラム教 13%', 'その他 5%'], ethnicities: ['チェワ族 35%', 'ロムウェ族 18%', 'ヤオ族 13%'], industries: ['タバコ', '茶', '砂糖'], ageStructure: '0-14歳 43%/15-64歳 54%/65歳以上 3%', populationGrowth: '+2.4%' },
  RW: { code: 'RW', name: 'ルワンダ', capital: 'キガリ', population: '1,440万人', language: 'キニヤルワンダ語・英語・フランス語', currency: 'フラン (RWF)', timezone: '-7時間', religions: ['カトリック 44%', 'プロテスタント 50%', 'イスラム教 2%'], ethnicities: ['フツ族 85%', 'ツチ族 14%', 'トゥワ族 1%'], industries: ['コーヒー', '茶', 'IT'], ageStructure: '0-14歳 39%/15-64歳 58%/65歳以上 3%', populationGrowth: '+2.4%' },
  SD: { code: 'SD', name: 'スーダン', capital: 'ハルツーム', population: '4,800万人', language: 'アラビア語・英語', currency: 'ポンド (SDG)', timezone: '-7時間', religions: ['イスラム教 91%', 'キリスト教 6%', '伝統宗教 3%'], ethnicities: ['アラブ人 70%', 'ベジャ族 6%', 'ヌバ族 5%'], industries: ['石油', '農業', '畜産'], ageStructure: '0-14歳 40%/15-64歳 56%/65歳以上 4%', populationGrowth: '+2.5%' },
  LY: { code: 'LY', name: 'リビア', capital: 'トリポリ', population: '720万人', language: 'アラビア語', currency: 'ディナール (LYD)', timezone: '-7時間', religions: ['イスラム教 97%', 'キリスト教 2%', 'その他 1%'], ethnicities: ['アラブ・ベルベル 97%', 'その他 3%'], industries: ['石油', '天然ガス', '建設'], ageStructure: '0-14歳 27%/15-64歳 68%/65歳以上 5%', populationGrowth: '+1.3%' },
  CM: { code: 'CM', name: 'カメルーン', capital: 'ヤウンデ', population: '2,900万人', language: 'フランス語・英語', currency: 'CFAフラン (XAF)', timezone: '-8時間', religions: ['キリスト教 70%', 'イスラム教 21%', '伝統宗教 6%'], ethnicities: ['高地民族 31%', '赤道バンツー 19%', 'キルディ族 11%'], industries: ['石油', 'カカオ', '木材'], ageStructure: '0-14歳 42%/15-64歳 55%/65歳以上 3%', populationGrowth: '+2.6%' },
  CD: { code: 'CD', name: 'コンゴ民主共和国', capital: 'キンシャサ', population: '1.02億人', language: 'フランス語', currency: 'フラン (CDF)', timezone: '-8〜-7時間', religions: ['カトリック 29%', 'プロテスタント 27%', 'キンバング教 10%'], ethnicities: ['バンツー系 80%', 'その他 20%'], industries: ['鉱業', '農業', '木材'], ageStructure: '0-14歳 46%/15-64歳 51%/65歳以上 3%', populationGrowth: '+3.2%' },
  CG: { code: 'CG', name: 'コンゴ共和国', capital: 'ブラザビル', population: '600万人', language: 'フランス語', currency: 'CFAフラン (XAF)', timezone: '-8時間', religions: ['キリスト教 88%', '伝統宗教 5%', 'イスラム教 2%'], ethnicities: ['コンゴ族 48%', 'サンガ族 20%', 'テケ族 17%'], industries: ['石油', '木材', '鉱業'], ageStructure: '0-14歳 42%/15-64歳 55%/65歳以上 3%', populationGrowth: '+2.4%' },
  GA: { code: 'GA', name: 'ガボン', capital: 'リーブルビル', population: '240万人', language: 'フランス語', currency: 'CFAフラン (XAF)', timezone: '-8時間', religions: ['キリスト教 89%', 'イスラム教 5%', '伝統宗教 3%'], ethnicities: ['ファン族 28%', 'プヌ族 10%', 'ンゼビ族 9%'], industries: ['石油', 'マンガン', '木材'], ageStructure: '0-14歳 37%/15-64歳 59%/65歳以上 4%', populationGrowth: '+2.3%' },
  MG: { code: 'MG', name: 'マダガスカル', capital: 'アンタナナリボ', population: '3,000万人', language: 'マダガスカル語・フランス語', currency: 'アリアリ (MGA)', timezone: '-6時間', religions: ['キリスト教 41%', '伝統宗教 52%', 'イスラム教 7%'], ethnicities: ['メリナ族 26%', 'ベツィミサラカ族 15%', 'ベツィレウ族 12%'], industries: ['農業', 'バニラ', '繊維'], ageStructure: '0-14歳 40%/15-64歳 57%/65歳以上 3%', populationGrowth: '+2.5%' },
  MU: { code: 'MU', name: 'モーリシャス', capital: 'ポートルイス', population: '130万人', language: '英語・フランス語', currency: 'ルピー (MUR)', timezone: '-5時間', religions: ['ヒンドゥー教 48%', 'キリスト教 33%', 'イスラム教 17%'], ethnicities: ['インド系 68%', 'クレオール 27%', '中国系 3%'], industries: ['繊維', '観光', '金融'], ageStructure: '0-14歳 16%/15-64歳 71%/65歳以上 13%', populationGrowth: '+0.1%' },
  SC: { code: 'SC', name: 'セーシェル', capital: 'ビクトリア', population: '10万人', language: '英語・フランス語・セーシェル・クレオール語', currency: 'ルピー (SCR)', timezone: '-5時間', religions: ['カトリック 76%', 'プロテスタント 11%', 'その他 13%'], ethnicities: ['混血 93%', 'インド系 3%', '中国系 2%'], industries: ['観光', '漁業', 'ツナ缶'], ageStructure: '0-14歳 20%/15-64歳 70%/65歳以上 10%', populationGrowth: '+0.5%' },
  // 中央アジア追加
  TM: { code: 'TM', name: 'トルクメニスタン', capital: 'アシガバート', population: '630万人', language: 'トルクメン語', currency: 'マナト (TMT)', timezone: '-4時間', religions: ['イスラム教 89%', '正教 9%', 'その他 2%'], ethnicities: ['トルクメン人 85%', 'ウズベク人 5%', 'ロシア人 4%'], industries: ['天然ガス', '石油', '繊維'], ageStructure: '0-14歳 28%/15-64歳 67%/65歳以上 5%', populationGrowth: '+1.0%' },
  TJ: { code: 'TJ', name: 'タジキスタン', capital: 'ドゥシャンベ', population: '1,000万人', language: 'タジク語', currency: 'ソモニ (TJS)', timezone: '-4時間', religions: ['イスラム教 98%', '正教 1%', 'その他 1%'], ethnicities: ['タジク人 84%', 'ウズベク人 14%', 'ロシア人 1%'], industries: ['アルミ', '綿花', '送金'], ageStructure: '0-14歳 33%/15-64歳 63%/65歳以上 4%', populationGrowth: '+1.8%' },
  KG: { code: 'KG', name: 'キルギス', capital: 'ビシュケク', population: '680万人', language: 'キルギス語・ロシア語', currency: 'ソム (KGS)', timezone: '-3時間', religions: ['イスラム教 90%', '正教 7%', 'その他 3%'], ethnicities: ['キルギス人 74%', 'ウズベク人 15%', 'ロシア人 6%'], industries: ['金', '農業', '繊維'], ageStructure: '0-14歳 32%/15-64歳 63%/65歳以上 5%', populationGrowth: '+1.4%' },
  AF: { code: 'AF', name: 'アフガニスタン', capital: 'カブール', population: '4,200万人', language: 'ダリー語・パシュトー語', currency: 'アフガニ (AFN)', timezone: '-4.5時間', religions: ['イスラム教 99%', 'その他 1%'], ethnicities: ['パシュトゥーン族 42%', 'タジク族 27%', 'ハザラ族 9%'], industries: ['農業', '鉱業', '手工芸'], ageStructure: '0-14歳 42%/15-64歳 55%/65歳以上 3%', populationGrowth: '+2.3%' },
  AZ: { code: 'AZ', name: 'アゼルバイジャン', capital: 'バクー', population: '1,020万人', language: 'アゼルバイジャン語', currency: 'マナト (AZN)', timezone: '-5時間', religions: ['シーア派イスラム 55%', 'スンニ派イスラム 40%', '正教 3%'], ethnicities: ['アゼルバイジャン人 91%', 'レズギ人 2%', 'アルメニア人 2%'], industries: ['石油・ガス', '農業', '観光'], ageStructure: '0-14歳 22%/15-64歳 70%/65歳以上 8%', populationGrowth: '+0.6%' },
  GE: { code: 'GE', name: 'ジョージア', capital: 'トビリシ', population: '370万人', language: 'ジョージア語', currency: 'ラリ (GEL)', timezone: '-5時間', religions: ['正教 83%', 'イスラム教 10%', 'アルメニア使徒教 4%'], ethnicities: ['ジョージア人 86%', 'アゼルバイジャン人 6%', 'アルメニア人 5%'], industries: ['観光', 'ワイン', '鉱業'], ageStructure: '0-14歳 19%/15-64歳 66%/65歳以上 15%', populationGrowth: '-0.2%' },
  AM: { code: 'AM', name: 'アルメニア', capital: 'エレバン', population: '300万人', language: 'アルメニア語', currency: 'ドラム (AMD)', timezone: '-5時間', religions: ['アルメニア使徒教 93%', 'その他キリスト教 4%', 'ヤジディ教 2%'], ethnicities: ['アルメニア人 98%', 'ヤジディ人 1%', 'ロシア人 1%'], industries: ['IT', '鉱業', '宝石加工'], ageStructure: '0-14歳 18%/15-64歳 67%/65歳以上 15%', populationGrowth: '-0.3%' },
  // インド洋
  MV: { code: 'MV', name: 'モルディブ', capital: 'マレ', population: '54万人', language: 'ディベヒ語', currency: 'ルフィヤ (MVR)', timezone: '-4時間', religions: ['イスラム教 99%', 'その他 1%'], ethnicities: ['モルディブ人 99%', 'その他 1%'], industries: ['観光', '漁業', '建設'], ageStructure: '0-14歳 19%/15-64歳 77%/65歳以上 4%', populationGrowth: '-0.2%' },
  // 大西洋
  CV: { code: 'CV', name: 'カーボベルデ', capital: 'プライア', population: '59万人', language: 'ポルトガル語', currency: 'エスクード (CVE)', timezone: '-10時間', religions: ['カトリック 77%', 'プロテスタント 10%', '無宗教 8%'], ethnicities: ['クレオール 71%', 'アフリカ系 28%', '欧州系 1%'], industries: ['観光', '水産業', '送金'], ageStructure: '0-14歳 27%/15-64歳 67%/65歳以上 6%', populationGrowth: '+1.1%' },
  // 南米追加
  GY: { code: 'GY', name: 'ガイアナ', capital: 'ジョージタウン', population: '81万人', language: '英語', currency: 'ドル (GYD)', timezone: '-13時間', religions: ['キリスト教 63%', 'ヒンドゥー教 25%', 'イスラム教 7%'], ethnicities: ['インド系 40%', 'アフリカ系 29%', '混血 20%'], industries: ['石油', '金', '砂糖'], ageStructure: '0-14歳 24%/15-64歳 69%/65歳以上 7%', populationGrowth: '+0.3%' },
  SR: { code: 'SR', name: 'スリナム', capital: 'パラマリボ', population: '61万人', language: 'オランダ語', currency: 'ドル (SRD)', timezone: '-12時間', religions: ['キリスト教 48%', 'ヒンドゥー教 20%', 'イスラム教 14%'], ethnicities: ['インド系 27%', 'マルーン系 22%', '混血 16%'], industries: ['金', '石油', 'ボーキサイト'], ageStructure: '0-14歳 23%/15-64歳 69%/65歳以上 8%', populationGrowth: '+0.8%' },
  GF: { code: 'GF', name: 'フランス領ギアナ', capital: 'カイエンヌ', population: '31万人', language: 'フランス語', currency: 'ユーロ (EUR)', timezone: '-12時間', religions: ['カトリック 52%', 'プロテスタント 27%', 'その他 21%'], ethnicities: ['クレオール 38%', 'マルーン系 15%', '欧州系 12%'], industries: ['宇宙開発', '漁業', '林業'], ageStructure: '0-14歳 30%/15-64歳 65%/65歳以上 5%', populationGrowth: '+2.3%' },
}

// ニーム成長データ (旧BaobabGrowth - データベース互換性のため)
export interface NeemGrowth {
  id: string
  totalPoints: number
  level: number            // 1-10のレベル
  completedTrees: number   // 育ち切った木の本数
  lastActivity: Date
}

// 後方互換性のためのエイリアス
export type BaobabGrowth = NeemGrowth

// 成長ポイントの種類
export type GrowthAction = 'project_added' | 'status_updated' | 'project_completed'

// 成長ポイント値
export const GROWTH_POINTS: Record<GrowthAction, number> = {
  project_added: 10,
  status_updated: 5,
  project_completed: 20,
}

// ニームレベル閾値
export const NEEM_LEVELS = [
  { level: 1, points: 0, name: '種', description: 'まだ芽吹いていない' },
  { level: 2, points: 50, name: '芽', description: '小さな芽が出た' },
  { level: 3, points: 150, name: '小さな苗', description: '葉が生え始めた' },
  { level: 4, points: 300, name: '若木', description: '幹が太くなってきた' },
  { level: 5, points: 500, name: '成長中の木', description: '枝が広がり始めた' },
  { level: 6, points: 800, name: '中木', description: '立派な木になった' },
  { level: 7, points: 1200, name: '大木', description: '堂々とした姿' },
  { level: 8, points: 1800, name: '巨木', description: '圧倒的な存在感' },
  { level: 9, points: 2500, name: '古木', description: '長い年月を感じる' },
  { level: 10, points: 3500, name: '伝説のニーム', description: '最高の状態' },
]

// 後方互換性のためのエイリアス
export const BAOBAB_LEVELS = NEEM_LEVELS

// ステータスの色マッピング
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  not_started: '#D1D5DB',  // gray-300
  preparing: '#FBBF24',    // yellow-400
  in_progress: '#3B82F6',  // blue-500
  completed: '#22C55E',    // green-500
}

// ステータスのラベル
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: '未着手',
  preparing: '準備中',
  in_progress: '進行中',
  completed: '完了',
}

// 国名データ (COUNTRY_INFOと同期)
export const COUNTRY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_INFO).map(([code, info]) => [code, info.name])
)

// ===== Lark連携 =====

// Lark連携設定
export interface LarkSettings {
  id: string
  enabled: boolean                    // 連携ON/OFF
  appId?: string                      // Lark App ID
  appSecret?: string                  // Lark App Secret（暗号化推奨）
  defaultCalendarId?: string          // デフォルトカレンダー
  autoSync: boolean                   // 自動同期ON/OFF
  eventDurationMinutes: number        // デフォルトイベント時間（分）
  reminderMinutes: number             // リマインダー時間（分）
  // OAuth認証フィールド
  userAccessToken?: string            // ユーザーアクセストークン
  userRefreshToken?: string           // リフレッシュトークン
  userTokenExpiresAt?: number         // トークン有効期限（timestamp）
  userOpenId?: string                 // LarkユーザーのOpen ID
  userName?: string                   // Larkユーザー名
  useOAuth: boolean                   // OAuth認証を使用するか
  updatedAt: Date
}

// Larkユーザーマッピング（担当者名 → Lark User）
export interface LarkUserMapping {
  id: string
  displayName: string                 // アプリ内の表示名（例: "木下"）
  larkEmail: string                   // Larkのメールアドレス
  larkUserId?: string                 // Lark User ID（キャッシュ）
  createdAt: Date
  updatedAt: Date
}

// Lark APIレスポンス型
export interface LarkTokenResponse {
  code: number
  msg: string
  tenant_access_token?: string
  expire?: number
}

export interface LarkEventResponse {
  code: number
  msg: string
  data?: {
    event?: {
      event_id: string
      organizer_calendar_id: string
    }
  }
}
