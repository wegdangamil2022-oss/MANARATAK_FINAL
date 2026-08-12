import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { StudentSavedItemType, StudentWorkspaceStatus } from '@manaratak/domain';
import { StudentWorkspaceRouter } from '../../../../src/presentation/api/router/StudentWorkspaceRouter';

describe('StudentWorkspaceRouter', () => {
  const createUseCases = () => ({
    getOrCreateWorkspace: vi.fn(),
    upsertWorkspace: vi.fn(),
    getDashboard: vi.fn(),
    listSavedItems: vi.fn(),
    saveItem: vi.fn(),
    removeSavedItem: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/student', StudentWorkspaceRouter.create({ studentWorkspaceUseCases: useCases as any }));
    return app;
  };

  it('returns a student dashboard summary', async () => {
    const useCases = createUseCases();
    useCases.getDashboard.mockResolvedValue({
      workspace: { studentReferenceId: 'student-1', status: StudentWorkspaceStatus.ACTIVE },
      savedItems: [],
      certificateCount: 1,
      activeCourseEnrollmentCount: 2,
      completedCourseEnrollmentCount: 1
    });
    const app = createApp(useCases);

    const res = await request(app).get('/student/student-1/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.certificateCount).toBe(1);
  });

  it('saves a personal item reference', async () => {
    const useCases = createUseCases();
    useCases.saveItem.mockResolvedValue({
      id: 'saved-1',
      studentReferenceId: 'student-1',
      entityType: StudentSavedItemType.COURSE,
      entityId: 'course-1',
      savedAt: new Date(),
      updatedAt: new Date()
    });
    const app = createApp(useCases);

    const res = await request(app)
      .post('/student/student-1/saved-items')
      .send({ entityType: StudentSavedItemType.COURSE, entityId: 'course-1' });

    expect(res.status).toBe(201);
    expect(useCases.saveItem).toHaveBeenCalledWith(expect.objectContaining({
      studentReferenceId: 'student-1',
      entityType: StudentSavedItemType.COURSE
    }));
  });
});
