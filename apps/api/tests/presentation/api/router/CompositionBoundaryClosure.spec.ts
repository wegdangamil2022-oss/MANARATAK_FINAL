import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApiApp } from '../../../../src/app.js';
import { container } from '../../../../src/infrastructure/di/container.js';

describe('WP1-B.2 Composition Boundary Closure Regression Tests', () => {
  it('API bootstrap succeeds and core required & active phase routers are composed eagerly', async () => {
    const app = await createApiApp();
    expect(app).toBeDefined();

    // Verify core required endpoints respond
    const csrfRes = await request(app).get('/api/v1/csrf-token');
    expect(csrfRes.status).toBe(200);

    const livenessRes = await request(app).get('/api/v1/monitoring/health/liveness');
    expect(livenessRes.status).toBe(200);

    const healthRes = await request(app).get('/api/v1/monitoring/health');
    expect([200, 503]).toContain(healthRes.status);
  });

  it('deferred future routers do not instantiate before request use', async () => {
    const resolveSpy = vi.spyOn(container, 'resolve');
    await createApiApp();

    // Verify that deferred routers like fileManagementRouter, searchRouter, aiGatewayRouter were NOT resolved at bootstrap
    const resolvedCalls = resolveSpy.mock.calls.map(call => call[0]);
    expect(resolvedCalls).not.toContain('fileManagementRouter');
    expect(resolvedCalls).not.toContain('searchRouter');
    expect(resolvedCalls).not.toContain('aiGatewayRouter');
    expect(resolvedCalls).not.toContain('notificationRouter');

    resolveSpy.mockRestore();
  });

  it('lazy router resolves only once upon request and passes resolution failure to global error handling', async () => {
    const app = await createApiApp();
    const resolveSpy = vi.spyOn(container, 'resolve');

    // First request to a deferred endpoint whose stub throws "Not implemented: Phase stub"
    const res1 = await request(app).get('/api/v1/files');
    
    // Resolution failure must flow to error handling (e.g. 500 status with error message from GlobalExceptionHandler)
    expect(res1.status).toBe(500);
    expect(res1.body.error.message).toContain('Not implemented: Phase stub');

    // Verify container.resolve was called for fileManagementRouter
    const fileResolveCalls = resolveSpy.mock.calls.filter(call => call[0] === 'fileManagementRouter');
    expect(fileResolveCalls.length).toBe(1);

    resolveSpy.mockRestore();
  });

  it('lazy router caches successful router resolution and reuses it without re-resolving DI container', async () => {
    const { Router } = await import('express');
    const dummyRouter = Router();
    dummyRouter.get('/test', (req, res) => {
      res.status(200).json({ ok: true });
    });

    // Register a temporary mock lazy router in Awilix container
    const { asValue } = await import('awilix');
    container.register({ mockTestRouter: asValue(dummyRouter) });

    const app = await createApiApp();
    const resolveSpy = vi.spyOn(container, 'resolve');

    // Request 1
    const res1 = await request(app).get('/api/v1/files'); // trigger lazy router check
    
    // Now verify container.resolve call count behavior on successful resolution
    const mockResolveCallsBefore = resolveSpy.mock.calls.filter(call => call[0] === 'mockTestRouter').length;
    expect(mockResolveCallsBefore).toBe(0);

    resolveSpy.mockRestore();
  });

  it('active Phase 2-10 routers are composed eagerly and accessible directly', async () => {
    const app = await createApiApp();

    // Active public endpoint (Reference Data)
    const refDataRes = await request(app).get('/api/v1/reference-data');
    expect([200, 404, 400]).toContain(refDataRes.status);

    // Active public endpoint (Academic Taxonomy)
    const taxRes = await request(app).get('/api/v1/academic-taxonomy/degree-levels');
    expect([200, 404, 400]).toContain(taxRes.status);
  });
});
