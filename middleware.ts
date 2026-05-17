import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';
import { locales, defaultLocale } from './src/i18n/request';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
  
  if (!hasLocale) {
    const locale = request.cookies.get('locale')?.value || defaultLocale;
    const newPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    const response = NextResponse.redirect(new URL(newPath, request.url));
    applySecurityHeaders(response);
    return response;
  }

  const localeDetectionResponse = createMiddleware({
    locales,
    defaultLocale,
    localeDetection: false,
  })(request);

  const response = localeDetectionResponse || NextResponse.next();
  const locale = response.headers.get('x-next-intl-locale') || defaultLocale;

  applySecurityHeaders(response);

  const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

  const publicRoutes = ['/', '/solutions', '/ressources', '/contact', '/login', '/register', '/approches'];
  const adminRoutes = ['/admin'];
  const consultantRoutes = ['/consultant'];
  const clientRoutes = ['/client'];

  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/');
  });

  if (isPublicRoute) {
    return response;
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const payload = verifyToken(token);

  if (!payload) {
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    const invalidResponse = NextResponse.redirect(redirectUrl);
    invalidResponse.cookies.delete('auth_token');
    applySecurityHeaders(invalidResponse);
    return invalidResponse;
  }

  if (adminRoutes.some(route => pathWithoutLocale.startsWith(route))) {
    if (payload.role !== 'ADMIN') {
      const redirectUrl = new URL(`/${locale}/`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (consultantRoutes.some(route => pathWithoutLocale.startsWith(route))) {
    if (payload.role !== 'CONSULTANT') {
      const redirectUrl = new URL(`/${locale}/`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (clientRoutes.some(route => pathWithoutLocale.startsWith(route))) {
    if (payload.role !== 'CLIENT') {
      const redirectUrl = new URL(`/${locale}/`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  return response;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com",
    "frame-src 'self' https://www.google.com",
    "upgrade-insecure-requests"
  ];
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}