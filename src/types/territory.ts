// Territory Vision Types

export interface City {
  id: number
  nameEn: string
  nameJa: string
  countryEn: string
  countryJa: string
  lat: number
  lng: number
  metroArea: number // km²
  population?: number // 人口
  isFromApi?: boolean
}

export interface Empire {
  name: string
  area: number
  year: string
  flag: string
}

export const EMPIRES_TOP3: Record<string, Empire> = {
  british: { name: 'イギリス帝国', area: 35500000, year: '1920年', flag: '🇬🇧' },
  mongol: { name: 'モンゴル帝国', area: 24000000, year: '1270年', flag: '🏴' },
  japanese: { name: '大日本帝国', area: 7400000, year: '1942年', flag: '🇯🇵' },
}

// 国コードから都市を検索するためのマッピング
export const COUNTRY_CODE_MAP: Record<string, string> = {
  JP: 'Japan', US: 'USA', GB: 'UK', FR: 'France', CN: 'China', SG: 'Singapore',
  AE: 'UAE', AU: 'Australia', DE: 'Germany', RU: 'Russia', KR: 'South Korea',
  IN: 'India', BR: 'Brazil', HK: 'Hong Kong', TH: 'Thailand', ID: 'Indonesia',
  TR: 'Turkey', MX: 'Mexico', CA: 'Canada', IT: 'Italy', ES: 'Spain',
  NL: 'Netherlands', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  PL: 'Poland', CH: 'Switzerland', AT: 'Austria', BE: 'Belgium', PT: 'Portugal',
  GR: 'Greece', CZ: 'Czech Republic', IE: 'Ireland', NZ: 'New Zealand',
  VN: 'Vietnam', PH: 'Philippines', MY: 'Malaysia', TW: 'Taiwan',
  SA: 'Saudi Arabia', EG: 'Egypt', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya',
  AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru',
  PK: 'Pakistan', BD: 'Bangladesh', IL: 'Israel', UA: 'Ukraine',
  QA: 'Qatar', KW: 'Kuwait', MA: 'Morocco', GH: 'Ghana', ET: 'Ethiopia',
  MM: 'Myanmar', KH: 'Cambodia', LA: 'Laos', NP: 'Nepal', LK: 'Sri Lanka',
  FJ: 'Fiji', PG: 'Papua New Guinea', MN: 'Mongolia',
}

export const WORLD_CITIES: Omit<City, 'id'>[] = [
  // 日本
  { nameEn: 'Tokyo', nameJa: '東京', countryEn: 'Japan', countryJa: '日本', lat: 35.6762, lng: 139.6503, metroArea: 13572 },
  { nameEn: 'Osaka', nameJa: '大阪', countryEn: 'Japan', countryJa: '日本', lat: 34.6937, lng: 135.5023, metroArea: 3725 },
  // アメリカ
  { nameEn: 'New York', nameJa: 'ニューヨーク', countryEn: 'USA', countryJa: 'アメリカ', lat: 40.7128, lng: -74.0060, metroArea: 34490 },
  { nameEn: 'San Francisco', nameJa: 'サンフランシスコ', countryEn: 'USA', countryJa: 'アメリカ', lat: 37.7749, lng: -122.4194, metroArea: 18040 },
  { nameEn: 'Los Angeles', nameJa: 'ロサンゼルス', countryEn: 'USA', countryJa: 'アメリカ', lat: 34.0522, lng: -118.2437, metroArea: 12750 },
  // ヨーロッパ
  { nameEn: 'London', nameJa: 'ロンドン', countryEn: 'UK', countryJa: 'イギリス', lat: 51.5074, lng: -0.1278, metroArea: 8382 },
  { nameEn: 'Paris', nameJa: 'パリ', countryEn: 'France', countryJa: 'フランス', lat: 48.8566, lng: 2.3522, metroArea: 17174 },
  { nameEn: 'Berlin', nameJa: 'ベルリン', countryEn: 'Germany', countryJa: 'ドイツ', lat: 52.5200, lng: 13.4050, metroArea: 30546 },
  { nameEn: 'Rome', nameJa: 'ローマ', countryEn: 'Italy', countryJa: 'イタリア', lat: 41.9028, lng: 12.4964, metroArea: 5352 },
  { nameEn: 'Madrid', nameJa: 'マドリード', countryEn: 'Spain', countryJa: 'スペイン', lat: 40.4168, lng: -3.7038, metroArea: 6042 },
  { nameEn: 'Amsterdam', nameJa: 'アムステルダム', countryEn: 'Netherlands', countryJa: 'オランダ', lat: 52.3676, lng: 4.9041, metroArea: 2580 },
  { nameEn: 'Stockholm', nameJa: 'ストックホルム', countryEn: 'Sweden', countryJa: 'スウェーデン', lat: 59.3293, lng: 18.0686, metroArea: 6519 },
  { nameEn: 'Oslo', nameJa: 'オスロ', countryEn: 'Norway', countryJa: 'ノルウェー', lat: 59.9139, lng: 10.7522, metroArea: 5378 },
  { nameEn: 'Copenhagen', nameJa: 'コペンハーゲン', countryEn: 'Denmark', countryJa: 'デンマーク', lat: 55.6761, lng: 12.5683, metroArea: 2057 },
  { nameEn: 'Helsinki', nameJa: 'ヘルシンキ', countryEn: 'Finland', countryJa: 'フィンランド', lat: 60.1699, lng: 24.9384, metroArea: 1530 },
  { nameEn: 'Warsaw', nameJa: 'ワルシャワ', countryEn: 'Poland', countryJa: 'ポーランド', lat: 52.2297, lng: 21.0122, metroArea: 6100 },
  { nameEn: 'Zurich', nameJa: 'チューリッヒ', countryEn: 'Switzerland', countryJa: 'スイス', lat: 47.3769, lng: 8.5417, metroArea: 1729 },
  { nameEn: 'Vienna', nameJa: 'ウィーン', countryEn: 'Austria', countryJa: 'オーストリア', lat: 48.2082, lng: 16.3738, metroArea: 2675 },
  { nameEn: 'Brussels', nameJa: 'ブリュッセル', countryEn: 'Belgium', countryJa: 'ベルギー', lat: 50.8503, lng: 4.3517, metroArea: 2120 },
  { nameEn: 'Lisbon', nameJa: 'リスボン', countryEn: 'Portugal', countryJa: 'ポルトガル', lat: 38.7223, lng: -9.1393, metroArea: 3035 },
  { nameEn: 'Athens', nameJa: 'アテネ', countryEn: 'Greece', countryJa: 'ギリシャ', lat: 37.9838, lng: 23.7275, metroArea: 2925 },
  { nameEn: 'Prague', nameJa: 'プラハ', countryEn: 'Czech Republic', countryJa: 'チェコ', lat: 50.0755, lng: 14.4378, metroArea: 498 },
  { nameEn: 'Dublin', nameJa: 'ダブリン', countryEn: 'Ireland', countryJa: 'アイルランド', lat: 53.3498, lng: -6.2603, metroArea: 7390 },
  { nameEn: 'Moscow', nameJa: 'モスクワ', countryEn: 'Russia', countryJa: 'ロシア', lat: 55.7558, lng: 37.6173, metroArea: 5891 },
  { nameEn: 'Kyiv', nameJa: 'キーウ', countryEn: 'Ukraine', countryJa: 'ウクライナ', lat: 50.4501, lng: 30.5234, metroArea: 2951 },
  // アジア
  { nameEn: 'Beijing', nameJa: '北京', countryEn: 'China', countryJa: '中国', lat: 39.9042, lng: 116.4074, metroArea: 16411 },
  { nameEn: 'Shanghai', nameJa: '上海', countryEn: 'China', countryJa: '中国', lat: 31.2304, lng: 121.4737, metroArea: 6341 },
  { nameEn: 'Hong Kong', nameJa: '香港', countryEn: 'Hong Kong', countryJa: '香港', lat: 22.3193, lng: 114.1694, metroArea: 2755 },
  { nameEn: 'Taipei', nameJa: '台北', countryEn: 'Taiwan', countryJa: '台湾', lat: 25.0330, lng: 121.5654, metroArea: 2704 },
  { nameEn: 'Seoul', nameJa: 'ソウル', countryEn: 'South Korea', countryJa: '韓国', lat: 37.5665, lng: 126.9780, metroArea: 11730 },
  { nameEn: 'Singapore', nameJa: 'シンガポール', countryEn: 'Singapore', countryJa: 'シンガポール', lat: 1.3521, lng: 103.8198, metroArea: 728 },
  { nameEn: 'Bangkok', nameJa: 'バンコク', countryEn: 'Thailand', countryJa: 'タイ', lat: 13.7563, lng: 100.5018, metroArea: 7762 },
  { nameEn: 'Ho Chi Minh City', nameJa: 'ホーチミン', countryEn: 'Vietnam', countryJa: 'ベトナム', lat: 10.8231, lng: 106.6297, metroArea: 2095 },
  { nameEn: 'Manila', nameJa: 'マニラ', countryEn: 'Philippines', countryJa: 'フィリピン', lat: 14.5995, lng: 120.9842, metroArea: 1580 },
  { nameEn: 'Kuala Lumpur', nameJa: 'クアラルンプール', countryEn: 'Malaysia', countryJa: 'マレーシア', lat: 3.1390, lng: 101.6869, metroArea: 2720 },
  { nameEn: 'Jakarta', nameJa: 'ジャカルタ', countryEn: 'Indonesia', countryJa: 'インドネシア', lat: -6.2088, lng: 106.8456, metroArea: 6392 },
  { nameEn: 'Mumbai', nameJa: 'ムンバイ', countryEn: 'India', countryJa: 'インド', lat: 19.0760, lng: 72.8777, metroArea: 6355 },
  { nameEn: 'Yangon', nameJa: 'ヤンゴン', countryEn: 'Myanmar', countryJa: 'ミャンマー', lat: 16.8661, lng: 96.1951, metroArea: 2130 },
  { nameEn: 'Phnom Penh', nameJa: 'プノンペン', countryEn: 'Cambodia', countryJa: 'カンボジア', lat: 11.5564, lng: 104.9282, metroArea: 679 },
  { nameEn: 'Vientiane', nameJa: 'ビエンチャン', countryEn: 'Laos', countryJa: 'ラオス', lat: 17.9757, lng: 102.6331, metroArea: 820 },
  { nameEn: 'Kathmandu', nameJa: 'カトマンズ', countryEn: 'Nepal', countryJa: 'ネパール', lat: 27.7172, lng: 85.3240, metroArea: 395 },
  { nameEn: 'Colombo', nameJa: 'コロンボ', countryEn: 'Sri Lanka', countryJa: 'スリランカ', lat: 6.9271, lng: 79.8612, metroArea: 699 },
  { nameEn: 'Karachi', nameJa: 'カラチ', countryEn: 'Pakistan', countryJa: 'パキスタン', lat: 24.8607, lng: 67.0011, metroArea: 3780 },
  { nameEn: 'Dhaka', nameJa: 'ダッカ', countryEn: 'Bangladesh', countryJa: 'バングラデシュ', lat: 23.8103, lng: 90.4125, metroArea: 2160 },
  { nameEn: 'Ulaanbaatar', nameJa: 'ウランバートル', countryEn: 'Mongolia', countryJa: 'モンゴル', lat: 47.8864, lng: 106.9057, metroArea: 4700 },
  // 中東
  { nameEn: 'Dubai', nameJa: 'ドバイ', countryEn: 'UAE', countryJa: 'アラブ首長国連邦', lat: 25.2048, lng: 55.2708, metroArea: 4114 },
  { nameEn: 'Istanbul', nameJa: 'イスタンブール', countryEn: 'Turkey', countryJa: 'トルコ', lat: 41.0082, lng: 28.9784, metroArea: 5461 },
  { nameEn: 'Tel Aviv', nameJa: 'テルアビブ', countryEn: 'Israel', countryJa: 'イスラエル', lat: 32.0853, lng: 34.7818, metroArea: 1516 },
  { nameEn: 'Riyadh', nameJa: 'リヤド', countryEn: 'Saudi Arabia', countryJa: 'サウジアラビア', lat: 24.7136, lng: 46.6753, metroArea: 3115 },
  { nameEn: 'Doha', nameJa: 'ドーハ', countryEn: 'Qatar', countryJa: 'カタール', lat: 25.2854, lng: 51.5310, metroArea: 132 },
  { nameEn: 'Kuwait City', nameJa: 'クウェート', countryEn: 'Kuwait', countryJa: 'クウェート', lat: 29.3759, lng: 47.9774, metroArea: 2403 },
  // アフリカ
  { nameEn: 'Cairo', nameJa: 'カイロ', countryEn: 'Egypt', countryJa: 'エジプト', lat: 30.0444, lng: 31.2357, metroArea: 3085 },
  { nameEn: 'Johannesburg', nameJa: 'ヨハネスブルグ', countryEn: 'South Africa', countryJa: '南アフリカ', lat: -26.2041, lng: 28.0473, metroArea: 6642 },
  { nameEn: 'Lagos', nameJa: 'ラゴス', countryEn: 'Nigeria', countryJa: 'ナイジェリア', lat: 6.5244, lng: 3.3792, metroArea: 1171 },
  { nameEn: 'Nairobi', nameJa: 'ナイロビ', countryEn: 'Kenya', countryJa: 'ケニア', lat: -1.2921, lng: 36.8219, metroArea: 696 },
  { nameEn: 'Casablanca', nameJa: 'カサブランカ', countryEn: 'Morocco', countryJa: 'モロッコ', lat: 33.5731, lng: -7.5898, metroArea: 1615 },
  { nameEn: 'Accra', nameJa: 'アクラ', countryEn: 'Ghana', countryJa: 'ガーナ', lat: 5.6037, lng: -0.1870, metroArea: 2560 },
  { nameEn: 'Addis Ababa', nameJa: 'アディスアベバ', countryEn: 'Ethiopia', countryJa: 'エチオピア', lat: 9.0320, lng: 38.7492, metroArea: 527 },
  // オセアニア
  { nameEn: 'Sydney', nameJa: 'シドニー', countryEn: 'Australia', countryJa: 'オーストラリア', lat: -33.8688, lng: 151.2093, metroArea: 12368 },
  { nameEn: 'Auckland', nameJa: 'オークランド', countryEn: 'New Zealand', countryJa: 'ニュージーランド', lat: -36.8509, lng: 174.7645, metroArea: 4894 },
  { nameEn: 'Suva', nameJa: 'スバ', countryEn: 'Fiji', countryJa: 'フィジー', lat: -18.1416, lng: 178.4419, metroArea: 330 },
  { nameEn: 'Port Moresby', nameJa: 'ポートモレスビー', countryEn: 'Papua New Guinea', countryJa: 'パプアニューギニア', lat: -9.4438, lng: 147.1803, metroArea: 364 },
  // 北米
  { nameEn: 'Toronto', nameJa: 'トロント', countryEn: 'Canada', countryJa: 'カナダ', lat: 43.6532, lng: -79.3832, metroArea: 5903 },
  { nameEn: 'Vancouver', nameJa: 'バンクーバー', countryEn: 'Canada', countryJa: 'カナダ', lat: 49.2827, lng: -123.1207, metroArea: 2463 },
  { nameEn: 'Mexico City', nameJa: 'メキシコシティ', countryEn: 'Mexico', countryJa: 'メキシコ', lat: 19.4326, lng: -99.1332, metroArea: 7954 },
  // 南米
  { nameEn: 'São Paulo', nameJa: 'サンパウロ', countryEn: 'Brazil', countryJa: 'ブラジル', lat: -23.5505, lng: -46.6333, metroArea: 7947 },
  { nameEn: 'Buenos Aires', nameJa: 'ブエノスアイレス', countryEn: 'Argentina', countryJa: 'アルゼンチン', lat: -34.6037, lng: -58.3816, metroArea: 4758 },
  { nameEn: 'Santiago', nameJa: 'サンティアゴ', countryEn: 'Chile', countryJa: 'チリ', lat: -33.4489, lng: -70.6693, metroArea: 2105 },
  { nameEn: 'Bogotá', nameJa: 'ボゴタ', countryEn: 'Colombia', countryJa: 'コロンビア', lat: 4.7110, lng: -74.0721, metroArea: 1775 },
  { nameEn: 'Lima', nameJa: 'リマ', countryEn: 'Peru', countryJa: 'ペルー', lat: -12.0464, lng: -77.0428, metroArea: 2819 },
]

// 国コードから都市を取得
export function getCitiesByCountryCode(countryCode: string): Omit<City, 'id'>[] {
  const countryName = COUNTRY_CODE_MAP[countryCode]
  if (!countryName) return []
  return WORLD_CITIES.filter(city => city.countryEn === countryName)
}

// 国の面積データ（km²）、人口データ、首都座標
export const COUNTRY_DATA: Record<string, { area: number; population: number; lat: number; lng: number; capital: string }> = {
  JP: { area: 377975, population: 125000000, lat: 35.6762, lng: 139.6503, capital: '東京' },
  US: { area: 9833520, population: 331000000, lat: 38.9072, lng: -77.0369, capital: 'ワシントンD.C.' },
  GB: { area: 242495, population: 67000000, lat: 51.5074, lng: -0.1278, capital: 'ロンドン' },
  FR: { area: 643801, population: 67000000, lat: 48.8566, lng: 2.3522, capital: 'パリ' },
  CN: { area: 9596961, population: 1410000000, lat: 39.9042, lng: 116.4074, capital: '北京' },
  SG: { area: 728, population: 5600000, lat: 1.3521, lng: 103.8198, capital: 'シンガポール' },
  AE: { area: 83600, population: 10000000, lat: 24.4539, lng: 54.3773, capital: 'アブダビ' },
  AU: { area: 7692024, population: 26000000, lat: -35.2809, lng: 149.1300, capital: 'キャンベラ' },
  DE: { area: 357114, population: 83000000, lat: 52.5200, lng: 13.4050, capital: 'ベルリン' },
  RU: { area: 17098242, population: 144000000, lat: 55.7558, lng: 37.6173, capital: 'モスクワ' },
  KR: { area: 100210, population: 52000000, lat: 37.5665, lng: 126.9780, capital: 'ソウル' },
  IN: { area: 3287263, population: 1400000000, lat: 28.6139, lng: 77.2090, capital: 'ニューデリー' },
  BR: { area: 8515767, population: 215000000, lat: -15.7975, lng: -47.8919, capital: 'ブラジリア' },
  HK: { area: 2755, population: 7500000, lat: 22.3193, lng: 114.1694, capital: '香港' },
  TH: { area: 513120, population: 70000000, lat: 13.7563, lng: 100.5018, capital: 'バンコク' },
  ID: { area: 1904569, population: 275000000, lat: -6.2088, lng: 106.8456, capital: 'ジャカルタ' },
  TR: { area: 783562, population: 85000000, lat: 39.9334, lng: 32.8597, capital: 'アンカラ' },
  MX: { area: 1964375, population: 130000000, lat: 19.4326, lng: -99.1332, capital: 'メキシコシティ' },
  CA: { area: 9984670, population: 38000000, lat: 45.4215, lng: -75.6972, capital: 'オタワ' },
  IT: { area: 301340, population: 60000000, lat: 41.9028, lng: 12.4964, capital: 'ローマ' },
  ES: { area: 505990, population: 47000000, lat: 40.4168, lng: -3.7038, capital: 'マドリード' },
  NL: { area: 41543, population: 17000000, lat: 52.3676, lng: 4.9041, capital: 'アムステルダム' },
  SE: { area: 450295, population: 10000000, lat: 59.3293, lng: 18.0686, capital: 'ストックホルム' },
  NO: { area: 385207, population: 5400000, lat: 59.9139, lng: 10.7522, capital: 'オスロ' },
  DK: { area: 42933, population: 5800000, lat: 55.6761, lng: 12.5683, capital: 'コペンハーゲン' },
  FI: { area: 338424, population: 5500000, lat: 60.1699, lng: 24.9384, capital: 'ヘルシンキ' },
  PL: { area: 312696, population: 38000000, lat: 52.2297, lng: 21.0122, capital: 'ワルシャワ' },
  CH: { area: 41285, population: 8700000, lat: 46.9480, lng: 7.4474, capital: 'ベルン' },
  AT: { area: 83879, population: 9000000, lat: 48.2082, lng: 16.3738, capital: 'ウィーン' },
  BE: { area: 30528, population: 11500000, lat: 50.8503, lng: 4.3517, capital: 'ブリュッセル' },
  PT: { area: 92212, population: 10000000, lat: 38.7223, lng: -9.1393, capital: 'リスボン' },
  GR: { area: 131957, population: 10000000, lat: 37.9838, lng: 23.7275, capital: 'アテネ' },
  CZ: { area: 78867, population: 10500000, lat: 50.0755, lng: 14.4378, capital: 'プラハ' },
  IE: { area: 70273, population: 5000000, lat: 53.3498, lng: -6.2603, capital: 'ダブリン' },
  NZ: { area: 268021, population: 5000000, lat: -41.2865, lng: 174.7762, capital: 'ウェリントン' },
  VN: { area: 331212, population: 97000000, lat: 21.0285, lng: 105.8542, capital: 'ハノイ' },
  PH: { area: 300000, population: 110000000, lat: 14.5995, lng: 120.9842, capital: 'マニラ' },
  MY: { area: 330803, population: 32000000, lat: 3.1390, lng: 101.6869, capital: 'クアラルンプール' },
  TW: { area: 36193, population: 24000000, lat: 25.0330, lng: 121.5654, capital: '台北' },
  SA: { area: 2149690, population: 35000000, lat: 24.7136, lng: 46.6753, capital: 'リヤド' },
  EG: { area: 1002450, population: 100000000, lat: 30.0444, lng: 31.2357, capital: 'カイロ' },
  ZA: { area: 1221037, population: 60000000, lat: -25.7479, lng: 28.2293, capital: 'プレトリア' },
  NG: { area: 923768, population: 210000000, lat: 9.0765, lng: 7.3986, capital: 'アブジャ' },
  KE: { area: 580367, population: 54000000, lat: -1.2921, lng: 36.8219, capital: 'ナイロビ' },
  AR: { area: 2780400, population: 45000000, lat: -34.6037, lng: -58.3816, capital: 'ブエノスアイレス' },
  CL: { area: 756102, population: 19000000, lat: -33.4489, lng: -70.6693, capital: 'サンティアゴ' },
  CO: { area: 1141748, population: 51000000, lat: 4.7110, lng: -74.0721, capital: 'ボゴタ' },
  PE: { area: 1285216, population: 33000000, lat: -12.0464, lng: -77.0428, capital: 'リマ' },
  PK: { area: 881912, population: 220000000, lat: 33.6844, lng: 73.0479, capital: 'イスラマバード' },
  BD: { area: 147570, population: 170000000, lat: 23.8103, lng: 90.4125, capital: 'ダッカ' },
  IL: { area: 22072, population: 9300000, lat: 31.7683, lng: 35.2137, capital: 'エルサレム' },
  UA: { area: 603550, population: 44000000, lat: 50.4501, lng: 30.5234, capital: 'キーウ' },
  QA: { area: 11586, population: 2900000, lat: 25.2854, lng: 51.5310, capital: 'ドーハ' },
  KW: { area: 17818, population: 4300000, lat: 29.3759, lng: 47.9774, capital: 'クウェート' },
  MA: { area: 446550, population: 37000000, lat: 34.0209, lng: -6.8416, capital: 'ラバト' },
  GH: { area: 238533, population: 31000000, lat: 5.6037, lng: -0.1870, capital: 'アクラ' },
  ET: { area: 1104300, population: 120000000, lat: 9.0320, lng: 38.7492, capital: 'アディスアベバ' },
  MM: { area: 676578, population: 54000000, lat: 19.7633, lng: 96.0785, capital: 'ネピドー' },
  KH: { area: 181035, population: 17000000, lat: 11.5564, lng: 104.9282, capital: 'プノンペン' },
  LA: { area: 236800, population: 7300000, lat: 17.9757, lng: 102.6331, capital: 'ビエンチャン' },
  NP: { area: 147516, population: 30000000, lat: 27.7172, lng: 85.3240, capital: 'カトマンズ' },
  LK: { area: 65610, population: 22000000, lat: 6.9271, lng: 79.8612, capital: 'コロンボ' },
  FJ: { area: 18274, population: 900000, lat: -18.1416, lng: 178.4419, capital: 'スバ' },
  PG: { area: 462840, population: 9000000, lat: -9.4438, lng: 147.1803, capital: 'ポートモレスビー' },
  MN: { area: 1564116, population: 3300000, lat: 47.8864, lng: 106.9057, capital: 'ウランバートル' },
}

// 後方互換性のため
export const COUNTRY_AREAS: Record<string, number> = Object.fromEntries(
  Object.entries(COUNTRY_DATA).map(([k, v]) => [k, v.area])
)

// 国コードから国データを取得（領土追加用）
export function getCountryAsTerritory(countryCode: string, countryName: string): Omit<City, 'id'> | null {
  const countryData = COUNTRY_DATA[countryCode]
  if (!countryData) return null

  // COUNTRY_DATAから直接座標を取得
  return {
    nameEn: countryCode,
    nameJa: countryName,
    countryEn: countryCode,
    countryJa: countryName,
    lat: countryData.lat,
    lng: countryData.lng,
    metroArea: countryData.area,
    population: countryData.population,
  }
}

// Helper to get display name
export function getCityDisplayName(city: Pick<City, 'nameEn' | 'nameJa'>): string {
  return `${city.nameEn} / ${city.nameJa}`
}

export function getCountryDisplayName(city: Pick<City, 'countryEn' | 'countryJa'>): string {
  return `${city.countryJa} (${city.countryEn})`
}
