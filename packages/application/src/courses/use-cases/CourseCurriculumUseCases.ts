import {
  AssetId,
  AssetLifecycleState,
  CourseDto,
  CourseOriginType,
  CoursePositionUpdateDto,
  CourseStatus,
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
  IAssetRecordRepository,
  LessonAssetReferenceDto,
  UpdateCourseLessonDto,
  UpdateCourseModuleDto,
  UpdateCourseQuestionBankDto,
  UpdateCourseQuestionDto,
  UpdateCourseQuizDto,
} from '@manaratak/domain';

export class CourseCurriculumUseCases {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly curriculumRepository: ICourseCurriculumRepository,
    private readonly assetRepository?: IAssetRecordRepository,
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

  private async ensureMutableCourse(courseId: string): Promise<CourseDto> {
    const course = await this.ensureAuthorableCourse(courseId);
    if (course.status === CourseStatus.PUBLISHED || course.status === CourseStatus.ARCHIVED) {
      throw new Error('PUBLISHED_OR_ARCHIVED_COURSE_CONTENT_MUTATION_FORBIDDEN');
    }
    return course;
  }

  private async ensureCurriculumMember(
    courseId: string,
    kind: keyof CourseCurriculumSnapshotDto,
    id: string,
  ): Promise<void> {
    const snapshot = await this.curriculumRepository.getCurriculumSnapshot(courseId);
    const collection = snapshot[kind] as Array<{ id: string }>;
    if (!collection.some((item) => item.id === id))
      throw new Error('COURSE_CURRICULUM_SCOPE_MISMATCH');
  }

  public async createModule(data: CreateCourseModuleDto): Promise<CourseModuleDto> {
    await this.ensureMutableCourse(data.courseId);
    return this.curriculumRepository.createModule(data);
  }

  public async updateModule(
    courseId: string,
    moduleId: string,
    data: UpdateCourseModuleDto,
  ): Promise<CourseModuleDto> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'modules', moduleId);
    return this.curriculumRepository.updateModule(moduleId, data);
  }

  public async deleteModule(courseId: string, moduleId: string): Promise<void> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'modules', moduleId);
    await this.curriculumRepository.deleteModule(moduleId);
  }

  public async reorderModules(
    courseId: string,
    positions: CoursePositionUpdateDto[],
  ): Promise<void> {
    await this.ensureMutableCourse(courseId);
    const snapshot = await this.curriculumRepository.getCurriculumSnapshot(courseId);
    if (positions.length !== snapshot.modules.length)
      throw new Error('COURSE_MODULE_REORDER_MUST_INCLUDE_ALL_MODULES');
    await this.curriculumRepository.reorderModules(courseId, positions);
  }

  public async listModules(courseId: string): Promise<CourseModuleDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listModulesByCourseId(courseId);
  }

  public async createLesson(data: CreateCourseLessonDto): Promise<CourseLessonDto> {
    await this.ensureMutableCourse(data.courseId);
    return this.curriculumRepository.createLesson(data);
  }

  public async updateLesson(
    courseId: string,
    lessonId: string,
    data: UpdateCourseLessonDto,
  ): Promise<CourseLessonDto> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'lessons', lessonId);
    return this.curriculumRepository.updateLesson(lessonId, data);
  }

  public async deleteLesson(courseId: string, lessonId: string): Promise<void> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'lessons', lessonId);
    await this.curriculumRepository.deleteLesson(lessonId);
  }

  public async reorderLessons(
    courseId: string,
    moduleId: string,
    positions: CoursePositionUpdateDto[],
  ): Promise<void> {
    await this.ensureMutableCourse(courseId);
    const snapshot = await this.curriculumRepository.getCurriculumSnapshot(courseId);
    const moduleLessons = snapshot.lessons.filter((item) => item.moduleId === moduleId);
    if (positions.length !== moduleLessons.length)
      throw new Error('COURSE_LESSON_REORDER_MUST_INCLUDE_ALL_LESSONS');
    await this.curriculumRepository.reorderLessons(moduleId, positions);
  }

  public async listLessons(courseId: string, moduleId: string): Promise<CourseLessonDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listLessonsByModuleId(moduleId);
  }

  public async attachAssetToLesson(
    courseId: string,
    data: CreateLessonAssetReferenceDto,
  ): Promise<LessonAssetReferenceDto> {
    this.ensureEapAssetReference(data);
    if (!this.assetRepository) throw new Error('COURSE_ASSET_PLATFORM_NOT_CONFIGURED');
    const asset = await this.assetRepository.findById(new AssetId(data.assetId));
    if (!asset) throw new Error('COURSE_LESSON_ASSET_NOT_FOUND');
    if (asset.state !== AssetLifecycleState.ACTIVE) {
      throw new Error(`COURSE_LESSON_ASSET_NOT_ACTIVE:${asset.state}`);
    }
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'lessons', data.lessonId);
    return this.curriculumRepository.attachAssetToLesson(data);
  }

  public async detachAssetFromLesson(courseId: string, assetId: string): Promise<void> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'assets', assetId);
    await this.curriculumRepository.detachAssetFromLesson(assetId);
  }

  public async listLessonAssets(lessonId: string): Promise<LessonAssetReferenceDto[]> {
    return this.curriculumRepository.listAssetsByLessonId(lessonId);
  }

  public async createQuiz(data: CreateCourseQuizDto): Promise<CourseQuizDto> {
    await this.ensureMutableCourse(data.courseId);
    return this.curriculumRepository.createQuiz(data);
  }

  public async updateQuiz(
    courseId: string,
    quizId: string,
    data: UpdateCourseQuizDto,
  ): Promise<CourseQuizDto> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'quizzes', quizId);
    return this.curriculumRepository.updateQuiz(quizId, data);
  }

  public async deleteQuiz(courseId: string, quizId: string): Promise<void> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'quizzes', quizId);
    await this.curriculumRepository.deleteQuiz(quizId);
  }

  public async listQuizzes(courseId: string): Promise<CourseQuizDto[]> {
    await this.ensureAuthorableCourse(courseId);
    return this.curriculumRepository.listQuizzesByCourseId(courseId);
  }

  public async createQuestionBank(
    data: CreateCourseQuestionBankDto,
  ): Promise<CourseQuestionBankDto> {
    await this.ensureMutableCourse(data.courseId);
    return this.curriculumRepository.createQuestionBank(data);
  }

  public async updateQuestionBank(
    courseId: string,
    bankId: string,
    data: UpdateCourseQuestionBankDto,
  ): Promise<CourseQuestionBankDto> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'questionBanks', bankId);
    return this.curriculumRepository.updateQuestionBank(bankId, data);
  }

  public async deleteQuestionBank(courseId: string, bankId: string): Promise<void> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'questionBanks', bankId);
    await this.curriculumRepository.deleteQuestionBank(bankId);
  }

  public async createQuestion(data: CreateCourseQuestionDto): Promise<CourseQuestionDto> {
    await this.ensureMutableCourse(data.courseId);
    return this.curriculumRepository.createQuestion(data);
  }

  public async updateQuestion(
    courseId: string,
    questionId: string,
    data: UpdateCourseQuestionDto,
  ): Promise<CourseQuestionDto> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'questions', questionId);
    return this.curriculumRepository.updateQuestion(questionId, data);
  }

  public async deleteQuestion(courseId: string, questionId: string): Promise<void> {
    await this.ensureMutableCourse(courseId);
    await this.ensureCurriculumMember(courseId, 'questions', questionId);
    await this.curriculumRepository.deleteQuestion(questionId);
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
