'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals } from '@/hooks/useProposals';

export default function SettingsPage() {
  const { user } = useAuth();
  const { pendingCount } = useProposals({ mode: 'pending' });

  // Generate a family code for sharing
  const familyCode = user?.familyId?.slice(0, 8).toUpperCase() || 'ABCD1234';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">設定</h1>

      <div className="space-y-4">
        {/* Family code */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-bold text-lg text-gray-800 mb-2">
            家族コード
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            子どもがアカウントを作るときに使います
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-center text-xl font-mono font-bold tracking-wider">
              {familyCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(familyCode);
                alert('コピーしました！');
              }}
              className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
            >
              📋
            </button>
          </div>
        </div>

        {/* Task management */}
        <Link
          href="/settings/tasks"
          className="block bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📝</span>
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                お手伝い管理
              </h2>
              <p className="text-sm text-gray-600">
                お手伝いの追加・編集・削除
              </p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </div>
        </Link>

        {/* Proposals management */}
        <Link
          href="/settings/proposals"
          className="block bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                提案の確認
              </h2>
              <p className="text-sm text-gray-600">
                子どもからの提案を確認・承認
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {pendingCount}
              </span>
            )}
            <span className="ml-auto text-gray-400">→</span>
          </div>
        </Link>

        {/* Children management */}
        <Link
          href="/settings/children"
          className="block bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">👨‍👩‍👧‍👦</span>
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                子ども管理
              </h2>
              <p className="text-sm text-gray-600">
                登録されている子どもの確認
              </p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </div>
        </Link>

        {/* Notification settings */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🔔</span>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-800">
                通知設定
              </h2>
              <p className="text-sm text-gray-600">
                承認リクエストの通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
