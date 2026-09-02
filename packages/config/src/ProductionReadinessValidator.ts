export type ProductionReadinessSeverity = 'BLOCKER' | 'WARNING' | 'INFO';

export interface ProductionReadinessFinding {
  readonly id: string;
  readonly severity: ProductionReadinessSeverity;
  readonly area: string;
  readonly message: string;
  readonly recommendation: string;
}

export interface ProductionReadinessReport {
  readonly ready: boolean;
  readonly blockerCount: number;
  readonly warningCount: number;
  readonly checkedAt: string;
  readonly findings: readonly ProductionReadinessFinding[];
}

type RuntimeEnv = Record<string, string | undefined>;

export class ProductionReadinessValidator {
  public static validate(env: RuntimeEnv = process.env): ProductionReadinessReport {
    const findings: ProductionReadinessFinding[] = [];
    const isProduction = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';

    if (!isProduction) {
      findings.push({
        id: 'runtime.non_production_mode',
        severity: 'INFO',
        area: 'Runtime',
        message: 'Runtime is not configured as production or staging.',
        recommendation: 'Set NODE_ENV=production or staging only in deployment environments.'
      });
    }

    this.validateAdminAccess(env, findings, isProduction);
    this.validateSecrets(env, findings, isProduction);
    this.validateUrls(env, findings, isProduction);
    this.validateSecurityControls(env, findings, isProduction);
    this.validateObservability(env, findings, isProduction);

    const blockerCount = findings.filter(finding => finding.severity === 'BLOCKER').length;
    const warningCount = findings.filter(finding => finding.severity === 'WARNING').length;

    return Object.freeze({
      ready: blockerCount === 0,
      blockerCount,
      warningCount,
      checkedAt: new Date().toISOString(),
      findings: Object.freeze(findings)
    });
  }

  private static validateAdminAccess(env: RuntimeEnv, findings: ProductionReadinessFinding[], isProduction: boolean): void {
    if (isProduction && env.ADMIN_AUTH_MODE !== 'strict') {
      findings.push({
        id: 'admin.strict_mode_required',
        severity: 'BLOCKER',
        area: 'Admin Security',
        message: 'Production admin access is not using strict mode.',
        recommendation: 'Set ADMIN_AUTH_MODE=strict and use authenticated identities with persisted RBAC assignments.'
      });
    }
  }

  private static validateSecrets(env: RuntimeEnv, findings: ProductionReadinessFinding[], isProduction: boolean): void {
    if (isProduction && !this.isStrongSecret(env.JWT_SECRET)) {
      findings.push({
        id: 'auth.jwt_secret_weak',
        severity: 'BLOCKER',
        area: 'Authentication',
        message: 'JWT_SECRET is missing, weak, or looks like a placeholder.',
        recommendation: 'Use a deployment-managed JWT_SECRET with at least 32 high-entropy characters.'
      });
    }
    if (isProduction && !this.isStrongSecret(env.SESSION_SECRET)) {
      findings.push({
        id: 'auth.session_secret_weak',
        severity: 'BLOCKER',
        area: 'Authentication',
        message: 'SESSION_SECRET is missing, weak, or looks like a placeholder.',
        recommendation: 'Use a deployment-managed SESSION_SECRET with at least 32 high-entropy characters.'
      });
    }
    if (isProduction && env.SECURE_COOKIE !== 'true') {
      findings.push({
        id: 'auth.insecure_cookie',
        severity: 'BLOCKER',
        area: 'Authentication',
        message: 'SECURE_COOKIE must be enabled in production.',
        recommendation: 'Set SECURE_COOKIE=true to ensure sessions are only transmitted over HTTPS.'
      });
    }
    if (isProduction && (!this.isStableIdentifier(env.JWT_ISSUER) || !this.isStableIdentifier(env.JWT_AUDIENCE))) {
      findings.push({
        id: 'auth.jwt_claims_unconfigured',
        severity: 'BLOCKER',
        area: 'Authentication',
        message: 'JWT issuer and audience must be explicitly configured in production.',
        recommendation: 'Set stable deployment values for JWT_ISSUER and JWT_AUDIENCE.'
      });
    }
  }

  private static validateUrls(env: RuntimeEnv, findings: ProductionReadinessFinding[], isProduction: boolean): void {
    if (!isProduction) {
      return;
    }

    this.requireNonLocalUrl(env.DATABASE_URL, 'database.production_url', 'Database', 'DATABASE_URL', findings);
    if (!env.REDIS_URL) {
      findings.push({
        id: 'redis.production_url_required',
        severity: 'BLOCKER',
        area: 'Redis',
        message: 'REDIS_URL is required for distributed production rate limiting and runtime state.',
        recommendation: 'Configure a managed Redis endpoint using redis:// or rediss:// before production startup.'
      });
    } else {
      this.requireNonLocalUrl(env.REDIS_URL, 'redis.production_url', 'Redis', 'REDIS_URL', findings);
    }

    if (!this.isHttpsUrl(env.API_BASE_URL)) {
      findings.push({
        id: 'api.https_base_url_required',
        severity: 'BLOCKER',
        area: 'API',
        message: 'API_BASE_URL must be an HTTPS URL in production.',
        recommendation: 'Configure API_BASE_URL with the final public HTTPS API origin.'
      });
    }

    if (!this.isHttpsUrl(env.CORS_ORIGIN) || env.CORS_ORIGIN === '*') {
      findings.push({
        id: 'cors.production_origin_required',
        severity: 'BLOCKER',
        area: 'CORS',
        message: 'CORS_ORIGIN must be a specific HTTPS origin in production.',
        recommendation: 'Configure CORS_ORIGIN with the exact production web origin and never use wildcard access.'
      });
    }
  }

  private static validateSecurityControls(env: RuntimeEnv, findings: ProductionReadinessFinding[], isProduction: boolean): void {
    if (!isProduction) {
      return;
    }

    if (env.SECURITY_CSP_ENABLED !== 'true') {
      findings.push({
        id: 'security.csp_disabled',
        severity: 'BLOCKER',
        area: 'HTTP Security',
        message: 'Content Security Policy is not explicitly enabled.',
        recommendation: 'Set SECURITY_CSP_ENABLED=true before public production launch.'
      });
    }

    const trustProxyHops = Number(env.TRUST_PROXY_HOPS);
    if (!Number.isInteger(trustProxyHops) || trustProxyHops < 1 || trustProxyHops > 3) {
      findings.push({
        id: 'security.trust_proxy_unconfigured',
        severity: 'BLOCKER',
        area: 'HTTP Security',
        message: 'Trusted reverse-proxy hops are not explicitly bounded.',
        recommendation: 'Set TRUST_PROXY_HOPS to the exact number of managed proxy hops (1-3).'
      });
    }

    const rateLimitMax = Number(env.SECURITY_RATE_LIMIT_MAX);
    if (!Number.isFinite(rateLimitMax) || rateLimitMax <= 0 || rateLimitMax > 1000) {
      findings.push({
        id: 'security.rate_limit_not_baselined',
        severity: 'WARNING',
        area: 'HTTP Security',
        message: 'Rate limit maximum is missing or too permissive.',
        recommendation: 'Set SECURITY_RATE_LIMIT_MAX to a bounded production value based on traffic expectations.'
      });
    }
  }

  private static validateObservability(env: RuntimeEnv, findings: ProductionReadinessFinding[], isProduction: boolean): void {
    if (!isProduction) {
      return;
    }

    if (!env.OTEL_SERVICE_NAME) {
      findings.push({
        id: 'observability.service_name_missing',
        severity: 'WARNING',
        area: 'Observability',
        message: 'OTEL_SERVICE_NAME is not configured.',
        recommendation: 'Set OTEL_SERVICE_NAME to a stable service name for traces and metrics.'
      });
    }

    if (env.LOG_LEVEL === 'trace' || env.LOG_LEVEL === 'debug') {
      findings.push({
        id: 'observability.verbose_logging',
        severity: 'WARNING',
        area: 'Observability',
        message: 'Verbose logging is enabled in production.',
        recommendation: 'Use LOG_LEVEL=info, warn, or error for production deployments.'
      });
    }
  }

  private static requireNonLocalUrl(
    value: string | undefined,
    id: string,
    area: string,
    variableName: string,
    findings: ProductionReadinessFinding[]
  ): void {
    if (!value || this.isLocalOrPlaceholderUrl(value)) {
      findings.push({
        id,
        severity: 'BLOCKER',
        area,
        message: `${variableName} is missing or points to a local/placeholder endpoint.`,
        recommendation: `Configure ${variableName} from the production secret manager or managed service connection settings.`
      });
    }
  }

  private static isStrongSecret(value: string | undefined): boolean {
    if (!value || value.length < 32) {
      return false;
    }

    const lowerValue = value.toLowerCase();
    return !['change-me', 'placeholder', 'password', 'local-env', 'demo-token'].some(token => lowerValue.includes(token));
  }

  private static isHttpsUrl(value: string | undefined): boolean {
    if (!value) {
      return false;
    }

    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }

  private static isStableIdentifier(value: string | undefined): boolean {
    return Boolean(value && value.length >= 3 && !/(?:change-me|placeholder|example)/i.test(value));
  }

  private static isLocalOrPlaceholderUrl(value: string): boolean {
    const lowerValue = value.toLowerCase();
    if (['localhost', '127.0.0.1', '0.0.0.0', 'user:password', 'example.com'].some(token => lowerValue.includes(token))) {
      return true;
    }

    try {
      const parsedUrl = new URL(value);
      return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname);
    } catch {
      return true;
    }
  }
}
