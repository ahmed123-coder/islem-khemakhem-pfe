import { z } from 'zod';

/**
 * Environment Variable Schema
 * 
 * Validates all required and optional environment variables at application startup.
 * Ensures type-safe access to configuration throughout the application.
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.9
 */

const envSchema = z.object({
  // Node environment (Requirement 4.4)
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    message: 'NODE_ENV must be one of: development, production, test'
  }),
  
  // Server configuration
  PORT: z.coerce.number().positive().default(3000),
  
  // Database (Requirement 4.2)
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .startsWith('postgresql://', 'DATABASE_URL must be a PostgreSQL connection string'),
  
  // Authentication (Requirement 4.3)
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),
  
  // Cloudinary configuration (Requirement 4.5)
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  
  // Zoom configuration (Requirement 4.6)
  ZOOM_ACCOUNT_ID: z.string().min(1, 'ZOOM_ACCOUNT_ID is required'),
  ZOOM_CLIENT_ID: z.string().min(1, 'ZOOM_CLIENT_ID is required'),
  ZOOM_CLIENT_SECRET: z.string().min(1, 'ZOOM_CLIENT_SECRET is required'),
  
  // Redis configuration (Requirement 4.9 - optional)
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  REDIS_TOKEN: z.string().optional(),
  
  // Sentry configuration (Requirement 4.9 - optional)
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Rate limiting configuration (optional overrides)
  RATE_LIMIT_DEFAULT: z.coerce.number().positive().optional(),
  RATE_LIMIT_AUTH: z.coerce.number().positive().optional(),
  RATE_LIMIT_UPLOAD: z.coerce.number().positive().optional(),
  
  // CSRF configuration (optional)
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),
  DISABLE_CSRF: z.coerce.boolean().default(false),
  
  // Logging configuration
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

/**
 * Type-safe environment variable interface
 * Inferred from the Zod schema
 */
export type Env = z.infer<typeof envSchema>;

export default envSchema;
