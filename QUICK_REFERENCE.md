# Security Foundation - Quick Reference

## 🚀 Quick Start (2 Minutes)

```bash
# 1. Update .env
echo "NODE_ENV=development" >> .env
echo "LOG_LEVEL=info" >> .env
echo "DISABLE_CSRF=true" >> .env  # Development only!

# 2. Install dependencies (already done)
npm install

# 3. Start server
npm run dev
```

---

## 📚 Common Imports

```typescript
// Logging
import { logger } from '@/lib/logger/logger';

// Error Handling
import { handleError, successResponse } from '@/lib/errors/handler';
import { ValidationError, NotFoundError, AuthenticationError } from '@/lib/errors/types';

// Validation
import { validate } from '@/lib/validation/validator';
import { emailSchema, passwordSchema, cuidSchema } from '@/lib/validation/schemas/common.schemas';

// Rate Limiting
import { withRateLimit } from '@/lib/ratelimit/middleware';

// Environment
import { env } from '@/lib/env';

// CSRF
import { validateCsrf } from '@/lib/csrf/middleware';
```

---

## 🔥 Code Snippets

### API Route Template

```typescript
import { NextRequest } from 'next/server';
import { handleError, successResponse } from '@/lib/errors/handler';
import { validate } from '@/lib/validation/validator';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logger } from '@/lib/logger/logger';
import { z } from 'zod';

// Define schema
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (optional)
    const rateLimitResponse = await withRateLimit(request, 'default');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Parse and validate
    const body = await request.json();
    const data = validate(schema, body);
    
    // Your business logic
    const result = await createResource(data);
    
    // Log success
    logger.info('Resource created', { resourceId: result.id });
    
    // Return success
    return successResponse(result, 'Resource created', 201);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Logging Examples

```typescript
// Basic logging
logger.info('User action', { userId, action: 'login' });
logger.error('Operation failed', { error: err.message });

// Request logging
logger.logRequest('POST', '/api/users', 201, 150);

// Auth logging
logger.logAuthSuccess(userId, 'email');
logger.logAuthFailure(email, 'invalid_password', { ip });

// Audit logging
logger.logAudit('user_created', 'User', adminId, { targetUserId });
```

### Validation Examples

```typescript
import { z } from 'zod';
import { validate } from '@/lib/validation/validator';
import { emailSchema, passwordSchema } from '@/lib/validation/schemas/common.schemas';

// Simple validation
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const data = validate(loginSchema, body);

// Complex validation
const userSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional(),
  role: z.enum(['CLIENT', 'CONSULTANT', 'ADMIN'])
});

// Validation with refinement
const passwordChangeSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
```

### Error Handling Examples

```typescript
// Throw custom errors
throw new ValidationError('Invalid input', [
  { field: 'email', message: 'Email is required' }
]);

throw new NotFoundError('User', userId);
throw new AuthenticationError('Invalid credentials');
throw new AuthorizationError('Insufficient permissions');

// Handle in route
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(id);
    if (!user) throw new NotFoundError('User', id);
    return successResponse(user);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Rate Limiting Examples

```typescript
// Default rate limit (100 req/15min)
const response = await withRateLimit(request);
if (response) return response;

// Auth rate limit (5 req/15min)
const response = await withRateLimit(request, 'auth');
if (response) return response;

// Upload rate limit (20 req/min)
const response = await withRateLimit(request, 'upload');
if (response) return response;

// With user ID (for authenticated requests)
const response = await withRateLimit(request, 'default', userId);
if (response) return response;
```

---

## 🔧 Configuration

### Rate Limits

Edit `src/lib/ratelimit/config.ts`:

```typescript
export const RATE_LIMIT_CONFIG = {
  default: { requests: 100, window: '15 m' },
  auth: { requests: 5, window: '15 m' },
  upload: { requests: 20, window: '1 m' },
  // Add custom tiers here
};
```

### Security Headers

Edit `middleware.ts` - `applySecurityHeaders()` function:

```typescript
// Add trusted domains to CSP
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' https://trusted-domain.com",
  // ...
];
```

### Log Level

Set in `.env`:
```env
LOG_LEVEL=debug  # debug, info, warn, error
```

---

## 🐛 Debugging

### Check Environment Validation

```bash
npm run dev
# Look for: ✅ Environment variables validated successfully
```

### Check Logs

All logs are JSON:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": { "userId": "123" }
}
```

### Check Rate Limits

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

### Check Security Headers

Browser DevTools → Network → Select request → Headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: ...
```

---

## ⚡ Performance Tips

1. **Redis for Production:** Always use Redis for rate limiting in production
2. **Log Level:** Use `info` or `warn` in production, `debug` only for troubleshooting
3. **CSRF:** Keep enabled in production, disable only for development
4. **Validation:** Validate early to fail fast
5. **Rate Limiting:** Apply stricter limits to expensive operations

---

## 🔒 Security Checklist

### Development
- [ ] `DISABLE_CSRF=true` in `.env`
- [ ] `LOG_LEVEL=debug` for detailed logs
- [ ] Redis optional (falls back to in-memory)

### Production
- [ ] `NODE_ENV=production`
- [ ] `DISABLE_CSRF=false` or removed
- [ ] `LOG_LEVEL=info` or `warn`
- [ ] Redis configured (`REDIS_URL`, `REDIS_TOKEN`)
- [ ] Strong secrets (32+ characters)
- [ ] HTTPS enabled
- [ ] Sentry configured (recommended)

---

## 📞 Common Scenarios

### Scenario 1: User Registration

```typescript
import { z } from 'zod';
import { validate } from '@/lib/validation/validator';
import { emailSchema, passwordSchema } from '@/lib/validation/schemas/common.schemas';
import { handleError, successResponse } from '@/lib/errors/handler';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logger } from '@/lib/logger/logger';
import { ConflictError } from '@/lib/errors/types';

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100)
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitResponse = await withRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate
    const body = await request.json();
    const data = validate(registerSchema, body);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Create user
    const user = await prisma.user.create({ data });
    
    // Log
    logger.logAudit('user_registered', 'User', user.id);
    
    return successResponse(user, 'User registered successfully', 201);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Scenario 2: Protected Resource

```typescript
import { NotFoundError, AuthorizationError } from '@/lib/errors/types';
import { handleError, successResponse } from '@/lib/errors/handler';
import { logger } from '@/lib/logger/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user (from your auth system)
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      throw new AuthenticationError();
    }
    
    // Get resource
    const resource = await prisma.resource.findUnique({
      where: { id: params.id }
    });
    
    if (!resource) {
      throw new NotFoundError('Resource', params.id);
    }
    
    // Check authorization
    if (resource.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
      logger.warn('Authorization failed', {
        userId: currentUser.id,
        resourceId: params.id,
        action: 'read'
      });
      throw new AuthorizationError();
    }
    
    return successResponse(resource);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Scenario 3: File Upload

```typescript
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
import { logger } from '@/lib/logger/logger';
import { ValidationError } from '@/lib/errors/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limit for uploads
    const rateLimitResponse = await withRateLimit(request, 'upload');
    if (rateLimitResponse) return rateLimitResponse;
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Validate file
    if (!file) {
      throw new ValidationError('File is required', [
        { field: 'file', message: 'File is required' }
      ]);
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new ValidationError('File too large', [
        { field: 'file', message: 'File must be less than 10MB' }
      ]);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('Invalid file type', [
        { field: 'file', message: 'File must be JPEG, PNG, or WebP' }
      ]);
    }
    
    // Upload file (your logic)
    const result = await uploadFile(file);
    
    // Log
    logger.logAudit('file_uploaded', 'File', userId, {
      filename: file.name,
      size: file.size,
      type: file.type
    });
    
    return successResponse(result, 'File uploaded successfully', 201);
  } catch (error) {
    return handleError(error, request);
  }
}
```

---

## 🎯 Key Takeaways

1. **Always validate input** - Use Zod schemas
2. **Always handle errors** - Use `handleError()`
3. **Always log important events** - Use `logger`
4. **Rate limit sensitive endpoints** - Use `withRateLimit()`
5. **Use type-safe env vars** - Import from `@/lib/env`
6. **Return consistent responses** - Use `successResponse()`
7. **Throw typed errors** - Use custom error classes

---

## 📖 Full Documentation

- **Implementation Summary:** `SECURITY_IMPLEMENTATION_SUMMARY.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **This Reference:** `QUICK_REFERENCE.md`
