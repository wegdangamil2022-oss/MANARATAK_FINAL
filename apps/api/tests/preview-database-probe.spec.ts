import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  connect: vi.fn(), query: vi.fn(), disconnect: vi.fn(), construct: vi.fn(),
}));
vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor(options: unknown) { mocks.construct(options); }
    $connect = mocks.connect;
    $queryRaw = mocks.query;
    $disconnect = mocks.disconnect;
  },
}));
import { probePreviewDatabase } from '../src/infrastructure/runtime/PreviewDatabaseProbe.js';
import { createPreviewAvailabilityApp } from '../src/infrastructure/runtime/PreviewAvailabilityApp.js';

const env = { VERCEL: '1', VERCEL_ENV: 'preview', MANARATAK_PREVIEW_DATABASE_PROBE: 'true',
  DATABASE_URL: 'postgresql://user:private-test-password@database.invalid:5432/test' };
beforeEach(() => {
  vi.resetAllMocks();
  mocks.connect.mockResolvedValue(undefined);
  mocks.query.mockResolvedValue([{ '?column?': 1 }]);
  mocks.disconnect.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe('Preview database probe', () => {
  it.each([
    { ...env, VERCEL_ENV: 'production' },
    { ...env, VERCEL_ENV: 'development' },
    { ...env, VERCEL: undefined },
    { ...env, MANARATAK_PREVIEW_DATABASE_PROBE: undefined },
    { ...env, MANARATAK_PREVIEW_DATABASE_PROBE: 'false' },
    { ...env, MANARATAK_PREVIEW_DATABASE_PROBE: 'TRUE' },
  ])('does not construct Prisma unless both gates are satisfied', async (input) => {
    expect(await probePreviewDatabase(input)).toMatchObject({ error: 'PREVIEW_DATABASE_PROBE_DISABLED' });
    expect(mocks.construct).not.toHaveBeenCalled();
  });
  it('connects using DATABASE_URL, executes only SELECT 1 and disconnects', async () => {
    expect(await probePreviewDatabase(env)).toMatchObject({ status: 'UP' });
    expect(mocks.connect).toHaveBeenCalledOnce();
    expect(mocks.query).toHaveBeenCalledOnce();
    expect([...mocks.query.mock.calls[0][0]]).toEqual(['SELECT 1']);
    expect(mocks.query.mock.calls[0]).toHaveLength(1);
    const url = new URL(mocks.construct.mock.calls[0][0].datasources.db.url);
    expect(url.hostname).toBe('database.invalid');
    expect(url.password).toBe('private-test-password');
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });
  it.each(['P1000', 'P1001', 'P1002', 'P1011', 'UNKNOWN'])('redacts connection errors (%s)', async (code) => {
    mocks.connect.mockRejectedValue(Object.assign(new Error(env.DATABASE_URL), { code }));
    const result = await probePreviewDatabase(env);
    expect(result.status).toBe('DOWN');
    expect(JSON.stringify(result)).not.toMatch(/private-test-password|database\.invalid|postgresql/);
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });
  it('sanitizes query failures and disconnects', async () => {
    mocks.query.mockRejectedValue(new Error(env.DATABASE_URL));
    expect(await probePreviewDatabase(env)).toMatchObject({ status: 'DOWN', error: 'DATABASE_CONNECTION_OR_READ_FAILED' });
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });
  it('classifies Prisma initialization errorCode without exposing its message', async () => {
    mocks.connect.mockRejectedValue({ errorCode: 'P1001', message: env.DATABASE_URL });
    expect(await probePreviewDatabase(env)).toMatchObject({ status: 'DOWN', error: 'DATABASE_UNREACHABLE' });
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });
  it('sanitizes constructor failure and tolerates disconnect failure', async () => {
    mocks.construct.mockImplementationOnce(() => { throw new Error(env.DATABASE_URL); });
    expect(await probePreviewDatabase(env)).toMatchObject({ status: 'DOWN', error: 'DATABASE_CONNECTION_OR_READ_FAILED' });
    expect(mocks.query).not.toHaveBeenCalled();
    mocks.disconnect.mockRejectedValue(new Error(env.DATABASE_URL));
    expect(await probePreviewDatabase(env)).toMatchObject({ status: 'UP' });
  });
  it.each(['', 'not-a-url', 'file:///secret'])('rejects absent/invalid URLs without Prisma', async (DATABASE_URL) => {
    expect((await probePreviewDatabase({ ...env, DATABASE_URL })).status).toBe('DOWN');
    expect(mocks.construct).not.toHaveBeenCalled();
  });
  it('serves HTTP 200/503 and leaves business routes closed', async () => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    const app = createPreviewAvailabilityApp();
    await request(app).get('/api/v1/monitoring/health/database').expect(200).expect(({ body }) => expect(body.status).toBe('UP'));
    mocks.connect.mockRejectedValue({ code: 'P1001', message: env.DATABASE_URL });
    await request(app).get('/api/v1/monitoring/health/database').expect(503).expect(({ body }) => expect(body.error).toBe('DATABASE_UNREACHABLE'));
    mocks.construct.mockClear();
    await request(app).post('/api/v1/monitoring/health/database').expect(503);
    await request(app).head('/api/v1/monitoring/health/database').expect(503);
    await request(app).get('/api/v1/admin/users').expect(503);
    await request(app).get('/api/v1/monitoring/health/readiness').expect(503);
    expect(mocks.construct).not.toHaveBeenCalled();
    vi.stubEnv('MANARATAK_PREVIEW_DATABASE_PROBE', 'false');
    await request(app).get('/api/v1/monitoring/health/database').expect(503);
    expect(mocks.construct).not.toHaveBeenCalled();
  });
});
