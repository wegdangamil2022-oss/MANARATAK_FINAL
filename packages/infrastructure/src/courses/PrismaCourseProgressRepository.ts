import { Prisma, PrismaClient } from '@prisma/client';
import {
  CourseCompletionDto,
  CourseCompletionStatus,
  CourseEnrollmentDto,
  CourseEnrollmentStatus,
  CourseLessonProgressDto,
  CourseProgressStatus,
  CourseQuizAttemptDto,
  CourseQuizAttemptStatus,
  CreateCourseCompletionDto,
  CreateCourseEnrollmentDto,
  CreateQuizAttemptDto,
  ICourseProgressRepository,
  StudentCourseProgressSnapshotDto,
  SubmitQuizAttemptDto,
  UpsertLessonProgressDto,
} from '@manaratak/domain';

const json = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

export class PrismaCourseProgressRepository implements ICourseProgressRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async enroll(data: CreateCourseEnrollmentDto): Promise<CourseEnrollmentDto> {
    const record = await this.prisma.courseEnrollment.upsert({
      where: {
        courseId_studentReferenceId: {
          courseId: data.courseId,
          studentReferenceId: data.studentReferenceId,
        },
      },
      create: {
        ...data,
        status: data.status ?? CourseEnrollmentStatus.ACTIVE,
        metadata: json(data.metadata),
      },
      update: {
        status: data.status ?? CourseEnrollmentStatus.ACTIVE,
        lastAccessedAt: new Date(),
        metadata: json(data.metadata),
      },
    });
    return this.enrollment(record);
  }

  public async findEnrollment(
    courseId: string,
    studentReferenceId: string,
  ): Promise<CourseEnrollmentDto | null> {
    const record = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_studentReferenceId: { courseId, studentReferenceId } },
    });
    return record ? this.enrollment(record) : null;
  }

  public async updateEnrollmentProgress(
    courseId: string,
    studentReferenceId: string,
    progressPercentage: number,
  ): Promise<CourseEnrollmentDto> {
    const record = await this.prisma.courseEnrollment.update({
      where: { courseId_studentReferenceId: { courseId, studentReferenceId } },
      data: {
        progressPercentage,
        lastAccessedAt: new Date(),
        ...(progressPercentage >= 100
          ? { status: CourseEnrollmentStatus.COMPLETED, completedAt: new Date() }
          : {}),
      },
    });
    return this.enrollment(record);
  }

  public async upsertLessonProgress(
    data: UpsertLessonProgressDto,
  ): Promise<CourseLessonProgressDto> {
    const now = new Date();
    const record = await this.prisma.courseLessonProgress.upsert({
      where: {
        courseId_lessonId_studentReferenceId: {
          courseId: data.courseId,
          lessonId: data.lessonId,
          studentReferenceId: data.studentReferenceId,
        },
      },
      create: {
        ...data,
        startedAt: now,
        completedAt: data.status === CourseProgressStatus.COMPLETED ? now : undefined,
        metadata: json(data.metadata),
      },
      update: {
        status: data.status,
        progressPercentage: data.progressPercentage,
        completedAt: data.status === CourseProgressStatus.COMPLETED ? now : null,
        timeSpentSeconds: data.timeSpentSeconds,
        metadata: json(data.metadata),
      },
    });
    return this.lessonProgress(record);
  }

  public async listLessonProgress(
    courseId: string,
    studentReferenceId: string,
  ): Promise<CourseLessonProgressDto[]> {
    return (
      await this.prisma.courseLessonProgress.findMany({
        where: { courseId, studentReferenceId },
        orderBy: { createdAt: 'asc' },
      })
    ).map((item) => this.lessonProgress(item));
  }

  public async createQuizAttempt(data: CreateQuizAttemptDto): Promise<CourseQuizAttemptDto> {
    return this.quizAttempt(
      await this.prisma.courseQuizAttempt.create({
        data: {
          ...data,
          status: CourseQuizAttemptStatus.IN_PROGRESS,
          answers: json(data.answers),
          metadata: json(data.metadata),
        },
      }),
    );
  }

  public async submitQuizAttempt(data: SubmitQuizAttemptDto): Promise<CourseQuizAttemptDto> {
    return this.quizAttempt(
      await this.prisma.courseQuizAttempt.update({
        where: { id: data.attemptId },
        data: {
          score: data.score,
          passed: data.passed,
          answers: json(data.answers),
          status: data.passed ? CourseQuizAttemptStatus.PASSED : CourseQuizAttemptStatus.FAILED,
          submittedAt: new Date(),
        },
      }),
    );
  }

  public async listQuizAttempts(
    courseId: string,
    studentReferenceId: string,
  ): Promise<CourseQuizAttemptDto[]> {
    return (
      await this.prisma.courseQuizAttempt.findMany({
        where: { courseId, studentReferenceId },
        orderBy: { startedAt: 'asc' },
      })
    ).map((item) => this.quizAttempt(item));
  }

  public async completeCourse(data: CreateCourseCompletionDto): Promise<CourseCompletionDto> {
    return this.completion(
      await this.prisma.courseCompletion.upsert({
        where: {
          courseId_studentReferenceId: {
            courseId: data.courseId,
            studentReferenceId: data.studentReferenceId,
          },
        },
        create: { ...data, metadata: json(data.metadata) },
        update: {
          status: data.status,
          completionSource: data.completionSource,
          eligibleForCertificate: data.eligibleForCertificate,
          metadata: json(data.metadata),
        },
      }),
    );
  }

  public async findCompletion(
    courseId: string,
    studentReferenceId: string,
  ): Promise<CourseCompletionDto | null> {
    const record = await this.prisma.courseCompletion.findUnique({
      where: { courseId_studentReferenceId: { courseId, studentReferenceId } },
    });
    return record ? this.completion(record) : null;
  }

  public async getStudentProgressSnapshot(
    courseId: string,
    studentReferenceId: string,
  ): Promise<StudentCourseProgressSnapshotDto | null> {
    const enrollment = await this.findEnrollment(courseId, studentReferenceId);
    if (!enrollment) return null;
    const [lessons, quizAttempts, completion] = await Promise.all([
      this.listLessonProgress(courseId, studentReferenceId),
      this.listQuizAttempts(courseId, studentReferenceId),
      this.findCompletion(courseId, studentReferenceId),
    ]);
    return { enrollment, lessons, quizAttempts, completion };
  }

  private enrollment(record: {
    id: string;
    courseId: string;
    studentReferenceId: string;
    status: string;
    enrolledAt: Date;
    completedAt: Date | null;
    progressPercentage: number;
    lastAccessedAt: Date | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): CourseEnrollmentDto {
    return {
      ...record,
      status: record.status as CourseEnrollmentStatus,
      metadata: record.metadata as Record<string, unknown> | null,
    };
  }

  private lessonProgress(record: {
    id: string;
    courseId: string;
    lessonId: string;
    studentReferenceId: string;
    status: string;
    progressPercentage: number;
    startedAt: Date | null;
    completedAt: Date | null;
    timeSpentSeconds: number | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): CourseLessonProgressDto {
    return {
      ...record,
      status: record.status as CourseProgressStatus,
      metadata: record.metadata as Record<string, unknown> | null,
    };
  }

  private quizAttempt(record: {
    id: string;
    courseId: string;
    quizId: string;
    studentReferenceId: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    passed: boolean | null;
    answers: Prisma.JsonValue | null;
    startedAt: Date;
    submittedAt: Date | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): CourseQuizAttemptDto {
    return {
      ...record,
      status: record.status as CourseQuizAttemptStatus,
      answers: record.answers,
      metadata: record.metadata as Record<string, unknown> | null,
    };
  }

  private completion(record: {
    id: string;
    courseId: string;
    studentReferenceId: string;
    status: string;
    completionSource: string;
    eligibleForCertificate: boolean;
    completedAt: Date;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): CourseCompletionDto {
    return {
      ...record,
      status: record.status as CourseCompletionStatus,
      metadata: record.metadata as Record<string, unknown> | null,
    };
  }
}
