import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { ScholarshipPublicRouter } from '../../../../src/presentation/api/router/ScholarshipPublicRouter';

describe('ScholarshipPublicRouter', () => {
  const createMockUseCases = () => ({
    listScholarships: vi.fn(),
    getScholarship: vi.fn(),
  });

  const createApp = (useCases: any) => {
    const app = express();
    app.use(express.json());
    app.use('/public/scholarships', ScholarshipPublicRouter.create({ publicScholarshipUseCases: useCases as any }));
    return app;
  };

  it('GET /public/scholarships calls listScholarships with parsed filters', async () => {
    const useCases = createMockUseCases();
    useCases.listScholarships.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/public/scholarships?studyCountry=USA&page=2&pageSize=100');
    
    expect(res.status).toBe(200);
    // Page size should be bounded to 50
    expect(useCases.listScholarships).toHaveBeenCalledWith({
      studyCountry: 'USA',
      page: 2,
      pageSize: 50
    });
  });

  it('GET /public/scholarships/:slug returns scholarship', async () => {
    const useCases = createMockUseCases();
    useCases.getScholarship.mockResolvedValue({ slug: 'test-slug', displayName: 'Test' });
    const app = createApp(useCases);

    const res = await request(app).get('/public/scholarships/test-slug');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: 'test-slug', displayName: 'Test' });
    expect(useCases.getScholarship).toHaveBeenCalledWith('test-slug');
  });

  it('GET /public/scholarships/:slug returns 404 if not found', async () => {
    const useCases = createMockUseCases();
    useCases.getScholarship.mockRejectedValue(new Error('Scholarship not found'));
    const app = createApp(useCases);

    const res = await request(app).get('/public/scholarships/test-slug');
    
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('returns 500 on unexpected error', async () => {
    const useCases = createMockUseCases();
    useCases.getScholarship.mockRejectedValue(new Error('Database error'));
    const app = createApp(useCases);

    const res = await request(app).get('/public/scholarships/test-slug');
    
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });
});
