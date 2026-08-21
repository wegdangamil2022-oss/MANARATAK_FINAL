import { describe, expect, it, vi } from 'vitest';
import {
  ScholarshipCompletenessState,
  ScholarshipDeduplicationService,
  ScholarshipNamingService,
  ScholarshipStatus,
  type AtomicPersistenceContext,
  type CreateScholarshipDto,
  type IScholarshipRepository,
  type ScholarshipDto,
  type UpdateScholarshipDto,
} from '@manaratak/domain';
import { AtomicDomainMutationCoordinator } from '../../src/event-foundation/use-cases/AtomicDomainMutationCoordinator';
import {
  ScholarshipImportAtomicTransferUseCase,
  type IScholarshipImportAtomicGateway,
  type ScholarshipImportCenterBatchRecord,
  type ScholarshipImportCenterStoredRecord,
} from '../../src/scholarships/import-center';

function payload() {
  return {
    scholarshipName: 'Qatar University Scholarship 2027',
    providerName: 'Qatar University',
    fundingCoverage: 'Fully funded',
    coverageDetails: 'Tuition and stipend',
    studyCountry: 'Qatar',
    degreeLevel: 'Doctorate',
    eligibilityCriteria: 'Academic merit',
    requiredDocuments: ['Transcript'],
    applicationDeadline: '2027-01-01',
    officialSourceUrl: 'https://example.edu/scholarship',
    metadata: {
      verificationState: 'VERIFIED',
      academicYear: '2027',
      canonicalScreening: [],
    },
  };
}

function setup(existing: ScholarshipDto | null = null) {
  const batch: ScholarshipImportCenterBatchRecord = {
    id: 'batch-1',
    sourceSystem: 'OFFICIAL_SITE',
    dataType: 'SCHOLARSHIPS',
    batchStatus: 'COMPLETED',
    totalRecords: 1,
  };
  let record: ScholarshipImportCenterStoredRecord = {
    id: 'rec-1',
    batchId: batch.id,
    status: 'COMPLETE',
    rawPayload: payload(),
    processingNotes: null,
    promotedEntityId: null,
    sourceRowNumber: 7,
    createdAt: new Date('2026-08-20T00:00:00Z'),
    updatedAt: new Date('2026-08-20T00:00:00Z'),
  };

  const importGateway: IScholarshipImportAtomicGateway = {
    async listBatches() { return [batch]; },
    async listRecords() { return { data: [record], total: 1, page: 1, pageSize: 50 }; },
    async getRecordById(id) { return id === record.id ? record : null; },
    async getBatchById(id) { return id === batch.id ? batch : null; },
    async updateRecord(id, updates) {
      if (id !== record.id) throw new Error('record missing');
      record = { ...record, ...updates, updatedAt: new Date() };
      return record;
    },
    withTransaction() { return this; },
  };

  let current = existing;
  const create = vi.fn(async (data: CreateScholarshipDto) => {
    current = {
      ...data,
      id: 'sch-new',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ScholarshipDto;
    return current;
  });
  const update = vi.fn(async (id: string, updates: UpdateScholarshipDto) => {
    if (!current || current.id !== id) throw new Error('scholarship missing');
    current = { ...current, ...updates, id: current.id, publicId: current.publicId } as ScholarshipDto;
    return current;
  });
  const repository: IScholarshipRepository & { withTransaction(context: AtomicPersistenceContext): IScholarshipRepository } = {
    create,
    update,
    async findByDedupKey() { return current; },
    async findById(id) { return current?.id === id ? current : null; },
    async findBySlug() { return null; },
    async updateStatus() {},
    async list() { return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }; },
    async listPublished() { return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }; },
    withTransaction() { return this; },
  };
  const atomicMutations = {
    execute: vi.fn(async (_definition: unknown, mutation: (context: AtomicPersistenceContext) => Promise<unknown>) =>
      mutation({ boundaryId: 'tx-1', transactionClient: {} } as AtomicPersistenceContext)),
  } as unknown as AtomicDomainMutationCoordinator;

  const service = new ScholarshipImportAtomicTransferUseCase(importGateway, repository, atomicMutations);
  return {
    service,
    importGateway,
    repository,
    atomicMutations,
    create,
    update,
    getRecord: () => record,
    getScholarship: () => current,
  };
}

function existingScholarship(status: ScholarshipStatus = ScholarshipStatus.IMPORTED): ScholarshipDto {
  const source = payload();
  const cleaned = ScholarshipNamingService.clean(source.scholarshipName);
  const duplicateKey = ScholarshipDeduplicationService.buildKey({
    cleanedScholarshipName: cleaned.cleanedScholarshipName,
    providerName: source.providerName,
    providerCanonicalPublicId: null,
    year: '2027',
    incomingSourceImportRecordId: 'old-record',
  }).duplicateKey;
  return {
    id: 'sch-existing',
    publicId: 'SCH-PUBLIC-1',
    slug: 'qatar-university-scholarship-2027',
    canonicalName: cleaned.cleanedScholarshipName,
    canonicalDedupKey: duplicateKey,
    displayName: 'Old display name',
    status,
    completenessStatus: ScholarshipCompletenessState.COMPLETE,
    providerName: source.providerName,
    sourceImportRecordId: 'old-record',
    sourceEvidence: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ScholarshipDto;
}

describe('WP12-10 ScholarshipImportAtomicTransferUseCase', () => {
  it('creates a genuinely new canonical Scholarship as non-published and links the ImportRecord', async () => {
    const env = setup();
    const result = await env.service.transfer({ recordId: 'rec-1', actorId: 'admin-1' });

    expect(result.publicationStatus).toBe('DRAFT');
    expect(result.scholarshipId).toBe('sch-new');
    expect(env.create).toHaveBeenCalledTimes(1);
    const createInput = env.create.mock.calls[0][0];
    expect(createInput.status).toBe(ScholarshipStatus.IMPORTED);
    expect(createInput.sourceImportRecordId).toBe('rec-1');
    expect(createInput.sourceEvidence?.some((item) => item.importRecordId === 'rec-1')).toBe(true);
    expect(env.getRecord().promotedEntityId).toBe('sch-new');
    expect((env.atomicMutations.execute as any).mock.calls[0][0].action).toBe('SCHOLARSHIP_IMPORT_TRANSFERRED');
  });

  it('requires a durable MERGE decision and preserves existing id/publicId', async () => {
    const existing = existingScholarship();
    const env = setup(existing);

    await expect(env.service.transfer({ recordId: 'rec-1', actorId: 'admin-1' }))
      .rejects.toThrow('SCHOLARSHIP_IMPORT_REVIEW_DECISION_REQUIRED');

    const decision = await env.service.recordDecision({
      recordId: 'rec-1',
      action: 'MERGE',
      actorId: 'admin-1',
      reason: 'Reviewed incoming source and approved the update.',
    });
    expect(decision.action).toBe('MERGE');
    expect(env.getRecord().processingNotes).toContain('SCHOLARSHIP_IMPORT_REVIEW_DECISION_V1');

    const result = await env.service.transfer({ recordId: 'rec-1', actorId: 'admin-1' });
    expect(result.scholarshipId).toBe(existing.id);
    expect(env.update).toHaveBeenCalledTimes(1);
    expect(env.getScholarship()?.id).toBe(existing.id);
    expect(env.getScholarship()?.publicId).toBe(existing.publicId);
    expect(env.getScholarship()?.status).toBe(ScholarshipStatus.IMPORTED);
  });

  it('refuses to mutate a published or ready-to-publish target through import transfer', async () => {
    const env = setup(existingScholarship(ScholarshipStatus.PUBLISHED));
    await env.service.recordDecision({ recordId: 'rec-1', action: 'MERGE', actorId: 'admin-1' });

    await expect(env.service.transfer({ recordId: 'rec-1', actorId: 'admin-1' }))
      .rejects.toThrow('SCHOLARSHIP_IMPORT_TARGET_PUBLICATION_LOCKED');
    expect(env.update).not.toHaveBeenCalled();
  });
});
