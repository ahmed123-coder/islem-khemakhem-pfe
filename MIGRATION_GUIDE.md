# Migration Guide - Security Foundation Updates

## Quick Start

### 1. Update Environment Variables (5 minutes)

```bash
# 1. Copy the new .env.example if you need reference
cp .env.example .env.reference

# 2. Add these to your existing .env file:
NODE_ENV=development
LOG_LEVEL=info
DISABLE_CSRF=true  # For development only - remove in production!

# 3. Ensure JWT_SECRET is at least 32 characters
# If it's shorter, generate a new one:
# openssl rand -base64 32
```

### 2. Install New Dependencies (2 minutes)

```bash
npm install
```

### 3. Test the Application (2 minutes)

```bash
npm run dev
```

You should see:
```
✅ Environment variables validated successfully
   Environment: development
   Port: 3000
   Database: localhost:5432/...
   Redis: not configured (will use in-memory fallback)
   Sentry: not configured
> Ready on http://localhost:3000
```

---

## Detailed Migration Steps

### Step 1: Environment Variables

#### Required Variables (Must Have)
Your `.env` must include:

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret-must-be-at-least-32-characters-long
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ZOOM_ACCOUNT_ID=your-zoom-account-id
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
```

#### Optional Variables (Recommended for Production)
```env
# Rate Limiting (highly recommended for production)
REDIS_URL=redis://default:password@host:port
REDIS_TOKEN=your-redis-token

# CSRF Protection
CSRF_SECRET=your-csrf-secret-at-least-32-characters-long
DISABLE_CSRF=false  # Set to true only for development

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Error Monitoring (recommended for production)
SENTRY_DSN=https://...@sentry.io/...
```

#### Validation Errors?

If you see errors like:
```
❌ Environment variable validation failed:
  • JWT_SECRET: String must contain at least 32 character(s)
```

**Fix:** Generate a new secret:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### Step 2: Frontend Changes for CSRF Protection

#### Option A: Disable CSRF for Development (Quick)

Add to `.env`:
```env
DISABLE_CSRF=true
```

**⚠️ WARNING:** Never use this in production!

#### Option B: Implement CSRF Protection (Recommended)

Create a utility file `src/lib/api/client.ts`:

```typescript
// Fetch CSRF token
let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  const response = await fetch('/api/csrf');
  const data = await response.json();
  csrfToken = data.token;
  return csrfToken;
}

// API request wrapper with CSRF
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  
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

**Usage:**
```typescript
// Before (will fail with CSRF enabled):
await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(data)
});

// After (works with CSRF):
import { apiRequest } from '@/lib/api/client';

await apiRequest('/api/users', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

---

### Step 3: Update Existing API Routes (Gradual)

You can update routes gradually. Here's the pattern:

#### Before:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  // No validation, no error handling
  const user = await prisma.user.create({ data: body });
  return NextResponse.json(user);
}
```

#### After:
```typescript
import { handleError, successResponse } from '@/lib/errors/handler';
import { validate } from '@/lib/validation/validator';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = validate(createUserSchema, body);
    
    const user = await prisma.user.create({ data });
    
    return successResponse(user, 'User created successfully', 201);
  } catch (error) {
    return handleError(error, request);
  }
}
```

---

### Step 4: Add Rate Limiting to Critical Routes (Optional)

For authentication routes, add rate limiting:

```typescript
import { withRateLimit } from '@/lib/ratelimit/middleware';

export async function POST(request: NextRequest) {
  // Check rate limit first
  const rateLimitResponse = await withRateLimit(request, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse; // 429 if exceeded
  }
  
  // Continue with authentication logic
  // ...
}
```

---

### Step 5: Production Deployment

#### Before Deploying:

1. **Update Environment Variables:**
```env
NODE_ENV=production
LOG_LEVEL=info
DISABLE_CSRF=false  # Remove this line or set to false
JWT_SECRET=<strong-32-char-secret>
CSRF_SECRET=<strong-32-char-secret>
REDIS_URL=<production-redis-url>
REDIS_TOKEN=<production-redis-token>
SENTRY_DSN=<your-sentry-dsn>  # Recommended
```

2. **Test Locally with Production Settings:**
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

3. **Verify:**
- [ ] Application starts without validation errors
- [ ] Security headers are present (check browser DevTools)
- [ ] Rate limiting works (test with multiple requests)
- [ ] CSRF protection works (test POST requests)
- [ ] Logs are structured JSON
- [ ] Errors return consistent format

---

## Common Issues & Solutions

### Issue 1: Application Won't Start

**Error:**
```
❌ Environment variable validation failed:
  • DATABASE_URL: Required
```

**Solution:** Add the missing variable to `.env`

---

### Issue 2: CSRF Token Invalid

**Error:** `403 Forbidden - Invalid CSRF token`

**Solutions:**
1. **Development:** Set `DISABLE_CSRF=true` in `.env`
2. **Production:** Implement CSRF token fetching (see Step 2)
3. **Check:** Ensure cookies are enabled in your browser

---

### Issue 3: Rate Limit Exceeded

**Error:** `429 Too Many Requests`

**Solutions:**
1. **Development:** Configure Redis or wait for rate limit to reset
2. **Production:** Ensure Redis is configured properly
3. **Adjust:** Modify rate limits in `src/lib/ratelimit/config.ts` if needed

---

### Issue 4: CSP Blocking Resources

**Error:** Console shows CSP violations

**Solution:** Update CSP in `middleware.ts`:
```typescript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://your-domain.com",
  // Add your trusted domains here
];
```

---

### Issue 5: Redis Connection Failed

**Warning:** `Redis: not configured (will use in-memory fallback)`

**Impact:** Rate limiting will use in-memory storage (not suitable for production with multiple instances)

**Solution:**
1. **Development:** This is fine, no action needed
2. **Production:** Configure Redis:
```env
REDIS_URL=redis://default:password@host:port
REDIS_TOKEN=your-token
```

---

## Testing Checklist

After migration, test:

- [ ] Application starts successfully
- [ ] Environment validation shows all required variables
- [ ] Can log in successfully
- [ ] Can create/update/delete resources
- [ ] Rate limiting works (try 6 login attempts quickly)
- [ ] Security headers present (check Network tab in DevTools)
- [ ] Errors return consistent JSON format
- [ ] Logs are structured JSON (check console)
- [ ] CSRF protection works (if enabled)

---

## Rollback Plan

If you need to rollback:

1. **Revert server.js:**
```bash
git checkout HEAD~1 server.js
```

2. **Remove new dependencies:**
```bash
npm uninstall @upstash/ratelimit @upstash/redis
```

3. **Revert middleware.ts:**
```bash
git checkout HEAD~1 middleware.ts
```

4. **Remove new directories:**
```bash
rm -rf src/lib/env src/lib/logger src/lib/errors src/lib/validation src/lib/ratelimit src/lib/csrf
```

---

## Support

If you encounter issues:

1. Check the logs for detailed error messages
2. Review `SECURITY_IMPLEMENTATION_SUMMARY.md` for usage examples
3. Check `.env.example` for required variables
4. Ensure all dependencies are installed: `npm install`

---

## Timeline Estimate

- **Minimum (Development):** 10 minutes
  - Update .env
  - Set DISABLE_CSRF=true
  - Test application starts

- **Recommended (Development):** 30 minutes
  - Update .env
  - Implement CSRF in frontend
  - Test all functionality

- **Full (Production Ready):** 2-4 hours
  - Update .env with production values
  - Configure Redis
  - Implement CSRF in frontend
  - Update critical API routes
  - Test thoroughly
  - Deploy

---

## Next Steps After Migration

1. **Immediate:**
   - Monitor logs for validation errors
   - Test all critical user flows
   - Verify external integrations work

2. **Short Term (1-2 weeks):**
   - Gradually update API routes to use new error handling
   - Add validation schemas for your domain models
   - Implement rate limiting on critical endpoints

3. **Medium Term (1 month):**
   - Integrate Sentry for error monitoring
   - Add audit logging to sensitive operations
   - Write integration tests

4. **Long Term:**
   - Implement WebSocket security (if using WebSockets)
   - Add comprehensive test coverage
   - Document API security features
