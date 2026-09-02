import { describe, expect, it } from 'vitest';
import { ProductionReadinessValidator } from '../src/ProductionReadinessValidator';

const productionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://manaratak:strong-db-secret@db.manaratak.internal:5432/manaratak?schema=public',
  REDIS_URL: 'redis://:strong-redis-secret@redis.manaratak.internal:6379',
  JWT_SECRET: 'production-jwt-secret-with-safe-entropy-123456',
  JWT_ISSUER: 'manaratak-production-api',
  JWT_AUDIENCE: 'manaratak-production-browser',
  SESSION_SECRET: 'production-session-secret-with-safe-entropy-123456',
  OTEL_SERVICE_NAME: 'manaratak-api',
  CORS_ORIGIN: 'https://www.manaratak.com',
  API_BASE_URL: 'https://api.manaratak.com',
  ADMIN_AUTH_MODE: 'strict',
  SECURE_COOKIE: 'true',
  SECURITY_CSP_ENABLED: 'true',
  SECURITY_RATE_LIMIT_MAX: '100',
  TRUST_PROXY_HOPS: '1',
  LOG_LEVEL: 'info'
};

describe('ProductionReadinessValidator', () => {
  it('marks a hardened production environment as ready', () => {
    const report = ProductionReadinessValidator.validate(productionEnv);

    expect(report.ready).toBe(true);
    expect(report.blockerCount).toBe(0);
  });

  it('blocks production when admin access remains in demo mode', () => {
    const report = ProductionReadinessValidator.validate({
      ...productionEnv,
      ADMIN_AUTH_MODE: 'demo'
    });

    expect(report.ready).toBe(false);
    expect(report.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'admin.strict_mode_required', severity: 'BLOCKER' })
    ]));
  });

  it('blocks production when local service URLs are used', () => {
    const report = ProductionReadinessValidator.validate({
      ...productionEnv,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/manaratak_dev?schema=public',
      REDIS_URL: 'redis://localhost:6379',
      API_BASE_URL: 'http://localhost:3000',
      CORS_ORIGIN: 'http://localhost:5173'
    });

    expect(report.ready).toBe(false);
    expect(report.findings.map(finding => finding.id)).toEqual(expect.arrayContaining([
      'database.production_url',
      'redis.production_url',
      'api.https_base_url_required',
      'cors.production_origin_required'
    ]));
  });

  it('blocks production when secrets are weak or placeholders', () => {
    const report = ProductionReadinessValidator.validate({
      ...productionEnv,
      JWT_SECRET: 'change-me-in-local-env-change-me-secret'
    });

    expect(report.ready).toBe(false);
    expect(report.findings.map(finding => finding.id)).toEqual(expect.arrayContaining([
      'auth.jwt_secret_weak'
    ]));
  });

  it('blocks production when CSP is disabled and reports remaining warnings', () => {
    const report = ProductionReadinessValidator.validate({
      ...productionEnv,
      SECURITY_CSP_ENABLED: 'false',
      SECURITY_RATE_LIMIT_MAX: '5000',
      LOG_LEVEL: 'debug'
    });

    expect(report.ready).toBe(false);
    expect(report.warningCount).toBe(2);
    expect(report.findings.map(finding => finding.id)).toEqual(expect.arrayContaining([
      'security.csp_disabled',
      'security.rate_limit_not_baselined',
      'observability.verbose_logging'
    ]));
  });

  it('blocks production when JWT claims or trusted proxy bounds are missing', () => {
    const report = ProductionReadinessValidator.validate({
      ...productionEnv,
      JWT_ISSUER: undefined,
      TRUST_PROXY_HOPS: undefined,
    });
    expect(report.ready).toBe(false);
    expect(report.findings.map((finding) => finding.id)).toEqual(expect.arrayContaining([
      'auth.jwt_claims_unconfigured',
      'security.trust_proxy_unconfigured',
    ]));
  });

  it('does not block local development mode', () => {
    const report = ProductionReadinessValidator.validate({
      NODE_ENV: 'development',
      JWT_SECRET: 'change-me-in-local-env',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/manaratak_dev?schema=public',
      REDIS_URL: 'redis://localhost:6379'
    });

    expect(report.ready).toBe(true);
    expect(report.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'runtime.non_production_mode', severity: 'INFO' })
    ]));
  });
});
