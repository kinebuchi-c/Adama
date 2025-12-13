// 学年レベル
export type GradeLevel = 'elementary-lower' | 'elementary-upper' | 'junior-high';

// 学年情報
export const gradeLevels = {
  'elementary-lower': { label: '小3〜4', minGrade: 3, maxGrade: 4 },
  'elementary-upper': { label: '小5〜6', minGrade: 5, maxGrade: 6 },
  'junior-high': { label: '中学生', minGrade: 7, maxGrade: 9 },
};

// 豆知識（学年別）
export const triviaByLevel: Record<GradeLevel, Array<{ emoji: string; fact: string; detail: string }>> = {
  'elementary-lower': [
    { emoji: '🐙', fact: 'タコの心臓は3つあるんだよ！', detail: '2つは足に血を送って、1つは体に血を送るんだって！' },
    { emoji: '🍌', fact: 'バナナは木じゃなくて草に実る！', detail: 'バナナの「木」は実は世界で一番大きな草なんだ！' },
    { emoji: '🦒', fact: 'キリンの睡眠時間は1日たった30分！', detail: '立ったまま寝ることもあるんだって！' },
    { emoji: '🐝', fact: 'ハチは一生で小さじ1杯のハチミツしか作れない', detail: 'だからハチミツは大切に食べようね！' },
    { emoji: '🌙', fact: '月には足跡がずっと残ってる', detail: '風がないから、50年以上前の足跡が今も残ってるんだ！' },
    { emoji: '🐘', fact: 'ゾウは地面の振動で仲間と話せる', detail: '足から振動を感じ取るんだって、すごいよね！' },
    { emoji: '🦈', fact: 'サメの歯は何万本も生え変わる', detail: '人間は2回だけなのに、サメはすごいね！' },
    { emoji: '🐧', fact: 'ペンギンは海水が飲める', detail: '塩分を体の外に出す特別な力があるんだ！' },
    { emoji: '🦋', fact: 'チョウチョは足で味がわかる', detail: '花に止まると、足で「おいしい！」ってわかるんだって！' },
    { emoji: '🐬', fact: 'イルカは片目を開けて寝る', detail: '脳の半分ずつ休ませるんだって！' },
  ],
  'elementary-upper': [
    { emoji: '🧠', fact: '人間の脳は約860億個の神経細胞でできている', detail: '銀河系の星の数とほぼ同じ！宇宙が頭の中にあるみたい' },
    { emoji: '⚡', fact: '雷は太陽の表面より5倍も熱い', detail: '約30,000度！一瞬だけど超高温なんだ' },
    { emoji: '🌍', fact: '地球は時速1,700kmで自転している', detail: '新幹線の5倍以上の速さで回ってるのに気づかないよね' },
    { emoji: '💎', fact: 'ダイヤモンドは炭素100%', detail: '鉛筆の芯と同じ元素なのに、並び方が違うだけであんなに硬い' },
    { emoji: '🦑', fact: 'イカの血液は青色', detail: '銅を使って酸素を運ぶから。人間は鉄だから赤いんだ' },
    { emoji: '🌊', fact: '海の95%以上はまだ未探査', detail: '月の表面より謎が多い。深海には未知の生物がいるかも' },
    { emoji: '🔬', fact: '人体の細胞は約37兆個', detail: '毎日3000億個が入れ替わってる。君は毎日少しずつ新しくなってる' },
    { emoji: '🌙', fact: '月は毎年3.8cm地球から離れている', detail: '数億年後には日食が見られなくなるかも' },
    { emoji: '🦴', fact: '赤ちゃんの骨は300本以上', detail: '大人になると206本に。くっついて減るんだ' },
    { emoji: '🧬', fact: '人間とバナナのDNAは60%同じ', detail: '生物はみんな共通の祖先から進化した証拠' },
  ],
  'junior-high': [
    { emoji: '🕳️', fact: 'ブラックホールは時間の流れを遅くする', detail: '相対性理論により、強い重力場では時間が遅く進む。映画「インターステラー」の科学的根拠' },
    { emoji: '🧪', fact: '水は4℃で最も密度が高い', detail: 'だから湖は表面から凍る。これがなければ魚は冬を越せない' },
    { emoji: '🔋', fact: '人間の脳は約20ワットで動いている', detail: 'スマホの充電より少ない電力で、世界最高のコンピュータより賢い処理ができる' },
    { emoji: '🌌', fact: '観測可能な宇宙には2兆個以上の銀河がある', detail: '各銀河に数千億の星。存在する星の数は地球上の砂粒より多い' },
    { emoji: '⚛️', fact: '原子の99.9999999%は空間', detail: '物質はほぼ「何もない」。原子核を野球ボールにすると電子は数km先を回る' },
    { emoji: '🧊', fact: '熱湯は冷水より早く凍ることがある', detail: 'ムペンバ効果という謎の現象。完全な説明はまだない' },
    { emoji: '🎵', fact: '音は真空中を伝わらない', detail: '宇宙空間は完全な静寂。SF映画の爆発音は科学的には嘘' },
    { emoji: '🔭', fact: '今見える星の光は過去からのメッセージ', detail: '数百光年離れた星の光は、あなたが見る時にはその星はもう存在しないかも' },
    { emoji: '🧲', fact: '地球の磁場は約20万年ごとに逆転する', detail: '次の逆転が起きたらコンパスのN極とS極が入れ替わる' },
    { emoji: '🦠', fact: '人体の細胞より多くの微生物が体内にいる', detail: '腸内細菌だけで約100兆個。彼らなしでは消化も免疫も機能しない' },
  ],
};

// クイズ（学年別）
export const quizzesByLevel: Record<GradeLevel, Array<{
  emoji: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}>> = {
  'elementary-lower': [
    { emoji: '🐕', question: '犬の鼻の模様は人間でいうと何と同じ？', options: ['足の裏', '指紋', '歯の形'], answer: 1, explanation: '犬の鼻の模様は全部違うから、指紋みたいに見分けられるんだよ！' },
    { emoji: '🐱', question: '猫が1日に寝る時間は平均どのくらい？', options: ['8時間', '12〜16時間', '20時間'], answer: 1, explanation: '猫は1日の半分以上寝ているんだ！子猫はもっと寝るよ！' },
    { emoji: '🦷', question: 'サメの歯は一生で何本くらい生え変わる？', options: ['100本', '1000本', '3万本以上'], answer: 2, explanation: '歯が抜けても次がすぐ生えてくるから、歯医者さんいらずだね！' },
    { emoji: '🌳', question: '世界で一番大きな木は何メートルくらい？', options: ['30m', '60m', '100m以上'], answer: 2, explanation: 'カリフォルニアのセコイアという木で、115メートル以上あるよ！' },
    { emoji: '🦜', question: 'オウムが言葉をマネできる理由は？', options: ['頭がいい', '舌が特殊', '耳がいい'], answer: 1, explanation: '分厚くて柔らかい舌があるから、人間みたいな音が出せるんだ！' },
    { emoji: '🌸', question: '桜（ソメイヨシノ）の花びらは何枚？', options: ['3枚', '5枚', '8枚'], answer: 1, explanation: 'ソメイヨシノは5枚！八重桜はもっとたくさんあるよ！' },
  ],
  'elementary-upper': [
    { emoji: '🌊', question: '海水の塩分濃度は約何%？', options: ['0.35%', '3.5%', '35%'], answer: 1, explanation: '海水1リットルに約35gの塩が溶けている。舐めるとしょっぱい理由' },
    { emoji: '🚀', question: '国際宇宙ステーションは地球を何周する？（1日）', options: ['1周', '16周', '100周'], answer: 1, explanation: '約90分で1周するから、1日に16回も日の出を見られる！' },
    { emoji: '💡', question: '光は1秒間に地球を何周できる？', options: ['1周', '7.5周', '100周'], answer: 1, explanation: '光速は秒速30万km。地球の周囲は4万kmだから約7.5周！' },
    { emoji: '🦴', question: '人間の体で一番小さい骨はどこにある？', options: ['指', '耳', '足'], answer: 1, explanation: '耳の中の「アブミ骨」で約3mm。音を伝える大事な役割がある' },
    { emoji: '🌡️', question: '宇宙空間の温度は約何度？', options: ['-50℃', '-150℃', '-270℃'], answer: 2, explanation: '絶対零度（-273℃）に近い極寒。でも日光が当たると100℃以上になることも' },
    { emoji: '🧠', question: '脳が使うエネルギーは体全体の何%？', options: ['5%', '20%', '50%'], answer: 1, explanation: '体重の2%しかないのに、エネルギーの20%を使う大食い器官！' },
  ],
  'junior-high': [
    { emoji: '⚛️', question: '原子核の大きさは原子全体の何分の1？', options: ['1/100', '1/10000', '1/100000'], answer: 2, explanation: '原子を東京ドームにすると、原子核はビー玉程度。物質のほとんどは空間' },
    { emoji: '🌍', question: '地球の核の温度は太陽表面と比べて？', options: ['半分', 'ほぼ同じ', '2倍'], answer: 1, explanation: '地球の核は約6000℃、太陽表面も約6000℃。足元に太陽並みの熱がある' },
    { emoji: '🔬', question: 'ヒトゲノムの塩基対の数は約？', options: ['3万', '3億', '30億'], answer: 2, explanation: '30億の塩基対がDNAに書き込まれている。全部読み上げると約100年かかる' },
    { emoji: '💫', question: '最も近い恒星（太陽以外）までの距離は？', options: ['4光年', '40光年', '400光年'], answer: 0, explanation: 'プロキシマ・ケンタウリまで約4.2光年。現在の技術では到達に数万年かかる' },
    { emoji: '🧪', question: 'pHが1下がると水素イオン濃度は？', options: ['2倍', '10倍', '100倍'], answer: 1, explanation: 'pHは対数スケール。pH6とpH4では水素イオン濃度が100倍違う' },
    { emoji: '⚡', question: '電子の移動速度（電流）は秒速何m？', options: ['0.1mm', '1m', '光速'], answer: 0, explanation: '電子自体はとても遅い。電場の伝播が光速に近いから、スイッチを入れるとすぐ点く' },
  ],
};

// ランダム取得
export const getRandomTrivia = (level: GradeLevel) => {
  const facts = triviaByLevel[level];
  return facts[Math.floor(Math.random() * facts.length)];
};

export const getRandomQuiz = (level: GradeLevel) => {
  const quizList = quizzesByLevel[level];
  return quizList[Math.floor(Math.random() * quizList.length)];
};

// 後方互換性のため
export const triviaFacts = triviaByLevel['elementary-lower'];
export const quizzes = quizzesByLevel['elementary-lower'];
