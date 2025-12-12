'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  roles: ('parent' | 'child')[];
}

const navItems: NavItem[] = [
  { href: '/', icon: '🏠', label: 'ホーム', roles: ['parent', 'child'] },
  { href: '/tasks', icon: '✨', label: 'お手伝い', roles: ['child'] },
  { href: '/shop', icon: '🛍️', label: 'ショップ', roles: ['child'] },
  { href: '/approve', icon: '✅', label: '承認', roles: ['parent'] },
  { href: '/savings', icon: '⭐', label: '星集め', roles: ['parent', 'child'] },
  { href: '/settings', icon: '⚙️', label: '設定', roles: ['parent'] },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around py-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-100 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
