import { v4 as uuidv4 } from 'uuid';
import {
  CourseCompletenessClassifier,
  CourseDeduplicationService,
  CourseImportCompletenessState,
  CourseImportPayloadSchema,
  CourseNamingService,
  CourseStatus,
  ICourseRepository,
  ImportRecordDto,
  ImportRecordStatus
} from '@manaratak/domain';

export type CoursePromotionResult =
  | { type: 'CREATED'; courseId: string }
  | { type: 'DUPLICATE'; existingId: string }
  | { type: 'REJECTED'; reason: string }
  | { type: 'FAILED'; error: string };

export class CourseImportPromotionUseCase {
  constructor(private readonly repository: ICourseRepository) {}

  public async promote(record: ImportRecordDto): Promise<CoursePromotionResult> {
    try {
      if (
        record.status !== ImportRecordStatus.VALID && 
        record.status !== ImportRecordStatus.COMPLETE && 
        record.status !== ImportRecordStatus.NEEDS_REVIEW
      ) {
        return { type: 'REJECTED', reason: `ImportRecord status is ${record.status}, not VALID or NEEDS_REVIEW` };
      }

      const rawPayload = record.normalizedPayload || record.rawPayload;
      const validationResult = CourseImportPayloadSchema.safeParse(rawPayload);

      if (!validationResult.success) {
        return { type: 'REJECTED', reason: 'Payload fails schema validation' };
      }

      const payload = validationResult.data;
      const classification = CourseCompletenessClassifier.classify(payload);

      if (classification.state === CourseImportCompletenessState.INCOMPLETE) {
        return { type: 'REJECTED', reason: 'Record classified as INCOMPLETE' };
      }

      if (classification.state === CourseImportCompletenessState.REJECTED) {
        return { type: 'REJECTED', reason: 'Paid or unsupported course import path' };
      }

      const canonicalName = CourseNamingService.normalize(payload.courseName);
      const dedupKey = CourseDeduplicationService.generateKey(payload);
      const existing = await this.repository.findByDedupKey(dedupKey);

      if (existing) {
        return { type: 'DUPLICATE', existingId: existing.id };
      }

      const publicId = `crs-${uuidv4().substring(0, 8)}`;
      const slugBase = canonicalName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const slug = `${slugBase || 'course'}-${publicId.substring(0, 4)}`;

      let status = CourseStatus.READY_TO_REVIEW;
      if (classification.state === CourseImportCompletenessState.COMPLETE) {
        status = CourseStatus.IMPORTED;
      }

      const created = await this.repository.create({
        publicId,
        slug,
        canonicalName,
        canonicalDedupKey: dedupKey,
        displayName: payload.courseName,
        accessType: payload.accessType,
        originType: payload.originType,
        directCourseUrl: payload.directCourseUrl,
        status,
        completenessStatus: classification.state,
        platformName: payload.platformName,
        providerName: payload.providerName,
        learningLanguage: payload.learningLanguage,
        studyDuration: payload.studyDuration,
        certificateAvailable: payload.certificateAvailable,
        category: payload.category,
        difficultyLevel: payload.difficultyLevel,
        sourceUrl: payload.sourceUrl === '' ? undefined : payload.sourceUrl,
        officialSourceUrl: payload.officialSourceUrl === '' ? undefined : payload.officialSourceUrl,
        thumbnailAssetId: payload.thumbnailAssetId,
        sourceImportRecordId: record.id,
        optionalFields: {
          courseContent: payload.courseContent,
          relatedMajorsOrFields: payload.relatedMajorsOrFields,
          acquiredSkills: payload.acquiredSkills,
          localizedNames: payload.localizedNames,
          metadata: payload.metadata,
        }
      });

      return { type: 'CREATED', courseId: created.id };
    } catch (error) {
      return {
        type: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
