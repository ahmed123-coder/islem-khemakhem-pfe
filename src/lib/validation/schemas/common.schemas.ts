// SECURITY: Input Validation - Common reusable validation schemas
import { z } from 'zod';

/**
 * Common validation schemas used across the application
 * Requirements: 1.4, 1.6, 1.7, 1.8
 */

// CUID validation (Requirement 1.7)
export const cuidSchema = z.string().cuid('Invalid ID format');

// Email validation (Requirement 1.4)
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

// Password validation (Requirement 1.6, 9.1)
// 8+ chars, uppercase, lowercase, number, special character
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone validation (Requirement 1.4)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

// Pagination schemas (Requirement 1.8)
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

// Date range schema (Requirement 1.8)
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  })
  .refine(data => data.endDate >= data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  });

// File upload schema (Requirement 11.1, 11.2, 11.3, 11.9)
export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]),
  size: z.number().positive().max(50 * 1024 * 1024) // 50MB max
});
// END SECURITY: Input Validation - Common schemas complete
