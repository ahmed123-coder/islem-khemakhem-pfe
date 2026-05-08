// SECURITY: Input Validation - Validation utility functions
import { z, ZodSchema } from 'zod';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation exception class
 * Thrown when validation fails
 */
export class ValidationException extends Error {
  constructor(
    public errors: ValidationError[],
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Validate data and throw on error (Requirement 1.1, 1.2)
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws ValidationException if validation fails
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    throw new ValidationException(errors);
  }
  
  return result.data;
}

/**
 * Validate data and return result (Requirement 1.3)
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with data or errors
 */
export function validateSafe<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  }
  
  return {
    success: true,
    data: result.data
  };
}
// END SECURITY: Input Validation - Validation utilities complete
