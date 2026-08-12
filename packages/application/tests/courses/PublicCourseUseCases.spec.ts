import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseAccessType,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  ICourseRepository
} from '@manaratak/domain';
import { PublicCourseUseCases } from '../../src/courses/use-cases/PublicCourseUseCases';

describe('PublicCourseUseCases', () => {
  let mockRepo: ICourseRepository;
  let useCases: PublicCourseUseCases;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findByDedupKey: vi.fn(),
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      findBySlug: vi.fn(),
      updateStatus: vi.fn(),
      updateImportLink: vi.fn(),
      listByStatus: vi.fn(),
      list: vi.fn(),
      listPublished: vi.fn(),
    };
    useCases = new PublicCourseUseCases(mockRepo);
  });

  it('listCourses calls listPublished and strips internal fields', async () => {
    const filters = { accessType: CourseAccessType.FREE_CERTIFICATE, page: 1, pageSize: 20 };
    mockRepo.listPublished = vi.fn().mockResolvedValue({
      data: [{
        id: 'internal-id',
        publicId: 'pub-1',
        slug: 'intro-data-science',
        displayName: 'Introduction to Data Science',
        canonicalName: 'Introduction to Data Science',
        canonicalDedupKey: 'secret-key',
        accessType: CourseAccessType.FREE_CERTIFICATE,
        originType: CourseOriginType.EXTERNAL_LINKED_COURSE,
        directCourseUrl: 'https://example.org/course',
        status: CourseStatus.PUBLISHED,
        completenessStatus: CourseImportCompletenessState.COMPLETE,
        sourceImportRecordId: 'rec-1',
        optionalFields: { acquiredSkills: ['Data analysis'] },
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1
    });

    const result = await useCases.listCourses(filters);

    expect(mockRepo.listPublished).toHaveBeenCalledWith(filters);
    expect(result.data[0]).not.toHaveProperty('id');
    expect(result.data[0]).not.toHaveProperty('canonicalDedupKey');
    expect(result.data[0]).not.toHaveProperty('sourceImportRecordId');
    expect(result.data[0]).not.toHaveProperty('status');
    expect(result.data[0]).toHaveProperty('displayName', 'Introduction to Data Science');
    expect(result.data[0]).toHaveProperty('acquiredSkills', ['Data analysis']);
  });

  it('getCourse returns mapped DTO only if PUBLISHED', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue({
      id: 'course-1',
      publicId: 'pub-1',
      slug: 'intro-data-science',
      displayName: 'Introduction to Data Science',
      canonicalName: 'Introduction to Data Science',
      accessType: CourseAccessType.FREE_CERTIFICATE,
      originType: CourseOriginType.EXTERNAL_LINKED_COURSE,
      directCourseUrl: 'https://example.org/course',
      status: CourseStatus.PUBLISHED,
      optionalFields: { courseContent: 'Foundations of data science.' },
      updatedAt: new Date()
    });

    const result = await useCases.getCourse('intro-data-science');

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('status');
    expect(result).toHaveProperty('displayName', 'Introduction to Data Science');
    expect(result).toHaveProperty('courseContent', 'Foundations of data science.');
  });

  it('getCourse throws if not PUBLISHED', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue({
      id: 'course-1',
      slug: 'intro-data-science',
      status: CourseStatus.READY_TO_PUBLISH,
      displayName: 'Introduction to Data Science'
    });

    await expect(useCases.getCourse('intro-data-science')).rejects.toThrow('Course not found');
  });
});
