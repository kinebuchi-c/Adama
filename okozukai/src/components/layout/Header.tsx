'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-amber-400 to-orange-400 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🐷</span>
            <h1 className="text-xl font-bold text-white">
              おこづかいアップ大作戦
            </h1>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">
                {user.displayName}
                <span className="ml-1 text-xs opacity-75">
                  ({user.role === 'parent' ? 'おや' : 'こども'})
                </span>
              </span>
              <button
                onClick={signOut}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
