# Implementation Plan: Security & Foundation Improvements

## Overview

This implementation plan breaks down the security and foundation improvements into actionable coding tasks following the 7-phase roadmap. The implementation uses TypeScript with Next.js 14, Prisma, and Socket.io. Each task builds incrementally toward a production-ready security infrastructure.

## Tasks

### Phase 1: Foundation (Environment Validation, Logging, Error Handling)

- [x] 1. Set up environment variable validation system
  - [x] 1.1 Install Zod dependency for schema validation
    - Run `npm install zod`
    - _Requirements: 4.1, 4.2_
    [x] 1.2 Create environment schema with all required variables
    - Create `src/lib/env/schema.ts`
    - Define Zod schema for all environment variables (DATABASE_URL, JWT_SECRET, CLOUDINARY, ZOOM, REDIS, SENTRY, etc.)
    - Include validation rules (min length for secrets, URL format, enum for NODE_ENV)
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.9_
  
  - [x] 1.3 Implement environment validator with startup validation
    - Create `src/lib/env/validator.ts`
    - Implement `validateEnv()` function that parses and validates environment variables
    - Implement `getEnv()` function for type-safe access
    - Add error logging and process exit on validation failure
    - _Requirements: 4.1, 4.7, 4.8, 4.10_
  
  - [x] 1.4 Create environment module with auto-validation
    - Create `src/lib/env/index.ts`
    - Call `validateEnv()` on module load
    - Export validated environment object
    - _Requirements: 4.10_
  
  - [x] 1.5 Update server.js to validate environment on startup
    - Import and call `validateEnv()` before server initialization
    - Add startup logging for successful validation
    - _Requirements: 4.1_
  
  - [x] 1.6 Update .env.example with all required variables
    - Document all environment variables with descriptions
    - Include security configuration variables
    - Add rate limiting and logging configuration
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.9_

- [~] 2. Implement structured logging system
  - [x] 2.1 Create logger types and interfaces
    - Create `src/lib/logger/types.ts`
    - Define LogLevel, LogContext, and LogEntry types
    - _Requirements: 7.1, 7.2_
  
  - [-] 2.2 Implement core logger with structured JSON output
    - Create `src/lib/logger/logger.ts`
    - Implement Logger class with debug, info, warn, error, fatal methods
    - Add log level filtering based on LOG_LEVEL environment variable
    - Format logs as JSON with timestamp, level, message, and context
    - _Requirements: 7.1, 7.2, 7.10, 7.11, 7.12_
  
  - [~] 2.3 Add sensitive data redaction to logger
    - Implement `redactSensitiveData()` method
    - Redact password, token, secret, apiKey, authorization, cookie, creditCard, ssn fields
    - Apply recursively to nested objects and arrays
    - _Requirements: 7.9_
  
  - [~] 2.4 Add request logging helpers
    - Implement `logRequest()` method with method, path, status, duration
    - Implement `logAuthSuccess()` and `logAuthFailure()` methods
    - Implement `logAudit()` method for audit events
    - Include Request_Context in all logs
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.8, 15.1, 15.2, 15.3, 15.4, 15.9_
  
  - [ ] 2.5 Write unit tests for logger
    - Test log level filtering
    - Test sensitive data redaction
    - Test log format structure
    - Test request logging helpers

- [~] 3. Create centralized error handling system
  - [~] 3.1 Define error class hierarchy
    - Create `src/lib/errors/types.ts`
    - Implement AppError base class with statusCode, code, isOperational
    - Implement ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, RateLimitError, DatabaseError, InternalServerError classes
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [~] 3.2 Create error codes constants
    - Create `src/lib/errors/codes.ts`
    - Define all error codes (VALIDATION_ERROR, AUTHENTICATION_ERROR, etc.)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [~] 3.3 Implement centralized error handler
    - Create `src/lib/errors/handler.ts`
    - Implement `handleError()` function that processes all error types
    - Generate unique request IDs for tracing
    - Map errors to appropriate HTTP status codes
    - Handle Prisma errors and Zod validation errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  
  - [~] 3.4 Add error logging and context capture
    - Log all errors with Request_Context (requestId, method, url, userAgent, ip)
    - Include error details in logs
    - Never expose sensitive information in error responses
    - _Requirements: 3.9, 3.11_
  
  - [~] 3.5 Create standardized response helpers
    - Implement `successResponse()` helper for consistent success responses
    - Implement `paginatedResponse()` helper for list endpoints
    - Format: `{ data: T, message?: string }` for success
    - Format: `{ error: string, code: string, details?: object, requestId: string }` for errors
    - _Requirements: 10.1, 10.2, 10.4, 10.9_
  
  - [ ] 3.6 Write unit tests for error handling
    - Test each error type produces correct status code
    - Test error response format
    - Test sensitive data is not exposed
    - Test Prisma error mapping

- [~] 4. Checkpoint - Verify foundation components
  - Ensure environment validation works and prevents startup with invalid config
  - Ensure logger outputs structured JSON logs
  - Ensure error handler returns consistent error responses
  - Run unit tests for all foundation components
  - Ask the user if questions arise

### Phase 2: Input Validation (Zod Schemas, API Validation)

- [~] 5. Create validation infrastructure
  - [~] 5.1 Create common validation schemas
    - Create `src/lib/validation/schemas/common.schemas.ts`
    - Implement cuidSchema, emailSchema, passwordSchema, phoneSchema
    - Implement paginationSchema, dateRangeSchema, fileUploadSchema
    - _Requirements: 1.4, 1.6, 1.7, 1.8_
  
  - [~] 5.2 Implement validation utility functions
    - Create `src/lib/validation/validator.ts`
    - Implement ValidationException class
    - Implement `validate()` function that throws on error
    - Implement `validateSafe()` function that returns result object
    - Map Zod errors to ValidationError format
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [~] 5.3 Create input sanitization functions
    - Create `src/lib/validation/sanitizer.ts`
    - Implement XSS prevention for string inputs
    - Implement HTML entity encoding
    - _Requirements: 1.5, 11.1_
  
  - [ ] 5.4 Write unit tests for validation utilities
    - Test validate() throws on invalid input
    - Test validateSafe() returns error result
    - Test error message formatting

- [~] 6. Create domain-specific validation schemas
  - [~] 6.1 Create authentication validation schemas
    - Create `src/lib/validation/schemas/auth.schemas.ts`
    - Implement loginSchema, registerSchema, passwordResetSchema, passwordChangeSchema
    - Enforce password requirements (8+ chars, uppercase, lowercase, number, special char)
    - _Requirements: 1.6, 9.1_
  
  - [~] 6.2 Create user management validation schemas
    - Create `src/lib/validation/schemas/user.schemas.ts`
    - Implement schemas for user profile updates, role changes
    - _Requirements: 1.4, 1.7_
  
  - [~] 6.3 Create order validation schemas
    - Create `src/lib/validation/schemas/order.schemas.ts`
    - Implement schemas for order creation, updates, status changes
    - _Requirements: 1.4, 1.7_
  
  - [~] 6.4 Create service validation schemas
    - Create `src/lib/validation/schemas/service.schemas.ts`
    - Implement schemas for service creation, updates, tier management
    - _Requirements: 1.4, 1.7_
  
  - [~] 6.5 Create file upload validation schema
    - Implement schema for file uploads with size and MIME type validation
    - Validate file size limits (10MB for images, 50MB for documents)
    - Validate allowed MIME types (image/jpeg, image/png, image/webp, application/pdf)
    - _Requirements: 11.1, 11.2, 11.3, 11.9_
  
  - [~] 6.6 Create validation schema index
    - Create `src/lib/validation/schemas/index.ts`
    - Export all schemas for easy import
    - _Requirements: 1.8_
  
  - [ ] 6.7 Write unit tests for all validation schemas
    - Test each schema with valid inputs
    - Test each schema with invalid inputs
    - Test edge cases and boundary conditions

- [~] 7. Create API route wrapper with integrated validation
  - [~] 7.1 Implement API handler wrapper
    - Create `src/lib/api/wrapper.ts`
    - Implement `createApiHandler()` function with options for validation, auth, rate limiting, CSRF
    - Implement ApiHandlerOptions interface with bodySchema, querySchema, rateLimit, requireAuth, allowedRoles, csrf
    - Implement ApiContext interface with request, body, query, user
    - _Requirements: 1.1, 1.2_
  
  - [~] 7.2 Integrate validation into API wrapper
    - Validate request body against bodySchema for POST/PUT/PATCH requests
    - Validate query parameters against querySchema
    - Call error handler on validation failure
    - _Requirements: 1.2, 1.3_
  
  - [~] 7.3 Add request logging to API wrapper
    - Log all requests with method, path, status, duration
    - Include user ID and user agent in logs
    - _Requirements: 7.4_
  
  - [ ] 7.4 Write integration tests for API wrapper
    - Test validation integration
    - Test error handling
    - Test request logging

### Phase 3: Rate Limiting (Redis, Rate Limiter)

- [~] 8. Set up Redis for rate limiting
  - [~] 8.1 Install rate limiting dependencies
    - Run `npm install @upstash/ratelimit @upstash/redis`
    - _Requirements: 2.5_
  
  - [~] 8.2 Create rate limit configuration
    - Create `src/lib/ratelimit/config.ts`
    - Define rate limit tiers: default (100/15m), auth (5/15m), upload (20/1m), websocket (10/1m), public (200/15m)
    - Export RateLimitTier type
    - _Requirements: 2.1, 2.2, 2.3, 2.9_
  
  - [~] 8.3 Implement rate limiter with Redis
    - Create `src/lib/ratelimit/limiter.ts`
    - Initialize Redis client from REDIS_URL environment variable
    - Create rate limiters for each tier using sliding window algorithm
    - Implement `checkRateLimit()` function
    - Implement `getRateLimitIdentifier()` function (IP or user ID)
    - Add fallback to in-memory when Redis not configured
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8_
  
  - [~] 8.4 Create rate limit middleware
    - Create `src/lib/ratelimit/middleware.ts`
    - Implement `withRateLimit()` function that checks rate limit and returns 429 if exceeded
    - Add rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After)
    - Implement `addRateLimitHeaders()` helper
    - _Requirements: 2.4, 2.8_
  
  - [ ] 8.5 Write integration tests for rate limiting
    - Test rate limit enforcement with Redis
    - Test rate limit reset after window
    - Test rate limit headers in response
    - Test fallback to in-memory

- [~] 9. Integrate rate limiting into API wrapper
  - [~] 9.1 Add rate limiting to API handler wrapper
    - Call `withRateLimit()` before validation in API wrapper
    - Return 429 response if rate limit exceeded
    - Support configurable rate limit tier per endpoint
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [~] 9.2 Add rate limiting to authentication endpoints
    - Apply 'auth' tier rate limit to login, register, password reset endpoints
    - Track failed login attempts per IP and email
    - _Requirements: 2.2, 9.3, 9.4_
  
  - [ ] 9.3 Write integration tests for rate-limited endpoints
    - Test authentication endpoints enforce stricter limits
    - Test rate limit headers are present
    - Test legitimate requests are not blocked

- [~] 10. Checkpoint - Verify rate limiting works
  - Ensure rate limiting enforces limits correctly
  - Ensure rate limit headers are present in responses
  - Ensure fallback to in-memory works when Redis unavailable
  - Run integration tests for rate limiting
  - Ask the user if questions arise

### Phase 4: Security Headers & CSRF Protection

- [~] 11. Implement security headers middleware
  - [~] 11.1 Update Next.js middleware with security headers
    - Update `middleware.ts`
    - Implement `applySecurityHeaders()` function
    - Set X-Frame-Options: DENY
    - Set X-Content-Type-Options: nosniff
    - Set X-XSS-Protection: 1; mode=block
    - Set Referrer-Policy: strict-origin-when-cross-origin
    - Set Permissions-Policy to restrict browser features
    - _Requirements: 5.1, 5.2, 5.3, 5.7, 5.8_
  
  - [~] 11.2 Add Content-Security-Policy header
    - Define CSP directives for script-src, style-src, img-src, connect-src, etc.
    - Allow necessary third-party domains (Google, Cloudinary, Zoom)
    - Set upgrade-insecure-requests directive
    - _Requirements: 5.5, 5.6_
  
  - [~] 11.3 Add Strict-Transport-Security header for production
    - Set HSTS header with max-age=31536000, includeSubDomains, preload
    - Only apply in production environment
    - _Requirements: 5.4_
  
  - [~] 11.4 Configure CORS in middleware
    - Allow requests only from application domain in production
    - Allow localhost in development
    - _Requirements: 5.6, 5.10_
  
  - [~] 11.5 Update Next.js config with security headers
    - Update `next.config.js` to add security headers
    - Apply headers to all routes except static assets
    - _Requirements: 5.9_
  
  - [ ] 11.6 Write tests for security headers
    - Test all security headers are present
    - Test CSP directives are correct
    - Test HSTS only in production

- [~] 12. Implement CSRF protection
  - [~] 12.1 Create CSRF token generation and validation
    - Create `src/lib/csrf/token.ts`
    - Implement `generateCsrfToken()` function
    - Implement `signCsrfToken()` function using HMAC
    - Implement `verifyCsrfToken()` function with timing-safe comparison
    - Implement `createCsrfTokenPair()` helper
    - _Requirements: 6.1, 6.2_
  
  - [~] 12.2 Create CSRF middleware
    - Create `src/lib/csrf/middleware.ts`
    - Implement `validateCsrf()` function for POST/PUT/PATCH/DELETE requests
    - Exempt GET/HEAD requests and authentication endpoints
    - Implement `setCsrfCookie()` helper
    - Allow disabling via DISABLE_CSRF environment variable
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.10_
  
  - [~] 12.3 Create CSRF token API endpoint
    - Create `src/app/api/csrf/route.ts`
    - Return CSRF token in response body
    - Set CSRF signature in HTTP-only cookie
    - _Requirements: 6.1, 6.2_
  
  - [~] 12.4 Create client-side CSRF helper
    - Create `src/lib/api/client.ts`
    - Implement `getCsrfToken()` function to fetch token
    - Implement `apiRequest()` wrapper that adds CSRF token to state-changing requests
    - _Requirements: 6.9_
  
  - [~] 12.5 Integrate CSRF validation into API wrapper
    - Call `validateCsrf()` in API wrapper for state-changing requests
    - Return 403 if CSRF validation fails
    - _Requirements: 6.4, 6.5_
  
  - [ ] 12.6 Write unit tests for CSRF protection
    - Test token generation produces unique tokens
    - Test token verification with valid signature
    - Test token verification rejects invalid signature
    - Test timing-safe comparison
  
  - [ ] 12.7 Write integration tests for CSRF protection
    - Test POST requests without CSRF token are rejected
    - Test POST requests with valid CSRF token are accepted
    - Test GET requests don't require CSRF token

- [~] 13. Checkpoint - Verify security headers and CSRF
  - Ensure all security headers are present in responses
  - Ensure CSRF protection blocks unauthorized requests
  - Ensure CSRF token endpoint works
  - Run tests for security headers and CSRF
  - Ask the user if questions arise

### Phase 5: Monitoring (Sentry, Audit Logs)

- [~] 14. Integrate Sentry for error monitoring
  - [~] 14.1 Install Sentry dependencies
    - Run `npm install @sentry/nextjs`
    - _Requirements: 8.1_
  
  - [~] 14.2 Create Sentry configuration files
    - Create `sentry.client.config.ts` for client-side monitoring
    - Create `sentry.server.config.ts` for server-side monitoring
    - Create `sentry.edge.config.ts` for edge runtime monitoring
    - Configure DSN from SENTRY_DSN environment variable
    - Set environment and tracesSampleRate
    - _Requirements: 8.1, 8.5_
  
  - [~] 14.3 Implement Sentry data filtering
    - Filter sensitive headers (authorization, cookie)
    - Filter sensitive breadcrumbs (console logs with passwords)
    - Filter sensitive environment variables
    - _Requirements: 8.7_
  
  - [~] 14.4 Configure Sentry error ignoring
    - Ignore browser extension errors
    - Ignore network errors
    - Ignore user cancellations
    - _Requirements: 8.1_
  
  - [~] 14.5 Create Sentry integration helpers
    - Create `src/lib/errors/sentry.ts`
    - Implement `captureError()` function (skip operational errors)
    - Implement `setUserContext()` and `clearUserContext()` functions
    - Implement `addBreadcrumb()` function
    - _Requirements: 8.3, 8.6_
  
  - [~] 14.6 Integrate Sentry into error handler
    - Call `captureError()` for non-operational errors
    - Include Request_Context in error reports
    - Set user context when Auth_Token is present
    - _Requirements: 8.2, 8.3, 8.4, 8.6, 8.8, 8.10_
  
  - [ ] 14.7 Write tests for Sentry integration
    - Mock Sentry and verify error capture
    - Test sensitive data filtering
    - Test operational errors are not sent

- [~] 15. Implement audit logging
  - [~] 15.1 Add audit logging helpers to logger
    - Extend logger with audit-specific methods
    - Implement structured audit log format with timestamp, userId, ip, action, resource
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [~] 15.2 Add audit logging for authentication events
    - Log login, logout, password change, account creation
    - Log failed authentication attempts with IP and email
    - _Requirements: 7.5, 9.9, 15.1_
  
  - [~] 15.3 Add audit logging for authorization failures
    - Log authorization failures with user ID, resource, and action
    - _Requirements: 7.6, 15.2_
  
  - [~] 15.4 Add audit logging for data modifications
    - Log create, update, delete operations with user ID and affected records
    - _Requirements: 15.3_
  
  - [~] 15.5 Add audit logging for administrative actions
    - Log user activation, role changes, service management
    - _Requirements: 15.4_
  
  - [~] 15.6 Add audit logging for file operations
    - Log file uploads and downloads with user ID and filename
    - _Requirements: 11.8, 15.5_
  
  - [ ] 15.7 Write tests for audit logging
    - Test audit log format
    - Test all security events are logged
    - Test audit logs include required fields

### Phase 6: WebSocket Security

- [~] 16. Implement WebSocket authentication
  - [~] 16.1 Create WebSocket authentication middleware
    - Create `src/lib/websocket/auth.ts`
    - Implement `setupWebSocketAuth()` function for Socket.io
    - Verify Auth_Token from handshake auth or cookies
    - Attach user info to socket data
    - Reject connections with invalid tokens
    - _Requirements: 13.1, 13.5_
  
  - [~] 16.2 Add WebSocket connection logging
    - Log all connection attempts with user ID and IP
    - Log authentication failures
    - Log disconnections with reason
    - _Requirements: 13.6, 13.9_
  
  - [ ] 16.3 Write integration tests for WebSocket authentication
    - Test connection rejected without token
    - Test connection accepted with valid token
    - Test connection rejected with invalid token

- [~] 17. Implement WebSocket rate limiting
  - [~] 17.1 Create WebSocket rate limiter
    - Create `src/lib/websocket/ratelimit.ts`
    - Implement in-memory rate limiting for WebSocket messages
    - Implement `checkMessageRateLimit()` function (30 messages per minute)
    - Implement `validateMessageSize()` function (10KB max)
    - Add periodic cleanup of old entries
    - _Requirements: 13.2, 13.8_
  
  - [~] 17.2 Implement idle timeout for WebSocket connections
    - Disconnect idle connections after 30 minutes
    - Reset timeout on any message
    - _Requirements: 13.7_
  
  - [ ] 17.3 Write integration tests for WebSocket rate limiting
    - Test message rate limiting
    - Test message size validation
    - Test idle timeout

- [~] 18. Implement WebSocket message validation
  - [~] 18.1 Create WebSocket message schemas
    - Create `src/lib/websocket/validator.ts`
    - Implement schemas for join room, join order, send message events
    - Implement `validateWebSocketMessage()` function
    - _Requirements: 13.3_
  
  - [~] 18.2 Add room authorization
    - Verify users can only join rooms they are authorized to access
    - Implement authorization checks for order rooms
    - _Requirements: 13.4_
  
  - [ ] 18.3 Write integration tests for WebSocket message validation
    - Test message validation
    - Test room authorization

- [~] 19. Update server.js with WebSocket security
  - [~] 19.1 Integrate WebSocket security into server.js
    - Import and call `setupWebSocketAuth()`
    - Add rate limiting to message handlers
    - Add message size validation
    - Add idle timeout logic
    - Configure Socket.io with security options (maxHttpBufferSize, pingTimeout)
    - _Requirements: 13.1, 13.2, 13.7, 13.8, 13.10_
  
  - [~] 19.2 Add WebSocket event logging
    - Log join room events
    - Log join order events
    - Log suspicious activity
    - _Requirements: 13.9_
  
  - [ ] 19.3 Write end-to-end tests for WebSocket security
    - Test complete WebSocket flow with authentication
    - Test rate limiting in real scenario
    - Test message validation in real scenario

- [~] 20. Checkpoint - Verify WebSocket security
  - Ensure WebSocket connections require authentication
  - Ensure message rate limiting works
  - Ensure message validation works
  - Run integration tests for WebSocket security
  - Ask the user if questions arise

### Phase 7: Testing & Documentation

- [~] 21. Refactor existing API routes to use new infrastructure
  - [~] 21.1 Refactor authentication routes
    - Update `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` to use `createApiHandler()`
    - Add validation schemas
    - Add rate limiting (auth tier)
    - Add audit logging
    - _Requirements: 1.1, 1.2, 2.2, 9.1, 9.2, 9.3, 9.4, 15.1_
  
  - [~] 21.2 Refactor user management routes
    - Update user profile, role management routes to use `createApiHandler()`
    - Add validation schemas
    - Add authentication and authorization
    - Add audit logging
    - _Requirements: 1.1, 1.2, 15.3, 15.4_
  
  - [ ] 21.3 Refactor order routes
    - Update order creation, update, status change routes to use `createApiHandler()`
    - Add validation schemas
    - Add authentication and authorization
    - Add audit logging
    - _Requirements: 1.1, 1.2, 12.4, 15.3_
  
  - [ ] 21.4 Refactor service routes
    - Update service listing, creation, update routes to use `createApiHandler()`
    - Add validation schemas
    - Add pagination validation
    - _Requirements: 1.1, 1.2, 1.8, 12.4_
  
  - [ ] 21.5 Refactor file upload routes
    - Update file upload routes to use `createApiHandler()`
    - Add file upload validation schema
    - Add rate limiting (upload tier)
    - Add audit logging
    - _Requirements: 11.1, 11.2, 11.3, 11.8, 11.9, 15.5_
  
  - [ ] 21.6 Write integration tests for refactored routes
    - Test each refactored route with valid inputs
    - Test validation errors
    - Test authentication and authorization
    - Test rate limiting

- [ ] 22. Create comprehensive test suite
  - [ ] 22.1 Write unit tests for validation system
    - Test all validation schemas with valid and invalid inputs
    - Test validation utilities
    - Test sanitization functions
    - Achieve 80%+ coverage for validation module
  
  - [ ] 22.2 Write unit tests for error handling
    - Test each error type produces correct response
    - Test error logging
    - Test sensitive data redaction
    - Achieve 80%+ coverage for error handling module
  
  - [ ] 22.3 Write integration tests for rate limiting
    - Test rate limiting with Redis
    - Test rate limit enforcement on different tiers
    - Test rate limit headers
    - Test fallback to in-memory
  
  - [ ] 22.4 Write integration tests for API routes
    - Test complete request flow through wrapper
    - Test authentication and authorization
    - Test validation and error handling
    - Test CSRF protection
  
  - [ ] 22.5 Write security tests
    - Test XSS prevention
    - Test CSRF protection
    - Test authentication security
    - Test password strength requirements
    - Test token tampering detection
  
  - [ ] 22.6 Write end-to-end tests
    - Test complete user registration and login flow
    - Test authenticated API requests
    - Test file upload flow
    - Test WebSocket connection and messaging
  
  - [ ] 22.7 Set up continuous integration
    - Create `.github/workflows/test.yml`
    - Configure test jobs for unit, integration, and security tests
    - Add linting and security audit steps
    - Configure test coverage reporting

- [ ] 23. Create documentation
  - [ ] 23.1 Document API security features
    - Update API_DOCUMENTATION.md with security information
    - Document rate limiting per endpoint
    - Document CSRF token usage
    - Document error response formats
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 10.7, 10.9_
  
  - [ ] 23.2 Create security documentation
    - Create SECURITY.md with security features overview
    - Document security headers
    - Document authentication and authorization
    - Document input validation
    - Document audit logging
    - _Requirements: 14.10_
  
  - [ ] 23.3 Create deployment documentation
    - Document environment variable requirements
    - Document Redis setup for production
    - Document Sentry setup
    - Document security checklist for deployment
    - Document monitoring and alerting setup
  
  - [ ] 23.4 Create runbook for common issues
    - Document troubleshooting for rate limiting issues
    - Document troubleshooting for CSRF issues
    - Document troubleshooting for validation errors
    - Document rollback procedures

- [ ] 24. Final checkpoint and deployment preparation
  - Run complete test suite and ensure all tests pass
  - Verify all environment variables are documented
  - Verify security headers are configured correctly
  - Verify rate limiting works in production-like environment
  - Verify CSRF protection works
  - Verify Sentry integration works
  - Verify audit logging captures all required events
  - Review security checklist
  - Ask the user if questions arise before deployment

## Code Comment Requirements

**IMPORTANT**: When implementing security features, add clear comments to indicate what security improvements are being made:

### Before Rate Limiting Changes
Add comment before any rate limiting code:
```typescript
// SECURITY: Rate Limiting - Prevents abuse and DDoS attacks
```

### Before Security Headers & CSRF Changes
Add comment before security headers or CSRF code:
```typescript
// SECURITY: Security Headers - Protects against common web vulnerabilities
// SECURITY: CSRF Protection - Prevents cross-site request forgery attacks
```

### Before WebSocket Security Changes
Add comment before WebSocket security code:
```typescript
// SECURITY: WebSocket Security - Authenticates and validates WebSocket connections
```

### After Any Security Change
Add comment after implementing security features:
```typescript
// END SECURITY: [Feature Name] - Implementation complete
```

**Example:**
```typescript
// SECURITY: Rate Limiting - Prevents abuse and DDoS attacks
export async function withRateLimit(request: NextRequest, tier: RateLimitTier = 'default') {
  const identifier = getRateLimitIdentifier(request);
  const result = await checkRateLimit(identifier, tier);
  // ... implementation
}
// END SECURITY: Rate Limiting - Implementation complete
```

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation follows the 7-phase roadmap from the design document
- All code examples use TypeScript with Next.js 14 App Router
- Redis is optional for development (falls back to in-memory rate limiting)
- Sentry is optional but recommended for production
- CSRF protection can be disabled for development via DISABLE_CSRF environment variable
- **All security-related code must include comments as specified in "Code Comment Requirements" section above**
