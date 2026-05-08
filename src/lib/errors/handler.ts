// SECURITY: Error Handling - Centralized error handler
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger/logger';
import {
  AppError,
  ValidationError,
  DatabaseError,
  InternalServerError
} from './types';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  requestId?: string;
}

/**
 * Centralized error handler for API routes
 * 
 * Processes all error types, logs them, and returns consistent error responses
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.11
 */
export function handleError(
  error: unknown,
  request: NextRequest
): NextResponse<ErrorResponse> {
  // Generate request ID for tracing (Requirement 3.9)
  const requestId = crypto.randomUUID();
  
  // Get request context (Requirement 3.9)
  const context = {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  };
  
  // Handle known error types
  if (error instanceof AppError) {
    return handleAppError(error, context);
  }
  
  if (error instanceof ZodError) {
    return handleValidationError(error, context);
  }
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, context);
  }
  
  // Handle unknown errors
  return handleUnknownError(error, context);
}

/**
 * Handle application errors
 */
function handleAppError(
  error: AppError,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  // Log error (Requirement 3.9)
  logger.error('Application error', {
    ...context,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  });
  
  // Return error response (Requirement 3.11 - no sensitive info)
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
      details: error.details,
      requestId: context.requestId as string
    },
    {
      status: error.statusCode,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

/**
 * Handle Zod validation errors (Requirement 3.3)
 */
function handleValidationError(
  error: ZodError,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
  
  logger.warn('Validation error', {
    ...context,
    errors
  });
  
  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { errors },
      requestId: context.requestId as string
    },
    {
      status: 400,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

/**
 * Handle Prisma database errors (Requirement 3.7)
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  logger.error('Database error', {
    ...context,
    error: {
      code: error.code,
      message: error.message
    }
  });
  
  // Map Prisma errors to user-friendly messages (Requirement 3.11)
  let message = 'Database operation failed';
  let statusCode = 500;
  
  switch (error.code) {
    case 'P2002':
      message = 'A record with this value already exists';
      statusCode = 409;
      break;
    case 'P2025':
      message = 'Record not found';
      statusCode = 404;
      break;
    case 'P2003':
      message = 'Related record not found';
      statusCode = 400;
      break;
  }
  
  return NextResponse.json(
    {
      error: message,
      code: 'DATABASE_ERROR',
      requestId: context.requestId as string
    },
    {
      status: statusCode,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

/**
 * Handle unknown errors (Requirement 3.8)
 */
function handleUnknownError(
  error: unknown,
  context: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error('Unhandled error', {
    ...context,
    error: {
      message: errorMessage,
      stack: errorStack
    }
  });
  
  // Never expose internal error details in production (Requirement 3.11)
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : errorMessage;
  
  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_SERVER_ERROR',
      requestId: context.requestId as string
    },
    {
      status: 500,
      headers: {
        'X-Request-ID': context.requestId as string
      }
    }
  );
}

/**
 * Helper to create standardized success responses (Requirement 10.1)
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      data,
      ...(message && { message })
    },
    { status }
  );
}

/**
 * Helper for paginated responses (Requirement 10.4)
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  }
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.pageSize)
    }
  });
}
// END SECURITY: Error Handling - Centralized error handler complete
