import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { InternationalTestPublicRouter } from '../../../../src/presentation/api/router/InternationalTestPublicRouter';
import { InternationalTestCategory, InternationalTestCompletenessStatus } from '@manaratak/domain';

describe('InternationalTestPublicRouter', () => {
  const createMockUseCases = () => ({
    listPublished: vi.fn(),
    getPublishedBySlug: vi.fn()
  });

  const createApp = (useCases: any) => {
    const app = express();
    app.use(express.json());
    app.use('/public/international-tests', InternationalTestPublicRouter.create({ internationalTestPublicUseCases: useCases as any }));
    return app;
  };

  it('GET /public/international-tests calls listPublished with parsed query params', async () => {
    const useCases = createMockUseCases();
    useCases.listPublished.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/public/international-tests?testCategory=LANGUAGE_PROFICIENCY&page=1');

    expect(res.status).toBe(200);
    expect(useCases.listPublished).toHaveBeenCalledWith({
      testCategory: InternationalTestCategory.LANGUAGE_PROFICIENCY,
      page: 1,
      pageSize: 20
    });
  });

  it('GET /public/international-tests/:slug calls getPublishedBySlug', async () => {
    const useCases = createMockUseCases();
    const mockTest = { id: 'test-1', slug: 'ielts-academic', canonicalName: 'IELTS Academic' };
    useCases.getPublishedBySlug.mockResolvedValue(mockTest);
    const app = createApp(useCases);

    const res = await request(app).get('/public/international-tests/ielts-academic');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTest);
    expect(useCases.getPublishedBySlug).toHaveBeenCalledWith('ielts-academic');
  });

  it('GET /public/international-tests/:slug returns 404 when test is not found', async () => {
    const useCases = createMockUseCases();
    useCases.getPublishedBySlug.mockRejectedValue(new Error('International test not found'));
    const app = createApp(useCases);

    const res = await request(app).get('/public/international-tests/non-existent');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'International test not found' });
  });
});
