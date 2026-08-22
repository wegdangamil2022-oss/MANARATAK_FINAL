import { describe, expect, it } from 'vitest';
import {
  CourseAcademicTaxonomyLinkDto,
  CourseMajorProjectionDto,
  ICourseRelationshipRepository,
} from '@manaratak/domain';
import { CourseRelationshipResolutionService } from '../../src/courses/services/CourseRelationshipResolutionService';

class FakeRelationshipRepository implements ICourseRelationshipRepository {
  source: any = {
    courseId: 'course-1',
    status: 'IMPORTED',
    sourceImportRecordId: 'rec-1',
    shortCourseTopicsRaw: 'Cybersecurity • Data Science',
    learningLanguageRaw: 'English',
    learningLanguageReferenceId: null,
    learningLanguageResolutionState: 'UNRESOLVED',
    externalProviderId: 'provider-1',
    provider: {
      id: 'provider-1',
      publicId: 'ecp-provider',
      canonicalName: 'Global Provider',
      headquartersCountryReferenceId: 'country-us',
      headquartersCountry: {
        id: 'country-us',
        iso2Code: 'US',
        iso3Code: 'USA',
        name: 'United States',
      },
    },
  };

  candidates = new Map<string, any[]>([
    ['cybersecurity', [{
      nodeId: 'tax-cyber',
      nodeType: 'DISCIPLINE',
      canonicalCode: 'CYBERSECURITY',
      canonicalName: 'Cybersecurity',
      standardType: 'CUSTOM_NATIONAL',
      matchMethod: 'EXACT_CANONICAL_NAME',
    }]],
    ['data science', [
      {
        nodeId: 'tax-ds-1',
        nodeType: 'DISCIPLINE',
        canonicalCode: 'DATA_SCIENCE_1',
        canonicalName: 'Data Science',
        standardType: 'CUSTOM_NATIONAL',
        matchMethod: 'EXACT_CANONICAL_NAME',
      },
      {
        nodeId: 'tax-ds-2',
        nodeType: 'PROGRAM_AREA',
        canonicalCode: 'DATA_SCIENCE_2',
        canonicalName: 'Data Science',
        standardType: 'CUSTOM_NATIONAL',
        matchMethod: 'EXACT_ALIAS',
      },
    ]],
  ]);

  resolutions: any[] = [];
  links: CourseAcademicTaxonomyLinkDto[] = [];
  languageCandidates: any[] = [{
    id: 'lang-en',
    isoCode: 'en',
    name: 'English',
    matchMethod: 'EXACT_NAME',
  }];
  languageState: any = null;
  projections: CourseMajorProjectionDto[] = [];
  majorMappings: any[] = [{
    mappingId: 'mapping-1',
    taxonomyNodeId: 'tax-cyber',
    majorId: 'major-1',
    profileId: null,
    relationshipType: 'RELATED',
    confidence: 0.9,
  }];

  async getRelationshipSource(courseId: string) {
    return courseId === this.source.courseId ? this.source : null;
  }

  async resolveTaxonomyCandidates(term: string) {
    return this.candidates.get(term) ?? [];
  }

  async upsertTaxonomyResolution(input: any) {
    const dto = {
      id: `resolution-${this.resolutions.length + 1}`,
      ...input,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.resolutions.push(dto);
    return dto;
  }

  async upsertTaxonomyLink(input: any) {
    const existing = this.links.find((link) =>
      link.courseId === input.courseId &&
      link.taxonomyNodeId === input.taxonomyNodeId &&
      link.relationshipType === input.relationshipType
    );
    if (existing) return existing;
    const dto: CourseAcademicTaxonomyLinkDto = {
      id: `link-${this.links.length + 1}`,
      ...input,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.links.push(dto);
    return dto;
  }

  async listTaxonomyLinks(courseId: string, reviewState?: any) {
    return this.links.filter((link) =>
      link.courseId === courseId && (!reviewState || link.reviewState === reviewState)
    );
  }

  async reviewTaxonomyLink(input: any) {
    const link = this.links.find((item) => item.id === input.linkId);
    if (!link) throw new Error('not-found');
    link.reviewState = input.decision;
    link.reviewedBy = input.actorId;
    link.reviewedAt = new Date();
    return link;
  }

  async resolveLanguageCandidates() {
    return this.languageCandidates;
  }

  async setLanguageResolution(input: any) {
    this.languageState = input;
  }

  async reviewLanguageResolution(input: any) {
    this.source.learningLanguageReferenceId = input.languageReferenceId;
    this.source.learningLanguageResolutionState = 'RESOLVED';
    this.source.learningLanguageResolutionMethod = 'ADMIN_REVIEW';
    this.source.learningLanguageReviewedBy = input.actorId;
    this.languageState = {
      courseId: input.courseId,
      languageReferenceId: input.languageReferenceId,
      state: 'RESOLVED',
      method: 'ADMIN_REVIEW',
    };
  }

  async listMajorMappingsForTaxonomyNode(taxonomyNodeId: string) {
    return this.majorMappings.filter((mapping) => mapping.taxonomyNodeId === taxonomyNodeId);
  }

  async upsertMajorProjection(input: any) {
    const existing = this.projections.find((projection) => projection.projectionKey === input.projectionKey);
    if (existing) return existing;
    const dto: CourseMajorProjectionDto = {
      id: `projection-${this.projections.length + 1}`,
      ...input,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projections.push(dto);
    return dto;
  }

  async listMajorProjections(courseId: string, state?: any) {
    return this.projections.filter((projection) =>
      projection.courseId === courseId && (!state || projection.projectionState === state)
    );
  }

  async reviewMajorProjection(input: any) {
    const projection = this.projections.find((item) => item.id === input.projectionId);
    if (!projection) throw new Error('not-found');
    projection.projectionState = input.decision;
    projection.reviewedBy = input.actorId;
    projection.reviewedAt = new Date();
    return projection;
  }

  async listPublishedRelatedCourses(): Promise<any> {
    return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  async listPublishedCoursesForMajor(): Promise<any> {
    return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  async getGeographySemantics(courseId: string) {
    if (courseId !== this.source.courseId) return null;
    return {
      courseId,
      providerId: this.source.provider.id,
      providerName: this.source.provider.canonicalName,
      providerHeadquartersCountryReferenceId: this.source.provider.headquartersCountryReferenceId,
      providerHeadquartersCountry: this.source.provider.headquartersCountry,
      studyCountryReferenceIds: [],
      semantics: 'PROVIDER_HEADQUARTERS_ONLY' as const,
    };
  }
}

describe('CourseRelationshipResolutionService', () => {
  it('creates only PROPOSED taxonomy links for exact unique matches', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);

    const result = await service.analyzeCourse('course-1');

    expect(result.taxonomy.proposed).toBe(1);
    expect(repository.links).toHaveLength(1);
    expect(repository.links[0].taxonomyNodeId).toBe('tax-cyber');
    expect(repository.links[0].reviewState).toBe('PROPOSED');
  });

  it('keeps ambiguous taxonomy terms reviewable and creates no link', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);

    await service.analyzeCourse('course-1');

    const ambiguous = repository.resolutions.find((item) => item.normalizedTerm === 'data science');
    expect(ambiguous?.status).toBe('AMBIGUOUS');
    expect(ambiguous?.candidateTaxonomyNodeIds).toEqual(['tax-ds-1', 'tax-ds-2']);
    expect(repository.links.some((link) => link.taxonomyNodeId === 'tax-ds-1')).toBe(false);
  });

  it('keeps unknown taxonomy terms unresolved rather than inventing a node', async () => {
    const repository = new FakeRelationshipRepository();
    repository.source.shortCourseTopicsRaw = 'Unknown Future Topic';
    const service = new CourseRelationshipResolutionService(repository);

    const result = await service.analyzeCourse('course-1');

    expect(result.taxonomy.unresolved).toBe(1);
    expect(repository.resolutions[0].status).toBe('UNRESOLVED');
    expect(repository.links).toHaveLength(0);
  });

  it('resolves language only on one exact ReferenceLanguage candidate', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);

    const result = await service.analyzeCourse('course-1');

    expect(result.language.state).toBe('RESOLVED');
    expect(result.language.referenceId).toBe('lang-en');
    expect(repository.languageState).toMatchObject({
      courseId: 'course-1',
      languageReferenceId: 'lang-en',
      state: 'RESOLVED',
    });
  });

  it('leaves unknown language unresolved and preserves raw source semantics', async () => {
    const repository = new FakeRelationshipRepository();
    repository.source.learningLanguageRaw = 'Unmapped Language';
    repository.languageCandidates = [];
    const service = new CourseRelationshipResolutionService(repository);

    const result = await service.analyzeCourse('course-1');

    expect(result.language.raw).toBe('Unmapped Language');
    expect(result.language.state).toBe('UNRESOLVED');
    expect(repository.languageState.languageReferenceId).toBeNull();
  });

  it('preserves an ADMIN_REVIEW language decision on subsequent analysis', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);

    await service.approveLanguageReference('course-1', 'lang-reviewed', 'admin-language');
    repository.languageCandidates = [];

    const result = await service.analyzeCourse('course-1');

    expect(result.language).toMatchObject({
      state: 'RESOLVED',
      referenceId: 'lang-reviewed',
      method: 'ADMIN_REVIEW',
    });
    expect(repository.source.learningLanguageReviewedBy).toBe('admin-language');
  });

  it('does not convert provider headquarters into course study-country', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);

    const result = await service.analyzeCourse('course-1');

    expect(result.geography.providerHeadquartersCountryReferenceId).toBe('country-us');
    expect(result.geography.studyCountryReferenceIds).toEqual([]);
    expect(result.geography.semantics).toBe('PROVIDER_HEADQUARTERS_ONLY');
  });

  it('projects majors only from APPROVED taxonomy links and keeps projections proposed', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);
    await service.analyzeCourse('course-1');

    expect(await service.projectMajors('course-1')).toEqual([]);

    await service.approveTaxonomyLink(repository.links[0].id, 'admin-1');
    const projections = await service.projectMajors('course-1');

    expect(projections).toHaveLength(1);
    expect(projections[0]).toMatchObject({
      majorId: 'major-1',
      sourceType: 'TAXONOMY_MAPPING',
      projectionState: 'PROPOSED',
    });
  });

  it('requires a separate review action before a CourseMajorProjection becomes approved', async () => {
    const repository = new FakeRelationshipRepository();
    const service = new CourseRelationshipResolutionService(repository);
    await service.analyzeCourse('course-1');
    await service.approveTaxonomyLink(repository.links[0].id, 'admin-1');
    const [projection] = await service.projectMajors('course-1');

    expect(projection.projectionState).toBe('PROPOSED');
    const approved = await service.approveMajorProjection(projection.id, 'admin-2');
    expect(approved.projectionState).toBe('APPROVED');
    expect(approved.reviewedBy).toBe('admin-2');
  });
});
