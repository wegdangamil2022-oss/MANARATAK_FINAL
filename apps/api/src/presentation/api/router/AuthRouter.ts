import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { IAuthService, ISecurityService } from '@manaratak/core';
import { IIdentityRepository, IRoleAssignmentRepository, IRoleRepository } from '@manaratak/domain';
import { ConfigurationRegistry } from '@manaratak/config';
import { ResponseFormatter } from '../response/ResponseFormatter';

export class AuthRouter {
  public static create(cradle: { 
    authService: IAuthService; 
    identityRepository: IIdentityRepository; 
    securityService: ISecurityService;
    roleAssignmentRepository?: IRoleAssignmentRepository;
    roleRepository?: IRoleRepository;
    tokenProvider?: any;
  }): Router {
    const { authService, identityRepository, securityService, roleAssignmentRepository, roleRepository, tokenProvider } = cradle;
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');

    // 0. GET /csrf-token
    router.get('/csrf-token', (req: Request, res: Response) => {
      if (!securityService) {
        res.status(503).json(responseFormatter.error({
          code: 'SECURITY_SERVICE_UNAVAILABLE',
          message: 'CSRF protection is unavailable'
        }));
        return;
      }
      const configSecret = ConfigurationRegistry.isInitialized()
        ? ConfigurationRegistry.getOptionalInstance()?.getOptional<string>('SESSION_SECRET')
        : undefined;
      const sessionSecret = (req.headers['x-session-secret'] as string)
        || (req as any).session?.secret
        || configSecret
        || process.env.SESSION_SECRET
        || '';
      if (!sessionSecret) {
        res.status(503).json(responseFormatter.error({
          code: 'CSRF_SECRET_UNAVAILABLE',
          message: 'CSRF protection is unavailable'
        }));
        return;
      }
      const token = securityService.generateCsrfToken(sessionSecret);
      res.setHeader('X-CSRF-Token', token);
      res.status(200).json(responseFormatter.success({
        csrfToken: token
      }));
    });

    // 0.1 GET /me (Permission-aware current-user contract)
    router.get('/me', async (req: Request, res: Response) => {
      try {
        let principalId: string | null = (req as any).authUserId || null;

        if (!principalId) {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ') && tokenProvider) {
            const token = authHeader.substring(7).trim();
            try {
              const payload = tokenProvider.verifyAccessTokenSync
                ? tokenProvider.verifyAccessTokenSync(token)
                : await tokenProvider.verifyAccessToken(token);
              if (payload?.userId) {
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

        let displayName = principalId;
        let primaryEmail = '';
        if (identityRepository) {
          const identity = await identityRepository.findById(principalId);
          if (identity) {
            displayName = identity.user?.profile.props.displayName || principalId;
            primaryEmail = identity.user?.contactRegistry.primaryEmail || '';
          }
        }

        const roles: string[] = [];
        const effectivePermissions = new Set<string>();

        if (roleAssignmentRepository && roleRepository) {
          const assignments = await roleAssignmentRepository.findByIdentityId(principalId);
          for (const assign of assignments) {
            roles.push(assign.roleId);
            const role = await roleRepository.findById(assign.roleId);
            if (role) {
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
        
        // Return only safe token fields
        res.status(200).json(responseFormatter.success({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }));
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
        const schema = z.object({
          refreshToken: z.string().min(1, 'Refresh token is required')
        });

        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
          res.status(400).json(responseFormatter.error({
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'Validation failed'
          }));
          return;
        }

        const { refreshToken } = parseResult.data;
        const tokens = await authService.refreshTokens(refreshToken);

        res.status(200).json(responseFormatter.success({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }));
      } catch (error: any) {
        console.error("Refresh Error:", error); res.status(401).json(responseFormatter.error({
          code: 'INVALID_TOKEN',
          message: 'Session revoked, expired, or invalid refresh token'
        }));
      }
    });

    // 3. POST /logout
    router.post('/logout', async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          userId: z.string().min(1, 'User ID is required'),
          refreshToken: z.string().min(1, 'Refresh token is required')
        });

        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
          res.status(400).json(responseFormatter.error({
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'Validation failed'
          }));
          return;
        }

        const { userId, refreshToken } = parseResult.data;
        await authService.logout(userId, refreshToken);

        res.status(200).json(responseFormatter.success({
          message: 'Successfully logged out'
        }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({
          code: 'LOGOUT_FAILED',
          message: 'Failed to revoke session'
        }));
      }
    });

    return router;
  }
}
export default AuthRouter;
