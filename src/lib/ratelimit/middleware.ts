// SECURITY: Rate Limiting - Middleware for rate limit enforcement
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from './limiter';
import { RateLimitTier } from './config';

/**
 * Rate limit middleware (Requirement 2.4, 2.8)
 * 
 * Checks rate limit and returns 429 if exceeded
 * 
 * @param request - HTTP request
 * @param tier - Rate limit tier to apply
 * @param userId - Optional user ID for authenticated requests
 * @returns 429 response if rate limit exceeded, null otherwise
 */
export async function withRateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'default',
  userId?: string
): Promise<NextResponse | null> {
  // Get identifier
  const identifier = getRateLimitIdentifier(request, userId);
  
  // Check rate limit
  const result = await checkRateLimit(identifier, tier);
  
  // If rate limit exceeded, return 429
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': result.retryAfter?.toString() || '60'
        }
      }
    );
  }
  
  // Continue to handler
  return null;
}

/**
 * Add rate limit headers to response (Requirement 2.4)
 * 
 * @param response - HTTP response
 * @param result - Rate limit result
 * @returns Response with rate limit headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: { limit: number; remaining: number; reset: number }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}
// END SECURITY: Rate Limiting - Middleware complete
