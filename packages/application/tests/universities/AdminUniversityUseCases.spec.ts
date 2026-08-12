import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminUniversityUseCases } from '../../src/universities/use-cases/AdminUniversityUseCases';
import {
  IUniversityRepository,
  UniversityImportCompletenessState,
  UniversityStatus
} from '@manaratak/domain';

describe('AdminUniversityUseCases', () => {
  let mockRepo: IUniversityRepository;
  let useCases: AdminUniversityUseCases;

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
    };
    useCases = new AdminUniversityUseCases(mockRepo);
  });

  it('listUniversities delegates filters to repository', async () => {
    const filters = { status: UniversityStatus.READY_TO_REVIEW, country: 'Qatar', page: 2 };
    mockRepo.list = vi.fn().mockResolvedValue({ data: [], total: 0, page: 2, pageSize: 20, totalPages: 0 });

    await useCases.listUniversities(filters);

    expect(mockRepo.list).toHaveBeenCalledWith(filters);
  });

  it('updateUniversity updates fields and recomputes completeness', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'uni-1',
      displayName: 'Qatar University',
      officialWebsite: 'https://www.qu.edu.qa',
      country: 'Qatar',
      institutionType: 'Public University',
      sourceUrl: 'https://www.qu.edu.qa/about',
      officialSourceUrl: 'https://www.qu.edu.qa/about',
      status: UniversityStatus.IMPORTED,
      completenessStatus: UniversityImportCompletenessState.COMPLETE
    });
    mockRepo.update = vi.fn().mockResolvedValue({ id: 'uni-1' });

    await useCases.updateUniversity('uni-1', {
      displayName: 'Updated Qatar University', city: 'Doha'
    });

    expect(mockRepo.update).toHaveBeenCalledWith('uni-1', expect.objectContaining({
      displayName: 'Updated Qatar University', city: 'Doha',
      completenessStatus: UniversityImportCompletenessState.COMPLETE
    }));
  });

  it('markReadyToPublish only allows COMPLETE universities', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'uni-1',
      status: UniversityStatus.READY_TO_REVIEW,
      completenessStatus: UniversityImportCompletenessState.COMPLETE
    });

    await useCases.markReadyToPublish('uni-1');

    expect(mockRepo.updateStatus).toHaveBeenCalledWith('uni-1', UniversityStatus.READY_TO_PUBLISH);
  });

  it('publish only allows READY_TO_PUBLISH universities', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'uni-1',
      status: UniversityStatus.IMPORTED,
      completenessStatus: UniversityImportCompletenessState.COMPLETE
    });

    await expect(useCases.publish('uni-1')).rejects.toThrow('Only READY_TO_PUBLISH');
  });
});
