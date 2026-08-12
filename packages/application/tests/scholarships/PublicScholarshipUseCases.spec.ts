import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublicScholarshipUseCases } from '../../src/scholarships/use-cases/PublicScholarshipUseCases';
import { 
  IScholarshipRepository, 
  ScholarshipStatus,
  ScholarshipCompletenessState
} from '@manaratak/domain';

describe('PublicScholarshipUseCases', () => {
  let mockRepo: IScholarshipRepository;
  let useCases: PublicScholarshipUseCases;

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
      listPublished: vi.fn(),
    };
    useCases = new PublicScholarshipUseCases(mockRepo);
  });

  it('listScholarships calls repo.listPublished and maps dtos', async () => {
    const filters = { page: 1, pageSize: 20 };
    mockRepo.listPublished = vi.fn().mockResolvedValue({ 
      data: [{
        id: 'internal-id',
        status: ScholarshipStatus.PUBLISHED,
        displayName: 'Test',
        optionalFields: { customField: 'value' }
      }], 
      total: 1 
    });
    
    const result = await useCases.listScholarships(filters);
    expect(mockRepo.listPublished).toHaveBeenCalledWith(filters);
    expect(result.data[0]).not.toHaveProperty('id');
    expect(result.data[0]).toHaveProperty('displayName', 'Test');
    expect(result.data[0]).toHaveProperty('customField', 'value');
  });

  it('getScholarship returns mapped DTO if PUBLISHED', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue({
      id: 'schol-1',
      slug: 'test-slug',
      status: ScholarshipStatus.PUBLISHED,
      displayName: 'Test',
      optionalFields: { extra: 123 }
    });
    
    const result = await useCases.getScholarship('test-slug');
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('status');
    expect(result).toHaveProperty('displayName', 'Test');
    expect(result).toHaveProperty('extra', 123);
  });

  it('getScholarship throws if not PUBLISHED', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue({
      id: 'schol-1',
      slug: 'test-slug',
      status: ScholarshipStatus.READY_TO_PUBLISH,
      displayName: 'Test'
    });
    
    await expect(useCases.getScholarship('test-slug')).rejects.toThrow('Scholarship not found');
  });

  it('getScholarship throws if not found', async () => {
    mockRepo.findBySlug = vi.fn().mockResolvedValue(null);
    
    await expect(useCases.getScholarship('test-slug')).rejects.toThrow('Scholarship not found');
  });
});
