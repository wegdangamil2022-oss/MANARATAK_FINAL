import {
  CourseCompletionDto,
  CourseEnrollmentDto,
  CourseLessonProgressDto,
  CourseQuizAttemptDto,
  CreateCourseCompletionDto,
  CreateCourseEnrollmentDto,
  CreateQuizAttemptDto,
  StudentCourseProgressSnapshotDto,
  SubmitQuizAttemptDto,
  UpsertLessonProgressDto
} from '../entities/CourseProgress';

export interface ICourseProgressRepository {
  enroll(data: CreateCourseEnrollmentDto): Promise<CourseEnrollmentDto>;
  findEnrollment(courseId: string, studentReferenceId: string): Promise<CourseEnrollmentDto | null>;
  updateEnrollmentProgress(courseId: string, studentReferenceId: string, progressPercentage: number): Promise<CourseEnrollmentDto>;

  upsertLessonProgress(data: UpsertLessonProgressDto): Promise<CourseLessonProgressDto>;
  listLessonProgress(courseId: string, studentReferenceId: string): Promise<CourseLessonProgressDto[]>;

  createQuizAttempt(data: CreateQuizAttemptDto): Promise<CourseQuizAttemptDto>;
  submitQuizAttempt(data: SubmitQuizAttemptDto): Promise<CourseQuizAttemptDto>;
  listQuizAttempts(courseId: string, studentReferenceId: string): Promise<CourseQuizAttemptDto[]>;

  completeCourse(data: CreateCourseCompletionDto): Promise<CourseCompletionDto>;
  findCompletion(courseId: string, studentReferenceId: string): Promise<CourseCompletionDto | null>;
  getStudentProgressSnapshot(courseId: string, studentReferenceId: string): Promise<StudentCourseProgressSnapshotDto | null>;
}
