import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/navigation';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  console.log('getRequestConfig received requestLocale:', locale);

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  console.log('getRequestConfig resolved locale:', locale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
