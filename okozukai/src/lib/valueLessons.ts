import { TaskCategory, ValueLesson } from '@/types';

// 道徳・価値観に関するメッセージ
export const valueLessons: ValueLesson[] = [
  // お手伝い (chore)
  {
    id: 'chore-1',
    category: 'chore',
    title: '家族への思いやり',
    message: 'お手伝いは、家族のために自分ができることをすること',
    forChild: '家の仕事をすると、みんなが助かるよ。君のおかげで、家がきれいになったり、ご飯がおいしくなったりするんだ！',
    forParent: '「ありがとう」の言葉と一緒に、お手伝いが家族にどう役立っているかを具体的に伝えてあげてください。',
  },
  {
    id: 'chore-2',
    category: 'chore',
    title: '責任感',
    message: '自分で決めたことは最後までやりとげよう',
    forChild: '最後までやり遂げると、「やった！」という気持ちになれるよ。難しくても、あきらめないでがんばろう！',
    forParent: '途中で投げ出しそうなときは、一緒に応援してあげてください。完了したときの達成感を共有しましょう。',
  },
  {
    id: 'chore-3',
    category: 'chore',
    title: '自立心',
    message: '自分のことは自分でできるようになろう',
    forChild: '自分のことを自分でできると、とってもカッコいいよ！少しずつできることを増やしていこう。',
    forParent: '年齢に応じた「自分でできること」を一緒に見つけて、チャレンジを応援してあげてください。',
  },

  // 勉強 (study)
  {
    id: 'study-1',
    category: 'study',
    title: '努力の大切さ',
    message: 'がんばった分だけ、できることが増える',
    forChild: '勉強は、頭の筋肉を鍛えるようなもの！毎日少しずつやると、どんどん強くなるよ。',
    forParent: '結果だけでなく、努力のプロセスを褒めてあげてください。「頑張ったね」の一言が自信につながります。',
  },
  {
    id: 'study-2',
    category: 'study',
    title: '好奇心',
    message: '「なぜ？」と思う気持ちが学びの始まり',
    forChild: '不思議だな、なんでだろう？と思ったら、調べてみよう！知らないことを知るのは、宝物を見つけるようなものだよ。',
    forParent: '子どもの「なぜ？」に一緒に考え、調べる時間を作ってみてください。',
  },

  // 思いやり (kindness)
  {
    id: 'kindness-1',
    category: 'kindness',
    title: '思いやりの心',
    message: '人の気持ちを考えて行動しよう',
    forChild: '誰かが困っていたら、「大丈夫？」と聞いてみよう。優しい気持ちは、みんなを幸せにするよ。',
    forParent: '思いやりの行動を見かけたら、具体的にどう良かったかを伝えてあげてください。',
  },
  {
    id: 'kindness-2',
    category: 'kindness',
    title: '感謝の気持ち',
    message: '「ありがとう」は魔法の言葉',
    forChild: '「ありがとう」と言われると、うれしいよね？君も「ありがとう」をたくさん言ってみよう！',
    forParent: '親自身も「ありがとう」を積極的に伝え、お手本を見せてあげてください。',
  },

  // その他 (other)
  {
    id: 'other-1',
    category: 'other',
    title: 'お金の価値',
    message: 'お金は「ありがとう」のしるし',
    forChild: 'お金は、がんばったことへの「ありがとう」なんだよ。大事に使おうね。',
    forParent: 'お金の使い方について、「貯める・使う・あげる」のバランスを一緒に考えてみてください。',
  },
  {
    id: 'other-2',
    category: 'other',
    title: '目標を持つこと',
    message: '夢や目標があると、毎日が楽しくなる',
    forChild: '貯まったお金で、何がしたい？目標があると、がんばれるよ！',
    forParent: '貯金の目標を一緒に設定し、達成に向けた計画を立ててみてください。',
  },
];

// カテゴリに応じたランダムなメッセージを取得
export function getRandomLesson(category?: TaskCategory): ValueLesson {
  const filtered = category
    ? valueLessons.filter((l) => l.category === category)
    : valueLessons;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// 承認時の励ましメッセージ
export const encouragementMessages = [
  'よくがんばったね！えらい！',
  '最後までやり遂げたね、すごい！',
  '家のためにありがとう！',
  '君のおかげで助かったよ！',
  '毎日えらいね！',
  'がんばり屋さんだね！',
  'お手伝い、上手だったよ！',
];

// 親子の会話を促すプロンプト
export const conversationPrompts = [
  {
    topic: 'お手伝いについて',
    questions: [
      'どのお手伝いが一番好き？',
      'やってみたいお手伝いはある？',
      'お手伝いしているとき、どんな気持ち？',
    ],
  },
  {
    topic: 'お金について',
    questions: [
      '貯まったお金で、何がしたい？',
      'お金を貯めるのと、使うの、どっちが好き？',
      '誰かにプレゼントしたいものはある？',
    ],
  },
  {
    topic: '将来について',
    questions: [
      '大きくなったら、何になりたい？',
      'できるようになりたいことはある？',
      '家族で行きたいところはある？',
    ],
  },
  {
    topic: '感謝について',
    questions: [
      '今日、うれしかったことは何？',
      '「ありがとう」を言いたい人はいる？',
      '誰かに優しくしてもらったことはある？',
    ],
  },
];

// 目標設定のヒント
export const savingsGoalSuggestions = [
  { name: '好きなお菓子', amount: 200, icon: '🍭' },
  { name: '欲しいおもちゃ', amount: 500, icon: '🎮' },
  { name: '本', amount: 800, icon: '📚' },
  { name: '家族へのプレゼント', amount: 1000, icon: '🎁' },
  { name: '貯金を続ける', amount: 2000, icon: '🐷' },
];
