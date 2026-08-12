import { CourseAccessType } from '../enums/CourseAccessType';
import { CourseImportCompletenessState } from '../enums/CourseImportCompletenessState';
import { CourseOriginType } from '../enums/CourseOriginType';
import { CourseStatus } from '../enums/CourseStatus';

export interface CreateCourseDto {
  publicId: string;
  slug: string;
  canonicalName: string;
  canonicalDedupKey: string;
  displayName: string;
  accessType: CourseAccessType;
  originType: CourseOriginType;
  directCourseUrl: string;
  status: CourseStatus;
  completenessStatus: CourseImportCompletenessState;

  platformName?: string;
  providerName?: string;
  learningLanguage?: string;
  studyDuration?: string;
  certificateAvailable?: boolean;
  category?: string;
  difficultyLevel?: string;
  sourceUrl?: string;
  officialSourceUrl?: string;
  thumbnailAssetId?: string;

  sourceImportRecordId?: string;
  optionalFields?: Record<string, unknown>;
}

export interface CourseDto extends CreateCourseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
