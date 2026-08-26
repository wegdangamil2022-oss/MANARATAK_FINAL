import { describe, it, expect } from 'vitest';
import { loadAppConfig, AppConfigSchema } from '../src/AppConfig';

describe('AppConfig', () => {
  it('parses valid config successfully in development', () => {
    const validEnv = {
      NODE_ENV: 'development',
      PORT: '4000',
      DATABASE_URL: 'postgres://localhost/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'this-is-a-very-long-secret-key-that-is-at-least-32-chars',
      OTEL_SERVICE_NAME: 'test-service'
    };
    
    const config = loadAppConfig(validEnv);
    expect(config.PORT).toBe(4000);
    expect(config.NODE_ENV).toBe('development');
    expect(config.DATABASE_URL).toBe('postgres://localhost/db');
    expect(config.REDIS_URL).toBe('redis://localhost:6379');
  });

  it('development/test config loads successfully with safe local defaults when omitted', () => {
    const config = loadAppConfig({
      NODE_ENV: 'development',
    });

    expect(config.DATABASE_URL).toBe('postgresql://postgres:postgres@localhost:5432/manaratak_dev');
    expect(config.REDIS_URL).toBe('redis://localhost:6379');
    expect(config.JWT_SECRET).toContain('dev-secret');
    expect(config.ADMIN_AUTH_MODE).toBe('strict');
  });

  it('fails in production when critical variables are missing', () => {
    const invalidProductionEnv = {
      NODE_ENV: 'production',
      PORT: '4000'
    };
    
    expect(() => loadAppConfig(invalidProductionEnv)).toThrowError(/DATABASE_URL is required/);
    expect(() => loadAppConfig(invalidProductionEnv)).toThrowError(/JWT_SECRET is required/);
    expect(() => loadAppConfig(invalidProductionEnv)).toThrowError(/SESSION_SECRET is required/);
    expect(() => loadAppConfig(invalidProductionEnv)).toThrowError(/CSRF_SECRET is required/);
    expect(() => loadAppConfig(invalidProductionEnv)).toThrowError(/CORS_ORIGIN is required/);
  });

  it('fails in production with local SQLite database URL', () => {
    const prodEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./dev.db',
      JWT_SECRET: 'production-jwt-secret-at-least-32-chars-long-secure-token',
      SESSION_SECRET: 'production-session-secret-at-least-32-chars-long-secure-token',
      CSRF_SECRET: 'production-csrf-secret-at-least-32-chars-long-secure-token',
      CORS_ORIGIN: 'https://app.manaratak.com',
      ADMIN_AUTH_MODE: 'strict'
    };

    expect(() => loadAppConfig(prodEnv)).toThrowError(/Local SQLite DATABASE_URL is strictly forbidden/);
  });

  it('fails in production with wildcard CORS origin', () => {
    const prodEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@prod-db:5432/manaratak',
      JWT_SECRET: 'production-jwt-secret-at-least-32-chars-long-secure-token',
      SESSION_SECRET: 'production-session-secret-at-least-32-chars-long-secure-token',
      CSRF_SECRET: 'production-csrf-secret-at-least-32-chars-long-secure-token',
      CORS_ORIGIN: '*',
      ADMIN_AUTH_MODE: 'strict'
    };

    expect(() => loadAppConfig(prodEnv)).toThrowError(/CORS_ORIGIN cannot be wildcard/);
  });

  it('fails in production with known weak or default secrets', () => {
    const prodEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@prod-db:5432/manaratak',
      JWT_SECRET: 'dev-secret-at-least-32-characters-long-manaratak-key-phrase',
      SESSION_SECRET: 'manaratak-session-secret-must-be-changed-in-prod-long',
      CSRF_SECRET: 'manaratak-default-csrf-secret-must-be-changed-in-prod-long',
      CORS_ORIGIN: 'https://app.manaratak.com',
      ADMIN_AUTH_MODE: 'strict'
    };

    expect(() => loadAppConfig(prodEnv)).toThrowError(/insecure default/);
  });

  it('requires REDIS_URL in production for distributed rate limiting', () => {
    const validProdEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@prod-db:5432/manaratak',
      JWT_SECRET: 'a-very-secure-production-jwt-secret-key-32chars',
      SESSION_SECRET: 'a-very-secure-production-session-secret-32chars',
      CSRF_SECRET: 'a-very-secure-production-csrf-secret-key-32chars',
      CORS_ORIGIN: 'https://app.manaratak.com',
      ADMIN_AUTH_MODE: 'strict'
    };

    expect(() => loadAppConfig(validProdEnv)).toThrowError(/REDIS_URL is required/);
  });

  it('parses PORT as number', () => {
    const result = AppConfigSchema.safeParse({
      NODE_ENV: 'test',
      DATABASE_URL: 'test',
      REDIS_URL: 'test',
      JWT_SECRET: 'test',
      OTEL_SERVICE_NAME: 'test',
      PORT: '8080'
    });
    if (result.success) {
      expect(typeof result.data.PORT).toBe('number');
      expect(result.data.PORT).toBe(8080);
    } else {
      throw new Error('Parsing failed: ' + JSON.stringify(result.error.issues));
    }
  });

  it('validates NODE_ENV', () => {
    const result = AppConfigSchema.safeParse({
      DATABASE_URL: 'test',
      REDIS_URL: 'test',
      JWT_SECRET: 'test',
      OTEL_SERVICE_NAME: 'test',
      NODE_ENV: 'invalid_env'
    });
    expect(result.success).toBe(false);
  });

  it('allows short JWT_SECRET in test environment', () => {
    const validEnv = {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'short-secret',
      OTEL_SERVICE_NAME: 'test-service'
    };
    
    const config = loadAppConfig(validEnv);
    expect(config.JWT_SECRET).toBe('short-secret');
  });

  it('fails with short JWT_SECRET in development environment', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgres://localhost/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'short-secret',
      OTEL_SERVICE_NAME: 'test-service'
    };
    
    expect(() => loadAppConfig(invalidEnv)).toThrowError(/JWT_SECRET must be at least 32 characters/);
  });

  it('defaults admin auth mode to strict in every environment', () => {
    const config = loadAppConfig({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'short-secret',
      OTEL_SERVICE_NAME: 'test-service'
    });

    expect(config.ADMIN_AUTH_MODE).toBe('strict');
  });

  it('requires strict admin auth mode in production', () => {
    expect(() => loadAppConfig({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgres://localhost/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'this-is-a-very-long-secret-key-that-is-at-least-32-chars',
      OTEL_SERVICE_NAME: 'test-service',
      ADMIN_AUTH_MODE: 'demo'
    })).toThrowError(/ADMIN_AUTH_MODE: Invalid input: expected "strict"/);
  });

  it('loads strict admin auth without a static bearer token', () => {
    const config = loadAppConfig({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'short-secret',
      OTEL_SERVICE_NAME: 'test-service',
      ADMIN_AUTH_MODE: 'strict'
    });
    expect(config.ADMIN_AUTH_MODE).toBe('strict');
  });
});
