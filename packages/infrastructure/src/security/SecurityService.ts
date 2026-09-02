import { ISecurityService, IRateLimiter } from '@manaratak/core';
import { DefaultRateLimiter } from './DefaultRateLimiter';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

export interface CsrfOptions {
  /** Maximum token age in milliseconds. Default: 24 hours (86400000 ms) */
  maxAgeMs?: number;
}

export class SecurityService implements ISecurityService {
  public readonly isProductionReady: boolean = true;
  public readonly kind: 'real' | 'demo' = 'real';
  private rateLimiter: IRateLimiter;
  private csrfMaxAgeMs: number;

  constructor(rateLimiter?: IRateLimiter, csrfOptions?: CsrfOptions) {
    this.rateLimiter = rateLimiter || new DefaultRateLimiter();
    this.csrfMaxAgeMs = csrfOptions?.maxAgeMs ?? 86400000; // 24 hours
  }

  getRateLimiter(): IRateLimiter {
    return this.rateLimiter;
  }

  /**
   * Generates a cryptographically secure, non-static CSRF token.
   * Token format: `<timestamp>.<nonce>.<hmac-signature>`
   */
  generateCsrfToken(sessionSecret: string): string {
    if (!sessionSecret || !sessionSecret.trim()) throw new Error('CSRF_SESSION_SECRET_REQUIRED');
    const secret = sessionSecret;
    const timestamp = Date.now().toString();
    const nonce = randomBytes(16).toString('hex');
    const payload = `${timestamp}.${nonce}`;
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    return `${timestamp}.${nonce}.${signature}`;
  }

  /**
   * Validates a CSRF token against a session secret.
   * Rejects missing, malformed, expired, tampered, or invalid tokens.
   */
  validateCsrfToken(token: string, sessionSecret: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const [timestampStr, nonce, signature] = parts;
    if (!timestampStr || !nonce || !signature) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || timestamp <= 0) {
      return false;
    }

    const now = Date.now();
    if (now - timestamp > this.csrfMaxAgeMs) {
      return false;
    }
    if (timestamp > now + 60000) {
      return false;
    }

    if (!sessionSecret || !sessionSecret.trim()) return false;
    const secret = sessionSecret;
    const payload = `${timestampStr}.${nonce}`;
    const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');

    const receivedSigBuf = Buffer.from(signature, 'utf8');
    const expectedSigBuf = Buffer.from(expectedSignature, 'utf8');

    if (receivedSigBuf.length !== expectedSigBuf.length) {
      return false;
    }

    return timingSafeEqual(receivedSigBuf, expectedSigBuf);
  }

  [key: string]: any;
  static [key: string]: any;
}
