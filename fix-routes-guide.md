# Quick Route Protection Guide

## 🚀 Fast Track: Protect Routes in 5 Minutes

### Step 1: Add Imports (Copy-Paste)

Add these imports to the top of any route file:

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
```

### Step 2: Update Function Signature

```typescript
// BEFORE
export async function GET() {

// AFTER
export async function GET(request: NextRequest) {
```

### Step 3: Add Protection (First Line)

```typescript
// For ADMIN routes
const authResult = requireAuth(request, ['ADMIN']);
if (!authResult.success) return authResult.response;

// For CONSULTANT routes
const authResult = requireAuth(request, ['CONSULTANT']);
if (!authResult.success || !authResult.user) return authResult.response;

// For CLIENT routes
const authResult = requireAuth(request, ['CLIENT']);
if (!authResult.success || !authResult.user) return authResult.response;
```

### Step 4: Replace Old Auth Code

```typescript
// REMOVE these lines:
const user = await getCurrentUser()
if (!user || user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// REMOVE these lines:
const consultantId = await getConsultantId()
if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// REMOVE these lines:
const clientId = await getClientId()
if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Step 5: Use Authenticated User

```typescript
// Access user data from authResult
const userId = authResult.user.userId;
const userEmail = authResult.user.email;
const userRole = authResult.user.role;

// Use in queries
const data = await prisma.model.findMany({
  where: { userId: authResult.user.userId }
});
```

### Step 6: Update Response Format

```typescript
// BEFORE
return NextResponse.json(data)
return NextResponse.json({ error: 'Failed' }, { status: 500 })

// AFTER
return successResponse(data)
return handleError(error, request)
```

---

## 📝 Complete Examples

### Example 1: Simple Admin Route

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Step 1: Protect route
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  try {
    // Step 2: Your logic
    const data = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Step 3: Return success
    return successResponse(data);
  } catch (error) {
    // Step 4: Handle errors
    return handleError(error, request);
  }
}
```

### Example 2: Consultant Route with User Data

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Step 1: Protect route
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    // Step 2: Use authenticated user ID
    const missions = await prisma.mission.findMany({
      where: { consultantId: authResult.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Step 3: Return success
    return successResponse(missions);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Example 3: Client Route with Ownership Check

```typescript
import { NextRequest } from 'next/server';
import { requireAuth, requireOwnership } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
import { NotFoundError } from '@/lib/errors/types';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  // Step 1: Protect route
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    // Step 2: Fetch resource
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { serviceTier: { include: { service: true } } }
    });
    
    if (!order) {
      throw new NotFoundError('Order', params.orderId);
    }
    
    // Step 3: Check ownership
    const ownershipResult = requireOwnership(authResult.user, order.userId);
    if (!ownershipResult.success) {
      return ownershipResult.response;
    }
    
    // Step 4: Return success
    return successResponse(order);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Example 4: POST Route with Data Creation

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
import { validate } from '@/lib/validation/validator';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Define validation schema
const createMissionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  clientId: z.string().cuid()
});

export async function POST(request: NextRequest) {
  // Step 1: Protect route
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    // Step 2: Parse and validate input
    const body = await request.json();
    const data = validate(createMissionSchema, body);
    
    // Step 3: Create resource
    const mission = await prisma.mission.create({
      data: {
        ...data,
        consultantId: authResult.user.userId,
        status: 'PENDING'
      }
    });
    
    // Step 4: Return success
    return successResponse(mission, 'Mission created successfully', 201);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### Example 5: DELETE Route

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';
import { NotFoundError } from '@/lib/errors/types';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Step 1: Protect route
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  try {
    // Step 2: Check if exists
    const exists = await prisma.order.findUnique({
      where: { id: params.id }
    });
    
    if (!exists) {
      throw new NotFoundError('Order', params.id);
    }
    
    // Step 3: Delete
    await prisma.order.delete({
      where: { id: params.id }
    });
    
    // Step 4: Return success (204 No Content for DELETE)
    return successResponse(null, 'Order deleted successfully', 204);
  } catch (error) {
    return handleError(error, request);
  }
}
```

---

## 🎯 Priority Order

Fix routes in this order for maximum security impact:

### 1. Admin Billing & Orders (CRITICAL)
- `/api/admin/billing` - All methods
- `/api/admin/orders` - All methods
- `/api/admin/orders/[id]` - DELETE
- `/api/admin/orders/create` - POST

### 2. Admin Services (CRITICAL)
- `/api/admin/services` - All methods
- `/api/admin/services/[id]` - All methods
- `/api/admin/services/tiers` - All methods

### 3. Admin Stats & Content (HIGH)
- `/api/admin/stats` - GET
- `/api/admin/hero` - POST, DELETE
- `/api/admin/contacts/[id]` - PUT, DELETE

### 4. Consultant Core (HIGH)
- `/api/consultant/orders/[orderId]/status` - PATCH
- `/api/consultant/reservations` - All methods
- `/api/consultant/messages` - All methods
- `/api/consultant/missions` - All methods

### 5. Client Core (HIGH)
- `/api/client/orders/[orderId]` - GET
- `/api/client/reservations` - DELETE
- `/api/client/purchase/*` - All methods

---

## ⚡ Batch Fix Script

Use this pattern to fix multiple routes quickly:

```typescript
// 1. Add imports at top of file
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleError, successResponse } from '@/lib/errors/handler';

// 2. For each function, wrap with this pattern:
export async function METHOD(request: NextRequest) {
  const authResult = requireAuth(request, ['ROLE']);
  if (!authResult.success) return authResult.response;

  try {
    // ... existing logic ...
    return successResponse(data);
  } catch (error) {
    return handleError(error, request);
  }
}
```

---

## 🧪 Test Each Route After Fixing

```bash
# 1. Test without auth (should return 401)
curl -v http://localhost:3000/api/admin/orders

# 2. Test with wrong role (should return 403)
curl -v -H "Cookie: auth_token=CLIENT_TOKEN" http://localhost:3000/api/admin/orders

# 3. Test with correct role (should return 200)
curl -v -H "Cookie: auth_token=ADMIN_TOKEN" http://localhost:3000/api/admin/orders
```

---

## 📊 Track Your Progress

Create a checklist and mark off routes as you fix them:

```markdown
## Admin Routes Fixed
- [x] /api/admin/users
- [ ] /api/admin/billing
- [ ] /api/admin/orders
- [ ] /api/admin/services
...
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Forget to check authResult.success
```typescript
const authResult = requireAuth(request, ['ADMIN']);
// Missing check - route is unprotected!
const data = await prisma.order.findMany();
```

### ✅ DO: Always check and return
```typescript
const authResult = requireAuth(request, ['ADMIN']);
if (!authResult.success) return authResult.response;
// Now protected!
```

### ❌ DON'T: Use old getCurrentUser pattern
```typescript
const user = await getCurrentUser();
if (!user || user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### ✅ DO: Use new requireAuth pattern
```typescript
const authResult = requireAuth(request, ['ADMIN']);
if (!authResult.success) return authResult.response;
```

### ❌ DON'T: Return raw NextResponse.json
```typescript
return NextResponse.json(data);
return NextResponse.json({ error: 'Failed' }, { status: 500 });
```

### ✅ DO: Use response helpers
```typescript
return successResponse(data);
return handleError(error, request);
```

---

## 💡 Pro Tips

1. **Fix one file at a time** - Test after each fix
2. **Use find & replace** - Replace common patterns across files
3. **Keep old code commented** - Easy to rollback if needed
4. **Test with different roles** - Ensure 401/403 work correctly
5. **Check TypeScript errors** - Fix any type issues immediately

---

## 🎉 You're Done When...

- [ ] All routes have `requireAuth()` check
- [ ] All routes use `successResponse()` and `handleError()`
- [ ] All routes have correct role requirements
- [ ] All tests pass (401 for no auth, 403 for wrong role, 200 for correct role)
- [ ] No TypeScript errors
- [ ] API_ROUTES_AUDIT.md checklist is complete

---

## 📞 Need Help?

**Common Issues:**

1. **"Cannot find module '@/lib/auth/middleware'"**
   - Check the file exists at `src/lib/auth/middleware.ts`
   - Check your tsconfig.json has `@` alias configured

2. **"authResult.user is possibly undefined"**
   - Add null check: `if (!authResult.success || !authResult.user) return authResult.response;`

3. **"Type 'NextRequest' is not assignable to type 'Request'"**
   - Change parameter type from `Request` to `NextRequest`
   - Import from `next/server`

4. **Still getting 401 with valid token**
   - Check JWT_SECRET is correct in .env
   - Logout and login again to get fresh token
   - Check token in browser DevTools → Application → Cookies

---

## ✨ Summary

**Time per route:** 2-5 minutes
**Total routes to fix:** ~65 routes
**Estimated total time:** 2-5 hours (spread over a few days)

**Start with the critical admin routes today!** 🚀
