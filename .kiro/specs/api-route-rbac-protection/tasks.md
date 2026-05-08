# Implementation Tasks: API Route RBAC Protection Bugfix

## Overview

This document outlines the implementation tasks for fixing the critical RBAC vulnerability affecting ~65 API routes. The approach follows a **phased rollout strategy** prioritizing critical admin routes first, then consultant routes, client routes, and finally other routes.

**Total Estimated Time:** 14-19 hours spread over 2-3 weeks

**Severity:** CRITICAL - Active production security vulnerability

**Approach:** Systematic application of `requireAuth()` and `requireOwnership()` middleware to unprotected routes

---

## Phase 0: Preparation & Audit (BEFORE Implementation)

### Task 0.1: Complete Route Audit & Categorization
**Priority:** CRITICAL  
**Time:** 1-2 hours  
**Requirements:** All requirements (foundation for implementation)

- [ ] 0.1.1 Read all route files in `src/app/api/` to understand current implementation
  - Identify which routes have NO auth checks
  - Identify which routes use deprecated patterns (`getCurrentUser()`, `getConsultantId()`, `getClientId()`)
  - Identify which routes already use `requireAuth()`
  - Document current auth patterns per route

- [ ] 0.1.2 Categorize all routes by required protection level
  - **PUBLIC**: Routes that should remain accessible without authentication
  - **AUTHENTICATED**: Routes requiring any logged-in user
  - **ADMIN**: Routes requiring ADMIN role only
  - **CONSULTANT**: Routes requiring CONSULTANT role only
  - **CLIENT**: Routes requiring CLIENT role only
  - **OWNERSHIP**: Routes requiring ownership validation (CLIENT accessing own resources)

- [ ] 0.1.3 Create detailed route inventory spreadsheet/document
  - Route path
  - HTTP methods
  - Current protection status (NONE, WEAK, PROTECTED)
  - Required protection level
  - Ownership validation needed (YES/NO)
  - Priority (CRITICAL, HIGH, MEDIUM, LOW)
  - Estimated time to fix

- [ ] 0.1.4 Review audit with stakeholders
  - Confirm which routes should be PUBLIC vs PROTECTED
  - Confirm role requirements for each protected route
  - Confirm ownership validation requirements
  - Get approval before proceeding to implementation

---

## Phase 1: CRITICAL - Admin Routes with Sensitive Data

**Priority:** CRITICAL  
**Time:** 2-3 hours  
**Risk:** HIGH - These routes expose critical business data  
**Requirements:** 2.1.1-2.1.9

### Task 1.1: Protect Admin Billing Routes
**File:** `src/app/api/admin/billing/route.ts`  
**Methods:** GET, POST, PUT, DELETE  
**Requirements:** 2.1.2

- [ ] 1.1.1 Add required imports
  ```typescript
  import { NextRequest } from 'next/server';
  import { requireAuth } from '@/lib/auth/middleware';
  import { handleError, successResponse } from '@/lib/errors/handler';
  ```

- [ ] 1.1.2 Update function signatures to accept `NextRequest`

- [ ] 1.1.3 Add auth check as first line in each method
  ```typescript
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  ```

- [ ] 1.1.4 Wrap logic in try-catch with `handleError()`

- [ ] 1.1.5 Replace response patterns with `successResponse()`

- [ ] 1.1.6 Test route returns 401 without auth, 403 with wrong role, 200 with ADMIN role

### Task 1.2: Protect Admin Orders Routes
**Files:** `src/app/api/admin/orders/route.ts`, `src/app/api/admin/orders/[id]/route.ts`, `src/app/api/admin/orders/create/route.ts`  
**Methods:** GET, PUT, DELETE, POST  
**Requirements:** 2.1.1, 2.1.7

- [ ] 1.2.1 Protect `/api/admin/orders` (GET, PUT)
  - Add imports
  - Add `requireAuth(request, ['ADMIN'])`
  - Update responses

- [ ] 1.2.2 Protect `/api/admin/orders/[id]` (DELETE)
  - Add imports
  - Add `requireAuth(request, ['ADMIN'])`
  - Update responses

- [ ] 1.2.3 Protect `/api/admin/orders/create` (POST)
  - Add imports
  - Add `requireAuth(request, ['ADMIN'])`
  - Update responses

- [ ] 1.2.4 Test all order routes with different auth scenarios

### Task 1.3: Protect Admin Stats Route
**File:** `src/app/api/admin/stats/route.ts`  
**Methods:** GET  
**Requirements:** 2.1.3

- [ ] 1.3.1 Add required imports

- [ ] 1.3.2 Add `requireAuth(request, ['ADMIN'])`

- [ ] 1.3.3 Update responses

- [ ] 1.3.4 Test route protection

### Task 1.4: Protect Admin Services Routes
**Files:** `src/app/api/admin/services/[id]/route.ts`  
**Methods:** GET, PUT, DELETE  
**Requirements:** 2.1.4

- [ ] 1.4.1 Add required imports

- [ ] 1.4.2 Add `requireAuth(request, ['ADMIN'])` to all methods

- [ ] 1.4.3 Update responses

- [ ] 1.4.4 Test route protection

### Task 1.5: Protect Admin Hero Routes
**File:** `src/app/api/admin/hero/route.ts`  
**Methods:** POST, DELETE  
**Requirements:** 2.1.5

- [ ] 1.5.1 Add required imports

- [ ] 1.5.2 Add `requireAuth(request, ['ADMIN'])` to POST and DELETE

- [ ] 1.5.3 Update responses

- [ ] 1.5.4 Test route protection

### Task 1.6: Protect Admin Contacts Routes
**File:** `src/app/api/admin/contacts/[id]/route.ts`  
**Methods:** PUT, DELETE  
**Requirements:** 2.1.6

- [ ] 1.6.1 Add required imports

- [ ] 1.6.2 Add `requireAuth(request, ['ADMIN'])` to PUT and DELETE

- [ ] 1.6.3 Update responses

- [ ] 1.6.4 Test route protection

### Task 1.7: Phase 1 Testing & Verification
**Time:** 30 minutes

- [ ] 1.7.1 Run TypeScript compilation (`npm run build`)

- [ ] 1.7.2 Test each protected route:
  - Without auth token → 401 Unauthorized
  - With CLIENT token → 403 Forbidden
  - With CONSULTANT token → 403 Forbidden
  - With ADMIN token → 200 OK

- [ ] 1.7.3 Verify public routes still work without auth

- [ ] 1.7.4 Verify already-protected routes still work

- [ ] 1.7.5 Check for any console errors or warnings

### Task 1.8: Phase 1 Checkpoint
**Time:** 15 minutes

- [ ] 1.8.1 Review all Phase 1 changes

- [ ] 1.8.2 Commit Phase 1 changes with descriptive message

- [ ] 1.8.3 Ask user if ready to proceed to Phase 2

---

## Phase 2: HIGH - Consultant Routes

**Priority:** HIGH  
**Time:** 4-5 hours  
**Risk:** MEDIUM - Affects consultant workflows  
**Requirements:** 2.2.1-2.2.13

### Task 2.1: Protect Consultant Orders Status Route
**File:** `src/app/api/consultant/orders/[orderId]/status/route.ts`  
**Methods:** PATCH  
**Requirements:** 2.2.3

- [ ] 2.1.1 Add required imports

- [ ] 2.1.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.1.3 Use `authResult.user.userId` for consultant ID

- [ ] 2.1.4 Update responses

- [ ] 2.1.5 Test route protection

### Task 2.2: Protect Consultant Reservations Route
**File:** `src/app/api/consultant/reservations/route.ts`  
**Methods:** GET, PATCH, DELETE  
**Requirements:** 2.2.4

- [ ] 2.2.1 Add required imports

- [ ] 2.2.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.2.3 Use `authResult.user.userId` to filter reservations

- [ ] 2.2.4 Update responses

- [ ] 2.2.5 Test route protection

### Task 2.3: Protect Consultant Messages Route
**File:** `src/app/api/consultant/messages/route.ts`  
**Methods:** GET, POST  
**Requirements:** 2.2.5

- [ ] 2.3.1 Add required imports

- [ ] 2.3.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.3.3 Use `authResult.user.userId` to filter messages

- [ ] 2.3.4 Update responses

- [ ] 2.3.5 Test route protection

### Task 2.4: Protect Consultant Missions Route
**File:** `src/app/api/consultant/missions/route.ts`  
**Methods:** GET, POST, PATCH, DELETE  
**Requirements:** 2.2.6

- [ ] 2.4.1 Add required imports

- [ ] 2.4.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.4.3 Use `authResult.user.userId` for all mission operations

- [ ] 2.4.4 Update responses

- [ ] 2.4.5 Test route protection

### Task 2.5: Protect Consultant Milestones Route
**File:** `src/app/api/consultant/milestones/route.ts`  
**Methods:** POST, PATCH, DELETE  
**Requirements:** 2.2.7

- [ ] 2.5.1 Add required imports

- [ ] 2.5.2 Add `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.5.3 Use `authResult.user.userId` for milestone operations

- [ ] 2.5.4 Update responses

- [ ] 2.5.5 Test route protection

### Task 2.6: Protect Consultant Portfolio Route
**File:** `src/app/api/consultant/portfolio/route.ts`  
**Methods:** GET, PATCH  
**Requirements:** 2.2.8

- [ ] 2.6.1 Add required imports

- [ ] 2.6.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.6.3 Use `authResult.user.userId` for portfolio operations

- [ ] 2.6.4 Update responses

- [ ] 2.6.5 Test route protection

### Task 2.7: Protect Consultant Clients Route
**File:** `src/app/api/consultant/clients/route.ts`  
**Methods:** GET  
**Requirements:** 2.2.9

- [ ] 2.7.1 Add required imports

- [ ] 2.7.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.7.3 Use `authResult.user.userId` to filter clients

- [ ] 2.7.4 Update responses

- [ ] 2.7.5 Test route protection

### Task 2.8: Protect Consultant Calls Route
**File:** `src/app/api/consultant/calls/route.ts`  
**Methods:** GET  
**Requirements:** 2.2.10

- [ ] 2.8.1 Add required imports

- [ ] 2.8.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.8.3 Use `authResult.user.userId` to filter calls

- [ ] 2.8.4 Update responses

- [ ] 2.8.5 Test route protection

### Task 2.9: Protect Consultant Reviews Route
**File:** `src/app/api/consultant/reviews/route.ts`  
**Methods:** GET  
**Requirements:** 2.2.11

- [ ] 2.9.1 Add required imports

- [ ] 2.9.2 Add `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.9.3 Use `authResult.user.userId` to filter reviews

- [ ] 2.9.4 Update responses

- [ ] 2.9.5 Test route protection

### Task 2.10: Protect Consultant Stats Route
**File:** `src/app/api/consultant/stats/route.ts`  
**Methods:** GET  
**Requirements:** 2.2.12

- [ ] 2.10.1 Add required imports

- [ ] 2.10.2 Replace deprecated pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 2.10.3 Use `authResult.user.userId` for stats

- [ ] 2.10.4 Update responses

- [ ] 2.10.5 Test route protection

### Task 2.11: Phase 2 Testing & Verification
**Time:** 45 minutes

- [ ] 2.11.1 Run TypeScript compilation

- [ ] 2.11.2 Test each consultant route:
  - Without auth token → 401 Unauthorized
  - With CLIENT token → 403 Forbidden
  - With ADMIN token → 403 Forbidden (unless admin bypass intended)
  - With CONSULTANT token → 200 OK with only their own data

- [ ] 2.11.3 Verify data filtering works (consultants only see their own data)

- [ ] 2.11.4 Verify no regressions in Phase 1 routes

### Task 2.12: Phase 2 Checkpoint
**Time:** 15 minutes

- [ ] 2.12.1 Review all Phase 2 changes

- [ ] 2.12.2 Commit Phase 2 changes

- [ ] 2.12.3 Ask user if ready to proceed to Phase 3

---

## Phase 3: HIGH - Client Routes with Ownership Checks

**Priority:** HIGH  
**Time:** 3-4 hours  
**Risk:** MEDIUM - Affects client data access  
**Requirements:** 2.3.1-2.3.8

### Task 3.1: Protect Client Orders Route with Ownership
**File:** `src/app/api/client/orders/[orderId]/route.ts`  
**Methods:** GET  
**Requirements:** 2.3.1, 2.3.6, 2.3.7, 2.3.8

- [ ] 3.1.1 Add required imports (include `NotFoundError`)

- [ ] 3.1.2 Add `requireAuth(request, ['CLIENT'])`

- [ ] 3.1.3 Fetch order from database

- [ ] 3.1.4 Add ownership check:
  ```typescript
  const ownershipResult = requireOwnership(authResult.user, order.userId);
  if (!ownershipResult.success) return ownershipResult.response;
  ```

- [ ] 3.1.5 Update responses

- [ ] 3.1.6 Test ownership validation:
  - CLIENT accessing own order → 200 OK
  - CLIENT accessing another's order → 403 Forbidden
  - ADMIN accessing any order → 200 OK (admin bypass)

### Task 3.2: Protect Client Reservations Route
**File:** `src/app/api/client/reservations/route.ts`  
**Methods:** DELETE  
**Requirements:** 2.3.2

- [ ] 3.2.1 Add required imports

- [ ] 3.2.2 Add `requireAuth(request, ['CLIENT'])`

- [ ] 3.2.3 Use `authResult.user.userId` to filter reservations

- [ ] 3.2.4 Update responses

- [ ] 3.2.5 Test route protection

### Task 3.3: Protect Client Purchase Routes
**Files:** `src/app/api/client/purchase/route.ts` and related  
**Methods:** Various  
**Requirements:** 2.3.3

- [ ] 3.3.1 Identify all purchase-related route files

- [ ] 3.3.2 Add required imports to each

- [ ] 3.3.3 Add `requireAuth(request, ['CLIENT'])` to each

- [ ] 3.3.4 Use `authResult.user.userId` for purchase operations

- [ ] 3.3.5 Update responses

- [ ] 3.3.6 Test route protection

### Task 3.4: Protect Client Invoices Routes
**Files:** `src/app/api/client/invoices/route.ts`, `src/app/api/client/invoices/[id]/route.ts`  
**Methods:** Various  
**Requirements:** 2.3.4

- [ ] 3.4.1 Add required imports

- [ ] 3.4.2 Add `requireAuth(request, ['CLIENT'])`

- [ ] 3.4.3 Use `authResult.user.userId` to filter invoices

- [ ] 3.4.4 Add ownership check for specific invoice access

- [ ] 3.4.5 Update responses

- [ ] 3.4.6 Test route protection and ownership

### Task 3.5: Protect Client Milestones Routes
**File:** `src/app/api/client/milestones/route.ts`  
**Methods:** Various  
**Requirements:** 2.3.5

- [ ] 3.5.1 Add required imports

- [ ] 3.5.2 Add `requireAuth(request, ['CLIENT'])`

- [ ] 3.5.3 Use `authResult.user.userId` for milestone operations

- [ ] 3.5.4 Update responses

- [ ] 3.5.5 Test route protection

### Task 3.6: Phase 3 Testing & Verification
**Time:** 45 minutes

- [ ] 3.6.1 Run TypeScript compilation

- [ ] 3.6.2 Test each client route:
  - Without auth token → 401 Unauthorized
  - With CONSULTANT token → 403 Forbidden
  - With CLIENT token (own resources) → 200 OK
  - With CLIENT token (other's resources) → 403 Forbidden
  - With ADMIN token → 200 OK (admin bypass)

- [ ] 3.6.3 Verify ownership validation works correctly

- [ ] 3.6.4 Verify no regressions in Phase 1 & 2 routes

### Task 3.7: Phase 3 Checkpoint
**Time:** 15 minutes

- [ ] 3.7.1 Review all Phase 3 changes

- [ ] 3.7.2 Commit Phase 3 changes

- [ ] 3.7.3 Ask user if ready to proceed to Phase 4

---

## Phase 4: MEDIUM - Review, Upload, FAQ Routes

**Priority:** MEDIUM  
**Time:** 2-3 hours  
**Risk:** LOW - Less critical functionality  
**Requirements:** 2.4.1-2.4.5, 2.5.1-2.5.5, 2.6.1-2.6.4, 2.7.1-2.7.3

### Task 4.1: Protect Review Routes
**Files:** `src/app/api/reviews/route.ts`, `src/app/api/reviews/[id]/route.ts`  
**Methods:** POST, PATCH, DELETE  
**Requirements:** 2.4.1-2.4.5

- [ ] 4.1.1 Protect POST `/api/reviews` (require CLIENT role)

- [ ] 4.1.2 Protect PATCH `/api/reviews` (require CLIENT role)

- [ ] 4.1.3 Protect PATCH/DELETE `/api/reviews/[id]` (require CLIENT role + ownership)

- [ ] 4.1.4 Test route protection and ownership

### Task 4.2: Protect Upload Routes
**Files:** `src/app/api/upload/image/route.ts`, `src/app/api/upload/document/route.ts`, `src/app/api/upload/icon/route.ts`, `src/app/api/upload/logo/route.ts`  
**Methods:** POST  
**Requirements:** 2.5.1-2.5.5

- [ ] 4.2.1 Determine appropriate role for each upload type:
  - Image: AUTHENTICATED (any logged-in user)
  - Document: AUTHENTICATED
  - Icon: ADMIN
  - Logo: ADMIN

- [ ] 4.2.2 Add protection to each upload route

- [ ] 4.2.3 Test route protection

### Task 4.3: Protect FAQ Admin Routes
**Files:** `src/app/api/faqs/route.ts`, `src/app/api/faqs/[id]/route.ts`  
**Methods:** POST, PUT, DELETE  
**Requirements:** 2.6.1-2.6.4

- [ ] 4.3.1 Protect POST `/api/faqs` (require ADMIN role)

- [ ] 4.3.2 Protect PUT/DELETE `/api/faqs/[id]` (require ADMIN role)

- [ ] 4.3.3 Verify GET `/api/faqs` remains public

- [ ] 4.3.4 Test route protection

### Task 4.4: Protect Content Admin Routes
**File:** `src/app/api/content/[key]/route.ts`  
**Methods:** PUT  
**Requirements:** 2.7.1-2.7.3

- [ ] 4.4.1 Protect PUT `/api/content/[key]` (require ADMIN role)

- [ ] 4.4.2 Verify GET `/api/content/[key]` remains public

- [ ] 4.4.3 Test route protection

### Task 4.5: Phase 4 Testing & Verification
**Time:** 30 minutes

- [ ] 4.5.1 Run TypeScript compilation

- [ ] 4.5.2 Test all Phase 4 routes with appropriate roles

- [ ] 4.5.3 Verify no regressions in previous phases

### Task 4.6: Phase 4 Checkpoint
**Time:** 15 minutes

- [ ] 4.6.1 Review all Phase 4 changes

- [ ] 4.6.2 Commit Phase 4 changes

- [ ] 4.6.3 Ask user if ready to proceed to Phase 5

---

## Phase 5: LOW - Refactor Weak Protection

**Priority:** LOW  
**Time:** 3-4 hours  
**Risk:** LOW - Improving existing protection  
**Requirements:** Various (standardization)

### Task 5.1: Identify Routes with Weak Protection
**Time:** 1 hour

- [ ] 5.1.1 Search codebase for `getCurrentUser()` usage

- [ ] 5.1.2 Search codebase for `getConsultantId()` usage

- [ ] 5.1.3 Search codebase for `getClientId()` usage

- [ ] 5.1.4 Create list of routes to refactor

### Task 5.2: Refactor Routes to Use requireAuth()
**Time:** 2-3 hours

- [ ] 5.2.1 Replace `getCurrentUser()` pattern with `requireAuth()`

- [ ] 5.2.2 Replace `getConsultantId()` pattern with `requireAuth(request, ['CONSULTANT'])`

- [ ] 5.2.3 Replace `getClientId()` pattern with `requireAuth(request, ['CLIENT'])`

- [ ] 5.2.4 Standardize all error responses

- [ ] 5.2.5 Standardize all success responses

### Task 5.3: Phase 5 Testing & Verification
**Time:** 30 minutes

- [ ] 5.3.1 Run TypeScript compilation

- [ ] 5.3.2 Test refactored routes maintain same behavior

- [ ] 5.3.3 Verify consistent error responses across all routes

### Task 5.4: Phase 5 Checkpoint
**Time:** 15 minutes

- [ ] 5.4.1 Review all Phase 5 changes

- [ ] 5.4.2 Commit Phase 5 changes

- [ ] 5.4.3 Mark bugfix as complete

---

## Final Verification & Documentation

### Task 6.1: Comprehensive Testing
**Time:** 1-2 hours

- [ ] 6.1.1 Run full test suite

- [ ] 6.1.2 Manual testing of critical flows:
  - Admin login → access admin routes
  - Consultant login → access consultant routes (only own data)
  - Client login → access client routes (only own data)
  - Cross-role access attempts (should fail)

- [ ] 6.1.3 Test public routes remain accessible

- [ ] 6.1.4 Test auth flow (login, logout, register)

### Task 6.2: Update Documentation
**Time:** 30 minutes

- [ ] 6.2.1 Update API_ROUTES_AUDIT.md with final status

- [ ] 6.2.2 Mark all protected routes as ✅ PROTECTED

- [ ] 6.2.3 Document any remaining issues or edge cases

### Task 6.3: Final Review
**Time:** 30 minutes

- [ ] 6.3.1 Review all changes across all phases

- [ ] 6.3.2 Verify no TypeScript errors

- [ ] 6.3.3 Verify no console errors

- [ ] 6.3.4 Create summary of changes for stakeholders

---

## Notes

- **Time per route:** 2-5 minutes for simple routes, 10-15 minutes for routes with ownership checks
- **Total routes to protect:** ~65 routes
- **Phased approach:** Allows for incremental deployment and testing
- **Rollback strategy:** Each phase can be reverted independently if issues arise
- **Testing is critical:** Test after each route, after each phase, and comprehensively at the end

## Success Criteria

- [ ] All admin routes require ADMIN role
- [ ] All consultant routes require CONSULTANT role and filter data by consultant ID
- [ ] All client routes require CLIENT role and validate ownership where applicable
- [ ] All routes use `requireAuth()` pattern (no deprecated patterns)
- [ ] All routes use `successResponse()` and `handleError()`
- [ ] Consistent error responses (401 for no auth, 403 for wrong role/ownership)
- [ ] Public routes remain accessible
- [ ] Auth routes remain functional
- [ ] No TypeScript compilation errors
- [ ] All tests pass
