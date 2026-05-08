// SECURITY: Error Handling - Error class hierarchy for consistent error handling

/**
 * Base application error class
 * All custom errors extend this class for consistent error handling
 * 
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract isOperational: boolean;

  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;

  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message, { errors });
  }
}

/**
 * Authentication error (401)
 * Used when authentication fails or token is invalid
 */
export class AuthenticationError extends AppError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  isOperational = true;

  constructor(message = 'Authentication failed') {
    super(message);
  }
}

/**
 * Authorization error (403)
 * Used when user lacks permission for an action
 */
export class AuthorizationError extends AppError {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  isOperational = true;

  constructor(message = 'Access denied') {
    super(message);
  }
}

/**
 * Not found error (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;

  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`
    );
  }
}

/**
 * Conflict error (409)
 * Used for resource conflicts (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Rate limit error (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  isOperational = true;

  constructor(public retryAfter: number) {
    super('Too many requests');
  }
}

/**
 * Database error (500)
 * Used for database operation failures
 */
export class DatabaseError extends AppError {
  statusCode = 500;
  code = 'DATABASE_ERROR';
  isOperational = true;

  constructor(message = 'Database operation failed') {
    super(message);
  }
}

/**
 * Internal server error (500)
 * Used for unexpected errors
 */
export class InternalServerError extends AppError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  isOperational = false;

  constructor(message = 'An unexpected error occurred') {
    super(message);
  }
}
// END SECURITY: Error Handling - Error class hierarchy complete
