import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { UniversityStatus } from '@manaratak/domain';
import { UniversityAdminRouter } from '../../../../src/presentation/api/router/UniversityAdminRouter';

describe('UniversityAdminRouter', () => {
  const createMockUseCases = () => ({
    listUniversities: vi.fn(),
    getUniversity: vi.fn(),
    updateUniversity: vi.fn(),
    markReadyToReview: vi.fn(),
    markReadyToPublish: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    reject: vi.fn(),
    archive: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createMockUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/admin/universities', UniversityAdminRouter.create({ adminUniversityUseCases: useCases as any }));
    return app;
  };

  it('GET /admin/universities calls listUniversities with parsed filters', async () => {
    const useCases = createMockUseCases();
    useCases.listUniversities.mockResolvedValue({ data: [], total: 0, page: 2, pageSize: 20, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/admin/universities?status=READY_TO_REVIEW&country=Qatar&page=2');

    expect(res.status).toBe(200);
    expect(useCases.listUniversities).toHaveBeenCalledWith({
      status: UniversityStatus.READY_TO_REVIEW,
      country: 'Qatar',
      page: 2,
      pageSize: 20
    });
  });

  it('PATCH /admin/universities/:id validates body and strips readonly fields', async () => {
    const useCases = createMockUseCases();
    useCases.updateUniversity.mockResolvedValue({ id: 'uni-1' });
    const app = createApp(useCases);

    const res = await request(app)
      .patch('/admin/universities/uni-1')
      .send({
        id: 'injected',
        publicId: 'injected-public',
        displayName: 'Updated Qatar University',
        officialWebsite: 'https://www.qu.edu.qa'
      });

    expect(res.status).toBe(200);
    expect(useCases.updateUniversity).toHaveBeenCalledWith('uni-1', expect.objectContaining({
      displayName: 'Updated Qatar University',
      officialWebsite: 'https://www.qu.edu.qa'
    }));
    expect(useCases.updateUniversity).toHaveBeenCalledWith('uni-1', expect.not.objectContaining({
      id: 'injected',
      publicId: 'injected-public'
    }));
  });

  it('POST /admin/universities/:id/publish calls publish', async () => {
    const useCases = createMockUseCases();
    useCases.publish.mockResolvedValue(undefined);
    const app = createApp(useCases);

    const res = await request(app).post('/admin/universities/uni-1/publish');

    expect(res.status).toBe(200);
    expect(useCases.publish).toHaveBeenCalledWith('uni-1');
  });

  it('returns 400 on use case errors', async () => {
    const useCases = createMockUseCases();
    useCases.publish.mockRejectedValue(new Error('Only READY_TO_PUBLISH universities can be PUBLISHED'));
    const app = createApp(useCases);

    const res = await request(app).post('/admin/universities/uni-1/publish');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Only READY_TO_PUBLISH universities can be PUBLISHED' });
  });
});
