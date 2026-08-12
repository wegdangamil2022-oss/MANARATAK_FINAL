import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { CourseAccessType, CourseLessonType, CourseStatus, LessonAssetType } from '@manaratak/domain';
import { CourseAdminRouter } from '../../../../src/presentation/api/router/CourseAdminRouter';

describe('CourseAdminRouter', () => {
  const createMockUseCases = () => ({
    listCourses: vi.fn(),
    getCourse: vi.fn(),
    updateCourse: vi.fn(),
    markReadyToReview: vi.fn(),
    markReadyToPublish: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    reject: vi.fn(),
    archive: vi.fn(),
  });

  const createMockCurriculumUseCases = () => ({
    createModule: vi.fn(),
    updateModule: vi.fn(),
    listModules: vi.fn(),
    createLesson: vi.fn(),
    updateLesson: vi.fn(),
    listLessons: vi.fn(),
    attachAssetToLesson: vi.fn(),
    listLessonAssets: vi.fn(),
    createQuiz: vi.fn(),
    listQuizzes: vi.fn(),
    createQuestionBank: vi.fn(),
    createQuestion: vi.fn(),
    listQuizQuestions: vi.fn(),
    getCurriculumSnapshot: vi.fn(),
  });

  const createApp = (
    useCases: ReturnType<typeof createMockUseCases>,
    curriculumUseCases = createMockCurriculumUseCases()
  ) => {
    const app = express();
    app.use(express.json());
    app.use('/admin/courses', CourseAdminRouter.create({
      adminCourseUseCases: useCases as any,
      courseCurriculumUseCases: curriculumUseCases as any
    }));
    return app;
  };

  it('GET /admin/courses calls listCourses with parsed filters', async () => {
    const useCases = createMockUseCases();
    useCases.listCourses.mockResolvedValue({ data: [], total: 0, page: 2, pageSize: 20, totalPages: 0 });
    const app = createApp(useCases);

    const res = await request(app).get('/admin/courses?status=READY_TO_REVIEW&accessType=FREE_CERTIFICATE&platformName=Global%20Learning&page=2');

    expect(res.status).toBe(200);
    expect(useCases.listCourses).toHaveBeenCalledWith({
      status: CourseStatus.READY_TO_REVIEW,
      accessType: CourseAccessType.FREE_CERTIFICATE,
      platformName: 'Global Learning',
      page: 2,
      pageSize: 20
    });
  });

  it('PATCH /admin/courses/:id validates body and strips readonly fields', async () => {
    const useCases = createMockUseCases();
    useCases.updateCourse.mockResolvedValue({ id: 'course-1' });
    const app = createApp(useCases);

    const res = await request(app)
      .patch('/admin/courses/course-1')
      .send({
        id: 'injected',
        publicId: 'injected-public',
        displayName: 'Updated Course',
        directCourseUrl: 'https://example.org/course'
      });

    expect(res.status).toBe(200);
    expect(useCases.updateCourse).toHaveBeenCalledWith('course-1', expect.objectContaining({
      displayName: 'Updated Course',
      directCourseUrl: 'https://example.org/course'
    }));
    expect(useCases.updateCourse).toHaveBeenCalledWith('course-1', expect.not.objectContaining({
      id: 'injected',
      publicId: 'injected-public'
    }));
  });

  it('POST /admin/courses/:id/publish calls publish', async () => {
    const useCases = createMockUseCases();
    useCases.publish.mockResolvedValue(undefined);
    const app = createApp(useCases);

    const res = await request(app).post('/admin/courses/course-1/publish');

    expect(res.status).toBe(200);
    expect(useCases.publish).toHaveBeenCalledWith('course-1');
  });

  it('GET /admin/courses/:id/curriculum returns curriculum snapshot', async () => {
    const useCases = createMockUseCases();
    const curriculumUseCases = createMockCurriculumUseCases();
    curriculumUseCases.getCurriculumSnapshot.mockResolvedValue({
      modules: [],
      lessons: [],
      assets: [],
      quizzes: [],
      questionBanks: [],
      questions: []
    });
    const app = createApp(useCases, curriculumUseCases);

    const res = await request(app).get('/admin/courses/course-1/curriculum');

    expect(res.status).toBe(200);
    expect(curriculumUseCases.getCurriculumSnapshot).toHaveBeenCalledWith('course-1');
  });

  it('POST /admin/courses/:id/modules creates course modules', async () => {
    const useCases = createMockUseCases();
    const curriculumUseCases = createMockCurriculumUseCases();
    curriculumUseCases.createModule.mockResolvedValue({ id: 'module-1' });
    const app = createApp(useCases, curriculumUseCases);

    const res = await request(app)
      .post('/admin/courses/course-1/modules')
      .send({ title: 'Getting Started', position: 1 });

    expect(res.status).toBe(201);
    expect(curriculumUseCases.createModule).toHaveBeenCalledWith({
      courseId: 'course-1',
      title: 'Getting Started',
      description: undefined,
      position: 1,
      status: undefined
    });
  });

  it('POST /admin/courses/:id/modules/:moduleId/lessons creates lessons', async () => {
    const useCases = createMockUseCases();
    const curriculumUseCases = createMockCurriculumUseCases();
    curriculumUseCases.createLesson.mockResolvedValue({ id: 'lesson-1' });
    const app = createApp(useCases, curriculumUseCases);

    const res = await request(app)
      .post('/admin/courses/course-1/modules/module-1/lessons')
      .send({
        title: 'Welcome',
        lessonType: CourseLessonType.VIDEO,
        position: 1,
        estimatedDurationMinutes: 10
      });

    expect(res.status).toBe(201);
    expect(curriculumUseCases.createLesson).toHaveBeenCalledWith(expect.objectContaining({
      courseId: 'course-1',
      moduleId: 'module-1',
      title: 'Welcome',
      lessonType: CourseLessonType.VIDEO
    }));
  });

  it('POST /admin/courses/:id/lessons/:lessonId/assets rejects raw URLs', async () => {
    const useCases = createMockUseCases();
    const curriculumUseCases = createMockCurriculumUseCases();
    const app = createApp(useCases, curriculumUseCases);

    const res = await request(app)
      .post('/admin/courses/course-1/lessons/lesson-1/assets')
      .send({
        assetId: 'https://cdn.example.com/video.mp4',
        assetType: LessonAssetType.VIDEO,
        position: 1
      });

    expect(res.status).toBe(400);
    expect(curriculumUseCases.attachAssetToLesson).not.toHaveBeenCalled();
  });

  it('POST /admin/courses/:id/quizzes and questions create assessments', async () => {
    const useCases = createMockUseCases();
    const curriculumUseCases = createMockCurriculumUseCases();
    curriculumUseCases.createQuiz.mockResolvedValue({ id: 'quiz-1' });
    curriculumUseCases.createQuestion.mockResolvedValue({ id: 'question-1' });
    const app = createApp(useCases, curriculumUseCases);

    const quizRes = await request(app)
      .post('/admin/courses/course-1/quizzes')
      .send({ title: 'Final Quiz', position: 1, passingScore: 70 });

    const questionRes = await request(app)
      .post('/admin/courses/course-1/questions')
      .send({
        quizId: 'quiz-1',
        questionType: 'MULTIPLE_CHOICE',
        prompt: 'What is MANARATAK?',
        choices: ['A', 'B'],
        correctAnswer: 'A',
        position: 1
      });

    expect(quizRes.status).toBe(201);
    expect(questionRes.status).toBe(201);
    expect(curriculumUseCases.createQuiz).toHaveBeenCalledWith(expect.objectContaining({ courseId: 'course-1' }));
    expect(curriculumUseCases.createQuestion).toHaveBeenCalledWith(expect.objectContaining({ courseId: 'course-1', quizId: 'quiz-1' }));
  });

  it('returns 400 on use case errors', async () => {
    const useCases = createMockUseCases();
    useCases.publish.mockRejectedValue(new Error('Only READY_TO_PUBLISH courses can be PUBLISHED'));
    const app = createApp(useCases);

    const res = await request(app).post('/admin/courses/course-1/publish');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Only READY_TO_PUBLISH courses can be PUBLISHED' });
  });
});
