# API Routes Protection Level Categorization
**Date:** 2024
**Spec:** API Route RBAC Protection Bugfix
**Task:** 0.1.2 - Categorize all routes by required protection level

## Executive Summary

**Total Routes Categorized:** 65+ routes
**Protection Levels:**
- **PUBLIC**: 14 routes (intentionally accessible without authentication)
- **AUTHENTICATED**: 1 route (any logged-in user)
- **ADMIN**: 15 routes (ADMIN role only)
- **CONSULTANT**: 12 routes (CONSULTANT role only)
- **CLIENT**: 7 routes (CLIENT role only)
- **OWNERSHIP**: 16 routes (role + ownership validation required)

---

## 1. PUBLIC Routes (14 routes)

These routes are intentionally public and should remain accessible without authentication:

| Route | Methods | Purpose | Current Status |
|-------|---------|---------|----------------|
| `/api/services` | GET | Public service catalog | ✅ Public |
| `/api/services/with-tiers` | GET | Public service pricing | ✅ Public |
| `/api/consultants/available` | GET | Public consultant listing | ✅ Public |
| `/api/consultants/schedule` | GET | Public consultant schedules | ✅ Public |
| `/api/blogs` | GET | Public blog posts | ✅ Public |
| `/api/faqs` | GET | Public FAQ list | ✅ Public |
| `/api/hero` | GET | Public hero images | ✅ Public |
| `/api/content/[key]` | GET | Public site content | ✅ Public |
| `/api/contact` | POST | Public contact form | ✅ Public |
| `/api/csrf` | GET | Public CSRF token | ✅ Public |
| `/api/reviews` | GET | Public review list | ✅ Public |
| `/api/auth/login` | POST | Public login endpoint | ✅ Public |
| `/api/auth/register` | POST | Public registration endpoint | ✅ Public |
| `/api/auth/logout` | POST | Public logout endpoint | ✅ Public |

**Implementation:** No changes required - these routes should NOT have authentication checks added.

---

## 2. AUTHENTICATED Routes (1 route)

Routes requiring any logged-in user (no specific role required):

| Route | Methods | Purpose | Current Status | Required Fix |
|-------|---------|---------|----------------|--------------|
| `/api/auth/me` | GET | Get current user info | ✅ Has auth | Verify uses `requireAuth(request)` without role restriction |

**Implementation:** Use `requireAuth(request)` without specifying roles array (accepts any authenticated user).

---

## 3. ADMIN Routes (15 routes)

Routes requiring ADMIN role only:

### 3.1 Critical Admin Routes (8 routes)

| Route | Methods | Purpose | Current Status | Priority |
|-------|---------|---------|----------------|----------|
| `/api/admin/billing` | GET, POST, PUT, DELETE | Manage all invoices | ❌ NO AUTH | CRITICAL |
| `/api/admin/orders` | GET, PUT | View/update all orders | ❌ NO AUTH | CRITICAL |
| `/api/admin/orders/[id]` | DELETE | Delete any order | ❌ NO AUTH | CRITICAL |
| `/api/admin/stats` | GET | View business metrics | ❌ NO AUTH | CRITICAL |
| `/api/admin/hero` | POST, DELETE | Manage hero content | ❌ NO AUTH (GET is public) | HIGH |
| `/api/admin/services/[id]` | GET, PUT, DELETE | Manage services | ⚠️ Deprecated pattern | HIGH |
| `/api/admin/contacts/[id]` | PUT, DELETE | Manage contacts | ⚠️ Deprecated pattern | HIGH |
| `/api/admin/users` | GET, POST, PUT | Manage users | ✅ Properly protected | ✅ DONE |

### 3.2 Content Management Admin Routes (4 routes)

| Route | Methods | Purpose | Current Status | Priority |
|-------|---------|---------|----------------|----------|
| `/api/faqs` | POST | Create FAQ | ❌ NO AUTH | MEDIUM |
| `/api/faqs/[id]` | PUT, DELETE | Update/delete FAQ | ❌ NO AUTH | MEDIUM |
| `/api/content/[key]` | PUT | Update site content | ⚠️ Deprecated pattern | MEDIUM |
| `/api/reviews/[id]` | PATCH, DELETE | Moderate reviews (ADMIN only) | ⚠️ Deprecated pattern | MEDIUM |

### 3.3 Upload Admin Routes (3 routes)

| Route | Methods | Purpose | Current Status | Priority |
|-------|---------|---------|----------------|----------|
| `/api/upload/image` | POST | Upload images (ADMIN only) | ⚠️ Deprecated pattern | MEDIUM |
| `/api/upload/icon` | POST | Upload icons | ❌ NO AUTH | MEDIUM |
| `/api/upload/logo` | POST | Upload logos | ❌ NO AUTH | MEDIUM |

**Implementation:** Add `requireAuth(request, ['ADMIN'])` to all methods.

**Note:** Some routes like `/api/admin/hero` have mixed protection - GET is public, POST/DELETE require ADMIN.

---

## 4. CONSULTANT Routes (12 routes)

Routes requiring CONSULTANT role only:

### 4.1 Consultant Business Routes (7 routes)

| Route | Methods | Purpose | Current Status | Priority |
|-------|---------|---------|----------------|----------|
| `/api/consultant/profile` | GET, PUT | Manage consultant profile | ✅ Properly protected | ✅ DONE |
| `/api/consultant/portfolio` | GET, PATCH | Manage portfolio | ⚠️ Weak protection (`getConsultantId`) | HIGH |
| `/api/consultant/stats` | GET | View consultant stats | ⚠️ Weak protection (`getAuthToken`) | HIGH |
| `/api/consultant/clients` | GET | View assigned clients | ⚠️ Weak protection (`getConsultantId`) | HIGH |
| `/api/consultant/reviews` | GET | View consultant reviews | ⚠️ Deprecated pattern (`getCurrentUser`) | HIGH |
| `/api/consultant/calls` | GET | View scheduled calls | ⚠️ Weak protection (`getConsultantId`) | HIGH |
| `/api/consultant/messages` | GET, POST | Manage messages | ⚠️ Weak protection (`getConsultantId`) | HIGH |

### 4.2 Consultant Order Management Routes (5 routes)

| Route | Methods | Purpose | Current Status | Priority |
|-------|---------|---------|----------------|----------|
| `/api/consultant/orders/[orderId]/status` | PATCH | Update order status | ⚠️ Weak protection (`getConsultantId`) | HIGH |
| `/api/consultant/reservations` | GET, PATCH, DELETE | Manage reservations | ⚠️ Weak protection (`getConsultantId`) | HIGH |
| `/api/consultant/missions` | GET, POST, PATCH, DELETE | Manage missions | ⚠️ Weak protection (`getConsultantId`) | HIGH |
| `/api/consultant/milestones` | POST, PATCH, DELETE | Manage milestones | ❌ NO AUTH | HIGH |

**Implementation:** 
- Add `requireAuth(request, ['CONSULTANT'])` to all methods
- Use `authResult.user.userId` to filter data to consultant's own resources
- Remove deprecated `getConsultantId()`, `getCurrentUser()`, `getAuthToken()` patterns

**Note:** These routes should filter data by `consultantId` to ensure consultants only see their own data.

---

## 5. CLIENT Routes (7 routes)

Routes requiring CLIENT role only (without ownership validation):

| Route | Methods | Purpose | Current Status | Priority |
|-------|---------|---------|----------------|----------|
| `/api/client/profile` | GET, PUT | Manage client profile | ✅ Properly protected | ✅ DONE |
| `/api/client/purchase` | POST | Purchase services | ⚠️ Deprecated pattern (`getCurrentUser`) | HIGH |
| `/api/client/invoices` | GET | View client invoices | ⚠️ Deprecated pattern (`getCurrentUser`) | HIGH |
| `/api/reviews` | POST | Create review (CLIENT only) | ⚠️ Weak protection (`getClientId`) | MEDIUM |
| `/api/upload/document` | POST | Upload documents | ❌ NO AUTH | MEDIUM |

**Implementation:**
- Add `requireAuth(request, ['CLIENT'])` to all methods
- Use `authResult.user.userId` to filter data to client's own resources
- Remove deprecated `getCurrentUser()`, `getClientId()` patterns

**Note:** These routes filter by `clientId` but don't require explicit ownership validation of individual resources.

---

## 6. OWNERSHIP Routes (16 routes)

Routes requiring role-based authentication PLUS ownership validation:

### 6.1 Client Ownership Routes (8 routes)

| Route | Methods | Purpose | Current Status | Ownership Check | Priority |
|-------|---------|---------|----------------|-----------------|----------|
| `/api/client/orders/[orderId]` | GET | View specific order | ⚠️ Deprecated pattern | ✅ Has check | HIGH |
| `/api/client/reservations` | DELETE | Cancel reservation | ⚠️ Deprecated pattern | ✅ Has check | HIGH |
| `/api/client/milestones` | PATCH | Update milestone | ⚠️ Deprecated pattern | ✅ Has check | HIGH |

**Required Role:** CLIENT
**Ownership Validation:** Must verify `resource.clientId === authResult.user.userId` (or allow ADMIN bypass)

### 6.2 Consultant Ownership Routes (7 routes)

| Route | Methods | Purpose | Current Status | Ownership Check | Priority |
|-------|---------|---------|----------------|-----------------|----------|
| `/api/consultant/orders/[orderId]/status` | PATCH | Update order status | ⚠️ Weak protection | ✅ Has check | HIGH |
| `/api/consultant/reservations` | GET, PATCH, DELETE | Manage reservations | ⚠️ Weak protection | ✅ Has check | HIGH |
| `/api/consultant/messages` | GET, POST | Manage messages | ⚠️ Weak protection | ✅ Has check | HIGH |
| `/api/consultant/missions` | GET, POST, PATCH, DELETE | Manage missions | ⚠️ Weak protection | ✅ Has check | HIGH |
| `/api/consultant/calls` | GET | View calls | ⚠️ Weak protection | ✅ Has check | HIGH |

**Required Role:** CONSULTANT
**Ownership Validation:** Must verify `resource.consultantId === authResult.user.userId` (or allow ADMIN bypass)

### 6.3 Review Ownership Routes (1 route)

| Route | Methods | Purpose | Current Status | Ownership Check | Priority |
|-------|---------|---------|----------------|-----------------|----------|
| `/api/reviews` | PATCH | Update own review | ⚠️ Weak protection | ✅ Has check (POST only) | MEDIUM |

**Required Role:** CLIENT
**Ownership Validation:** Must verify `review.clientId === authResult.user.userId` (or allow ADMIN to moderate)

**Implementation:**
1. Add `requireAuth(request, ['CLIENT'])` or `requireAuth(request, ['CONSULTANT'])` as appropriate
2. Fetch the resource from database
3. Add `requireOwnership(authResult.user, resource.ownerId)` check
4. Return 403 if ownership check fails (unless user is ADMIN)

**Note:** ADMIN users should bypass ownership checks to allow administrative access to all resources.

---

## Summary by Priority

### Phase 1: CRITICAL (8 routes)
**Admin routes with NO authentication - complete data breach potential**

1. `/api/admin/billing` - GET, POST, PUT, DELETE
2. `/api/admin/orders` - GET, PUT
3. `/api/admin/orders/[id]` - DELETE
4. `/api/admin/stats` - GET
5. `/api/admin/hero` - POST, DELETE

**Protection Level:** ADMIN
**Required Action:** Add `requireAuth(request, ['ADMIN'])` immediately

### Phase 2: HIGH (25 routes)
**Consultant and Client routes with weak/deprecated protection**

**Consultant Routes (12 routes):**
- All `/api/consultant/*` routes except `/api/consultant/profile` (already protected)

**Client Routes (5 routes):**
- `/api/client/orders/[orderId]` - GET (OWNERSHIP)
- `/api/client/reservations` - DELETE (OWNERSHIP)
- `/api/client/purchase` - POST (CLIENT)
- `/api/client/invoices` - GET (CLIENT)
- `/api/client/milestones` - PATCH (OWNERSHIP)

**Admin Routes with Deprecated Patterns (3 routes):**
- `/api/admin/services/[id]` - GET, PUT, DELETE (ADMIN)
- `/api/admin/contacts/[id]` - PUT, DELETE (ADMIN)

**Protection Levels:** ADMIN, CONSULTANT, CLIENT, OWNERSHIP
**Required Action:** Replace deprecated patterns with `requireAuth()` and add ownership validation where needed

### Phase 3: MEDIUM (9 routes)
**Review, Upload, FAQ routes with missing protection**

**Review Routes (2 routes):**
- `/api/reviews` - POST (CLIENT), PATCH (OWNERSHIP)
- `/api/reviews/[id]` - PATCH, DELETE (ADMIN for moderation)

**Upload Routes (4 routes):**
- `/api/upload/document` - POST (CLIENT)
- `/api/upload/icon` - POST (ADMIN)
- `/api/upload/logo` - POST (ADMIN)
- `/api/upload/image` - POST (ADMIN, strengthen protection)

**FAQ Routes (2 routes):**
- `/api/faqs` - POST (ADMIN)
- `/api/faqs/[id]` - PUT, DELETE (ADMIN)

**Content Routes (1 route):**
- `/api/content/[key]` - PUT (ADMIN, strengthen protection)

**Protection Levels:** ADMIN, CLIENT, OWNERSHIP
**Required Action:** Add appropriate role-based protection

### Phase 4: LOW (1 route)
**Routes with weak protection but less critical**

- `/api/notifications` - GET, PATCH, PUT (AUTHENTICATED, strengthen protection)

**Protection Level:** AUTHENTICATED
**Required Action:** Refactor to use `requireAuth()` for consistency

---

## Protection Level Implementation Guide

### PUBLIC
```typescript
// No authentication required
export async function GET() {
  try {
    const data = await fetchPublicData();
    return successResponse(data);
  } catch (error) {
    return handleError(error);
  }
}
```

### AUTHENTICATED
```typescript
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request); // No role restriction
  if (!authResult.success) return authResult.response;
  
  try {
    const data = await fetchUserData(authResult.user.userId);
    return successResponse(data);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### ADMIN
```typescript
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const data = await fetchAdminData();
    return successResponse(data);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### CONSULTANT
```typescript
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;
  
  try {
    // Filter data to consultant's own resources
    const data = await fetchConsultantData(authResult.user.userId);
    return successResponse(data);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### CLIENT
```typescript
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;
  
  try {
    // Filter data to client's own resources
    const data = await fetchClientData(authResult.user.userId);
    return successResponse(data);
  } catch (error) {
    return handleError(error, request);
  }
}
```

### OWNERSHIP
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;
  
  try {
    // Fetch resource
    const order = await prisma.order.findUnique({
      where: { id: params.orderId }
    });
    
    if (!order) {
      throw new NotFoundError('Order', params.orderId);
    }
    
    // Check ownership (ADMIN bypass)
    const ownershipResult = requireOwnership(authResult.user, order.clientId);
    if (!ownershipResult.success) {
      return ownershipResult.response;
    }
    
    return successResponse(order);
  } catch (error) {
    return handleError(error, request);
  }
}
```

---

## Files Requiring Changes by Protection Level

### ADMIN (15 files)
- `src/app/api/admin/billing/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/orders/[id]/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/hero/route.ts`
- `src/app/api/admin/services/[id]/route.ts`
- `src/app/api/admin/contacts/[id]/route.ts`
- `src/app/api/faqs/route.ts` (POST only)
- `src/app/api/faqs/[id]/route.ts` (PUT, DELETE)
- `src/app/api/content/[key]/route.ts` (PUT only)
- `src/app/api/reviews/[id]/route.ts` (PATCH, DELETE for moderation)
- `src/app/api/upload/image/route.ts`
- `src/app/api/upload/icon/route.ts`
- `src/app/api/upload/logo/route.ts`

### CONSULTANT (12 files)
- `src/app/api/consultant/portfolio/route.ts`
- `src/app/api/consultant/stats/route.ts`
- `src/app/api/consultant/clients/route.ts`
- `src/app/api/consultant/reviews/route.ts`
- `src/app/api/consultant/calls/route.ts`
- `src/app/api/consultant/messages/route.ts`
- `src/app/api/consultant/orders/[orderId]/status/route.ts` (also OWNERSHIP)
- `src/app/api/consultant/reservations/route.ts` (also OWNERSHIP)
- `src/app/api/consultant/missions/route.ts` (also OWNERSHIP)
- `src/app/api/consultant/milestones/route.ts` (also OWNERSHIP)

### CLIENT (7 files)
- `src/app/api/client/purchase/route.ts`
- `src/app/api/client/invoices/route.ts`
- `src/app/api/reviews/route.ts` (POST only)
- `src/app/api/upload/document/route.ts`
- `src/app/api/client/orders/[orderId]/route.ts` (also OWNERSHIP)
- `src/app/api/client/reservations/route.ts` (also OWNERSHIP)
- `src/app/api/client/milestones/route.ts` (also OWNERSHIP)

### OWNERSHIP (16 files)
- All CLIENT routes that access specific resources (3 files)
- All CONSULTANT routes that access specific resources (7 files)
- Review modification routes (1 file)

### AUTHENTICATED (1 file)
- `src/app/api/auth/me/route.ts`

### PUBLIC (14 files)
- No changes required - verify they remain public

**Total Files to Modify:** 43 files (excluding PUBLIC routes)

---

## Conclusion

This categorization provides a clear roadmap for implementing RBAC protection across all 65+ API routes. The protection levels are:

1. **PUBLIC (14 routes)**: No changes - remain accessible without authentication
2. **AUTHENTICATED (1 route)**: Require any logged-in user
3. **ADMIN (15 routes)**: Require ADMIN role only
4. **CONSULTANT (12 routes)**: Require CONSULTANT role only
5. **CLIENT (7 routes)**: Require CLIENT role only
6. **OWNERSHIP (16 routes)**: Require role + ownership validation

The phased implementation approach prioritizes critical admin routes first, followed by consultant and client routes, then less critical functionality. Each protection level has a clear implementation pattern using `requireAuth()` and `requireOwnership()` middleware.
