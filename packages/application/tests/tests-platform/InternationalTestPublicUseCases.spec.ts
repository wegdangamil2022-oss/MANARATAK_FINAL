import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InternationalTestPublicUseCases } from '../../src/tests-platform/use-cases/InternationalTestUseCases';
import { 
  InternationalTestStatus,
  IInternationalTestRepository
} from '@manaratak/domain';

describe('InternationalTestPublicUseCases', () => {
  let mockRepository: any;
  let useCases: InternationalTestPublicUseCases;

  beforeEach(() => {
    mockRepository = {
      listPublished: vi.fn(),
      findBySlug: vi.fn()
    };

    useCases = new InternationalTestPublicUseCases(mockRepository as IInternationalTestRepository);
  });

  describe('listPublished', () => {
    it('should call repository.listPublished and cap page size to 50', async () => {
      mockRepository.listPublished.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50
      });

      await useCases.listPublished({ pageSize: 100 });

      expect(mockRepository.listPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 50
        })
      );
    });
  });

  describe('getPublishedBySlug', () => {
    it('should throw if test is not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);

      await expect(useCases.getPublishedBySlug('sat-digital')).rejects.toThrow('International test not found');
    });

    it('should throw if test status is not PUBLISHED', async () => {
      mockRepository.findBySlug.mockResolvedValue({
        id: 'test-1',
        slug: 'sat-digital',
        status: InternationalTestStatus.READY_TO_PUBLISH
      });

      await expect(useCases.getPublishedBySlug('sat-digital')).rejects.toThrow('International test not found');
    });

    it('should return test if status is PUBLISHED', async () => {
      const publishedTest = {
        id: 'test-1',
        slug: 'sat-digital',
        status: InternationalTestStatus.PUBLISHED,
        canonicalName: 'SAT Digital'
      };

      mockRepository.findBySlug.mockResolvedValue(publishedTest);

      const result = await useCases.getPublishedBySlug('sat-digital');

      expect(result).toEqual(publishedTest);
    });
  });
});
