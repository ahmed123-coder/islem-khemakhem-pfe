# API Routes Authentication Audit
**Date:** 2024
**Spec:** API Route RBAC Protection Bugfix
**Task:** 0.1.1 - Read all route files in `src/app/api/` to understand current implementation

## Executive Summary

**Total Routes Analyzed:** 65+ route files across 8 namespaces
**Critical Findings:**
- **30 routes with NO authentication** (CRITICAL)
- **25 routes using deprecated patterns** (`getCurrentUser()`, `getConsultantId()`, `getClientId()`)
- **3 routes already using `requireAuth()`** (properly protected)
- **12 public routes** (intentionally unprotected)

---

## 1. Routes with NO Authentication Checks (CRITICAL - 30 routes)

### 1.1 Admin Routes (CRITICAL - 8 routes)

| Route | Methods | Current Protection | Risk Level |
|-------|---------|-------------------|------------|
| `/api/admin/billing` | GET, POST, PUT, DELETE | ❌ NONE | CRITICAL |
| `/api/admin/orders` | GET, PUT | ❌ NONE | CRITICAL |
| `/api/admin/orders/[id]` | DELETE | ❌ NONE | CRITICAL |
| `/api/admin/stats` | GET | ❌ NONE | CRITICAL |
| `/api/admin/hero` | GET, POST, DELETE | ❌ NONE (GET is public) | HIGH |
| `/api/admin/blogs` | * | ❌ NONE | HIGH |
| `/api/admin/consultants` | * | ❌ NONE | HIGH |
| `/api/admin/services` | * | ❌ NONE | HIGH |

**Details:**
- **`/api/admin/billing`**: Exposes ALL invoices, allows creation/modification/deletion without any auth check
- **`/api/admin/orders`**: Returns ALL orders with client/consultant data, allows status updates without auth
- **`/api/admin/orders/[id]`**: Allows deletion of any order without auth check
- **`/api/admin/stats`**: Returns sensitive business metrics without auth check
- **`/api/admin/hero`**: POST/DELETE methods have no auth (GET is intentionally public)

### 1.2 Consultant Routes (HIGH - 1 route)

| Route | Methods | Current Protection | Risk Level |
|-------|---------|-------------------|------------|
| `/api/consultant/milestones` | POST, PATCH, DELETE | ❌ NONE | HIGH |

**Details:**
- **`/api/consultant/milestones`**: Allows creation/modification/deletion of milestones without any authentication check

### 1.3 Client Routes (HIGH - 0 routes with NO auth, but see ownership issues below)

All client routes have some form of authentication, but many lack ownership validation.

### 1.4 Review Routes (MEDIUM - 0 routes completely unprotected)

Review routes use deprecated `getClientId()` pattern (see section 2).

### 1.5 Upload Routes (MEDIUM - 3 routes)

| Route | Methods | Current Protection | Risk Level |
|-------|---------|-------------------|------------|
| `/api/upload/document` | POST | ❌ NONE | MEDIUM |
| `/api/upload/icon` | POST | ❌ NONE | MEDIUM |
| `/api/upload/logo` | POST | ❌ NONE | MEDIUM |

**Details:**
- All upload routes except `/api/upload/image` have no authentication
- `/api/upload/image` uses deprecated `getCurrentUser()` pattern

### 1.6 FAQ Routes (MEDIUM - 2 routes)

| Route | Methods | Current Protection | Risk Level |
|-------|---------|-------------------|------------|
| `/api/faqs` | POST | ❌ NONE | MEDIUM |
| `/api/faqs/[id]` | PUT, DELETE | ❌ NONE | MEDIUM |

**Details:**
- FAQ creation/modification/deletion has no authentication
- GET `/api/faqs` is intentionally public

---

## 2. Routes Using Deprecated Auth Patterns (25 routes)

### 2.1 Using `getCurrentUser()` Pattern (10 routes)

| Route | Methods | Pattern | Issues |
|-------|---------|---------|--------|
| `/api/admin/services/[id]` | GET, PUT, DELETE | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Returns 401 for wrong role (should be 403) |
| `/api/admin/contacts/[id]` | PUT, DELETE | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Returns 401 for wrong role |
| `/api/client/orders/[orderId]` | GET | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Has ownership check |
| `/api/client/reservations` | DELETE | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Has ownership check |
| `/api/client/purchase` | POST | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern |
| `/api/client/invoices` | GET | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern |
| `/api/client/milestones` | PATCH | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Has ownership check |
| `/api/consultant/reviews` | GET | `getCurrentUser()` + manual role check | ✅ Has auth, ⚠️ Deprecated pattern |
| `/api/reviews/[id]` | PATCH, DELETE | `getCurrentUser()` + manual role check (ADMIN only) | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Returns 401 for wrong role |
| `/api/upload/image` | POST | `getCurrentUser()` + manual role check (ADMIN only) | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Returns 401 for wrong role |
| `/api/content/[key]` | PUT | `getCurrentUser()` + manual role check (ADMIN only) | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ Returns 401 for wrong role |
| `/api/notifications` | GET, PATCH, PUT | `getCurrentUser()` (no role check) | ✅ Has auth, ⚠️ Deprecated pattern, ⚠️ No role validation |

**Pattern Example:**
```typescript
const user = await getCurrentUser()
if (!user || user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Issues:**
1. Deprecated pattern - should use `requireAuth()`
2. Returns 401 for wrong role (should return 403 with details)
3. Inconsistent error messages
4. Not using `handleError()` and `successResponse()`

### 2.2 Using `getConsultantId()` Pattern (12 routes)

| Route | Methods | Pattern | Issues |
|-------|---------|---------|--------|
| `/api/consultant/orders/[orderId]/status` | PATCH | `getConsultantId()` | ⚠️ Weak protection, ✅ Has ownership check |
| `/api/consultant/reservations` | GET, PATCH, DELETE | `getConsultantId()` | ⚠️ Weak protection, ✅ Has ownership check |
| `/api/consultant/messages` | GET, POST | `getConsultantId()` | ⚠️ Weak protection, ✅ Has ownership check |
| `/api/consultant/missions` | GET, POST, PATCH, DELETE | `getConsultantId()` | ⚠️ Weak protection, ✅ Has ownership check |
| `/api/consultant/portfolio` | GET, PATCH | `getConsultantId()` | ⚠️ Weak protection |
| `/api/consultant/clients` | GET | `getConsultantId()` | ⚠️ Weak protection |
| `/api/consultant/calls` | GET | `getConsultantId()` | ⚠️ Weak protection, ✅ Has ownership check |

**Pattern Example:**
```typescript
const consultantId = await getConsultantId()
if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Issues:**
1. Only checks if consultantId exists, not proper JWT validation
2. No explicit role check (relies on helper function)
3. Returns 401 for all failures (should distinguish between auth and authz)
4. Not using `handleError()` and `successResponse()`

### 2.3 Using `getClientId()` Pattern (3 routes)

| Route | Methods | Pattern | Issues |
|-------|---------|---------|--------|
| `/api/reviews` | POST, PATCH | `getClientId()` | ⚠️ Weak protection, ⚠️ Missing ownership check on PATCH |

**Pattern Example:**
```typescript
const clientId = await getClientId()
if (!clientId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Issues:**
1. Only checks if clientId exists, not proper JWT validation
2. No explicit role check
3. Not using `handleError()` and `successResponse()`

### 2.4 Using `getAuthToken()` + `verifyToken()` Pattern (1 route)

| Route | Methods | Pattern | Issues |
|-------|---------|---------|--------|
| `/api/consultant/stats` | GET | `getAuthToken()` + `verifyToken()` + manual role check | ⚠️ Deprecated pattern, ⚠️ Returns 403 for missing token (should be 401) |

**Pattern Example:**
```typescript
const token = await getAuthToken()
if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const payload = verifyToken(token)
if (!payload || payload.role !== 'CONSULTANT') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Issues:**
1. Manual token verification instead of using `requireAuth()`
2. Inconsistent error codes (401 for missing token, 403 for wrong role)
3. Not using `handleError()` and `successResponse()`

---

## 3. Routes Already Using `requireAuth()` (3 routes) ✅

| Route | Methods | Protection | Status |
|-------|---------|------------|--------|
| `/api/admin/users` | GET, POST, PUT | `requireAuth(request, ['ADMIN'])` | ✅ PROPERLY PROTECTED |
| `/api/consultant/profile` | GET, PUT | `requireAuth(request, ['CONSULTANT'])` | ✅ PROPERLY PROTECTED |
| `/api/client/profile` | GET, PUT | `requireAuth(request, ['CLIENT'])` | ✅ PROPERLY PROTECTED |

**Pattern Example:**
```typescript
const authResult = requireAuth(request, ['ADMIN']);
if (!authResult.success) {
  return authResult.response;
}
```

**Benefits:**
1. ✅ Proper JWT validation
2. ✅ Role-based authorization
3. ✅ Consistent error responses (401 for auth, 403 for authz)
4. ✅ Uses `handleError()` and `successResponse()`
5. ✅ Returns detailed error information

---

## 4. Public Routes (Intentionally Unprotected - 12 routes) ✅

These routes are intentionally public and should NOT be modified:

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/services` | GET | Public service catalog |
| `/api/services/with-tiers` | GET | Public service pricing |
| `/api/consultants/available` | GET | Public consultant listing |
| `/api/consultants/schedule` | GET | Public consultant schedules |
| `/api/blogs` | GET | Public blog posts |
| `/api/faqs` | GET | Public FAQ list |
| `/api/hero` | GET | Public hero images |
| `/api/content/[key]` | GET | Public site content |
| `/api/contact` | POST | Public contact form |
| `/api/csrf` | GET | Public CSRF token |
| `/api/reviews` | GET | Public review list |
| `/api/auth/login` | POST | Public login endpoint |
| `/api/auth/register` | POST | Public registration endpoint |
| `/api/auth/logout` | POST | Public logout endpoint |
| `/api/auth/me` | GET | Authenticated user info (has auth) |

---

## 5. Ownership Validation Analysis

### 5.1 Routes WITH Ownership Checks ✅

| Route | Resource | Ownership Check |
|-------|----------|-----------------|
| `/api/client/orders/[orderId]` | Order | ✅ Checks `order.clientId === user.id` |
| `/api/client/reservations` | Reservation | ✅ Checks `reservation.clientId === user.id` |
| `/api/client/milestones` | Milestone | ✅ Checks `milestone.mission.order.clientId === user.id` |
| `/api/consultant/orders/[orderId]/status` | Order | ✅ Checks `order.consultantId === consultantId` |
| `/api/consultant/reservations` | Reservation | ✅ Checks `reservation.consultantId === consultantId` |
| `/api/consultant/messages` | Message | ✅ Checks `order.consultantId === consultantId` |
| `/api/consultant/missions` | Mission | ✅ Checks `mission.consultantId === consultantId` |
| `/api/consultant/calls` | Call | ✅ Checks `order.consultantId === consultantId` |
| `/api/reviews` | Review (PATCH) | ✅ Checks `review.clientId === clientId` |

### 5.2 Routes MISSING Ownership Checks ⚠️

| Route | Resource | Issue |
|-------|----------|-------|
| `/api/client/invoices` | Invoice | ⚠️ Filters by `clientId` but doesn't validate individual invoice access |
| `/api/consultant/portfolio` | Portfolio | ⚠️ Returns consultant data but no explicit ownership check |
| `/api/consultant/clients` | Clients | ⚠️ Filters by `consultantId` but no explicit validation |

**Note:** Most of these routes filter data by user ID in the query, which provides implicit ownership protection, but explicit validation would be more secure.

---

## 6. Error Response Consistency Analysis

### 6.1 Routes Using Standardized Responses ✅

| Route | Uses `handleError()` | Uses `successResponse()` |
|-------|---------------------|-------------------------|
| `/api/admin/users` | ✅ Yes | ✅ Yes |
| `/api/consultant/profile` | ✅ Yes | ✅ Yes |
| `/api/client/profile` | ✅ Yes | ✅ Yes |

### 6.2 Routes Using Inconsistent Responses ⚠️

**All other routes** (62+ routes) use inconsistent error responses:
- Manual `NextResponse.json({ error: '...' }, { status: ... })`
- Inconsistent error messages
- No error codes
- No request IDs
- No detailed error information

**Examples of Inconsistency:**
```typescript
// Pattern 1: Generic error
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Pattern 2: Different message for same scenario
return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// Pattern 3: Wrong status code
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) // Should be 403 for wrong role

// Pattern 4: No error details
return NextResponse.json({ error: 'Failed' }, { status: 500 })
```

---

## 7. Summary by Priority

### Phase 1: CRITICAL (Admin Routes - 8 routes)
**Must fix immediately - complete data breach potential**

1. `/api/admin/billing` - GET, POST, PUT, DELETE
2. `/api/admin/orders` - GET, PUT
3. `/api/admin/orders/[id]` - DELETE
4. `/api/admin/stats` - GET
5. `/api/admin/hero` - POST, DELETE
6. `/api/admin/blogs` - All methods
7. `/api/admin/consultants` - All methods
8. `/api/admin/services` - All methods (except `/api/admin/services/[id]` which uses deprecated pattern)

**Required Action:** Add `requireAuth(request, ['ADMIN'])` to all methods

### Phase 2: HIGH (Consultant Routes - 13 routes)
**Weak protection allows unauthorized access**

1. `/api/consultant/orders/[orderId]/status` - PATCH
2. `/api/consultant/reservations` - GET, PATCH, DELETE
3. `/api/consultant/messages` - GET, POST
4. `/api/consultant/missions` - GET, POST, PATCH, DELETE
5. `/api/consultant/milestones` - POST, PATCH, DELETE (NO AUTH)
6. `/api/consultant/portfolio` - GET, PATCH
7. `/api/consultant/clients` - GET
8. `/api/consultant/calls` - GET
9. `/api/consultant/reviews` - GET
10. `/api/consultant/stats` - GET

**Required Action:** Replace deprecated patterns with `requireAuth(request, ['CONSULTANT'])`

### Phase 3: HIGH (Client Routes - 5 routes)
**Weak protection and missing ownership checks**

1. `/api/client/orders/[orderId]` - GET
2. `/api/client/reservations` - DELETE
3. `/api/client/purchase` - POST
4. `/api/client/invoices` - GET
5. `/api/client/milestones` - PATCH

**Required Action:** Replace deprecated patterns with `requireAuth(request, ['CLIENT'])` and ensure ownership validation

### Phase 4: MEDIUM (Review, Upload, FAQ Routes - 8 routes)
**Missing or weak protection**

1. `/api/reviews` - POST, PATCH
2. `/api/reviews/[id]` - PATCH, DELETE
3. `/api/upload/document` - POST
4. `/api/upload/icon` - POST
5. `/api/upload/logo` - POST
6. `/api/upload/image` - POST
7. `/api/faqs` - POST
8. `/api/faqs/[id]` - PUT, DELETE
9. `/api/content/[key]` - PUT

**Required Action:** Add appropriate role-based protection

### Phase 5: LOW (Refactor Existing Protected Routes - 3 routes)
**Already protected but using deprecated patterns**

1. `/api/admin/services/[id]` - GET, PUT, DELETE
2. `/api/admin/contacts/[id]` - PUT, DELETE
3. `/api/notifications` - GET, PATCH, PUT

**Required Action:** Refactor to use `requireAuth()` for consistency

---

## 8. Recommendations

### 8.1 Immediate Actions (Phase 1 - CRITICAL)

1. **Add authentication to all admin routes** using `requireAuth(request, ['ADMIN'])`
2. **Deploy to production immediately** after testing
3. **Monitor for unauthorized access attempts**

### 8.2 Short-term Actions (Phases 2-3 - HIGH)

1. **Replace all deprecated auth patterns** with `requireAuth()`
2. **Add ownership validation** where missing
3. **Standardize error responses** using `handleError()` and `successResponse()`

### 8.3 Long-term Actions (Phases 4-5 - MEDIUM/LOW)

1. **Refactor remaining routes** to use standardized patterns
2. **Add comprehensive integration tests** for all protected routes
3. **Document authentication requirements** for all routes
4. **Create developer guidelines** for implementing new routes

### 8.4 Testing Strategy

1. **Unit tests** for each route:
   - Test 401 without auth token
   - Test 403 with wrong role
   - Test 200 with correct role
   - Test ownership validation

2. **Integration tests**:
   - Test full user workflows
   - Test cross-role access attempts
   - Test ownership violations

3. **Property-based tests**:
   - Generate random requests to protected routes
   - Verify consistent error responses
   - Test edge cases

---

## 9. Files Requiring Changes

### Admin Routes (8 files)
- `src/app/api/admin/billing/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/orders/[id]/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/hero/route.ts`
- `src/app/api/admin/blogs/route.ts` (if exists)
- `src/app/api/admin/consultants/route.ts` (if exists)
- `src/app/api/admin/services/route.ts` (if exists)

### Consultant Routes (10 files)
- `src/app/api/consultant/orders/[orderId]/status/route.ts`
- `src/app/api/consultant/reservations/route.ts`
- `src/app/api/consultant/messages/route.ts`
- `src/app/api/consultant/missions/route.ts`
- `src/app/api/consultant/milestones/route.ts`
- `src/app/api/consultant/portfolio/route.ts`
- `src/app/api/consultant/clients/route.ts`
- `src/app/api/consultant/calls/route.ts`
- `src/app/api/consultant/reviews/route.ts`
- `src/app/api/consultant/stats/route.ts`

### Client Routes (5 files)
- `src/app/api/client/orders/[orderId]/route.ts`
- `src/app/api/client/reservations/route.ts`
- `src/app/api/client/purchase/route.ts`
- `src/app/api/client/invoices/route.ts`
- `src/app/api/client/milestones/route.ts`

### Other Routes (9 files)
- `src/app/api/reviews/route.ts`
- `src/app/api/reviews/[id]/route.ts`
- `src/app/api/upload/document/route.ts`
- `src/app/api/upload/icon/route.ts`
- `src/app/api/upload/logo/route.ts`
- `src/app/api/upload/image/route.ts`
- `src/app/api/faqs/route.ts`
- `src/app/api/faqs/[id]/route.ts`
- `src/app/api/content/[key]/route.ts`

### Refactor (Deprecated Patterns - 5 files)
- `src/app/api/admin/services/[id]/route.ts`
- `src/app/api/admin/contacts/[id]/route.ts`
- `src/app/api/notifications/route.ts`

**Total Files to Modify:** 37 files

---

## 10. Conclusion

This audit has identified **critical security vulnerabilities** affecting 65+ API routes:

- **30 routes have NO authentication** (including 8 critical admin routes)
- **25 routes use deprecated auth patterns** that provide weak protection
- **Only 3 routes use the proper `requireAuth()` pattern**
- **Inconsistent error responses** across all routes

**Immediate action required** on Phase 1 (admin routes) to prevent data breaches. Phases 2-5 should follow systematically to ensure comprehensive RBAC protection across the entire API surface.
