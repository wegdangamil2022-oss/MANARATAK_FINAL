import { describe, expect, it, vi } from 'vitest';
import {
  CourseAccessType,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  ICourseRepository,
  ImportRecordDto,
  ImportRecordStatus
} from '@manaratak/domain';
import { CourseImportPromotionUseCase } from '../../src/courses/use-cases/CourseImportPromotionUseCase';

describe('CourseImportPromotionUseCase', () => {
  const createMockRepo = (): ICourseRepository => ({
    create: vi.fn().mockImplementation(async (data) => ({ id: 'course-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
    update: vi.fn(),
    findByDedupKey: vi.fn().mockResolvedValue(null),
    findById: vi.fn(),
    findByPublicId: vi.fn(),
    findBySlug: vi.fn(),
    updateStatus: vi.fn(),
    updateImportLink: vi.fn(),
    listByStatus: vi.fn(),
    list: vi.fn(),
  });

  const createRecord = (status: ImportRecordStatus, payload: Record<string, unknown>): ImportRecordDto => ({
    id: 'rec-1',
    batchId: 'batch-1',
    status,
    rawPayload: payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('rejects records that are not VALID or NEEDS_REVIEW', async () => {
    const repo = createMockRepo();
    const useCase = new CourseImportPromotionUseCase(repo);

    const result = await useCase.promote(createRecord(ImportRecordStatus.STAGED, {}));

    expect(result.type).toBe('REJECTED');
  });

  it('creates an imported course from a trusted VALID free import record', async () => {
    const repo = createMockRepo();
    const useCase = new CourseImportPromotionUseCase(repo);

    const result = await useCase.promote(createRecord(ImportRecordStatus.VALID, {
      courseName: 'Introduction to Data Science',
      accessType: CourseAccessType.FREE_CERTIFICATE,
      originType: CourseOriginType.EXTERNAL_LINKED_COURSE,
      directCourseUrl: 'https://example.org/courses/data-science',
      platformName: 'Global Learning',
      sourceUrl: 'https://example.org/courses/data-science',
      acquiredSkills: ['Data analysis']
    }));

    expect(result.type).toBe('CREATED');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      displayName: 'Introduction to Data Science',
      canonicalName: 'Introduction to Data Science',
      canonicalDedupKey: 'introduction to data science|global learning|https://example.org/courses/data-science|free_certificate',
      accessType: CourseAccessType.FREE_CERTIFICATE,
      originType: CourseOriginType.EXTERNAL_LINKED_COURSE,
      status: CourseStatus.IMPORTED,
      completenessStatus: CourseImportCompletenessState.COMPLETE,
      sourceImportRecordId: 'rec-1',
      optionalFields: expect.objectContaining({
        acquiredSkills: ['Data analysis']
      })
    }));
  });

  it('rejects paid course imports from the global free path', async () => {
    const repo = createMockRepo();
    const useCase = new CourseImportPromotionUseCase(repo);

    const result = await useCase.promote(createRecord(ImportRecordStatus.VALID, {
      courseName: 'Premium IELTS Preparation',
      accessType: CourseAccessType.PAID,
      directCourseUrl: 'https://example.org/courses/ielts-premium',
      platformName: 'Global Learning',
      sourceUrl: 'https://example.org/courses/ielts-premium'
    }));

    expect(result.type).toBe('REJECTED');
    if (result.type === 'REJECTED') {
      expect(result.reason).toContain('Paid or unsupported');
    }
  });

  it('returns DUPLICATE when a canonical course already exists', async () => {
    const repo = createMockRepo();
    repo.findByDedupKey = vi.fn().mockResolvedValue({ id: 'existing-1' });
    const useCase = new CourseImportPromotionUseCase(repo);

    const result = await useCase.promote(createRecord(ImportRecordStatus.VALID, {
      courseName: 'Introduction to Data Science',
      accessType: CourseAccessType.FREE_STUDY,
      directCourseUrl: 'https://example.org/courses/data-science',
      platformName: 'Global Learning',
      sourceUrl: 'https://example.org/courses/data-science'
    }));

    expect(result.type).toBe('DUPLICATE');
    if (result.type === 'DUPLICATE') {
      expect(result.existingId).toBe('existing-1');
    }
  });
});
