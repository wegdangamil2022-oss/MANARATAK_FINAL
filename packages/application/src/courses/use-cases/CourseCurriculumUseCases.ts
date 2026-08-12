import {
  CourseDto,
  CourseOriginType,
  CourseCurriculumSnapshotDto,
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
  ICourseCurriculumRepository,
  ICourseRepository,
  LessonAssetReferenceDto,
  UpdateCourseLessonDto,
  UpdateCourseModuleDto
} from '@manaratak/domain';

export class CourseCurriculumUseCases {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly curriculumRepository: ICourseCurriculumRepository
  ) {}

  private async ensureAuthorableCourse(courseId: string): Promise<CourseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error(`Course with id ${courseId} not found`);
    }
    if (course.originType === CourseOriginType.EXTERNAL_LINKED_COURSE) {
      throw new Error('External linked courses cannot own native curriculum content');
    }
    return course;
  }

  private ensureEapAssetReference(data: CreateLessonAssetReferenceDto): void {
    if (!data.assetId || data.assetId.trim().length === 0) {
      throw new Error('Lesson assets must reference Phase 05 EAP using assetId');
    }
    if (/^https?:\/\//i.test(data.assetId)) {
      throw new Error('Lesson assets must not store raw URLs as assetId');
    }
    if (data.assetReference && /^https?:\/\//i.test(data.assetReference)) {
      throw new Error('Lesson assets must not store raw URLs as assetReference');
    }
  }

  public async createModule(data: CreateCourseModuleDto): Promise<CourseModuleDto> {
    await this.ensureAuthorableCourse(data.courseId);
    return this.curriculumRepository.createModule(data);
  }

  public async updateModule(courseId: string, moduleId: string, data: UpdateCourseModuleDto): Promise<CourseModuleDto> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.updateModule(moduleId, data);
  }

  public async listModules(courseId: string): Promise<CourseModuleDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listModulesByCourseId(courseId);
  }

  public async createLesson(data: CreateCourseLessonDto): Promise<CourseLessonDto> {
    await this.ensureAuthorableCourse(data.courseId);
    return this.curriculumRepository.createLesson(data);
  }

  public async updateLesson(courseId: string, lessonId: string, data: UpdateCourseLessonDto): Promise<CourseLessonDto> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.updateLesson(lessonId, data);
  }

  public async listLessons(courseId: string, moduleId: string): Promise<CourseLessonDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listLessonsByModuleId(moduleId);
  }

  public async attachAssetToLesson(data: CreateLessonAssetReferenceDto): Promise<LessonAssetReferenceDto> {
    this.ensureEapAssetReference(data);
    return this.curriculumRepository.attachAssetToLesson(data);
  }

  public async listLessonAssets(lessonId: string): Promise<LessonAssetReferenceDto[]> {
    return this.curriculumRepository.listAssetsByLessonId(lessonId);
  }

  public async createQuiz(data: CreateCourseQuizDto): Promise<CourseQuizDto> {
    await this.ensureAuthorableCourse(data.courseId);
    return this.curriculumRepository.createQuiz(data);
  }

  public async listQuizzes(courseId: string): Promise<CourseQuizDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listQuizzesByCourseId(courseId);
  }

  public async createQuestionBank(data: CreateCourseQuestionBankDto): Promise<CourseQuestionBankDto> {
    await this.ensureAuthorableCourse(data.courseId);
    return this.curriculumRepository.createQuestionBank(data);
  }

  public async createQuestion(data: CreateCourseQuestionDto): Promise<CourseQuestionDto> {
    await this.ensureAuthorableCourse(data.courseId);
    return this.curriculumRepository.createQuestion(data);
  }

  public async listQuizQuestions(courseId: string, quizId: string): Promise<CourseQuestionDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listQuestionsByQuizId(quizId);
  }

  public async getCurriculumSnapshot(courseId: string): Promise<CourseCurriculumSnapshotDto> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.getCurriculumSnapshot(courseId);
  }
}
