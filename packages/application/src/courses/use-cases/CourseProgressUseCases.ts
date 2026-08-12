import {
  CourseCompletionStatus,
  CourseDto,
  CourseOriginType,
  CourseProgressStatus,
  CourseQuizAttemptDto,
  CreateQuizAttemptDto,
  ICourseCurriculumRepository,
  ICourseProgressRepository,
  ICourseRepository,
  StudentCourseProgressSnapshotDto,
  SubmitQuizAttemptDto,
  UpsertLessonProgressDto
} from '@manaratak/domain';
import { ICourseCompletionEventPublisher } from '../gateways/ICourseCompletionEventPublisher';

export class CourseProgressUseCases {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly curriculumRepository: ICourseCurriculumRepository,
    private readonly progressRepository: ICourseProgressRepository,
    private readonly completionEventPublisher?: ICourseCompletionEventPublisher
  ) {}

  private async ensureTrackableCourse(courseId: string): Promise<CourseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error(`Course with id ${courseId} not found`);
    }
    if (course.originType === CourseOriginType.EXTERNAL_LINKED_COURSE) {
      throw new Error('External linked courses do not support MANARATAK enrollment or local progress tracking');
    }
    return course;
  }

  private async recalculateEnrollmentProgress(courseId: string, studentReferenceId: string): Promise<number> {
    const snapshot = await this.curriculumRepository.getCurriculumSnapshot(courseId);
    const trackableLessons = snapshot.lessons.filter((lesson) => lesson.lessonType !== 'QUIZ');
    if (trackableLessons.length === 0) {
      return 0;
    }

    const progress = await this.progressRepository.listLessonProgress(courseId, studentReferenceId);
    const completedLessonIds = new Set(
      progress
        .filter((record) => record.status === CourseProgressStatus.COMPLETED)
        .map((record) => record.lessonId)
    );
    const percentage = Math.floor((completedLessonIds.size / trackableLessons.length) * 100);
    await this.progressRepository.updateEnrollmentProgress(courseId, studentReferenceId, percentage);
    return percentage;
  }

  public async enroll(courseId: string, studentReferenceId: string): Promise<StudentCourseProgressSnapshotDto> {
    await this.ensureTrackableCourse(courseId);
    await this.progressRepository.enroll({ courseId, studentReferenceId });
    const snapshot = await this.progressRepository.getStudentProgressSnapshot(courseId, studentReferenceId);
    if (!snapshot) {
      throw new Error('Enrollment snapshot could not be created');
    }
    return snapshot;
  }

  public async markLessonProgress(data: UpsertLessonProgressDto): Promise<StudentCourseProgressSnapshotDto> {
    await this.ensureTrackableCourse(data.courseId);
    const enrollment = await this.progressRepository.findEnrollment(data.courseId, data.studentReferenceId);
    if (!enrollment) {
      throw new Error('Student must be enrolled before lesson progress can be tracked');
    }

    const normalizedPercentage = Math.max(0, Math.min(100, data.progressPercentage));
    const normalizedStatus = normalizedPercentage >= 100 ? CourseProgressStatus.COMPLETED : data.status;

    await this.progressRepository.upsertLessonProgress({
      ...data,
      status: normalizedStatus,
      progressPercentage: normalizedPercentage
    });
    await this.recalculateEnrollmentProgress(data.courseId, data.studentReferenceId);

    const snapshot = await this.progressRepository.getStudentProgressSnapshot(data.courseId, data.studentReferenceId);
    if (!snapshot) {
      throw new Error('Progress snapshot could not be loaded');
    }
    return snapshot;
  }

  public async startQuizAttempt(data: CreateQuizAttemptDto): Promise<CourseQuizAttemptDto> {
    await this.ensureTrackableCourse(data.courseId);
    const enrollment = await this.progressRepository.findEnrollment(data.courseId, data.studentReferenceId);
    if (!enrollment) {
      throw new Error('Student must be enrolled before starting quiz attempts');
    }
    return this.progressRepository.createQuizAttempt(data);
  }

  public async submitQuizAttempt(data: SubmitQuizAttemptDto): Promise<CourseQuizAttemptDto> {
    return this.progressRepository.submitQuizAttempt(data);
  }

  public async completeCourse(courseId: string, studentReferenceId: string): Promise<StudentCourseProgressSnapshotDto> {
    const course = await this.ensureTrackableCourse(courseId);
    const enrollment = await this.progressRepository.findEnrollment(courseId, studentReferenceId);
    if (!enrollment) {
      throw new Error('Student must be enrolled before course completion');
    }
    if (enrollment.progressPercentage < 100) {
      throw new Error('Course cannot be completed before progress reaches 100%');
    }

    const existingCompletion = await this.progressRepository.findCompletion(courseId, studentReferenceId);
    if (existingCompletion) {
      const snapshot = await this.progressRepository.getStudentProgressSnapshot(courseId, studentReferenceId);
      if (!snapshot) {
        throw new Error('Completion snapshot could not be loaded');
      }
      return snapshot;
    }

    const completion = await this.progressRepository.completeCourse({
      courseId,
      studentReferenceId,
      status: course.certificateAvailable ? CourseCompletionStatus.CERTIFICATE_SIGNAL_READY : CourseCompletionStatus.COMPLETED,
      completionSource: 'PHASE_13_LEARNING_PROGRESS',
      eligibleForCertificate: Boolean(course.certificateAvailable),
      metadata: {
        phase14OwnsCertificateIssuance: true
      }
    });

    if (this.completionEventPublisher) {
      await this.completionEventPublisher.publishCourseCompleted({
        courseId,
        studentReferenceId,
        completionId: completion.id,
        completedAt: completion.completedAt,
        eligibleForCertificate: completion.eligibleForCertificate,
        certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
        sourcePhase: 'Phase 13 - Learning Platform'
      });
    }

    const snapshot = await this.progressRepository.getStudentProgressSnapshot(courseId, studentReferenceId);
    if (!snapshot) {
      throw new Error('Completion snapshot could not be loaded');
    }
    return snapshot;
  }

  public async getProgress(courseId: string, studentReferenceId: string): Promise<StudentCourseProgressSnapshotDto | null> {
    await this.ensureTrackableCourse(courseId);
    return this.progressRepository.getStudentProgressSnapshot(courseId, studentReferenceId);
  }
}
