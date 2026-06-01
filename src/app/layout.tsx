import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import ClientSWRegistration from '@/components/ClientSWRegistration';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'صِحتنا | Family Health Companion',
  description: 'The Family Health Companion - A Serverless, Local-First medical utility app for medication adherence. صِحتنا - تطبيق محلي بدون خادم لتتبع ومتابعة الأدوية.',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.className} bg-slate-50/50 text-slate-800 antialiased selection:bg-teal-200 selection:text-teal-900`}>
        <LanguageProvider>
          <ClientSWRegistration />
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
