import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { UniversityPublicRouter } from '../../../../src/presentation/api/router/UniversityPublicRouter';

const university = {
  id: 'u1', publicId: 'INS-QA-1', slug: 'qatar-university', canonicalName: 'Qatar University', canonicalDedupKey: 'qu',
  displayName: 'Qatar University', status: 'PUBLISHED', completenessStatus: 'COMPLETE',
  translations: [{ locale: 'ar', displayName: 'جامعة قطر', reviewStatus: 'PUBLISHED' }],
};

describe('UniversityPublicRouter locale contract', () => {
  const createRepository = () => ({ listPublished: vi.fn(), findBySlug: vi.fn() });
  const createApp = (repository: ReturnType<typeof createRepository>) => {
    const app = express();
    const referenceDataRepository = { getCountry: vi.fn().mockResolvedValue({ id: 'country-qa', iso2Code: 'QA' }) };
    app.use('/public/universities', UniversityPublicRouter.create({ universityRepository: repository as any, referenceDataRepository: referenceDataRepository as any }));
    return app;
  };

  it('projects list responses with requested locale and preserves filters', async () => {
    const repository = createRepository();
    repository.listPublished.mockResolvedValue({ data: [university], total: 1, page: 1, pageSize: 20, totalPages: 1 });
    const res = await request(createApp(repository)).get('/public/universities?country=Qatar&locale=ar');
    expect(res.status).toBe(200);
    expect(res.body.data[0].displayName).toBe('جامعة قطر');
    expect(repository.listPublished).toHaveBeenCalledWith(expect.objectContaining({ countryReferenceId: 'country-qa' }));
  });

  it('rejects unsupported locale', async () => {
    const repository = createRepository();
    const res = await request(createApp(repository)).get('/public/universities?locale=fr');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('UNSUPPORTED_LOCALE');
  });
});
