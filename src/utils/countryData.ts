// 英語国名から日本語名とISO_A2コードへのマッピング
// TopoJSONのcountries-110m.jsonはISO_A2を含まないため、
// properties.nameを使用して国を識別する

interface CountryInfo {
  name_ja: string
  iso_a2: string
}

// 英語国名をキーとしたマッピング
export const COUNTRY_DATA: Record<string, CountryInfo> = {
  // アジア
  'Japan': { name_ja: '日本', iso_a2: 'JP' },
  'China': { name_ja: '中国', iso_a2: 'CN' },
  'South Korea': { name_ja: '韓国', iso_a2: 'KR' },
  'North Korea': { name_ja: '北朝鮮', iso_a2: 'KP' },
  'Taiwan': { name_ja: '台湾', iso_a2: 'TW' },
  'Mongolia': { name_ja: 'モンゴル', iso_a2: 'MN' },
  'India': { name_ja: 'インド', iso_a2: 'IN' },
  'Pakistan': { name_ja: 'パキスタン', iso_a2: 'PK' },
  'Bangladesh': { name_ja: 'バングラデシュ', iso_a2: 'BD' },
  'Sri Lanka': { name_ja: 'スリランカ', iso_a2: 'LK' },
  'Nepal': { name_ja: 'ネパール', iso_a2: 'NP' },
  'Bhutan': { name_ja: 'ブータン', iso_a2: 'BT' },
  'Myanmar': { name_ja: 'ミャンマー', iso_a2: 'MM' },
  'Thailand': { name_ja: 'タイ', iso_a2: 'TH' },
  'Vietnam': { name_ja: 'ベトナム', iso_a2: 'VN' },
  'Laos': { name_ja: 'ラオス', iso_a2: 'LA' },
  'Cambodia': { name_ja: 'カンボジア', iso_a2: 'KH' },
  'Malaysia': { name_ja: 'マレーシア', iso_a2: 'MY' },
  'Singapore': { name_ja: 'シンガポール', iso_a2: 'SG' },
  'Indonesia': { name_ja: 'インドネシア', iso_a2: 'ID' },
  'Philippines': { name_ja: 'フィリピン', iso_a2: 'PH' },
  'Brunei': { name_ja: 'ブルネイ', iso_a2: 'BN' },
  'Timor-Leste': { name_ja: '東ティモール', iso_a2: 'TL' },
  'Afghanistan': { name_ja: 'アフガニスタン', iso_a2: 'AF' },

  // 中東
  'Iran': { name_ja: 'イラン', iso_a2: 'IR' },
  'Iraq': { name_ja: 'イラク', iso_a2: 'IQ' },
  'Saudi Arabia': { name_ja: 'サウジアラビア', iso_a2: 'SA' },
  'United Arab Emirates': { name_ja: 'アラブ首長国連邦', iso_a2: 'AE' },
  'Qatar': { name_ja: 'カタール', iso_a2: 'QA' },
  'Kuwait': { name_ja: 'クウェート', iso_a2: 'KW' },
  'Bahrain': { name_ja: 'バーレーン', iso_a2: 'BH' },
  'Oman': { name_ja: 'オマーン', iso_a2: 'OM' },
  'Yemen': { name_ja: 'イエメン', iso_a2: 'YE' },
  'Jordan': { name_ja: 'ヨルダン', iso_a2: 'JO' },
  'Israel': { name_ja: 'イスラエル', iso_a2: 'IL' },
  'Palestine': { name_ja: 'パレスチナ', iso_a2: 'PS' },
  'Lebanon': { name_ja: 'レバノン', iso_a2: 'LB' },
  'Syria': { name_ja: 'シリア', iso_a2: 'SY' },
  'Turkey': { name_ja: 'トルコ', iso_a2: 'TR' },
  'Cyprus': { name_ja: 'キプロス', iso_a2: 'CY' },

  // ヨーロッパ
  'Russia': { name_ja: 'ロシア', iso_a2: 'RU' },
  'United Kingdom': { name_ja: 'イギリス', iso_a2: 'GB' },
  'France': { name_ja: 'フランス', iso_a2: 'FR' },
  'Germany': { name_ja: 'ドイツ', iso_a2: 'DE' },
  'Italy': { name_ja: 'イタリア', iso_a2: 'IT' },
  'Spain': { name_ja: 'スペイン', iso_a2: 'ES' },
  'Portugal': { name_ja: 'ポルトガル', iso_a2: 'PT' },
  'Netherlands': { name_ja: 'オランダ', iso_a2: 'NL' },
  'Belgium': { name_ja: 'ベルギー', iso_a2: 'BE' },
  'Luxembourg': { name_ja: 'ルクセンブルク', iso_a2: 'LU' },
  'Switzerland': { name_ja: 'スイス', iso_a2: 'CH' },
  'Austria': { name_ja: 'オーストリア', iso_a2: 'AT' },
  'Poland': { name_ja: 'ポーランド', iso_a2: 'PL' },
  'Czech Republic': { name_ja: 'チェコ', iso_a2: 'CZ' },
  'Czechia': { name_ja: 'チェコ', iso_a2: 'CZ' },
  'Slovakia': { name_ja: 'スロバキア', iso_a2: 'SK' },
  'Hungary': { name_ja: 'ハンガリー', iso_a2: 'HU' },
  'Romania': { name_ja: 'ルーマニア', iso_a2: 'RO' },
  'Bulgaria': { name_ja: 'ブルガリア', iso_a2: 'BG' },
  'Greece': { name_ja: 'ギリシャ', iso_a2: 'GR' },
  'Croatia': { name_ja: 'クロアチア', iso_a2: 'HR' },
  'Slovenia': { name_ja: 'スロベニア', iso_a2: 'SI' },
  'Serbia': { name_ja: 'セルビア', iso_a2: 'RS' },
  'Bosnia and Herzegovina': { name_ja: 'ボスニア・ヘルツェゴビナ', iso_a2: 'BA' },
  'Bosnia and Herz.': { name_ja: 'ボスニア・ヘルツェゴビナ', iso_a2: 'BA' },
  'Montenegro': { name_ja: 'モンテネグロ', iso_a2: 'ME' },
  'North Macedonia': { name_ja: '北マケドニア', iso_a2: 'MK' },
  'Macedonia': { name_ja: '北マケドニア', iso_a2: 'MK' },
  'Albania': { name_ja: 'アルバニア', iso_a2: 'AL' },
  'Kosovo': { name_ja: 'コソボ', iso_a2: 'XK' },
  'Ukraine': { name_ja: 'ウクライナ', iso_a2: 'UA' },
  'Belarus': { name_ja: 'ベラルーシ', iso_a2: 'BY' },
  'Moldova': { name_ja: 'モルドバ', iso_a2: 'MD' },
  'Lithuania': { name_ja: 'リトアニア', iso_a2: 'LT' },
  'Latvia': { name_ja: 'ラトビア', iso_a2: 'LV' },
  'Estonia': { name_ja: 'エストニア', iso_a2: 'EE' },
  'Finland': { name_ja: 'フィンランド', iso_a2: 'FI' },
  'Sweden': { name_ja: 'スウェーデン', iso_a2: 'SE' },
  'Norway': { name_ja: 'ノルウェー', iso_a2: 'NO' },
  'Denmark': { name_ja: 'デンマーク', iso_a2: 'DK' },
  'Iceland': { name_ja: 'アイスランド', iso_a2: 'IS' },
  'Ireland': { name_ja: 'アイルランド', iso_a2: 'IE' },
  'Georgia': { name_ja: 'ジョージア', iso_a2: 'GE' },
  'Armenia': { name_ja: 'アルメニア', iso_a2: 'AM' },
  'Azerbaijan': { name_ja: 'アゼルバイジャン', iso_a2: 'AZ' },

  // 中央アジア
  'Kazakhstan': { name_ja: 'カザフスタン', iso_a2: 'KZ' },
  'Uzbekistan': { name_ja: 'ウズベキスタン', iso_a2: 'UZ' },
  'Turkmenistan': { name_ja: 'トルクメニスタン', iso_a2: 'TM' },
  'Tajikistan': { name_ja: 'タジキスタン', iso_a2: 'TJ' },
  'Kyrgyzstan': { name_ja: 'キルギス', iso_a2: 'KG' },

  // アフリカ
  'Egypt': { name_ja: 'エジプト', iso_a2: 'EG' },
  'Libya': { name_ja: 'リビア', iso_a2: 'LY' },
  'Tunisia': { name_ja: 'チュニジア', iso_a2: 'TN' },
  'Algeria': { name_ja: 'アルジェリア', iso_a2: 'DZ' },
  'Morocco': { name_ja: 'モロッコ', iso_a2: 'MA' },
  'Western Sahara': { name_ja: '西サハラ', iso_a2: 'EH' },
  'W. Sahara': { name_ja: '西サハラ', iso_a2: 'EH' },
  'Mauritania': { name_ja: 'モーリタニア', iso_a2: 'MR' },
  'Mali': { name_ja: 'マリ', iso_a2: 'ML' },
  'Niger': { name_ja: 'ニジェール', iso_a2: 'NE' },
  'Chad': { name_ja: 'チャド', iso_a2: 'TD' },
  'Sudan': { name_ja: 'スーダン', iso_a2: 'SD' },
  'South Sudan': { name_ja: '南スーダン', iso_a2: 'SS' },
  'S. Sudan': { name_ja: '南スーダン', iso_a2: 'SS' },
  'Ethiopia': { name_ja: 'エチオピア', iso_a2: 'ET' },
  'Eritrea': { name_ja: 'エリトリア', iso_a2: 'ER' },
  'Djibouti': { name_ja: 'ジブチ', iso_a2: 'DJ' },
  'Somalia': { name_ja: 'ソマリア', iso_a2: 'SO' },
  'Somaliland': { name_ja: 'ソマリランド', iso_a2: 'SO' },
  'Kenya': { name_ja: 'ケニア', iso_a2: 'KE' },
  'Uganda': { name_ja: 'ウガンダ', iso_a2: 'UG' },
  'Tanzania': { name_ja: 'タンザニア', iso_a2: 'TZ' },
  'Rwanda': { name_ja: 'ルワンダ', iso_a2: 'RW' },
  'Burundi': { name_ja: 'ブルンジ', iso_a2: 'BI' },
  'Democratic Republic of the Congo': { name_ja: 'コンゴ民主共和国', iso_a2: 'CD' },
  'Dem. Rep. Congo': { name_ja: 'コンゴ民主共和国', iso_a2: 'CD' },
  'Congo': { name_ja: 'コンゴ共和国', iso_a2: 'CG' },
  'Central African Republic': { name_ja: '中央アフリカ', iso_a2: 'CF' },
  'Central African Rep.': { name_ja: '中央アフリカ', iso_a2: 'CF' },
  'Cameroon': { name_ja: 'カメルーン', iso_a2: 'CM' },
  'Nigeria': { name_ja: 'ナイジェリア', iso_a2: 'NG' },
  'Benin': { name_ja: 'ベナン', iso_a2: 'BJ' },
  'Togo': { name_ja: 'トーゴ', iso_a2: 'TG' },
  'Ghana': { name_ja: 'ガーナ', iso_a2: 'GH' },
  "Côte d'Ivoire": { name_ja: 'コートジボワール', iso_a2: 'CI' },
  "Ivory Coast": { name_ja: 'コートジボワール', iso_a2: 'CI' },
  'Burkina Faso': { name_ja: 'ブルキナファソ', iso_a2: 'BF' },
  'Liberia': { name_ja: 'リベリア', iso_a2: 'LR' },
  'Sierra Leone': { name_ja: 'シエラレオネ', iso_a2: 'SL' },
  'Guinea': { name_ja: 'ギニア', iso_a2: 'GN' },
  'Guinea-Bissau': { name_ja: 'ギニアビサウ', iso_a2: 'GW' },
  'Senegal': { name_ja: 'セネガル', iso_a2: 'SN' },
  'Gambia': { name_ja: 'ガンビア', iso_a2: 'GM' },
  'The Gambia': { name_ja: 'ガンビア', iso_a2: 'GM' },
  'Gabon': { name_ja: 'ガボン', iso_a2: 'GA' },
  'Equatorial Guinea': { name_ja: '赤道ギニア', iso_a2: 'GQ' },
  'Eq. Guinea': { name_ja: '赤道ギニア', iso_a2: 'GQ' },
  'Angola': { name_ja: 'アンゴラ', iso_a2: 'AO' },
  'Zambia': { name_ja: 'ザンビア', iso_a2: 'ZM' },
  'Zimbabwe': { name_ja: 'ジンバブエ', iso_a2: 'ZW' },
  'Mozambique': { name_ja: 'モザンビーク', iso_a2: 'MZ' },
  'Malawi': { name_ja: 'マラウイ', iso_a2: 'MW' },
  'Botswana': { name_ja: 'ボツワナ', iso_a2: 'BW' },
  'Namibia': { name_ja: 'ナミビア', iso_a2: 'NA' },
  'South Africa': { name_ja: '南アフリカ', iso_a2: 'ZA' },
  'Lesotho': { name_ja: 'レソト', iso_a2: 'LS' },
  'Eswatini': { name_ja: 'エスワティニ', iso_a2: 'SZ' },
  'Swaziland': { name_ja: 'エスワティニ', iso_a2: 'SZ' },
  'Madagascar': { name_ja: 'マダガスカル', iso_a2: 'MG' },

  // 北米
  'United States of America': { name_ja: 'アメリカ', iso_a2: 'US' },
  'United States': { name_ja: 'アメリカ', iso_a2: 'US' },
  'Canada': { name_ja: 'カナダ', iso_a2: 'CA' },
  'Mexico': { name_ja: 'メキシコ', iso_a2: 'MX' },
  'Guatemala': { name_ja: 'グアテマラ', iso_a2: 'GT' },
  'Belize': { name_ja: 'ベリーズ', iso_a2: 'BZ' },
  'Honduras': { name_ja: 'ホンジュラス', iso_a2: 'HN' },
  'El Salvador': { name_ja: 'エルサルバドル', iso_a2: 'SV' },
  'Nicaragua': { name_ja: 'ニカラグア', iso_a2: 'NI' },
  'Costa Rica': { name_ja: 'コスタリカ', iso_a2: 'CR' },
  'Panama': { name_ja: 'パナマ', iso_a2: 'PA' },
  'Cuba': { name_ja: 'キューバ', iso_a2: 'CU' },
  'Jamaica': { name_ja: 'ジャマイカ', iso_a2: 'JM' },
  'Haiti': { name_ja: 'ハイチ', iso_a2: 'HT' },
  'Dominican Republic': { name_ja: 'ドミニカ共和国', iso_a2: 'DO' },
  'Dominican Rep.': { name_ja: 'ドミニカ共和国', iso_a2: 'DO' },
  'Puerto Rico': { name_ja: 'プエルトリコ', iso_a2: 'PR' },
  'Trinidad and Tobago': { name_ja: 'トリニダード・トバゴ', iso_a2: 'TT' },
  'Bahamas': { name_ja: 'バハマ', iso_a2: 'BS' },
  'The Bahamas': { name_ja: 'バハマ', iso_a2: 'BS' },
  'Greenland': { name_ja: 'グリーンランド', iso_a2: 'GL' },

  // 南米
  'Brazil': { name_ja: 'ブラジル', iso_a2: 'BR' },
  'Argentina': { name_ja: 'アルゼンチン', iso_a2: 'AR' },
  'Chile': { name_ja: 'チリ', iso_a2: 'CL' },
  'Peru': { name_ja: 'ペルー', iso_a2: 'PE' },
  'Colombia': { name_ja: 'コロンビア', iso_a2: 'CO' },
  'Venezuela': { name_ja: 'ベネズエラ', iso_a2: 'VE' },
  'Ecuador': { name_ja: 'エクアドル', iso_a2: 'EC' },
  'Bolivia': { name_ja: 'ボリビア', iso_a2: 'BO' },
  'Paraguay': { name_ja: 'パラグアイ', iso_a2: 'PY' },
  'Uruguay': { name_ja: 'ウルグアイ', iso_a2: 'UY' },
  'Guyana': { name_ja: 'ガイアナ', iso_a2: 'GY' },
  'Suriname': { name_ja: 'スリナム', iso_a2: 'SR' },
  'French Guiana': { name_ja: 'フランス領ギアナ', iso_a2: 'GF' },
  'Falkland Islands': { name_ja: 'フォークランド諸島', iso_a2: 'FK' },
  'Falkland Is.': { name_ja: 'フォークランド諸島', iso_a2: 'FK' },

  // オセアニア
  'Australia': { name_ja: 'オーストラリア', iso_a2: 'AU' },
  'New Zealand': { name_ja: 'ニュージーランド', iso_a2: 'NZ' },
  'Papua New Guinea': { name_ja: 'パプアニューギニア', iso_a2: 'PG' },
  'Fiji': { name_ja: 'フィジー', iso_a2: 'FJ' },
  'Solomon Islands': { name_ja: 'ソロモン諸島', iso_a2: 'SB' },
  'Solomon Is.': { name_ja: 'ソロモン諸島', iso_a2: 'SB' },
  'Vanuatu': { name_ja: 'バヌアツ', iso_a2: 'VU' },
  'New Caledonia': { name_ja: 'ニューカレドニア', iso_a2: 'NC' },
  'Samoa': { name_ja: 'サモア', iso_a2: 'WS' },
  'Tonga': { name_ja: 'トンガ', iso_a2: 'TO' },
  'Kiribati': { name_ja: 'キリバス', iso_a2: 'KI' },
  'Micronesia': { name_ja: 'ミクロネシア連邦', iso_a2: 'FM' },
  'Federated States of Micronesia': { name_ja: 'ミクロネシア連邦', iso_a2: 'FM' },
  'Marshall Islands': { name_ja: 'マーシャル諸島', iso_a2: 'MH' },
  'Marshall Is.': { name_ja: 'マーシャル諸島', iso_a2: 'MH' },
  'Palau': { name_ja: 'パラオ', iso_a2: 'PW' },
  'Nauru': { name_ja: 'ナウル', iso_a2: 'NR' },
  'Tuvalu': { name_ja: 'ツバル', iso_a2: 'TV' },
  'Niue': { name_ja: 'ニウエ', iso_a2: 'NU' },
  'Cook Islands': { name_ja: 'クック諸島', iso_a2: 'CK' },
  'Cook Is.': { name_ja: 'クック諸島', iso_a2: 'CK' },
  'French Polynesia': { name_ja: 'フランス領ポリネシア', iso_a2: 'PF' },
  'Fr. Polynesia': { name_ja: 'フランス領ポリネシア', iso_a2: 'PF' },
  'Guam': { name_ja: 'グアム', iso_a2: 'GU' },
  'Northern Mariana Islands': { name_ja: '北マリアナ諸島', iso_a2: 'MP' },
  'N. Mariana Is.': { name_ja: '北マリアナ諸島', iso_a2: 'MP' },
  'American Samoa': { name_ja: 'アメリカ領サモア', iso_a2: 'AS' },

  // その他/特殊
  'Antarctica': { name_ja: '南極大陸', iso_a2: 'AQ' },
  'Fr. S. Antarctic Lands': { name_ja: 'フランス領南方・南極地域', iso_a2: 'TF' },

  // 宇宙
  'Moon': { name_ja: '月', iso_a2: 'MOON' },
}

// 英語名から日本語名を取得
export function getJapaneseName(englishName: string): string {
  const data = COUNTRY_DATA[englishName]
  return data?.name_ja || englishName
}

// 英語名からISO_A2コードを取得
export function getIsoA2(englishName: string): string {
  const data = COUNTRY_DATA[englishName]
  return data?.iso_a2 || ''
}

// ISO_A2コードから日本語名を取得
export function getJapaneseNameByCode(isoA2: string): string {
  for (const [, data] of Object.entries(COUNTRY_DATA)) {
    if (data.iso_a2 === isoA2) {
      return data.name_ja
    }
  }
  return isoA2
}
