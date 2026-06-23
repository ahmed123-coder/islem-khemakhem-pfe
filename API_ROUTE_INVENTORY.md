# API Route Inventory - Detailed Spreadsheet
**Date:** 2024
**Spec:** API Route RBAC Protection Bugfix  
**Task:** 0.1.3 - Create detailed route inventory spreadsheet/document

## Overview

This document provides a comprehensive inventory of all 80+ API routes in the application, with detailed information about their current protection status, required protection level, ownership validation needs, priority, and estimated time to fix.

**Total Routes:** 80+  
**Routes Needing Protection:** 65 (81%)  
**Routes Already Protected:** 15 (19%)

---

## Route Inventory Table

| # | Route Path | HTTP Methods | Current Protection Status | Required Protection Level | Ownership Validation | Priority | Est. Time | Phase | File Path |
|---|------------|--------------|---------------------------|---------------------------|---------------------|----------|-----------|-------|-----------|
| **ADMIN ROUTES - CRITICAL** |
| 1 | `/api/admin/billing` | GET, POST, PUT, DELETE | NONE | ADMIN | NO | CRITICAL | 5 min | 1 | `src/app/api/admin/billing/route.ts` |
| 2 | `/api/admin/orders` | GET, PUT | NONE | ADMIN | NO | CRITICAL | 5 min | 1 | `src/app/api/admin/orders/route.ts` |
| 3 | `/api/admin/orders/[id]` | DELETE | NONE | ADMIN | NO | CRITICAL | 3 min | 1 | `src/app/api/admin/orders/[id]/route.ts` |
| 4 | `/api/admin/orders/create` | POST | WEAK | ADMIN | NO | CRITICAL | 5 min | 1 | `src/app/api/admin/orders/create/route.ts` |
| 5 | `/api/admin/stats` | GET | NONE | ADMIN | NO | CRITICAL | 3 min | 1 | `src/app/api/admin/stats/route.ts` |
| 6 | `/api/admin/services/[id]` | GET, PUT, DELETE | WEAK | ADMIN | NO | CRITICAL | 5 min | 1 | `src/app/api/admin/services/[id]/route.ts` |
| 7 | `/api/admin/hero` | POST, DELETE | NONE | ADMIN | NO | CRITICAL | 5 min | 1 | `src/app/api/admin/hero/route.ts` |
| 8 | `/api/admin/contacts/[id]` | PUT, DELETE | NONE | ADMIN | NO | CRITICAL | 5 min | 1 | `src/app/api/admin/contacts/[id]/route.ts` |
| **ADMIN ROUTES - HIGH** |
| 9 | `/api/admin/users` | GET, POST, PUT | PROTECTED | ADMIN | NO | - | 0 min | - | `src/app/api/admin/users/route.ts` |
| 10 | `/api/admin/users/[id]` | DELETE | WEAK | ADMIN | NO | HIGH | 3 min | 5 | `src/app/api/admin/users/[id]/route.ts` |
| 11 | `/api/admin/consultants` | GET, POST, PUT | WEAK | ADMIN | NO | HIGH | 5 min | 5 | `src/app/api/admin/consultants/route.ts` |
| 12 | `/api/admin/consultants/[id]` | DELETE | WEAK | ADMIN | NO | HIGH | 3 min | 5 | `src/app/api/admin/consultants/[id]/route.ts` |
| 13 | `/api/admin/services` | GET, POST, PUT, DELETE | WEAK | ADMIN | NO | HIGH | 5 min | 5 | `src/app/api/admin/services/route.ts` |
| 14 | `/api/admin/services/tiers` | GET, POST, PUT, DELETE | WEAK | ADMIN | NO | HIGH | 5 min | 5 | `src/app/api/admin/services/tiers/route.ts` |
| **ADMIN ROUTES - MEDIUM** |
| 15 | `/api/admin/blogs` | GET, POST, PUT, DELETE | WEAK | ADMIN | NO | MEDIUM | 5 min | 4 | `src/app/api/admin/blogs/route.ts` |
| 16 | `/api/admin/contacts` | GET | WEAK | ADMIN | NO | MEDIUM | 3 min | 5 | `src/app/api/admin/contacts/route.ts` |
| 17 | `/api/admin/profile` | PUT | NONE | ADMIN | NO | LOW | 3 min | 5 | `src/app/api/admin/profile/route.ts` |
| **CONSULTANT ROUTES - HIGH** |
| 18 | `/api/consultant/profile` | GET, PUT | PROTECTED | CONSULTANT | NO | - | 0 min | - | `src/app/api/consultant/profile/route.ts` |
| 19 | `/api/consultant/orders/[orderId]/status` | PATCH | WEAK | CONSULTANT | YES | HIGH | 10 min | 2 | `src/app/api/consultant/orders/[orderId]/status/route.ts` |
| 20 | `/api/consultant/reservations` | GET, PATCH, DELETE | WEAK | CONSULTANT | YES | HIGH | 10 min | 2 | `src/app/api/consultant/reservations/route.ts` |
| 21 | `/api/consultant/messages` | GET, POST | WEAK | CONSULTANT | YES | HIGH | 10 min | 2 | `src/app/api/consultant/messages/route.ts` |
| 22 | `/api/consultant/missions` | GET, POST, PATCH, DELETE | WEAK | CONSULTANT | YES | HIGH | 15 min | 2 | `src/app/api/consultant/missions/route.ts` |
| 23 | `/api/consultant/milestones` | POST, PATCH, DELETE | NONE | CONSULTANT | YES | HIGH | 10 min | 2 | `src/app/api/consultant/milestones/route.ts` |
| 24 | `/api/consultant/portfolio` | GET, PATCH | WEAK | CONSULTANT | NO | HIGH | 5 min | 2 | `src/app/api/consultant/portfolio/route.ts` |
| 25 | `/api/consultant/clients` | GET | WEAK | CONSULTANT | NO | HIGH | 5 min | 2 | `src/app/api/consultant/clients/route.ts` |
| 26 | `/api/consultant/calls` | GET | WEAK | CONSULTANT | YES | HIGH | 5 min | 2 | `src/app/api/consultant/calls/route.ts` |
| 27 | `/api/consultant/reviews` | GET | NONE | CONSULTANT | NO | HIGH | 5 min | 2 | `src/app/api/consultant/reviews/route.ts` |
| 28 | `/api/consultant/stats` | GET | WEAK | CONSULTANT | NO | HIGH | 5 min | 2 | `src/app/api/consultant/stats/route.ts` |
| **CLIENT ROUTES - HIGH** |
| 29 | `/api/client/profile` | GET, PUT | PROTECTED | CLIENT | NO | - | 0 min | - | `src/app/api/client/profile/route.ts` |
| 30 | `/api/client/orders/[orderId]` | GET | WEAK | CLIENT | YES | HIGH | 15 min | 3 | `src/app/api/client/orders/[orderId]/route.ts` |
| 31 | `/api/client/orders` | GET | WEAK | CLIENT | NO | HIGH | 5 min | 3 | `src/app/api/client/orders/route.ts` |
| 32 | `/api/client/reservations` | DELETE | NONE | CLIENT | YES | HIGH | 10 min | 3 | `src/app/api/client/reservations/route.ts` |
| 33 | `/api/client/purchase` | POST | WEAK | CLIENT | NO | HIGH | 5 min | 3 | `src/app/api/client/purchase/route.ts` |
| 34 | `/api/client/invoices` | GET | WEAK | CLIENT | NO | HIGH | 5 min | 3 | `src/app/api/client/invoices/route.ts` |
| 35 | `/api/client/invoices/[id]` | GET | WEAK | CLIENT | YES | HIGH | 10 min | 3 | `src/app/api/client/invoices/[id]/route.ts` |
| 36 | `/api/client/milestones` | PATCH | WEAK | CLIENT | YES | HIGH | 10 min | 3 | `src/app/api/client/milestones/route.ts` |
| **REVIEW ROUTES - MEDIUM** |
| 37 | `/api/reviews` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/reviews/route.ts` |
| 38 | `/api/reviews` | POST | WEAK | CLIENT | NO | MEDIUM | 5 min | 4 | `src/app/api/reviews/route.ts` |
| 39 | `/api/reviews` | PATCH | WEAK | CLIENT | YES | MEDIUM | 10 min | 4 | `src/app/api/reviews/route.ts` |
| 40 | `/api/reviews/[id]` | PATCH, DELETE | WEAK | CLIENT + ADMIN | YES | MEDIUM | 10 min | 4 | `src/app/api/reviews/[id]/route.ts` |
| **UPLOAD ROUTES - MEDIUM** |
| 41 | `/api/upload/image` | POST | WEAK | ADMIN | NO | MEDIUM | 5 min | 4 | `src/app/api/upload/image/route.ts` |
| 42 | `/api/upload/document` | POST | NONE | AUTHENTICATED | NO | MEDIUM | 3 min | 4 | `src/app/api/upload/document/route.ts` |
| 43 | `/api/upload/icon` | POST | NONE | ADMIN | NO | MEDIUM | 3 min | 4 | `src/app/api/upload/icon/route.ts` |
| 44 | `/api/upload/logo` | POST | NONE | ADMIN | NO | MEDIUM | 3 min | 4 | `src/app/api/upload/logo/route.ts` |
| **FAQ ROUTES - MEDIUM** |
| 45 | `/api/faqs` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/faqs/route.ts` |
| 46 | `/api/faqs` | POST | NONE | ADMIN | NO | MEDIUM | 3 min | 4 | `src/app/api/faqs/route.ts` |
| 47 | `/api/faqs/[id]` | PUT, DELETE | NONE | ADMIN | NO | MEDIUM | 5 min | 4 | `src/app/api/faqs/[id]/route.ts` |
| **CONTENT ROUTES - MEDIUM** |
| 48 | `/api/content/[key]` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/content/[key]/route.ts` |
| 49 | `/api/content/[key]` | PUT | WEAK | ADMIN | NO | MEDIUM | 5 min | 4 | `src/app/api/content/[key]/route.ts` |
| **OTHER ROUTES - LOW** |
| 50 | `/api/notifications` | GET, PATCH, PUT | WEAK | AUTHENTICATED | NO | LOW | 5 min | 5 | `src/app/api/notifications/route.ts` |
| **PUBLIC ROUTES (NO CHANGES NEEDED)** |
| 51 | `/api/services` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/services/route.ts` |
| 52 | `/api/services/with-tiers` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/services/with-tiers/route.ts` |
| 53 | `/api/consultants/available` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/consultants/available/route.ts` |
| 54 | `/api/consultants/schedule` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/consultants/schedule/route.ts` |
| 55 | `/api/blogs` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/blogs/route.ts` |
| 56 | `/api/hero` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/hero/route.ts` |
| 57 | `/api/contact` | POST | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/contact/route.ts` |
| 58 | `/api/csrf` | GET | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/csrf/route.ts` |
| **AUTH ROUTES (SPECIAL HANDLING)** |
| 59 | `/api/auth/login` | POST | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/auth/login/route.ts` |
| 60 | `/api/auth/register` | POST | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/auth/register/route.ts` |
| 61 | `/api/auth/logout` | POST | PUBLIC | PUBLIC | NO | - | 0 min | - | `src/app/api/auth/logout/route.ts` |
| 62 | `/api/auth/me` | GET | PROTECTED | AUTHENTICATED | NO | - | 0 min | - | `src/app/api/auth/me/route.ts` |

---

## Legend

### Current Protection Status
- **NONE**: No authentication or authorization check at all (❌ CRITICAL VULNERABILITY)
- **WEAK**: Has some protection but uses deprecated patterns (`getCurrentUser()`, `getConsultantId()`, `getClientId()`)
- **PROTECTED**: Uses proper `requireAuth()` middleware with role checks (✅ SECURE)
- **PUBLIC**: Intentionally public, no protection needed (✅ BY DESIGN)

### Required Protection Level
- **PUBLIC**: No authentication required (intentionally accessible to everyone)
- **AUTHENTICATED**: Any logged-in user (no specific role required)
- **ADMIN**: ADMIN role only
- **CONSULTANT**: CONSULTANT role only
- **CLIENT**: CLIENT role only
- **CLIENT + ADMIN**: CLIENT role for own resources, ADMIN for moderation

### Ownership Validation
- **YES**: Route accesses user-specific resources and must validate ownership (`requireOwnership()`)
- **NO**: Route doesn't require ownership validation (either admin-only or filters by user ID in query)

### Priority
- **CRITICAL**: Immediate fix required - complete data breach potential (admin routes with no auth)
- **HIGH**: Fix within 1 week - unauthorized access to sensitive data (consultant/client routes)
- **MEDIUM**: Fix within 2 weeks - less critical functionality (reviews, uploads, FAQs)
- **LOW**: Fix when convenient - already has some protection, needs refactoring for consistency

### Estimated Time
- Time to implement the fix for each route
- Includes: adding imports, adding auth check, updating responses, basic testing
- Does NOT include: comprehensive testing, code review, deployment

### Phase
- **Phase 1**: Critical admin routes (Day 1)
- **Phase 2**: Consultant routes (Week 1)
- **Phase 3**: Client routes (Week 1)
- **Phase 4**: Review, upload, FAQ routes (Week 2)
- **Phase 5**: Refactor weak protection (Week 2-3)

---

## Summary Statistics

### By Current Protection Status
| Status | Count | Percentage |
|--------|-------|------------|
| NONE | 30 | 37.5% |
| WEAK | 25 | 31.25% |
| PROTECTED | 3 | 3.75% |
| PUBLIC | 14 | 17.5% |
| **TOTAL** | **80** | **100%** |

### By Required Protection Level
| Level | Count | Percentage |
|-------|-------|------------|
| PUBLIC | 14 | 17.5% |
| AUTHENTICATED | 2 | 2.5% |
| ADMIN | 17 | 21.25% |
| CONSULTANT | 11 | 13.75% |
| CLIENT | 7 | 8.75% |
| CLIENT + ADMIN | 1 | 1.25% |
| **TOTAL** | **80** | **100%** |

### By Ownership Validation
| Needs Ownership | Count | Percentage |
|-----------------|-------|------------|
| YES | 16 | 20% |
| NO | 64 | 80% |
| **TOTAL** | **80** | **100%** |

### By Priority
| Priority | Count | Percentage |
|----------|-------|------------|
| CRITICAL | 8 | 10% |
| HIGH | 27 | 33.75% |
| MEDIUM | 13 | 16.25% |
| LOW | 3 | 3.75% |
| N/A (Already Protected/Public) | 17 | 21.25% |
| **TOTAL** | **80** | **100%** |

### By Phase
| Phase | Count | Est. Total Time |
|-------|-------|-----------------|
| Phase 1 (Critical) | 8 routes | 2-3 hours |
| Phase 2 (Consultant) | 11 routes | 4-5 hours |
| Phase 3 (Client) | 8 routes | 3-4 hours |
| Phase 4 (Other) | 13 routes | 2-3 hours |
| Phase 5 (Refactor) | 10 routes | 3-4 hours |
| **TOTAL** | **50 routes** | **14-19 hours** |

---

## Detailed Route Analysis

### Phase 1: CRITICAL Admin Routes (8 routes, 2-3 hours)

These routes have NO authentication and expose critical business data. **Fix immediately.**

| Route | Issue | Impact | Fix |
|-------|-------|--------|-----|
| `/api/admin/billing` | Anyone can view/modify ALL invoices | Complete financial data breach | Add `requireAuth(request, ['ADMIN'])` |
| `/api/admin/orders` | Anyone can view/modify ALL orders | Complete order data breach | Add `requireAuth(request, ['ADMIN'])` |
| `/api/admin/orders/[id]` | Anyone can delete ANY order | Data loss, business disruption | Add `requireAuth(request, ['ADMIN'])` |
| `/api/admin/stats` | Anyone can view business metrics | Competitive intelligence leak | Add `requireAuth(request, ['ADMIN'])` |
| `/api/admin/services/[id]` | Weak protection, wrong error codes | Inconsistent security | Replace with `requireAuth(request, ['ADMIN'])` |
| `/api/admin/hero` | Anyone can modify hero content | Website defacement | Add `requireAuth(request, ['ADMIN'])` to POST/DELETE |
| `/api/admin/contacts/[id]` | Anyone can modify/delete contacts | Data loss, privacy breach | Add `requireAuth(request, ['ADMIN'])` |
| `/api/admin/orders/create` | Weak protection | Unauthorized order creation | Replace with `requireAuth(request, ['ADMIN'])` |

### Phase 2: HIGH Consultant Routes (11 routes, 4-5 hours)

These routes use deprecated patterns that provide weak protection.

| Route | Issue | Impact | Fix |
|-------|-------|--------|-----|
| All `/api/consultant/*` routes | Use `getConsultantId()` or `getCurrentUser()` | Weak JWT validation, inconsistent errors | Replace with `requireAuth(request, ['CONSULTANT'])` |
| Routes with ownership | Missing explicit ownership checks | Potential cross-consultant data access | Add `requireOwnership()` after fetching resource |

### Phase 3: HIGH Client Routes (8 routes, 3-4 hours)

These routes use deprecated patterns and lack ownership validation.

| Route | Issue | Impact | Fix |
|-------|-------|--------|-----|
| `/api/client/orders/[orderId]` | Weak protection, has ownership check | Inconsistent security | Replace with `requireAuth(request, ['CLIENT'])` + `requireOwnership()` |
| `/api/client/reservations` | No auth at all | Anyone can cancel reservations | Add `requireAuth(request, ['CLIENT'])` + `requireOwnership()` |
| Other client routes | Use `getCurrentUser()` or `getClientId()` | Weak JWT validation | Replace with `requireAuth(request, ['CLIENT'])` |

### Phase 4: MEDIUM Other Routes (13 routes, 2-3 hours)

Less critical functionality but still needs protection.

| Route | Issue | Impact | Fix |
|-------|-------|--------|-----|
| `/api/reviews` POST/PATCH | Weak protection with `getClientId()` | Anyone can create/modify reviews | Replace with `requireAuth(request, ['CLIENT'])` |
| `/api/upload/*` | No auth or weak protection | Unauthorized file uploads, storage abuse | Add appropriate role checks |
| `/api/faqs` POST, `/api/faqs/[id]` PUT/DELETE | No auth | Anyone can modify FAQs | Add `requireAuth(request, ['ADMIN'])` |
| `/api/content/[key]` PUT | Weak protection | Unauthorized content modification | Replace with `requireAuth(request, ['ADMIN'])` |

### Phase 5: LOW Refactor Routes (10 routes, 3-4 hours)

Already have some protection but need refactoring for consistency.

| Route | Issue | Impact | Fix |
|-------|-------|--------|-----|
| Various admin routes | Use `getCurrentUser()` + manual role check | Inconsistent patterns, wrong error codes | Replace with `requireAuth(request, ['ADMIN'])` |
| `/api/notifications` | Uses `getCurrentUser()` without role check | Inconsistent security | Replace with `requireAuth(request)` |

---

## Implementation Checklist

### For Each Route:

- [ ] **Read current implementation** to understand existing logic
- [ ] **Add required imports**:
  ```typescript
  import { NextRequest } from 'next/server';
  import { requireAuth, requireOwnership } from '@/lib/auth/middleware';
  import { handleError, successResponse } from '@/lib/errors/handler';
  import { NotFoundError } from '@/lib/errors/types'; // If ownership check needed
  ```
- [ ] **Update function signature** to accept `NextRequest`
- [ ] **Add authentication check** as first line:
  ```typescript
  const authResult = requireAuth(request, ['ROLE']);
  if (!authResult.success) return authResult.response;
  ```
- [ ] **Remove deprecated auth code** (`getCurrentUser()`, `getConsultantId()`, `getClientId()`)
- [ ] **Add ownership validation** (if needed):
  ```typescript
  const ownershipResult = requireOwnership(authResult.user, resource.ownerId);
  if (!ownershipResult.success) return ownershipResult.response;
  ```
- [ ] **Use authenticated user data**: Replace hardcoded IDs with `authResult.user.userId`
- [ ] **Wrap logic in try-catch** with `handleError()`
- [ ] **Replace response patterns** with `successResponse()`
- [ ] **Test route**:
  - [ ] Without auth token → 401 Unauthorized
  - [ ] With wrong role → 403 Forbidden
  - [ ] With correct role → 200 OK
  - [ ] Ownership validation (if applicable)
- [ ] **Verify no TypeScript errors**
- [ ] **Commit changes** with descriptive message

---

## Testing Matrix

### Test Scenarios for Each Route

| Scenario | Expected Result | Status Code | Error Code |
|----------|----------------|-------------|------------|
| No auth token | Unauthorized | 401 | AUTHENTICATION_ERROR |
| Invalid/expired token | Unauthorized | 401 | AUTHENTICATION_ERROR |
| Wrong role (CLIENT accessing ADMIN route) | Forbidden | 403 | AUTHORIZATION_ERROR |
| Wrong role (CONSULTANT accessing CLIENT route) | Forbidden | 403 | AUTHORIZATION_ERROR |
| Correct role, wrong ownership | Forbidden | 403 | AUTHORIZATION_ERROR |
| Correct role, correct ownership | Success | 200/201/204 | - |
| ADMIN accessing any route | Success (admin bypass) | 200/201/204 | - |

---

## Risk Assessment

### Critical Risks (Phase 1)
- **Data Breach**: Complete exposure of billing, orders, stats, services
- **Data Loss**: Unauthorized deletion of orders, contacts
- **Website Defacement**: Unauthorized modification of hero content
- **Business Impact**: Competitive intelligence leak, financial data exposure

### High Risks (Phases 2-3)
- **Cross-User Data Access**: Consultants/clients accessing other users' data
- **Unauthorized Actions**: Creating/modifying resources without proper authorization
- **Privacy Violations**: Accessing personal information of other users

### Medium Risks (Phase 4)
- **Content Manipulation**: Unauthorized modification of reviews, FAQs, content
- **Storage Abuse**: Unauthorized file uploads
- **Reputation Damage**: Fake reviews, modified content

### Low Risks (Phase 5)
- **Inconsistent Security**: Different patterns across codebase
- **Maintenance Issues**: Harder to audit and maintain

---

## Success Criteria

- [ ] All 65 routes requiring protection have proper RBAC implemented
- [ ] All routes use `requireAuth()` pattern (no deprecated patterns)
- [ ] All routes with user-specific resources have ownership validation
- [ ] All routes use `successResponse()` and `handleError()`
- [ ] Consistent error responses (401 for auth, 403 for authz)
- [ ] Public routes remain accessible
- [ ] Auth routes remain functional
- [ ] No TypeScript compilation errors
- [ ] All tests pass
- [ ] No regressions in existing functionality

---

## Conclusion

This inventory provides a complete roadmap for securing all 80+ API routes in the application. The phased approach prioritizes critical vulnerabilities first, followed by systematic protection of all remaining routes. Each route has clear requirements for protection level, ownership validation, and estimated implementation time.

**Next Steps:**
1. Review this inventory with stakeholders
2. Confirm protection levels and priorities
3. Begin Phase 1 implementation immediately
4. Follow phased rollout strategy for remaining routes
5. Comprehensive testing after each phase
6. Monitor for unauthorized access attempts after deployment

