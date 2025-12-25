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

// プロジェクトイベント（ヒストリー）
export interface ProjectEvent {
  id: string
  projectId: string
  date: Date               // イベント発生日/予定日
  title: string            // イベントタイトル（例：大使館訪問）
  description?: string     // 詳細説明
  imageUrl?: string        // 写真（base64 data URL）
  eventType: EventType     // 完了済み or 予定
  participants?: string    // 参加者・訪問者（カンマ区切り）
  createdAt: Date
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
}

// 主要国の基礎情報データ（時差は日本基準）
export const COUNTRY_INFO: Record<string, CountryInfo> = {
  JP: { code: 'JP', name: '日本', capital: '東京', population: '1.25億人', language: '日本語', currency: '円 (JPY)', timezone: '±0時間' },
  US: { code: 'US', name: 'アメリカ', capital: 'ワシントンD.C.', population: '3.31億人', language: '英語', currency: 'ドル (USD)', timezone: '-14〜-19時間' },
  CN: { code: 'CN', name: '中国', capital: '北京', population: '14.1億人', language: '中国語', currency: '人民元 (CNY)', timezone: '-1時間' },
  GB: { code: 'GB', name: 'イギリス', capital: 'ロンドン', population: '6,700万人', language: '英語', currency: 'ポンド (GBP)', timezone: '-9時間' },
  DE: { code: 'DE', name: 'ドイツ', capital: 'ベルリン', population: '8,300万人', language: 'ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  FR: { code: 'FR', name: 'フランス', capital: 'パリ', population: '6,700万人', language: 'フランス語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  KR: { code: 'KR', name: '韓国', capital: 'ソウル', population: '5,200万人', language: '韓国語', currency: 'ウォン (KRW)', timezone: '±0時間' },
  IN: { code: 'IN', name: 'インド', capital: 'ニューデリー', population: '14億人', language: 'ヒンディー語・英語', currency: 'ルピー (INR)', timezone: '-3.5時間' },
  BR: { code: 'BR', name: 'ブラジル', capital: 'ブラジリア', population: '2.1億人', language: 'ポルトガル語', currency: 'レアル (BRL)', timezone: '-12時間' },
  AU: { code: 'AU', name: 'オーストラリア', capital: 'キャンベラ', population: '2,600万人', language: '英語', currency: '豪ドル (AUD)', timezone: '+1時間' },
  SG: { code: 'SG', name: 'シンガポール', capital: 'シンガポール', population: '560万人', language: '英語・中国語・マレー語・タミル語', currency: 'シンガポールドル (SGD)', timezone: '-1時間' },
  TH: { code: 'TH', name: 'タイ', capital: 'バンコク', population: '7,000万人', language: 'タイ語', currency: 'バーツ (THB)', timezone: '-2時間' },
  VN: { code: 'VN', name: 'ベトナム', capital: 'ハノイ', population: '9,700万人', language: 'ベトナム語', currency: 'ドン (VND)', timezone: '-2時間' },
  ID: { code: 'ID', name: 'インドネシア', capital: 'ジャカルタ', population: '2.7億人', language: 'インドネシア語', currency: 'ルピア (IDR)', timezone: '-2〜±0時間' },
  PH: { code: 'PH', name: 'フィリピン', capital: 'マニラ', population: '1.1億人', language: 'フィリピノ語・英語', currency: 'ペソ (PHP)', timezone: '-1時間' },
  MY: { code: 'MY', name: 'マレーシア', capital: 'クアラルンプール', population: '3,200万人', language: 'マレー語・英語', currency: 'リンギット (MYR)', timezone: '-1時間' },
  NG: { code: 'NG', name: 'ナイジェリア', capital: 'アブジャ', population: '2.1億人', language: '英語', currency: 'ナイラ (NGN)', timezone: '-8時間' },
  KE: { code: 'KE', name: 'ケニア', capital: 'ナイロビ', population: '5,400万人', language: 'スワヒリ語・英語', currency: 'ケニアシリング (KES)', timezone: '-6時間' },
  ZA: { code: 'ZA', name: '南アフリカ', capital: 'プレトリア', population: '6,000万人', language: '英語他11言語', currency: 'ランド (ZAR)', timezone: '-7時間' },
  EG: { code: 'EG', name: 'エジプト', capital: 'カイロ', population: '1億人', language: 'アラビア語', currency: 'エジプトポンド (EGP)', timezone: '-7時間' },
  MX: { code: 'MX', name: 'メキシコ', capital: 'メキシコシティ', population: '1.3億人', language: 'スペイン語', currency: 'ペソ (MXN)', timezone: '-15時間' },
  CA: { code: 'CA', name: 'カナダ', capital: 'オタワ', population: '3,800万人', language: '英語・フランス語', currency: 'カナダドル (CAD)', timezone: '-12.5〜-17時間' },
  IT: { code: 'IT', name: 'イタリア', capital: 'ローマ', population: '6,000万人', language: 'イタリア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  ES: { code: 'ES', name: 'スペイン', capital: 'マドリード', population: '4,700万人', language: 'スペイン語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  RU: { code: 'RU', name: 'ロシア', capital: 'モスクワ', population: '1.4億人', language: 'ロシア語', currency: 'ルーブル (RUB)', timezone: '-7〜+3時間' },
  TR: { code: 'TR', name: 'トルコ', capital: 'アンカラ', population: '8,500万人', language: 'トルコ語', currency: 'リラ (TRY)', timezone: '-6時間' },
  SA: { code: 'SA', name: 'サウジアラビア', capital: 'リヤド', population: '3,500万人', language: 'アラビア語', currency: 'リヤル (SAR)', timezone: '-6時間' },
  AE: { code: 'AE', name: 'アラブ首長国連邦', capital: 'アブダビ', population: '1,000万人', language: 'アラビア語', currency: 'ディルハム (AED)', timezone: '-5時間' },
  NL: { code: 'NL', name: 'オランダ', capital: 'アムステルダム', population: '1,700万人', language: 'オランダ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  CH: { code: 'CH', name: 'スイス', capital: 'ベルン', population: '870万人', language: 'ドイツ語・フランス語・イタリア語', currency: 'フラン (CHF)', timezone: '-8時間' },
  SE: { code: 'SE', name: 'スウェーデン', capital: 'ストックホルム', population: '1,000万人', language: 'スウェーデン語', currency: 'クローナ (SEK)', timezone: '-8時間' },
  PL: { code: 'PL', name: 'ポーランド', capital: 'ワルシャワ', population: '3,800万人', language: 'ポーランド語', currency: 'ズウォティ (PLN)', timezone: '-8時間' },
  TW: { code: 'TW', name: '台湾', capital: '台北', population: '2,400万人', language: '中国語', currency: '台湾ドル (TWD)', timezone: '-1時間' },
  HK: { code: 'HK', name: '香港', capital: '香港', population: '750万人', language: '広東語・英語', currency: '香港ドル (HKD)', timezone: '-1時間' },
  GL: { code: 'GL', name: 'グリーンランド', capital: 'ヌーク', population: '5.6万人', language: 'グリーンランド語・デンマーク語', currency: 'デンマーク・クローネ (DKK)', timezone: '-12時間' },
  IS: { code: 'IS', name: 'アイスランド', capital: 'レイキャビク', population: '37万人', language: 'アイスランド語', currency: 'クローナ (ISK)', timezone: '-9時間' },
  NO: { code: 'NO', name: 'ノルウェー', capital: 'オスロ', population: '540万人', language: 'ノルウェー語', currency: 'クローネ (NOK)', timezone: '-8時間' },
  FI: { code: 'FI', name: 'フィンランド', capital: 'ヘルシンキ', population: '550万人', language: 'フィンランド語・スウェーデン語', currency: 'ユーロ (EUR)', timezone: '-7時間' },
  DK: { code: 'DK', name: 'デンマーク', capital: 'コペンハーゲン', population: '580万人', language: 'デンマーク語', currency: 'クローネ (DKK)', timezone: '-8時間' },
  IE: { code: 'IE', name: 'アイルランド', capital: 'ダブリン', population: '500万人', language: '英語・アイルランド語', currency: 'ユーロ (EUR)', timezone: '-9時間' },
  PT: { code: 'PT', name: 'ポルトガル', capital: 'リスボン', population: '1,000万人', language: 'ポルトガル語', currency: 'ユーロ (EUR)', timezone: '-9時間' },
  GR: { code: 'GR', name: 'ギリシャ', capital: 'アテネ', population: '1,000万人', language: 'ギリシャ語', currency: 'ユーロ (EUR)', timezone: '-7時間' },
  AT: { code: 'AT', name: 'オーストリア', capital: 'ウィーン', population: '900万人', language: 'ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  BE: { code: 'BE', name: 'ベルギー', capital: 'ブリュッセル', population: '1,150万人', language: 'オランダ語・フランス語・ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  CZ: { code: 'CZ', name: 'チェコ', capital: 'プラハ', population: '1,050万人', language: 'チェコ語', currency: 'コルナ (CZK)', timezone: '-8時間' },
  AR: { code: 'AR', name: 'アルゼンチン', capital: 'ブエノスアイレス', population: '4,500万人', language: 'スペイン語', currency: 'ペソ (ARS)', timezone: '-12時間' },
  CL: { code: 'CL', name: 'チリ', capital: 'サンティアゴ', population: '1,900万人', language: 'スペイン語', currency: 'ペソ (CLP)', timezone: '-13時間' },
  CO: { code: 'CO', name: 'コロンビア', capital: 'ボゴタ', population: '5,100万人', language: 'スペイン語', currency: 'ペソ (COP)', timezone: '-14時間' },
  PE: { code: 'PE', name: 'ペルー', capital: 'リマ', population: '3,300万人', language: 'スペイン語', currency: 'ソル (PEN)', timezone: '-14時間' },
  NZ: { code: 'NZ', name: 'ニュージーランド', capital: 'ウェリントン', population: '500万人', language: '英語・マオリ語', currency: 'NZドル (NZD)', timezone: '+3時間' },
  PK: { code: 'PK', name: 'パキスタン', capital: 'イスラマバード', population: '2.2億人', language: 'ウルドゥー語・英語', currency: 'ルピー (PKR)', timezone: '-4時間' },
  BD: { code: 'BD', name: 'バングラデシュ', capital: 'ダッカ', population: '1.7億人', language: 'ベンガル語', currency: 'タカ (BDT)', timezone: '-3時間' },
  IL: { code: 'IL', name: 'イスラエル', capital: 'エルサレム', population: '930万人', language: 'ヘブライ語・アラビア語', currency: 'シェケル (ILS)', timezone: '-7時間' },
  MM: { code: 'MM', name: 'ミャンマー', capital: 'ネーピードー', population: '5,400万人', language: 'ビルマ語', currency: 'チャット (MMK)', timezone: '-2.5時間' },
  // 太平洋
  FJ: { code: 'FJ', name: 'フィジー', capital: 'スバ', population: '90万人', language: '英語・フィジー語', currency: 'フィジードル (FJD)', timezone: '+3時間' },
  PG: { code: 'PG', name: 'パプアニューギニア', capital: 'ポートモレスビー', population: '900万人', language: '英語・トクピシン', currency: 'キナ (PGK)', timezone: '+1時間' },
  SB: { code: 'SB', name: 'ソロモン諸島', capital: 'ホニアラ', population: '70万人', language: '英語', currency: 'ソロモンドル (SBD)', timezone: '+2時間' },
  VU: { code: 'VU', name: 'バヌアツ', capital: 'ポートビラ', population: '31万人', language: '英語・フランス語・ビスラマ語', currency: 'バツ (VUV)', timezone: '+2時間' },
  WS: { code: 'WS', name: 'サモア', capital: 'アピア', population: '20万人', language: 'サモア語・英語', currency: 'タラ (WST)', timezone: '+4時間' },
  TO: { code: 'TO', name: 'トンガ', capital: 'ヌクアロファ', population: '10万人', language: 'トンガ語・英語', currency: 'パアンガ (TOP)', timezone: '+4時間' },
  NC: { code: 'NC', name: 'ニューカレドニア', capital: 'ヌメア', population: '29万人', language: 'フランス語', currency: 'CFPフラン (XPF)', timezone: '+2時間' },
  // アフリカ追加
  GH: { code: 'GH', name: 'ガーナ', capital: 'アクラ', population: '3,100万人', language: '英語', currency: 'セディ (GHS)', timezone: '-9時間' },
  CI: { code: 'CI', name: 'コートジボワール', capital: 'ヤムスクロ', population: '2,600万人', language: 'フランス語', currency: 'CFAフラン (XOF)', timezone: '-9時間' },
  SN: { code: 'SN', name: 'セネガル', capital: 'ダカール', population: '1,700万人', language: 'フランス語', currency: 'CFAフラン (XOF)', timezone: '-9時間' },
  TZ: { code: 'TZ', name: 'タンザニア', capital: 'ドドマ', population: '6,000万人', language: 'スワヒリ語・英語', currency: 'シリング (TZS)', timezone: '-6時間' },
  UG: { code: 'UG', name: 'ウガンダ', capital: 'カンパラ', population: '4,500万人', language: '英語・スワヒリ語', currency: 'シリング (UGX)', timezone: '-6時間' },
  ET: { code: 'ET', name: 'エチオピア', capital: 'アディスアベバ', population: '1.2億人', language: 'アムハラ語', currency: 'ブル (ETB)', timezone: '-6時間' },
  MA: { code: 'MA', name: 'モロッコ', capital: 'ラバト', population: '3,700万人', language: 'アラビア語・ベルベル語', currency: 'ディルハム (MAD)', timezone: '-8時間' },
  DZ: { code: 'DZ', name: 'アルジェリア', capital: 'アルジェ', population: '4,400万人', language: 'アラビア語', currency: 'ディナール (DZD)', timezone: '-8時間' },
  TN: { code: 'TN', name: 'チュニジア', capital: 'チュニス', population: '1,200万人', language: 'アラビア語', currency: 'ディナール (TND)', timezone: '-8時間' },
  // 中東追加
  QA: { code: 'QA', name: 'カタール', capital: 'ドーハ', population: '290万人', language: 'アラビア語', currency: 'リヤル (QAR)', timezone: '-6時間' },
  KW: { code: 'KW', name: 'クウェート', capital: 'クウェート', population: '430万人', language: 'アラビア語', currency: 'ディナール (KWD)', timezone: '-6時間' },
  OM: { code: 'OM', name: 'オマーン', capital: 'マスカット', population: '510万人', language: 'アラビア語', currency: 'リアル (OMR)', timezone: '-5時間' },
  BH: { code: 'BH', name: 'バーレーン', capital: 'マナーマ', population: '150万人', language: 'アラビア語', currency: 'ディナール (BHD)', timezone: '-6時間' },
  JO: { code: 'JO', name: 'ヨルダン', capital: 'アンマン', population: '1,000万人', language: 'アラビア語', currency: 'ディナール (JOD)', timezone: '-7時間' },
  LB: { code: 'LB', name: 'レバノン', capital: 'ベイルート', population: '680万人', language: 'アラビア語', currency: 'ポンド (LBP)', timezone: '-7時間' },
  IQ: { code: 'IQ', name: 'イラク', capital: 'バグダッド', population: '4,000万人', language: 'アラビア語・クルド語', currency: 'ディナール (IQD)', timezone: '-6時間' },
  IR: { code: 'IR', name: 'イラン', capital: 'テヘラン', population: '8,500万人', language: 'ペルシア語', currency: 'リアル (IRR)', timezone: '-5.5時間' },
  // 中央アジア
  KZ: { code: 'KZ', name: 'カザフスタン', capital: 'アスタナ', population: '1,900万人', language: 'カザフ語・ロシア語', currency: 'テンゲ (KZT)', timezone: '-4〜-3時間' },
  UZ: { code: 'UZ', name: 'ウズベキスタン', capital: 'タシケント', population: '3,400万人', language: 'ウズベク語', currency: 'スム (UZS)', timezone: '-4時間' },
  // 東欧
  UA: { code: 'UA', name: 'ウクライナ', capital: 'キーウ', population: '4,400万人', language: 'ウクライナ語', currency: 'フリヴニャ (UAH)', timezone: '-7時間' },
  RO: { code: 'RO', name: 'ルーマニア', capital: 'ブカレスト', population: '1,900万人', language: 'ルーマニア語', currency: 'レイ (RON)', timezone: '-7時間' },
  HU: { code: 'HU', name: 'ハンガリー', capital: 'ブダペスト', population: '970万人', language: 'ハンガリー語', currency: 'フォリント (HUF)', timezone: '-8時間' },
  SK: { code: 'SK', name: 'スロバキア', capital: 'ブラチスラバ', population: '540万人', language: 'スロバキア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  HR: { code: 'HR', name: 'クロアチア', capital: 'ザグレブ', population: '400万人', language: 'クロアチア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  RS: { code: 'RS', name: 'セルビア', capital: 'ベオグラード', population: '690万人', language: 'セルビア語', currency: 'ディナール (RSD)', timezone: '-8時間' },
  BG: { code: 'BG', name: 'ブルガリア', capital: 'ソフィア', population: '690万人', language: 'ブルガリア語', currency: 'レフ (BGN)', timezone: '-7時間' },
  // 中米・カリブ
  CU: { code: 'CU', name: 'キューバ', capital: 'ハバナ', population: '1,130万人', language: 'スペイン語', currency: 'ペソ (CUP)', timezone: '-14時間' },
  DO: { code: 'DO', name: 'ドミニカ共和国', capital: 'サントドミンゴ', population: '1,100万人', language: 'スペイン語', currency: 'ペソ (DOP)', timezone: '-13時間' },
  JM: { code: 'JM', name: 'ジャマイカ', capital: 'キングストン', population: '300万人', language: '英語', currency: 'ドル (JMD)', timezone: '-14時間' },
  PA: { code: 'PA', name: 'パナマ', capital: 'パナマシティ', population: '430万人', language: 'スペイン語', currency: 'バルボア (PAB)', timezone: '-14時間' },
  CR: { code: 'CR', name: 'コスタリカ', capital: 'サンホセ', population: '510万人', language: 'スペイン語', currency: 'コロン (CRC)', timezone: '-15時間' },
  GT: { code: 'GT', name: 'グアテマラ', capital: 'グアテマラシティ', population: '1,800万人', language: 'スペイン語', currency: 'ケツァル (GTQ)', timezone: '-15時間' },
  // 南米追加
  VE: { code: 'VE', name: 'ベネズエラ', capital: 'カラカス', population: '2,800万人', language: 'スペイン語', currency: 'ボリバル (VES)', timezone: '-13時間' },
  EC: { code: 'EC', name: 'エクアドル', capital: 'キト', population: '1,800万人', language: 'スペイン語', currency: '米ドル (USD)', timezone: '-14時間' },
  UY: { code: 'UY', name: 'ウルグアイ', capital: 'モンテビデオ', population: '350万人', language: 'スペイン語', currency: 'ペソ (UYU)', timezone: '-12時間' },
  PY: { code: 'PY', name: 'パラグアイ', capital: 'アスンシオン', population: '700万人', language: 'スペイン語・グアラニー語', currency: 'グアラニー (PYG)', timezone: '-13時間' },
  BO: { code: 'BO', name: 'ボリビア', capital: 'ラパス', population: '1,200万人', language: 'スペイン語', currency: 'ボリビアーノ (BOB)', timezone: '-13時間' },
  // 南アジア追加
  LK: { code: 'LK', name: 'スリランカ', capital: 'スリジャヤワルダナプラコッテ', population: '2,200万人', language: 'シンハラ語・タミル語', currency: 'ルピー (LKR)', timezone: '-3.5時間' },
  NP: { code: 'NP', name: 'ネパール', capital: 'カトマンズ', population: '3,000万人', language: 'ネパール語', currency: 'ルピー (NPR)', timezone: '-3.25時間' },
  KH: { code: 'KH', name: 'カンボジア', capital: 'プノンペン', population: '1,700万人', language: 'クメール語', currency: 'リエル (KHR)', timezone: '-2時間' },
  LA: { code: 'LA', name: 'ラオス', capital: 'ビエンチャン', population: '730万人', language: 'ラオ語', currency: 'キープ (LAK)', timezone: '-2時間' },
  BN: { code: 'BN', name: 'ブルネイ', capital: 'バンダルスリブガワン', population: '44万人', language: 'マレー語', currency: 'ドル (BND)', timezone: '-1時間' },
  MN: { code: 'MN', name: 'モンゴル', capital: 'ウランバートル', population: '330万人', language: 'モンゴル語', currency: 'トゥグルグ (MNT)', timezone: '-1時間' },
  // 太平洋の小国
  NU: { code: 'NU', name: 'ニウエ', capital: 'アロフィ', population: '1,600人', language: 'ニウエ語・英語', currency: 'NZドル (NZD)', timezone: '-20時間' },
  PW: { code: 'PW', name: 'パラオ', capital: 'マルキョク', population: '1.8万人', language: 'パラオ語・英語', currency: '米ドル (USD)', timezone: '±0時間' },
  FM: { code: 'FM', name: 'ミクロネシア連邦', capital: 'パリキール', population: '11万人', language: '英語', currency: '米ドル (USD)', timezone: '+1〜+2時間' },
  MH: { code: 'MH', name: 'マーシャル諸島', capital: 'マジュロ', population: '5.9万人', language: 'マーシャル語・英語', currency: '米ドル (USD)', timezone: '+3時間' },
  NR: { code: 'NR', name: 'ナウル', capital: 'ヤレン', population: '1万人', language: 'ナウル語・英語', currency: '豪ドル (AUD)', timezone: '+3時間' },
  KI: { code: 'KI', name: 'キリバス', capital: 'タラワ', population: '12万人', language: '英語・キリバス語', currency: '豪ドル (AUD)', timezone: '+3〜+5時間' },
  TV: { code: 'TV', name: 'ツバル', capital: 'フナフティ', population: '1.1万人', language: 'ツバル語・英語', currency: '豪ドル (AUD)', timezone: '+3時間' },
  CK: { code: 'CK', name: 'クック諸島', capital: 'アバルア', population: '1.7万人', language: '英語・クック諸島マオリ語', currency: 'NZドル (NZD)', timezone: '-19時間' },
  TK: { code: 'TK', name: 'トケラウ', capital: 'アタフ', population: '1,500人', language: 'トケラウ語・英語', currency: 'NZドル (NZD)', timezone: '+4時間' },
  PF: { code: 'PF', name: 'フランス領ポリネシア', capital: 'パペーテ', population: '28万人', language: 'フランス語・タヒチ語', currency: 'CFPフラン (XPF)', timezone: '-19時間' },
  GU: { code: 'GU', name: 'グアム', capital: 'ハガニア', population: '17万人', language: '英語・チャモロ語', currency: '米ドル (USD)', timezone: '+1時間' },
  AS: { code: 'AS', name: 'アメリカ領サモア', capital: 'パゴパゴ', population: '5.5万人', language: '英語・サモア語', currency: '米ドル (USD)', timezone: '-20時間' },
  MP: { code: 'MP', name: '北マリアナ諸島', capital: 'サイパン', population: '5.2万人', language: '英語・チャモロ語', currency: '米ドル (USD)', timezone: '+1時間' },
  // ヨーロッパの小国
  LU: { code: 'LU', name: 'ルクセンブルク', capital: 'ルクセンブルク', population: '64万人', language: 'ルクセンブルク語・フランス語・ドイツ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  MT: { code: 'MT', name: 'マルタ', capital: 'バレッタ', population: '52万人', language: 'マルタ語・英語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  MC: { code: 'MC', name: 'モナコ', capital: 'モナコ', population: '3.9万人', language: 'フランス語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  LI: { code: 'LI', name: 'リヒテンシュタイン', capital: 'ファドゥーツ', population: '3.9万人', language: 'ドイツ語', currency: 'スイスフラン (CHF)', timezone: '-8時間' },
  AD: { code: 'AD', name: 'アンドラ', capital: 'アンドラ・ラ・ベリャ', population: '7.8万人', language: 'カタルーニャ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  SM: { code: 'SM', name: 'サンマリノ', capital: 'サンマリノ', population: '3.4万人', language: 'イタリア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  VA: { code: 'VA', name: 'バチカン市国', capital: 'バチカン', population: '800人', language: 'ラテン語・イタリア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  SI: { code: 'SI', name: 'スロベニア', capital: 'リュブリャナ', population: '210万人', language: 'スロベニア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  BA: { code: 'BA', name: 'ボスニア・ヘルツェゴビナ', capital: 'サラエボ', population: '330万人', language: 'ボスニア語・クロアチア語・セルビア語', currency: 'マルカ (BAM)', timezone: '-8時間' },
  ME: { code: 'ME', name: 'モンテネグロ', capital: 'ポドゴリツァ', population: '62万人', language: 'モンテネグロ語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  MK: { code: 'MK', name: '北マケドニア', capital: 'スコピエ', population: '210万人', language: 'マケドニア語', currency: 'デナール (MKD)', timezone: '-8時間' },
  AL: { code: 'AL', name: 'アルバニア', capital: 'ティラナ', population: '290万人', language: 'アルバニア語', currency: 'レク (ALL)', timezone: '-8時間' },
  XK: { code: 'XK', name: 'コソボ', capital: 'プリシュティナ', population: '180万人', language: 'アルバニア語・セルビア語', currency: 'ユーロ (EUR)', timezone: '-8時間' },
  MD: { code: 'MD', name: 'モルドバ', capital: 'キシナウ', population: '260万人', language: 'ルーマニア語', currency: 'レイ (MDL)', timezone: '-7時間' },
  BY: { code: 'BY', name: 'ベラルーシ', capital: 'ミンスク', population: '930万人', language: 'ベラルーシ語・ロシア語', currency: 'ルーブル (BYN)', timezone: '-6時間' },
  LT: { code: 'LT', name: 'リトアニア', capital: 'ビリニュス', population: '280万人', language: 'リトアニア語', currency: 'ユーロ (EUR)', timezone: '-7時間' },
  LV: { code: 'LV', name: 'ラトビア', capital: 'リガ', population: '190万人', language: 'ラトビア語', currency: 'ユーロ (EUR)', timezone: '-7時間' },
  EE: { code: 'EE', name: 'エストニア', capital: 'タリン', population: '130万人', language: 'エストニア語', currency: 'ユーロ (EUR)', timezone: '-7時間' },
  CY: { code: 'CY', name: 'キプロス', capital: 'ニコシア', population: '120万人', language: 'ギリシャ語・トルコ語', currency: 'ユーロ (EUR)', timezone: '-7時間' },
  // カリブ海追加
  BS: { code: 'BS', name: 'バハマ', capital: 'ナッソー', population: '39万人', language: '英語', currency: 'ドル (BSD)', timezone: '-14時間' },
  BB: { code: 'BB', name: 'バルバドス', capital: 'ブリッジタウン', population: '29万人', language: '英語', currency: 'ドル (BBD)', timezone: '-13時間' },
  TT: { code: 'TT', name: 'トリニダード・トバゴ', capital: 'ポートオブスペイン', population: '140万人', language: '英語', currency: 'ドル (TTD)', timezone: '-13時間' },
  HT: { code: 'HT', name: 'ハイチ', capital: 'ポルトープランス', population: '1,140万人', language: 'フランス語・ハイチ語', currency: 'グールド (HTG)', timezone: '-14時間' },
  PR: { code: 'PR', name: 'プエルトリコ', capital: 'サンフアン', population: '320万人', language: 'スペイン語・英語', currency: '米ドル (USD)', timezone: '-13時間' },
  AW: { code: 'AW', name: 'アルバ', capital: 'オラニエスタッド', population: '11万人', language: 'オランダ語・パピアメント語', currency: 'フロリン (AWG)', timezone: '-13時間' },
  CW: { code: 'CW', name: 'キュラソー', capital: 'ウィレムスタッド', population: '16万人', language: 'オランダ語・パピアメント語', currency: 'ギルダー (ANG)', timezone: '-13時間' },
  // 中米追加
  BZ: { code: 'BZ', name: 'ベリーズ', capital: 'ベルモパン', population: '40万人', language: '英語', currency: 'ドル (BZD)', timezone: '-15時間' },
  HN: { code: 'HN', name: 'ホンジュラス', capital: 'テグシガルパ', population: '1,000万人', language: 'スペイン語', currency: 'レンピラ (HNL)', timezone: '-15時間' },
  SV: { code: 'SV', name: 'エルサルバドル', capital: 'サンサルバドル', population: '650万人', language: 'スペイン語', currency: '米ドル (USD)', timezone: '-15時間' },
  NI: { code: 'NI', name: 'ニカラグア', capital: 'マナグア', population: '660万人', language: 'スペイン語', currency: 'コルドバ (NIO)', timezone: '-15時間' },
  // アフリカ追加
  AO: { code: 'AO', name: 'アンゴラ', capital: 'ルアンダ', population: '3,300万人', language: 'ポルトガル語', currency: 'クワンザ (AOA)', timezone: '-8時間' },
  MZ: { code: 'MZ', name: 'モザンビーク', capital: 'マプト', population: '3,100万人', language: 'ポルトガル語', currency: 'メティカル (MZN)', timezone: '-7時間' },
  ZW: { code: 'ZW', name: 'ジンバブエ', capital: 'ハラレ', population: '1,500万人', language: '英語・ショナ語', currency: 'ジンバブエドル (ZWL)', timezone: '-7時間' },
  ZM: { code: 'ZM', name: 'ザンビア', capital: 'ルサカ', population: '1,900万人', language: '英語', currency: 'クワチャ (ZMW)', timezone: '-7時間' },
  BW: { code: 'BW', name: 'ボツワナ', capital: 'ハボローネ', population: '240万人', language: '英語・ツワナ語', currency: 'プラ (BWP)', timezone: '-7時間' },
  NA: { code: 'NA', name: 'ナミビア', capital: 'ウィントフック', population: '250万人', language: '英語', currency: 'ドル (NAD)', timezone: '-7時間' },
  MW: { code: 'MW', name: 'マラウイ', capital: 'リロングウェ', population: '1,900万人', language: '英語・チェワ語', currency: 'クワチャ (MWK)', timezone: '-7時間' },
  RW: { code: 'RW', name: 'ルワンダ', capital: 'キガリ', population: '1,300万人', language: 'キニヤルワンダ語・英語・フランス語', currency: 'フラン (RWF)', timezone: '-7時間' },
  SD: { code: 'SD', name: 'スーダン', capital: 'ハルツーム', population: '4,400万人', language: 'アラビア語・英語', currency: 'ポンド (SDG)', timezone: '-7時間' },
  LY: { code: 'LY', name: 'リビア', capital: 'トリポリ', population: '690万人', language: 'アラビア語', currency: 'ディナール (LYD)', timezone: '-7時間' },
  CM: { code: 'CM', name: 'カメルーン', capital: 'ヤウンデ', population: '2,700万人', language: 'フランス語・英語', currency: 'CFAフラン (XAF)', timezone: '-8時間' },
  CD: { code: 'CD', name: 'コンゴ民主共和国', capital: 'キンシャサ', population: '9,000万人', language: 'フランス語', currency: 'フラン (CDF)', timezone: '-8〜-7時間' },
  CG: { code: 'CG', name: 'コンゴ共和国', capital: 'ブラザビル', population: '550万人', language: 'フランス語', currency: 'CFAフラン (XAF)', timezone: '-8時間' },
  GA: { code: 'GA', name: 'ガボン', capital: 'リーブルビル', population: '220万人', language: 'フランス語', currency: 'CFAフラン (XAF)', timezone: '-8時間' },
  MG: { code: 'MG', name: 'マダガスカル', capital: 'アンタナナリボ', population: '2,800万人', language: 'マダガスカル語・フランス語', currency: 'アリアリ (MGA)', timezone: '-6時間' },
  MU: { code: 'MU', name: 'モーリシャス', capital: 'ポートルイス', population: '130万人', language: '英語・フランス語', currency: 'ルピー (MUR)', timezone: '-5時間' },
  SC: { code: 'SC', name: 'セーシェル', capital: 'ビクトリア', population: '10万人', language: '英語・フランス語・セーシェル・クレオール語', currency: 'ルピー (SCR)', timezone: '-5時間' },
  // 中央アジア追加
  TM: { code: 'TM', name: 'トルクメニスタン', capital: 'アシガバート', population: '600万人', language: 'トルクメン語', currency: 'マナト (TMT)', timezone: '-4時間' },
  TJ: { code: 'TJ', name: 'タジキスタン', capital: 'ドゥシャンベ', population: '950万人', language: 'タジク語', currency: 'ソモニ (TJS)', timezone: '-4時間' },
  KG: { code: 'KG', name: 'キルギス', capital: 'ビシュケク', population: '660万人', language: 'キルギス語・ロシア語', currency: 'ソム (KGS)', timezone: '-3時間' },
  AF: { code: 'AF', name: 'アフガニスタン', capital: 'カブール', population: '3,900万人', language: 'ダリー語・パシュトー語', currency: 'アフガニ (AFN)', timezone: '-4.5時間' },
  AZ: { code: 'AZ', name: 'アゼルバイジャン', capital: 'バクー', population: '1,000万人', language: 'アゼルバイジャン語', currency: 'マナト (AZN)', timezone: '-5時間' },
  GE: { code: 'GE', name: 'ジョージア', capital: 'トビリシ', population: '370万人', language: 'ジョージア語', currency: 'ラリ (GEL)', timezone: '-5時間' },
  AM: { code: 'AM', name: 'アルメニア', capital: 'エレバン', population: '300万人', language: 'アルメニア語', currency: 'ドラム (AMD)', timezone: '-5時間' },
  // インド洋
  MV: { code: 'MV', name: 'モルディブ', capital: 'マレ', population: '54万人', language: 'ディベヒ語', currency: 'ルフィヤ (MVR)', timezone: '-4時間' },
  // 南米追加
  GY: { code: 'GY', name: 'ガイアナ', capital: 'ジョージタウン', population: '79万人', language: '英語', currency: 'ドル (GYD)', timezone: '-13時間' },
  SR: { code: 'SR', name: 'スリナム', capital: 'パラマリボ', population: '59万人', language: 'オランダ語', currency: 'ドル (SRD)', timezone: '-12時間' },
  GF: { code: 'GF', name: 'フランス領ギアナ', capital: 'カイエンヌ', population: '29万人', language: 'フランス語', currency: 'ユーロ (EUR)', timezone: '-12時間' },
}

// バオバブ成長データ
export interface BaobabGrowth {
  id: string
  totalPoints: number
  level: number            // 1-10のレベル
  completedTrees: number   // 育ち切った木の本数
  lastActivity: Date
}

// 成長ポイントの種類
export type GrowthAction = 'project_added' | 'status_updated' | 'project_completed'

// 成長ポイント値
export const GROWTH_POINTS: Record<GrowthAction, number> = {
  project_added: 10,
  status_updated: 5,
  project_completed: 20,
}

// バオバブレベル閾値
export const BAOBAB_LEVELS = [
  { level: 1, points: 0, name: '種', description: 'まだ芽吹いていない' },
  { level: 2, points: 50, name: '芽', description: '小さな芽が出た' },
  { level: 3, points: 150, name: '小さな苗', description: '葉が生え始めた' },
  { level: 4, points: 300, name: '若木', description: '幹が太くなってきた' },
  { level: 5, points: 500, name: '成長中の木', description: '枝が広がり始めた' },
  { level: 6, points: 800, name: '中木', description: '立派な木になった' },
  { level: 7, points: 1200, name: '大木', description: '堂々とした姿' },
  { level: 8, points: 1800, name: '巨木', description: '圧倒的な存在感' },
  { level: 9, points: 2500, name: '古木', description: '長い年月を感じる' },
  { level: 10, points: 3500, name: '伝説のバオバブ', description: '最高の状態' },
]

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

// 国名データ (主要国)
export const COUNTRY_NAMES: Record<string, string> = {
  JP: '日本',
  US: 'アメリカ',
  CN: '中国',
  GB: 'イギリス',
  DE: 'ドイツ',
  FR: 'フランス',
  IT: 'イタリア',
  ES: 'スペイン',
  CA: 'カナダ',
  AU: 'オーストラリア',
  KR: '韓国',
  IN: 'インド',
  BR: 'ブラジル',
  MX: 'メキシコ',
  RU: 'ロシア',
  ZA: '南アフリカ',
  EG: 'エジプト',
  NG: 'ナイジェリア',
  KE: 'ケニア',
  TH: 'タイ',
  VN: 'ベトナム',
  ID: 'インドネシア',
  PH: 'フィリピン',
  SG: 'シンガポール',
  MY: 'マレーシア',
  NZ: 'ニュージーランド',
  AR: 'アルゼンチン',
  CL: 'チリ',
  CO: 'コロンビア',
  PE: 'ペルー',
  SE: 'スウェーデン',
  NO: 'ノルウェー',
  FI: 'フィンランド',
  DK: 'デンマーク',
  NL: 'オランダ',
  BE: 'ベルギー',
  CH: 'スイス',
  AT: 'オーストリア',
  PL: 'ポーランド',
  CZ: 'チェコ',
  PT: 'ポルトガル',
  GR: 'ギリシャ',
  TR: 'トルコ',
  SA: 'サウジアラビア',
  AE: 'アラブ首長国連邦',
  IL: 'イスラエル',
  PK: 'パキスタン',
  BD: 'バングラデシュ',
  MM: 'ミャンマー',
  TW: '台湾',
  HK: '香港',
}
