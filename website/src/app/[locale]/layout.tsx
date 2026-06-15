import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PitchGrid',
    template: '%s | PitchGrid',
  },
  description:
    'PitchGrid — The leading football social network. Follow live matches, join fan communities, predict results, and connect with millions of football fans.',
  keywords: ['football', 'social network', 'live matches', 'predictions'],
  authors: [{ name: 'PitchGrid Team' }],
  themeColor: '#080d14',
};

import NextTopLoader from 'nextjs-toploader';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  console.log('RootLayout received locale:', locale);
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as 'vi' | 'en' | 'ja')) {
    console.log('Locale not valid, calling notFound');
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body
        className="antialiased font-sans"
        style={{ backgroundColor: '#080d14', color: 'white', minHeight: '100vh' }}
      >
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader 
            color="#22c55e"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #22c55e,0 0 5px #22c55e"
          />
          {children}
          <Toaster 
            position="bottom-center" 
            toastOptions={{ 
              style: { 
                background: '#1e293b', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)' 
              } 
            }} 
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
