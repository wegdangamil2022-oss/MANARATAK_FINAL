import { describe, expect, it, vi } from 'vitest';
import { StudentSavedItemType, StudentWorkspaceStatus } from '@manaratak/domain';
import { PrismaStudentWorkspaceRepository } from '../../src/students/PrismaStudentWorkspaceRepository';

const workspace = {
  id: 'workspace-1',
  studentReferenceId: 'student-1',
  status: StudentWorkspaceStatus.ACTIVE,
  version: 1,
  layoutPreferences: {},
  notificationMatrix: {},
  privacyPreferences: {},
  accessibilityPreferences: {},
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PrismaStudentWorkspaceRepository', () => {
  it('composes learning and certificate projections without duplicating ownership', async () => {
    const db = {
      studentWorkspace: { findUnique: vi.fn().mockResolvedValue(workspace) },
      studentSavedItem: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      studentSavedCollection: { findMany: vi.fn().mockResolvedValue([]) },
      studentTimelineEntry: { findMany: vi.fn().mockResolvedValue([]) },
      studentRecentActivity: { findMany: vi.fn().mockResolvedValue([]) },
      courseEnrollment: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'enrollment-1',
            courseId: 'course-1',
            status: 'ACTIVE',
            progressPercentage: 65,
            enrolledAt: new Date(),
            lastAccessedAt: new Date(),
            completedAt: null,
            course: { id: 'course-1', slug: 'arabic-course', displayName: 'دورة عربية' },
          },
        ]),
        count: vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
        aggregate: vi.fn().mockResolvedValue({ _avg: { progressPercentage: 65 } }),
      },
      certificate: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'certificate-1',
            publicId: 'public-1',
            serialNumber: 'CERT-1',
            verificationCode: 'VERIFY-1',
            status: 'ACTIVE',
            courseDisplayName: 'دورة عربية',
            issuedAt: new Date(),
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
      },
      studentNotificationProjection: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
    };
    const repository = new PrismaStudentWorkspaceRepository(db as any);

    const result = await repository.getDashboardSummary('student-1');

    expect(result?.activeCourseEnrollmentCount).toBe(1);
    expect(result?.certificateCount).toBe(1);
    expect(result?.courseEnrollments[0].courseName).toBe('دورة عربية');
    expect(result?.partialFailures).toEqual([]);
  });

  it('creates the workspace, default favorites and outbox atomically', async () => {
    const tx = {
      studentWorkspace: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(workspace),
      },
      studentSavedCollection: { create: vi.fn().mockResolvedValue({}) },
      transactionalOutboxRecord: { create: vi.fn().mockResolvedValue({}) },
    };
    const repository = new PrismaStudentWorkspaceRepository({
      $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
    } as any);

    await repository.upsertWorkspace({ studentReferenceId: 'student-1' });

    expect(tx.studentSavedCollection.create).toHaveBeenCalledOnce();
    expect(tx.transactionalOutboxRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: 'StudentWorkspaceCreated' }),
      }),
    );
  });

  it('blocks personal mutations while the workspace is suspended', async () => {
    const tx = {
      studentWorkspace: {
        findUnique: vi
          .fn()
          .mockResolvedValue({ ...workspace, status: StudentWorkspaceStatus.SUSPENDED }),
      },
      studentSavedItem: { upsert: vi.fn() },
    };
    const repository = new PrismaStudentWorkspaceRepository({
      $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
    } as any);

    await expect(
      repository.saveItem({
        studentReferenceId: 'student-1',
        entityType: StudentSavedItemType.COURSE,
        entityId: 'course-1',
      }),
    ).rejects.toThrow('STUDENT_WORKSPACE_SUSPENDED');
    expect(tx.studentSavedItem.upsert).not.toHaveBeenCalled();
  });

  it('deduplicates upstream events before projecting timeline and notifications', async () => {
    const tx = {
      studentWorkspaceEventInbox: {
        findUnique: vi.fn().mockResolvedValue({ id: 'existing-inbox' }),
        create: vi.fn(),
        update: vi.fn(),
      },
      studentWorkspace: { findUnique: vi.fn() },
      studentTimelineEntry: { create: vi.fn() },
      studentNotificationProjection: { create: vi.fn() },
    };
    const repository = new PrismaStudentWorkspaceRepository({
      $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
    } as any);

    const processed = await repository.ingestIntegrationEvent({
      eventId: 'event-1',
      studentReferenceId: 'student-1',
      eventType: 'CourseCompleted',
      sourceDomain: 'LEARNING',
      title: 'أكملت دورة',
      occurredAt: new Date(),
    });

    expect(processed).toBe(false);
    expect(tx.studentTimelineEntry.create).not.toHaveBeenCalled();
    expect(tx.studentNotificationProjection.create).not.toHaveBeenCalled();
  });
});
