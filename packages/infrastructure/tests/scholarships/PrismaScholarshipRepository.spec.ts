import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PrismaScholarshipRepository } from '../../src/scholarships/PrismaScholarshipRepository';

describe('PrismaScholarshipRepository', () => {
  let mockPrisma: any;
  let repository: PrismaScholarshipRepository;

  beforeEach(() => {
    mockPrisma = {
      scholarship: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn()
      }
    };
    repository = new PrismaScholarshipRepository(mockPrisma as any);
  });

  it('create maps domain fields to Prisma and JSON optionalFields correctly', async () => {
    const payload = {
      publicId: 'schol-123',
      slug: 'test-slug',
      canonicalName: 'Test',
      canonicalDedupKey: 'test|key',
      displayName: 'Test Scholarship',
      providerName: 'Test Provider',
      status: 'IMPORTED',
      completenessStatus: 'COMPLETE',
      amountMinorUnits: '1000',
      amountCurrencyCode: 'USD',
      isFullyFunded: true,
      applicationDeadline: new Date('2025-01-01'),
      officialWebsite: 'https://example.com',
      sourceUrl: 'https://source.com',
      fundingCoverage: 'Tuition and Fees', // This should go to optionalFields
      customField: 'Something else' // This should go to optionalFields
    };

    mockPrisma.scholarship.create.mockResolvedValue({
      ...payload,
      id: 'db-id-123',
      optionalFields: {
        fundingCoverage: 'Tuition and Fees',
        customField: 'Something else'
      }
    });

    const result = await repository.create(payload);

    expect(mockPrisma.scholarship.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        publicId: 'schol-123',
        displayName: 'Test Scholarship',
        optionalFields: {
          fundingCoverage: 'Tuition and Fees',
          customField: 'Something else'
        }
      })
    });

    // The result should have the optional fields flattened
    expect(result.fundingCoverage).toBe('Tuition and Fees');
    expect(result.customField).toBe('Something else');
  });

  it('listPublished only returns PUBLISHED status', async () => {
    mockPrisma.scholarship.findMany.mockResolvedValue([]);
    mockPrisma.scholarship.count.mockResolvedValue(0);

    await repository.listPublished({ page: 1 });

    expect(mockPrisma.scholarship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED' })
      })
    );
  });
});
