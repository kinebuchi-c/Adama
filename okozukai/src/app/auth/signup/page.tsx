'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import CharacterAvatar from '@/components/characters/CharacterAvatar';

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setError('');
    setLoading(true);

    try {
      await signUp(
        email,
        password,
        displayName,
        role,
        role === 'child' ? familyCode : undefined
      );
      router.push('/');
    } catch {
      setError('アカウントを作れませんでした。もう一度試してください。');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐷</div>
          <h1 className="text-2xl font-bold text-gray-800">あなたはどっち？</h1>
          <p className="text-gray-600 mt-2">やくわりをえらんでね</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('parent')}
            className="w-full p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-amber-400"
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl">👨‍👩‍👧</span>
              <div className="text-left">
                <h3 className="font-bold text-xl text-gray-800">おや</h3>
                <p className="text-gray-600 text-sm">
                  お手伝いを管理する・承認する
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('child')}
            className="w-full p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-amber-400"
          >
            <div className="flex items-center gap-4">
              <CharacterAvatar size="sm" />
              <div className="text-left">
                <h3 className="font-bold text-xl text-gray-800">こども</h3>
                <p className="text-gray-600 text-sm">
                  お手伝いをしておこづかいをためる
                </p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">
          アカウントがある？{' '}
          <Link href="/auth/login" className="text-amber-600 font-medium hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button
        onClick={() => setStep('role')}
        className="text-gray-600 hover:text-gray-800 mb-4"
      >
        ← もどる
      </button>

      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          {role === 'parent' ? '👨‍👩‍👧' : '🐷'}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {role === 'parent' ? 'おやのアカウント' : 'こどものアカウント'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            なまえ
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            placeholder={role === 'parent' ? 'おとうさん・おかあさん' : 'なまえ'}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            placeholder="6もじいじょう"
          />
        </div>

        {role === 'child' && (
          <div>
            <label
              htmlFor="familyCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              かぞくコード
            </label>
            <input
              type="text"
              id="familyCode"
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="おやにきいてね"
            />
            <p className="text-xs text-gray-500 mt-1">
              おやがアカウントをつくったときにもらえるよ
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-amber-500 text-white font-bold rounded-full shadow-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'つくっているよ...' : 'アカウントをつくる'}
        </button>
      </form>
    </div>
  );
}
