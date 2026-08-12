import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { UniversityPublicRouter } from '../../../../src/presentation/api/router/UniversityPublicRouter';

describe('UniversityPublicRouter', () => {
  const createMockUseCases = () => ({
    listUniversities: vi.fn(),
    getUniversity: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createMockUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/public/universities', UniversityPublicRouter.create({ publicUniversityUseCases: useCases as any }));
    return app;
  };

  it('GET /public/universities parses filters and bounds pageSize', async () => {
    const useCases = createMockUseCases();
    useCases.listUniversities.mockResolvedValue({ data: [], total: 0, page: 2, pageSize: 50, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/public/universities?country=Qatar&institutionType=Public%20University&city=Doha&page=2&pageSize=100');

    expect(res.status).toBe(200);
    expect(useCases.listUniversities).toHaveBeenCalledWith({
      country: 'Qatar',
      institutionType: 'Public University',
      city: 'Doha',
      page: 2,
      pageSize: 50
    });
  });

  it('GET /public/universities/:slug returns a public university', async () => {
    const useCases = createMockUseCases();
    useCases.getUniversity.mockResolvedValue({ slug: 'qatar-university', displayName: 'Qatar University' });
    const app = createApp(useCases);

    const res = await request(app).get('/public/universities/qatar-university');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: 'qatar-university', displayName: 'Qatar University' });
    expect(useCases.getUniversity).toHaveBeenCalledWith('qatar-university');
  });

  it('GET /public/universities/:slug returns 404 when hidden or missing', async () => {
    const useCases = createMockUseCases();
    useCases.getUniversity.mockRejectedValue(new Error('University not found'));
    const app = createApp(useCases);

    const res = await request(app).get('/public/universities/qatar-university');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
