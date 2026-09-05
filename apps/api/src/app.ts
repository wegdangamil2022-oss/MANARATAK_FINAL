import * as awilix from 'awilix';
import express, { Router, Express, Request, Response } from 'express';
import * as path from 'path';
import { container, registerDependencies } from './infrastructure/di/container.js';
import { assertAssetSecurityProvidersForRuntime, createRateLimiterForRuntime, isDatabaseRequiredForRuntime } from './infrastructure/di/RuntimeDependencyPolicy.js';
import { 
  PrismaConnection,
  AsyncLogContext,
  PinoLoggerProvider,
  LoggerService,
  RequestLogger,
  ErrorLogger,
  DefaultErrorSerializer,
  ZodValidationProvider,
  DefaultSanitizer,
  ValidationService,
  MonitoringService,
  SecurityService,
  DatabaseHealthChecker,
  RedisClientFactory,
  RedisHealthChecker
} from '@manaratak/infrastructure';
import { ConfigurationRegistry, EnvironmentLoader, EnvironmentConfigurationProvider, ProductionReadinessValidator, ZodEnvironmentValidator } from '@manaratak/config';
import { IConfigurationService, ILogger, IValidationService, ISecurityService, IMonitoringService, IRateLimiter, ITokenProvider, ISessionManager, HealthStatus } from '@manaratak/core';

class AppSecurityService extends SecurityService implements ISecurityService {}

class AppMonitoringService extends MonitoringService implements IMonitoringService {}
import { LoggingMiddleware } from './presentation/middleware/LoggingMiddleware.js';
import { GlobalExceptionHandler } from './presentation/middleware/GlobalExceptionHandler.js';
import { DtoValidationMiddleware } from './presentation/validation/DtoValidationMiddleware.js';
import { ApiRouter } from './presentation/api/router/ApiRouter.js';
import { ResponseFormatter } from './presentation/api/response/ResponseFormatter.js';
import { MonitoringRouter } from './presentation/api/router/MonitoringRouter.js';
import { MonitoringMiddleware } from './presentation/monitoring/MonitoringMiddleware.js';
import { SecurityMiddlewareFactory } from './presentation/security/SecurityMiddlewareFactory.js';
import { SecurityValidator } from './presentation/security/SecurityValidator.js';
import { MutationAuditMiddleware } from './presentation/audit/MutationAuditMiddleware.js';

export interface CreateApiAppOptions {
  securityService?: ISecurityService;
  rateLimiter?: IRateLimiter;
  monitoringService?: IMonitoringService;
  env?: Record<string, string | undefined>;
  resetCache?: boolean;
}

let appInstance: Express | null = null;
let isBootstrapping = false;
let bootstrapPromise: Promise<Express> | null = null;

export async function createApiApp(options?: CreateApiAppOptions): Promise<Express> {
  if (options?.resetCache || options?.env) {
    appInstance = null;
    bootstrapPromise = null;
    ConfigurationRegistry._reset();
  }

  if (appInstance) {
    return appInstance;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    try {
      const currentEnv: Record<string, string | undefined> = { ...(options?.env ?? process.env) };

      let url = currentEnv.DATABASE_URL;
      if (!url || url.includes('postgres-host') || url.includes('placeholder')) {
        const { SQL_USER, SQL_PASSWORD, SQL_HOST, SQL_DB_NAME } = currentEnv;
        if (SQL_USER && SQL_PASSWORD && SQL_HOST && SQL_DB_NAME) {
          const encodedPassword = encodeURIComponent(SQL_PASSWORD);
          url = `postgresql://${SQL_USER}:${encodedPassword}@localhost/${SQL_DB_NAME}?host=${SQL_HOST}`;
          currentEnv.DATABASE_URL = url;
        }
      }

      // Bootstrap Configuration First
      let config: IConfigurationService;
      try {
        config = ConfigurationRegistry.getInstance();
      } catch {
        const envProvider = new EnvironmentConfigurationProvider(currentEnv);
        const loader = new EnvironmentLoader([envProvider]);
        config = await ConfigurationRegistry.bootstrap(loader, new ZodEnvironmentValidator());
      }
      const productionReadinessReport = ProductionReadinessValidator.validate(currentEnv);

      const nodeEnv = config.getOptional<string>('NODE_ENV') || currentEnv.NODE_ENV;
      const isProductionOrStaging = nodeEnv === 'production' || nodeEnv === 'staging';
      const databaseRequired = isDatabaseRequiredForRuntime(currentEnv);

      if (isProductionOrStaging && (!productionReadinessReport.ready || productionReadinessReport.blockerCount > 0)) {
        const blockerDetails = productionReadinessReport.findings
          .filter(f => f.severity === 'BLOCKER')
          .map(f => `[${f.id}] ${f.area}: ${f.message}`)
          .join('; ');

        throw new Error(
          `Production readiness validation failed for environment '${nodeEnv}'. ` +
          `Found ${productionReadinessReport.blockerCount} blocker(s): ${blockerDetails}`
        );
      }

      // Bootstrap Logging
      const logContext = new AsyncLogContext();
      const pinoProvider = new PinoLoggerProvider({
        level: config.getOptional<string>('LOG_LEVEL') || currentEnv.LOG_LEVEL || 'info',
      });
      const logger = new LoggerService(pinoProvider, logContext, config);

      const requestLogger = new RequestLogger(logger, logContext);
      const errorLogger = new ErrorLogger(logger, logContext);

      // Bootstrap Error Handling
      const errorSerializer = new DefaultErrorSerializer();
      const exceptionHandler = new GlobalExceptionHandler(logger, logContext, errorSerializer);

      // Bootstrap Validation
      const validationProvider = new ZodValidationProvider();
      const inputSanitizer = new DefaultSanitizer();
      const validationService = new ValidationService(validationProvider, inputSanitizer);
      const dtoValidationMiddleware = new DtoValidationMiddleware(validationService);

      // Bootstrap Monitoring
      const monitoringService = options?.monitoringService || new AppMonitoringService(undefined);

      // Bootstrap Security
      const rateLimiter = options?.rateLimiter || createRateLimiterForRuntime(currentEnv, logger);
      const securityService = options?.securityService || new AppSecurityService(rateLimiter);

      // Assert Production Security Guardrails
      SecurityValidator.assertProductionSecurity(currentEnv, securityService, rateLimiter);

    // Bootstrap API
    const apiRouter = new ApiRouter();
    const app = express();
    const trustProxyHops = Number(config.getOptional<string>('TRUST_PROXY_HOPS') || currentEnv.TRUST_PROXY_HOPS || 0);
    if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

    // Security Configuration
    const cspEnabled = config.getOptional<string>('SECURITY_CSP_ENABLED') === 'true';
    const corsOrigins = config.getOptional<string>('CORS_ORIGIN') 
      ? [config.getOptional<string>('CORS_ORIGIN')!] 
      : config.getOptional<string>('SECURITY_CORS_ORIGINS')?.split(',') || ['http://localhost:3000'];
    const rateLimitMax = parseInt(config.getOptional<string>('SECURITY_RATE_LIMIT_MAX') || '100', 10);
    const rateLimitWindow = parseInt(config.getOptional<string>('SECURITY_RATE_LIMIT_WINDOW_MS') || '60000', 10);
    const adminAuthMode = SecurityMiddlewareFactory.resolveAdminAuthMode({
      NODE_ENV: config.getOptional<string>('NODE_ENV') || currentEnv.NODE_ENV,
      ADMIN_AUTH_MODE: config.getOptional<string>('ADMIN_AUTH_MODE') || currentEnv.ADMIN_AUTH_MODE,
    });
    // Security Middleware
    app.use(SecurityMiddlewareFactory.createSecurityHeaders({ enabled: cspEnabled }));
    app.use(SecurityMiddlewareFactory.createCors({ allowedOrigins: corsOrigins }));

    // Logging Middleware (Establishes AsyncLogContext early for all request phases)
    const loggingMiddleware = new LoggingMiddleware(logContext, requestLogger);
    app.use(loggingMiddleware.generate());

    app.use(SecurityMiddlewareFactory.createRateLimiter(securityService, { limit: rateLimitMax, windowMs: rateLimitWindow }));
    app.use(express.json({ limit: '256kb', strict: true }));
    app.use(SecurityMiddlewareFactory.createCsrfGuard(securityService));

    // Monitoring Middleware
    const monitoringMiddleware = new MonitoringMiddleware(monitoringService);
    app.use(monitoringMiddleware.generate());

    // Register DI Dependencies
    registerDependencies(currentEnv, config);
    container.register({ 
      monitoringService: awilix.asValue(monitoringService),
      securityService: awilix.asValue(securityService)
    });

    const describeRuntimeCapability = (provider: any): string => {
      if (!provider) return 'UNAVAILABLE';
      if (typeof provider.capabilityStatus === 'string') return provider.capabilityStatus;
      if (provider.isProductionReady === true) return 'PRODUCTION_CAPABLE';
      if (typeof provider.persistenceClassification === 'string') return provider.persistenceClassification;
      const name = String(provider.constructor?.name || '');
      if (/^Local|InMemory|Noop/i.test(name)) return 'LOCAL_ONLY';
      return 'CONFIGURED';
    };

    const assetRuntimeProviders = {
      storage: container.resolve<any>('assetStorageGateway'),
      malwareScanner: container.resolve<any>('assetMalwareScannerGateway'),
      sanitizer: container.resolve<any>('assetSanitizationGateway'),
    };

    // Production-like runtimes must never start with the deliberately unavailable
    // local/no-op asset security composition. This check happens before any DB connect.
    assertAssetSecurityProvidersForRuntime(currentEnv, assetRuntimeProviders);

    // Establish Database Connection if available
    if (databaseRequired && !currentEnv.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for this runtime mode');
    }
    const databaseUrl = config.getOptional<string>('DATABASE_URL') || currentEnv.DATABASE_URL;
    if (databaseUrl) {
      try {
        await PrismaConnection.connect(config, logger);
        const dbHealthChecker = new DatabaseHealthChecker(PrismaConnection.getInstance());
        monitoringService.registerIndicator({
          name: 'database',
          isOptional: false,
          checkHealth: async () => {
            return await dbHealthChecker.checkHealth();
          }
        });
      } catch (error: any) {
        logger.error("[Database] Could not connect to Prisma instance", error);
        if (databaseRequired) throw error;
        monitoringService.registerIndicator({
          name: 'database',
          isOptional: false,
          checkHealth: async () => ({
            status: HealthStatus.DOWN,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Database connection failed'
          })
        });
      }
    } else {
      if (databaseRequired) throw new Error('DATABASE_URL is required for this runtime mode');
      monitoringService.registerIndicator({
        name: 'database',
        isOptional: false,
        checkHealth: async () => ({
          status: HealthStatus.DOWN,
          timestamp: new Date().toISOString(),
          error: 'DATABASE_URL is not configured'
        })
      });
    }

    monitoringService.registerIndicator({
      name: 'database-schema',
      isOptional: !isProductionOrStaging,
      checkHealth: async () => {
        try {
          const prisma = PrismaConnection.getInstance() as any;
          const rows = await prisma.$queryRawUnsafe(
            'SELECT COUNT(*)::int AS "failedCount" FROM "_prisma_migrations" WHERE "finished_at" IS NULL AND "rolled_back_at" IS NULL',
          );
          const failedCount = Number(Array.isArray(rows) ? rows[0]?.failedCount ?? 0 : 0);
          const healthy = failedCount === 0;
          return {
            status: healthy ? HealthStatus.UP : (isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED),
            timestamp: new Date().toISOString(),
            ...(!healthy ? { error: 'DATABASE_MIGRATION_HISTORY_HAS_INCOMPLETE_ENTRIES' } : {}),
            details: {
              capabilityStatus: healthy ? 'APPLIED_HISTORY_HEALTHY' : 'INCOMPLETE_MIGRATION_HISTORY',
              failedOrIncompleteMigrations: failedCount,
              scope: 'APPLIED_MIGRATION_HISTORY_ONLY',
            },
          };
        } catch (error: any) {
          return {
            status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED,
            timestamp: new Date().toISOString(),
            error: error?.message || 'DATABASE_MIGRATION_HISTORY_UNAVAILABLE',
            details: {
              capabilityStatus: 'MIGRATION_HISTORY_UNAVAILABLE',
              scope: 'APPLIED_MIGRATION_HISTORY_ONLY',
            },
          };
        }
      },
    });

    monitoringService.registerIndicator({
      name: 'asset-platform',
      isOptional: !isProductionOrStaging,
      checkHealth: async () => {
        const capabilities = {
          storage: describeRuntimeCapability(assetRuntimeProviders.storage),
          malwareScanner: describeRuntimeCapability(assetRuntimeProviders.malwareScanner),
          sanitizer: describeRuntimeCapability(assetRuntimeProviders.sanitizer),
        };
        const unavailable = Object.values(capabilities).some((value) =>
          ['UNAVAILABLE', 'NOT_CONFIGURED', 'LOCAL_ONLY'].includes(value),
        );
        return {
          status: unavailable
            ? (isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED)
            : HealthStatus.UP,
          timestamp: new Date().toISOString(),
          ...(unavailable ? { error: 'ASSET_RUNTIME_CAPABILITY_GAP' } : {}),
          details: {
            capabilityStatus: unavailable ? (isProductionOrStaging ? 'UNAVAILABLE' : 'DEVELOPMENT_ONLY') : 'AVAILABLE',
            ...capabilities,
          },
        };
      },
    });

    // Register Redis Health Indicator if available
    const redisUrl = config.getOptional<string>('REDIS_URL') || currentEnv.REDIS_URL;
    if (redisUrl) {
      try {
        const redisClient = RedisClientFactory.createClient(config, logger);
        const redisHealthChecker = new RedisHealthChecker(redisClient);
        
        monitoringService.registerIndicator({
          name: 'redis',
          isOptional: !isProductionOrStaging,
          checkHealth: async () => {
            return await redisHealthChecker.checkHealth();
          }
        });
      } catch (error: any) {
        if (currentEnv.NODE_ENV === 'production' || currentEnv.NODE_ENV === 'staging') {
          logger.fatal("[Redis] Production environment requires Redis for runtime state, but initialization failed.", error);
          throw new Error('Redis initialization failed in production environment: ' + (error?.message || 'Unknown error'));
        }
        
        logger.error("[Redis] Failed to initialize Redis client", error);
        monitoringService.registerIndicator({
          name: 'redis',
          isOptional: true,
          checkHealth: async () => ({
            status: HealthStatus.DEGRADED,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Redis client initialization failed'
          })
        });
      }
    } else {
      monitoringService.registerIndicator({
        name: 'redis',
        isOptional: !isProductionOrStaging,
        checkHealth: async () => ({
          status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED,
          timestamp: new Date().toISOString(),
          error: 'REDIS_NOT_CONFIGURED',
          details: { capabilityStatus: 'NOT_CONFIGURED' }
        })
      });
    }

    // Operational capability probes used by the Health & Readiness control plane.
    // These probes expose configuration/capability state only; they never return secrets.
    const importQueueGateway = container.resolve<any>('importQueueGateway');
    const importRawSnapshotStore = container.resolve<any>('importRawSnapshotStore');
    const sourceRegistryGateway = container.resolve<any>('sourceRegistryGateway');
    monitoringService.registerIndicator({
      name: 'import-foundation',
      isOptional: !isProductionOrStaging,
      checkHealth: async () => {
        const queuePersistence = String(importQueueGateway?.persistenceClassification || describeRuntimeCapability(importQueueGateway));
        const snapshotCapability = describeRuntimeCapability(importRawSnapshotStore);
        const sourceRegistryCapability = describeRuntimeCapability(sourceRegistryGateway);
        const durableQueue = queuePersistence === 'DURABLE';
        const durableSnapshot = !['UNAVAILABLE', 'NOT_CONFIGURED', 'LOCAL_ONLY'].includes(snapshotCapability);
        const productionReady = durableQueue && durableSnapshot;
        const developmentOnly = !durableQueue || snapshotCapability === 'LOCAL_ONLY' || sourceRegistryCapability === 'LOCAL_ONLY';

        return {
          status: isProductionOrStaging
            ? (productionReady ? HealthStatus.UP : HealthStatus.DOWN)
            : (developmentOnly ? HealthStatus.DEGRADED : HealthStatus.UP),
          timestamp: new Date().toISOString(),
          ...((isProductionOrStaging && !productionReady) ? { error: 'IMPORT_RUNTIME_NOT_PRODUCTION_READY' } : {}),
          details: {
            capabilityStatus: productionReady ? 'AVAILABLE' : (developmentOnly ? 'DEVELOPMENT_ONLY' : 'NOT_CONFIGURED'),
            queuePersistence,
            snapshotCapability,
            sourceRegistryCapability,
          },
        };
      },
    });

    monitoringService.registerIndicator({
      name: 'admin-auth',
      isOptional: !isProductionOrStaging,
      checkHealth: async () => {
        const strict = adminAuthMode === 'strict';
        return {
          status: strict ? HealthStatus.UP : (isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED),
          timestamp: new Date().toISOString(),
          ...(!strict ? { error: 'ADMIN_AUTH_NOT_STRICT' } : {}),
          details: {
            capabilityStatus: strict ? 'AVAILABLE' : 'DEVELOPMENT_ONLY',
            mode: adminAuthMode,
            sessionPersistence: 'PRISMA',
          },
        };
      },
    });

    monitoringService.registerIndicator({
      name: 'ai-providers',
      isOptional: true,
      checkHealth: async () => {
        const registry = container.resolve<any>('aiProviderRegistry');
        const providers = typeof registry?.list === 'function' ? registry.list() : [];
        const statuses = providers.map((provider: any) =>
          typeof provider?.status === 'function' ? String(provider.status()) : 'NOT_CONFIGURED',
        );
        const ready = statuses.filter((status: string) => status === 'READY').length;
        const runtimePending = statuses.filter((status: string) => status === 'RUNTIME_PENDING').length;
        const degraded = statuses.filter((status: string) => status === 'DEGRADED').length;
        const unavailable = statuses.filter((status: string) => status === 'UNAVAILABLE').length;
        const notConfigured = statuses.filter((status: string) => status === 'NOT_CONFIGURED').length;
        const capabilityStatus = ready > 0 ? 'AVAILABLE' : runtimePending > 0 ? 'RUNTIME_PENDING' : 'NOT_CONFIGURED';
        return {
          status: ready > 0 ? HealthStatus.UP : HealthStatus.DEGRADED,
          timestamp: new Date().toISOString(),
          ...(ready === 0 ? { error: runtimePending > 0 ? 'AI_PROVIDER_RUNTIME_PENDING' : 'AI_PROVIDER_NOT_CONFIGURED' } : {}),
          details: {
            capabilityStatus,
            providerCount: providers.length,
            ready,
            runtimePending,
            degraded,
            unavailable,
            notConfigured,
          },
        };
      },
    });

    monitoringService.registerIndicator({
      name: 'payment-gateway',
      isOptional: true,
      checkHealth: async () => {
        const providerKey = String(currentEnv.FINANCE_PAYMENT_PROVIDER_KEY || 'PRIMARY_PAYMENT').trim();
        const registry = container.resolve<any>('financePaymentGatewayRegistry');
        const provider = typeof registry?.get === 'function' ? registry.get(providerKey) : null;
        const configured = Boolean(provider && typeof provider.isConfigured === 'function' && provider.isConfigured());
        return {
          // The current environment-backed adapter intentionally has no live transport yet.
          status: HealthStatus.DEGRADED,
          timestamp: new Date().toISOString(),
          error: configured ? 'PAYMENT_RUNTIME_TRANSPORT_PENDING' : 'PAYMENT_PROVIDER_NOT_CONFIGURED',
          details: {
            capabilityStatus: configured ? 'TRANSPORT_PENDING' : 'NOT_CONFIGURED',
            providerConfigured: configured,
          },
        };
      },
    });

    monitoringService.registerIndicator({
      name: 'notifications',
      isOptional: true,
      checkHealth: async () => {
        const intentRepo = container.resolve<any>('notificationIntentRepo');
        const templateRepo = container.resolve<any>('notificationTemplateRepo');
        const preferenceGateway = container.resolve<any>('notificationPrefGateway');
        const capabilities = [
          describeRuntimeCapability(intentRepo),
          describeRuntimeCapability(templateRepo),
          describeRuntimeCapability(preferenceGateway),
        ];
        const available = capabilities.every((status) => !['UNAVAILABLE', 'NOT_CONFIGURED', 'LOCAL_ONLY'].includes(status));
        return {
          status: available ? HealthStatus.UP : HealthStatus.DEGRADED,
          timestamp: new Date().toISOString(),
          ...(!available ? { error: 'NOTIFICATION_RUNTIME_NOT_CONFIGURED' } : {}),
          details: {
            capabilityStatus: available ? 'AVAILABLE' : 'NOT_CONFIGURED',
            persistence: capabilities[0],
            templates: capabilities[1],
            preferences: capabilities[2],
          },
        };
      },
    });

    monitoringService.registerIndicator({
      name: 'background-jobs',
      isOptional: true,
      checkHealth: async () => {
        const repository = container.resolve<any>('bgJobRepo');
        const execution = container.resolve<any>('bgJobGateway');
        const repositoryStatus = describeRuntimeCapability(repository);
        const executionStatus = describeRuntimeCapability(execution);
        const available = !['UNAVAILABLE', 'NOT_CONFIGURED', 'LOCAL_ONLY'].includes(repositoryStatus)
          && !['UNAVAILABLE', 'NOT_CONFIGURED', 'LOCAL_ONLY'].includes(executionStatus);
        return {
          status: available ? HealthStatus.UP : HealthStatus.DEGRADED,
          timestamp: new Date().toISOString(),
          ...(!available ? { error: 'BACKGROUND_JOB_RUNTIME_NOT_CONFIGURED' } : {}),
          details: {
            capabilityStatus: available ? 'AVAILABLE' : 'NOT_CONFIGURED',
            repository: repositoryStatus,
            execution: executionStatus,
          },
        };
      },
    });

    monitoringService.registerIndicator({
      name: 'public-web',
      isOptional: !isProductionOrStaging,
      checkHealth: async () => {
        const target = String(currentEnv.PUBLIC_WEB_URL || currentEnv.CORS_ORIGIN || '').trim();
        if (!target) {
          return {
            status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED,
            timestamp: new Date().toISOString(),
            error: 'PUBLIC_WEB_URL_NOT_CONFIGURED',
            details: { capabilityStatus: 'NOT_CONFIGURED' },
          };
        }

        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return {
            status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED,
            timestamp: new Date().toISOString(),
            error: 'PUBLIC_WEB_URL_INVALID',
            details: { capabilityStatus: 'INVALID_CONFIGURATION' },
          };
        }
        if (!['http:', 'https:'].includes(parsed.protocol) || (isProductionOrStaging && parsed.protocol !== 'https:')) {
          return {
            status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED,
            timestamp: new Date().toISOString(),
            error: 'PUBLIC_WEB_URL_PROTOCOL_NOT_ALLOWED',
            details: { capabilityStatus: 'INVALID_CONFIGURATION', protocol: parsed.protocol },
          };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const startedAt = Date.now();
        try {
          const response = await fetch(parsed.toString(), { method: 'HEAD', redirect: 'manual', signal: controller.signal });
          const latencyMs = Date.now() - startedAt;
          const reachable = response.status >= 200 && response.status < 500;
          return {
            status: reachable ? HealthStatus.UP : (isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED),
            timestamp: new Date().toISOString(),
            ...(!reachable ? { error: `PUBLIC_WEB_HTTP_${response.status}` } : {}),
            details: {
              capabilityStatus: reachable ? 'REACHABLE' : 'UNREACHABLE',
              latencyMs,
              httpStatus: response.status,
            },
          };
        } catch (error: any) {
          return {
            status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.DEGRADED,
            timestamp: new Date().toISOString(),
            error: error?.name === 'AbortError' ? 'PUBLIC_WEB_PROBE_TIMEOUT' : (error?.message || 'PUBLIC_WEB_PROBE_FAILED'),
            details: { capabilityStatus: 'UNREACHABLE', latencyMs: Date.now() - startedAt },
          };
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    // Define API v1 Router
    const v1Router = Router();

    // Register versioned routes

    const lazyRouter = (name: string) => {
      let cachedRouter: Router | null = null;
      return (req: Request, res: Response, next: (err?: any) => void) => {
        if (!cachedRouter) {
          try {
            cachedRouter = container.resolve<Router>(name);
          } catch (err) {
            return next(err);
          }
        }
        return cachedRouter(req, res, next);
      };
    };

    // 1. Core Required Routers (Eager) - Phase 3 Core Infrastructure & Audit
    const auditRecordRepository = container.resolve<any>('auditRecordRepo');
    v1Router.use('/auth', new MutationAuditMiddleware(auditRecordRepository, 'AUTH').generate(), container.resolve<Router>('authRouter'));

    // Admin Security Middleware
    const adminTokenProvider = container.resolve<ITokenProvider>('tokenProvider');
    const adminSessionManager = container.resolve<ISessionManager>('sessionManager');
    const adminIdentityRepository = container.resolve<any>('identityRepository');
    v1Router.use('/admin', SecurityMiddlewareFactory.createAdminGuard({
      mode: adminAuthMode,
      tokenProvider: adminTokenProvider,
      sessionManager: adminSessionManager,
      identityRepository: adminIdentityRepository,
    }));
    v1Router.use('/admin', new MutationAuditMiddleware(auditRecordRepository, 'ADMIN').generate());
    const requireAdminPermission = SecurityMiddlewareFactory.createAdminPermissionGuard;

    // Core Admin Domain Routers (Identity & Audit)
    v1Router.use('/admin/identities', requireAdminPermission('admin:identities:manage'), container.resolve<Router>('identityRouter'));
    v1Router.use('/identities', SecurityMiddlewareFactory.createAdminGuard({ mode: adminAuthMode, tokenProvider: adminTokenProvider, sessionManager: adminSessionManager, identityRepository: adminIdentityRepository }), new MutationAuditMiddleware(auditRecordRepository, 'IDENTITY').generate(), requireAdminPermission('admin:identities:manage'), container.resolve<Router>('identityRouter'));

    v1Router.use('/admin/audit', requireAdminPermission('admin:audit:manage'), container.resolve<Router>('auditRouter'));
    v1Router.use('/audit', SecurityMiddlewareFactory.createAdminGuard({ mode: adminAuthMode, tokenProvider: adminTokenProvider, sessionManager: adminSessionManager, identityRepository: adminIdentityRepository }), requireAdminPermission('admin:audit:manage'), container.resolve<Router>('auditRouter'));

    // 2. Active Phase 2-10 Domain Routers (Eager) - Phase 6-10 Roadmap Scope
    // Phase 6: Import Foundation & Assets
    // Static course-import operations MUST be mounted before the generic /admin/imports router.
    v1Router.use('/admin/imports/courses', requireAdminPermission('admin:imports:manage'), container.resolve<Router>('courseImportOperationsRouter'));
    v1Router.use('/admin/imports', requireAdminPermission('admin:imports:manage'), container.resolve<Router>('importAdminRouter'));
    v1Router.use('/admin/assets', requireAdminPermission('admin:assets:manage'), container.resolve<Router>('assetPlatformRouter'));

    // Phase 7: Reference Data & Academic Taxonomy
    v1Router.use('/admin/reference-data', requireAdminPermission('admin:reference-data:manage'), container.resolve<Router>('referenceDataAdminRouter'));
    v1Router.use('/reference-data', container.resolve<Router>('referenceDataPublicRouter'));
    // Study Destinations are an editorial/domain profile layered on canonical country references.
    // Authorization reuses the existing reference-data management capability without moving profile ownership into P7.
    v1Router.use('/admin/study-destinations', requireAdminPermission('admin:reference-data:manage'), container.resolve<Router>('studyDestinationAdminRouter'));
    v1Router.use('/study-destinations', container.resolve<Router>('studyDestinationPublicRouter'));
    v1Router.use('/admin/academic-taxonomy', requireAdminPermission('admin:academic-taxonomy:manage'), container.resolve<Router>('academicTaxonomyAdminRouter'));
    v1Router.use('/academic-taxonomy', container.resolve<Router>('academicTaxonomyPublicRouter'));

    // Phase 8: International Tests
    v1Router.use('/admin/international-tests', requireAdminPermission('admin:international-tests:manage'), container.resolve<Router>('internationalTestAdminRouter'));
    v1Router.use('/public/international-tests', container.resolve<Router>('internationalTestPublicRouter'));

    // Phase 9: University Platform (Preserved structure, no data import)
    v1Router.use('/admin/universities', requireAdminPermission('admin:universities:manage'), container.resolve<Router>('universityAdminRouter'));
    v1Router.use('/public/universities', container.resolve<Router>('universityPublicRouter'));

    // Phase 10: Major Platform
    v1Router.use('/admin/majors', requireAdminPermission('admin:majors:manage'), container.resolve<Router>('majorAdminRouter'));
    v1Router.use('/public/majors', container.resolve<Router>('majorPublicRouter'));

    // 3. Phase 5 enterprise control-plane services.
    // Legacy route locations are preserved for compatibility, but every mutation-capable
    // control-plane router is now inside the same strict auth + audit + RBAC boundary as /admin.
    const protectControlPlane = (permission: string, routerName: string) => [
      SecurityMiddlewareFactory.createAdminGuard({ mode: adminAuthMode, tokenProvider: adminTokenProvider }),
      new MutationAuditMiddleware(auditRecordRepository, 'CONTROL_PLANE').generate(),
      requireAdminPermission(permission),
      lazyRouter(routerName),
    ];

    v1Router.use('/admin/authorization', requireAdminPermission('admin:authorization:manage'), lazyRouter('authorizationAdminRouter'));
    v1Router.use('/authorization', ...protectControlPlane('admin:authorization:manage', 'authorizationRuntimeRouter'));
    v1Router.use('/admin/settings', requireAdminPermission('admin:settings:manage'), lazyRouter('settingsAdminRouter'));
    v1Router.use('/settings', ...protectControlPlane('admin:settings:manage', 'settingsRuntimeRouter'));
    v1Router.use('/files', ...protectControlPlane('admin:assets:manage', 'fileManagementRouter'));
    v1Router.use('/notifications', ...protectControlPlane('admin:platform:manage', 'notificationRouter'));
    v1Router.use('/search', lazyRouter('searchRouter'));
    v1Router.use('/cache', ...protectControlPlane('admin:platform:manage', 'cacheRouter'));
    v1Router.use('/background-jobs', ...protectControlPlane('admin:platform:manage', 'backgroundJobRouter'));
    v1Router.use('/workflows', ...protectControlPlane('admin:platform:manage', 'workflowRouter'));
    v1Router.use('/api-services', ...protectControlPlane('admin:platform:manage', 'apiFoundationRouter'));
    v1Router.use('/shared-components', ...protectControlPlane('admin:platform:manage', 'sharedComponentRouter'));
    v1Router.use('/enterprise-events', ...protectControlPlane('admin:platform:manage', 'enterpriseEventRouter'));

    // 4. Future Phase 11+ Routers (Lazy) - Post-Phase-10 Extensions
    v1Router.use('/admin/scholarships', requireAdminPermission('admin:scholarships:manage'), lazyRouter('scholarshipAdminRouter'));
    v1Router.use('/public/scholarships', lazyRouter('scholarshipPublicRouter'));
    // Static /imported must be registered before /admin/courses/:id can match "imported".
    v1Router.use('/admin/courses/imported', requireAdminPermission('admin:courses:manage'), lazyRouter('importedCourseAdminRouter'));
    v1Router.use('/admin/courses', requireAdminPermission('admin:courses:manage'), lazyRouter('courseAdminRouter'));
    v1Router.use('/public/courses', lazyRouter('coursePublicRouter'));
    v1Router.use('/public/graph', lazyRouter('crossDomainReadModelRouter'));
    v1Router.use('/student/courses', lazyRouter('courseLearnerRouter'));
    // Phase 14 W10: authenticated admin boundary is inherited from /admin;
    // CertificateAdminRouter applies fine-grained view/author/checker/lifecycle/issuer permissions per route.
    v1Router.use('/admin/certificates', lazyRouter('certificateAdminRouter'));
    v1Router.use('/public/certificates', lazyRouter('certificatePublicRouter'));
    v1Router.use('/student', lazyRouter('studentWorkspaceRouter'));
    v1Router.use('/admin/student-tools', requireAdminPermission('admin:student-tools:manage'), lazyRouter('studentToolsAdminRouter'));
    v1Router.use('/public/student-tools', lazyRouter('studentToolsPublicRouter'));
    v1Router.use('/admin/cms', requireAdminPermission('admin:cms:manage'), lazyRouter('cmsAdminRouter'));
    v1Router.use('/public/cms', lazyRouter('cmsPublicRouter'));
    v1Router.use('/admin/services', requireAdminPermission('admin:services:manage'), lazyRouter('serviceAdminRouter'));
    v1Router.use('/public/services', lazyRouter('servicePublicRouter'));
    v1Router.use('/admin/finance', requireAdminPermission('admin:finance:manage'), lazyRouter('financeAdminRouter'));
    v1Router.use('/admin/careers', requireAdminPermission('admin:careers:manage'), lazyRouter('careerAdminRouter'));
    v1Router.use('/public/careers', lazyRouter('careerPublicRouter'));
    v1Router.use('/ai', requireAdminPermission('admin:ai:manage'), lazyRouter('aiGatewayRouter'));
    v1Router.use('/admin/ai', requireAdminPermission('admin:ai:manage'), lazyRouter('aiAdminRouter'));

    // Public monitoring exposes only liveness/readiness health contracts. The richer
    // diagnostic and production-readiness payload is control-plane data and stays
    // behind the authenticated admin + RBAC boundary.
    v1Router.use('/admin/monitoring', requireAdminPermission('admin:platform:manage'), MonitoringRouter.create({
      monitoringService,
      productionReadinessReport,
      runtimeMode: currentEnv.NODE_ENV || 'development',
      diagnosticsEnabled: true,
    }));
    v1Router.use('/monitoring', MonitoringRouter.create({
      monitoringService,
      runtimeMode: currentEnv.NODE_ENV || 'development',
    }));

    apiRouter.registerVersion('v1', v1Router);
    
    // Mount API Router on /api
    app.use('/api', apiRouter.getRouter());

    // Global Error Handler Middleware
    app.use(exceptionHandler.generate());

    appInstance = app;
    return app;
    } catch (err) {
      bootstrapPromise = null;
      throw err;
    }
  })();

  return bootstrapPromise;
}
