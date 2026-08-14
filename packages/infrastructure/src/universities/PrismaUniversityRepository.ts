import { Prisma, PrismaClient } from '@prisma/client';
import {
  AtomicPersistenceContext,
  ITransactionalUniversityRepository,
  IUniversityRepository,
  PaginatedUniversityResult,
  PublicUniversityFilters,
  sanitizeUniversityOptionalFields,
  UniversityDto,
  UniversityFilters,
  UniversityStatus,
  UniversityNormalizedDetailsUpdate,
  UpdateUniversityDto,
} from '@manaratak/domain';

const universityDetails = {
  campuses: true,
  organizationUnits: true,
  academicPrograms: { include: { campuses: true, admissionRequirements: true } },
  tuitionProfiles: true,
  accommodationProfiles: true,
  rankings: true,
  sourceRecords: true,
} satisfies Prisma.UniversityInclude;

type UniversityRecord = Prisma.UniversityGetPayload<{ include: typeof universityDetails }>;

interface UniversityTransactionContext extends AtomicPersistenceContext {
  readonly transactionClient: Prisma.TransactionClient;
}

export class PrismaUniversityRepository implements ITransactionalUniversityRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly legacyCountryTextFiltersEnabled =
      process.env.MANARATAK_UNIVERSITY_LEGACY_COUNTRY_FILTERS === 'true',
  ) {}

  withTransaction(context: AtomicPersistenceContext): IUniversityRepository {
    const transactionClient = (context as Partial<UniversityTransactionContext>).transactionClient;
    if (!context.boundaryId || !transactionClient)
      throw new Error('UNIVERSITY_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    return new PrismaUniversityRepository(
      transactionClient as unknown as PrismaClient,
      this.legacyCountryTextFiltersEnabled,
    );
  }

  async findById(id: string): Promise<UniversityDto | null> {
    const record = await this.prisma.university.findUnique({
      where: { id },
      include: universityDetails,
    });
    return record ? this.mapToDto(record) : null;
  }

  async findBySlug(slug: string): Promise<UniversityDto | null> {
    const record = await this.prisma.university.findUnique({
      where: { slug },
      include: universityDetails,
    });
    return record ? this.mapToDto(record) : null;
  }

  async findByDedupKey(key: string): Promise<UniversityDto | null> {
    const record = await this.prisma.university.findUnique({
      where: { canonicalDedupKey: key },
      include: universityDetails,
    });
    return record ? this.mapToDto(record) : null;
  }

  async create(
    data: Omit<UniversityDto, 'id' | 'createdAt' | 'updatedAt'> &
      Partial<Pick<UniversityDto, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<UniversityDto> {
    const {
      publicId,
      slug,
      canonicalName,
      canonicalDedupKey,
      displayName,
      country,
      city,
      institutionType,
      officialWebsite,
      status,
      completenessStatus,
      sourceUrl,
      officialSourceUrl,
      logoAssetId,
      foundedYear,
      sourceImportRecordId,
      optionalFields,
      countryReferenceId,
      regionReferenceId,
      cityReferenceId,
      institutionalOwnership,
    } = data;

    const safeOptionalFields = sanitizeUniversityOptionalFields(optionalFields);

    const record = await this.prisma.university.create({
      data: {
        publicId,
        slug,
        canonicalName,
        canonicalDedupKey,
        displayName,
        country,
        city,
        institutionType,
        officialWebsite,
        status,
        completenessStatus,
        sourceUrl,
        officialSourceUrl,
        logoAssetId,
        foundedYear,
        sourceImportRecordId,
        countryReferenceId,
        regionReferenceId,
        cityReferenceId,
        institutionalOwnership,
        optionalFields: safeOptionalFields as Prisma.InputJsonObject,
      },
      include: universityDetails,
    });
    return this.mapToDto(record);
  }

  async update(id: string, updates: UpdateUniversityDto): Promise<UniversityDto> {
    const {
      displayName,
      country,
      city,
      institutionType,
      officialWebsite,
      status,
      completenessStatus,
      sourceUrl,
      officialSourceUrl,
      logoAssetId,
      foundedYear,
      sourceImportRecordId,
      optionalFields,
      countryReferenceId,
      regionReferenceId,
      cityReferenceId,
      institutionalOwnership,
    } = updates;

    const existing = await this.prisma.university.findUnique({ where: { id } });
    const existingOptional = sanitizeUniversityOptionalFields(existing?.optionalFields);

    const safeOptionalFields = {
      ...existingOptional,
      ...sanitizeUniversityOptionalFields(optionalFields),
    };

    const record = await this.prisma.university.update({
      where: { id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        country: country !== undefined ? country : undefined,
        city: city !== undefined ? city : undefined,
        institutionType: institutionType !== undefined ? institutionType : undefined,
        officialWebsite: officialWebsite !== undefined ? officialWebsite : undefined,
        status: status !== undefined ? status : undefined,
        completenessStatus: completenessStatus !== undefined ? completenessStatus : undefined,
        sourceUrl: sourceUrl !== undefined ? sourceUrl : undefined,
        officialSourceUrl: officialSourceUrl !== undefined ? officialSourceUrl : undefined,
        logoAssetId: logoAssetId !== undefined ? logoAssetId : undefined,
        foundedYear: foundedYear !== undefined ? foundedYear : undefined,
        sourceImportRecordId: sourceImportRecordId !== undefined ? sourceImportRecordId : undefined,
        countryReferenceId: countryReferenceId !== undefined ? countryReferenceId : undefined,
        regionReferenceId: regionReferenceId !== undefined ? regionReferenceId : undefined,
        cityReferenceId: cityReferenceId !== undefined ? cityReferenceId : undefined,
        institutionalOwnership:
          institutionalOwnership !== undefined ? institutionalOwnership : undefined,
        optionalFields: safeOptionalFields as Prisma.InputJsonObject,
      },
      include: universityDetails,
    });
    return this.mapToDto(record);
  }

  async updateStatus(id: string, status: UniversityStatus): Promise<void> {
    await this.prisma.university.update({
      where: { id },
      data: { status },
    });
  }

  async list(filters: UniversityFilters): Promise<PaginatedUniversityResult<UniversityDto>> {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 50));

    const where: Prisma.UniversityWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.countryReferenceId) where.countryReferenceId = filters.countryReferenceId;
    else if (filters.country && this.legacyCountryTextFiltersEnabled) where.country = filters.country;
    if (filters.institutionType) where.institutionType = filters.institutionType;
    if (filters.city) where.city = filters.city;
    if (filters.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { canonicalName: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: universityDetails,
      }),
      this.prisma.university.count({ where }),
    ]);

    return {
      data: data.map((d) => this.mapToDto(d)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async listPublished(
    filters: PublicUniversityFilters,
  ): Promise<PaginatedUniversityResult<UniversityDto>> {
    return this.list({ ...filters, status: UniversityStatus.PUBLISHED });
  }

  async replaceNormalizedDetails(
    id: string,
    details: UniversityNormalizedDetailsUpdate,
  ): Promise<UniversityDto> {
    await this.prisma.university.findUniqueOrThrow({ where: { id }, select: { id: true } });
    if (details.campuses !== undefined && details.academicPrograms === undefined) {
      throw new Error('UNIVERSITY_PROGRAMS_REQUIRED_WHEN_REPLACING_CAMPUSES');
    }
    if (details.organizationUnits !== undefined && details.academicPrograms === undefined) {
      throw new Error('UNIVERSITY_PROGRAMS_REQUIRED_WHEN_REPLACING_ORGANIZATION_UNITS');
    }

    if (details.academicPrograms !== undefined)
      await this.prisma.universityAcademicProgram.deleteMany({ where: { universityId: id } });
    if (details.organizationUnits !== undefined)
      await this.prisma.universityOrganizationUnit.deleteMany({ where: { universityId: id } });
    if (details.campuses !== undefined)
      await this.prisma.universityCampus.deleteMany({ where: { universityId: id } });
    if (details.tuitionProfiles !== undefined)
      await this.prisma.universityTuitionProfile.deleteMany({ where: { universityId: id } });
    if (details.accommodationProfiles !== undefined)
      await this.prisma.universityAccommodationProfile.deleteMany({ where: { universityId: id } });
    if (details.rankings !== undefined)
      await this.prisma.universityRanking.deleteMany({ where: { universityId: id } });

    const retainedCampuses =
      details.campuses === undefined
        ? await this.prisma.universityCampus.findMany({
            where: { universityId: id },
            select: { id: true, sourceReferenceId: true },
          })
        : [];
    const campusIds = new Map<string, string>(
      retainedCampuses
        .filter((campus): campus is { id: string; sourceReferenceId: string } =>
          Boolean(campus.sourceReferenceId),
        )
        .map((campus) => [campus.sourceReferenceId, campus.id]),
    );
    for (const campus of details.campuses ?? []) {
      const created = await this.prisma.universityCampus.create({
        data: {
          universityId: id,
          sourceReferenceId: campus.sourceReferenceId,
          name: campus.name,
          campusType: campus.campusType,
          status: campus.status ?? 'ACTIVE',
          address: campus.address,
          countryReferenceId: campus.countryReferenceId,
          regionReferenceId: campus.regionReferenceId,
          cityReferenceId: campus.cityReferenceId,
          latitude: campus.latitude,
          longitude: campus.longitude,
          coordinateSource: campus.coordinateSource,
          metadata: campus.metadata as Prisma.InputJsonObject | undefined,
        },
      });
      if (campus.sourceReferenceId) campusIds.set(campus.sourceReferenceId, created.id);
    }

    const retainedUnits =
      details.organizationUnits === undefined
        ? await this.prisma.universityOrganizationUnit.findMany({
            where: { universityId: id },
            select: { id: true, sourceReferenceId: true },
          })
        : [];
    const unitIds = new Map<string, string>(
      retainedUnits
        .filter((unit): unit is { id: string; sourceReferenceId: string } =>
          Boolean(unit.sourceReferenceId),
        )
        .map((unit) => [unit.sourceReferenceId, unit.id]),
    );
    for (const unit of details.organizationUnits ?? []) {
      const created = await this.prisma.universityOrganizationUnit.create({
        data: {
          universityId: id,
          sourceReferenceId: unit.sourceReferenceId,
          campusId: unit.campusSourceReferenceId
            ? campusIds.get(unit.campusSourceReferenceId)
            : undefined,
          unitType: unit.unitType,
          name: unit.name,
          normalizedName: unit.name.trim().toLocaleLowerCase(),
          status: unit.status ?? 'ACTIVE',
          metadata: unit.metadata as Prisma.InputJsonObject | undefined,
        },
      });
      if (unit.sourceReferenceId) unitIds.set(unit.sourceReferenceId, created.id);
    }
    for (const unit of details.organizationUnits ?? []) {
      if (!unit.sourceReferenceId || !unit.parentSourceReferenceId) continue;
      const unitId = unitIds.get(unit.sourceReferenceId);
      const parentId = unitIds.get(unit.parentSourceReferenceId);
      if (!unitId || !parentId) throw new Error('UNIVERSITY_ORGANIZATION_REFERENCE_NOT_FOUND');
      await this.prisma.universityOrganizationUnit.update({
        where: { id: unitId },
        data: { parentOrganizationUnitId: parentId },
      });
    }

    for (const program of details.academicPrograms ?? []) {
      const created = await this.prisma.universityAcademicProgram.create({
        data: {
          universityId: id,
          sourceReferenceId: program.sourceReferenceId,
          organizationUnitId: program.organizationUnitSourceReferenceId
            ? unitIds.get(program.organizationUnitSourceReferenceId)
            : undefined,
          sourceProgramName: program.sourceProgramName,
          normalizedName: program.sourceProgramName.trim().toLocaleLowerCase(),
          degreeLevelId: program.degreeLevelId,
          majorId: program.majorId,
          majorMappingState: program.majorMappingState,
          status: program.status ?? 'DRAFT',
          metadata: program.metadata as Prisma.InputJsonObject | undefined,
        } as Prisma.UniversityAcademicProgramUncheckedCreateInput,
      });
      for (const campusReference of program.campusSourceReferenceIds ?? []) {
        const campusId = campusIds.get(campusReference);
        if (!campusId) throw new Error(`UNIVERSITY_CAMPUS_REFERENCE_NOT_FOUND:${campusReference}`);
        await this.prisma.universityProgramCampus.create({
          data: { academicProgramId: created.id, campusId },
        });
      }
      for (const requirement of program.admissionRequirements ?? []) {
        await this.prisma.universityProgramAdmissionRequirement.create({
          data: {
            academicProgramId: created.id,
            internationalTestId: requirement.internationalTestId,
            testVariantId: requirement.testVariantId,
            testVersionId: requirement.testVersionId,
            minimumScore: requirement.minimumScore,
            sectionScores: requirement.sectionScores as Prisma.InputJsonObject | undefined,
            validityMetadata: requirement.validityMetadata as Prisma.InputJsonObject | undefined,
            restrictionMetadata: requirement.restrictionMetadata as
              Prisma.InputJsonObject | undefined,
            status: requirement.status ?? 'REVIEW_REQUIRED',
          },
        });
      }
    }

    if (details.tuitionProfiles?.length)
      await this.prisma.universityTuitionProfile.createMany({
        data: details.tuitionProfiles.map((item) => ({
          universityId: id,
          profileType: item.profileType,
          organizationUnitName: item.organizationUnitName,
          amount: item.amount,
          currencyCode: item.currencyCode,
          currencyReferenceId: item.currencyReferenceId,
          officialSourceUrl: item.officialSourceUrl,
          effectiveFrom: item.effectiveFrom,
          effectiveTo: item.effectiveTo,
          metadata: item.metadata as Prisma.InputJsonObject | undefined,
        } as Prisma.UniversityTuitionProfileUncheckedCreateInput)),
      });
    if (details.accommodationProfiles?.length)
      await this.prisma.universityAccommodationProfile.createMany({
        data: details.accommodationProfiles.map((item) => ({
          universityId: id,
          ...item,
          metadata: item.metadata as Prisma.InputJsonObject | undefined,
        })),
      });
    if (details.rankings?.length)
      await this.prisma.universityRanking.createMany({
        data: details.rankings.map((item) => ({ universityId: id, ...item })),
      });

    const updated = await this.prisma.university.findUniqueOrThrow({
      where: { id },
      include: universityDetails,
    });
    return this.mapToDto(updated);
  }

  private mapToDto(record: UniversityRecord): UniversityDto {
    const { optionalFields, ...rest } = record;
    const safeOptionalFields = sanitizeUniversityOptionalFields(optionalFields);
    return {
      ...safeOptionalFields,
      ...rest,
      status: rest.status as UniversityStatus,
      completenessStatus: rest.completenessStatus as UniversityDto['completenessStatus'],
      optionalFields: safeOptionalFields,
    } as unknown as UniversityDto;
  }
}
