import { Router } from 'express';
import { IMonitoringService, HealthStatus } from '@manaratak/core';
import { ProductionReadinessReport } from '@manaratak/config';

export class MonitoringRouter {
  public static create({
    monitoringService,
    productionReadinessReport,
  }: {
    monitoringService: IMonitoringService;
    productionReadinessReport?: ProductionReadinessReport;
  }): Router {
    const router = Router();

    router.get('/health', async (req, res) => {
      const result = await monitoringService.checkHealth();
      const status = result.status === HealthStatus.UP ? 200 : 503;
      res.status(status).json(result);
    });

    router.get('/health/liveness', async (req, res) => {
      const result = await monitoringService.getLiveness();
      const status = result.status === HealthStatus.UP ? 200 : 503;
      res.status(status).json(result);
    });

    router.get('/health/readiness', async (req, res) => {
      const result = await monitoringService.getReadiness();
      const status = result.status === HealthStatus.UP ? 200 : 503;
      res.status(status).json(result);
    });

    router.get('/production-readiness', async (req, res) => {
      if (!productionReadinessReport) {
        res.status(503).json({
          ready: false,
          blockerCount: 1,
          warningCount: 0,
          checkedAt: new Date().toISOString(),
          findings: [{
            id: 'production_readiness.not_configured',
            severity: 'BLOCKER',
            area: 'Operations',
            message: 'Production readiness report is not configured.',
            recommendation: 'Wire ProductionReadinessValidator into the API bootstrap process.'
          }]
        });
        return;
      }

      res.status(200).json(productionReadinessReport);
    });

    return router;
  }
}
