import envSchema, { Env } from './schema';

/**
 * Environment Variable Validator
 * 
 * Validates environment variables at application startup and provides type-safe access.
 * Terminates the application if required variables are missing or invalid.
 * 
 * Requirements: 4.1, 4.7, 4.8, 4.10
 */

let validatedEnv: Env | null = null;

/**
 * Validates environment variables against the schema
 * 
 * This function should be called during application initialization before any routes are registered.
 * If validation fails, it logs detailed error messages and terminates the application.
 * 
 * Requirement 4.1: Runs during application initialization
 * Requirement 4.7: Logs detailed error messages on missing variables
 * Requirement 4.8: Logs validation errors and terminates on invalid formats
 * 
 * @returns {Env} The validated environment variables
 * @throws {never} Exits process with code 1 on validation failure
 */
export function validateEnv(): Env {
  // Return cached result if already validated
  if (validatedEnv) {
    return validatedEnv;
  }
  
  try {
    // Parse and validate environment variables (Requirement 4.1)
    validatedEnv = envSchema.parse(process.env);
    
    // Log success message
    console.log('✅ Environment variables validated successfully');
    
    // Log environment info
    console.log(`   Environment: ${validatedEnv.NODE_ENV}`);
    console.log(`   Port: ${validatedEnv.PORT}`);
    console.log(`   Database: ${validatedEnv.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   Redis: ${validatedEnv.REDIS_URL ? 'configured' : 'not configured (will use in-memory fallback)'}`);
    console.log(`   Sentry: ${validatedEnv.SENTRY_DSN ? 'configured' : 'not configured'}`);
    
    return validatedEnv;
  } catch (error) {
    // Log validation failure (Requirements 4.7, 4.8)
    console.error('❌ Environment variable validation failed:\n');
    
    if (error instanceof Error) {
      // Parse Zod validation errors for detailed output
      try {
        const zodError = JSON.parse(error.message);
        if (Array.isArray(zodError)) {
          console.error('The following environment variables have issues:\n');
          zodError.forEach((err: any) => {
            const path = err.path.join('.');
            console.error(`  • ${path}: ${err.message}`);
          });
        } else {
          console.error(error.message);
        }
      } catch {
        // If not JSON parseable, show raw error message
        console.error(error.message);
      }
    }
    
    console.error('\n📋 Please check your .env file and ensure all required variables are set.');
    console.error('   See .env.example for reference.\n');
    
    // Terminate application (Requirement 4.7, 4.8)
    process.exit(1);
  }
}

/**
 * Returns the validated environment variables
 * 
 * Provides type-safe access to validated environment variables throughout the application.
 * Must be called after validateEnv() has been executed.
 * 
 * Requirement 4.10: Provides type-safe access to validated environment variables
 * 
 * @returns {Env} The validated environment variables
 * @throws {Error} If validateEnv() has not been called yet
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error(
      'Environment not validated. Call validateEnv() during application initialization first.'
    );
  }
  return validatedEnv;
}
