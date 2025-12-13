'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GradeLevel, triviaByLevel, quizzesByLevel, gradeLevels } from '@/lib/triviaAndQuiz';
import { uiLabels, convertToGradeLevel } from '@/lib/kanjiLevel';
import { useDemo } from '@/contexts/DemoContext';
import CharacterAvatar from '@/components/characters/CharacterAvatar';

// 学年別のテーマカラー
const themes: Record<GradeLevel, {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  card: string;
  text: string;
}> = {
  'elementary-lower': {
    primary: 'from-amber-400 to-orange-500',
    secondary: 'from-pink-400 to-rose-500',
    accent: 'from-emerald-400 to-teal-500',
    bg: 'bg-gradient-to-br from-amber-50 via-white to-rose-50',
    card: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-800',
  },
  'elementary-upper': {
    primary: 'from-violet-500 to-purple-600',
    secondary: 'from-cyan-500 to-blue-600',
    accent: 'from-emerald-500 to-green-600',
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    card: 'bg-white/10 backdrop-blur-md border border-white/20',
    text: 'text-white',
  },
  'junior-high': {
    primary: 'from-slate-700 to-slate-900',
    secondary: 'from-blue-600 to-indigo-700',
    accent: 'from-amber-500 to-orange-600',
    bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
    card: 'bg-slate-800/50 backdrop-blur-md border border-slate-700',
    text: 'text-slate-100',
  },
};

export default function ChildDemoPage() {
  const { player } = useDemo();
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('elementary-upper');
  const [trivia, setTrivia] = useState(triviaByLevel['elementary-upper'][0]);
  const [quiz, setQuiz] = useState(quizzesByLevel['elementary-upper'][0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [totalStars, setTotalStars] = useState(127);

  const theme = themes[gradeLevel];
  const labels = uiLabels[gradeLevel];

  // テキストを学年レベルに変換するヘルパー
  const t = (text: string) => convertToGradeLevel(text, gradeLevel);

  useEffect(() => {
    const facts = triviaByLevel[gradeLevel];
    const quizList = quizzesByLevel[gradeLevel];
    setTrivia(facts[Math.floor(Math.random() * facts.length)]);
    setQuiz(quizList[Math.floor(Math.random() * quizList.length)]);
    setSelectedAnswer(null);
    setShowAnswer(false);
  }, [gradeLevel]);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowAnswer(true);
  };

  const nextTrivia = () => {
    const facts = triviaByLevel[gradeLevel];
    setTrivia(facts[Math.floor(Math.random() * facts.length)]);
  };

  const nextQuiz = () => {
    const quizList = quizzesByLevel[gradeLevel];
    setQuiz(quizList[Math.floor(Math.random() * quizList.length)]);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className={`${gradeLevel === 'elementary-lower' ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white'} transition-colors`}
          >
            {labels.back}
          </Link>

          {/* Grade Selector */}
          <div className={`flex rounded-full p-1 ${gradeLevel === 'elementary-lower' ? 'bg-gray-100' : 'bg-white/10'}`}>
            {(Object.entries(gradeLevels) as [GradeLevel, typeof gradeLevels[GradeLevel]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setGradeLevel(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  gradeLevel === key
                    ? `bg-gradient-to-r ${themes[key].primary} text-white shadow-lg`
                    : gradeLevel === 'elementary-lower'
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className={`${theme.card} rounded-3xl p-6 mb-6 shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm ${gradeLevel === 'elementary-lower' ? 'text-gray-500' : 'text-slate-400'}`}>
                {labels.monthlyEarned}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {totalStars}
                </span>
                <span className={`text-lg ${gradeLevel === 'elementary-lower' ? 'text-gray-600' : 'text-slate-300'}`}>
                  ⭐
                </span>
              </div>
            </div>
            <Link href="/customize" className="block">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center shadow-lg overflow-hidden hover:scale-105 transition-transform`}>
                <CharacterAvatar size="sm" expression="happy" appearance={player?.appearance} />
              </div>
            </Link>
          </div>

          {/* Progress Bar */}
          <div className={`${gradeLevel === 'elementary-lower' ? 'bg-gray-100' : 'bg-white/10'} rounded-full h-2 mb-2`}>
            <div
              className={`bg-gradient-to-r ${theme.primary} h-full rounded-full transition-all`}
              style={{ width: `${(totalStars % 100)}%` }}
            />
          </div>
          <p className={`text-xs ${gradeLevel === 'elementary-lower' ? 'text-gray-500' : 'text-slate-400'}`}>
            {labels.nextReward} {100 - (totalStars % 100)} ⭐
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/tasks"
            className={`bg-gradient-to-r ${theme.primary} p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className="text-2xl">⭐</span>
            <p className="text-white font-bold mt-1">{labels.tasks}</p>
            <p className="text-white/70 text-xs">{labels.tasksDesc}</p>
          </Link>
          <Link
            href="/shop"
            className={`bg-gradient-to-r ${theme.secondary} p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className="text-2xl">🛍️</span>
            <p className="text-white font-bold mt-1">{labels.shop}</p>
            <p className="text-white/70 text-xs">{labels.shopDesc}</p>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/customize"
            className={`${theme.card} p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className="text-2xl">✨</span>
            <p className="font-bold mt-1">{labels.customize}</p>
          </Link>
          <Link
            href="/propose"
            className={`${theme.card} p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className="text-2xl">💡</span>
            <p className="font-bold mt-1">{labels.propose}</p>
          </Link>
        </div>

        {/* Today's Knowledge */}
        <div className={`${theme.card} rounded-3xl p-5 mb-4 shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{trivia.emoji}</span>
              <div>
                <h3 className="font-bold">{labels.todayDiscovery}</h3>
                <p className={`text-xs ${gradeLevel === 'elementary-lower' ? 'text-amber-600' : 'text-amber-400'}`}>
                  {labels.tellParent}
                </p>
              </div>
            </div>
            <button
              onClick={nextTrivia}
              className={`p-2 rounded-xl ${gradeLevel === 'elementary-lower' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'} transition-colors`}
            >
              🔄
            </button>
          </div>

          <div className={`${gradeLevel === 'elementary-lower' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'} rounded-2xl p-4`}>
            <p className="font-bold text-lg mb-2">{t(trivia.fact)}</p>
            <p className={`text-sm ${gradeLevel === 'elementary-lower' ? 'text-gray-600' : 'text-slate-300'}`}>
              {t(trivia.detail)}
            </p>
          </div>
        </div>

        {/* Quiz Section */}
        <div className={`${theme.card} rounded-3xl p-5 shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{quiz.emoji}</span>
              <div>
                <h3 className="font-bold">{labels.quiz}</h3>
                <p className={`text-xs ${gradeLevel === 'elementary-lower' ? 'text-purple-600' : 'text-purple-400'}`}>
                  {labels.quizParent}
                </p>
              </div>
            </div>
          </div>

          <p className="font-bold mb-4">{t(quiz.question)}</p>

          {!showAnswer ? (
            <div className="space-y-2">
              {quiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left py-3 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    gradeLevel === 'elementary-lower'
                      ? 'bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50'
                  }`}
                >
                  <span className={`font-medium ${gradeLevel === 'elementary-lower' ? 'text-gray-700' : 'text-slate-200'}`}>
                    {['A', 'B', 'C'][index]}. {t(option)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {quiz.options.map((option, index) => (
                <div
                  key={index}
                  className={`py-3 px-4 rounded-xl border-2 transition-all ${
                    index === quiz.answer
                      ? 'bg-green-500/20 border-green-500'
                      : index === selectedAnswer
                      ? 'bg-red-500/20 border-red-500'
                      : gradeLevel === 'elementary-lower'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="font-medium">
                    {['A', 'B', 'C'][index]}. {t(option)}
                    {index === quiz.answer && ' ✓'}
                  </span>
                </div>
              ))}

              <div className={`p-4 rounded-xl ${
                selectedAnswer === quiz.answer
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-blue-500/20 border border-blue-500/50'
              }`}>
                <p className="font-bold mb-1">
                  {selectedAnswer === quiz.answer
                    ? `🎉 ${labels.correct}`
                    : `💡 ${gradeLevel === 'elementary-lower' ? 'こたえ' : '正解'}: ${t(quiz.options[quiz.answer])}`}
                </p>
                <p className={`text-sm ${gradeLevel === 'elementary-lower' ? 'text-gray-600' : 'text-slate-300'}`}>
                  {t(quiz.explanation)}
                </p>
              </div>

              <button
                onClick={nextQuiz}
                className={`w-full py-3 px-4 bg-gradient-to-r ${theme.secondary} text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]`}
              >
                {labels.nextQuiz}
              </button>
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className={`${theme.card} rounded-3xl p-5 mt-4 shadow-xl`}>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>⏳</span> {labels.pending}
          </h3>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${gradeLevel === 'elementary-lower' ? 'bg-amber-50 border border-amber-100' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <span className="text-xl">🧽</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {gradeLevel === 'elementary-lower' ? 'おさらあらい' : '食器洗い'}
              </p>
              <p className={`text-xs ${gradeLevel === 'elementary-lower' ? 'text-gray-500' : 'text-slate-400'}`}>
                30{labels.minutesAgo}
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              +2 ⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
