// プロジェクトステータス
export type ProjectStatus =
  | 'not_started'  // 未着手
  | 'planning'     // 計画中
  | 'in_progress'  // 進行中
  | 'review'       // レビュー中
  | 'completed'    // 完了

// プロジェクト
export interface Project {
  id: string
  countryCode: string      // ISO 3166-1 alpha-2 (例: "JP", "US")
  name: string
  status: ProjectStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// バオバブ成長データ
export interface BaobabGrowth {
  id: string
  totalPoints: number
  level: number            // 1-10のレベル
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
  planning: '#FBBF24',     // yellow-400
  in_progress: '#3B82F6',  // blue-500
  review: '#A855F7',       // purple-500
  completed: '#22C55E',    // green-500
}

// ステータスのラベル
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: '未着手',
  planning: '計画中',
  in_progress: '進行中',
  review: 'レビュー中',
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
