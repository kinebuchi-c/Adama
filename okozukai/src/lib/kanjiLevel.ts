import { GradeLevel } from './triviaAndQuiz';

// 学年別の漢字変換マップ
// elementary-lower: 小3-4で習う漢字まで使用
// elementary-upper: 小5-6で習う漢字まで使用
// junior-high: 制限なし

// 小3-4では難しい漢字 → ひらがな/簡単な表現
const lowerElementaryReplacements: Record<string, string> = {
  '獲得': 'かくとく',
  '承認': 'しょうにん',
  '提案': 'ていあん',
  '発見': 'はっけん',
  '正解': 'せいかい',
  '説明': 'せつめい',
  '観測': 'かんそく',
  '宇宙': 'うちゅう',
  '銀河': 'ぎんが',
  '神経': 'しんけい',
  '細胞': 'さいぼう',
  '元素': 'げんそ',
  '酸素': 'さんそ',
  '振動': 'しんどう',
  '濃度': 'のうど',
  '密度': 'みつど',
  '温度': 'おんど',
  '磁場': 'じば',
  '重力': 'じゅうりょく',
  '恒星': 'こうせい',
  '探査': 'たんさ',
  '進化': 'しんか',
  '証拠': 'しょうこ',
  '逆転': 'ぎゃくてん',
  '微生物': 'びせいぶつ',
  '免疫': 'めんえき',
  '消化': 'しょうか',
  '腸内': 'ちょうない',
  '塩基': 'えんき',
  '対数': 'たいすう',
  '伝播': 'でんぱ',
  '原子核': 'げんしかく',
  '電子': 'でんし',
  '相対性理論': 'そうたいせいりろん',
};

// 小5-6では難しい漢字 → ふりがな付き
const upperElementaryReplacements: Record<string, string> = {
  '観測': '観測（かんそく）',
  '銀河': '銀河（ぎんが）',
  '神経': '神経（しんけい）',
  '濃度': '濃度（のうど）',
  '密度': '密度（みつど）',
  '磁場': '磁場（じば）',
  '恒星': '恒星（こうせい）',
  '探査': '探査（たんさ）',
  '逆転': '逆転（ぎゃくてん）',
  '微生物': '微生物（びせいぶつ）',
  '免疫': '免疫（めんえき）',
  '腸内': '腸内（ちょうない）',
  '塩基': '塩基（えんき）',
  '対数': '対数（たいすう）',
  '伝播': '伝播（でんぱ）',
  '原子核': '原子核（げんしかく）',
  '相対性理論': '相対性理論（そうたいせいりろん）',
};

// テキストを学年レベルに合わせて変換
export function convertToGradeLevel(text: string, level: GradeLevel): string {
  if (level === 'junior-high') {
    return text; // 中学生はそのまま
  }

  const replacements = level === 'elementary-lower'
    ? lowerElementaryReplacements
    : upperElementaryReplacements;

  let result = text;
  for (const [kanji, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(kanji, 'g'), replacement);
  }
  return result;
}

// UI用のラベル（学年別）
export const uiLabels: Record<GradeLevel, {
  monthlyEarned: string;
  nextReward: string;
  tasks: string;
  tasksDesc: string;
  shop: string;
  shopDesc: string;
  customize: string;
  propose: string;
  todayDiscovery: string;
  tellParent: string;
  quiz: string;
  quizParent: string;
  pending: string;
  correct: string;
  nextQuiz: string;
  back: string;
  minutesAgo: string;
}> = {
  'elementary-lower': {
    monthlyEarned: '今月あつめた',
    nextReward: 'つぎのごほうびまで あと',
    tasks: 'タスク',
    tasksDesc: '星をあつめる',
    shop: 'ショップ',
    shopDesc: '星をつかう',
    customize: 'きせかえ',
    propose: 'ていあんする',
    todayDiscovery: '今日のはっけん',
    tellParent: '→ おうちの人におしえよう',
    quiz: 'クイズ',
    quizParent: '→ おうちの人にだしてみよう',
    pending: 'まちちゅう',
    correct: 'せいかい！',
    nextQuiz: 'つぎのクイズ →',
    back: '← もどる',
    minutesAgo: 'ふんまえ',
  },
  'elementary-upper': {
    monthlyEarned: '今月の獲得',
    nextReward: '次のごほうびまであと',
    tasks: 'タスク',
    tasksDesc: '星を集める',
    shop: 'ショップ',
    shopDesc: '星を使う',
    customize: 'カスタマイズ',
    propose: '提案する',
    todayDiscovery: '今日の発見',
    tellParent: '→ 親に教えてみよう',
    quiz: 'クイズ',
    quizParent: '→ 親に出題してみよう',
    pending: '承認待ち',
    correct: '正解！',
    nextQuiz: '次のクイズ →',
    back: '← 戻る',
    minutesAgo: '分前',
  },
  'junior-high': {
    monthlyEarned: '今月の獲得',
    nextReward: '次の報酬まであと',
    tasks: 'タスク',
    tasksDesc: 'ポイントを獲得',
    shop: 'ショップ',
    shopDesc: 'ポイントを使用',
    customize: 'カスタマイズ',
    propose: '提案する',
    todayDiscovery: '今日の発見',
    tellParent: '→ 親に共有しよう',
    quiz: 'クイズ',
    quizParent: '→ 親に出題してみよう',
    pending: '承認待ち',
    correct: '正解！',
    nextQuiz: '次の問題 →',
    back: '← 戻る',
    minutesAgo: '分前',
  },
};
