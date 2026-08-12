import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import {
  HealthStatus,
  IHealthIndicator,
  IMonitoringService
} from '@manaratak/core';
import {
  MonitoringService,
  DatabaseHealthChecker,
  RedisHealthChecker,
  PrismaConnection
} from '@manaratak/infrastructure';
import { MonitoringRouter } from '../../../src/presentation/api/router/MonitoringRouter';
import { createApiApp } from '../../../src/app';

describe('Problem P02 - Health and Readiness Checks', () => {
  let monitoringService: MonitoringService;

  beforeEach(() => {
    monitoringService = new MonitoringService();
  });

  describe('MonitoringService & Health Indicators', () => {
    it('returns UP for liveness by default', async () => {
      const result = await monitoringService.getLiveness();
      expect(result.status).toBe(HealthStatus.UP);
      expect(result.details?.liveness).toBe(HealthStatus.UP);
    });

    it('returns UP for readiness when all required indicators pass', async () => {
      const dbIndicator: IHealthIndicator = {
        name: 'database',
        isOptional: false,
        checkHealth: async () => ({
          status: HealthStatus.UP,
          timestamp: new Date().toISOString(),
          details: { database: 'connected' }
        })
      };
      monitoringService.registerIndicator(dbIndicator);

      const readiness = await monitoringService.getReadiness();
      expect(readiness.status).toBe(HealthStatus.UP);
      expect(readiness.details?.database).toBeDefined();
    });

    it('returns DOWN for readiness when a required indicator (e.g. database) fails', async () => {
      const dbIndicator: IHealthIndicator = {
        name: 'database',
        isOptional: false,
        checkHealth: async () => ({
          status: HealthStatus.DOWN,
          timestamp: new Date().toISOString(),
          error: 'Connection refused'
        })
      };
      monitoringService.registerIndicator(dbIndicator);

      const readiness = await monitoringService.getReadiness();
      expect(readiness.status).toBe(HealthStatus.DOWN);
      expect(readiness.details?.database).toBeDefined();
    });

    it('returns UP for readiness when an optional indicator (e.g. redis) fails', async () => {
      const dbIndicator: IHealthIndicator = {
        name: 'database',
        isOptional: false,
        checkHealth: async () => ({
          status: HealthStatus.UP,
          timestamp: new Date().toISOString()
        })
      };
      const redisIndicator: IHealthIndicator = {
        name: 'redis',
        isOptional: true,
        checkHealth: async () => ({
          status: HealthStatus.DOWN,
          timestamp: new Date().toISOString(),
          error: 'Redis connection timeout'
        })
      };
      monitoringService.registerIndicator(dbIndicator);
      monitoringService.registerIndicator(redisIndicator);

      const readiness = await monitoringService.getReadiness();
      expect(readiness.status).toBe(HealthStatus.UP);
      expect((readiness.details?.redis as any).status).toBe(HealthStatus.DEGRADED);
    });
  });

  describe('DatabaseHealthChecker', () => {
    it('returns UP when $queryRaw succeeds', async () => {
      const mockPrisma = {
        $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }])
      };
      const checker = new DatabaseHealthChecker(mockPrisma);
      const result = await checker.checkHealth();

      expect(result.status).toBe(HealthStatus.UP);
      expect(result.details?.database).toBe('connected');
    });

    it('returns DOWN when $queryRaw throws an error', async () => {
      const mockPrisma = {
        $queryRaw: vi.fn().mockRejectedValue(new Error('DB unreachable'))
      };
      const checker = new DatabaseHealthChecker(mockPrisma);
      const result = await checker.checkHealth();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.error).toContain('DB unreachable');
      expect(result.details?.database).toBe('disconnected');
    });

    it('returns DOWN when database client is not initialized', async () => {
      const checker = new DatabaseHealthChecker(null);
      const result = await checker.checkHealth();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.error).toContain('Database connection instance not initialized');
    });

    it('times out safely if query hangs', async () => {
      vi.useFakeTimers();
      const mockPrisma = {
        $queryRaw: () => new Promise(() => {})
      };
      const checker = new DatabaseHealthChecker(mockPrisma);
      
      const checkPromise = checker.checkHealth();
      vi.advanceTimersByTime(2500);
      
      const result = await checkPromise;

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.error).toContain('timed out');
      
      vi.useRealTimers();
    });
  });

  describe('RedisHealthChecker', () => {
    it('returns UP when ping succeeds', async () => {
      const mockRedis = {
        ping: vi.fn().mockResolvedValue('PONG')
      };
      const checker = new RedisHealthChecker(mockRedis);
      const result = await checker.checkHealth();

      expect(result.status).toBe(HealthStatus.UP);
      expect(result.details?.redis).toBe('connected');
    });

    it('returns DEGRADED when ping fails', async () => {
      const mockRedis = {
        ping: vi.fn().mockRejectedValue(new Error('Redis cluster down'))
      };
      const checker = new RedisHealthChecker(mockRedis);
      const result = await checker.checkHealth();

      expect(result.status).toBe(HealthStatus.DEGRADED);
      expect(result.error).toContain('Redis cluster down');
    });
  });

  describe('HTTP Endpoints Separation & Status Codes', () => {
    it('Liveness returns HTTP 200 with HealthStatus.UP even if DB is DOWN', async () => {
      const service = new MonitoringService();
      service.registerIndicator({
        name: 'database',
        isOptional: false,
        checkHealth: async () => ({
          status: HealthStatus.DOWN,
          timestamp: new Date().toISOString()
        })
      });

      const app = express();
      app.use('/monitoring', MonitoringRouter.create({ monitoringService: service }));

      const livenessRes = await request(app).get('/monitoring/health/liveness');
      expect(livenessRes.status).toBe(200);
      expect(livenessRes.body.status).toBe(HealthStatus.UP);

      const readinessRes = await request(app).get('/monitoring/health/readiness');
      expect(readinessRes.status).toBe(503);
      expect(readinessRes.body.status).toBe(HealthStatus.DOWN);
    });

    it('Readiness returns HTTP 200 when DB is UP', async () => {
      const service = new MonitoringService();
      service.registerIndicator({
        name: 'database',
        isOptional: false,
        checkHealth: async () => ({
          status: HealthStatus.UP,
          timestamp: new Date().toISOString()
        })
      });

      const app = express();
      app.use('/monitoring', MonitoringRouter.create({ monitoringService: service }));

      const res = await request(app).get('/monitoring/health/readiness');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(HealthStatus.UP);
    });

    it('Integration test with createApiApp returning HTTP 503 DOWN when DB fails to connect', async () => {
      PrismaConnection.setInstance(null);
      const app = await createApiApp({
        resetCache: true,
        env: {
          NODE_ENV: 'test',
          SECURITY_MODE: 'demo',
          RATE_LIMIT_MODE: 'demo'
        }
      });

      const res = await request(app).get('/api/v1/monitoring/health/readiness');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe(HealthStatus.DOWN);
      expect(res.body.status).not.toBe('healthy');
    });

    it('Integration test with createApiApp returning HTTP 200 UP when DB connection is healthy', async () => {
      const mockPrisma = {
        $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }])
      };
      PrismaConnection.setInstance(mockPrisma);

      const app = await createApiApp({
        resetCache: true,
        env: {
          NODE_ENV: 'test',
          SECURITY_MODE: 'demo',
          RATE_LIMIT_MODE: 'demo'
        }
      });

      const res = await request(app).get('/api/v1/monitoring/health/readiness');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(HealthStatus.UP);
      expect(res.body.status).not.toBe('healthy');
    });
  });
});
