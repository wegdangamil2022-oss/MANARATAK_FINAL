import { Request, Response, NextFunction } from 'express';
import { IMonitoringService } from '@manaratak/core';

export class MonitoringMiddleware {
  constructor(private _monitoringService: IMonitoringService) {}

  public generate() {
    return (_req: Request, _res: Response, next: NextFunction) => {
      // Basic implementation that satisfies compilation
      next();
    };
  }
}
