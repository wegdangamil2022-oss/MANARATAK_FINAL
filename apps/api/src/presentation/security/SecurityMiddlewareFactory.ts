import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { ISecurityService } from '@manaratak/core';
import { ConfigurationRegistry } from '@manaratak/config';
import { AuthorizationEvaluatorService } from '@manaratak/domain';
import { ITokenProvider } from '@manaratak/core';
import { container } from '../../infrastructure/di/container';

export interface CorsOptions {
  allowedOrigins: string[];
}

export interface CspOptions {
  enabled: boolean;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface CsrfGuardOptions {
  getSessionSecret?: (req: Request) => string;
  headerName?: string;
  exemptPaths?: string[];
  exemptBearerAuth?: boolean;
}

export interface AdminGuardOptions {
  mode: 'strict';
  tokenProvider?: ITokenProvider;
  authEvaluatorService?: AuthorizationEvaluatorService;
}

export interface AdminRuntimeContext {
  readonly authMode: 'strict';
  readonly principalId: string;
}

export class SecurityMiddlewareFactory {
  public static createSecurityHeaders(options: CspOptions) {
    return helmet({
      contentSecurityPolicy: options.enabled ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      } : false,
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: true,
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true
    });
  }

  public static createCors(options: CorsOptions) {
    return cors({
      origin: options.allowedOrigins.includes('*') ? '*' : options.allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-CSRF-Token', 'x-csrf-token', 'X-Session-Secret', 'x-session-secret'],
      credentials: true,
      maxAge: 86400
    });
  }

  public static createRateLimiter(securityService: ISecurityService, options: RateLimitOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket?.remoteAddress || 'unknown';
      const result = await securityService.getRateLimiter().consume(ip, options.limit, options.windowMs);
      
      res.setHeader('X-RateLimit-Limit', options.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetTime);

      if (!result.allowed) {
        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        });
        return;
      }
      
      next();
    };
  }

  public static createCsrfGuard(securityService: ISecurityService, options: CsrfGuardOptions = {}) {
    const headerName = options.headerName || 'x-csrf-token';
    const getSessionSecret = options.getSessionSecret || ((req: Request) => {
      const configSecret = ConfigurationRegistry.isInitialized()
        ? ConfigurationRegistry.getOptionalInstance()?.getOptional<string>('SESSION_SECRET')
        : undefined;
      return (req.headers['x-session-secret'] as string)
        || (req as any).session?.secret
        || configSecret
        || process.env.SESSION_SECRET
        || '';
    });
    const exemptPaths = options.exemptPaths || [];
    const exemptBearerAuth = options.exemptBearerAuth ?? false;

    return (req: Request, res: Response, next: NextFunction) => {
      const method = req.method.toUpperCase();

      // Safe HTTP methods (GET, HEAD, OPTIONS) do not mutate state and are allowed without CSRF token
      if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        next();
        return;
      }

      // Check for exempted path prefixes if provided
      if (exemptPaths.some((p) => req.path.startsWith(p))) {
        next();
        return;
      }

      // If configured, requests carrying a Bearer token in the Authorization header may be exempted
      if (exemptBearerAuth && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        next();
        return;
      }

      // Extract CSRF token from header (e.g. X-CSRF-Token or x-csrf-token) or body/query fallback
      const token = (
        req.get(headerName) ||
        req.get('x-csrf-token') ||
        req.get('csrf-token') ||
        req.body?._csrf ||
        req.query?._csrf
      ) as string | undefined;

      const sessionSecret = getSessionSecret(req);

      if (!token || !securityService.validateCsrfToken(token, sessionSecret)) {
        res.status(403).json({
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid or missing CSRF token.',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      next();
    };
  }

  public static resolveAdminAuthMode(env: Record<string, string | undefined> = process.env): 'strict' {
    const rawMode = env.ADMIN_AUTH_MODE;
    if (!rawMode || rawMode === 'strict') {
      return 'strict';
    }

    throw new Error(`[Security Guardrail] Invalid ADMIN_AUTH_MODE value: '${rawMode}'. Only persisted-RBAC strict mode is supported.`);
  }

  public static createAdminGuard(options: AdminGuardOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      let principalId: string | null = req.authUserId || null;

      if (!principalId) {
        const receivedToken = extractBearerToken(req.headers.authorization);
        if (receivedToken && options.tokenProvider) {
          try {
            const provider = options.tokenProvider as ITokenProvider & {
              verifyAccessTokenSync?: (token: string) => { userId?: string };
            };
            const payload = provider.verifyAccessTokenSync
              ? provider.verifyAccessTokenSync(receivedToken)
              : await provider.verifyAccessToken(receivedToken);
            if (payload?.userId) {
              principalId = payload.userId;
            }
          } catch (e) {
            // Invalid or expired tokens remain unauthenticated.
          }
        }
      }

      if (!principalId) {
        res.status(401).json({
          error: {
            code: 'ADMIN_AUTH_REQUIRED',
            message: 'Admin authentication is required.',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      req.authUserId = principalId;
      assignAdminContext(res, {
        authMode: options.mode,
        principalId,
      });
      res.setHeader('X-Admin-Auth-Mode', options.mode);
      next();
    };
  }

  public static createAdminPermissionGuard(requiredPermission: string, evaluatorOverride?: AuthorizationEvaluatorService) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const principalId = req.authUserId;
      if (!principalId) {
        res.status(401).json({
          error: {
            code: 'ADMIN_AUTH_REQUIRED',
            message: 'Admin authentication is required.',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      try {
        let evaluator = evaluatorOverride;
        if (!evaluator) {
          try {
            evaluator = container.resolve<AuthorizationEvaluatorService>('authEvaluatorService');
          } catch (e) {
            // Container resolution fallback
          }
        }

        if (!evaluator) {
          res.status(500).json({
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Authorization evaluator service is unavailable.',
            },
          });
          return;
        }

        const decision = await evaluator.evaluatePermission(principalId, requiredPermission, {
          ip: req.ip || req.socket?.remoteAddress || undefined,
          requestTime: new Date(),
          userAgent: req.headers['user-agent'],
          correlationId: req.headers['x-correlation-id'],
        });

        const correlationId = (req.headers['x-correlation-id'] as string) || (req as any).id || 'N/A';
        if (process.env.NODE_ENV !== 'test') {
          console.log(`[Authorization] correlationId=${correlationId} principalId=${principalId} requiredPermission=${requiredPermission} decision=${decision.isGranted ? 'ALLOW' : 'DENY'}`);
        }

        if (!decision.isGranted) {
          res.status(403).json({
            error: {
              code: 'ADMIN_PERMISSION_DENIED',
              message: 'Admin permission is denied.',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requiredPermission,
            },
          });
          return;
        }

        res.setHeader('X-Admin-Required-Permission', requiredPermission);
        next();
      } catch (err: any) {
        res.status(403).json({
          error: {
            code: 'ADMIN_PERMISSION_DENIED',
            message: 'Admin permission evaluation failed.',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requiredPermission,
          },
        });
      }
    };
  }
}

function assignAdminContext(res: Response, context: AdminRuntimeContext): void {
  res.locals.adminContext = context;
}

function getAdminContext(res: Response): AdminRuntimeContext | null {
  return res.locals.adminContext ?? null;
}

function extractBearerToken(value: string | undefined): string | null {
  if (!value) return null;
  const [scheme, token] = value.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}
