// SECURITY: CSRF Protection - Token generation and validation
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Generate a random CSRF token (Requirement 6.1)
 * 
 * @returns Random token string
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Sign a CSRF token with HMAC (Requirement 6.2)
 * 
 * @param token - Token to sign
 * @returns HMAC signature
 */
export function signCsrfToken(token: string): string {
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'default-csrf-secret';
  const hmac = createHmac('sha256', secret);
  hmac.update(token);
  return hmac.digest('hex');
}

/**
 * Verify CSRF token signature (Requirement 6.2)
 * 
 * Uses timing-safe comparison to prevent timing attacks
 * 
 * @param token - Token to verify
 * @param signature - Expected signature
 * @returns True if signature is valid
 */
export function verifyCsrfToken(token: string, signature: string): boolean {
  const expectedSignature = signCsrfToken(token);
  
  // Timing-safe comparison
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

/**
 * Create CSRF token pair (token + signature) (Requirement 6.1, 6.2)
 * 
 * @returns Object with token and signature
 */
export function createCsrfTokenPair(): { token: string; signature: string } {
  const token = generateCsrfToken();
  const signature = signCsrfToken(token);
  
  return { token, signature };
}
// END SECURITY: CSRF Protection - Token generation and validation complete
