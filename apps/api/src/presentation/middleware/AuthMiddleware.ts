import { Request, Response, NextFunction } from 'express';
import { ITokenProvider, UnauthorizedException } from '@manaratak/core';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
    }
  }
}

export class AuthMiddleware {
  constructor(private readonly tokenProvider: ITokenProvider) {}

  public generate = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.split(' ')[1];
        const payload = await this.tokenProvider.verifyAccessToken(token);
        
        req.authUserId = payload.userId;
        next();
      } catch (error: any) {
        res.status(401).json({ message: error.message || 'Unauthorized' });
      }
    };
  }
}
