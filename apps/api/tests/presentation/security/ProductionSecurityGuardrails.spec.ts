import { describe, it, expect } from 'vitest';
import { createApiApp } from '../../../src/app';
import { SecurityValidator } from '../../../src/presentation/security/SecurityValidator';
import { SecurityMiddlewareFactory } from '../../../src/presentation/security/SecurityMiddlewareFactory';
import { DefaultRateLimiter, SecurityService } from '@manaratak/infrastructure';
import { ISecurityService, IRateLimiter, IRateLimitResult } from '@manaratak/core';

describe('Production Security Guardrails & Boot Validation', () => {
  class StubRateLimiter implements IRateLimiter {
    public readonly isProductionReady = false;
    public readonly kind = 'demo' as const;
    async consume(): Promise<IRateLimitResult> {
      return { allowed: true, remaining: 100, resetTime: Date.now() + 60000 };
    }
  }

  class StubSecurityService implements ISecurityService {
    public readonly isProductionReady = false;
    public readonly kind = 'demo' as const;
    getRateLimiter(): IRateLimiter {
      return new StubRateLimiter();
    }
    generateCsrfToken(): string {
      return 'demo-token';
    }
    validateCsrfToken(): boolean {
      return true;
    }
  }

  describe('SecurityValidator', () => {
    it('identifies real infrastructure rate limiter as production ready', () => {
      const realRateLimiter = new DefaultRateLimiter();
      expect(SecurityValidator.isRealRateLimiter(realRateLimiter)).toBe(true);
      expect(realRateLimiter.isProductionReady).toBe(true);
      expect(realRateLimiter.kind).toBe('real');
    });

    it('identifies stub or demo rate limiters as non-production ready', () => {
      const stubRateLimiter = new StubRateLimiter();
      expect(SecurityValidator.isRealRateLimiter(stubRateLimiter)).toBe(false);
      expect(SecurityValidator.isRealRateLimiter(null)).toBe(false);
      expect(SecurityValidator.isRealRateLimiter(undefined)).toBe(false);
    });

    it('identifies real infrastructure security service as production ready', () => {
      const realSecurityService = new SecurityService();
      expect(SecurityValidator.isRealSecurityService(realSecurityService)).toBe(true);
      expect(realSecurityService.isProductionReady).toBe(true);
      expect(realSecurityService.kind).toBe('real');
    });

    it('identifies stub or static demo token security service as non-production ready', () => {
      const stubSecurityService = new StubSecurityService();
      expect(SecurityValidator.isRealSecurityService(stubSecurityService)).toBe(false);
      expect(SecurityValidator.isRealSecurityService(null)).toBe(false);
      expect(SecurityValidator.isRealSecurityService(undefined)).toBe(false);
    });

    it('allows startup in non-production environments with any implementation', () => {
      const devEnv = { NODE_ENV: 'development' };
      expect(() => {
        SecurityValidator.assertProductionSecurity(devEnv, new StubSecurityService(), new StubRateLimiter());
      }).not.toThrow();

      const testEnv = { NODE_ENV: 'test' };
      expect(() => {
        SecurityValidator.assertProductionSecurity(testEnv, null, null);
      }).not.toThrow();
    });

    it('fails startup in production environment when rate limiter is missing or demo', () => {
      const prodEnv = { NODE_ENV: 'production' };
      const realSecurityService = new SecurityService();

      expect(() => {
        SecurityValidator.assertProductionSecurity(prodEnv, realSecurityService, null);
      }).toThrow(/Rate limiting is missing or using a demo\/stub implementation/);

      expect(() => {
        SecurityValidator.assertProductionSecurity(prodEnv, realSecurityService, new StubRateLimiter());
      }).toThrow(/Rate limiting is missing or using a demo\/stub implementation/);
    });

    it('fails startup in production environment when CSRF service is missing or demo', () => {
      const prodEnv = { NODE_ENV: 'production' };
      const realRateLimiter = new DefaultRateLimiter();

      expect(() => {
        SecurityValidator.assertProductionSecurity(prodEnv, null, realRateLimiter);
      }).toThrow(/CSRF protection is missing or using a demo\/stub implementation/);

      expect(() => {
        SecurityValidator.assertProductionSecurity(prodEnv, new StubSecurityService(), realRateLimiter);
      }).toThrow(/CSRF protection is missing or using a demo\/stub implementation/);
    });

    it('passes production startup check when real rate limiter and CSRF service are provided', () => {
      const prodEnv = { NODE_ENV: 'production' };
      const realRateLimiter = new DefaultRateLimiter();
      const realSecurityService = new SecurityService(realRateLimiter);

      expect(() => {
        SecurityValidator.assertProductionSecurity(prodEnv, realSecurityService, realRateLimiter);
      }).not.toThrow();
    });
  });

  describe('createApiApp Bootstrap Integration', () => {
    const validProdEnv = {
      NODE_ENV: 'production',
      JWT_SECRET: 'production-jwt-secret-must-be-very-long-32-chars-at-least',
      SESSION_SECRET: 'production-session-secret-must-be-very-long-32-chars',
      CSRF_SECRET: 'production-csrf-secret-must-be-very-long-32-chars-at-all',
      CORS_ORIGIN: 'https://app.manaratak.org',
      API_BASE_URL: 'https://api.manaratak.org',
      DATABASE_URL: 'postgresql://prod_user:secret@postgres.prod:5432/manaratak',
      REDIS_URL: 'redis://redis.prod:6379',
      ADMIN_AUTH_MODE: 'strict',
      SECURE_COOKIE: 'true',
    };

    it('succeeds in production mode with default real security implementations', async () => {
      const app = await createApiApp({
        resetCache: true,
        env: validProdEnv,
      });

      expect(app).toBeDefined();
    });

    it('fails production app creation when demo CSRF service is supplied', async () => {
      await expect(
        createApiApp({
          resetCache: true,
          env: validProdEnv,
          securityService: new StubSecurityService(),
        })
      ).rejects.toThrow(/CSRF protection is missing or using a demo\/stub implementation/);
    });

    it('fails production app creation when demo rate limiter is supplied', async () => {
      await expect(
        createApiApp({
          resetCache: true,
          env: validProdEnv,
          rateLimiter: new StubRateLimiter(),
        })
      ).rejects.toThrow(/Rate limiting is missing or using a demo\/stub implementation/);
    });

    it('fails production app creation when ProductionReadinessValidator reports blockers', async () => {
      await expect(
        createApiApp({
          resetCache: true,
          env: {
            ...validProdEnv,
            API_BASE_URL: 'http://localhost:3000',
          },
        })
      ).rejects.toThrow(/Production readiness validation failed for environment 'production'/);
    });

    it('fails staging app creation when ProductionReadinessValidator reports blockers', async () => {
      await expect(
        createApiApp({
          resetCache: true,
          env: {
            ...validProdEnv,
            NODE_ENV: 'staging',
            API_BASE_URL: 'http://localhost:3000',
          },
        })
      ).rejects.toThrow(/Production readiness validation failed for environment 'staging'/);
    });

    it('includes blocker codes and area in startup error without leaking secrets', async () => {
      const secretToHide = 'my-super-secret-jwt-key-that-should-never-be-leaked-32-chars';
      try {
        await createApiApp({
          resetCache: true,
          env: {
            ...validProdEnv,
            JWT_SECRET: secretToHide,
            API_BASE_URL: 'http://localhost:3000',
          },
        });
        expect.fail('Should have thrown startup error');
      } catch (err: any) {
        expect(err.message).toContain('Production readiness validation failed');
        expect(err.message).toContain('[api.https_base_url_required]');
        expect(err.message).not.toContain(secretToHide);
      }
    });

    it('fails production app creation when SESSION_SECRET is missing', async () => {
      const { SESSION_SECRET, ...envWithoutSessionSecret } = validProdEnv;
      await expect(
        createApiApp({
          resetCache: true,
          env: envWithoutSessionSecret as any,
        })
      ).rejects.toThrow(/SESSION_SECRET is required in production\/staging/);
    });

    it('fails production app creation when CSRF_SECRET is missing', async () => {
      const { CSRF_SECRET, ...envWithoutCsrfSecret } = validProdEnv;
      await expect(
        createApiApp({
          resetCache: true,
          env: envWithoutCsrfSecret as any,
        })
      ).rejects.toThrow(/CSRF_SECRET is required in production\/staging/);
    });

    it('fails production app creation when CORS_ORIGIN is wildcard *', async () => {
      await expect(
        createApiApp({
          resetCache: true,
          env: {
            ...validProdEnv,
            CORS_ORIGIN: '*',
          },
        })
      ).rejects.toThrow(/CORS_ORIGIN/);
    });

    it('remains usable in development environment even with stub services', async () => {
      const app = await createApiApp({
        resetCache: true,
        env: { NODE_ENV: 'development' },
        securityService: new StubSecurityService(),
        rateLimiter: new StubRateLimiter(),
      });

      expect(app).toBeDefined();
    });
  });

  describe('Admin Production Guard Behavior', () => {
    it('resolves strict mode in every environment and rejects legacy modes', () => {
      expect(SecurityMiddlewareFactory.resolveAdminAuthMode({ NODE_ENV: 'production', ADMIN_AUTH_MODE: 'strict' })).toBe('strict');
      expect(SecurityMiddlewareFactory.resolveAdminAuthMode({ NODE_ENV: 'development' })).toBe('strict');
      expect(SecurityMiddlewareFactory.resolveAdminAuthMode({ NODE_ENV: 'development', ADMIN_AUTH_MODE: 'strict' })).toBe('strict');
      expect(() => SecurityMiddlewareFactory.resolveAdminAuthMode({ NODE_ENV: 'development', ADMIN_AUTH_MODE: 'demo' })).toThrow(/unsupported/i);
    });
  });
});
