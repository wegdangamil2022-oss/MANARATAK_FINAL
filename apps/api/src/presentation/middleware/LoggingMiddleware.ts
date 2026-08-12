import { Request, Response, NextFunction } from 'express';
import { ILogContext, IRequestLogger } from '@manaratak/core';
import crypto from 'crypto';

export class LoggingMiddleware {
  constructor(
    private readonly logContext: ILogContext,
    private readonly requestLogger: IRequestLogger
  ) {}

  public generate = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const incomingHeader = (req.headers['x-correlation-id'] || req.headers['x-request-id']) as string | undefined;
      let correlationId: string;
      if (typeof incomingHeader === 'string' && incomingHeader.trim() !== '' && /^[\w\-]{1,128}$/.test(incomingHeader.trim())) {
        correlationId = incomingHeader.trim();
      } else {
        correlationId = crypto.randomUUID();
      }

      res.setHeader('X-Correlation-ID', correlationId);
      
      this.logContext.runWithContext(correlationId, () => {
        const startTime = Date.now();
        
        // Log incoming request
        this.requestLogger.logRequest(
          req.method, 
          req.originalUrl, 
          req.ip, 
          req.headers as Record<string, unknown>
        );

        // Hook into response finish to log response
        res.on('finish', () => {
          const duration = Date.now() - startTime;
          this.requestLogger.logResponse(req.method, req.originalUrl, res.statusCode, duration);
        });

        next();
      });
    };
  }
}
