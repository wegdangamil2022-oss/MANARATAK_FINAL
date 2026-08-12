import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { CourseAccessType, CourseOriginType } from '@manaratak/domain';
import { CoursePublicRouter } from '../../../../src/presentation/api/router/CoursePublicRouter';

describe('CoursePublicRouter', () => {
  const createMockUseCases = () => ({
    listCourses: vi.fn(),
    getCourse: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createMockUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/public/courses', CoursePublicRouter.create({ publicCourseUseCases: useCases as any }));
    return app;
  };

  it('GET /public/courses parses filters and bounds pageSize', async () => {
    const useCases = createMockUseCases();
    useCases.listCourses.mockResolvedValue({ data: [], total: 0, page: 2, pageSize: 50, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/public/courses?accessType=FREE_CERTIFICATE&originType=EXTERNAL_LINKED_COURSE&platformName=Global%20Learning&page=2&pageSize=100');

    expect(res.status).toBe(200);
    expect(useCases.listCourses).toHaveBeenCalledWith({
      accessType: CourseAccessType.FREE_CERTIFICATE,
      originType: CourseOriginType.EXTERNAL_LINKED_COURSE,
      platformName: 'Global Learning',
      page: 2,
      pageSize: 50
    });
  });

  it('GET /public/courses/:slug returns a public course', async () => {
    const useCases = createMockUseCases();
    useCases.getCourse.mockResolvedValue({ slug: 'intro-data-science', displayName: 'Introduction to Data Science' });
    const app = createApp(useCases);

    const res = await request(app).get('/public/courses/intro-data-science');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: 'intro-data-science', displayName: 'Introduction to Data Science' });
    expect(useCases.getCourse).toHaveBeenCalledWith('intro-data-science');
  });

  it('GET /public/courses/:slug returns 404 when hidden or missing', async () => {
    const useCases = createMockUseCases();
    useCases.getCourse.mockRejectedValue(new Error('Course not found'));
    const app = createApp(useCases);

    const res = await request(app).get('/public/courses/intro-data-science');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
