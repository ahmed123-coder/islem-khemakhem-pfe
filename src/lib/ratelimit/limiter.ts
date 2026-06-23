// SECURITY: Rate Limiting - Redis-backed rate limiter implementation
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RATE_LIMIT_CONFIG, RateLimitTier } from './config';

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Initialize Redis client (Requirement 2.5)
const redis = process.env.REDIS_URL && process.env.REDIS_TOKEN
  ? new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN
    })
  : null;

// Create rate limiters for each tier (Requirement 2.1, 2.2, 2.3, 2.9)
export const rateLimiters = {
  default: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.default.requests,
          RATE_LIMIT_CONFIG.default.window
        ),
        analytics: true,
        prefix: 'ratelimit:default'
      })
    : null,
    
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.auth.requests,
          RATE_LIMIT_CONFIG.auth.window
        ),
        analytics: true,
        prefix: 'ratelimit:auth'
      })
    : null,
    
  upload: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.upload.requests,
          RATE_LIMIT_CONFIG.upload.window
        ),
        analytics: true,
        prefix: 'ratelimit:upload'
      })
    : null,
    
  websocket: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.websocket.requests,
          RATE_LIMIT_CONFIG.websocket.window
        ),
        analytics: true,
        prefix: 'ratelimit:ws'
      })
    : null,
    
  public: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.public.requests,
          RATE_LIMIT_CONFIG.public.window
        ),
        analytics: true,
        prefix: 'ratelimit:public'
      })
    : null
};

/**
 * Check rate limit for an identifier (Requirement 2.6, 2.7, 2.8)
 * 
 * @param identifier - IP address or user ID
 * @param tier - Rate limit tier to apply
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'default'
): Promise<RateLimitResult> {
  const limiter = rateLimiters[tier];
  
  // If no Redis configured, allow all requests (development fallback)
  if (!limiter) {
    return {
      success: true,
      limit: RATE_LIMIT_CONFIG[tier].requests,
      remaining: RATE_LIMIT_CONFIG[tier].requests,
      reset: Date.now() + 900000 // 15 minutes
    };
  }
  
  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000)
  };
}

/**
 * Get rate limit identifier from request (Requirement 2.6, 2.7)
 * 
 * Uses user ID for authenticated requests, IP for unauthenticated
 * 
 * @param request - HTTP request
 * @param userId - Optional user ID for authenticated requests
 * @returns Rate limit identifier
 */
export function getRateLimitIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Get IP from headers (Vercel/Cloudflare)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}
// END SECURITY: Rate Limiting - Implementation complete
