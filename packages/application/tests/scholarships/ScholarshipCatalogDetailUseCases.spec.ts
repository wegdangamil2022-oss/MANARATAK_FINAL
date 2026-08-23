import { describe, expect, it, vi } from 'vitest';
import {
  ScholarshipCompletenessState,
  ScholarshipPublicationStatus,
  ScholarshipStatus,
  ScholarshipVerificationStatus,
  type IScholarshipRepository,
  type ScholarshipDto,
} from '@manaratak/domain';
import { AdminScholarshipUseCases } from '../../src/scholarships/use-cases/AdminScholarshipUseCases';

function scholarship(overrides: Partial<ScholarshipDto> = {}): ScholarshipDto {
  return {
    id: 'sch-1',
    publicId: 'SCH-1',
    slug: 'sample',
    canonicalName: 'Sample Scholarship',
    canonicalDedupKey: 'provider|sample|2027',
    displayName: 'Sample Scholarship',
    providerName: 'Provider',
    status: ScholarshipStatus.READY_TO_REVIEW,
    completenessStatus: ScholarshipCompletenessState.COMPLETE,
    verificationStatus: ScholarshipVerificationStatus.VERIFIED,
    publicationStatus: ScholarshipPublicationStatus.DRAFT,
    fundingTypeCode: 'FULLY_FUNDED',
    isFullyFunded: true,
    countryReferenceId: 'country-1',
    countrySourceLabel: 'Qatar',
    applicationDeadline: new Date('2027-01-01T00:00:00Z'),
    officialSourceUrl: 'https://example.edu/scholarship',
    degreeTargets: [{ targetKey: 'd1', degreeLevelId: 'degree-1', sourceLabel: 'Bachelor', resolutionStatus: 'RESOLVED' }],
    benefits: [{ benefitKey: 'b1', benefitTypeCode: 'TUITION', valueText: 'Full tuition' }],
    eligibilityItems: [{ itemKey: 'e1', itemTypeCode: 'GENERAL', valueText: 'Merit', isRequired: true }],
    requiredDocumentItems: [{ documentKey: 'doc1', displayName: 'Transcript', isRequired: true }],
    majorTargets: [],
    sourceEvidence: [{ evidenceKey: 's1', sourceTypeCode: 'OFFICIAL', sourceUrl: 'https://example.edu/scholarship', isOfficial: true }],
    universityLinks: [],
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  } as ScholarshipDto;
}

function repository(current: ScholarshipDto): IScholarshipRepository {
  return {
    findById: vi.fn(async () => current),
    update: vi.fn(async (_id, updates) => ({ ...current, ...updates, updatedAt: new Date() })),
  } as unknown as IScholarshipRepository;
}

describe('WP12-9 AdminScholarshipUseCases catalog detail', () => {
  it('classifies COMPLETE from normalized collections without legacy optionalFields', async () => {
    const repo = repository(scholarship({ optionalFields: {} }));
    const service = new AdminScholarshipUseCases(repo);
    const detail = await service.getScholarshipCatalogDetail('sch-1');
    expect(detail.completeness.state).toBe(ScholarshipCompletenessState.COMPLETE);
    expect(detail.completeness.missingFields).toEqual([]);
  });

  it('uses normalized [] replacement semantics when recalculating completeness', async () => {
    const current = scholarship();
    const repo = repository(current);
    const service = new AdminScholarshipUseCases(repo);
    await service.updateScholarship('sch-1', { requiredDocumentItems: [] });
    expect(repo.update).toHaveBeenCalledWith('sch-1', expect.objectContaining({
      requiredDocumentItems: [],
      completenessStatus: ScholarshipCompletenessState.NEEDS_REVIEW,
    }));
  });

  it('reports unresolved normalized canonical links without inventing ids', async () => {
    const repo = repository(scholarship({
      majorTargets: [{ targetKey: 'm1', sourceLabel: 'Computer Science', majorId: null, resolutionStatus: 'UNRESOLVED' }],
      studyLanguageSourceLabel: 'English',
      studyLanguageReferenceId: null,
      studyLanguageResolutionStatus: 'UNRESOLVED',
    }));
    const service = new AdminScholarshipUseCases(repo);
    const detail = await service.getScholarshipCatalogDetail('sch-1');
    expect(detail.unresolvedLinks).toEqual(expect.arrayContaining([
      expect.objectContaining({ area: 'MAJOR', key: 'm1', canonicalId: null }),
      expect.objectContaining({ area: 'STUDY_LANGUAGE', rawValue: 'English', canonicalId: null }),
    ]));
  });
  it('preserves existing canonical references and rejects blind reference replacement through generic update', async () => {
    const current = scholarship({
      degreeTargets: [{ targetKey: 'd1', degreeLevelId: 'degree-existing', sourceLabel: 'Bachelor', resolutionStatus: 'RESOLVED' }],
      requiredDocumentItems: [{ documentKey: 'doc1', displayName: 'IELTS', internationalTestId: 'test-existing', resolutionStatus: 'RESOLVED', isRequired: true }],
    });
    const repo = repository(current);
    const service = new AdminScholarshipUseCases(repo);
    await service.updateScholarship('sch-1', {
      degreeTargets: [{ targetKey: 'd1', degreeLevelId: 'degree-fake', sourceLabel: 'Updated Bachelor', resolutionStatus: 'RESOLVED' }],
      requiredDocumentItems: [{ documentKey: 'doc1', displayName: 'IELTS Academic', internationalTestId: 'test-fake', resolutionStatus: 'RESOLVED', isRequired: true }],
      countryReferenceId: 'country-fake',
    });
    expect(repo.update).toHaveBeenCalledWith('sch-1', expect.objectContaining({
      degreeTargets: [expect.objectContaining({ degreeLevelId: 'degree-existing' })],
      requiredDocumentItems: [expect.objectContaining({ internationalTestId: 'test-existing' })],
    }));
    const saved = (repo.update as any).mock.calls[0][1];
    expect(saved.countryReferenceId).toBeUndefined();
  });

});
