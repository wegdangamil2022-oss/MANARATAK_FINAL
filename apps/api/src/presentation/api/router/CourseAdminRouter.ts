import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CourseAccessType,
  CourseContentStatus,
  CourseImportCompletenessState,
  CourseLessonType,
  CourseOriginType,
  CourseQuestionType,
  CourseStatus,
  LessonAssetType,
  UpdateCourseDto
} from '@manaratak/domain';
import { AdminCourseUseCases, CourseCurriculumUseCases } from '@manaratak/application';

export class CourseAdminRouter {
  public static create(cradle: { adminCourseUseCases: AdminCourseUseCases; courseCurriculumUseCases: CourseCurriculumUseCases }): Router {
    const router = Router();
    const { adminCourseUseCases, courseCurriculumUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      status: z.nativeEnum(CourseStatus).optional(),
      completenessStatus: z.nativeEnum(CourseImportCompletenessState).optional(),
      accessType: z.nativeEnum(CourseAccessType).optional(),
      originType: z.nativeEnum(CourseOriginType).optional(),
      platformName: z.string().optional(),
      page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
    });

    const updateBodySchema = z.object({
      displayName: z.string().optional(),
      accessType: z.nativeEnum(CourseAccessType).optional(),
      originType: z.nativeEnum(CourseOriginType).optional(),
      directCourseUrl: z.string().url().optional(),
      platformName: z.string().nullable().optional(),
      providerName: z.string().nullable().optional(),
      learningLanguage: z.string().nullable().optional(),
      studyDuration: z.string().nullable().optional(),
      certificateAvailable: z.boolean().nullable().optional(),
      category: z.string().nullable().optional(),
      difficultyLevel: z.string().nullable().optional(),
      sourceUrl: z.union([z.string().url(), z.literal('')]).nullable().optional(),
      officialSourceUrl: z.union([z.string().url(), z.literal('')]).nullable().optional(),
      thumbnailAssetId: z.string().nullable().optional(),
      courseContent: z.string().optional(),
      relatedMajorsOrFields: z.union([z.string(), z.array(z.string())]).optional(),
      acquiredSkills: z.array(z.string()).optional(),
      localizedNames: z.record(z.string(), z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const moduleBodySchema = z.object({
      title: z.string().min(1),
      description: z.string().nullable().optional(),
      position: z.number().int().positive(),
      status: z.nativeEnum(CourseContentStatus).optional(),
    });

    const modulePatchSchema = moduleBodySchema.partial();

    const lessonBodySchema = z.object({
      title: z.string().min(1),
      summary: z.string().nullable().optional(),
      lessonType: z.nativeEnum(CourseLessonType),
      position: z.number().int().positive(),
      estimatedDurationMinutes: z.number().int().positive().nullable().optional(),
      contentText: z.string().nullable().optional(),
      status: z.nativeEnum(CourseContentStatus).optional(),
    });

    const lessonPatchSchema = lessonBodySchema.partial();

    const lessonAssetBodySchema = z.object({
      assetId: z.string().min(1).refine((value) => !/^https?:\/\//i.test(value), 'assetId must be a Phase 05 EAP handle, not a raw URL'),
      assetReference: z.string().min(1).refine((value) => !/^https?:\/\//i.test(value), 'assetReference must be a Phase 05 EAP handle, not a raw URL').nullable().optional(),
      title: z.string().nullable().optional(),
      assetType: z.nativeEnum(LessonAssetType),
      position: z.number().int().positive(),
      isRequired: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const quizBodySchema = z.object({
      moduleId: z.string().optional(),
      lessonId: z.string().optional(),
      title: z.string().min(1),
      instructions: z.string().nullable().optional(),
      position: z.number().int().positive(),
      passingScore: z.number().int().min(0).max(100).nullable().optional(),
      maxAttempts: z.number().int().positive().nullable().optional(),
      status: z.nativeEnum(CourseContentStatus).optional(),
    });

    const questionBankBodySchema = z.object({
      title: z.string().min(1),
      description: z.string().nullable().optional(),
      status: z.nativeEnum(CourseContentStatus).optional(),
    });

    const questionBodySchema = z.object({
      quizId: z.string().optional(),
      questionBankId: z.string().optional(),
      questionType: z.nativeEnum(CourseQuestionType),
      prompt: z.string().min(1),
      choices: z.unknown().optional(),
      correctAnswer: z.unknown().optional(),
      explanation: z.string().nullable().optional(),
      points: z.number().int().positive().optional(),
      position: z.number().int().positive(),
      status: z.nativeEnum(CourseContentStatus).optional(),
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      const result = await adminCourseUseCases.listCourses(filters);
      res.json(result);
    }));

    router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      const course = await adminCourseUseCases.getCourse(req.params.id);
      res.json(course);
    }));

    router.get('/:id/curriculum', asyncHandler(async (req: Request, res: Response) => {
      const snapshot = await courseCurriculumUseCases.getCurriculumSnapshot(req.params.id);
      res.json(snapshot);
    }));

    router.get('/:id/modules', asyncHandler(async (req: Request, res: Response) => {
      const modules = await courseCurriculumUseCases.listModules(req.params.id);
      res.json({ data: modules });
    }));

    router.post('/:id/modules', asyncHandler(async (req: Request, res: Response) => {
      const body = moduleBodySchema.parse(req.body);
      const module = await courseCurriculumUseCases.createModule({
        courseId: req.params.id,
        title: body.title,
        description: body.description ?? undefined,
        position: body.position,
        status: body.status,
      });
      res.status(201).json(module);
    }));

    router.patch('/:id/modules/:moduleId', asyncHandler(async (req: Request, res: Response) => {
      const body = modulePatchSchema.parse(req.body);
      const module = await courseCurriculumUseCases.updateModule(req.params.id, req.params.moduleId, body);
      res.json(module);
    }));

    router.get('/:id/modules/:moduleId/lessons', asyncHandler(async (req: Request, res: Response) => {
      const lessons = await courseCurriculumUseCases.listLessons(req.params.id, req.params.moduleId);
      res.json({ data: lessons });
    }));

    router.post('/:id/modules/:moduleId/lessons', asyncHandler(async (req: Request, res: Response) => {
      const body = lessonBodySchema.parse(req.body);
      const lesson = await courseCurriculumUseCases.createLesson({
        courseId: req.params.id,
        moduleId: req.params.moduleId,
        title: body.title,
        summary: body.summary ?? undefined,
        lessonType: body.lessonType,
        position: body.position,
        estimatedDurationMinutes: body.estimatedDurationMinutes ?? undefined,
        contentText: body.contentText ?? undefined,
        status: body.status,
      });
      res.status(201).json(lesson);
    }));

    router.patch('/:id/lessons/:lessonId', asyncHandler(async (req: Request, res: Response) => {
      const body = lessonPatchSchema.parse(req.body);
      const lesson = await courseCurriculumUseCases.updateLesson(req.params.id, req.params.lessonId, body);
      res.json(lesson);
    }));

    router.get('/:id/lessons/:lessonId/assets', asyncHandler(async (req: Request, res: Response) => {
      const assets = await courseCurriculumUseCases.listLessonAssets(req.params.lessonId);
      res.json({ data: assets });
    }));

    router.post('/:id/lessons/:lessonId/assets', asyncHandler(async (req: Request, res: Response) => {
      const body = lessonAssetBodySchema.parse(req.body);
      const asset = await courseCurriculumUseCases.attachAssetToLesson({
        lessonId: req.params.lessonId,
        assetId: body.assetId,
        assetReference: body.assetReference ?? undefined,
        title: body.title ?? undefined,
        assetType: body.assetType,
        position: body.position,
        isRequired: body.isRequired,
        metadata: body.metadata,
      });
      res.status(201).json(asset);
    }));

    router.get('/:id/quizzes', asyncHandler(async (req: Request, res: Response) => {
      const quizzes = await courseCurriculumUseCases.listQuizzes(req.params.id);
      res.json({ data: quizzes });
    }));

    router.post('/:id/quizzes', asyncHandler(async (req: Request, res: Response) => {
      const body = quizBodySchema.parse(req.body);
      const quiz = await courseCurriculumUseCases.createQuiz({
        courseId: req.params.id,
        moduleId: body.moduleId,
        lessonId: body.lessonId,
        title: body.title,
        instructions: body.instructions ?? undefined,
        position: body.position,
        passingScore: body.passingScore ?? undefined,
        maxAttempts: body.maxAttempts ?? undefined,
        status: body.status,
      });
      res.status(201).json(quiz);
    }));

    router.post('/:id/question-banks', asyncHandler(async (req: Request, res: Response) => {
      const body = questionBankBodySchema.parse(req.body);
      const questionBank = await courseCurriculumUseCases.createQuestionBank({
        courseId: req.params.id,
        title: body.title,
        description: body.description ?? undefined,
        status: body.status,
      });
      res.status(201).json(questionBank);
    }));

    router.get('/:id/quizzes/:quizId/questions', asyncHandler(async (req: Request, res: Response) => {
      const questions = await courseCurriculumUseCases.listQuizQuestions(req.params.id, req.params.quizId);
      res.json({ data: questions });
    }));

    router.post('/:id/questions', asyncHandler(async (req: Request, res: Response) => {
      const body = questionBodySchema.parse(req.body);
      const question = await courseCurriculumUseCases.createQuestion({
        courseId: req.params.id,
        quizId: body.quizId,
        questionBankId: body.questionBankId,
        questionType: body.questionType,
        prompt: body.prompt,
        choices: body.choices as any,
        correctAnswer: body.correctAnswer as any,
        explanation: body.explanation ?? undefined,
        points: body.points,
        position: body.position,
        status: body.status,
      });
      res.status(201).json(question);
    }));

    router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
      const updates = updateBodySchema.parse(req.body);

      const optionalFields: Record<string, unknown> = {};
      if (updates.courseContent !== undefined) optionalFields.courseContent = updates.courseContent;
      if (updates.relatedMajorsOrFields !== undefined) optionalFields.relatedMajorsOrFields = updates.relatedMajorsOrFields;
      if (updates.acquiredSkills !== undefined) optionalFields.acquiredSkills = updates.acquiredSkills;
      if (updates.localizedNames !== undefined) optionalFields.localizedNames = updates.localizedNames;
      if (updates.metadata !== undefined) optionalFields.metadata = updates.metadata;

      const dataToUpdate: UpdateCourseDto = {
        displayName: updates.displayName,
        accessType: updates.accessType,
        originType: updates.originType,
        directCourseUrl: updates.directCourseUrl,
        platformName: updates.platformName,
        providerName: updates.providerName,
        learningLanguage: updates.learningLanguage,
        studyDuration: updates.studyDuration,
        certificateAvailable: updates.certificateAvailable,
        category: updates.category,
        difficultyLevel: updates.difficultyLevel,
        sourceUrl: updates.sourceUrl === '' ? null : updates.sourceUrl,
        officialSourceUrl: updates.officialSourceUrl === '' ? null : updates.officialSourceUrl,
        thumbnailAssetId: updates.thumbnailAssetId,
      };

      if (Object.keys(optionalFields).length > 0) {
        dataToUpdate.optionalFields = optionalFields;
      }

      const course = await adminCourseUseCases.updateCourse(req.params.id, dataToUpdate);
      res.json(course);
    }));

    router.post('/:id/mark-ready', asyncHandler(async (req: Request, res: Response) => {
      await adminCourseUseCases.markReadyToReview(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/mark-publishable', asyncHandler(async (req: Request, res: Response) => {
      await adminCourseUseCases.markReadyToPublish(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      await adminCourseUseCases.publish(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/unpublish', asyncHandler(async (req: Request, res: Response) => {
      await adminCourseUseCases.unpublish(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
      await adminCourseUseCases.reject(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      await adminCourseUseCases.archive(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
