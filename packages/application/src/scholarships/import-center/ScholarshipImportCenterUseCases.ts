import {
  ScholarshipCompletenessClassifier,
  ScholarshipCompletenessState,
  ScholarshipDeduplicationService,
  ScholarshipImportPayloadSchema,
  ScholarshipNamingService,
  type IScholarshipRepository,
  type ScholarshipDto,
} from '@manaratak/domain';
import type {
  IScholarshipImportCenterGateway,
  IScholarshipImportReviewDecisionPort,
  IScholarshipImportTransferPort,
  ScholarshipImportCenterBatchRecord,
  ScholarshipImportCenterCanonicalSummary,
  ScholarshipImportCenterDiff,
  ScholarshipImportCenterDiffField,
  ScholarshipImportCenterOverview,
  ScholarshipImportCenterQuery,
  ScholarshipImportCenterRecordView,
  ScholarshipImportCenterScanResult,
  ScholarshipImportCenterStoredRecord,
  ScholarshipImportOperationalClass,
  ScholarshipImportReviewDecisionRequest,
  ScholarshipImportTransferRequest,
  ScholarshipImportVerificationState,
} from './ScholarshipImportCenterContracts';

const OWNER_DOMAIN = 'SCHOLARSHIPS';
const PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const MAX_OVERVIEW_SCAN = 5000;
const OPERATIONAL_CLASSES = new Set<ScholarshipImportOperationalClass>([
  'REAL', 'TEST', 'DEMO', 'ARCHIVED', 'UNCLASSIFIED',
]);

export class ScholarshipImportCenterUseCases {
  constructor(
    private readonly gateway: IScholarshipImportCenterGateway,
    private readonly scholarshipRepository: IScholarshipRepository,
    private readonly reviewDecisionPort?: IScholarshipImportReviewDecisionPort,
    private readonly transferPort?: IScholarshipImportTransferPort,
  ) {}

  async getOverview(
    operationalClass: ScholarshipImportOperationalClass = 'REAL',
  ): Promise<ScholarshipImportCenterOverview> {
    const scan = await this.scan({ operationalClass }, MAX_OVERVIEW_SCAN);
    const records = scan.records;
    return {
      operationalClass,
      totalIncoming: records.length,
      newRecords: records.filter((record) => record.dedupe.state === 'NEW').length,
      duplicateRecords: records.filter((record) => record.dedupe.state === 'DUPLICATE').length,
      updateRecords: records.filter((record) => record.dedupe.state === 'UPDATE').length,
      incomplete: records.filter((record) =>
        record.completeness.state === ScholarshipCompletenessState.INCOMPLETE,
      ).length,
      conflicts: records.filter((record) =>
        record.dedupe.state === 'COLLISION_REVIEW' || record.canonical.ambiguousCount > 0,
      ).length,
      needsReview: records.filter((record) => record.reviewReasons.length > 0).length,
      readyToTransfer: records.filter((record) => record.readyToTransfer).length,
      failedProcessing: records.filter((record) => record.parseState === 'INVALID').length,
      transferred: records.filter((record) => record.transferred).length,
      countsExact: !scan.truncated,
      scanTruncated: scan.truncated,
      scannedRecords: scan.scanned,
      sourceTotal: scan.sourceTotal,
      capabilities: {
        reviewDecisionPersistence: this.reviewDecisionPort ? 'CONFIGURED' : 'NOT_CONFIGURED',
        atomicTransfer: this.transferPort ? 'CONFIGURED' : 'DEFERRED_TO_WP12_10',
        sourceRegistryRuntime: 'PENDING_RUNTIME',
      },
    };
  }

  async listSources(): Promise<{
    registryState: 'OBSERVED_FROM_PHASE6_BATCHES';
    sourceRegistryRuntime: 'PENDING_RUNTIME';
    observedBatchLimit: 100;
    completeRegistry: false;
    sources: Array<{
      sourceSystem: string;
      batches: number;
      totalRecords: number;
      lastBatchAt: Date | string | null;
    }>;
  }> {
    const batches = await this.gateway.listBatches({ dataType: OWNER_DOMAIN, limit: 100 });
    const grouped = new Map<string, { batches: number; totalRecords: number; lastBatchAt: Date | string | null }>();
    for (const batch of batches) {
      const current = grouped.get(batch.sourceSystem) ?? { batches: 0, totalRecords: 0, lastBatchAt: null };
      current.batches += 1;
      current.totalRecords += Number(batch.totalRecords ?? 0);
      if (!current.lastBatchAt || this.timestamp(batch.createdAt) > this.timestamp(current.lastBatchAt)) {
        current.lastBatchAt = batch.createdAt ?? null;
      }
      grouped.set(batch.sourceSystem, current);
    }
    return {
      registryState: 'OBSERVED_FROM_PHASE6_BATCHES',
      sourceRegistryRuntime: 'PENDING_RUNTIME',
      observedBatchLimit: 100,
      completeRegistry: false,
      sources: [...grouped.entries()].map(([sourceSystem, value]) => ({ sourceSystem, ...value })),
    };
  }

  async listRecords(query: ScholarshipImportCenterQuery = {}): Promise<{
    data: ScholarshipImportCenterRecordView[];
    sourceTotal: number;
    filteredTotal: number;
    page: number;
    pageSize: number;
    countsExact: boolean;
    scanTruncated: boolean;
    scannedRecords: number;
  }> {
    const page = this.bound(query.page, 1, 1, Number.MAX_SAFE_INTEGER);
    const pageSize = this.bound(query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);

    if (query.operationalClass) {
      const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
      const start = (page - 1) * pageSize;
      return {
        data: scan.records.slice(start, start + pageSize),
        sourceTotal: scan.sourceTotal,
        filteredTotal: scan.records.length,
        page,
        pageSize,
        countsExact: !scan.truncated,
        scanTruncated: scan.truncated,
        scannedRecords: scan.scanned,
      };
    }

    const result = await this.gateway.listRecords({
      batchId: query.batchId,
      status: query.status,
      dataType: OWNER_DOMAIN,
      page,
      pageSize,
    });
    const analyzed = await Promise.all(result.data.map((record) => this.analyzeWithBatch(record)));
    return {
      data: analyzed,
      sourceTotal: result.total,
      filteredTotal: result.total,
      page: result.page,
      pageSize: result.pageSize,
      countsExact: true,
      scanTruncated: false,
      scannedRecords: analyzed.length,
    };
  }

  async getRecord(recordId: string): Promise<ScholarshipImportCenterRecordView> {
    const record = await this.gateway.getRecordById(recordId);
    if (!record) throw new Error('SCHOLARSHIP_IMPORT_RECORD_NOT_FOUND');
    const batch = record.batch ?? await this.gateway.getBatchById(record.batchId);
    this.assertScholarshipBatch(batch);
    return this.analyze(record, batch!);
  }

  async getDiff(recordId: string): Promise<ScholarshipImportCenterDiff> {
    const view = await this.getRecord(recordId);
    const existing = view.dedupe.duplicateKey
      ? await this.scholarshipRepository.findByDedupKey(view.dedupe.duplicateKey)
      : null;
    const incoming = this.incomingProjection(view);
    const current = existing ? this.currentProjection(existing) : {};
    const fields = this.diffFields(current, incoming);
    return {
      recordId,
      duplicateKey: view.dedupe.duplicateKey,
      existingScholarshipId: existing?.id ?? null,
      fields,
      mutationPerformed: false,
    };
  }

  async listScreening(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, scan.records);
  }

  async listDuplicatesAndUpdates(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, scan.records.filter((record) =>
      record.dedupe.state === 'DUPLICATE' ||
      record.dedupe.state === 'UPDATE' ||
      record.dedupe.state === 'COLLISION_REVIEW',
    ));
  }

  async listMissingData(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, scan.records.filter((record) => record.completeness.missingFields.length > 0));
  }

  async listVerification(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, scan.records);
  }

  async getMergeProposal(recordId: string) {
    const record = await this.getRecord(recordId);
    const diff = await this.getDiff(recordId);
    const suggestedActions = record.dedupe.state === 'COLLISION_REVIEW'
      ? ['KEEP_CURRENT', 'SPLIT'] as const
      : record.dedupe.state === 'DUPLICATE' || record.dedupe.state === 'UPDATE'
        ? ['MERGE', 'KEEP_CURRENT', 'SPLIT'] as const
        : [] as const;
    return {
      recordId,
      duplicateKey: record.dedupe.duplicateKey,
      duplicateState: record.dedupe.state,
      requiresReview: record.reviewReasons.length > 0 || record.dedupe.requiresReview,
      suggestedActions,
      diff,
      automaticMergePerformed: false as const,
    };
  }

  async listReviewQueue(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, scan.records.filter((record) => record.reviewReasons.length > 0 && !record.transferred));
  }

  async listReadyToTransfer(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, scan.records.filter((record) => record.readyToTransfer && !record.transferred));
  }

  async listHistory(query: ScholarshipImportCenterQuery = {}): Promise<ScholarshipImportCenterScanResult> {
    const scan = await this.scan(query, MAX_OVERVIEW_SCAN);
    return this.scanResult(scan, [...scan.records].sort(
      (left, right) => this.timestamp(right.updatedAt) - this.timestamp(left.updatedAt),
    ));
  }

  async recordDecision(input: ScholarshipImportReviewDecisionRequest) {
    if (!this.reviewDecisionPort) {
      throw new Error('SCHOLARSHIP_IMPORT_REVIEW_DECISION_PORT_NOT_CONFIGURED');
    }
    await this.getRecord(input.recordId);
    return this.reviewDecisionPort.recordDecision(input);
  }

  async transfer(input: ScholarshipImportTransferRequest) {
    if (!this.transferPort) {
      throw new Error('SCHOLARSHIP_IMPORT_TRANSFER_DEFERRED_TO_WP12_10');
    }
    const record = await this.getRecord(input.recordId);
    if (!record.readyToTransfer) {
      throw new Error('SCHOLARSHIP_IMPORT_RECORD_NOT_READY_TO_TRANSFER');
    }
    return this.transferPort.transfer(input);
  }

  private async scan(query: ScholarshipImportCenterQuery, maxRecords: number) {
    const records: ScholarshipImportCenterRecordView[] = [];
    let page = 1;
    let sourceTotal = 0;
    let scanned = 0;
    let truncated = false;
    while (scanned < maxRecords) {
      const response = await this.gateway.listRecords({
        batchId: query.batchId,
        status: query.status,
        dataType: OWNER_DOMAIN,
        page,
        pageSize: PAGE_SIZE,
      });
      sourceTotal = response.total;
      if (response.data.length === 0) break;
      const views = await Promise.all(response.data.map((record) => this.analyzeWithBatch(record)));
      const remaining = Math.max(0, maxRecords - scanned);
      const boundedViews = views.slice(0, remaining);
      scanned += boundedViews.length;
      for (const view of boundedViews) {
        if (!query.operationalClass || view.operationalClass === query.operationalClass) records.push(view);
      }
      if (page * response.pageSize >= response.total) break;
      page += 1;
    }
    if (scanned < sourceTotal) truncated = true;
    return { records, sourceTotal, scanned, truncated };
  }

  private scanResult(
    scan: { sourceTotal: number; scanned: number; truncated: boolean },
    data: ScholarshipImportCenterRecordView[],
  ): ScholarshipImportCenterScanResult {
    return {
      data,
      countsExact: !scan.truncated,
      scanTruncated: scan.truncated,
      scannedRecords: scan.scanned,
      sourceTotal: scan.sourceTotal,
    };
  }

  private async analyzeWithBatch(record: ScholarshipImportCenterStoredRecord) {
    const batch = record.batch ?? await this.gateway.getBatchById(record.batchId);
    this.assertScholarshipBatch(batch);
    return this.analyze(record, batch!);
  }

  private async analyze(
    record: ScholarshipImportCenterStoredRecord,
    batch: ScholarshipImportCenterBatchRecord,
  ): Promise<ScholarshipImportCenterRecordView> {
    const operationalClass = this.operationalClass(record.rawPayload, batch.sourceSystem);
    const raw = this.object(record.rawPayload);
    const parsed = ScholarshipImportPayloadSchema.safeParse(raw);
    const base = {
      id: record.id,
      batchId: record.batchId,
      sourceSystem: batch.sourceSystem,
      sourceRowNumber: record.sourceRowNumber ?? this.numberValue(raw._sourceRowNumber),
      importStatus: record.status,
      operationalClass,
      rawPayload: record.rawPayload,
      transferred: Boolean(record.promotedEntityId),
      promotedEntityId: record.promotedEntityId ?? null,
      createdAt: record.createdAt ?? null,
      updatedAt: record.updatedAt ?? null,
    };

    if (!parsed.success) {
      return {
        ...base,
        parseState: 'INVALID',
        parseIssues: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'payload'}:${issue.code}`),
        rawSourceTitle: typeof raw.scholarshipName === 'string' ? raw.scholarshipName : null,
        cleanedScholarshipName: null,
        sourceAliases: [],
        completeness: {
          state: 'NOT_AVAILABLE',
          missingFields: [],
          identityMissingFields: [],
          coreMissingFields: [],
          optionalMissingFields: [],
          identityReady: false,
        },
        dedupe: { duplicateKey: null, state: 'NOT_CHECKED', matchIds: [], requiresReview: false },
        verification: { state: 'PENDING', sourceTraceable: this.sourceTraceable(raw, batch) },
        canonical: this.canonicalSummary(raw),
        reviewReasons: ['PARSE_INVALID'],
        readyToTransfer: false,
      };
    }

    const metadata = this.object(parsed.data.metadata);
    const aliases = Array.isArray(metadata.sourceAliases)
      ? metadata.sourceAliases.filter((item): item is string => typeof item === 'string')
      : [];
    const name = ScholarshipNamingService.clean(parsed.data.scholarshipName, aliases);
    const providerCanonicalPublicId = this.stringValue(metadata.providerCanonicalPublicId);
    const sourceTraceable = this.sourceTraceable(parsed.data, batch);
    const completeness = ScholarshipCompletenessClassifier.classify({
      ...parsed.data,
      cleanedScholarshipName: name.cleanedScholarshipName,
      providerCanonicalPublicId,
      sourceTraceable,
      extractedFundingTypeCode: name.extracted.fundingTypeCode,
      extractedDegreeLevels: name.extracted.degreeLevelLabels,
    });
    const incomingSourceImportRecordId = record.id;
    const dedupeInput = {
      cleanedScholarshipName: name.cleanedScholarshipName,
      providerName: parsed.data.providerName ?? parsed.data.sponsorName,
      providerCanonicalPublicId,
      year: this.stringValue(metadata.academicYear) ?? name.detectedYear,
      incomingSourceImportRecordId,
    };
    const key = ScholarshipDeduplicationService.buildKey(dedupeInput);
    const existing = completeness.identityReady
      ? await this.scholarshipRepository.findByDedupKey(key.duplicateKey)
      : null;
    const matches = existing ? [{
      id: existing.id,
      publicId: existing.publicId,
      displayName: existing.displayName,
      canonicalDedupKey: existing.canonicalDedupKey,
      sourceImportRecordId: existing.sourceImportRecordId ?? null,
    }] : [];
    const dedupe = completeness.identityReady
      ? ScholarshipDeduplicationService.assess(dedupeInput, matches)
      : ScholarshipDeduplicationService.assess(dedupeInput);
    const verification = {
      state: this.verificationState(raw),
      sourceTraceable,
    };
    const canonical = this.canonicalSummary(raw);
    const reviewReasons = this.reviewReasons(completeness, dedupe, verification, canonical);
    const readyToTransfer =
      completeness.state === ScholarshipCompletenessState.COMPLETE &&
      dedupe.state === 'NEW' &&
      verification.state === 'VERIFIED' &&
      canonical.state === 'CLEAR' &&
      reviewReasons.length === 0;

    return {
      ...base,
      parseState: 'VALID',
      parseIssues: [],
      rawSourceTitle: name.rawSourceTitle,
      cleanedScholarshipName: name.cleanedScholarshipName,
      sourceAliases: name.sourceAliases,
      completeness: {
        state: completeness.state,
        missingFields: completeness.missingFields,
        identityMissingFields: completeness.identityMissingFields,
        coreMissingFields: completeness.coreMissingFields,
        optionalMissingFields: completeness.optionalMissingFields,
        identityReady: completeness.identityReady,
      },
      dedupe: {
        duplicateKey: dedupe.duplicateKey,
        state: dedupe.state,
        matchIds: dedupe.matches.map((match) => match.id),
        requiresReview: dedupe.requiresReview,
      },
      verification,
      canonical,
      reviewReasons,
      readyToTransfer,
    };
  }

  private reviewReasons(
    completeness: ReturnType<typeof ScholarshipCompletenessClassifier.classify>,
    dedupe: ReturnType<typeof ScholarshipDeduplicationService.assess>,
    verification: { state: ScholarshipImportVerificationState; sourceTraceable: boolean },
    canonical: ScholarshipImportCenterCanonicalSummary,
  ): string[] {
    const reasons = new Set<string>();
    for (const field of completeness.identityMissingFields) reasons.add(`IDENTITY_MISSING:${field}`);
    for (const field of completeness.coreMissingFields) reasons.add(`CORE_MISSING:${field}`);
    if (dedupe.state === 'DUPLICATE' || dedupe.state === 'UPDATE' || dedupe.state === 'COLLISION_REVIEW') {
      reasons.add(`DEDUPE:${dedupe.state}`);
    }
    if (verification.state !== 'VERIFIED') reasons.add(`VERIFICATION:${verification.state}`);
    if (!verification.sourceTraceable) reasons.add('SOURCE_NOT_TRACEABLE');
    if (canonical.state === 'NOT_EXECUTED') reasons.add('CANONICAL:NOT_EXECUTED');
    if (canonical.unresolvedCount > 0) reasons.add('CANONICAL:UNRESOLVED');
    if (canonical.ambiguousCount > 0) reasons.add('CANONICAL:AMBIGUOUS');
    if (canonical.reviewRequiredCount > 0) reasons.add('CANONICAL:REVIEW_REQUIRED');
    return [...reasons];
  }

  private canonicalSummary(rawPayload: Record<string, unknown>): ScholarshipImportCenterCanonicalSummary {
    const metadata = this.object(rawPayload.metadata);
    const raw = Array.isArray(metadata.canonicalScreening)
      ? metadata.canonicalScreening
      : Array.isArray(rawPayload._canonicalScreening)
        ? rawPayload._canonicalScreening
        : null;
    if (!raw) {
      return { state: 'NOT_EXECUTED', unresolvedCount: 0, ambiguousCount: 0, reviewRequiredCount: 0 };
    }
    let unresolvedCount = 0;
    let ambiguousCount = 0;
    let reviewRequiredCount = 0;
    for (const item of raw) {
      const state = this.stringValue(this.object(item).state)?.toUpperCase();
      if (state === 'UNRESOLVED') unresolvedCount += 1;
      if (state === 'AMBIGUOUS') ambiguousCount += 1;
      if (state === 'REVIEW_REQUIRED') reviewRequiredCount += 1;
    }
    const state = unresolvedCount || ambiguousCount || reviewRequiredCount ? 'REVIEW_REQUIRED' : 'CLEAR';
    return { state, unresolvedCount, ambiguousCount, reviewRequiredCount };
  }

  private verificationState(rawPayload: Record<string, unknown>): ScholarshipImportVerificationState {
    const metadata = this.object(rawPayload.metadata);
    const candidate = (
      this.stringValue(metadata.verificationState) ?? this.stringValue(rawPayload._verificationState)
    )?.toUpperCase();
    return candidate === 'VERIFIED' || candidate === 'FAILED' || candidate === 'PENDING'
      ? candidate
      : 'PENDING';
  }

  private sourceTraceable(payload: Record<string, unknown>, batch: ScholarshipImportCenterBatchRecord): boolean {
    const candidates = [
      payload.officialSourceUrl,
      payload.sourceUrl,
      payload.officialWebsite,
      payload.applicationLink,
    ];
    return candidates.some((value) => typeof value === 'string' && value.trim().length > 0)
      || Boolean(batch.sourceSystem?.trim());
  }

  private operationalClass(rawPayload: unknown, sourceSystem: string): ScholarshipImportOperationalClass {
    const raw = this.object(rawPayload);
    const metadata = this.object(raw.metadata);
    const explicit = (
      this.stringValue(raw._operationalClass) ?? this.stringValue(metadata.operationalClass)
    )?.toUpperCase() as ScholarshipImportOperationalClass | undefined;
    if (explicit && OPERATIONAL_CLASSES.has(explicit)) return explicit;
    const source = sourceSystem.trim().toUpperCase();
    if (source.includes('DEMO')) return 'DEMO';
    if (source.includes('TEST') || source.includes('SANDBOX')) return 'TEST';
    if (source.includes('ARCHIVE')) return 'ARCHIVED';
    return source ? 'REAL' : 'UNCLASSIFIED';
  }

  private incomingProjection(view: ScholarshipImportCenterRecordView): Record<string, unknown> {
    const raw = this.object(view.rawPayload);
    const metadata = this.object(raw.metadata);
    return {
      displayName: view.cleanedScholarshipName,
      providerName: raw.providerName ?? raw.sponsorName,
      academicYear: metadata.academicYear ?? null,
      fundingTypeCode: metadata.fundingTypeCode ?? (raw.isFullyFunded === true ? 'FULLY_FUNDED' : null),
      studyCountry: raw.studyCountry ?? raw.targetCountries,
      degreeLevel: raw.degreeLevel ?? raw.studyLevels,
      eligibilityCriteria: raw.eligibilityCriteria,
      requiredDocuments: raw.requiredDocuments,
      applicationDeadline: raw.applicationDeadline,
      applicationUrl: raw.applicationLink,
      sourceUrl: raw.officialSourceUrl ?? raw.sourceUrl ?? raw.officialWebsite,
    };
  }

  private currentProjection(existing: ScholarshipDto): Record<string, unknown> {
    return {
      displayName: existing.displayName,
      providerName: existing.providerName,
      academicYear: existing.academicYear,
      fundingTypeCode: existing.fundingTypeCode,
      studyCountry: existing.studyCountry ?? existing.countrySourceLabel ?? existing.countryScope,
      degreeLevel: existing.degreeLevel ?? existing.degreeTargets?.map((target) => target.sourceLabel ?? target.degreeLevelId),
      eligibilityCriteria: existing.eligibilityCriteria,
      requiredDocuments: existing.requiredDocuments ?? existing.requiredDocumentItems?.map((item) => item.displayName),
      applicationDeadline: existing.applicationDeadline,
      applicationUrl: existing.applicationUrl ?? existing.applicationLink,
      sourceUrl: existing.officialSourceUrl ?? existing.sourceUrl ?? existing.officialWebsite,
    };
  }

  private diffFields(
    current: Record<string, unknown>,
    incoming: Record<string, unknown>,
  ): ScholarshipImportCenterDiffField[] {
    const fields = new Set([...Object.keys(current), ...Object.keys(incoming)]);
    return [...fields].map((field) => {
      const currentValue = current[field];
      const incomingValue = incoming[field];
      let state: ScholarshipImportCenterDiffField['state'];
      if (!this.meaningful(incomingValue) && this.meaningful(currentValue)) state = 'MISSING_IN_IMPORT';
      else if (!this.meaningful(currentValue) && this.meaningful(incomingValue)) state = 'ADDITION';
      else if (this.equal(currentValue, incomingValue)) state = 'NO_CHANGE';
      else state = 'CONFLICT';
      return { field, currentValue, incomingValue, state };
    });
  }

  private assertScholarshipBatch(batch: ScholarshipImportCenterBatchRecord | null): void {
    if (!batch || batch.dataType.trim().toUpperCase() !== OWNER_DOMAIN) {
      throw new Error('SCHOLARSHIP_IMPORT_RECORD_NOT_IN_SCHOLARSHIP_BATCH');
    }
  }

  private bound(value: unknown, fallback: number, min: number, max: number): number {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  }

  private object(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  }

  private stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private timestamp(value: Date | string | null | undefined): number {
    if (!value) return 0;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  private meaningful(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  private equal(left: unknown, right: unknown): boolean {
    const normalize = (value: unknown): string => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'string') return value.trim().toLowerCase();
      return JSON.stringify(value ?? null);
    };
    return normalize(left) === normalize(right);
  }
}
