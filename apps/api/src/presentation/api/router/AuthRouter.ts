import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { IAuthService, ISecurityService, ISessionManager, ITokenProvider } from '@manaratak/core';
import { AccountAccessState, IIdentityRepository, IRoleAssignmentRepository, IRoleRepository, LifeStatus } from '@manaratak/domain';
import { ResponseFormatter } from '../response/ResponseFormatter';
import { clearAuthCookies, readAccessCookie, readRefreshCookie, setAuthCookies } from '../../security/HttpOnlyAuthCookies';
import { createHash } from 'node:crypto';

export class AuthRouter {
  public static create(cradle: { 
    authService: IAuthService; 
    identityRepository: IIdentityRepository; 
    securityService: ISecurityService;
    roleAssignmentRepository?: IRoleAssignmentRepository;
    roleRepository?: IRoleRepository;
    tokenProvider?: ITokenProvider;
    sessionManager?: ISessionManager;
  }): Router {
    const { authService, identityRepository, securityService, roleAssignmentRepository, roleRepository, tokenProvider, sessionManager } = cradle;
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');

    // 0. GET /csrf-token
    router.get('/csrf-token', async (req: Request, res: Response) => {
      if (!securityService) {
        res.status(503).json(responseFormatter.error({
          code: 'SECURITY_SERVICE_UNAVAILABLE',
          message: 'CSRF protection is unavailable'
        }));
        return;
      }
      const refreshToken = readRefreshCookie(req);
      if (!refreshToken || !tokenProvider || !sessionManager) {
        res.status(401).json(responseFormatter.error({
          code: 'CSRF_SESSION_REQUIRED',
          message: 'An authenticated session is required'
        }));
        return;
      }
      try {
        const payload = await tokenProvider.verifyRefreshToken(refreshToken);
        if (!await sessionManager.isValidSession(payload.userId, refreshToken)) {
          throw new Error('Inactive session');
        }
        const token = securityService.generateCsrfToken(refreshToken);
        res.setHeader('X-CSRF-Token', token);
        res.status(200).json(responseFormatter.success({ csrfToken: token }));
      } catch {
        clearAuthCookies(res);
        res.status(401).json(responseFormatter.error({
          code: 'CSRF_SESSION_REQUIRED',
          message: 'An authenticated session is required'
        }));
      }
    });

    // 0.1 GET /me (Permission-aware current-user contract)
    router.get('/me', async (req: Request, res: Response) => {
      try {
        let principalId: string | null = (req as any).authUserId || null;

        if (!principalId) {
          const authHeader = req.headers.authorization;
          const token = readAccessCookie(req) || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null);
          if (token && tokenProvider) {
            try {
              const provider = tokenProvider as ITokenProvider & {
                verifyAccessTokenSync?: (value: string) => { userId?: string; sessionId?: string };
              };
              const payload = provider.verifyAccessTokenSync
                ? provider.verifyAccessTokenSync(token)
                : await provider.verifyAccessToken(token);
              if (payload?.userId && (!payload.sessionId || !sessionManager || await sessionManager.isSessionActive(payload.userId, payload.sessionId))) {
                principalId = payload.userId;
              }
            } catch (e) {
              // Invalid or expired tokens remain unauthenticated.
            }
          }
        }

        if (!principalId) {
          res.status(401).json(responseFormatter.error({
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }));
          return;
        }

        const identity = await identityRepository.findById(principalId);
        const identityActive = identity && [LifeStatus.PROVISIONED, LifeStatus.ACTIVE].includes(identity.status);
        const accountActive = identity?.account?.accessState === AccountAccessState.ACTIVE;
        if (!identityActive || !accountActive) {
          res.status(401).json(responseFormatter.error({ code: 'SESSION_NOT_ACTIVE', message: 'Authentication required' }));
          return;
        }
        const displayName = identity.user?.profile.props.displayName || principalId;
        const primaryEmail = identity.user?.contactRegistry.primaryEmail || '';

        const roles: string[] = [];
        const roleNames: string[] = [];
        const effectivePermissions = new Set<string>();

        if (roleAssignmentRepository && roleRepository) {
          const assignments = await roleAssignmentRepository.findByIdentityId(principalId);
          for (const assign of assignments) {
            roles.push(assign.roleId);
            const role = await roleRepository.findById(assign.roleId);
            if (role) {
              roleNames.push(role.name);
              for (const permRef of role.permissions) {
                const permVal = typeof permRef === 'string'
                  ? permRef
                  : ((permRef as any)?.permission || (permRef as any)?.value || String(permRef));
                if (permVal) {
                  effectivePermissions.add(permVal);
                }
              }
            }
          }
        }

        res.status(200).json(responseFormatter.success({
          principalId,
          displayName,
          primaryEmail,
          roles,
          roleNames,
          effectivePermissions: Array.from(effectivePermissions)
        }));
      } catch (error: any) {
        res.status(500).json(responseFormatter.error({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve current user session'
        }));
      }
    });

    // 1. POST /login
    router.post('/login', async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          email: z.string().email('Invalid email address'),
          password: z.string().min(1, 'Password is required')
        });

        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
          res.status(400).json(responseFormatter.error({
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'Validation failed'
          }));
          return;
        }

        const { email, password } = parseResult.data;
        const accountKey = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
        const remoteAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const [accountLimit, accountIpLimit] = await Promise.all([
          securityService.getRateLimiter().consume(`auth:account:${accountKey}`, 20, 15 * 60 * 1000),
          securityService.getRateLimiter().consume(`auth:account-ip:${accountKey}:${remoteAddress}`, 8, 15 * 60 * 1000),
        ]);
        if (!accountLimit.allowed || !accountIpLimit.allowed) {
          res.status(429).json(responseFormatter.error({
            code: 'AUTH_RATE_LIMITED',
            message: 'Too many authentication attempts. Please try again later.'
          }));
          return;
        }
        const identity = await identityRepository.findByEmail(email);

        if (!identity) {
          res.status(401).json(responseFormatter.error({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials or identity not found'
          }));
          return;
        }

        let tokens;
        try {
          tokens = await (authService as any).login(identity.id.toString(), password);
        } catch (authError) {
          res.status(401).json(responseFormatter.error({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials or identity not found'
          }));
          return;
        }
        
        setAuthCookies(res, tokens);
        res.status(200).json(responseFormatter.success({ authenticated: true }));
      } catch (error: any) {
        res.status(500).json(responseFormatter.error({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during login'
        }));
      }
    });

    // 2. POST /refresh
    router.post('/refresh', async (req: Request, res: Response) => {
      try {
        const refreshToken = readRefreshCookie(req);
        if (!refreshToken) {
          res.status(401).json(responseFormatter.error({ code: 'INVALID_TOKEN', message: 'Session is unavailable' }));
          return;
        }
        const tokens = await authService.refreshTokens(refreshToken);
        setAuthCookies(res, tokens);
        res.status(200).json(responseFormatter.success({ authenticated: true }));
      } catch {
        clearAuthCookies(res);
        res.status(401).json(responseFormatter.error({
          code: 'INVALID_TOKEN',
          message: 'Session revoked, expired, or invalid refresh token'
        }));
      }
    });

    // 3. POST /logout
    router.post('/logout', async (req: Request, res: Response) => {
      try {
        const refreshToken = readRefreshCookie(req);
        if (refreshToken) await authService.logoutCurrentSession(refreshToken);
        clearAuthCookies(res);

        res.status(200).json(responseFormatter.success({
          message: 'Successfully logged out'
        }));
      } catch {
        clearAuthCookies(res);
        res.status(401).json(responseFormatter.error({
          code: 'LOGOUT_FAILED',
          message: 'Failed to revoke session'
        }));
      }
    });

    return router;
  }
}
export default AuthRouter;
