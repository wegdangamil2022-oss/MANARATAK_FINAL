import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminScholarshipUseCases } from '../../src/scholarships/use-cases/AdminScholarshipUseCases';
import { 
  IScholarshipRepository, 
  ScholarshipStatus,
  ScholarshipCompletenessState
} from '@manaratak/domain';

describe('AdminScholarshipUseCases', () => {
  let mockRepo: IScholarshipRepository;
  let useCases: AdminScholarshipUseCases;

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
      listPublishable: vi.fn(),
      list: vi.fn(),
    };
    useCases = new AdminScholarshipUseCases(mockRepo);
  });

  it('listScholarships calls repo.list with filters', async () => {
    const filters = { status: ScholarshipStatus.READY_TO_REVIEW, page: 2 };
    mockRepo.list = vi.fn().mockResolvedValue({ data: [], total: 0 });
    
    await useCases.listScholarships(filters);
    expect(mockRepo.list).toHaveBeenCalledWith(filters);
  });

  it('updateScholarship updates fields and recomputes completeness', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'schol-1',
      displayName: 'Test',
      fundingCoverage: 'Full',
      status: ScholarshipStatus.IMPORTED,
      completenessStatus: ScholarshipCompletenessState.COMPLETE
    });
    
    await useCases.updateScholarship('schol-1', {
      displayName: 'Updated Test',
      fundingCoverage: 'None'
    });
    
    expect(mockRepo.update).toHaveBeenCalledWith('schol-1', expect.objectContaining({
      displayName: 'Updated Test',
      fundingCoverage: 'None',
      completenessStatus: expect.any(String) // should be recomputed
    }));
  });

  it('markReadyToPublish transitions only if COMPLETE', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'schol-1',
      status: ScholarshipStatus.READY_TO_REVIEW,
      completenessStatus: ScholarshipCompletenessState.COMPLETE
    });
    
    await useCases.markReadyToPublish('schol-1');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('schol-1', ScholarshipStatus.READY_TO_PUBLISH);
  });

  it('markReadyToPublish rejects if INCOMPLETE', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'schol-1',
      status: ScholarshipStatus.READY_TO_REVIEW,
      completenessStatus: ScholarshipCompletenessState.INCOMPLETE
    });
    
    await expect(useCases.markReadyToPublish('schol-1')).rejects.toThrow('Only COMPLETE');
  });

  it('publish transitions only if READY_TO_PUBLISH', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'schol-1',
      status: ScholarshipStatus.READY_TO_PUBLISH,
    });
    
    await useCases.publish('schol-1');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('schol-1', ScholarshipStatus.PUBLISHED);
  });
  
  it('publish rejects if not READY_TO_PUBLISH', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: 'schol-1',
      status: ScholarshipStatus.IMPORTED,
    });
    
    await expect(useCases.publish('schol-1')).rejects.toThrow('Only READY_TO_PUBLISH');
  });
});
