import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';
import { NextResponse, NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('footballverse_token')?.value;

  // Protect nested routes
  const protectedPattern = /^\/(vi|en|ja)?\/?(home|profile|communities|matches|predictions|competitions|onboarding)(\/|$)/;
  if (protectedPattern.test(request.nextUrl.pathname) && !token) {
    const localeMatch = request.nextUrl.pathname.match(/^\/(vi|en|ja)/);
    const locale = localeMatch ? localeMatch[1] : 'vi';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Prevent accessing auth pages if already logged in
  const authPattern = /^\/(vi|en|ja)?\/?(login|register)(\/|$)/;
  if (authPattern.test(request.nextUrl.pathname) && token) {
    const localeMatch = request.nextUrl.pathname.match(/^\/(vi|en|ja)/);
    const locale = localeMatch ? localeMatch[1] : 'vi';
    return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
