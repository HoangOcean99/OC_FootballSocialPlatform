import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';

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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
