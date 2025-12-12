'use client';

import Link from 'next/link';
import { conversationPrompts } from '@/lib/valueLessons';

export default function ParentDemoPage() {
  // 今週の会話プロンプト
  const weeklyPrompt = conversationPrompts[Math.floor(Math.random() * conversationPrompts.length)];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Demo badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          🎮 デモモード（おや）
        </span>
        <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
          ← もどる
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">保護者ダッシュボード</h2>
        <p className="text-gray-600 text-sm">たろうのがんばり</p>
      </div>

      {/* Summary card - 親には金額も表示 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">たろうの ほし</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl">⭐</span>
              <span className="text-4xl font-bold">7</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">今週のがんばり</p>
            <p className="text-xl font-bold">+5 ⭐</p>
          </div>
        </div>
        {/* 親だけに見える金額換算 */}
        <div className="bg-white/20 rounded-xl p-3 mt-2">
          <p className="text-white/80 text-xs mb-1">💰 金額換算（親のみ表示）</p>
          <p className="text-white font-medium">
            7ほし = 約70円相当
            <span className="text-white/60 text-xs ml-2">（1ほし=10円で設定中）</span>
          </p>
        </div>
      </div>

      {/* 子どもからの提案 */}
      <div className="bg-amber-50 rounded-2xl p-4 mb-6 border-2 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💡</span>
          <h3 className="font-bold text-amber-800">たろうからのていあん</h3>
          <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            1件
          </span>
        </div>
        <p className="text-amber-700 text-sm mb-3">
          子どもが新しいお手伝いを提案しています
        </p>
        <Link
          href="/proposals"
          className="block w-full py-2 px-4 bg-amber-500 text-white font-bold rounded-xl text-center text-sm hover:bg-amber-600 transition-colors"
        >
          確認する
        </Link>
      </div>

      <div className="grid gap-4">
        <Link
          href="/approve"
          className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <h3 className="font-bold text-lg">承認待ち</h3>
              <p className="text-gray-600 text-sm">完了報告を確認・承認</p>
            </div>
            <span className="ml-auto bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              2
            </span>
          </div>
        </Link>

        <Link
          href="/settings/tasks"
          className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📝</span>
            <div>
              <h3 className="font-bold text-lg">お手伝い管理</h3>
              <p className="text-gray-600 text-sm">お手伝いの追加・ほしの設定</p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings/rewards"
          className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="font-bold text-lg">ごほうび設定</h3>
              <p className="text-gray-600 text-sm">何ほしで何がもらえるか設定</p>
            </div>
          </div>
        </Link>

        <Link
          href="/report"
          className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="font-bold text-lg">週間レポート</h3>
              <p className="text-gray-600 text-sm">がんばりの振り返り</p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings"
          className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚙️</span>
            <div>
              <h3 className="font-bold text-lg">設定</h3>
              <p className="text-gray-600 text-sm">家族コード・ほし換算レート</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 親子の会話サポート */}
      <div className="mt-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>💬</span>
          今週の会話テーマ
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          お子さんと話すきっかけに使ってください
        </p>
        <div className="bg-white rounded-xl p-4">
          <p className="text-gray-800 font-medium mb-2">{weeklyPrompt.topic}</p>
          <ul className="space-y-2">
            {weeklyPrompt.questions.map((q, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-teal-400">•</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 ヒント：お手伝いの後や寝る前など、リラックスした時間に話してみましょう
        </p>
      </div>

      {/* 教育的なヒント */}
      <div className="mt-6 bg-blue-50 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📚</span>
          今週のヒント
        </h3>
        <p className="text-sm text-gray-700">
          「ほし」をお金に直結させず、努力や達成感を大切にしましょう。
          お子さんが「どんな気持ちだった？」と聞かれて答えられることが、
          お金の価値を学ぶ第一歩になります。
        </p>
      </div>
    </div>
  );
}
