import * as awilix from 'awilix';
import express, { Router, Express, Request, Response } from 'express';
import * as path from 'path';
import { container, registerDependencies } from './infrastructure/di/container.js';
import { isDatabaseRequiredForRuntime } from './infrastructure/di/RuntimeDependencyPolicy.js';
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
  LocalStorageProvider,
  StorageService,
  DefaultMonitoringProvider,
  MonitoringService,
  DefaultRateLimiter,
  SecurityService,
  DatabaseHealthChecker,
  RedisClientFactory,
  RedisHealthChecker
} from '@manaratak/infrastructure';
import { ConfigurationRegistry, EnvironmentLoader, EnvironmentConfigurationProvider, ProductionReadinessValidator, ZodEnvironmentValidator } from '@manaratak/config';
import { IConfigurationService, ILogger, IValidationService, ISecurityService, IMonitoringService, IRateLimiter, ITokenProvider, HealthStatus } from '@manaratak/core';

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
      const currentEnv = options?.env || process.env;

      let url = currentEnv.DATABASE_URL;
      if (!url || url.includes('postgres-host') || url.includes('placeholder')) {
        const { SQL_USER, SQL_PASSWORD, SQL_HOST, SQL_DB_NAME } = currentEnv;
        if (SQL_USER && SQL_PASSWORD && SQL_HOST && SQL_DB_NAME) {
          const encodedPassword = encodeURIComponent(SQL_PASSWORD);
          url = `postgresql://${SQL_USER}:${encodedPassword}@localhost/${SQL_DB_NAME}?host=${SQL_HOST}`;
          currentEnv.DATABASE_URL = url;
          process.env.DATABASE_URL = url;
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
      const rateLimiter = options?.rateLimiter || new DefaultRateLimiter();
      const securityService = options?.securityService || new AppSecurityService(rateLimiter);

      // Assert Production Security Guardrails
      SecurityValidator.assertProductionSecurity(currentEnv, securityService, rateLimiter);

    // Bootstrap API
    const apiRouter = new ApiRouter();
    const app = express();

    // Security Configuration
    const cspEnabled = config.getOptional<string>('SECURITY_CSP_ENABLED') === 'true';
    const corsOrigins = config.getOptional<string>('CORS_ORIGIN') 
      ? [config.getOptional<string>('CORS_ORIGIN')!] 
      : config.getOptional<string>('SECURITY_CORS_ORIGINS')?.split(',') || ['http://localhost:3000'];
    const rateLimitMax = parseInt(config.getOptional<string>('SECURITY_RATE_LIMIT_MAX') || '100', 10);
    const rateLimitWindow = parseInt(config.getOptional<string>('SECURITY_RATE_LIMIT_WINDOW_MS') || '60000', 10);
    const adminAuthMode = SecurityMiddlewareFactory.resolveAdminAuthMode({
      NODE_ENV: config.getOptional<string>('NODE_ENV') || process.env.NODE_ENV,
      ADMIN_AUTH_MODE: config.getOptional<string>('ADMIN_AUTH_MODE') || process.env.ADMIN_AUTH_MODE,
    });
    // Security Middleware
    app.use(SecurityMiddlewareFactory.createSecurityHeaders({ enabled: cspEnabled }));
    app.use(SecurityMiddlewareFactory.createCors({ allowedOrigins: corsOrigins }));

    // Logging Middleware (Establishes AsyncLogContext early for all request phases)
    const loggingMiddleware = new LoggingMiddleware(logContext, requestLogger);
    app.use(loggingMiddleware.generate());

    app.use(SecurityMiddlewareFactory.createRateLimiter(securityService, { limit: rateLimitMax, windowMs: rateLimitWindow }));
    app.use(express.json());
    app.use(SecurityMiddlewareFactory.createCsrfGuard(securityService));

    // Monitoring Middleware
    const monitoringMiddleware = new MonitoringMiddleware(monitoringService);
    app.use(monitoringMiddleware.generate());

    // Register DI Dependencies
    registerDependencies();
    container.register({ 
      monitoringService: awilix.asValue(monitoringService),
      securityService: awilix.asValue(securityService)
    });

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
      name: 'asset-platform',
      isOptional: false,
      checkHealth: async () => ({
        status: isProductionOrStaging ? HealthStatus.DOWN : HealthStatus.UP,
        timestamp: new Date().toISOString(),
        ...(isProductionOrStaging
          ? { error: 'ASSET_RUNTIME_PROVIDER_NOT_CONFIGURED' }
          : {}),
      }),
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

    // Define API v1 Router
    const v1Router = Router();

    // CSRF Token endpoint for clients
    v1Router.get('/csrf-token', (req: Request, res: Response) => {
      const sessionSecret = (req.headers['x-session-secret'] as string) 
        || (req as any).session?.secret 
        || config.getOptional<string>('SESSION_SECRET') 
        || process.env.SESSION_SECRET 
        || '';
      const token = securityService.generateCsrfToken(sessionSecret);
      res.setHeader('X-CSRF-Token', token);
      res.status(200).json(new ResponseFormatter('v1').success({
        csrfToken: token
      }));
    });

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
    v1Router.use('/admin', SecurityMiddlewareFactory.createAdminGuard({
      mode: adminAuthMode,
      tokenProvider: adminTokenProvider,
    }));
    v1Router.use('/admin', new MutationAuditMiddleware(auditRecordRepository, 'ADMIN').generate());
    const requireAdminPermission = SecurityMiddlewareFactory.createAdminPermissionGuard;

    // Core Admin Domain Routers (Identity & Audit)
    v1Router.use('/admin/identities', requireAdminPermission('admin:identities:manage'), container.resolve<Router>('identityRouter'));
    v1Router.use('/identities', SecurityMiddlewareFactory.createAdminGuard({ mode: adminAuthMode, tokenProvider: adminTokenProvider }), new MutationAuditMiddleware(auditRecordRepository, 'IDENTITY').generate(), requireAdminPermission('admin:identities:manage'), container.resolve<Router>('identityRouter'));

    v1Router.use('/admin/audit', requireAdminPermission('admin:audit:manage'), container.resolve<Router>('auditRouter'));
    v1Router.use('/audit', SecurityMiddlewareFactory.createAdminGuard({ mode: adminAuthMode, tokenProvider: adminTokenProvider }), requireAdminPermission('admin:audit:manage'), container.resolve<Router>('auditRouter'));

    // 2. Active Phase 2-10 Domain Routers (Eager) - Phase 6-10 Roadmap Scope
    // Phase 6: Import Foundation & Assets
    // Static course-import operations MUST be mounted before the generic /admin/imports router.
    v1Router.use('/admin/imports/courses', requireAdminPermission('admin:imports:manage'), container.resolve<Router>('courseImportOperationsRouter'));
    v1Router.use('/admin/imports', requireAdminPermission('admin:imports:manage'), container.resolve<Router>('importAdminRouter'));
    v1Router.use('/admin/assets', requireAdminPermission('admin:assets:manage'), container.resolve<Router>('assetPlatformRouter'));

    // Phase 7: Reference Data & Academic Taxonomy
    v1Router.use('/admin/reference-data', requireAdminPermission('admin:reference-data:manage'), container.resolve<Router>('referenceDataAdminRouter'));
    v1Router.use('/reference-data', container.resolve<Router>('referenceDataPublicRouter'));
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

    // 3. Present But Not Currently Required Routers (Lazy) - Phase 5 Enterprise Core Foundation Services
    v1Router.use('/admin/authorization', requireAdminPermission('admin:authorization:manage'), lazyRouter('authorizationAdminRouter'));
    v1Router.use('/authorization', lazyRouter('authorizationRuntimeRouter'));
    v1Router.use('/admin/settings', requireAdminPermission('admin:settings:manage'), lazyRouter('settingsAdminRouter'));
    v1Router.use('/settings', lazyRouter('settingsRuntimeRouter'));
    v1Router.use('/files', lazyRouter('fileManagementRouter'));
    v1Router.use('/notifications', lazyRouter('notificationRouter'));
    v1Router.use('/search', lazyRouter('searchRouter'));
    v1Router.use('/cache', lazyRouter('cacheRouter'));
    v1Router.use('/background-jobs', lazyRouter('backgroundJobRouter'));
    v1Router.use('/workflows', lazyRouter('workflowRouter'));
    v1Router.use('/api-services', lazyRouter('apiFoundationRouter'));
    v1Router.use('/shared-components', lazyRouter('sharedComponentRouter'));
    v1Router.use('/enterprise-events', lazyRouter('enterpriseEventRouter'));

    // 4. Future Phase 11+ Routers (Lazy) - Post-Phase-10 Extensions
    v1Router.use('/admin/scholarships', requireAdminPermission('admin:scholarships:manage'), lazyRouter('scholarshipAdminRouter'));
    v1Router.use('/public/scholarships', lazyRouter('scholarshipPublicRouter'));
    // Static /imported must be registered before /admin/courses/:id can match "imported".
    v1Router.use('/admin/courses/imported', requireAdminPermission('admin:courses:manage'), lazyRouter('importedCourseAdminRouter'));
    v1Router.use('/admin/courses', requireAdminPermission('admin:courses:manage'), lazyRouter('courseAdminRouter'));
    v1Router.use('/public/courses', lazyRouter('coursePublicRouter'));
    v1Router.use('/admin/certificates', requireAdminPermission('admin:certificates:manage'), lazyRouter('certificateAdminRouter'));
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

    // Core Required Monitoring Router (Eager)
    v1Router.use('/monitoring', MonitoringRouter.create({ monitoringService, productionReadinessReport }));

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
