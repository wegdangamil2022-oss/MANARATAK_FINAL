import { describe, expect, it, vi } from 'vitest';
import { EnterpriseCourseCompletionEventPublisher } from '../../src/courses/gateways/EnterpriseCourseCompletionEventPublisher';

describe('EnterpriseCourseCompletionEventPublisher', () => {
  it('registers and publishes CourseCompleted events through Event Foundation', async () => {
    const eventsUseCase = {
      register: vi.fn().mockResolvedValue({ reference: 'event-1' }),
      publish: vi.fn().mockResolvedValue(undefined)
    };
    const publisher = new EnterpriseCourseCompletionEventPublisher(eventsUseCase as any);

    await publisher.publishCourseCompleted({
      courseId: 'course-1',
      studentReferenceId: 'student-1',
      completionId: 'completion-1',
      completedAt: new Date('2026-01-01T00:00:00.000Z'),
      eligibleForCertificate: true,
      certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
      sourcePhase: 'Phase 13 - Learning Platform'
    });

    expect(eventsUseCase.register).toHaveBeenCalledWith(expect.objectContaining({
      reference: 'course-completed:course-1:student-1:completion-1',
      ownerReference: 'phase-13-learning-platform',
      type: 'CourseCompleted',
      category: 'LearningPlatform',
      version: '1.0.0',
      payloadMetadata: expect.objectContaining({
        courseId: 'course-1',
        eligibleForCertificate: true,
        certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform'
      })
    }));
    expect(eventsUseCase.publish).toHaveBeenCalledWith({
      reference: 'course-completed:course-1:student-1:completion-1'
    });
  });
});
