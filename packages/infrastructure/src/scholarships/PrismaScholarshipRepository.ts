import { Prisma, PrismaClient } from '@prisma/client';
import {
  AtomicPersistenceContext,
  CreateScholarshipDto,
  IScholarshipRepository,
  ITransactionalScholarshipRepository,
  PublicScholarshipFilters,
  ScholarshipDto,
  ScholarshipFilters,
  ScholarshipPage,
  ScholarshipStatus,
  UpdateScholarshipDto,
} from '@manaratak/domain';

interface ScholarshipTransactionContext extends AtomicPersistenceContext {
  readonly transactionClient: Prisma.TransactionClient;
}

const LEGACY_COMPATIBILITY_KEYS = [
  'fundingCoverage',
  'coverageDetails',
  'eligibleMajorsOrFields',
  'degreeLevel',
  'studyCountry',
  'applicationLink',
  'sponsorName',
  'requiredDocuments',
  'eligibilityCriteria',
  'studyLanguage',
  'targetUniversities',
  'targetAcademicPrograms',
  'fundingAmount',
  'currency',
  'duration',
  'localizedNames',
  'metadata',
] as const;

type LegacyCompatibilityKey = (typeof LEGACY_COMPATIBILITY_KEYS)[number];

export class PrismaScholarshipRepository implements ITransactionalScholarshipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly normalizedInclude = {
    benefits: true,
    degreeTargets: true,
    majorTargets: true,
    eligibilityItems: true,
    requiredDocuments: true,
    sourceEvidence: true,
    universityLinks: true,
  } as const;

  withTransaction(context: AtomicPersistenceContext): IScholarshipRepository {
    const transactionClient = (context as Partial<ScholarshipTransactionContext>).transactionClient;
    if (!context.boundaryId || !transactionClient) {
      throw new Error('SCHOLARSHIP_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    }
    return new PrismaScholarshipRepository(transactionClient as unknown as PrismaClient);
  }

  async findById(id: string): Promise<ScholarshipDto | null> {
    const record = await this.prisma.scholarship.findUnique({
      where: { id },
      include: this.normalizedInclude,
    });
    return record ? this.mapToDto(record) : null;
  }

  async findBySlug(slug: string): Promise<ScholarshipDto | null> {
    const record = await this.prisma.scholarship.findUnique({
      where: { slug },
      include: this.normalizedInclude,
    });
    return record ? this.mapToDto(record) : null;
  }

  async findByDedupKey(key: string): Promise<ScholarshipDto | null> {
    const record = await this.prisma.scholarship.findUnique({
      where: { canonicalDedupKey: key },
      include: this.normalizedInclude,
    });
    return record ? this.mapToDto(record) : null;
  }

  async create(data: CreateScholarshipDto): Promise<ScholarshipDto> {
    const legacyCompatibility = this.buildLegacyCompatibility(data.optionalFields, data);
    const createData = {
      publicId: data.publicId,
      slug: data.slug,
      canonicalName: data.canonicalName,
      canonicalDedupKey: data.canonicalDedupKey,
      displayName: data.displayName,
      providerName: data.providerName,
      status: data.status,
      completenessStatus: data.completenessStatus,
      amountMinorUnits: data.amountMinorUnits,
      amountCurrencyCode: data.amountCurrencyCode,
      isFullyFunded: data.isFullyFunded,
      applicationDeadline: data.applicationDeadline,
      officialWebsite: data.officialWebsite,
      sourceUrl: data.sourceUrl,
      academicYear: data.academicYear,
      cycleName: data.cycleName,
      countryReferenceId: data.countryReferenceId,
      countrySourceLabel: data.countrySourceLabel,
      countryScope: data.countryScope,
      fundingTypeCode: data.fundingTypeCode,
      deadlineType: data.deadlineType,
      applicationMethod: data.applicationMethod,
      applicationUrl: data.applicationUrl ?? data.applicationLink,
      officialSourceUrl: data.officialSourceUrl,
      sourceImportRecordId: data.sourceImportRecordId,
      sourceLocale: data.sourceLocale,
      lastVerifiedAt: data.lastVerifiedAt,
      optionalFields: legacyCompatibility,
      benefits: this.toNestedCreate(data.benefits),
      degreeTargets: this.toNestedCreate(data.degreeTargets),
      majorTargets: this.toNestedCreate(data.majorTargets),
      eligibilityItems: this.toNestedCreate(data.eligibilityItems),
      requiredDocuments: this.toNestedCreate(data.requiredDocumentItems),
      sourceEvidence: this.toNestedCreate(data.sourceEvidence),
      universityLinks: this.toNestedCreate(data.universityLinks),
    } as unknown as Prisma.ScholarshipCreateInput;

    const record = await this.prisma.scholarship.create({
      data: createData,
      include: this.normalizedInclude,
    });

    return this.mapToDto(record);
  }

  async update(id: string, updates: UpdateScholarshipDto): Promise<ScholarshipDto> {
    const existing = await this.prisma.scholarship.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`SCHOLARSHIP_NOT_FOUND:${id}`);
    }

    const legacyCompatibility = this.buildLegacyCompatibility(
      this.asOptionalRecord(existing.optionalFields),
      updates,
    );
    const updateData = {
      displayName: updates.displayName,
      providerName: updates.providerName,
      status: updates.status,
      completenessStatus: updates.completenessStatus,
      amountMinorUnits: updates.amountMinorUnits,
      amountCurrencyCode: updates.amountCurrencyCode,
      isFullyFunded: updates.isFullyFunded,
      applicationDeadline: updates.applicationDeadline,
      officialWebsite: updates.officialWebsite,
      sourceUrl: updates.sourceUrl,
      academicYear: updates.academicYear,
      cycleName: updates.cycleName,
      countryReferenceId: updates.countryReferenceId,
      countrySourceLabel: updates.countrySourceLabel,
      countryScope: updates.countryScope,
      fundingTypeCode: updates.fundingTypeCode,
      deadlineType: updates.deadlineType,
      applicationMethod: updates.applicationMethod,
      applicationUrl: updates.applicationUrl ?? updates.applicationLink,
      officialSourceUrl: updates.officialSourceUrl,
      sourceImportRecordId: updates.sourceImportRecordId,
      sourceLocale: updates.sourceLocale,
      lastVerifiedAt: updates.lastVerifiedAt,
      optionalFields: legacyCompatibility,
      benefits: this.toNestedReplace(updates.benefits),
      degreeTargets: this.toNestedReplace(updates.degreeTargets),
      majorTargets: this.toNestedReplace(updates.majorTargets),
      eligibilityItems: this.toNestedReplace(updates.eligibilityItems),
      requiredDocuments: this.toNestedReplace(updates.requiredDocumentItems),
      sourceEvidence: this.toNestedReplace(updates.sourceEvidence),
      universityLinks: this.toNestedReplace(updates.universityLinks),
    } as unknown as Prisma.ScholarshipUpdateInput;

    const record = await this.prisma.scholarship.update({
      where: { id },
      data: updateData,
      include: this.normalizedInclude,
    });

    return this.mapToDto(record);
  }

  async updateStatus(id: string, status: ScholarshipStatus): Promise<void> {
    await this.prisma.scholarship.update({
      where: { id },
      data: { status },
    });
  }

  async list(filters: ScholarshipFilters): Promise<ScholarshipPage<ScholarshipDto>> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    const where: Prisma.ScholarshipWhereInput = {};
    if (filters.status) where.status = filters.status;
    // WP12-3 owns exact canonical reference resolution; preserve the current text filter until then.
    if (filters.country) {
      where.optionalFields = { path: ['studyCountry'], equals: filters.country };
    }

    const [data, total] = await Promise.all([
      this.prisma.scholarship.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: this.normalizedInclude,
      }),
      this.prisma.scholarship.count({ where }),
    ]);

    return {
      data: data.map((record) => this.mapToDto(record)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async listPublished(filters: PublicScholarshipFilters): Promise<ScholarshipPage<ScholarshipDto>> {
    return this.list({ ...filters, status: ScholarshipStatus.PUBLISHED });
  }

  private mapToDto(record: unknown): ScholarshipDto {
    const raw = record as Record<string, unknown>;
    const legacy = this.asOptionalRecord(raw.optionalFields);
    const compatibility = this.pickLegacyCompatibility(legacy);
    const requiredDocuments = Array.isArray(raw.requiredDocuments) ? raw.requiredDocuments : [];

    return {
      ...raw,
      ...compatibility,
      optionalFields: legacy,
      benefits: Array.isArray(raw.benefits) ? raw.benefits : [],
      degreeTargets: Array.isArray(raw.degreeTargets) ? raw.degreeTargets : [],
      majorTargets: Array.isArray(raw.majorTargets) ? raw.majorTargets : [],
      eligibilityItems: Array.isArray(raw.eligibilityItems) ? raw.eligibilityItems : [],
      requiredDocumentItems: requiredDocuments,
      sourceEvidence: Array.isArray(raw.sourceEvidence) ? raw.sourceEvidence : [],
      universityLinks: Array.isArray(raw.universityLinks) ? raw.universityLinks : [],
    } as unknown as ScholarshipDto;
  }

  private buildLegacyCompatibility(
    currentOptionalFields: Record<string, unknown> | undefined,
    source: Partial<CreateScholarshipDto>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...(currentOptionalFields ?? {}) };
    for (const key of LEGACY_COMPATIBILITY_KEYS) {
      const value = source[key];
      if (value !== undefined) result[key] = value;
    }
    return result;
  }

  private pickLegacyCompatibility(
    value: Record<string, unknown>,
  ): Partial<Pick<CreateScholarshipDto, LegacyCompatibilityKey>> {
    const result: Partial<Record<LegacyCompatibilityKey, unknown>> = {};
    for (const key of LEGACY_COMPATIBILITY_KEYS) {
      if (value[key] !== undefined) result[key] = value[key];
    }
    return result as Partial<Pick<CreateScholarshipDto, LegacyCompatibilityKey>>;
  }

  private asOptionalRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private toNestedCreate<T extends object>(
    items: readonly T[] | undefined,
  ): { create: Record<string, unknown>[] } | undefined {
    if (!items?.length) return undefined;
    return { create: items.map((item) => this.stripPersistenceFields(item)) };
  }

  private toNestedReplace<T extends object>(
    items: readonly T[] | undefined,
  ): { deleteMany: object; create: Record<string, unknown>[] } | undefined {
    if (items === undefined) return undefined;
    return {
      deleteMany: {},
      create: items.map((item) => this.stripPersistenceFields(item)),
    };
  }

  private stripPersistenceFields<T extends object>(item: T): Record<string, unknown> {
    const copy = { ...(item as Record<string, unknown>) };
    delete copy.id;
    delete copy.scholarshipId;
    delete copy.createdAt;
    delete copy.updatedAt;
    return copy;
  }
}
