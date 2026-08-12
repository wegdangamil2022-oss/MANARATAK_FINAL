import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MonitoringRouter } from '../../../../src/presentation/api/router/MonitoringRouter';
import { IMonitoringService, HealthStatus } from '@manaratak/core';

describe('MonitoringRouter', () => {
  it('should return health status', async () => {
    const mockMonitoringService: IMonitoringService = {
      checkHealth: vi.fn().mockResolvedValue({ status: HealthStatus.UP }),
      getLiveness: vi.fn().mockResolvedValue({ status: HealthStatus.UP }),
      getReadiness: vi.fn().mockResolvedValue({ status: HealthStatus.UP }),
      getMetrics: vi.fn(),
      registerIndicator: vi.fn(),
      recordMetric: vi.fn() // Add if necessary
    } as any;

    const app = express();
    app.use('/monitoring', MonitoringRouter.create({ monitoringService: mockMonitoringService }));

    const res = await request(app).get('/monitoring/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(HealthStatus.UP);
  });

  it('should return production readiness report without secret values', async () => {
    const mockMonitoringService: IMonitoringService = {
      checkHealth: vi.fn().mockResolvedValue({ status: HealthStatus.UP }),
      getLiveness: vi.fn().mockResolvedValue({ status: HealthStatus.UP }),
      getReadiness: vi.fn().mockResolvedValue({ status: HealthStatus.UP }),
      getMetrics: vi.fn(),
      registerIndicator: vi.fn(),
      recordMetric: vi.fn()
    } as any;

    const app = express();
    app.use('/monitoring', MonitoringRouter.create({
      monitoringService: mockMonitoringService,
      productionReadinessReport: {
        ready: false,
        blockerCount: 1,
        warningCount: 0,
        checkedAt: '2026-07-27T00:00:00.000Z',
        findings: [{
          id: 'admin.strict_mode_required',
          severity: 'BLOCKER',
          area: 'Admin Security',
          message: 'Production admin access is not using strict mode.',
          recommendation: 'Set ADMIN_AUTH_MODE=strict.'
        }]
      }
    }));

    const res = await request(app).get('/monitoring/production-readiness');
    expect(res.status).toBe(200);
    expect(res.body.blockerCount).toBe(1);
    expect(JSON.stringify(res.body)).not.toContain('ADMIN_BEARER_TOKEN=');
  });
});
