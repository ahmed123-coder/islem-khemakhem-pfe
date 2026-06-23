// SECURITY: CSRF Protection - Middleware for CSRF validation
import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken, createCsrfTokenPair } from './token';

/**
 * Validate CSRF token for state-changing requests (Requirement 6.3, 6.4, 6.5)
 * 
 * @param request - HTTP request
 * @returns Error response if validation fails, null otherwise
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Skip if CSRF is disabled (Requirement 6.10)
  if (process.env.DISABLE_CSRF === 'true') {
    return null;
  }
  
  const method = request.method;
  
  // Exempt GET and HEAD requests (Requirement 6.6)
  if (method === 'GET' || method === 'HEAD') {
    return null;
  }
  
  // Exempt authentication endpoints (Requirement 6.7)
  const pathname = request.nextUrl.pathname;
  if (pathname.includes('/api/auth/')) {
    return null;
  }
  
  // Get CSRF token from header
  const token = request.headers.get('x-csrf-token');
  
  // Get CSRF signature from cookie
  const signature = request.cookies.get('csrf_signature')?.value;
  
  // Validate token and signature
  if (!token || !signature || !verifyCsrfToken(token, signature)) {
    return NextResponse.json(
      {
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Set CSRF cookie (Requirement 6.1, 6.2)
 * 
 * @param response - HTTP response
 * @returns Response with CSRF cookie set
 */
export function setCsrfCookie(response: NextResponse): NextResponse {
  const { token, signature } = createCsrfTokenPair();
  
  // Set signature in HTTP-only cookie
  response.cookies.set('csrf_signature', signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  // Return token in response body (client will include in headers)
  return response;
}
// END SECURITY: CSRF Protection - Middleware complete
