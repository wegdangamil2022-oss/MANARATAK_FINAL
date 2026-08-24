export type NativeCourseReadinessState = 'COMPLETE' | 'INCOMPLETE' | 'OPTIONAL';

export interface NativeCourseReadinessCheckDto {
  key: string;
  label: string;
  state: NativeCourseReadinessState;
  message?: string;
  targetSection?: 'basics' | 'curriculum' | 'assessments' | 'completion' | 'settings';
}

export interface NativeCourseReadinessDto {
  ready: boolean;
  percentage: number;
  checks: NativeCourseReadinessCheckDto[];
}

export interface CreateNativeCourseDto {
  titleAr: string;
  titleEn?: string;
  learningLanguage?: string;
  category?: string;
  difficultyLevel?: string;
}
