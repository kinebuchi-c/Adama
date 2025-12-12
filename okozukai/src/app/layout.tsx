import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { DemoProvider } from '@/contexts/DemoContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'おこづかいアップ大作戦',
  description: 'お手伝いでおこづかいをためよう！',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased bg-amber-50`}>
        <AuthProvider>
          <DemoProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-20">{children}</main>
              <BottomNav />
            </div>
          </DemoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
