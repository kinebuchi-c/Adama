'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import Link from 'next/link';
import PiggyBank from '@/components/piggybank/PiggyBank';
import CharacterAvatar from '@/components/characters/CharacterAvatar';

export default function HomePage() {
  const { user, loading, isConfigured } = useAuth();
  const { player } = useDemo();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl animate-bounce">🐷</div>
          <p className="mt-4 text-gray-600">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage isConfigured={isConfigured} appearance={player?.appearance} />;
  }

  if (user.role === 'child') {
    return <ChildDashboard userName={user.displayName} />;
  }

  return <ParentDashboard />;
}

function LandingPage({ isConfigured, appearance }: { isConfigured: boolean; appearance?: import('@/types').AvatarAppearance }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <CharacterAvatar size="xl" expression="happy" appearance={appearance} />
        <h2 className="text-3xl font-bold text-gray-800 mt-6">
          おこづかいアップ大作戦
        </h2>
        <p className="text-gray-600 mt-2">
          お手伝いでおこづかいをためよう！
        </p>

        {/* Demo mode buttons */}
        <div className="mt-8 space-y-4">
          <p className="text-sm text-amber-600 font-medium">🎮 デモモードで体験</p>
          <Link
            href="/demo/child"
            className="block w-full max-w-xs mx-auto py-3 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            🧒 こどもモードで試す
          </Link>
          <Link
            href="/demo/parent"
            className="block w-full max-w-xs mx-auto py-3 px-6 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            👨‍👩‍👧 おやモードで試す
          </Link>
        </div>

        {isConfigured && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">アカウントをお持ちの方</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/auth/login"
                className="py-2 px-6 bg-amber-500 text-white font-bold rounded-full text-sm hover:bg-amber-600 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="py-2 px-6 bg-white text-amber-600 font-bold rounded-full text-sm border-2 border-amber-500 hover:bg-amber-50 transition-colors"
              >
                新規登録
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="✨"
            title="お手伝いをする"
            description="お手伝いを選んで「やったよ」と送ろう"
          />
          <FeatureCard
            icon="✅"
            title="おやが確認"
            description="本当にできているか親が確認するよ"
          />
          <FeatureCard
            icon="🐷"
            title="お金がたまる"
            description="承認されるとお金がたまっていくよ"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
}

function ChildDashboard({ userName }: { userName?: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          こんにちは{userName ? `、${userName}` : ''}！
        </h2>
        <p className="text-gray-600">きょうもがんばろう！</p>
      </div>

      <PiggyBank amount={350} />

      <div className="mt-8">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          きょうのおてつだい
        </h3>
        <Link
          href="/tasks"
          className="block w-full py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg text-center text-lg hover:shadow-xl transition-shadow"
        >
          ✨ おてつだいをえらぶ
        </Link>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          まっているもの
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-center py-4">
            しょうにんまちのおてつだいはないよ
          </p>
        </div>
      </div>
    </div>
  );
}

function ParentDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">保護者ダッシュボード</h2>
      </div>

      <div className="grid gap-4">
        <Link
          href="/approve"
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">✅</span>
            <div>
              <h3 className="font-bold text-lg">承認待ち</h3>
              <p className="text-gray-600 text-sm">子どもの完了報告を確認</p>
            </div>
            <span className="ml-auto bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              2
            </span>
          </div>
        </Link>

        <Link
          href="/settings/tasks"
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">📝</span>
            <div>
              <h3 className="font-bold text-lg">お手伝い管理</h3>
              <p className="text-gray-600 text-sm">お手伝いの追加・編集</p>
            </div>
          </div>
        </Link>

        <Link
          href="/savings"
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🐷</span>
            <div>
              <h3 className="font-bold text-lg">貯金状況</h3>
              <p className="text-gray-600 text-sm">子どもの貯金額を確認</p>
            </div>
          </div>
        </Link>

        <Link
          href="/report"
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">📊</span>
            <div>
              <h3 className="font-bold text-lg">週間レポート</h3>
              <p className="text-gray-600 text-sm">今週のがんばりを見る</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
