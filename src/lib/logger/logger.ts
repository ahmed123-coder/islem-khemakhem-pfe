// SECURITY: Structured Logging - Core logger implementation
import { LogLevel, LogContext, LogEntry } from './types';

/**
 * Logger class for structured JSON logging
 * 
 * Provides consistent logging throughout the application with:
 * - Structured JSON output
 * - Log level filtering
 * - Sensitive data redaction
 * - Request context tracking
 * 
 * Requirements: 7.1, 7.2, 7.10, 7.11, 7.12
 */
class Logger {
  private minLevel: LogLevel;
  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor() {
    // Set minimum log level from environment (Requirement 7.10, 7.11)
    const envLevel = process.env.LOG_LEVEL as LogLevel || 'info';
    this.minLevel = envLevel;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  /**
   * Redact sensitive data from context (Requirement 7.9)
   */
  private redactSensitiveData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item));
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'authorization',
      'cookie',
      'creditCard',
      'credit_card',
      'ssn',
      'jwt',
      'bearer'
    ];

    const redacted: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Format and output a log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    // Redact sensitive data from context (Requirement 7.9)
    const safeContext = context ? this.redactSensitiveData(context) as LogContext : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(safeContext && { context: safeContext })
    };

    // Output as JSON (Requirement 7.1, 7.12)
    console.log(JSON.stringify(entry));
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, context?: LogContext): void {
    this.log('fatal', message, context);
  }

  /**
   * Log HTTP request (Requirement 7.4)
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info('HTTP Request', {
      method,
      path,
      statusCode,
      duration,
      ...context
    });
  }

  /**
   * Log successful authentication (Requirement 7.5, 15.1)
   */
  logAuthSuccess(userId: string, method: string, context?: LogContext): void {
    this.info('Authentication successful', {
      userId,
      method,
      event: 'auth_success',
      ...context
    });
  }

  /**
   * Log failed authentication (Requirement 7.5, 15.1)
   */
  logAuthFailure(email: string, reason: string, context?: LogContext): void {
    this.warn('Authentication failed', {
      email,
      reason,
      event: 'auth_failure',
      ...context
    });
  }

  /**
   * Log audit event (Requirement 7.8, 15.1, 15.2, 15.3, 15.4, 15.9)
   */
  logAudit(
    action: string,
    resource: string,
    userId?: string,
    context?: LogContext
  ): void {
    this.info('Audit event', {
      action,
      resource,
      userId,
      event: 'audit',
      ...context
    });
  }
}

// Export singleton instance
export const logger = new Logger();
// END SECURITY: Structured Logging - Core logger implementation complete
