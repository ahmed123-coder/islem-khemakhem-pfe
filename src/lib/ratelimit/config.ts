// SECURITY: Rate Limiting - Configuration for rate limit tiers

/**
 * Rate limit configuration for different endpoint types
 * Requirements: 2.1, 2.2, 2.3, 2.9
 */
export const RATE_LIMIT_CONFIG = {
  // Default limits for all endpoints (Requirement 2.1)
  default: {
    requests: 100,
    window: '15 m' as const
  },
  
  // Authentication endpoints - stricter limits (Requirement 2.2)
  auth: {
    requests: 5,
    window: '15 m' as const
  },
  
  // File upload endpoints (Requirement 2.3)
  upload: {
    requests: 20,
    window: '1 m' as const
  },
  
  // WebSocket connections (Requirement 2.9)
  websocket: {
    requests: 10,
    window: '1 m' as const
  },
  
  // Public endpoints - more lenient
  public: {
    requests: 200,
    window: '15 m' as const
  }
} as const;

export type RateLimitTier = keyof typeof RATE_LIMIT_CONFIG;
// END SECURITY: Rate Limiting - Configuration complete
