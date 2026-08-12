import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { CmsContentType } from '@manaratak/domain';
import { CmsPublicRouter } from '../../../../src/presentation/api/router/CmsPublicRouter';

describe('CmsPublicRouter', () => {
  const createUseCases = () => ({
    listPublished: vi.fn(),
    getBySlug: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/cms', CmsPublicRouter.create({ publicCmsUseCases: useCases as any }));
    return app;
  };

  it('lists published CMS content with locale', async () => {
    const useCases = createUseCases();
    useCases.listPublished.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/cms/content?contentType=ARTICLE&locale=en');

    expect(res.status).toBe(200);
    expect(useCases.listPublished).toHaveBeenCalledWith(expect.objectContaining({
      contentType: CmsContentType.ARTICLE
    }), 'en');
  });

  it('returns 404 for unpublished or missing content', async () => {
    const useCases = createUseCases();
    useCases.getBySlug.mockRejectedValue(new Error('CMS content not found'));
    const app = createApp(useCases);

    const res = await request(app).get('/cms/content/missing');

    expect(res.status).toBe(404);
  });
});
