# Bugfix Requirements Document

## Introduction

The application has a critical security vulnerability affecting approximately 65 API routes (81% of all routes) that lack proper role-based access control (RBAC). This vulnerability allows unauthorized users to access sensitive endpoints, view and modify data they should not have access to, and perform administrative actions without proper permissions.

**Severity:** CRITICAL - Active production security vulnerability with complete data breach potential

**Scope:** ~65 unprotected or weakly protected API routes across admin, consultant, and client namespaces

**Root Cause:** Routes were implemented without consistent authentication/authorization patterns, resulting in:
- Complete absence of auth checks on critical admin routes
- Inconsistent use of deprecated auth patterns (`getConsultantId()`, `getCurrentUser()`)
- Missing ownership validation on user-specific resources
- Inconsistent error responses (401 vs 403)

**Available Infrastructure:**
- ✅ `src/lib/auth/middleware.ts` - Reusable auth middleware (`requireAuth()`, `requireOwnership()`)
- ✅ `src/lib/errors/handler.ts` - Standardized error handling (`handleError()`, `successResponse()`)
- ✅ Frontend middleware - Proper role separation enforced

---

## Bug Analysis

### 1. Current Behavior (Defect)

#### 1.1 Unprotected Admin Routes (CRITICAL)

**1.1.1** WHEN an unauthenticated user sends a request to `/api/admin/orders` (GET, PUT) THEN the system processes the request and returns all order data without authentication check

**1.1.2** WHEN an unauthenticated user sends a request to `/api/admin/billing` (GET, POST, PUT, DELETE) THEN the system processes the request and returns/modifies billing data without authentication check

**1.1.3** WHEN an unauthenticated user sends a request to `/api/admin/stats` (GET) THEN the system returns admin statistics without authentication check

**1.1.4** WHEN an unauthenticated user sends a request to `/api/admin/services/[id]` (GET, PUT, DELETE) THEN the system processes the request and returns/modifies service data without authentication check

**1.1.5** WHEN an unauthenticated user sends a request to `/api/admin/hero` (POST, DELETE) THEN the system processes the request and modifies hero content without authentication check

**1.1.6** WHEN an unauthenticated user sends a request to `/api/admin/contacts/[id]` (PUT, DELETE) THEN the system processes the request and modifies contact data without authentication check

**1.1.7** WHEN an unauthenticated user sends a request to `/api/admin/orders/[id]` (DELETE) THEN the system deletes the order without authentication check

**1.1.8** WHEN a CLIENT or CONSULTANT role user sends a request to any `/api/admin/*` route THEN the system processes the request without role validation

#### 1.2 Weak Consultant Route Protection (HIGH)

**1.2.1** WHEN consultant routes use the deprecated `getConsultantId()` pattern THEN the system only checks role without proper JWT token validation

**1.2.2** WHEN consultant routes return errors THEN the system returns inconsistent error codes (sometimes 401, sometimes 403) for the same authentication failure scenarios

**1.2.3** WHEN a request to `/api/consultant/orders/[orderId]/status` (PATCH) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.4** WHEN a request to `/api/consultant/reservations` (GET, PATCH, DELETE) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.5** WHEN a request to `/api/consultant/messages` (GET, POST) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.6** WHEN a request to `/api/consultant/missions` (GET, POST, PATCH, DELETE) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.7** WHEN a request to `/api/consultant/milestones` (POST, PATCH, DELETE) is made THEN the system has no authentication check at all

**1.2.8** WHEN a request to `/api/consultant/portfolio` (GET, PATCH) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.9** WHEN a request to `/api/consultant/clients` (GET) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.10** WHEN a request to `/api/consultant/calls` (GET) is made THEN the system uses weak protection pattern instead of `requireAuth()`

**1.2.11** WHEN a request to `/api/consultant/reviews` (GET) is made THEN the system has no authentication check at all

**1.2.12** WHEN a request to `/api/consultant/stats` (GET) is made THEN the system uses weak protection pattern instead of `requireAuth()`

#### 1.3 Unprotected Client Routes (HIGH)

**1.3.1** WHEN an unauthenticated user sends a request to `/api/client/orders/[orderId]` (GET) THEN the system returns order data without authentication check and without ownership validation

**1.3.2** WHEN an unauthenticated user sends a request to `/api/client/reservations` (DELETE) THEN the system processes the deletion without authentication check

**1.3.3** WHEN an unauthenticated user sends a request to `/api/client/purchase/*` routes THEN the system processes purchase operations without authentication check

**1.3.4** WHEN an unauthenticated user sends a request to `/api/client/invoices/*` routes THEN the system returns invoice data without authentication check

**1.3.5** WHEN an unauthenticated user sends a request to `/api/client/milestones/*` routes THEN the system returns/modifies milestone data without authentication check

**1.3.6** WHEN a CLIENT user requests another client's order via `/api/client/orders/[orderId]` THEN the system returns the order data without ownership validation

#### 1.4 Review Routes Need Role Checks (MEDIUM)

**1.4.1** WHEN an unauthenticated user sends a POST request to `/api/reviews` THEN the system creates a review without authentication check

**1.4.2** WHEN an unauthenticated user sends a PATCH request to `/api/reviews` THEN the system updates a review without authentication check

**1.4.3** WHEN an unauthenticated user sends a PATCH or DELETE request to `/api/reviews/[id]` THEN the system modifies/deletes the review without ownership validation

#### 1.5 Upload Routes Need Protection (MEDIUM)

**1.5.1** WHEN an unauthenticated user sends a request to `/api/upload/document` (POST) THEN the system processes the file upload without authentication check

**1.5.2** WHEN an unauthenticated user sends a request to `/api/upload/icon` (POST) THEN the system processes the file upload without authentication check

**1.5.3** WHEN an unauthenticated user sends a request to `/api/upload/logo` (POST) THEN the system processes the file upload without authentication check

**1.5.4** WHEN an unauthenticated user sends a request to `/api/upload/image` (POST) THEN the system has weak protection that may allow unauthorized uploads

#### 1.6 FAQ Admin Routes (MEDIUM)

**1.6.1** WHEN an unauthenticated user sends a POST request to `/api/faqs` THEN the system creates a FAQ without authentication check

**1.6.2** WHEN an unauthenticated user sends a PUT or DELETE request to `/api/faqs/[id]` THEN the system modifies/deletes the FAQ without authentication check

#### 1.7 Content Admin Routes (MEDIUM)

**1.7.1** WHEN an unauthenticated user sends a PUT request to `/api/content/[key]` THEN the system has weak protection that may allow unauthorized content modification

---

### 2. Expected Behavior (Correct)

#### 2.1 Protected Admin Routes (CRITICAL)

**2.1.1** WHEN an unauthenticated user sends a request to `/api/admin/orders` (GET, PUT) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.2** WHEN an unauthenticated user sends a request to `/api/admin/billing` (GET, POST, PUT, DELETE) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.3** WHEN an unauthenticated user sends a request to `/api/admin/stats` (GET) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.4** WHEN an unauthenticated user sends a request to `/api/admin/services/[id]` (GET, PUT, DELETE) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.5** WHEN an unauthenticated user sends a request to `/api/admin/hero` (POST, DELETE) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.6** WHEN an unauthenticated user sends a request to `/api/admin/contacts/[id]` (PUT, DELETE) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.7** WHEN an unauthenticated user sends a request to `/api/admin/orders/[id]` (DELETE) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.1.8** WHEN a CLIENT or CONSULTANT role user sends a request to any `/api/admin/*` route THEN the system SHALL return 403 Forbidden with error code 'AUTHORIZATION_ERROR' and details showing required role is ADMIN

**2.1.9** WHEN an authenticated ADMIN user sends a request to any `/api/admin/*` route THEN the system SHALL process the request and return appropriate success response using `successResponse()`

#### 2.2 Strong Consultant Route Protection (HIGH)

**2.2.1** WHEN consultant routes receive a request THEN the system SHALL use `requireAuth(request, ['CONSULTANT'])` pattern for authentication and authorization

**2.2.2** WHEN consultant routes encounter authentication failures THEN the system SHALL return consistent error codes (401 for missing/invalid auth, 403 for insufficient permissions)

**2.2.3** WHEN a request to `/api/consultant/orders/[orderId]/status` (PATCH) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.4** WHEN a request to `/api/consultant/reservations` (GET, PATCH, DELETE) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.5** WHEN a request to `/api/consultant/messages` (GET, POST) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.6** WHEN a request to `/api/consultant/missions` (GET, POST, PATCH, DELETE) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.7** WHEN a request to `/api/consultant/milestones` (POST, PATCH, DELETE) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.8** WHEN a request to `/api/consultant/portfolio` (GET, PATCH) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.9** WHEN a request to `/api/consultant/clients` (GET) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.10** WHEN a request to `/api/consultant/calls` (GET) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.11** WHEN a request to `/api/consultant/reviews` (GET) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.12** WHEN a request to `/api/consultant/stats` (GET) is made without valid CONSULTANT auth THEN the system SHALL return 401 or 403 as appropriate

**2.2.13** WHEN an authenticated CONSULTANT user accesses consultant routes THEN the system SHALL use `authResult.user.userId` to filter data to only their own resources

#### 2.3 Protected Client Routes with Ownership (HIGH)

**2.3.1** WHEN an unauthenticated user sends a request to `/api/client/orders/[orderId]` (GET) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.3.2** WHEN an unauthenticated user sends a request to `/api/client/reservations` (DELETE) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.3.3** WHEN an unauthenticated user sends a request to `/api/client/purchase/*` routes THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.3.4** WHEN an unauthenticated user sends a request to `/api/client/invoices/*` routes THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.3.5** WHEN an unauthenticated user sends a request to `/api/client/milestones/*` routes THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.3.6** WHEN a CLIENT user requests another client's order via `/api/client/orders/[orderId]` THEN the system SHALL return 403 Forbidden with error code 'AUTHORIZATION_ERROR' and message 'Access denied - you do not own this resource'

**2.3.7** WHEN a CLIENT user requests their own order via `/api/client/orders/[orderId]` THEN the system SHALL return the order data using `successResponse()`

**2.3.8** WHEN an ADMIN user requests any client's order THEN the system SHALL return the order data (admin bypass for ownership check)

#### 2.4 Protected Review Routes (MEDIUM)

**2.4.1** WHEN an unauthenticated user sends a POST request to `/api/reviews` THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.4.2** WHEN an unauthenticated user sends a PATCH request to `/api/reviews` THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.4.3** WHEN an unauthenticated user sends a PATCH or DELETE request to `/api/reviews/[id]` THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.4.4** WHEN a CLIENT user attempts to modify another user's review THEN the system SHALL return 403 Forbidden with ownership error

**2.4.5** WHEN a CLIENT user modifies their own review THEN the system SHALL process the request successfully

#### 2.5 Protected Upload Routes (MEDIUM)

**2.5.1** WHEN an unauthenticated user sends a request to `/api/upload/document` (POST) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.5.2** WHEN an unauthenticated user sends a request to `/api/upload/icon` (POST) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.5.3** WHEN an unauthenticated user sends a request to `/api/upload/logo` (POST) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.5.4** WHEN an unauthenticated user sends a request to `/api/upload/image` (POST) THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.5.5** WHEN an authenticated user with appropriate role uploads a file THEN the system SHALL process the upload and return success response

#### 2.6 Protected FAQ Admin Routes (MEDIUM)

**2.6.1** WHEN an unauthenticated user sends a POST request to `/api/faqs` THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.6.2** WHEN an unauthenticated user sends a PUT or DELETE request to `/api/faqs/[id]` THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.6.3** WHEN a non-ADMIN user sends a POST, PUT, or DELETE request to FAQ routes THEN the system SHALL return 403 Forbidden with error code 'AUTHORIZATION_ERROR'

**2.6.4** WHEN an ADMIN user sends a POST, PUT, or DELETE request to FAQ routes THEN the system SHALL process the request successfully

#### 2.7 Protected Content Admin Routes (MEDIUM)

**2.7.1** WHEN an unauthenticated user sends a PUT request to `/api/content/[key]` THEN the system SHALL return 401 Unauthorized with error code 'AUTHENTICATION_ERROR'

**2.7.2** WHEN a non-ADMIN user sends a PUT request to `/api/content/[key]` THEN the system SHALL return 403 Forbidden with error code 'AUTHORIZATION_ERROR'

**2.7.3** WHEN an ADMIN user sends a PUT request to `/api/content/[key]` THEN the system SHALL process the request successfully

---

### 3. Unchanged Behavior (Regression Prevention)

#### 3.1 Public Routes Remain Public

**3.1.1** WHEN an unauthenticated user sends a GET request to `/api/services` THEN the system SHALL CONTINUE TO return service catalog data without authentication

**3.1.2** WHEN an unauthenticated user sends a GET request to `/api/services/with-tiers` THEN the system SHALL CONTINUE TO return service pricing data without authentication

**3.1.3** WHEN an unauthenticated user sends a GET request to `/api/consultants/available` THEN the system SHALL CONTINUE TO return available consultants without authentication

**3.1.4** WHEN an unauthenticated user sends a GET request to `/api/consultants/schedule` THEN the system SHALL CONTINUE TO return consultant schedules without authentication

**3.1.5** WHEN an unauthenticated user sends a GET request to `/api/blogs` THEN the system SHALL CONTINUE TO return blog posts without authentication

**3.1.6** WHEN an unauthenticated user sends a GET request to `/api/faqs` THEN the system SHALL CONTINUE TO return FAQ list without authentication

**3.1.7** WHEN an unauthenticated user sends a GET request to `/api/hero` THEN the system SHALL CONTINUE TO return hero images without authentication

**3.1.8** WHEN an unauthenticated user sends a GET request to `/api/content/[key]` THEN the system SHALL CONTINUE TO return site content without authentication

**3.1.9** WHEN an unauthenticated user sends a POST request to `/api/contact` THEN the system SHALL CONTINUE TO process contact form submissions without authentication

**3.1.10** WHEN an unauthenticated user sends a GET request to `/api/csrf` THEN the system SHALL CONTINUE TO return CSRF token without authentication

**3.1.11** WHEN an unauthenticated user sends a GET request to `/api/reviews` THEN the system SHALL CONTINUE TO return review list without authentication

#### 3.2 Auth Routes Remain Functional

**3.2.1** WHEN an unauthenticated user sends a POST request to `/api/auth/login` THEN the system SHALL CONTINUE TO process login without requiring prior authentication

**3.2.2** WHEN an unauthenticated user sends a POST request to `/api/auth/register` THEN the system SHALL CONTINUE TO process registration without requiring prior authentication

**3.2.3** WHEN an authenticated user sends a POST request to `/api/auth/logout` THEN the system SHALL CONTINUE TO process logout successfully

**3.2.4** WHEN an authenticated user sends a GET request to `/api/auth/me` THEN the system SHALL CONTINUE TO return current user data

#### 3.3 Protected Routes Continue Working for Authorized Users

**3.3.1** WHEN an authenticated ADMIN user accesses admin routes THEN the system SHALL CONTINUE TO process requests successfully and return data

**3.3.2** WHEN an authenticated CONSULTANT user accesses consultant routes THEN the system SHALL CONTINUE TO process requests successfully and return their own data

**3.3.3** WHEN an authenticated CLIENT user accesses client routes for their own resources THEN the system SHALL CONTINUE TO process requests successfully and return their own data

**3.3.4** WHEN an authenticated user with correct role and ownership accesses protected resources THEN the system SHALL CONTINUE TO return success responses with correct data structure

#### 3.4 Error Handling Remains Consistent

**3.4.1** WHEN any route encounters a database error THEN the system SHALL CONTINUE TO use `handleError()` to return consistent error responses

**3.4.2** WHEN any route encounters a validation error THEN the system SHALL CONTINUE TO use `handleError()` to return 400 Bad Request with validation details

**3.4.3** WHEN any route encounters an internal error THEN the system SHALL CONTINUE TO use `handleError()` to return 500 Internal Server Error without exposing sensitive details

**3.4.4** WHEN any route succeeds THEN the system SHALL CONTINUE TO use `successResponse()` to return consistent success responses

#### 3.5 Existing Protected Routes Remain Protected

**3.5.1** WHEN a request is made to `/api/admin/users` (GET, POST, PUT) THEN the system SHALL CONTINUE TO require ADMIN role authentication

**3.5.2** WHEN a request is made to `/api/consultant/profile` (GET, PUT) THEN the system SHALL CONTINUE TO require CONSULTANT role authentication

**3.5.3** WHEN a request is made to `/api/client/profile` (GET, PUT) THEN the system SHALL CONTINUE TO require CLIENT role authentication

**3.5.4** WHEN a request is made to any already-protected route THEN the system SHALL CONTINUE TO enforce the same authentication and authorization requirements

---

## Bug Condition Specification

### Bug Condition Function

The bug condition identifies API routes that lack proper RBAC protection:

```pascal
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

### Property Specification: Fix Checking

For all routes identified by the bug condition, the fixed implementation must satisfy:

```pascal
// Property: Fix Checking - Proper RBAC Protection
FOR ALL Route WHERE isBugCondition(Route) DO
  result ← processRequest'(Route, request)
  
  // Authentication check
  IF NOT hasValidToken(request) THEN
    ASSERT result.status = 401 AND
           result.code = 'AUTHENTICATION_ERROR'
  END IF
  
  // Authorization check
  IF hasValidToken(request) AND NOT hasRequiredRole(request, Route) THEN
    ASSERT result.status = 403 AND
           result.code = 'AUTHORIZATION_ERROR' AND
           result.details.required IS_SET AND
           result.details.current IS_SET
  END IF
  
  // Ownership check (for user-specific resources)
  IF isUserSpecificResource(Route) AND
     hasValidToken(request) AND
     hasRequiredRole(request, Route) AND
     NOT isOwnerOrAdmin(request.user, resource.ownerId) THEN
    ASSERT result.status = 403 AND
           result.code = 'AUTHORIZATION_ERROR' AND
           result.message CONTAINS 'do not own this resource'
  END IF
  
  // Success case
  IF hasValidToken(request) AND
     hasRequiredRole(request, Route) AND
     (NOT isUserSpecificResource(Route) OR isOwnerOrAdmin(request.user, resource.ownerId)) THEN
    ASSERT result.status IN [200, 201, 204] AND
           usesSuccessResponse(result)
  END IF
  
  // Standardized responses
  ASSERT usesHandleError(Route) AND
         usesSuccessResponse(Route)
END FOR
```

### Property Specification: Preservation Checking

For all routes NOT identified by the bug condition (already properly protected or intentionally public):

```pascal
// Property: Preservation Checking - No Regression
FOR ALL Route WHERE NOT isBugCondition(Route) DO
  // Original function F (before fix)
  // Fixed function F' (after fix)
  
  FOR ALL request IN testRequests DO
    ASSERT F(Route, request) = F'(Route, request)
  END FOR
  
  // Specifically:
  // - Public routes remain public
  // - Auth routes remain functional
  // - Already-protected routes maintain same protection level
  // - Error handling remains consistent
  // - Response formats remain unchanged
END FOR
```

### Counterexamples

**Example 1: Unprotected Admin Route**
```typescript
// Route: /api/admin/orders (GET)
// Input: Unauthenticated request
// Current Behavior: Returns all orders (200 OK)
// Expected Behavior: Returns 401 Unauthorized
// Bug Condition: isBugCondition = true (no authentication check)
```

**Example 2: Weak Consultant Route**
```typescript
// Route: /api/consultant/missions (GET)
// Input: Request with valid token but CLIENT role
// Current Behavior: Returns missions (200 OK) - only checks if consultantId exists
// Expected Behavior: Returns 403 Forbidden
// Bug Condition: isBugCondition = true (uses deprecated pattern, no role check)
```

**Example 3: Missing Ownership Check**
```typescript
// Route: /api/client/orders/[orderId] (GET)
// Input: CLIENT user requesting another client's order
// Current Behavior: Returns other client's order (200 OK)
// Expected Behavior: Returns 403 Forbidden
// Bug Condition: isBugCondition = true (missing ownership validation)
```

---

## Implementation Notes

**Key Definitions:**
- **F**: Original (unfixed) route handlers - code as it exists before the fix
- **F'**: Fixed route handlers - code after applying RBAC protection

**Protection Patterns to Apply:**
1. **Admin Routes**: `requireAuth(request, ['ADMIN'])`
2. **Consultant Routes**: `requireAuth(request, ['CONSULTANT'])` + use `authResult.user.userId` for data filtering
3. **Client Routes**: `requireAuth(request, ['CLIENT'])` + `requireOwnership()` for user-specific resources
4. **Review/Upload/FAQ Routes**: Role-based protection as appropriate
5. **All Routes**: Use `successResponse()` and `handleError()` for consistent responses

**Testing Strategy:**
- Test each route returns 401 without auth token
- Test each route returns 403 with wrong role
- Test each route returns 200 with correct role
- Test ownership validation for user-specific resources
- Verify no TypeScript errors after changes
- Verify public routes remain accessible
- Verify already-protected routes maintain functionality
