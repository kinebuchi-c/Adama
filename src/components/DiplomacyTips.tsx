import { useState, useEffect } from 'react'

interface Tip {
  country: string
  flag: string
  tip: string
}

const DIPLOMACY_TIPS: Tip[] = [
  // 北米
  { country: 'USA', flag: '🇺🇸', tip: '握手は力強く、アイコンタクトを維持。ファーストネームで呼ぶのは親しくなってから。' },
  { country: 'Canada', flag: '🇨🇦', tip: '礼儀正しく控えめな態度を好む。フランス語圏では仏語での挨拶が好印象。' },
  // 中南米
  { country: 'Mexico', flag: '🇲🇽', tip: '握手後にハグ（アブラソ）。時間にはゆとりを持って。' },
  { country: 'Brazil', flag: '🇧🇷', tip: '親密な距離感が一般的。ハグや肩を叩くのは友好の証。' },
  { country: 'Argentina', flag: '🇦🇷', tip: '頬へのキスで挨拶。情熱的な会話を好み、直接的な表現を使う。' },
  { country: 'Chile', flag: '🇨🇱', tip: '女性には頬へのキス、男性同士は握手。時間には比較的厳格。' },
  { country: 'Colombia', flag: '🇨🇴', tip: '温かく親しみやすい。握手は柔らかめ、女性には頬へのキス。' },
  { country: 'Peru', flag: '🇵🇪', tip: '挨拶は握手と頬へのキス。相手の家族について聞くのは礼儀。' },
  // 西欧
  { country: 'UK', flag: '🇬🇧', tip: '控えめな握手が好まれる。「Sir」「Madam」の敬称を使用。' },
  { country: 'France', flag: '🇫🇷', tip: 'ビズ（頬へのキス）は親しい間柄のみ。正式な場では握手を。' },
  { country: 'Germany', flag: '🇩🇪', tip: '時間厳守は絶対。握手はしっかりと、肩書きで呼ぶことが基本。' },
  { country: 'Italy', flag: '🇮🇹', tip: '表情豊かなコミュニケーション。親しくなると頬へのキスで挨拶。' },
  { country: 'Spain', flag: '🇪🇸', tip: '両頬へのキス（左から）が一般的。昼食は14時頃、夕食は21時以降。' },
  { country: 'Netherlands', flag: '🇳🇱', tip: '直接的な物言いを好む。3回の頬キスが伝統的な挨拶。' },
  { country: 'Belgium', flag: '🇧🇪', tip: '1回の頬キスで挨拶。オランダ語圏と仏語圏で文化が異なる。' },
  { country: 'Switzerland', flag: '🇨🇭', tip: '3回の頬キス。時間厳守で、約束は必ず守る文化。' },
  { country: 'Austria', flag: '🇦🇹', tip: '肩書きを重視。「Herr Doktor」など学位も敬称に含める。' },
  { country: 'Portugal', flag: '🇵🇹', tip: '女性同士は両頬にキス。温かく歓迎的な文化。' },
  // 北欧
  { country: 'Sweden', flag: '🇸🇪', tip: '控えめで形式的。握手は短く、個人の空間を尊重。' },
  { country: 'Norway', flag: '🇳🇴', tip: '平等を重視し、肩書きをあまり使わない。時間厳守。' },
  { country: 'Denmark', flag: '🇩🇰', tip: 'カジュアルで直接的。ファーストネームで呼び合うのが一般的。' },
  { country: 'Finland', flag: '🇫🇮', tip: '沈黙は不快ではない。サウナは重要な社交の場。' },
  // 東欧
  { country: 'Russia', flag: '🇷🇺', tip: '強い握手が信頼の証。敷居で握手しない（不吉とされる）。' },
  { country: 'Poland', flag: '🇵🇱', tip: '女性の手にキスする伝統あり。花を贈る際は奇数本で。' },
  { country: 'Czech', flag: '🇨🇿', tip: '握手で挨拶。ビールの国なので乾杯の機会が多い。' },
  { country: 'Hungary', flag: '🇭🇺', tip: '女性には手へのキス。乾杯時にグラスを合わせない習慣。' },
  { country: 'Ukraine', flag: '🇺🇦', tip: '温かいおもてなし文化。パンと塩で客人を歓迎する伝統。' },
  // 中東
  { country: 'UAE', flag: '🇦🇪', tip: '同性間の挨拶は握手、異性間は相手から手を差し出すまで待つ。' },
  { country: 'Saudi', flag: '🇸🇦', tip: '同性間は長い握手と頬へのキス。女性との握手は相手次第。' },
  { country: 'Israel', flag: '🇮🇱', tip: '直接的なコミュニケーション。安息日（金夕〜土夕）は配慮を。' },
  { country: 'Turkey', flag: '🇹🇷', tip: '握手は軽め。年長者には敬意を示し、チャイを断らない。' },
  { country: 'Iran', flag: '🇮🇷', tip: '同性間は握手と頬キス。「タアロフ」（謙遜）の文化を理解する。' },
  { country: 'Qatar', flag: '🇶🇦', tip: '右手で握手。コーヒーは3杯まで受け、カップを振って終了を示す。' },
  { country: 'Kuwait', flag: '🇰🇼', tip: '長い握手と挨拶。相手の健康や家族について尋ねるのが礼儀。' },
  { country: 'Jordan', flag: '🇯🇴', tip: '温かい歓迎文化。コーヒーやお茶のおもてなしは断らない。' },
  { country: 'Egypt', flag: '🇪🇬', tip: '握手は長めに。相手の目を見て、敬意を込めた挨拶を。' },
  // アフリカ
  { country: 'South Africa', flag: '🇿🇦', tip: '多様な文化が共存。握手が一般的だが、民族により異なる。' },
  { country: 'Nigeria', flag: '🇳🇬', tip: '年長者への敬意が重要。握手は右手で、少しお辞儀を添える。' },
  { country: 'Kenya', flag: '🇰🇪', tip: '握手は長く、会話しながら。急がない姿勢が好まれる。' },
  { country: 'Ethiopia', flag: '🇪🇹', tip: '肩を合わせる挨拶。コーヒーセレモニーは重要な社交の場。' },
  { country: 'Morocco', flag: '🇲🇦', tip: '同性間は握手と頬キス。ミントティーのおもてなしは断らない。' },
  { country: 'Ghana', flag: '🇬🇭', tip: '右手で握手。年長者を先に挨拶し、敬意を示す。' },
  // 南アジア
  { country: 'India', flag: '🇮🇳', tip: '「ナマステ」と合掌で挨拶。左手は不浄とされるため右手を使用。' },
  { country: 'Pakistan', flag: '🇵🇰', tip: '同性間は握手、異性間は避ける。「アッサラーム・アライクム」で挨拶。' },
  { country: 'Bangladesh', flag: '🇧🇩', tip: '軽いお辞儀と握手。年長者への敬意が重要。' },
  { country: 'Sri Lanka', flag: '🇱🇰', tip: '両手を合わせ「アーユボーワン」で挨拶。頭に触れない。' },
  { country: 'Nepal', flag: '🇳🇵', tip: '「ナマステ」と合掌。寺院では靴を脱ぎ、革製品に注意。' },
  // 東南アジア
  { country: 'Thailand', flag: '🇹🇭', tip: '「ワイ」（合掌）で挨拶。頭は神聖なため触れない。' },
  { country: 'Vietnam', flag: '🇻🇳', tip: '軽いお辞儀と握手。名刺は両手で受け取る。' },
  { country: 'Indonesia', flag: '🇮🇩', tip: '右手で握手後、胸に手を当てる。左手は使わない。' },
  { country: 'Malaysia', flag: '🇲🇾', tip: '軽い握手後、胸に手を当てる。多民族国家で文化が多様。' },
  { country: 'Singapore', flag: '🇸🇬', tip: '握手が一般的。多文化社会で、相手の背景に配慮を。' },
  { country: 'Philippines', flag: '🇵🇭', tip: 'フレンドリーな握手。年長者には「マノ」（手を額に当てる）で敬意を。' },
  { country: 'Myanmar', flag: '🇲🇲', tip: '軽いお辞儀。僧侶には特別な敬意を示す。' },
  { country: 'Cambodia', flag: '🇰🇭', tip: '合掌（サンペア）で挨拶。頭は神聖、足は不浄とされる。' },
  // 東アジア
  { country: 'Japan', flag: '🇯🇵', tip: 'お辞儀の角度で敬意を表現。名刺交換は両手で丁寧に。' },
  { country: 'China', flag: '🇨🇳', tip: '名刺は両手で渡し、受け取る。序列を重視し、最上位者から挨拶を。' },
  { country: 'Korea', flag: '🇰🇷', tip: '年長者を敬う文化。両手で物を渡し、軽くお辞儀を添える。' },
  { country: 'Taiwan', flag: '🇹🇼', tip: '握手とお辞儀を組み合わせる。名刺は両手で交換。' },
  { country: 'Mongolia', flag: '🇲🇳', tip: '握手で挨拶。ゲルに入る時は敷居を踏まない。' },
  // オセアニア
  { country: 'Australia', flag: '🇦🇺', tip: 'カジュアルな雰囲気を好む。ファーストネームでOK、形式張らない。' },
  { country: 'New Zealand', flag: '🇳🇿', tip: 'マオリ文化では「ホンギ」（鼻と額を合わせる）で挨拶。' },
  { country: 'Fiji', flag: '🇫🇯', tip: '「ブラ」で挨拶。村を訪問時はカヴァの儀式に参加。' },
  // 中央アジア
  { country: 'Kazakhstan', flag: '🇰🇿', tip: '握手と軽いお辞儀。おもてなし文化が強い。' },
  { country: 'Uzbekistan', flag: '🇺🇿', tip: '右手を胸に当てお辞儀。パンは裏返しに置かない。' },
]

export function DiplomacyTips() {
  const [currentTips, setCurrentTips] = useState<Tip[]>([])

  useEffect(() => {
    shuffleTips()
  }, [])

  const shuffleTips = () => {
    const shuffled = [...DIPLOMACY_TIPS].sort(() => Math.random() - 0.5)
    setCurrentTips(shuffled.slice(0, 3))
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      height: '100%',
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(251, 191, 36, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px' }}>🤝</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>
            外交マナー豆知識
          </span>
        </div>
        <button
          onClick={shuffleTips}
          style={{
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '10px',
            color: '#6b7280',
          }}
          title="他の豆知識を見る"
        >
          🔄
        </button>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: '8px' }}>
        {currentTips.map((tip, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              borderRadius: '8px',
              marginBottom: index < currentTips.length - 1 ? '6px' : 0,
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            }}>
              <span style={{ fontSize: '14px' }}>{tip.flag}</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#92400e',
              }}>
                {tip.country}
              </span>
            </div>
            <div style={{
              fontSize: '0.68rem',
              color: '#78350f',
              lineHeight: 1.4,
            }}>
              {tip.tip}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
