# API Route RBAC Protection Bugfix Design

## Overview

This design document addresses a critical security vulnerability affecting approximately 65 API routes (81% of all routes) that lack proper role-based access control (RBAC). The bug allows unauthorized users to access sensitive endpoints, view and modify data they should not have access to, and perform administrative actions without proper permissions.

**Severity:** CRITICAL - Active production security vulnerability with complete data breach potential

**Impact:** Unauthorized access to admin billing data, order management, service configuration, consultant data, and client-specific resources

**Fix Approach:** Systematic application of existing RBAC infrastructure (`requireAuth()`, `requireOwnership()`) to all unprotected routes, following a phased rollout prioritizing critical admin routes first

**Available Infrastructure:**
- ✅ `src/lib/auth/middleware.ts` - Reusable auth middleware
- ✅ `src/lib/errors/handler.ts` - Standardized error handling
- ✅ Frontend middleware - Proper role separation enforced

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when API routes lack proper RBAC protection (no authentication check, deprecated auth patterns, missing role checks, missing ownership validation, or inconsistent error responses)
- **Property (P)**: The desired behavior - routes must enforce authentication, role-based authorization, ownership validation (where applicable), and return consistent error responses
- **Preservation**: Existing public routes, auth routes, and already-protected routes that must remain unchanged by the fix
- **requireAuth()**: The function in `src/lib/auth/middleware.ts` that authenticates users and checks role permissions
- **requireOwnership()**: The function in `src/lib/auth/middleware.ts` that validates resource ownership
- **handleError()**: The function in `src/lib/errors/handler.ts` that returns standardized error responses
- **successResponse()**: The function in `src/lib/errors/handler.ts` that returns standardized success responses
- **F**: Original (unfixed) route handlers - code as it exists before the fix
- **F'**: Fixed route handlers - code after applying RBAC protection
- **ADMIN**: Role with full system access
- **CONSULTANT**: Role with access to consultant-specific resources
- **CLIENT**: Role with access to client-specific resources
- **Deprecated Pattern**: Old authentication patterns like `getCurrentUser()`, `getConsultantId()`, `getClientId()` that should be replaced with `requireAuth()`

## Bug Details

### Bug Condition

The bug manifests when API routes fail to properly enforce role-based access control. Routes are vulnerable when they lack authentication checks, use deprecated auth patterns, miss role-based authorization, lack ownership validation for user-specific resources, return inconsistent error responses, or don't use standardized response helpers.

**Formal Specification:**
```
FUNCTION isBugCondition(Route)
  INPUT: Route of type APIRoute
  OUTPUT: boolean
  
  // Route lacks proper protection if any of these conditions are true:
  RETURN (
    // No authentication check at all
    NOT hasAuthenticationCheck(Route) OR
    
    // Uses deprecated auth patterns
    usesDeprecatedPattern(Route, 'getConsultantId') OR
    usesDeprecatedPattern(Route, 'getClientId') OR
    usesDeprecatedPattern(Route, 'getCurrentUser') OR
    
    // Missing role-based authorization
    (requiresRoleCheck(Route) AND NOT hasRoleCheck(Route)) OR
    
    // Missing ownership validation for user-specific resources
    (isUserSpecificResource(Route) AND NOT hasOwnershipCheck(Route)) OR
    
    // Inconsistent error responses
    hasInconsistentErrorResponses(Route) OR
    
    // Not using standardized response helpers
    NOT usesStandardizedResponses(Route)
  )
END FUNCTION

FUNCTION requiresRoleCheck(Route)
  // Routes under these namespaces require role checks
  RETURN (
    Route.path STARTS_WITH '/api/admin/' OR
    Route.path STARTS_WITH '/api/consultant/' OR
    Route.path STARTS_WITH '/api/client/' OR
    Route.path IN ['/api/reviews', '/api/faqs', '/api/upload/*', '/api/content/[key]']
  ) AND Route.path NOT IN PUBLIC_ROUTES
END FUNCTION

FUNCTION isUserSpecificResource(Route)
  // Routes that access user-specific data requiring ownership checks
  RETURN (
    Route.path MATCHES '/api/client/orders/[orderId]' OR
    Route.path MATCHES '/api/client/reservations' OR
    Route.path MATCHES '/api/client/invoices/*' OR
    Route.path MATCHES '/api/client/milestones/*' OR
    Route.path MATCHES '/api/reviews/[id]'
  )
END FUNCTION
```

### Examples

**Example 1: Unprotected Admin Route**
- **Route:** `/api/admin/orders` (GET)
- **Input:** Unauthenticated request (no auth_token cookie)
- **Current Behavior:** Returns all orders with 200 OK status
- **Expected Behavior:** Returns 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**Example 2: Weak Consultant Route**
- **Route:** `/api/consultant/missions` (GET)
- **Input:** Request with valid token but CLIENT role
- **Current Behavior:** Returns missions with 200 OK (only checks if consultantId exists, not role)
- **Expected Behavior:** Returns 403 Forbidden with error code 'AUTHORIZATION_ERROR' showing required role is CONSULTANT

**Example 3: Missing Ownership Check**
- **Route:** `/api/client/orders/[orderId]` (GET)
- **Input:** CLIENT user requesting another client's order (orderId belongs to different userId)
- **Current Behavior:** Returns other client's order with 200 OK
- **Expected Behavior:** Returns 403 Forbidden with message 'Access denied - you do not own this resource'

**Example 4: Admin Billing Access**
- **Route:** `/api/admin/billing` (GET, POST, PUT, DELETE)
- **Input:** Unauthenticated request
- **Current Behavior:** Returns/modifies billing data without any authentication
- **Expected Behavior:** Returns 401 Unauthorized for unauthenticated requests, 403 Forbidden for non-ADMIN roles

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Public routes (service catalog, consultants, blogs, FAQs, hero, content, contact form, CSRF token, public reviews) must continue to work without authentication
- Auth routes (login, register, logout, me) must continue to function correctly
- Already-protected routes (`/api/admin/users`, `/api/consultant/profile`, `/api/client/profile`) must maintain their current protection level
- Error handling for database errors, validation errors, and internal errors must remain consistent
- Success response format must remain unchanged for all routes
- Frontend middleware role separation must continue working

**Scope:**
All inputs that do NOT involve the 65 unprotected/weakly protected routes should be completely unaffected by this fix. This includes:
- GET requests to public endpoints (services, blogs, FAQs, etc.)
- POST requests to public endpoints (contact form)
- Auth flow endpoints (login, register, logout, me)
- Already-protected admin, consultant, and client profile routes
- Error responses for non-auth-related failures (validation, database, internal errors)

## Hypothesized Root Cause

Based on the bug description and audit analysis, the most likely issues are:

1. **Inconsistent Development Patterns**: Routes were implemented at different times without a standardized authentication pattern, leading to some routes having no protection at all

2. **Deprecated Auth Pattern Usage**: Many routes use old patterns like `getConsultantId()` and `getCurrentUser()` which only check role without proper JWT token validation, creating weak protection

3. **Missing Ownership Validation**: Client-specific resource routes lack ownership checks, allowing any authenticated client to access other clients' data

4. **Incomplete Migration**: The new `requireAuth()` middleware was created but not systematically applied to all existing routes, leaving many unprotected

5. **Lack of Standardized Responses**: Routes return errors inconsistently (sometimes 401, sometimes 403 for the same scenario) and don't use `successResponse()` and `handleError()` helpers

## Correctness Properties

Property 1: Bug Condition - RBAC Protection Enforcement

_For any_ API route where the bug condition holds (isBugCondition returns true), the fixed route handler SHALL enforce authentication (return 401 for missing/invalid tokens), role-based authorization (return 403 for insufficient permissions with details showing required vs current role), ownership validation for user-specific resources (return 403 for non-owners), and use standardized response helpers (successResponse and handleError).

**Validates: Requirements 2.1.1-2.1.9, 2.2.1-2.2.13, 2.3.1-2.3.8, 2.4.1-2.4.5, 2.5.1-2.5.5, 2.6.1-2.6.4, 2.7.1-2.7.3**

Property 2: Preservation - Existing Functionality

_For any_ API route where the bug condition does NOT hold (isBugCondition returns false), the fixed code SHALL produce exactly the same behavior as the original code, preserving public route accessibility, auth route functionality, already-protected route behavior, error handling consistency, and success response formats.

**Validates: Requirements 3.1.1-3.1.11, 3.2.1-3.2.4, 3.3.1-3.3.4, 3.4.1-3.4.4, 3.5.1-3.5.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**Affected Files**: ~65 route files across:
- `src/app/api/admin/**/*.ts` (30+ routes)
- `src/app/api/consultant/**/*.ts` (20+ routes)
- `src/app/api/client/**/*.ts` (10+ routes)
- `src/app/api/reviews/**/*.ts` (4 routes)
- `src/app/api/upload/**/*.ts` (4 routes)
- `src/app/api/faqs/**/*.ts` (3 routes)
- `src/app/api/content/**/*.ts` (1 route)

**Specific Changes**:

1. **Add Required Imports**: Add to top of each route file:
   ```typescript
   import { NextRequest } from 'next/server';
   import { requireAuth, requireOwnership } from '@/lib/auth/middleware';
   import { handleError, successResponse } from '@/lib/errors/handler';
   import { NotFoundError } from '@/lib/errors/types'; // For routes with ownership checks
   ```

2. **Update Function Signatures**: Change from `Request` to `NextRequest`:
   ```typescript
   // Before
   export async function GET() {
   
   // After
   export async function GET(request: NextRequest) {
   ```

3. **Add Authentication Check**: Add as first line in function body:
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

4. **Remove Deprecated Auth Code**: Remove old patterns:
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

5. **Add Ownership Validation**: For user-specific resources, add after fetching resource:
   ```typescript
   // Fetch resource
   const order = await prisma.order.findUnique({
     where: { id: params.orderId }
   });
   
   if (!order) {
     throw new NotFoundError('Order', params.orderId);
   }
   
   // Check ownership
   const ownershipResult = requireOwnership(authResult.user, order.userId);
   if (!ownershipResult.success) {
     return ownershipResult.response;
   }
   ```

6. **Use Authenticated User Data**: Replace hardcoded IDs with authenticated user:
   ```typescript
   // Use authResult.user.userId for queries
   const missions = await prisma.mission.findMany({
     where: { consultantId: authResult.user.userId },
     orderBy: { createdAt: 'desc' }
   });
   ```

7. **Wrap Logic in Try-Catch**: Ensure all route logic is wrapped:
   ```typescript
   try {
     // Your logic here
     return successResponse(data);
   } catch (error) {
     return handleError(error, request);
   }
   ```

8. **Replace Response Patterns**: Update all return statements:
   ```typescript
   // BEFORE
   return NextResponse.json(data)
   return NextResponse.json({ error: 'Failed' }, { status: 500 })
   
   // AFTER
   return successResponse(data)
   return handleError(error, request)
   ```

### Phased Rollout Strategy

**Phase 1 (CRITICAL - Day 1)**: Admin routes with sensitive data
- `/api/admin/billing` - All methods (GET, POST, PUT, DELETE)
- `/api/admin/orders` - GET, PUT
- `/api/admin/orders/[id]` - DELETE
- `/api/admin/orders/create` - POST
- `/api/admin/stats` - GET
- `/api/admin/services/[id]` - GET, PUT, DELETE
- `/api/admin/hero` - POST, DELETE
- `/api/admin/contacts/[id]` - PUT, DELETE
- **Estimated Time:** 2-3 hours
- **Risk:** HIGH - These routes expose critical business data

**Phase 2 (HIGH - Week 1)**: All consultant routes
- `/api/consultant/orders/[orderId]/status` - PATCH
- `/api/consultant/reservations` - GET, PATCH, DELETE
- `/api/consultant/messages` - GET, POST
- `/api/consultant/missions` - GET, POST, PATCH, DELETE
- `/api/consultant/milestones` - POST, PATCH, DELETE
- `/api/consultant/portfolio` - GET, PATCH
- `/api/consultant/clients` - GET
- `/api/consultant/calls` - GET
- `/api/consultant/reviews` - GET
- `/api/consultant/stats` - GET
- **Estimated Time:** 4-5 hours
- **Risk:** MEDIUM - Affects consultant workflows

**Phase 3 (HIGH - Week 1)**: All client routes with ownership checks
- `/api/client/orders/[orderId]` - GET (add ownership check)
- `/api/client/reservations` - DELETE
- `/api/client/purchase/*` - Various methods
- `/api/client/invoices/*` - Various methods
- `/api/client/milestones/*` - Various methods
- **Estimated Time:** 3-4 hours
- **Risk:** MEDIUM - Affects client data access

**Phase 4 (MEDIUM - Week 2)**: Review, upload, FAQ routes
- `/api/reviews` - POST, PATCH (require CLIENT role)
- `/api/reviews/[id]` - PATCH, DELETE (require CLIENT role + ownership)
- `/api/upload/image` - POST (strengthen protection)
- `/api/upload/document` - POST (add protection)
- `/api/upload/icon` - POST (add protection)
- `/api/upload/logo` - POST (add protection)
- `/api/faqs` - POST (require ADMIN role)
- `/api/faqs/[id]` - PUT, DELETE (require ADMIN role)
- `/api/content/[key]` - PUT (strengthen protection)
- **Estimated Time:** 2-3 hours
- **Risk:** LOW - Less critical functionality

**Phase 5 (LOW - Week 2-3)**: Refactor routes with weak protection
- All routes using `getCurrentUser()` + manual role check
- All routes using `getConsultantId()` / `getClientId()`
- Standardize error responses across all routes
- **Estimated Time:** 3-4 hours
- **Risk:** LOW - Improving existing protection

**Total Estimated Time:** 14-19 hours spread over 2-3 weeks

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that attempt to access protected routes without authentication, with wrong roles, and with correct roles. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Unprotected Admin Route Test**: Send GET request to `/api/admin/orders` without auth token (will succeed on unfixed code, should fail)
2. **Weak Consultant Route Test**: Send GET request to `/api/consultant/missions` with CLIENT role token (will succeed on unfixed code, should fail)
3. **Missing Ownership Test**: Send GET request to `/api/client/orders/[orderId]` with CLIENT token for another client's order (will succeed on unfixed code, should fail)
4. **Admin Billing Test**: Send GET request to `/api/admin/billing` without auth token (will succeed on unfixed code, should fail)

**Expected Counterexamples**:
- Routes return 200 OK with sensitive data when they should return 401 Unauthorized
- Routes return 200 OK for wrong roles when they should return 403 Forbidden
- Routes return other clients' data when they should return 403 Forbidden
- Possible causes: no authentication check, deprecated auth patterns, missing role checks, missing ownership validation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL Route WHERE isBugCondition(Route) DO
  // Test authentication
  result_no_auth := Route_fixed(request_without_token)
  ASSERT result_no_auth.status = 401 AND
         result_no_auth.code = 'AUTHENTICATION_ERROR'
  
  // Test authorization
  result_wrong_role := Route_fixed(request_with_wrong_role)
  ASSERT result_wrong_role.status = 403 AND
         result_wrong_role.code = 'AUTHORIZATION_ERROR' AND
         result_wrong_role.details.required IS_SET AND
         result_wrong_role.details.current IS_SET
  
  // Test ownership (for user-specific resources)
  IF isUserSpecificResource(Route) THEN
    result_wrong_owner := Route_fixed(request_for_other_users_resource)
    ASSERT result_wrong_owner.status = 403 AND
           result_wrong_owner.message CONTAINS 'do not own this resource'
  END IF
  
  // Test success case
  result_success := Route_fixed(request_with_correct_auth)
  ASSERT result_success.status IN [200, 201, 204] AND
         usesSuccessResponse(result_success)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL Route WHERE NOT isBugCondition(Route) DO
  FOR ALL request IN testRequests DO
    ASSERT Route_original(request) = Route_fixed(request)
  END FOR
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for public routes, auth routes, and already-protected routes, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Public Routes Preservation**: Verify GET requests to `/api/services`, `/api/blogs`, `/api/faqs`, `/api/hero`, `/api/content/[key]` continue to work without authentication
2. **Auth Routes Preservation**: Verify POST to `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, and GET to `/api/auth/me` continue working correctly
3. **Protected Routes Preservation**: Verify `/api/admin/users`, `/api/consultant/profile`, `/api/client/profile` maintain same protection level
4. **Error Handling Preservation**: Verify database errors, validation errors, and internal errors continue returning consistent responses

### Unit Tests

- Test each route returns 401 without auth token
- Test each route returns 403 with wrong role (with details showing required vs current role)
- Test each route returns 200 with correct role
- Test ownership validation for user-specific resources (403 for non-owners, 200 for owners/admins)
- Test edge cases (invalid orderId, non-existent resources)
- Test that deprecated auth patterns are removed
- Test that standardized response helpers are used

### Property-Based Tests

- Generate random unauthenticated requests to protected routes and verify all return 401
- Generate random requests with wrong roles to protected routes and verify all return 403
- Generate random requests with correct roles to protected routes and verify all return 200
- Generate random client requests to other clients' resources and verify all return 403
- Generate random requests to public routes and verify all return 200 without authentication
- Test that all error responses follow consistent format (error, code, details, requestId)
- Test that all success responses follow consistent format (data, message)

### Integration Tests

- Test full admin workflow: login as ADMIN → access admin routes → verify data access
- Test full consultant workflow: login as CONSULTANT → access consultant routes → verify only own data returned
- Test full client workflow: login as CLIENT → access client routes → verify only own data returned
- Test cross-role access: login as CLIENT → attempt admin routes → verify 403 Forbidden
- Test ownership validation: login as CLIENT → attempt another client's order → verify 403 Forbidden
- Test public access: access public routes without login → verify 200 OK
- Test auth flow: register → login → access protected routes → logout → verify 401

### Manual Testing Checklist

After each phase, manually test:
- [ ] Can access route with correct role (200 OK)
- [ ] Cannot access route without auth token (401 Unauthorized)
- [ ] Cannot access route with wrong role (403 Forbidden)
- [ ] Cannot access other users' resources (403 Forbidden for ownership routes)
- [ ] Public routes still work without authentication
- [ ] Error responses include correct error codes and details
- [ ] Success responses use successResponse() format
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] Frontend continues to work correctly

### Rollback Procedures

**If issues arise during any phase:**

1. **Immediate Rollback**: Use git to revert the specific route file(s):
   ```bash
   git checkout HEAD -- src/app/api/admin/orders/route.ts
   ```

2. **Phase Rollback**: If multiple routes in a phase have issues, revert entire phase:
   ```bash
   git revert <phase-commit-hash>
   ```

3. **Monitoring**: After each phase deployment, monitor for:
   - Increased 401/403 errors (expected for unauthorized access attempts)
   - Unexpected 401/403 errors (indicates legitimate users being blocked)
   - Decreased successful requests (indicates broken functionality)
   - Error logs showing authentication failures

4. **Gradual Rollout**: Deploy each phase to staging first, run full test suite, then deploy to production

5. **Feature Flag Option**: Consider adding feature flag to enable/disable new auth checks per route for gradual rollout

### Risk Mitigation

**Risk 1: Breaking existing functionality for authorized users**
- **Mitigation**: Comprehensive unit and integration tests before deployment
- **Detection**: Monitor error rates and user reports after deployment
- **Response**: Immediate rollback of affected routes

**Risk 2: Inconsistent auth behavior across routes**
- **Mitigation**: Use standardized patterns from fix-routes-guide.md
- **Detection**: Code review and automated tests
- **Response**: Refactor to match standard pattern

**Risk 3: Missing edge cases in ownership validation**
- **Mitigation**: Property-based tests generating random ownership scenarios
- **Detection**: Integration tests with multiple user accounts
- **Response**: Add additional ownership checks

**Risk 4: Performance impact from additional auth checks**
- **Mitigation**: Auth checks are lightweight (JWT verification only)
- **Detection**: Monitor response times before and after deployment
- **Response**: Optimize auth middleware if needed

**Risk 5: TypeScript compilation errors**
- **Mitigation**: Fix TypeScript errors immediately after each route change
- **Detection**: Run `npm run build` after each change
- **Response**: Fix type errors before committing

