import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ChallengeProvider } from '@/context/ChallengeContext';

export const metadata: Metadata = {
  title: '5만 원 챌린지 - 자매 협동 & 솔로 페이스메이커',
  description: '일주일 동안 5만 원으로 버티는 자매 협동 & 솔로 소비 페이스메이커 웹 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '5만 챌린지',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <ChallengeProvider>{children}</ChallengeProvider>
      </body>
    </html>
  );
}
