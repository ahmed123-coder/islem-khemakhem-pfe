import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './src/lib/auth'

const publicRoutes = ['/', '/solutions', '/ressources', '/contact', '/login', '/register', '/approches', ]
const adminRoutes = ['/admin']
const consultantRoutes = ['/consultant']
const clientRoutes = ['/client']

/**
 * Apply security headers to response (Requirements 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8)
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // SECURITY: Security Headers - Protects against common web vulnerabilities
  
  // Prevent clickjacking (Requirement 5.1)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing (Requirement 5.2)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS protection for legacy browsers (Requirement 5.3)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy (Requirement 5.7)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy (Requirement 5.8)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy (Requirement 5.5, 5.6)
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
  
  // HSTS for production (Requirement 5.4)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // END SECURITY: Security Headers - Implementation complete
  
  return response;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // SECURITY: RBAC - Role-Based Access Control for route protection
  
  // 1. Check if route is public (allow without authentication)
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(route + '/');
  });

  if (isPublicRoute) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // 2. Authentication check - require valid token for all protected routes
  if (!token) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return applySecurityHeaders(response);
  }

  // 3. Verify token validity
  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return applySecurityHeaders(response);
  }

  // 4. Authorization check - verify role permissions for protected routes
  // CRITICAL FIX: Check role-specific routes and RETURN immediately to prevent fallthrough
  
  // Admin routes - ONLY ADMIN allowed
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'ADMIN') {
      // Unauthorized access attempt - redirect to home
      const response = NextResponse.redirect(new URL('/', request.url));
      return applySecurityHeaders(response);
    }
    // Admin authorized - allow access
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Consultant routes - ONLY CONSULTANT allowed (removed ADMIN access)
  if (consultantRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'CONSULTANT') {
      // Unauthorized access attempt - redirect to home
      const response = NextResponse.redirect(new URL('/', request.url));
      return applySecurityHeaders(response);
    }
    // Consultant authorized - allow access
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Client routes - ONLY CLIENT allowed (removed ADMIN access)
  if (clientRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'CLIENT') {
      // Unauthorized access attempt - redirect to home
      const response = NextResponse.redirect(new URL('/', request.url));
      return applySecurityHeaders(response);
    }
    // Client authorized - allow access
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // 5. All other authenticated routes - allow access
  const response = NextResponse.next();
  return applySecurityHeaders(response);
  
  // END SECURITY: RBAC - Route protection complete
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g. /logo.png, /hero.jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
