# Design Document: Security & Foundation Improvements

## Overview

This design document specifies the technical architecture and implementation approach for adding comprehensive security and foundation improvements to the ConsultPro B2B consulting marketplace platform. The platform is built with Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL, and Socket.io.

### Current State

The application currently has:
- Basic JWT authentication with HTTP-only cookies
- Route protection via Next.js middleware
- Custom server with Socket.io integration
- Multiple API routes without standardized validation or error handling
- No rate limiting or CSRF protection
- Inconsistent error responses and logging

### Target State

After implementing this design, the platform will have:
- **Input Validation**: Zod-based schema validation on all API routes
- **Rate Limiting**: Redis-backed rate limiting with configurable limits per endpoint
- **Error Handling**: Centralized error handling with structured logging and Sentry integration
- **Security Headers**: Comprehensive HTTP security headers via middleware
- **CSRF Protection**: Token-based CSRF protection for state-changing operations
- **Environment Validation**: Startup validation of all required configuration
- **Audit Logging**: Comprehensive audit trail for security-relevant events
- **Standardized Responses**: Consistent API response formats across all endpoints

### Design Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Fail Secure**: Default to secure behavior when configuration is missing
3. **Zero Trust**: Validate all inputs regardless of source
4. **Observability**: Comprehensive logging and monitoring
5. **Backward Compatibility**: No breaking changes to existing API contracts
6. **Performance**: Minimal overhead from security controls



## Architecture

### High-Level Architecture

```mermaid
graph TB
    Client[Client Browser/App]
    
    subgraph "Next.js Application"
        MW[Next.js Middleware]
        SecHeaders[Security Headers]
        CSRF[CSRF Protection]
        RateLimit[Rate Limiter]
        
        subgraph "API Routes"
            Validator[Input Validator]
            Handler[Route Handler]
            ErrorHandler[Error Handler]
        end
        
        subgraph "Core Services"
            Auth[Auth Service]
            Logger[Logger Service]
            EnvValidator[Env Validator]
        end
        
        subgraph "External Services"
            Redis[(Redis)]
            Sentry[Sentry]
            DB[(PostgreSQL)]
        end
    end
    
    Client -->|HTTPS Request| MW
    MW --> SecHeaders
    SecHeaders --> CSRF
    CSRF --> RateLimit
    RateLimit --> Validator
    Validator --> Handler
    Handler --> ErrorHandler
    
    RateLimit -.->|Track Requests| Redis
    Handler -.->|Query| DB
    Handler -.->|Authenticate| Auth
    ErrorHandler -.->|Log| Logger
    Logger -.->|Send Events| Sentry
    EnvValidator -.->|Validate at Startup| Handler
```

### Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant RL as Rate Limiter
    participant V as Validator
    participant H as Handler
    participant EH as Error Handler
    participant L as Logger
    participant S as Sentry
    
    C->>M: HTTP Request
    M->>M: Apply Security Headers
    M->>M: Validate CSRF Token
    M->>RL: Check Rate Limit
    
    alt Rate Limit Exceeded
        RL->>C: 429 Too Many Requests
    else Within Limit
        RL->>V: Validate Input
        
        alt Validation Fails
            V->>EH: Validation Error
            EH->>L: Log Error
            EH->>C: 400 Bad Request
        else Validation Passes
            V->>H: Execute Handler
            
            alt Handler Success
                H->>L: Log Success
                H->>C: 200 Success
            else Handler Error
                H->>EH: Handle Error
                EH->>L: Log Error
                EH->>S: Send to Sentry
                EH->>C: Error Response
            end
        end
    end
```

### Security Layers

The security architecture implements defense in depth with multiple layers:

1. **Network Layer**: HTTPS, security headers, CORS
2. **Request Layer**: Rate limiting, CSRF protection
3. **Input Layer**: Schema validation, sanitization
4. **Authentication Layer**: JWT verification, session management
5. **Authorization Layer**: Role-based access control
6. **Data Layer**: Parameterized queries, row-level security
7. **Monitoring Layer**: Logging, error tracking, audit trails



## Components and Interfaces

### 1. Input Validation System

#### Component Structure

```
src/lib/validation/
├── schemas/
│   ├── auth.schemas.ts       # Authentication schemas
│   ├── user.schemas.ts       # User management schemas
│   ├── order.schemas.ts      # Order schemas
│   ├── service.schemas.ts    # Service schemas
│   ├── common.schemas.ts     # Reusable common schemas
│   └── index.ts              # Export all schemas
├── validator.ts              # Validation utility functions
└── sanitizer.ts              # Input sanitization functions
```

#### Core Interfaces

```typescript
// src/lib/validation/validator.ts
import { z, ZodSchema } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class ValidationException extends Error {
  constructor(
    public errors: ValidationError[],
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

// Validate and throw on error
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    throw new ValidationException(errors);
  }
  return result.data;
}

// Validate and return result
export function validateSafe<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  }
  return {
    success: true,
    data: result.data
  };
}
```

#### Common Schemas

```typescript
// src/lib/validation/schemas/common.schemas.ts
import { z } from 'zod';

// CUID validation
export const cuidSchema = z.string().cuid();

// Email validation
export const emailSchema = z.string().email().toLowerCase().trim();

// Password validation (8+ chars, uppercase, lowercase, number, special)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone validation (international format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]),
  size: z.number().positive().max(50 * 1024 * 1024) // 50MB max
});
```

#### Authentication Schemas

```typescript
// src/lib/validation/schemas/auth.schemas.ts
import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.schemas';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100),
  firstName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  company: z.string().max(200).optional(),
  sector: z.string().max(100).optional(),
  role: z.enum(['CLIENT', 'CONSULTANT']).default('CLIENT')
});

export const passwordResetSchema = z.object({
  email: emailSchema
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
```

#### Usage in API Routes

```typescript
// Example: src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/validation/validator';
import { loginSchema } from '@/lib/validation/schemas/auth.schemas';
import { handleError } from '@/lib/errors/handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = validate(loginSchema, body);
    
    // Process validated data
    // ...
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
```

### 2. Rate Limiting System

#### Technology Decision

**Selected: @upstash/ratelimit with Upstash Redis**

Rationale:
- Designed specifically for serverless/edge environments
- Works with Next.js App Router and middleware
- Multi-region Redis for low latency globally
- REST API compatible with edge runtime
- Supports multiple algorithms (sliding window, token bucket, fixed window)
- Fallback to in-memory for development

Alternative considered: express-rate-limit (rejected due to incompatibility with serverless/edge runtime)

#### Component Structure

```
src/lib/ratelimit/
├── config.ts           # Rate limit configurations
├── limiter.ts          # Rate limiter implementation
├── middleware.ts       # Rate limit middleware
└── types.ts            # Type definitions
```

#### Core Implementation

```typescript
// src/lib/ratelimit/config.ts
export const RATE_LIMIT_CONFIG = {
  // Default limits for all endpoints
  default: {
    requests: 100,
    window: '15m'
  },
  
  // Authentication endpoints (stricter)
  auth: {
    requests: 5,
    window: '15m'
  },
  
  // File upload endpoints
  upload: {
    requests: 20,
    window: '1m'
  },
  
  // WebSocket connections
  websocket: {
    requests: 10,
    window: '1m'
  },
  
  // Public endpoints (more lenient)
  public: {
    requests: 200,
    window: '15m'
  }
} as const;

export type RateLimitTier = keyof typeof RATE_LIMIT_CONFIG;
```

```typescript
// src/lib/ratelimit/limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RATE_LIMIT_CONFIG, RateLimitTier } from './config';

// Initialize Redis client
const redis = process.env.REDIS_URL
  ? new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN!
    })
  : null;

// Create rate limiters for each tier
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

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'default'
): Promise<RateLimitResult> {
  const limiter = rateLimiters[tier];
  
  // If no Redis configured (development), allow all requests
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

// Get identifier from request (IP or user ID)
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
```

#### Rate Limit Middleware

```typescript
// src/lib/ratelimit/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from './limiter';
import { RateLimitTier } from './config';
import { verifyToken } from '@/lib/auth';

export async function withRateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'default'
): Promise<NextResponse | null> {
  // Get user ID if authenticated
  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;
  
  // Get identifier
  const identifier = getRateLimitIdentifier(request, payload?.userId);
  
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
  
  // Add rate limit headers to response
  return null; // Continue to handler
}

// Helper to add rate limit headers to response
export function addRateLimitHeaders(
  response: NextResponse,
  result: { limit: number; remaining: number; reset: number }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}
```



### 3. Centralized Error Handling

#### Component Structure

```
src/lib/errors/
├── types.ts            # Error class definitions
├── handler.ts          # Error handler implementation
├── codes.ts            # Error codes and messages
└── formatter.ts        # Error response formatting
```

#### Error Class Hierarchy

```typescript
// src/lib/errors/types.ts
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract isOperational: boolean;
  
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;
  
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message, { errors });
  }
}

export class AuthenticationError extends AppError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  isOperational = true;
  
  constructor(message = 'Authentication failed') {
    super(message);
  }
}

export class AuthorizationError extends AppError {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  isOperational = true;
  
  constructor(message = 'Access denied') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;
  
  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`
    );
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;
  
  constructor(message: string) {
    super(message);
  }
}

export class RateLimitError extends AppError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  isOperational = true;
  
  constructor(public retryAfter: number) {
    super('Too many requests');
  }
}

export class DatabaseError extends AppError {
  statusCode = 500;
  code = 'DATABASE_ERROR';
  isOperational = true;
  
  constructor(message = 'Database operation failed') {
    super(message);
  }
}

export class InternalServerError extends AppError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  isOperational = false;
  
  constructor(message = 'An unexpected error occurred') {
    super(message);
  }
}
```

#### Error Handler Implementation

```typescript
// src/lib/errors/handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  DatabaseError,
  InternalServerError
} from './types';
import { ValidationException } from '@/lib/validation/validator';

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  requestId?: string;
}

export function handleError(
  error: unknown,
  request: NextRequest
): NextResponse<ErrorResponse> {
  // Generate request ID for tracing
  const requestId = crypto.randomUUID();
  
  // Get request context
  const context = {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  };
  
  // Handle known error types
  if (error instanceof AppError) {
    return handleAppError(error, context);
  }
  
  if (error instanceof ValidationException || error instanceof ZodError) {
    return handleValidationError(error, context);
  }
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, context);
  }
  
  // Handle unknown errors
  return handleUnknownError(error, context);
}

function handleAppError(
  error: AppError,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  // Log error
  logger.error('Application error', {
    ...context,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  });
  
  // Send to Sentry if not operational
  if (!error.isOperational) {
    Sentry.captureException(error, {
      contexts: { request: context }
    });
  }
  
  // Return error response
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
      details: error.details,
      requestId: context.requestId as string
    },
    {
      status: error.statusCode,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

function handleValidationError(
  error: ValidationException | ZodError,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const errors = error instanceof ValidationException
    ? error.errors
    : error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
  
  logger.warn('Validation error', {
    ...context,
    errors
  });
  
  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { errors },
      requestId: context.requestId as string
    },
    {
      status: 400,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  logger.error('Database error', {
    ...context,
    error: {
      code: error.code,
      message: error.message,
      meta: error.meta
    }
  });
  
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: { request: context }
  });
  
  // Map Prisma errors to user-friendly messages
  let message = 'Database operation failed';
  let statusCode = 500;
  
  switch (error.code) {
    case 'P2002':
      message = 'A record with this value already exists';
      statusCode = 409;
      break;
    case 'P2025':
      message = 'Record not found';
      statusCode = 404;
      break;
    case 'P2003':
      message = 'Related record not found';
      statusCode = 400;
      break;
  }
  
  return NextResponse.json(
    {
      error: message,
      code: 'DATABASE_ERROR',
      requestId: context.requestId as string
    },
    {
      status: statusCode,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

function handleUnknownError(
  error: unknown,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error('Unhandled error', {
    ...context,
    error: {
      message: errorMessage,
      stack: errorStack
    }
  });
  
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: { request: context }
  });
  
  // Never expose internal error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : errorMessage;
  
  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_SERVER_ERROR',
      requestId: context.requestId as string
    },
    {
      status: 500,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

// Helper to create standardized success responses
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      data,
      ...(message && { message })
    },
    { status }
  );
}

// Helper for paginated responses
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  }
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.pageSize)
    }
  });
}
```

### 4. Environment Variable Validation

#### Component Structure

```
src/lib/env/
├── schema.ts           # Environment variable schemas
├── validator.ts        # Validation logic
└── index.ts            # Validated environment exports
```

#### Implementation

```typescript
// src/lib/env/schema.ts
import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Server
  PORT: z.coerce.number().positive().default(3000),
  
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string'),
  
  // Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  
  // Zoom
  ZOOM_ACCOUNT_ID: z.string().min(1),
  ZOOM_CLIENT_ID: z.string().min(1),
  ZOOM_CLIENT_SECRET: z.string().min(1),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),
  
  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Rate limiting (optional overrides)
  RATE_LIMIT_DEFAULT: z.coerce.number().positive().optional(),
  RATE_LIMIT_AUTH: z.coerce.number().positive().optional(),
  RATE_LIMIT_UPLOAD: z.coerce.number().positive().optional(),
  
  // CSRF (optional)
  CSRF_SECRET: z.string().min(32).optional(),
  DISABLE_CSRF: z.coerce.boolean().default(false),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

export type Env = z.infer<typeof envSchema>;

export default envSchema;
```

```typescript
// src/lib/env/validator.ts
import envSchema, { Env } from './schema';

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }
  
  try {
    validatedEnv = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return validatedEnv;
  } catch (error) {
    console.error('❌ Environment variable validation failed:');
    
    if (error instanceof Error) {
      console.error(error.message);
    }
    
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.\n');
    
    process.exit(1);
  }
}

export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}
```

```typescript
// src/lib/env/index.ts
import { validateEnv, getEnv } from './validator';

// Validate on module load
validateEnv();

// Export validated environment
export const env = getEnv();
```

#### Usage in server.js

```typescript
// server.js (updated)
const { validateEnv } = require('./src/lib/env/validator');

// Validate environment before starting server
validateEnv();

const { createServer } = require('http');
// ... rest of server code
```



### 5. Security Headers Middleware

#### Implementation

```typescript
// middleware.ts (updated)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

const publicRoutes = ['/', '/solutions', '/ressources', '/contact', '/login', '/register', '/approches'];
const adminRoutes = ['/admin'];
const consultantRoutes = ['/consultant'];
const clientRoutes = ['/client'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply security headers to all responses
  const response = handleRouteProtection(request);
  applySecurityHeaders(response, request);
  
  return response;
}

function handleRouteProtection(request: NextRequest): NextResponse {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  if (publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // No token - redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
  
  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Check consultant routes
  if (consultantRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'CONSULTANT' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Check client routes
  if (clientRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'CLIENT' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

function applySecurityHeaders(response: NextResponse, request: NextRequest): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const { pathname } = request.nextUrl;
  
  // Skip security headers for static assets
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
    return;
  }
  
  // X-Frame-Options: Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options: Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection: Legacy XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy: Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy: Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Strict-Transport-Security: Force HTTPS (production only)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Content-Security-Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.cloudinary.com https://zoom.us wss:",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

#### Next.js Configuration

```typescript
// next.config.js (updated)
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### 6. CSRF Protection

#### Component Structure

```
src/lib/csrf/
├── token.ts            # Token generation and validation
├── middleware.ts       # CSRF middleware
└── types.ts            # Type definitions
```

#### Implementation

```typescript
// src/lib/csrf/token.ts
import { createHmac, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET!;
const TOKEN_LENGTH = 32;

export function generateCsrfToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

export function signCsrfToken(token: string): string {
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  return hmac.digest('hex');
}

export function verifyCsrfToken(token: string, signature: string): boolean {
  const expectedSignature = signCsrfToken(token);
  
  // Use timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

export function createCsrfTokenPair(): { token: string; signature: string } {
  const token = generateCsrfToken();
  const signature = signCsrfToken(token);
  return { token, signature };
}
```

```typescript
// src/lib/csrf/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from './token';
import { AuthorizationError } from '@/lib/errors/types';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const EXEMPT_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];

export function validateCsrf(request: NextRequest): void {
  // Skip if CSRF is disabled (development only)
  if (process.env.DISABLE_CSRF === 'true') {
    return;
  }
  
  // Skip for non-state-changing methods
  if (!STATE_CHANGING_METHODS.includes(request.method)) {
    return;
  }
  
  // Skip for exempt paths
  const pathname = new URL(request.url).pathname;
  if (EXEMPT_PATHS.some(path => pathname.startsWith(path))) {
    return;
  }
  
  // Get token from header
  const tokenHeader = request.headers.get('x-csrf-token');
  if (!tokenHeader) {
    throw new AuthorizationError('CSRF token missing');
  }
  
  // Get signature from cookie
  const signatureCookie = request.cookies.get('csrf_signature')?.value;
  if (!signatureCookie) {
    throw new AuthorizationError('CSRF signature missing');
  }
  
  // Verify token
  if (!verifyCsrfToken(tokenHeader, signatureCookie)) {
    throw new AuthorizationError('Invalid CSRF token');
  }
}

export function setCsrfCookie(
  response: NextResponse,
  signature: string
): NextResponse {
  response.cookies.set('csrf_signature', signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  return response;
}
```

#### CSRF Token API Endpoint

```typescript
// src/app/api/csrf/route.ts
import { NextResponse } from 'next/server';
import { createCsrfTokenPair } from '@/lib/csrf/token';
import { setCsrfCookie } from '@/lib/csrf/middleware';

export async function GET() {
  const { token, signature } = createCsrfTokenPair();
  
  const response = NextResponse.json({ csrfToken: token });
  setCsrfCookie(response, signature);
  
  return response;
}
```

#### Client-Side Usage

```typescript
// src/lib/api/client.ts
let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }
  
  const response = await fetch('/api/csrf');
  const data = await response.json();
  csrfToken = data.csrfToken;
  
  return csrfToken;
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';
  
  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCsrfToken();
    options.headers = {
      ...options.headers,
      'X-CSRF-Token': token
    };
  }
  
  return fetch(url, options);
}
```

### 7. Structured Logging System

#### Component Structure

```
src/lib/logger/
├── logger.ts           # Logger implementation
├── transports.ts       # Log transports (console, file)
├── formatters.ts       # Log formatting
└── types.ts            # Type definitions
```

#### Implementation

```typescript
// src/lib/logger/types.ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  requestId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```

```typescript
// src/lib/logger/logger.ts
import { LogLevel, LogContext, LogEntry } from './types';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

class Logger {
  private minLevel: LogLevel;
  private sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'authorization',
    'cookie',
    'creditCard',
    'ssn'
  ];
  
  constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }
  
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }
  
  private redactSensitiveData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item));
    }
    
    const redacted: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveFields.some(field =>
        lowerKey.includes(field)
      );
      
      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }
    
    return redacted;
  }
  
  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context: this.redactSensitiveData(context) as LogContext })
    };
    
    return entry;
  }
  
  private write(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    
    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(output);
    } else {
      console.log(output);
    }
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.write(this.formatLogEntry('debug', message, context));
    }
  }
  
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.write(this.formatLogEntry('info', message, context));
    }
  }
  
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.write(this.formatLogEntry('warn', message, context));
    }
  }
  
  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.write(this.formatLogEntry('error', message, context));
    }
  }
  
  fatal(message: string, context?: LogContext): void {
    if (this.shouldLog('fatal')) {
      this.write(this.formatLogEntry('fatal', message, context));
    }
  }
  
  // Request logging helper
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration,
      ...context
    });
  }
  
  // Authentication logging helpers
  logAuthSuccess(userId: string, email: string, ip?: string): void {
    this.info('Authentication successful', {
      userId,
      email,
      ip,
      event: 'auth.success'
    });
  }
  
  logAuthFailure(email: string, reason: string, ip?: string): void {
    this.warn('Authentication failed', {
      email,
      reason,
      ip,
      event: 'auth.failure'
    });
  }
  
  // Audit logging helpers
  logAudit(
    action: string,
    userId: string,
    resource: string,
    details?: LogContext
  ): void {
    this.info('Audit event', {
      action,
      userId,
      resource,
      event: 'audit',
      ...details
    });
  }
}

export const logger = new Logger();
```

### 8. Sentry Integration

#### Installation

```bash
npm install @sentry/nextjs
```

#### Configuration Files

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  environment: process.env.NODE_ENV,
  
  // Adjust sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          const { password, token, secret, ...safeData } = breadcrumb.data;
          return { ...breadcrumb, data: safeData };
        }
        return breadcrumb;
      });
    }
    
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'NetworkError',
    'Failed to fetch',
    // User cancellations
    'AbortError',
    'cancelled'
  ],
  
  // Set user context
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.message?.includes('password')) {
      return null;
    }
    return breadcrumb;
  }
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  environment: process.env.NODE_ENV,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    // Remove sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const { JWT_SECRET, DATABASE_URL, ...safeEnv } = event.contexts.runtime.env;
      event.contexts.runtime.env = safeEnv;
    }
    
    return event;
  },
  
  ignoreErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND'
  ]
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1
});
```

#### Integration with Error Handler

```typescript
// src/lib/errors/sentry.ts
import * as Sentry from '@sentry/nextjs';
import { AppError } from './types';

export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  // Don't send operational errors to Sentry
  if (error instanceof AppError && error.isOperational) {
    return;
  }
  
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined
  });
}

export function setUserContext(userId: string, email: string, role: string): void {
  Sentry.setUser({
    id: userId,
    email,
    role
  });
}

export function clearUserContext(): void {
  Sentry.setUser(null);
}

export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
}
```



### 9. WebSocket Security

#### Component Structure

```
src/lib/websocket/
├── auth.ts             # WebSocket authentication
├── ratelimit.ts        # WebSocket rate limiting
├── validator.ts        # Message validation
└── types.ts            # Type definitions
```

#### Implementation

```typescript
// src/lib/websocket/auth.ts
import { Server, Socket } from 'socket.io';
import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export function setupWebSocketAuth(io: Server): void {
  io.use((socket, next) => {
    try {
      // Get token from handshake auth or cookies
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.cookie
                     ?.split(';')
                     .find(c => c.trim().startsWith('auth_token='))
                     ?.split('=')[1];
      
      if (!token) {
        logger.warn('WebSocket connection rejected: No token', {
          socketId: socket.id,
          ip: socket.handshake.address
        });
        return next(new Error('Authentication required'));
      }
      
      // Verify token
      const payload = verifyToken(token);
      if (!payload) {
        logger.warn('WebSocket connection rejected: Invalid token', {
          socketId: socket.id,
          ip: socket.handshake.address
        });
        return next(new Error('Invalid token'));
      }
      
      // Attach user info to socket
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      socket.data.role = payload.role;
      
      logger.info('WebSocket connection authenticated', {
        socketId: socket.id,
        userId: payload.userId,
        role: payload.role,
        ip: socket.handshake.address
      });
      
      next();
    } catch (error) {
      logger.error('WebSocket authentication error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(new Error('Authentication failed'));
    }
  });
}
```

```typescript
// src/lib/websocket/ratelimit.ts
import { Socket } from 'socket.io';
import { logger } from '@/lib/logger';

interface RateLimitState {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitState>();

const RATE_LIMIT_CONFIG = {
  maxMessages: 30,
  windowMs: 60000, // 1 minute
  maxMessageSize: 10240 // 10KB
};

export function checkMessageRateLimit(socket: Socket): boolean {
  const userId = socket.data.userId;
  const now = Date.now();
  
  let state = rateLimitMap.get(userId);
  
  // Initialize or reset if window expired
  if (!state || now >= state.resetAt) {
    state = {
      count: 0,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs
    };
    rateLimitMap.set(userId, state);
  }
  
  // Check limit
  if (state.count >= RATE_LIMIT_CONFIG.maxMessages) {
    logger.warn('WebSocket rate limit exceeded', {
      userId,
      socketId: socket.id,
      count: state.count
    });
    return false;
  }
  
  // Increment counter
  state.count++;
  return true;
}

export function validateMessageSize(message: unknown): boolean {
  const size = JSON.stringify(message).length;
  return size <= RATE_LIMIT_CONFIG.maxMessageSize;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, state] of rateLimitMap.entries()) {
    if (now >= state.resetAt) {
      rateLimitMap.delete(userId);
    }
  }
}, 60000); // Every minute
```

```typescript
// src/lib/websocket/validator.ts
import { z } from 'zod';

// Message schemas
export const joinRoomSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['CLIENT', 'CONSULTANT', 'ADMIN'])
});

export const joinOrderSchema = z.object({
  orderId: z.string().cuid()
});

export const sendMessageSchema = z.object({
  orderId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  senderId: z.string().cuid(),
  senderType: z.enum(['CLIENT', 'CONSULTANT'])
});

export function validateWebSocketMessage<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    return null;
  }
  return result.data;
}
```

#### Updated server.js

```javascript
// server.js (updated with security)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { validateEnv } = require('./src/lib/env/validator');
const { setupWebSocketAuth } = require('./src/lib/websocket/auth');
const { checkMessageRateLimit, validateMessageSize } = require('./src/lib/websocket/ratelimit');
const { logger } = require('./src/lib/logger/logger');

// Validate environment before starting
validateEnv();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : '*',
      methods: ['GET', 'POST']
    },
    maxHttpBufferSize: 10240, // 10KB max message size
    pingTimeout: 30000,
    pingInterval: 25000
  });

  // Setup authentication middleware
  setupWebSocketAuth(io);

  global.io = io;

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;
    
    logger.info('WebSocket client connected', {
      socketId: socket.id,
      userId,
      role
    });
    
    // Auto-join user room
    socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);
    
    // Handle join room
    socket.on('join', (data) => {
      if (!checkMessageRateLimit(socket)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }
      
      if (data.userId === userId) {
        socket.join(`user:${data.userId}`);
        logger.debug('User joined room', {
          socketId: socket.id,
          userId: data.userId,
          role: data.role
        });
      }
    });

    // Handle join order
    socket.on('join:order', (orderId) => {
      if (!checkMessageRateLimit(socket)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }
      
      if (!validateMessageSize(orderId)) {
        socket.emit('error', { message: 'Message too large' });
        return;
      }
      
      // TODO: Verify user has access to this order
      socket.join(`order:${orderId}`);
      logger.debug('User joined order room', {
        socketId: socket.id,
        userId,
        orderId
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', {
        socketId: socket.id,
        userId,
        reason
      });
    });
    
    // Idle timeout
    let idleTimeout = setTimeout(() => {
      logger.info('Disconnecting idle WebSocket client', {
        socketId: socket.id,
        userId
      });
      socket.disconnect(true);
    }, 30 * 60 * 1000); // 30 minutes
    
    // Reset idle timeout on any message
    socket.onAny(() => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        socket.disconnect(true);
      }, 30 * 60 * 1000);
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    logger.info('Server started', {
      port,
      environment: process.env.NODE_ENV
    });
  });
});
```

### 10. API Route Wrapper

To simplify applying all security controls to API routes, we'll create a wrapper function:

```typescript
// src/lib/api/wrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { validate } from '@/lib/validation/validator';
import { handleError, successResponse } from '@/lib/errors/handler';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { validateCsrf } from '@/lib/csrf/middleware';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { RateLimitTier } from '@/lib/ratelimit/config';

export interface ApiHandlerOptions<TBody = unknown, TQuery = unknown> {
  // Validation schemas
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
  
  // Rate limiting
  rateLimit?: RateLimitTier;
  
  // Authentication & Authorization
  requireAuth?: boolean;
  allowedRoles?: string[];
  
  // CSRF protection (default: true for POST/PUT/PATCH/DELETE)
  csrf?: boolean;
}

export interface ApiContext<TBody = unknown, TQuery = unknown> {
  request: NextRequest;
  body?: TBody;
  query?: TQuery;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export type ApiHandler<TBody = unknown, TQuery = unknown> = (
  context: ApiContext<TBody, TQuery>
) => Promise<NextResponse>;

export function createApiHandler<TBody = unknown, TQuery = unknown>(
  handler: ApiHandler<TBody, TQuery>,
  options: ApiHandlerOptions<TBody, TQuery> = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      // 1. Rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = await withRateLimit(request, options.rateLimit);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }
      
      // 2. CSRF validation
      const shouldValidateCsrf = options.csrf !== false &&
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
      
      if (shouldValidateCsrf) {
        validateCsrf(request);
      }
      
      // 3. Authentication
      let user;
      if (options.requireAuth) {
        user = await getCurrentUser();
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
        }
        
        // 4. Authorization
        if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
          logger.warn('Authorization failed', {
            userId: user.id,
            role: user.role,
            allowedRoles: options.allowedRoles,
            path: request.nextUrl.pathname
          });
          
          return NextResponse.json(
            { error: 'Access denied', code: 'FORBIDDEN' },
            { status: 403 }
          );
        }
      }
      
      // 5. Input validation
      let body: TBody | undefined;
      let query: TQuery | undefined;
      
      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const rawBody = await request.json();
        body = validate(options.bodySchema, rawBody);
      }
      
      if (options.querySchema) {
        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        query = validate(options.querySchema, searchParams);
      }
      
      // 6. Execute handler
      const context: ApiContext<TBody, TQuery> = {
        request,
        body,
        query,
        user
      };
      
      const response = await handler(context);
      
      // 7. Log request
      const duration = Date.now() - startTime;
      logger.logRequest(
        request.method,
        request.nextUrl.pathname,
        response.status,
        duration,
        {
          userId: user?.id,
          userAgent: request.headers.get('user-agent')
        }
      );
      
      return response;
    } catch (error) {
      // 8. Error handling
      const duration = Date.now() - startTime;
      logger.error('API request failed', {
        method: request.method,
        url: request.nextUrl.pathname,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return handleError(error, request);
    }
  };
}
```

#### Usage Example

```typescript
// src/app/api/services/route.ts (refactored)
import { createApiHandler, successResponse } from '@/lib/api/wrapper';
import { paginationSchema } from '@/lib/validation/schemas/common.schemas';
import { prisma } from '@/lib/prisma';

export const GET = createApiHandler(
  async ({ query }) => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { tiers: true },
      skip: (query!.page - 1) * query!.pageSize,
      take: query!.pageSize
    });
    
    const total = await prisma.service.count({
      where: { isActive: true }
    });
    
    return successResponse({
      data: services,
      pagination: {
        page: query!.page,
        pageSize: query!.pageSize,
        total,
        totalPages: Math.ceil(total / query!.pageSize)
      }
    });
  },
  {
    querySchema: paginationSchema,
    rateLimit: 'public'
  }
);
```

```typescript
// src/app/api/orders/route.ts (example with auth)
import { createApiHandler, successResponse } from '@/lib/api/wrapper';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createOrderSchema = z.object({
  serviceTierId: z.string().cuid(),
  consultantId: z.string().cuid().optional()
});

export const POST = createApiHandler(
  async ({ body, user }) => {
    const order = await prisma.order.create({
      data: {
        clientId: user!.id,
        serviceTierId: body!.serviceTierId,
        consultantId: body!.consultantId,
        status: 'PENDING'
      },
      include: {
        serviceTier: {
          include: { service: true }
        }
      }
    });
    
    return successResponse(order, 'Order created successfully', 201);
  },
  {
    bodySchema: createOrderSchema,
    requireAuth: true,
    allowedRoles: ['CLIENT', 'ADMIN'],
    rateLimit: 'default'
  }
);
```



## Data Models

### New Database Models

No new database tables are required for this feature. All security infrastructure operates at the application layer.

### Redis Data Structures

For rate limiting (when Redis is configured):

```
Key Pattern: ratelimit:{tier}:{identifier}
Type: String (counter)
TTL: Based on window configuration (e.g., 900 seconds for 15 minutes)
Value: Number of requests in current window

Example:
ratelimit:auth:ip:192.168.1.1 = "3"
ratelimit:default:user:clx123abc = "45"
```

### Environment Variables Schema

See Environment Variable Validation section above for complete schema.

Key additions:
- `REDIS_URL`: Optional Redis connection string for rate limiting
- `REDIS_TOKEN`: Optional Redis authentication token
- `SENTRY_DSN`: Optional Sentry DSN for error monitoring
- `CSRF_SECRET`: Optional CSRF token secret (defaults to JWT_SECRET)
- `LOG_LEVEL`: Log level (debug, info, warn, error)
- `RATE_LIMIT_*`: Optional rate limit overrides

## Error Handling Flow

### Complete Error Flow Diagram

```mermaid
flowchart TD
    Start[API Request] --> Middleware[Middleware Layer]
    Middleware --> RateLimit{Rate Limit Check}
    
    RateLimit -->|Exceeded| RateLimitError[429 Rate Limit Error]
    RateLimit -->|OK| CSRF{CSRF Check}
    
    CSRF -->|Invalid| CSRFError[403 CSRF Error]
    CSRF -->|Valid| Validation{Input Validation}
    
    Validation -->|Failed| ValidationError[400 Validation Error]
    Validation -->|Passed| Auth{Authentication}
    
    Auth -->|Failed| AuthError[401 Auth Error]
    Auth -->|Passed| Authz{Authorization}
    
    Authz -->|Failed| AuthzError[403 Forbidden]
    Authz -->|Passed| Handler[Route Handler]
    
    Handler --> DB{Database Operation}
    DB -->|Error| DBError[500 Database Error]
    DB -->|Success| Success[200 Success Response]
    
    Handler -->|Exception| UnknownError[500 Internal Error]
    
    RateLimitError --> ErrorHandler[Error Handler]
    CSRFError --> ErrorHandler
    ValidationError --> ErrorHandler
    AuthError --> ErrorHandler
    AuthzError --> ErrorHandler
    DBError --> ErrorHandler
    UnknownError --> ErrorHandler
    
    ErrorHandler --> Logger[Log Error]
    Logger --> Sentry{Should Send to Sentry?}
    
    Sentry -->|Yes| SendSentry[Send to Sentry]
    Sentry -->|No| FormatResponse[Format Error Response]
    SendSentry --> FormatResponse
    
    FormatResponse --> Response[Return Error Response]
```

### Error Response Format

All error responses follow this structure:

```typescript
{
  error: string;           // Human-readable error message
  code: string;            // Machine-readable error code
  details?: object;        // Optional additional details (e.g., validation errors)
  requestId: string;       // Unique request ID for tracing
}
```

### Error Codes

```typescript
// src/lib/errors/codes.ts
export const ERROR_CODES = {
  // Validation (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Authentication (401)
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization (403)
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  ACCESS_DENIED: 'ACCESS_DENIED',
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
  
  // Not Found (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;
```

## Configuration Management

### Environment Variable Structure

```bash
# .env.example

# ============================================
# CORE CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/consultpro

# ============================================
# AUTHENTICATION
# ============================================
# Must be at least 32 characters
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# ============================================
# CLOUDINARY (File Upload)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# ZOOM (Video Conferencing)
# ============================================
ZOOM_ACCOUNT_ID=your-account-id
ZOOM_CLIENT_ID=your-client-id
ZOOM_CLIENT_SECRET=your-client-secret

# ============================================
# REDIS (Rate Limiting) - Optional
# ============================================
# If not set, rate limiting will use in-memory storage (dev only)
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=your-redis-token

# ============================================
# SENTRY (Error Monitoring) - Optional
# ============================================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# ============================================
# SECURITY
# ============================================
# CSRF Secret (defaults to JWT_SECRET if not set)
CSRF_SECRET=your-csrf-secret-min-32-chars

# Disable CSRF for development/testing (NOT for production)
DISABLE_CSRF=false

# Allowed origins for CORS (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ============================================
# RATE LIMITING (Optional Overrides)
# ============================================
# Default: 100 requests per 15 minutes
RATE_LIMIT_DEFAULT=100

# Auth endpoints: 5 requests per 15 minutes
RATE_LIMIT_AUTH=5

# Upload endpoints: 20 requests per minute
RATE_LIMIT_UPLOAD=20

# ============================================
# LOGGING
# ============================================
# Options: debug, info, warn, error
LOG_LEVEL=info
```

### Configuration Validation Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Validator as Env Validator
    participant Schema as Zod Schema
    participant Process as Process
    
    App->>Validator: Import env module
    Validator->>Schema: Parse process.env
    
    alt Validation Success
        Schema->>Validator: Return validated env
        Validator->>App: Export validated env
        App->>App: Continue startup
    else Validation Failure
        Schema->>Validator: Throw validation error
        Validator->>Process: Log errors
        Validator->>Process: Exit with code 1
    end
```

### Development vs Production Configuration

| Feature | Development | Production |
|---------|-------------|------------|
| Rate Limiting | In-memory (lenient) | Redis (strict) |
| CSRF Protection | Can be disabled | Always enabled |
| Security Headers | Relaxed CSP | Strict CSP |
| HTTPS | Optional | Required (HSTS) |
| Logging Level | debug | info |
| Error Details | Full stack traces | Generic messages |
| Sentry | Optional | Required |
| CORS | Allow localhost | Specific domains |



## Deployment Considerations

### Pre-Deployment Checklist

#### 1. Environment Variables
- [ ] All required environment variables are set in production
- [ ] JWT_SECRET is at least 32 characters and cryptographically random
- [ ] CSRF_SECRET is set (or JWT_SECRET is used)
- [ ] DATABASE_URL points to production database
- [ ] Redis is configured for rate limiting
- [ ] Sentry DSN is configured for error monitoring
- [ ] ALLOWED_ORIGINS contains only production domains
- [ ] LOG_LEVEL is set to 'info' or 'warn'

#### 2. Security Configuration
- [ ] DISABLE_CSRF is set to false (or not set)
- [ ] Security headers are enabled in middleware
- [ ] HTTPS is enforced (HSTS header)
- [ ] CORS is restricted to specific domains
- [ ] Rate limits are appropriate for production traffic

#### 3. Database
- [ ] Database migrations are applied
- [ ] Database connection pool is configured
- [ ] Database indexes are created for performance
- [ ] Database backups are configured

#### 4. Monitoring
- [ ] Sentry is configured and tested
- [ ] Log aggregation is set up (e.g., CloudWatch, Datadog)
- [ ] Uptime monitoring is configured
- [ ] Performance monitoring is enabled

#### 5. Dependencies
- [ ] npm audit shows no critical vulnerabilities
- [ ] All dependencies are up to date
- [ ] package-lock.json is committed

### Deployment Architecture

#### Recommended: Vercel Deployment

```mermaid
graph TB
    subgraph "Vercel Edge Network"
        Edge[Edge Functions]
        Middleware[Next.js Middleware]
    end
    
    subgraph "Vercel Serverless"
        API[API Routes]
        SSR[Server-Side Rendering]
    end
    
    subgraph "External Services"
        Redis[(Upstash Redis)]
        DB[(PostgreSQL)]
        Sentry[Sentry]
        Cloudinary[Cloudinary]
    end
    
    Client[Client] --> Edge
    Edge --> Middleware
    Middleware --> API
    Middleware --> SSR
    
    API --> Redis
    API --> DB
    API --> Sentry
    API --> Cloudinary
    SSR --> DB
```

#### Alternative: Self-Hosted with Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/consultpro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SENTRY_DSN=${SENTRY_DSN}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=consultpro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Performance Considerations

#### 1. Rate Limiting Performance

- **Redis Connection Pooling**: Use connection pooling for Redis to minimize connection overhead
- **Edge Caching**: Rate limit checks happen at the edge before reaching API routes
- **Sliding Window Algorithm**: More accurate than fixed window, minimal performance impact

#### 2. Validation Performance

- **Schema Compilation**: Zod schemas are compiled once at module load
- **Minimal Overhead**: Validation adds ~1-2ms per request
- **Early Rejection**: Invalid requests are rejected before database queries

#### 3. Logging Performance

- **Async Logging**: Logs are written asynchronously to avoid blocking
- **Structured Format**: JSON logs are efficiently parsed by log aggregators
- **Sampling**: In high-traffic scenarios, consider sampling non-error logs

#### 4. Error Handling Performance

- **Fast Path**: Operational errors (validation, auth) don't trigger Sentry
- **Async Sentry**: Sentry events are sent asynchronously
- **Error Caching**: Repeated errors can be deduplicated

### Scaling Considerations

#### Horizontal Scaling

The security infrastructure is designed for horizontal scaling:

1. **Stateless API Routes**: All routes are stateless and can scale horizontally
2. **Redis for Rate Limiting**: Shared Redis instance ensures consistent rate limiting across instances
3. **Database Connection Pooling**: Each instance maintains its own connection pool
4. **WebSocket Scaling**: Use Redis adapter for Socket.io to scale WebSocket connections

```typescript
// Socket.io Redis adapter for scaling
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

#### Vertical Scaling

- **Memory**: Increase for larger connection pools and in-memory caching
- **CPU**: Increase for validation and encryption operations
- **Network**: Ensure sufficient bandwidth for WebSocket connections

### Monitoring and Alerting

#### Key Metrics to Monitor

1. **Rate Limiting**
   - Rate limit hit rate per endpoint
   - Top rate-limited IPs/users
   - Rate limit effectiveness

2. **Error Rates**
   - 4xx error rate (client errors)
   - 5xx error rate (server errors)
   - Error rate by endpoint
   - Error rate by error type

3. **Performance**
   - API response time (p50, p95, p99)
   - Database query time
   - Redis latency
   - WebSocket connection count

4. **Security**
   - Failed authentication attempts
   - CSRF validation failures
   - Suspicious activity patterns
   - File upload rejections

#### Recommended Alerts

```yaml
# Example alert configuration (Sentry)
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    window: 5 minutes
    severity: critical
    
  - name: Rate Limit Abuse
    condition: rate_limit_exceeded > 100
    window: 1 minute
    severity: warning
    
  - name: Authentication Failures
    condition: auth_failures > 50
    window: 5 minutes
    severity: warning
    
  - name: Slow API Response
    condition: p95_response_time > 2000ms
    window: 5 minutes
    severity: warning
```

### Rollback Plan

In case of issues after deployment:

1. **Immediate Rollback**
   - Revert to previous deployment
   - Verify all services are operational
   - Check error rates return to normal

2. **Partial Rollback**
   - Disable specific security features via environment variables:
     - `DISABLE_CSRF=true` (temporary, for testing only)
     - Adjust rate limits if too strict
     - Lower log level for debugging

3. **Database Rollback**
   - No database changes in this feature
   - No rollback needed

### Security Hardening Checklist

- [ ] All secrets are stored in environment variables, not in code
- [ ] Secrets are rotated regularly (JWT_SECRET, CSRF_SECRET)
- [ ] Database credentials use least privilege principle
- [ ] API keys are scoped to minimum required permissions
- [ ] HTTPS is enforced in production
- [ ] Security headers are properly configured
- [ ] CORS is restricted to known domains
- [ ] Rate limits are appropriate for expected traffic
- [ ] File uploads are validated and scanned
- [ ] Error messages don't leak sensitive information
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are regularly updated
- [ ] Security patches are applied promptly



## Testing Strategy

### Property-Based Testing Applicability Assessment

This feature involves **infrastructure, configuration, and middleware** components rather than pure business logic with clear input/output transformations. The components include:

- **Validation System**: Schema-based validation (Zod handles this internally)
- **Rate Limiting**: External service integration (Redis) with time-based state
- **Error Handling**: Exception handling and formatting
- **Security Headers**: HTTP header configuration
- **CSRF Protection**: Token generation and validation
- **Environment Validation**: Configuration validation at startup
- **Logging**: Side-effect-only operations
- **WebSocket Security**: Connection management and authentication

**Property-based testing is NOT appropriate for this feature** because:

1. **Infrastructure Configuration**: Security headers, middleware setup, and environment validation are declarative configurations, not functions with meaningful input variation
2. **External Service Integration**: Rate limiting depends on Redis state and time windows, making it unsuitable for pure property testing
3. **Side-Effect Operations**: Logging, error reporting to Sentry are side-effect-only operations with no return values to assert properties on
4. **Time-Dependent Behavior**: Rate limiting and token expiration depend on wall-clock time, not suitable for property-based testing
5. **Authentication/Authorization**: These are integration points with existing auth system, not pure functions

**Therefore, we will skip the Correctness Properties section** and focus on comprehensive unit tests, integration tests, and security tests.

### Testing Approach

#### 1. Unit Tests

**Validation System Tests**
- Test each Zod schema with valid inputs
- Test each schema with invalid inputs (missing fields, wrong types, out of range)
- Test sanitization functions
- Test validation error formatting

```typescript
// Example: src/lib/validation/__tests__/auth.schemas.test.ts
describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const data = { email: 'test@example.com', password: 'password123' };
    expect(() => validate(loginSchema, data)).not.toThrow();
  });
  
  it('should reject invalid email', () => {
    const data = { email: 'invalid-email', password: 'password123' };
    expect(() => validate(loginSchema, data)).toThrow(ValidationException);
  });
  
  it('should reject missing password', () => {
    const data = { email: 'test@example.com' };
    expect(() => validate(loginSchema, data)).toThrow(ValidationException);
  });
});
```

**Error Handler Tests**
- Test each error type produces correct status code
- Test error response format
- Test sensitive data redaction
- Test error logging
- Mock Sentry to verify error reporting

```typescript
// Example: src/lib/errors/__tests__/handler.test.ts
describe('handleError', () => {
  it('should return 400 for ValidationError', () => {
    const error = new ValidationError('Invalid input', [
      { field: 'email', message: 'Invalid email' }
    ]);
    const response = handleError(error, mockRequest);
    expect(response.status).toBe(400);
  });
  
  it('should not expose stack traces in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Internal error');
    const response = handleError(error, mockRequest);
    const body = await response.json();
    expect(body.error).toBe('An unexpected error occurred');
    expect(body).not.toHaveProperty('stack');
  });
});
```

**CSRF Token Tests**
- Test token generation produces unique tokens
- Test token signing is deterministic
- Test token verification with valid signature
- Test token verification with invalid signature
- Test timing-safe comparison

```typescript
// Example: src/lib/csrf/__tests__/token.test.ts
describe('CSRF Token', () => {
  it('should generate unique tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });
  
  it('should verify valid token signature', () => {
    const token = generateCsrfToken();
    const signature = signCsrfToken(token);
    expect(verifyCsrfToken(token, signature)).toBe(true);
  });
  
  it('should reject invalid signature', () => {
    const token = generateCsrfToken();
    const invalidSignature = 'invalid';
    expect(verifyCsrfToken(token, invalidSignature)).toBe(false);
  });
});
```

**Logger Tests**
- Test log level filtering
- Test sensitive data redaction
- Test log format
- Test request logging helpers

```typescript
// Example: src/lib/logger/__tests__/logger.test.ts
describe('Logger', () => {
  it('should redact password fields', () => {
    const spy = jest.spyOn(console, 'log');
    logger.info('User data', { email: 'test@example.com', password: 'secret' });
    const logged = JSON.parse(spy.mock.calls[0][0]);
    expect(logged.context.password).toBe('[REDACTED]');
  });
  
  it('should respect log level', () => {
    const spy = jest.spyOn(console, 'log');
    process.env.LOG_LEVEL = 'error';
    logger.info('Info message');
    expect(spy).not.toHaveBeenCalled();
  });
});
```

#### 2. Integration Tests

**Rate Limiting Integration Tests**
- Test rate limit enforcement with Redis
- Test rate limit reset after window
- Test rate limit headers in response
- Test different rate limit tiers
- Test fallback to in-memory when Redis unavailable

```typescript
// Example: src/lib/ratelimit/__tests__/limiter.integration.test.ts
describe('Rate Limiter Integration', () => {
  beforeAll(async () => {
    // Setup test Redis instance
  });
  
  it('should enforce rate limit', async () => {
    const identifier = 'test-user';
    
    // Make requests up to limit
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(identifier, 'auth');
      expect(result.success).toBe(true);
    }
    
    // Next request should be rate limited
    const result = await checkRateLimit(identifier, 'auth');
    expect(result.success).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});
```

**API Route Integration Tests**
- Test complete request flow through wrapper
- Test authentication and authorization
- Test validation and error handling
- Test rate limiting on actual routes
- Test CSRF protection

```typescript
// Example: src/app/api/services/__tests__/route.integration.test.ts
describe('GET /api/services', () => {
  it('should return paginated services', async () => {
    const response = await fetch('/api/services?page=1&pageSize=10');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pagination');
    expect(data.pagination.page).toBe(1);
  });
  
  it('should enforce rate limit', async () => {
    // Make many requests
    const requests = Array(201).fill(null).map(() =>
      fetch('/api/services')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

**WebSocket Security Integration Tests**
- Test authentication on connection
- Test rate limiting on messages
- Test message validation
- Test idle timeout
- Test room authorization

```typescript
// Example: src/lib/websocket/__tests__/security.integration.test.ts
describe('WebSocket Security', () => {
  it('should reject connection without token', (done) => {
    const socket = io('http://localhost:3000');
    
    socket.on('connect_error', (error) => {
      expect(error.message).toContain('Authentication required');
      done();
    });
  });
  
  it('should enforce message rate limit', (done) => {
    const socket = io('http://localhost:3000', {
      auth: { token: validToken }
    });
    
    socket.on('connect', () => {
      // Send messages rapidly
      for (let i = 0; i < 50; i++) {
        socket.emit('message', { content: `Message ${i}` });
      }
    });
    
    socket.on('error', (error) => {
      expect(error.message).toContain('Rate limit exceeded');
      done();
    });
  });
});
```

#### 3. Security Tests

**Input Validation Security Tests**
- Test XSS prevention in string inputs
- Test SQL injection prevention (via Prisma)
- Test path traversal prevention in file uploads
- Test maximum input sizes
- Test special characters handling

```typescript
// Example: src/lib/validation/__tests__/security.test.ts
describe('Input Validation Security', () => {
  it('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("xss")</script>';
    const data = { name: malicious };
    const result = validate(nameSchema, data);
    expect(result.name).not.toContain('<script>');
  });
  
  it('should reject oversized inputs', () => {
    const huge = 'a'.repeat(10000);
    expect(() => validate(nameSchema, { name: huge })).toThrow();
  });
});
```

**Authentication Security Tests**
- Test password strength requirements
- Test failed login attempt tracking
- Test token expiration
- Test token tampering detection

```typescript
// Example: src/lib/auth/__tests__/security.test.ts
describe('Authentication Security', () => {
  it('should reject weak passwords', () => {
    const weak = 'password';
    expect(() => validate(passwordSchema, weak)).toThrow();
  });
  
  it('should detect tampered tokens', () => {
    const token = createToken({ userId: '123', email: 'test@example.com', role: 'CLIENT' });
    const tampered = token.slice(0, -5) + 'xxxxx';
    expect(verifyToken(tampered)).toBeNull();
  });
});
```

**CSRF Security Tests**
- Test CSRF protection on state-changing requests
- Test CSRF exemption for auth endpoints
- Test CSRF token rotation
- Test timing attack resistance

```typescript
// Example: src/lib/csrf/__tests__/security.test.ts
describe('CSRF Security', () => {
  it('should reject POST without CSRF token', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ serviceTierId: '123' })
    });
    expect(response.status).toBe(403);
  });
  
  it('should accept POST with valid CSRF token', async () => {
    const csrfToken = await getCsrfToken();
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ serviceTierId: '123' })
    });
    expect(response.status).not.toBe(403);
  });
});
```

#### 4. End-to-End Tests

**Complete User Flows**
- Test user registration with validation
- Test login with rate limiting
- Test authenticated API requests
- Test file upload with validation
- Test WebSocket connection and messaging

```typescript
// Example: e2e/auth.spec.ts
describe('Authentication Flow', () => {
  it('should complete full registration and login flow', async () => {
    // Register
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        role: 'CLIENT'
      })
    });
    expect(registerResponse.status).toBe(201);
    
    // Login
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'SecurePass123!'
      })
    });
    expect(loginResponse.status).toBe(200);
    
    // Access protected route
    const profileResponse = await fetch('/api/client/profile');
    expect(profileResponse.status).toBe(200);
  });
});
```

#### 5. Performance Tests

**Load Testing**
- Test API performance under load
- Test rate limiting effectiveness under load
- Test database connection pool under load
- Test WebSocket scalability

```typescript
// Example: performance/load.test.ts
describe('Load Testing', () => {
  it('should handle 1000 concurrent requests', async () => {
    const requests = Array(1000).fill(null).map(() =>
      fetch('/api/services')
    );
    
    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    
    const successful = responses.filter(r => r.status === 200);
    expect(successful.length).toBeGreaterThan(900); // 90% success rate
    expect(duration).toBeLessThan(5000); // Complete within 5 seconds
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All critical paths covered
- **Security Tests**: All security controls tested
- **E2E Tests**: All major user flows covered

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run security tests
        run: npm run test:security
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Security audit
        run: npm audit --audit-level=high
```

### Manual Testing Checklist

Before deployment, manually verify:

- [ ] Rate limiting works on all endpoint tiers
- [ ] CSRF protection blocks unauthorized requests
- [ ] Validation rejects all invalid inputs
- [ ] Error messages don't leak sensitive information
- [ ] Logs don't contain passwords or tokens
- [ ] Sentry receives error events
- [ ] Security headers are present in responses
- [ ] WebSocket authentication works
- [ ] File upload validation works
- [ ] Environment validation catches missing variables



## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Priority: Critical**

1. **Environment Validation**
   - Create environment schema
   - Implement validation logic
   - Update server.js to validate on startup
   - Update .env.example with all variables

2. **Logging System**
   - Implement logger with structured format
   - Add sensitive data redaction
   - Add request logging helpers
   - Test log output format

3. **Error Handling**
   - Create error class hierarchy
   - Implement centralized error handler
   - Create standardized response helpers
   - Add error codes

**Deliverables:**
- Environment validation prevents startup with invalid config
- Structured JSON logging to stdout
- Consistent error responses across all routes

### Phase 2: Input Validation (Week 1-2)

**Priority: Critical**

1. **Validation Infrastructure**
   - Install and configure Zod
   - Create common validation schemas
   - Implement validation utilities
   - Create sanitization functions

2. **Schema Creation**
   - Authentication schemas
   - User management schemas
   - Order schemas
   - Service schemas
   - File upload schemas

3. **API Route Integration**
   - Create API wrapper function
   - Refactor existing routes to use validation
   - Add validation tests

**Deliverables:**
- All API routes validate inputs
- Validation errors return detailed field-level errors
- XSS and injection attempts are blocked

### Phase 3: Rate Limiting (Week 2)

**Priority: High**

1. **Redis Setup**
   - Configure Upstash Redis or self-hosted Redis
   - Test Redis connectivity
   - Implement fallback for development

2. **Rate Limiter Implementation**
   - Install @upstash/ratelimit
   - Create rate limit configurations
   - Implement rate limit checker
   - Add rate limit middleware

3. **Integration**
   - Add rate limiting to API wrapper
   - Configure limits per endpoint type
   - Add rate limit headers to responses
   - Test rate limit enforcement

**Deliverables:**
- Rate limiting active on all API routes
- Different limits for auth, upload, and default endpoints
- Rate limit headers in responses

### Phase 4: Security Headers & CSRF (Week 2-3)

**Priority: High**

1. **Security Headers**
   - Update middleware with security headers
   - Configure CSP directives
   - Test headers in responses
   - Adjust CSP for third-party services

2. **CSRF Protection**
   - Implement token generation and validation
   - Create CSRF middleware
   - Add CSRF token endpoint
   - Update client-side API helper
   - Test CSRF protection

**Deliverables:**
- Security headers on all responses
- CSRF protection on state-changing requests
- Client-side CSRF token management

### Phase 5: Monitoring & Observability (Week 3)

**Priority: High**

1. **Sentry Integration**
   - Install @sentry/nextjs
   - Configure Sentry for client and server
   - Implement error filtering
   - Test error reporting

2. **Audit Logging**
   - Add audit log helpers to logger
   - Implement audit logging for security events
   - Test audit log format and storage

3. **Monitoring Setup**
   - Configure log aggregation
   - Set up alerts for critical errors
   - Create monitoring dashboard
   - Document monitoring procedures

**Deliverables:**
- Errors automatically reported to Sentry
- Audit logs for all security-relevant events
- Alerts configured for critical issues

### Phase 6: WebSocket Security (Week 3-4)

**Priority: Medium**

1. **WebSocket Authentication**
   - Implement auth middleware for Socket.io
   - Test connection authentication
   - Add connection logging

2. **WebSocket Rate Limiting**
   - Implement message rate limiting
   - Add message size validation
   - Implement idle timeout

3. **Message Validation**
   - Create message schemas
   - Implement validation for all message types
   - Test message validation

**Deliverables:**
- WebSocket connections require authentication
- Message rate limiting prevents abuse
- All messages validated before processing

### Phase 7: Testing & Documentation (Week 4)

**Priority: High**

1. **Test Suite**
   - Write unit tests for all components
   - Write integration tests for API routes
   - Write security tests
   - Achieve 80%+ code coverage

2. **Documentation**
   - Update API documentation
   - Create security documentation
   - Document deployment procedures
   - Create runbooks for common issues

3. **Security Audit**
   - Run security audit tools
   - Perform penetration testing
   - Fix identified vulnerabilities
   - Document security posture

**Deliverables:**
- Comprehensive test suite
- Complete documentation
- Security audit report

## Migration Strategy

### Backward Compatibility

This feature is designed to be **backward compatible** with existing code:

1. **No Breaking Changes**: Existing API routes continue to work
2. **Gradual Migration**: Routes can be migrated one at a time
3. **Feature Flags**: Security features can be toggled via environment variables
4. **Graceful Degradation**: Missing Redis falls back to in-memory rate limiting

### Migration Steps

#### Step 1: Deploy Infrastructure
1. Deploy with all security features enabled
2. Monitor error rates and performance
3. Adjust rate limits if needed

#### Step 2: Migrate API Routes
1. Start with low-traffic routes
2. Add validation and error handling
3. Monitor for issues
4. Gradually migrate all routes

#### Step 3: Enable Strict Mode
1. Enable CSRF protection
2. Enforce rate limits
3. Enable security headers
4. Monitor for false positives

#### Step 4: Cleanup
1. Remove old error handling code
2. Remove redundant validation
3. Update documentation
4. Archive old patterns

### Rollback Procedures

If issues arise:

1. **Disable CSRF**: Set `DISABLE_CSRF=true` (temporary)
2. **Relax Rate Limits**: Increase limits via environment variables
3. **Disable Sentry**: Remove `SENTRY_DSN` to stop error reporting
4. **Full Rollback**: Revert to previous deployment

## Success Metrics

### Security Metrics

- **Validation Coverage**: 100% of API routes validate inputs
- **Rate Limit Effectiveness**: <1% of legitimate requests rate limited
- **CSRF Protection**: 0 successful CSRF attacks
- **Error Exposure**: 0 sensitive data leaks in error responses
- **Audit Coverage**: 100% of security events logged

### Performance Metrics

- **API Latency**: <50ms overhead from security controls
- **Error Rate**: <0.1% increase in error rate
- **Availability**: 99.9% uptime maintained
- **WebSocket Performance**: <100ms connection time

### Operational Metrics

- **Error Detection**: 100% of errors reported to Sentry
- **Log Quality**: 100% of logs structured and parseable
- **Alert Accuracy**: <5% false positive rate
- **Incident Response**: <15 minutes to detect and respond

## Risks and Mitigations

### Risk 1: Rate Limiting Too Strict

**Impact**: Legitimate users blocked

**Mitigation**:
- Start with lenient limits
- Monitor rate limit hit rates
- Provide clear error messages with retry-after
- Allow per-user limit increases for power users

### Risk 2: CSRF Breaks Existing Clients

**Impact**: API requests fail with 403

**Mitigation**:
- Exempt authentication endpoints
- Provide clear documentation
- Support both header and cookie-based tokens
- Allow temporary disabling for testing

### Risk 3: Validation Rejects Valid Inputs

**Impact**: Users cannot complete actions

**Mitigation**:
- Comprehensive test coverage
- Gradual rollout
- Monitor validation error rates
- Quick rollback capability

### Risk 4: Performance Degradation

**Impact**: Slower API responses

**Mitigation**:
- Benchmark before and after
- Optimize hot paths
- Use Redis for rate limiting (not in-memory)
- Monitor p95/p99 latencies

### Risk 5: Redis Unavailability

**Impact**: Rate limiting fails

**Mitigation**:
- Fallback to in-memory rate limiting
- Redis high availability setup
- Monitor Redis health
- Alert on Redis failures

## Conclusion

This design provides a comprehensive security and foundation improvement for the ConsultPro platform. The implementation follows industry best practices and is designed for:

- **Security**: Multiple layers of defense against common attacks
- **Reliability**: Graceful degradation and error handling
- **Observability**: Comprehensive logging and monitoring
- **Maintainability**: Clean architecture and consistent patterns
- **Performance**: Minimal overhead from security controls
- **Scalability**: Designed for horizontal scaling

The phased implementation approach allows for gradual rollout with minimal risk, while the comprehensive testing strategy ensures quality and security.

