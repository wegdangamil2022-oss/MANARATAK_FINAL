import {
  COURSE_COMPLETED_EVENT_CATEGORY,
  COURSE_COMPLETED_EVENT_TYPE,
  COURSE_COMPLETED_EVENT_VERSION,
  CourseCompletedEventPayload
} from '@manaratak/domain';
import { ManageEnterpriseEventsUseCase } from '../../event-foundation/use-cases/ManageEnterpriseEventsUseCase';
import { ICourseCompletionEventPublisher } from './ICourseCompletionEventPublisher';

export class EnterpriseCourseCompletionEventPublisher implements ICourseCompletionEventPublisher {
  constructor(private readonly eventsUseCase: ManageEnterpriseEventsUseCase) {}

  public async publishCourseCompleted(payload: CourseCompletedEventPayload): Promise<void> {
    const reference = `course-completed:${payload.courseId}:${payload.studentReferenceId}:${payload.completionId}`;

    await this.eventsUseCase.register({
      reference,
      ownerReference: 'phase-13-learning-platform',
      type: COURSE_COMPLETED_EVENT_TYPE,
      category: COURSE_COMPLETED_EVENT_CATEGORY,
      version: COURSE_COMPLETED_EVENT_VERSION,
      payloadMetadata: {
        courseId: payload.courseId,
        studentReferenceId: payload.studentReferenceId,
        completedAt: payload.completedAt,
        completionId: payload.completionId,
        eligibleForCertificate: payload.eligibleForCertificate,
        certificateOwnerPhase: payload.certificateOwnerPhase,
        sourcePhase: payload.sourcePhase
      },
      metadata: {
        boundary: 'Phase 13 emits completion signal only; Phase 14 owns certificate generation.'
      },
      correlationReference: `course:${payload.courseId}`,
      causationReference: `completion:${payload.completionId}`
    });

    await this.eventsUseCase.publish({ reference });
  }
}
