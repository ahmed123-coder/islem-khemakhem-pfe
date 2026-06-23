// SECURITY: Input Validation - Input sanitization functions

/**
 * Sanitize string input to prevent XSS attacks (Requirement 1.5, 11.1)
 * 
 * Removes potentially dangerous HTML/script content from user input
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return input;
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Encode HTML entities (Requirement 1.5)
 * 
 * Converts special characters to HTML entities to prevent XSS
 * 
 * @param input - String to encode
 * @returns HTML-encoded string
 */
export function encodeHtml(input: string): string {
  if (!input) return input;
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return input.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
}

/**
 * Sanitize object recursively
 * 
 * Applies sanitization to all string values in an object
 * 
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    
    return sanitized as T;
  }
  
  return obj;
}
// END SECURITY: Input Validation - Sanitization functions complete
