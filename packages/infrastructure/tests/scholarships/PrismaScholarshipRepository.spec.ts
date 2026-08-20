import { beforeEach, describe, expect, it, vi } from 'vitest';
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
        count: vi.fn(),
      },
    };
    repository = new PrismaScholarshipRepository(mockPrisma as any);
  });

  it('writes normalized root fields and child relations while retaining legacy evidence', async () => {
    const payload: any = {
      publicId: 'schol-123',
      slug: 'test-slug',
      canonicalName: 'Test',
      canonicalDedupKey: 'test|key',
      displayName: 'Test Scholarship',
      providerName: 'Test Provider',
      status: 'IMPORTED',
      completenessStatus: 'COMPLETE',
      applicationLink: 'https://example.com/apply',
      officialSourceUrl: 'https://example.com/official',
      sourceLocale: 'en',
      fundingCoverage: 'Tuition and Fees',
      benefits: [
        {
          benefitKey: 'tuition',
          benefitTypeCode: 'TUITION',
          valueText: 'Full tuition',
        },
      ],
      optionalFields: { customField: 'legacy-evidence-only' },
    };

    mockPrisma.scholarship.create.mockResolvedValue({
      ...payload,
      id: 'db-id-123',
      createdAt: new Date('2026-08-20T00:00:00Z'),
      updatedAt: new Date('2026-08-20T00:00:00Z'),
      applicationUrl: 'https://example.com/apply',
      optionalFields: {
        fundingCoverage: 'Tuition and Fees',
        applicationLink: 'https://example.com/apply',
        customField: 'legacy-evidence-only',
      },
      benefits: [
        {
          id: 'benefit-1',
          scholarshipId: 'db-id-123',
          benefitKey: 'tuition',
          benefitTypeCode: 'TUITION',
          valueText: 'Full tuition',
        },
      ],
      degreeTargets: [],
      majorTargets: [],
      eligibilityItems: [],
      requiredDocuments: [],
      sourceEvidence: [],
      universityLinks: [],
    });

    const result = await repository.create(payload);

    expect(mockPrisma.scholarship.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        publicId: 'schol-123',
        applicationUrl: 'https://example.com/apply',
        officialSourceUrl: 'https://example.com/official',
        sourceLocale: 'en',
        benefits: {
          create: [
            expect.objectContaining({
              benefitKey: 'tuition',
              benefitTypeCode: 'TUITION',
            }),
          ],
        },
      }),
      include: expect.objectContaining({
        benefits: true,
        degreeTargets: true,
        majorTargets: true,
        sourceEvidence: true,
        universityLinks: true,
      }),
    });
    expect(result.fundingCoverage).toBe('Tuition and Fees');
    expect((result as any).customField).toBeUndefined();
    expect(result.optionalFields).toHaveProperty('customField', 'legacy-evidence-only');
    expect(result.benefits?.[0].benefitKey).toBe('tuition');
  });

  it('does not flatten arbitrary optionalFields keys into the domain DTO root', async () => {
    mockPrisma.scholarship.findUnique.mockResolvedValue({
      id: 'db-id-123',
      publicId: 'schol-123',
      slug: 'test',
      canonicalName: 'Test',
      canonicalDedupKey: 'test|key',
      displayName: 'Test',
      status: 'PUBLISHED',
      completenessStatus: 'COMPLETE',
      optionalFields: {
        fundingCoverage: 'Full funding',
        arbitraryExperimentalKey: 'must-not-leak',
      },
      benefits: [],
      degreeTargets: [],
      majorTargets: [],
      eligibilityItems: [],
      requiredDocuments: [],
      sourceEvidence: [],
      universityLinks: [],
      createdAt: new Date('2026-08-20T00:00:00Z'),
      updatedAt: new Date('2026-08-20T00:00:00Z'),
    });

    const result = await repository.findById('db-id-123');

    expect(result?.fundingCoverage).toBe('Full funding');
    expect((result as any)?.arbitraryExperimentalKey).toBeUndefined();
    expect(result?.optionalFields).toHaveProperty('arbitraryExperimentalKey', 'must-not-leak');
  });

  it('listPublished requests only PUBLISHED scholarships and includes normalized children', async () => {
    mockPrisma.scholarship.findMany.mockResolvedValue([]);
    mockPrisma.scholarship.count.mockResolvedValue(0);

    await repository.listPublished({ page: 1 });

    expect(mockPrisma.scholarship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED' }),
        include: expect.objectContaining({
          benefits: true,
          requiredDocuments: true,
          universityLinks: true,
        }),
      }),
    );
  });
});
