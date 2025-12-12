'use client';

import Link from 'next/link';
import StarJar from '@/components/stars/StarJar';
import { conversationPrompts } from '@/lib/valueLessons';

export default function ChildDemoPage() {
  // サンプルの次のごほうび
  const nextReward = {
    id: '1',
    familyId: '1',
    name: 'すきなおかし',
    starsRequired: 10,
    icon: '🍭',
    isActive: true,
    createdAt: new Date(),
  };

  // 今日の会話プロンプト
  const todayPrompt = conversationPrompts[Math.floor(Math.random() * conversationPrompts.length)];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Demo badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          🎮 デモモード（こども）
        </span>
        <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
          ← もどる
        </Link>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">こんにちは、たろう！</h2>
        <p className="text-gray-600">今日も星を集めよう！</p>
      </div>

      <StarJar
        totalStars={7}
        nextReward={nextReward}
      />

      <div className="mt-8">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          今日のお手伝い
        </h3>
        <Link
          href="/tasks"
          className="block w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg text-center text-lg hover:shadow-xl transition-shadow"
        >
          ⭐ 星を集める
        </Link>
      </div>

      <div className="mt-6">
        <Link
          href="/propose"
          className="block w-full py-3 px-6 bg-white text-amber-600 font-bold rounded-2xl shadow text-center hover:shadow-lg transition-shadow border-2 border-amber-200"
        >
          💡 新しいお手伝いを提案する
        </Link>
      </div>

      {/* ショップ・着せ替え */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/shop"
          className="py-4 px-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-2xl shadow text-center hover:shadow-lg transition-shadow"
        >
          🛍️ ショップ
        </Link>
        <Link
          href="/customize"
          className="py-4 px-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-white font-bold rounded-2xl shadow text-center hover:shadow-lg transition-shadow"
        >
          ✨ 着せ替え
        </Link>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          承認待ち
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="flex items-center gap-3 py-2">
            <span className="text-2xl">🧽</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800">食器洗い</p>
              <p className="text-xs text-gray-500">30分前</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <span>⭐⭐</span>
              <span className="text-xs">待ち</span>
            </div>
          </div>
        </div>
      </div>

      {/* 親子の会話プロンプト */}
      <div className="mt-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>💬</span>
          今日の話題
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          親と一緒に話してみよう！
        </p>
        <div className="bg-white rounded-xl p-4">
          <p className="text-gray-800 font-medium mb-2">{todayPrompt.topic}</p>
          <ul className="space-y-2">
            {todayPrompt.questions.slice(0, 2).map((q, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-purple-400">•</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
