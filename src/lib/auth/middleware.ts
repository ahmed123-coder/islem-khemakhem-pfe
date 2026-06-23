// SECURITY: Backend Authorization - Reusable middleware for API route protection
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '../auth';

/**
 * Extended NextRequest with user payload
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: TokenPayload;
  response?: NextResponse;
}

/**
 * Authenticate user from request token
 * 
 * Verifies JWT token and returns user payload
 * Returns 401 if token is missing or invalid
 * 
 * @param request - HTTP request
 * @returns Authentication result with user payload or error response
 */
export function authenticateUser(request: NextRequest): AuthResult {
  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Authentication required',
          code: 'AUTHENTICATION_ERROR'
        },
        { status: 401 }
      )
    };
  }
  
  // Verify token
  const payload = verifyToken(token);
  
  if (!payload) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid or expired token',
          code: 'TOKEN_INVALID'
        },
        { status: 401 }
      )
    };
  }
  
  return {
    success: true,
    user: payload
  };
}

/**
 * Authorize user roles
 * 
 * Checks if authenticated user has one of the allowed roles
 * Returns 403 if user doesn't have required role
 * 
 * @param user - Authenticated user payload
 * @param allowedRoles - Array of allowed roles
 * @returns Authorization result with error response if unauthorized
 */
export function authorizeRoles(
  user: TokenPayload,
  allowedRoles: string[]
): { success: boolean; response?: NextResponse } {
  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Insufficient permissions',
          code: 'AUTHORIZATION_ERROR',
          details: {
            required: allowedRoles,
            current: user.role
          }
        },
        { status: 403 }
      )
    };
  }
  
  return { success: true };
}

/**
 * Combined authentication and authorization middleware
 * 
 * Authenticates user and checks role permissions in one call
 * 
 * @param request - HTTP request
 * @param allowedRoles - Array of allowed roles
 * @returns Result with user payload or error response
 */
export function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): AuthResult {
  // Authenticate user
  const authResult = authenticateUser(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }
  
  // If roles specified, check authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const authzResult = authorizeRoles(authResult.user, allowedRoles);
    
    if (!authzResult.success) {
      return {
        success: false,
        response: authzResult.response
      };
    }
  }
  
  return {
    success: true,
    user: authResult.user
  };
}

/**
 * Check if user owns the resource
 * 
 * Verifies that the authenticated user is the owner of the resource
 * or has ADMIN role
 * 
 * @param user - Authenticated user payload
 * @param resourceOwnerId - ID of the resource owner
 * @returns True if user owns resource or is admin
 */
export function isOwnerOrAdmin(user: TokenPayload, resourceOwnerId: string): boolean {
  return user.userId === resourceOwnerId || user.role === 'ADMIN';
}

/**
 * Require resource ownership
 * 
 * Checks if user owns the resource or is admin
 * Returns 403 if user doesn't own resource and is not admin
 * 
 * @param user - Authenticated user payload
 * @param resourceOwnerId - ID of the resource owner
 * @returns Authorization result with error response if unauthorized
 */
export function requireOwnership(
  user: TokenPayload,
  resourceOwnerId: string
): { success: boolean; response?: NextResponse } {
  if (!isOwnerOrAdmin(user, resourceOwnerId)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Access denied - you do not own this resource',
          code: 'AUTHORIZATION_ERROR'
        },
        { status: 403 }
      )
    };
  }
  
  return { success: true };
}
// END SECURITY: Backend Authorization - Middleware complete
