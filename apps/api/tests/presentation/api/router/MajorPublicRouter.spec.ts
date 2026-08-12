import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { MajorPublicRouter } from '../../../../src/presentation/api/router/MajorPublicRouter';

describe('MajorPublicRouter', () => {
  const createMockUseCases = () => ({
    listMajors: vi.fn(),
    getMajor: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createMockUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/public/majors', MajorPublicRouter.create({ publicMajorUseCases: useCases as any }));
    return app;
  };

  it('GET /public/majors parses filters and bounds pageSize', async () => {
    const useCases = createMockUseCases();
    useCases.listMajors.mockResolvedValue({ data: [], total: 0, page: 2, pageSize: 50, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/public/majors?degreeLevel=Bachelor&academicFieldOrDiscipline=Computing&collegeOrFaculty=Engineering&page=2&pageSize=100');

    expect(res.status).toBe(200);
    expect(useCases.listMajors).toHaveBeenCalledWith({
      degreeLevel: 'Bachelor',
      academicFieldOrDiscipline: 'Computing',
      collegeOrFaculty: 'Engineering',
      page: 2,
      pageSize: 50
    });
  });

  it('GET /public/majors/:slug returns a public major', async () => {
    const useCases = createMockUseCases();
    useCases.getMajor.mockResolvedValue({ slug: 'computer-science', displayName: 'Computer Science' });
    const app = createApp(useCases);

    const res = await request(app).get('/public/majors/computer-science');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: 'computer-science', displayName: 'Computer Science' });
    expect(useCases.getMajor).toHaveBeenCalledWith('computer-science');
  });

  it('GET /public/majors/:slug returns 404 when hidden or missing', async () => {
    const useCases = createMockUseCases();
    useCases.getMajor.mockRejectedValue(new Error('Major not found'));
    const app = createApp(useCases);

    const res = await request(app).get('/public/majors/computer-science');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
