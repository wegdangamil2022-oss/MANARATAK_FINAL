import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { AdminCmsUseCases } from '@manaratak/application';
import { CmsAdminRouter } from '../../../../src/presentation/api/router/CmsAdminRouter';

describe('Phase 16 CMS admin router', () => {
  const useCases = () => ({
    listContent: vi.fn(),
    createContent: vi.fn(),
    getContent: vi.fn(),
    updateContent: vi.fn(),
    upsertLocalizedContent: vi.fn(),
    getReadiness: vi.fn(),
    listRevisions: vi.fn(),
    restoreRevision: vi.fn(),
    submitForReview: vi.fn(),
    approveReview: vi.fn(),
    rejectReview: vi.fn(),
    publish: vi.fn(),
    archive: vi.fn(),
    schedule: vi.fn(),
    listCategories: vi.fn(),
    createCategory: vi.fn(),
    listTags: vi.fn(),
    createTag: vi.fn(),
  });
  const app = (cms: ReturnType<typeof useCases>, actorId?: string) => {
    const server = express();
    server.use(express.json());
    if (actorId)
      server.use((req, _res, next) => {
        req.authUserId = actorId;
        next();
      });
    server.use(
      '/cms',
      CmsAdminRouter.create({ adminCmsUseCases: cms as unknown as AdminCmsUseCases }),
    );
    return server;
  };

  it('derives the author from authentication and applies Arabic-first defaults', async () => {
    const cms = useCases();
    cms.createContent.mockResolvedValue({ id: 'content-1' });
    const response = await request(app(cms, 'editor-1'))
      .post('/cms/content')
      .send({ slug: 'arabic-guide', title: 'دليل عربي', contentType: 'ARTICLE' });
    expect(response.status).toBe(201);
    expect(cms.createContent).toHaveBeenCalledWith(
      expect.objectContaining({ primaryLocale: 'ar', siteIdentifier: 'manaratak' }),
      'editor-1',
    );
  });

  it('rejects unauthenticated writes', async () => {
    const cms = useCases();
    const response = await request(app(cms))
      .post('/cms/content')
      .send({ slug: 'arabic-guide', title: 'دليل عربي', contentType: 'ARTICLE' });
    expect(response.status).toBe(403);
    expect(cms.createContent).not.toHaveBeenCalled();
  });

  it('does not accept spoofed actor identity from a review body', async () => {
    const cms = useCases();
    cms.submitForReview.mockResolvedValue({ state: 'IN_REVIEW' });
    const response = await request(app(cms, 'editor-1'))
      .post('/cms/content/content-1/submit-review')
      .send({ locale: 'ar', expectedVersion: 2, actorId: 'spoofed' });
    expect(response.status).toBe(200);
    expect(cms.submitForReview).toHaveBeenCalledWith('content-1', 'ar', 'editor-1', 2, undefined);
  });
});
