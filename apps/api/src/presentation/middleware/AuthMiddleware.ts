import { Request, Response, NextFunction } from 'express';
import { ISessionManager, ITokenProvider, UnauthorizedException } from '@manaratak/core';
import { readAccessCookie } from '../security/HttpOnlyAuthCookies';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
    }
  }
}

export class AuthMiddleware {
  constructor(
    private readonly tokenProvider: ITokenProvider,
    private readonly sessionManager?: ISessionManager,
  ) {}

  public generate = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        const token = readAccessCookie(req) || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '');
        if (!token) throw new UnauthorizedException('Authentication required');
        const payload = await this.tokenProvider.verifyAccessToken(token);
        if (payload.sessionId && this.sessionManager && !await this.sessionManager.isSessionActive(payload.userId, payload.sessionId)) {
          throw new UnauthorizedException('Authentication required');
        }
        
        req.authUserId = payload.userId;
        next();
      } catch {
        res.status(401).json({ message: 'Unauthorized' });
      }
    };
  }
}
