import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseAccessType,
  CourseCompletionStatus,
  CourseImportCompletenessState,
  CourseLessonType,
  CourseOriginType,
  CourseProgressStatus,
  CourseStatus,
  ICourseCurriculumRepository,
  ICourseProgressRepository,
  ICourseRepository
} from '@manaratak/domain';
import { CourseProgressUseCases } from '../../src/courses/use-cases/CourseProgressUseCases';
import { ICourseCompletionEventPublisher } from '../../src/courses/gateways/ICourseCompletionEventPublisher';

describe('CourseProgressUseCases', () => {
  let courseRepo: ICourseRepository;
  let curriculumRepo: ICourseCurriculumRepository;
  let progressRepo: ICourseProgressRepository;
  let completionEventPublisher: ICourseCompletionEventPublisher;
  let useCases: CourseProgressUseCases;

  const nativeCourse = {
    id: 'course-1',
    publicId: 'crs-1',
    slug: 'native-course',
    canonicalName: 'Native Course',
    canonicalDedupKey: 'native-course',
    displayName: 'Native Course',
    accessType: CourseAccessType.FREE_CERTIFICATE,
    originType: CourseOriginType.NATIVE_MANARATAK_COURSE,
    directCourseUrl: '/courses/native-course',
    status: CourseStatus.PUBLISHED,
    completenessStatus: CourseImportCompletenessState.COMPLETE,
    certificateAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    courseRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findByDedupKey: vi.fn(),
      findById: vi.fn().mockResolvedValue(nativeCourse),
      findByPublicId: vi.fn(),
      findBySlug: vi.fn(),
      updateStatus: vi.fn(),
      updateImportLink: vi.fn(),
      listByStatus: vi.fn(),
      list: vi.fn(),
      listPublished: vi.fn(),
    };

    curriculumRepo = {
      createModule: vi.fn(),
      updateModule: vi.fn(),
      listModulesByCourseId: vi.fn(),
      createLesson: vi.fn(),
      updateLesson: vi.fn(),
      listLessonsByModuleId: vi.fn(),
      attachAssetToLesson: vi.fn(),
      listAssetsByLessonId: vi.fn(),
      createQuiz: vi.fn(),
      listQuizzesByCourseId: vi.fn(),
      createQuestionBank: vi.fn(),
      createQuestion: vi.fn(),
      listQuestionsByQuizId: vi.fn(),
      getCurriculumSnapshot: vi.fn().mockResolvedValue({
        modules: [],
        lessons: [
          { id: 'lesson-1', lessonType: CourseLessonType.VIDEO },
          { id: 'lesson-2', lessonType: CourseLessonType.ARTICLE }
        ],
        assets: [],
        quizzes: [],
        questionBanks: [],
        questions: []
      }),
    };

    progressRepo = {
      enroll: vi.fn().mockResolvedValue({ id: 'enrollment-1' }),
      findEnrollment: vi.fn().mockResolvedValue({ id: 'enrollment-1', progressPercentage: 100 }),
      updateEnrollmentProgress: vi.fn(),
      upsertLessonProgress: vi.fn(),
      listLessonProgress: vi.fn().mockResolvedValue([
        { lessonId: 'lesson-1', status: CourseProgressStatus.COMPLETED },
        { lessonId: 'lesson-2', status: CourseProgressStatus.COMPLETED }
      ]),
      createQuizAttempt: vi.fn().mockResolvedValue({ id: 'attempt-1' }),
      submitQuizAttempt: vi.fn().mockResolvedValue({ id: 'attempt-1' }),
      listQuizAttempts: vi.fn().mockResolvedValue([]),
      completeCourse: vi.fn().mockResolvedValue({
        id: 'completion-1',
        completedAt: new Date('2026-01-01T00:00:00.000Z'),
        eligibleForCertificate: true
      }),
      findCompletion: vi.fn(),
      getStudentProgressSnapshot: vi.fn().mockResolvedValue({
        enrollment: { id: 'enrollment-1', progressPercentage: 100 },
        lessons: [],
        quizAttempts: [],
        completion: null
      }),
    };

    completionEventPublisher = {
      publishCourseCompleted: vi.fn()
    };

    useCases = new CourseProgressUseCases(courseRepo, curriculumRepo, progressRepo, completionEventPublisher);
  });

  it('enrolls students into native courses only', async () => {
    await useCases.enroll('course-1', 'student-1');

    expect(progressRepo.enroll).toHaveBeenCalledWith({
      courseId: 'course-1',
      studentReferenceId: 'student-1'
    });
  });

  it('rejects progress tracking for external linked courses', async () => {
    courseRepo.findById = vi.fn().mockResolvedValue({
      ...nativeCourse,
      originType: CourseOriginType.EXTERNAL_LINKED_COURSE
    });

    await expect(useCases.enroll('course-1', 'student-1')).rejects.toThrow('External linked courses');
    expect(progressRepo.enroll).not.toHaveBeenCalled();
  });

  it('recalculates enrollment percentage when lessons are completed', async () => {
    await useCases.markLessonProgress({
      courseId: 'course-1',
      lessonId: 'lesson-1',
      studentReferenceId: 'student-1',
      status: CourseProgressStatus.IN_PROGRESS,
      progressPercentage: 100
    });

    expect(progressRepo.upsertLessonProgress).toHaveBeenCalledWith(expect.objectContaining({
      status: CourseProgressStatus.COMPLETED,
      progressPercentage: 100
    }));
    expect(progressRepo.updateEnrollmentProgress).toHaveBeenCalledWith('course-1', 'student-1', 100);
  });

  it('creates certificate-ready completion signals without issuing certificates', async () => {
    await useCases.completeCourse('course-1', 'student-1');

    expect(progressRepo.completeCourse).toHaveBeenCalledWith(expect.objectContaining({
      status: CourseCompletionStatus.CERTIFICATE_SIGNAL_READY,
      eligibleForCertificate: true,
      completionSource: 'PHASE_13_LEARNING_PROGRESS'
    }));
    expect(completionEventPublisher.publishCourseCompleted).toHaveBeenCalledWith(expect.objectContaining({
      courseId: 'course-1',
      studentReferenceId: 'student-1',
      completionId: 'completion-1',
      eligibleForCertificate: true,
      certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
      sourcePhase: 'Phase 13 - Learning Platform'
    }));
  });

  it('does not publish duplicate completion events when completion already exists', async () => {
    progressRepo.findCompletion = vi.fn().mockResolvedValue({ id: 'completion-existing' });

    await useCases.completeCourse('course-1', 'student-1');

    expect(progressRepo.completeCourse).not.toHaveBeenCalled();
    expect(completionEventPublisher.publishCourseCompleted).not.toHaveBeenCalled();
  });
});
