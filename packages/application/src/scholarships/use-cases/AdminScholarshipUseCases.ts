import { 
  IScholarshipRepository, 
  ScholarshipDto, 
  UpdateScholarshipDto,
  ScholarshipStatus,
  ScholarshipCompletenessState,
  ScholarshipFilters,
  PaginatedResult,
  ScholarshipCompletenessClassifier
} from '@manaratak/domain';

export class AdminScholarshipUseCases {
  constructor(private readonly repository: IScholarshipRepository) {}

  public async listScholarships(filters: ScholarshipFilters): Promise<PaginatedResult<ScholarshipDto>> {
    return this.repository.list(filters);
  }

  public async getScholarship(id: string): Promise<ScholarshipDto> {
    const scholarship = await this.repository.findById(id);
    if (!scholarship) {
      throw new Error(`Scholarship with id ${id} not found`);
    }
    return scholarship;
  }

  public async createScholarship(input: {
    displayName: string;
    fundingCoverage: string;
    coverageDetails?: string;
    eligibleMajorsOrFields?: string | string[];
    degreeLevel: string;
    studyCountry?: string;
    applicationDeadline?: Date | null;
    sponsorName?: string;
    applicationLink?: string;
    officialSourceUrl?: string;
    eligibilityCriteria?: string;
    requiredDocuments?: string[] | string;
    studyLanguage?: string;
    fundingAmount?: string;
    currency?: string;
    duration?: string;
  }): Promise<ScholarshipDto> {
    const displayName = (input.displayName || '').trim();
    if (!displayName) {
      throw new Error('Scholarship name is required.');
    }
    if (!input.fundingCoverage || !input.fundingCoverage.trim()) {
      throw new Error('Funding coverage is required.');
    }
    if (!input.degreeLevel || !input.degreeLevel.trim()) {
      throw new Error('Degree level is required.');
    }
    if ((!input.applicationLink || !input.applicationLink.trim()) && (!input.officialSourceUrl || !input.officialSourceUrl.trim())) {
      throw new Error('Either application link or official source URL is required.');
    }

    const payloadForClassification = {
      scholarshipName: displayName,
      fundingCoverage: input.fundingCoverage,
      coverageDetails: input.coverageDetails,
      eligibleMajorsOrFields: input.eligibleMajorsOrFields,
      degreeLevel: input.degreeLevel,
      applicationLink: input.applicationLink,
      officialSourceUrl: input.officialSourceUrl,
      studyCountry: input.studyCountry,
      description: input.coverageDetails || input.eligibilityCriteria,
    };

    const classification = ScholarshipCompletenessClassifier.classify(payloadForClassification);

    const publicId = `sch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `scholarship-${Date.now()}`;
    const canonicalName = displayName;
    const canonicalDedupKey = `${displayName}|${input.sponsorName || 'UNKNOWN'}`.toLowerCase();

    const initialStatus = classification.state === ScholarshipCompletenessState.COMPLETE
      ? ScholarshipStatus.READY_TO_REVIEW
      : ScholarshipStatus.IMPORTED;

    const scholarshipData = {
      publicId,
      slug,
      canonicalName,
      canonicalDedupKey,
      displayName,
      providerName: input.sponsorName || 'Admin Entry',
      sponsorName: input.sponsorName,
      fundingCoverage: input.fundingCoverage,
      coverageDetails: input.coverageDetails || '',
      eligibleMajorsOrFields: input.eligibleMajorsOrFields || [],
      degreeLevel: input.degreeLevel,
      studyCountry: input.studyCountry || '',
      applicationDeadline: input.applicationDeadline || null,
      applicationLink: input.applicationLink || '',
      officialSourceUrl: input.officialSourceUrl || '',
      eligibilityCriteria: input.eligibilityCriteria || '',
      requiredDocuments: Array.isArray(input.requiredDocuments) ? input.requiredDocuments.join(', ') : (input.requiredDocuments || ''),
      studyLanguage: input.studyLanguage || '',
      fundingAmount: input.fundingAmount || '',
      currency: input.currency || '',
      duration: input.duration || '',
      status: initialStatus,
      completenessStatus: classification.state,
    };

    return this.repository.create(scholarshipData);
  }

  public async updateScholarship(id: string, updates: UpdateScholarshipDto): Promise<ScholarshipDto> {
    const existing = await this.getScholarship(id);
    
    // Create a mock payload to run through classifier
    const payloadForClassification: any = {
      scholarshipName: updates.displayName ?? existing.displayName,
      fundingCoverage: updates.fundingCoverage ?? existing.fundingCoverage,
      coverageDetails: updates.coverageDetails ?? existing.coverageDetails,
      eligibleMajorsOrFields: updates.eligibleMajorsOrFields ?? existing.eligibleMajorsOrFields,
      degreeLevel: updates.degreeLevel ?? existing.degreeLevel,
      applicationLink: updates.applicationLink !== undefined ? updates.applicationLink : existing.applicationLink,
      officialSourceUrl: updates.officialSourceUrl !== undefined ? updates.officialSourceUrl : existing.officialSourceUrl,
      officialWebsite: updates.officialSourceUrl !== undefined ? updates.officialSourceUrl : existing.officialSourceUrl,
      studyCountry: updates.studyCountry !== undefined ? updates.studyCountry : existing.studyCountry,
      description: updates.coverageDetails || updates.eligibilityCriteria || existing.coverageDetails || existing.eligibilityCriteria,
    };
    
    const classification = ScholarshipCompletenessClassifier.classify(payloadForClassification);
    
    const dataToUpdate: UpdateScholarshipDto = {
      ...updates,
      completenessStatus: classification.state
    };
    
    return this.repository.update(id, dataToUpdate);
  }

  public async markReadyToReview(id: string): Promise<void> {
    const existing = await this.getScholarship(id);
    if (existing.completenessStatus === ScholarshipCompletenessState.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE scholarship as READY_TO_REVIEW');
    }
    if (existing.status !== ScholarshipStatus.READY_TO_REVIEW) {
      await this.repository.updateStatus(id, ScholarshipStatus.READY_TO_REVIEW);
    }
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const existing = await this.getScholarship(id);
    if (existing.completenessStatus !== ScholarshipCompletenessState.COMPLETE) {
      throw new Error('Only COMPLETE scholarships can be marked as READY_TO_PUBLISH');
    }
    await this.repository.updateStatus(id, ScholarshipStatus.READY_TO_PUBLISH);
  }

  public async publish(id: string): Promise<void> {
    const existing = await this.getScholarship(id);
    if (existing.status !== ScholarshipStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH scholarships can be PUBLISHED');
    }
    await this.repository.updateStatus(id, ScholarshipStatus.PUBLISHED);
  }

  public async unpublish(id: string): Promise<void> {
    const existing = await this.getScholarship(id);
    if (existing.status !== ScholarshipStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a scholarship that is not PUBLISHED');
    }
    await this.repository.updateStatus(id, ScholarshipStatus.READY_TO_REVIEW);
  }

  public async reject(id: string): Promise<void> {
    const existing = await this.getScholarship(id);
    if (existing.status === ScholarshipStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED scholarship. Unpublish first.');
    }
    await this.repository.updateStatus(id, ScholarshipStatus.REJECTED);
  }

  public async archive(id: string): Promise<void> {
    await this.repository.updateStatus(id, ScholarshipStatus.ARCHIVED);
  }
}
