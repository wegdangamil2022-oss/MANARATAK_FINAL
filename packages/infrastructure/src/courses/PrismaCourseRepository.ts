import { Prisma, PrismaClient } from '@prisma/client';
import {
  AtomicPersistenceContext,
  CourseAccessType,
  CourseDto,
  CourseFilters,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  CreateCourseDto,
  ICourseRepository,
  ITransactionalCourseRepository,
  PaginatedCourseResult,
  PublicCourseFilters,
  UpdateCourseDto,
} from '@manaratak/domain';

interface CourseTransactionContext extends AtomicPersistenceContext {
  readonly transactionClient: Prisma.TransactionClient;
}

interface CourseRecord {
  id: string;
  publicId: string;
  slug: string;
  canonicalName: string;
  canonicalDedupKey: string;
  displayName: string;
  accessType: string;
  originType: string;
  directCourseUrl: string;
  status: string;
  completenessStatus: string;
  platformName: string | null;
  providerName: string | null;
  learningLanguage: string | null;
  studyDuration: string | null;
  certificateAvailable: boolean | null;
  category: string | null;
  difficultyLevel: string | null;
  sourceUrl: string | null;
  officialSourceUrl: string | null;
  thumbnailAssetId: string | null;
  sourceImportRecordId: string | null;
  optionalFields: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

function parseAccessType(value: string): CourseAccessType {
  switch (value) {
    case CourseAccessType.FREE_STUDY:
    case CourseAccessType.FREE_CERTIFICATE:
    case CourseAccessType.FREE_STUDY_AND_CERTIFICATE:
    case CourseAccessType.PAID:
      return value as CourseAccessType;
    default:
      throw new Error(`COURSE_ACCESS_TYPE_INVALID:${value}`);
  }
}

function parseOriginType(value: string): CourseOriginType {
  switch (value) {
    case CourseOriginType.EXTERNAL_LINKED_COURSE:
    case CourseOriginType.NATIVE_MANARATAK_COURSE:
    case CourseOriginType.PAID_COURSE:
      return value as CourseOriginType;
    default:
      throw new Error(`COURSE_ORIGIN_TYPE_INVALID:${value}`);
  }
}

function parseStatus(value: string): CourseStatus {
  switch (value) {
    case CourseStatus.DRAFT:
    case CourseStatus.IMPORTED:
    case CourseStatus.INCOMPLETE:
    case CourseStatus.READY_TO_REVIEW:
    case CourseStatus.READY_TO_PUBLISH:
    case CourseStatus.PUBLISHED:
    case CourseStatus.REJECTED:
    case CourseStatus.ARCHIVED:
      return value as CourseStatus;
    default:
      throw new Error(`COURSE_STATUS_INVALID:${value}`);
  }
}

function parseCompleteness(value: string): CourseImportCompletenessState {
  switch (value) {
    case CourseImportCompletenessState.IMPORTED:
    case CourseImportCompletenessState.INCOMPLETE:
    case CourseImportCompletenessState.COMPLETE:
    case CourseImportCompletenessState.NEEDS_REVIEW:
    case CourseImportCompletenessState.REJECTED:
      return value as CourseImportCompletenessState;
    default:
      throw new Error(`COURSE_COMPLETENESS_STATUS_INVALID:${value}`);
  }
}

const RESERVED_OPTIONAL_FIELD_KEYS = new Set([
  'id',
  'publicId',
  'slug',
  'canonicalName',
  'canonicalDedupKey',
  'displayName',
  'accessType',
  'originType',
  'directCourseUrl',
  'status',
  'completenessStatus',
  'platformName',
  'providerName',
  'learningLanguage',
  'studyDuration',
  'certificateAvailable',
  'category',
  'difficultyLevel',
  'sourceUrl',
  'officialSourceUrl',
  'thumbnailAssetId',
  'sourceImportRecordId',
  'createdAt',
  'updatedAt',
  'optionalFields',
]);

function sanitizeOptionalFields(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result = Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([key, item]) => !RESERVED_OPTIONAL_FIELD_KEYS.has(key) && item !== undefined,
    ),
  );
  return Object.keys(result).length > 0 ? result : {};
}

function asInputJson(value: Record<string, unknown> | undefined): Prisma.InputJsonObject | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}

export class PrismaCourseRepository implements ITransactionalCourseRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public withTransaction(context: AtomicPersistenceContext): ICourseRepository {
    const transactionClient = (context as Partial<CourseTransactionContext>).transactionClient;
    if (!context.boundaryId || !transactionClient) {
      throw new Error('COURSE_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    }
    return new PrismaCourseRepository(transactionClient as unknown as PrismaClient);
  }

  public async create(data: CreateCourseDto): Promise<CourseDto> {
    const record = await this.prisma.course.create({
      data: {
        publicId: data.publicId,
        slug: data.slug,
        canonicalName: data.canonicalName,
        canonicalDedupKey: data.canonicalDedupKey,
        displayName: data.displayName,
        accessType: data.accessType,
        originType: data.originType,
        directCourseUrl: data.directCourseUrl,
        status: data.status,
        completenessStatus: data.completenessStatus,
        platformName: data.platformName,
        providerName: data.providerName,
        learningLanguage: data.learningLanguage,
        studyDuration: data.studyDuration,
        certificateAvailable: data.certificateAvailable,
        category: data.category,
        difficultyLevel: data.difficultyLevel,
        sourceUrl: data.sourceUrl,
        officialSourceUrl: data.officialSourceUrl,
        thumbnailAssetId: data.thumbnailAssetId,
        sourceImportRecordId: data.sourceImportRecordId,
        optionalFields: asInputJson(sanitizeOptionalFields(data.optionalFields)),
      },
    });
    return this.mapToDto(record);
  }

  public async update(id: string, updates: UpdateCourseDto): Promise<CourseDto> {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) throw new Error(`COURSE_NOT_FOUND:${id}`);

    const optionalFields = updates.optionalFields === undefined
      ? undefined
      : {
          ...(sanitizeOptionalFields(existing.optionalFields) ?? {}),
          ...(sanitizeOptionalFields(updates.optionalFields) ?? {}),
        };

    const record = await this.prisma.course.update({
      where: { id },
      data: {
        displayName: updates.displayName,
        accessType: updates.accessType,
        originType: updates.originType,
        directCourseUrl: updates.directCourseUrl,
        completenessStatus: updates.completenessStatus,
        platformName: updates.platformName,
        providerName: updates.providerName,
        learningLanguage: updates.learningLanguage,
        studyDuration: updates.studyDuration,
        certificateAvailable: updates.certificateAvailable,
        category: updates.category,
        difficultyLevel: updates.difficultyLevel,
        sourceUrl: updates.sourceUrl,
        officialSourceUrl: updates.officialSourceUrl,
        thumbnailAssetId: updates.thumbnailAssetId,
        optionalFields: asInputJson(optionalFields),
      },
    });
    return this.mapToDto(record);
  }

  public async findByDedupKey(dedupKey: string): Promise<CourseDto | null> {
    const record = await this.prisma.course.findUnique({ where: { canonicalDedupKey: dedupKey } });
    return record ? this.mapToDto(record) : null;
  }

  public async findById(id: string): Promise<CourseDto | null> {
    const record = await this.prisma.course.findUnique({ where: { id } });
    return record ? this.mapToDto(record) : null;
  }

  public async findByPublicId(publicId: string): Promise<CourseDto | null> {
    const record = await this.prisma.course.findUnique({ where: { publicId } });
    return record ? this.mapToDto(record) : null;
  }

  public async findBySlug(slug: string): Promise<CourseDto | null> {
    const record = await this.prisma.course.findUnique({ where: { slug } });
    return record ? this.mapToDto(record) : null;
  }

  public async updateStatus(id: string, status: CourseStatus): Promise<void> {
    await this.prisma.course.update({ where: { id }, data: { status } });
  }

  public async updateImportLink(id: string, sourceImportRecordId: string): Promise<void> {
    await this.prisma.course.update({ where: { id }, data: { sourceImportRecordId } });
  }

  public async listByStatus(status: CourseStatus): Promise<CourseDto[]> {
    const data = await this.prisma.course.findMany({ where: { status }, orderBy: { createdAt: 'desc' } });
    return data.map((record) => this.mapToDto(record));
  }

  public async list(filters: CourseFilters): Promise<PaginatedCourseResult<CourseDto>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const where: Prisma.CourseWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.completenessStatus) where.completenessStatus = filters.completenessStatus;
    if (filters.accessType) where.accessType = filters.accessType;
    if (filters.originType) where.originType = filters.originType;
    if (filters.platformName) where.platformName = filters.platformName;

    return this.listPage(where, page, pageSize);
  }

  public async listPublished(filters: PublicCourseFilters): Promise<PaginatedCourseResult<CourseDto>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const where: Prisma.CourseWhereInput = { status: CourseStatus.PUBLISHED };

    if (filters.accessType) where.accessType = filters.accessType;
    if (filters.originType) where.originType = filters.originType;
    if (filters.platformName) where.platformName = filters.platformName;
    if (filters.category) where.category = filters.category;
    if (filters.learningLanguage) where.learningLanguage = filters.learningLanguage;

    return this.listPage(where, page, pageSize);
  }

  private async listPage(
    where: Prisma.CourseWhereInput,
    page: number,
    pageSize: number,
  ): Promise<PaginatedCourseResult<CourseDto>> {
    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: data.map((record) => this.mapToDto(record)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private mapToDto(record: CourseRecord): CourseDto {
    return {
      id: record.id,
      publicId: record.publicId,
      slug: record.slug,
      canonicalName: record.canonicalName,
      canonicalDedupKey: record.canonicalDedupKey,
      displayName: record.displayName,
      accessType: parseAccessType(record.accessType),
      originType: parseOriginType(record.originType),
      directCourseUrl: record.directCourseUrl,
      status: parseStatus(record.status),
      completenessStatus: parseCompleteness(record.completenessStatus),
      platformName: record.platformName ?? undefined,
      providerName: record.providerName ?? undefined,
      learningLanguage: record.learningLanguage ?? undefined,
      studyDuration: record.studyDuration ?? undefined,
      certificateAvailable: record.certificateAvailable ?? undefined,
      category: record.category ?? undefined,
      difficultyLevel: record.difficultyLevel ?? undefined,
      sourceUrl: record.sourceUrl ?? undefined,
      officialSourceUrl: record.officialSourceUrl ?? undefined,
      thumbnailAssetId: record.thumbnailAssetId ?? undefined,
      sourceImportRecordId: record.sourceImportRecordId ?? undefined,
      optionalFields: sanitizeOptionalFields(record.optionalFields),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
