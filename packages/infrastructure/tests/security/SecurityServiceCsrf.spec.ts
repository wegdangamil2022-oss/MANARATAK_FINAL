import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SecurityService } from '../../src/security/SecurityService';
import { createHmac } from 'node:crypto';

describe('SecurityService CSRF Protection', () => {
  let securityService: SecurityService;
  const sessionSecret = 'test-session-secret-12345';

  beforeEach(() => {
    vi.useFakeTimers();
    securityService = new SecurityService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates non-hardcoded tokens that are unique across multiple calls', () => {
    const token1 = securityService.generateCsrfToken(sessionSecret);
    const token2 = securityService.generateCsrfToken(sessionSecret);

    expect(token1).not.toBe('demo-token');
    expect(token2).not.toBe('demo-token');
    expect(token1).not.toBe(token2);
    expect(token1.split('.')).toHaveLength(3);
  });

  it('validates a legitimately generated token successfully', () => {
    const token = securityService.generateCsrfToken(sessionSecret);
    const isValid = securityService.validateCsrfToken(token, sessionSecret);
    expect(isValid).toBe(true);
  });

  it('rejects missing or non-string tokens', () => {
    expect(securityService.validateCsrfToken('', sessionSecret)).toBe(false);
    expect(securityService.validateCsrfToken(null as any, sessionSecret)).toBe(false);
    expect(securityService.validateCsrfToken(undefined as any, sessionSecret)).toBe(false);
  });

  it('rejects malformed tokens', () => {
    expect(securityService.validateCsrfToken('not-a-valid-token', sessionSecret)).toBe(false);
    expect(securityService.validateCsrfToken('part1.part2', sessionSecret)).toBe(false);
    expect(securityService.validateCsrfToken('a.b.c.d', sessionSecret)).toBe(false);
    expect(securityService.validateCsrfToken('invalidTimestamp.nonce.sig', sessionSecret)).toBe(false);
  });

  it('rejects tampered tokens', () => {
    const token = securityService.generateCsrfToken(sessionSecret);
    const parts = token.split('.');

    // Tamper timestamp
    const tamperedTs = `${Number(parts[0]) - 10}.${parts[1]}.${parts[2]}`;
    expect(securityService.validateCsrfToken(tamperedTs, sessionSecret)).toBe(false);

    // Tamper nonce
    const tamperedNonce = `${parts[0]}.tamperednonce123456.${parts[2]}`;
    expect(securityService.validateCsrfToken(tamperedNonce, sessionSecret)).toBe(false);

    // Tamper signature
    const tamperedSig = `${parts[0]}.${parts[1]}.badsignature1234567890abcdef1234567890abcdef1234567890abcdef12345678`;
    expect(securityService.validateCsrfToken(tamperedSig, sessionSecret)).toBe(false);
  });

  it('rejects tokens signed with a different session secret', () => {
    const token = securityService.generateCsrfToken('secret-A');
    const isValid = securityService.validateCsrfToken(token, 'secret-B');
    expect(isValid).toBe(false);
  });

  it('rejects expired tokens', () => {
    const token = securityService.generateCsrfToken(sessionSecret);

    // Fast forward 25 hours (default maxAgeMs is 24 hours)
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);

    const isValid = securityService.validateCsrfToken(token, sessionSecret);
    expect(isValid).toBe(false);
  });

  it('rejects tokens with timestamps in the far future', () => {
    const farFutureTs = Date.now() + 120000; // 2 mins in future
    const nonce = '0123456789abcdef0123456789abcdef';
    const futurePayload = `${farFutureTs}.${nonce}`;
    const futureSig = createHmac('sha256', sessionSecret).update(futurePayload).digest('hex');
    const futureToken = `${farFutureTs}.${nonce}.${futureSig}`;

    expect(securityService.validateCsrfToken(futureToken, sessionSecret)).toBe(false);
  });
});
