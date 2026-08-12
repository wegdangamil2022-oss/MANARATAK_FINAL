import {
  CourseLessonDto,
  CourseModuleDto,
  CourseQuestionBankDto,
  CourseQuestionDto,
  CourseQuizDto,
  CreateCourseLessonDto,
  CreateCourseModuleDto,
  CreateCourseQuestionBankDto,
  CreateCourseQuestionDto,
  CreateCourseQuizDto,
  CreateLessonAssetReferenceDto,
  LessonAssetReferenceDto,
  UpdateCourseLessonDto,
  UpdateCourseModuleDto
} from '../entities/CourseCurriculum';

export interface CourseCurriculumSnapshotDto {
  modules: CourseModuleDto[];
  lessons: CourseLessonDto[];
  assets: LessonAssetReferenceDto[];
  quizzes: CourseQuizDto[];
  questionBanks: CourseQuestionBankDto[];
  questions: CourseQuestionDto[];
}

export interface ICourseCurriculumRepository {
  createModule(data: CreateCourseModuleDto): Promise<CourseModuleDto>;
  updateModule(id: string, data: UpdateCourseModuleDto): Promise<CourseModuleDto>;
  listModulesByCourseId(courseId: string): Promise<CourseModuleDto[]>;

  createLesson(data: CreateCourseLessonDto): Promise<CourseLessonDto>;
  updateLesson(id: string, data: UpdateCourseLessonDto): Promise<CourseLessonDto>;
  listLessonsByModuleId(moduleId: string): Promise<CourseLessonDto[]>;

  attachAssetToLesson(data: CreateLessonAssetReferenceDto): Promise<LessonAssetReferenceDto>;
  listAssetsByLessonId(lessonId: string): Promise<LessonAssetReferenceDto[]>;

  createQuiz(data: CreateCourseQuizDto): Promise<CourseQuizDto>;
  listQuizzesByCourseId(courseId: string): Promise<CourseQuizDto[]>;

  createQuestionBank(data: CreateCourseQuestionBankDto): Promise<CourseQuestionBankDto>;
  createQuestion(data: CreateCourseQuestionDto): Promise<CourseQuestionDto>;
  listQuestionsByQuizId(quizId: string): Promise<CourseQuestionDto[]>;

  getCurriculumSnapshot(courseId: string): Promise<CourseCurriculumSnapshotDto>;
}
