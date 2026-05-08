// SECURITY: CSRF Protection - API endpoint for CSRF token retrieval
import { NextResponse } from 'next/server';
import { createCsrfTokenPair } from '@/lib/csrf/token';

/**
 * GET /api/csrf
 * 
 * Returns a CSRF token and sets the signature in an HTTP-only cookie
 * Requirements: 6.1, 6.2
 */
export async function GET() {
  const { token, signature } = createCsrfTokenPair();
  
  const response = NextResponse.json({
    token
  });
  
  // Set signature in HTTP-only cookie
  response.cookies.set('csrf_signature', signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  return response;
}
// END SECURITY: CSRF Protection - API endpoint complete
