import { validateEnv, getEnv } from './validator';

/**
 * Environment Module with Auto-Validation
 * 
 * This module automatically validates environment variables when imported,
 * providing a convenient way to access validated environment variables
 * throughout the application.
 * 
 * Requirement 4.10: Provides type-safe access to validated environment variables
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env';
 * 
 * console.log(env.DATABASE_URL);
 * console.log(env.JWT_SECRET);
 * ```
 */

// Validate environment variables on module load
validateEnv();

// Export validated environment object for convenient access
export const env = getEnv();

// Re-export validation functions for manual validation if needed
export { validateEnv, getEnv } from './validator';

// Re-export types
export type { Env } from './schema';
