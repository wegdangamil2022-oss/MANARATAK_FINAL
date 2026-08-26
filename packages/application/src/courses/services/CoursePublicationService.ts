import {
  COURSE_PUBLISHED_EVENT_TYPE,
  CourseAccessType,
  CourseDto,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  ICourseRepository,
  IImportedCourseOperationsRepository,
  ITransactionalCourseRepository,
} from '@manaratak/domain';
import { AtomicDomainMutationCoordinator, AtomicMutationRequestContext } from '../../event-foundation/use-cases/AtomicDomainMutationCoordinator';

const VERIFIED_LINK_STATES = new Set(['VERIFIED_DIRECT', 'REDIRECTED_VALID']);

/** One authoritative publication boundary for every Course origin. */
export class CoursePublicationService {
  public constructor(
    private readonly repository: ICourseRepository,
    private readonly importedOperations?: IImportedCourseOperationsRepository,
    private readonly atomicMutations?: AtomicDomainMutationCoordinator,
  ) {}

  public async assertPublicationReady(course: CourseDto): Promise<void> {
    if (course.completenessStatus !== CourseImportCompletenessState.COMPLETE) {
      throw new Error('COURSE_PUBLICATION_REQUIRES_COMPLETE_RECORD');
    }

    if (course.originType !== CourseOriginType.EXTERNAL_LINKED_COURSE) return;
    if (!this.importedOperations) throw new Error('IMPORTED_COURSE_PUBLICATION_EVIDENCE_NOT_CONFIGURED');

    if (
      course.accessType === CourseAccessType.PAID ||
      (course.isStudyFree !== true && course.isFreeCertificate !== true)
    ) {
      throw new Error('IMPORTED_COURSE_FREE_CATALOG_ELIGIBILITY_REQUIRED');
    }

    const detail = await this.importedOperations.getImportedCourseById(course.id);
    if (!detail) throw new Error('IMPORTED_COURSE_PUBLICATION_EVIDENCE_NOT_FOUND');
    if (!detail.sourceVerified) throw new Error('IMPORTED_COURSE_SOURCE_VERIFICATION_REQUIRED');
    if (!VERIFIED_LINK_STATES.has(detail.linkHealth)) {
      throw new Error(`IMPORTED_COURSE_DIRECT_LINK_VERIFICATION_REQUIRED:${detail.linkHealth}`);
    }
  }

  public async publish(course: CourseDto, context?: AtomicMutationRequestContext): Promise<void> {
    if (course.status !== CourseStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH courses can be PUBLISHED');
    }
    await this.assertPublicationReady(course);

    const transactional = this.repository as Partial<ITransactionalCourseRepository>;
    if (!this.atomicMutations || typeof transactional.withTransaction !== 'function') {
      throw new Error('COURSE_ATOMIC_PUBLICATION_REQUIRED');
    }

    const publishedAt = new Date();
    const publishedVersion = course.version + 1;
    await this.atomicMutations.execute({
      domain: 'COURSES',
      aggregateType: 'COURSE',
      aggregateId: course.id,
      action: 'COURSE_PUBLISHED',
      context,
      outbox: {
        id: `course-published:${course.id}:v${publishedVersion}`,
        eventType: COURSE_PUBLISHED_EVENT_TYPE,
        payload: {
          courseId: course.id,
          publicId: course.publicId,
          slug: course.slug,
          courseVersion: publishedVersion,
          originType: course.originType,
          accessType: course.accessType,
          publishedAt: publishedAt.toISOString(),
          sourcePhase: 'Phase 13 - Learning Platform',
        },
        metadata: { eventVersion: '1.0.0', category: 'LearningPlatform' },
      },
    }, async persistence => {
      const tx = (this.repository as ITransactionalCourseRepository).withTransaction(persistence);
      const current = await tx.findById(course.id);
      if (!current || current.status !== CourseStatus.READY_TO_PUBLISH || current.version !== course.version) {
        throw new Error('COURSE_PUBLICATION_STATE_CHANGED');
      }
      await tx.updateStatus(course.id, CourseStatus.PUBLISHED);
    });
  }
}
