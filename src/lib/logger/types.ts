// SECURITY: Structured Logging - Type definitions for consistent log formatting
// This file defines the core types for the structured logging system

/**
 * Log severity levels
 * - debug: Detailed information for debugging
 * - info: General informational messages
 * - warn: Warning messages for potentially harmful situations
 * - error: Error messages for error events
 * - fatal: Critical errors that may cause application termination
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Context object for additional log metadata
 * Allows arbitrary key-value pairs to be attached to log entries
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * Complete log entry structure
 * All logs are formatted as JSON with this structure for consistent parsing
 */
export interface LogEntry {
  /** ISO 8601 timestamp of when the log was created */
  timestamp: string;
  
  /** Severity level of the log */
  level: LogLevel;
  
  /** Human-readable log message */
  message: string;
  
  /** Additional context data (will be redacted for sensitive fields) */
  context?: LogContext;
  
  /** Unique identifier for request tracing */
  requestId?: string;
  
  /** User ID associated with the log (for authenticated requests) */
  userId?: string;
  
  /** IP address of the client */
  ip?: string;
  
  /** HTTP method (GET, POST, etc.) */
  method?: string;
  
  /** Request URL */
  url?: string;
  
  /** HTTP response status code */
  statusCode?: number;
  
  /** Request duration in milliseconds */
  duration?: number;
  
  /** Error details (if log is for an error) */
  error?: {
    /** Error class name */
    name: string;
    
    /** Error message */
    message: string;
    
    /** Stack trace (only in development) */
    stack?: string;
  };
}
// END SECURITY: Structured Logging - Type definitions complete
