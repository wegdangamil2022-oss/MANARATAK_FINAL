import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseAccessType,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  CourseLessonType,
  ICourseCurriculumRepository,
  ICourseRepository,
  LessonAssetType
} from '@manaratak/domain';
import { CourseCurriculumUseCases } from '../../src/courses/use-cases/CourseCurriculumUseCases';

describe('CourseCurriculumUseCases', () => {
  let courseRepo: ICourseRepository;
  let curriculumRepo: ICourseCurriculumRepository;
  let useCases: CourseCurriculumUseCases;

  beforeEach(() => {
    courseRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findByDedupKey: vi.fn(),
      findById: vi.fn(),
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
      getCurriculumSnapshot: vi.fn(),
    };

    useCases = new CourseCurriculumUseCases(courseRepo, curriculumRepo);
  });

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
    status: CourseStatus.READY_TO_REVIEW,
    completenessStatus: CourseImportCompletenessState.COMPLETE,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('allows modules to be created only for authorable native courses', async () => {
    courseRepo.findById = vi.fn().mockResolvedValue(nativeCourse);
    curriculumRepo.createModule = vi.fn().mockResolvedValue({ id: 'module-1' });

    await useCases.createModule({
      courseId: 'course-1',
      title: 'Introduction',
      position: 1
    });

    expect(curriculumRepo.createModule).toHaveBeenCalledWith({
      courseId: 'course-1',
      title: 'Introduction',
      position: 1
    });
  });

  it('rejects native curriculum creation for external linked courses', async () => {
    courseRepo.findById = vi.fn().mockResolvedValue({
      ...nativeCourse,
      originType: CourseOriginType.EXTERNAL_LINKED_COURSE
    });

    await expect(useCases.createLesson({
      courseId: 'course-1',
      moduleId: 'module-1',
      title: 'External lesson',
      lessonType: CourseLessonType.VIDEO,
      position: 1
    })).rejects.toThrow('External linked courses cannot own native curriculum content');

    expect(curriculumRepo.createLesson).not.toHaveBeenCalled();
  });

  it('rejects raw URLs when attaching lesson assets', async () => {
    await expect(useCases.attachAssetToLesson({
      lessonId: 'lesson-1',
      assetId: 'https://cdn.example.com/video.mp4',
      assetType: LessonAssetType.VIDEO,
      position: 1
    })).rejects.toThrow('must not store raw URLs');

    expect(curriculumRepo.attachAssetToLesson).not.toHaveBeenCalled();
  });

  it('allows Phase 05 EAP asset handles for lesson assets', async () => {
    curriculumRepo.attachAssetToLesson = vi.fn().mockResolvedValue({ id: 'asset-ref-1' });

    await useCases.attachAssetToLesson({
      lessonId: 'lesson-1',
      assetId: 'asset-video-1',
      assetReference: 'asset-ref-video-1',
      assetType: LessonAssetType.VIDEO,
      position: 1
    });

    expect(curriculumRepo.attachAssetToLesson).toHaveBeenCalledWith(expect.objectContaining({
      assetId: 'asset-video-1',
      assetReference: 'asset-ref-video-1'
    }));
  });
});
