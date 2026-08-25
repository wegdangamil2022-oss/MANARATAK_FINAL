import { createHash } from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  AtomicPersistenceContext,
  ITransactionalReferenceDataRepository,
  IReferenceResolutionRepository,
  ReferenceLookup,
  ReferenceResolutionMatch,
  ReferenceCountryDto,
  ReferenceCurrencyDto,
  ReferenceLanguageDto,
  ReferenceCityDto,
  UpsertReferenceCountryDto,
  UpsertReferenceCurrencyDto,
  UpsertReferenceLanguageDto,
  UpsertReferenceCityDto,
  ReferenceDataFilters,
  AdministrativeRegionDto
} from '@manaratak/domain';

interface DbCountry {
  id: string;
  iso2Code: string;
  iso3Code: string;
  name: string;
  nameAr: string | null;
  officialName: string | null;
  region: string | null;
  subregion: string | null;
  defaultCurrencyCode: string | null;
  defaultLanguageCode: string | null;
  callingCode: string | null;
  flagAssetId: string | null;
  isActive: boolean;
  metadata: unknown;
}

interface DbCurrency {
  id: string;
  isoCode: string;
  numericCode: string | null;
  name: string;
  nameAr: string | null;
  symbol: string | null;
  minorUnit: number | null;
  isActive: boolean;
  metadata: unknown;
}

interface DbLanguage {
  id: string;
  isoCode: string;
  name: string;
  nameAr: string | null;
  nativeName: string | null;
  direction: string;
  isActive: boolean;
  metadata: unknown;
}

interface DbCity {
  id: string;
  countryIso2Code: string;
  name: string;
  nameAr: string | null;
  region: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  metadata: unknown;
  administrativeRegionId?: string | null;
  administrativeRegion?: {
    id: string;
    countryIso2Code: string;
    regionCode: string;
    name: string;
    nameAr: string | null;
    localName: string | null;
    regionType: string | null;
  } | null;
}

interface PrismaReferenceDataPersistenceContext extends AtomicPersistenceContext {
  readonly transactionClient: Prisma.TransactionClient;
}

export class PrismaReferenceDataRepository implements ITransactionalReferenceDataRepository, IReferenceResolutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async resolveCountryCandidate(
    lookup: ReferenceLookup,
  ): Promise<ReferenceResolutionMatch<ReferenceCountryDto> | null> {
    if (lookup.id) {
      const record = await this.prisma.referenceCountry.findUnique({ where: { id: lookup.id } });
      if (record) return { record: this.mapToCountryDto(record as unknown as DbCountry), method: 'EXACT_ID' };
    }

    if (lookup.standardCode) {
      const code = lookup.standardCode.trim().toUpperCase();
      const record = code.length === 2
        ? await this.prisma.referenceCountry.findUnique({ where: { iso2Code: code } })
        : code.length === 3
          ? await this.prisma.referenceCountry.findUnique({ where: { iso3Code: code } })
          : null;
      if (record) return { record: this.mapToCountryDto(record as unknown as DbCountry), method: 'EXACT_STANDARD_CODE' };
    }

    const metadataMatch = await this.resolveMetadataBackedCandidate(
      'ReferenceCountry',
      lookup,
      async (id) => {
        const record = await this.prisma.referenceCountry.findUnique({ where: { id } });
        return record ? this.mapToCountryDto(record as unknown as DbCountry) : null;
      },
    );
    return metadataMatch;
  }

  public async resolveRegionCandidate(
    lookup: ReferenceLookup,
  ): Promise<ReferenceResolutionMatch<AdministrativeRegionDto> | null> {
    if (lookup.id) {
      const record = await this.prisma.administrativeRegion.findUnique({ where: { id: lookup.id } });
      if (record) return { record: this.mapToRegionDto(record), method: 'EXACT_ID' };
    }
    if (lookup.standardCode) {
      const code = lookup.standardCode.trim();
      const records = await this.prisma.administrativeRegion.findMany({
        where: { regionCode: { equals: code, mode: 'insensitive' } },
        take: 2,
      });
      if (records.length === 1) return { record: this.mapToRegionDto(records[0]), method: 'EXACT_STANDARD_CODE' };
    }
    return null;
  }

  public async resolveCityCandidate(
    lookup: ReferenceLookup,
  ): Promise<ReferenceResolutionMatch<ReferenceCityDto> | null> {
    if (lookup.id) {
      const record = await this.prisma.referenceCity.findUnique({
        where: { id: lookup.id },
        include: { administrativeRegion: true },
      });
      if (record) return { record: this.mapToCityDto(record as unknown as DbCity), method: 'EXACT_ID' };
    }

    return this.resolveMetadataBackedCandidate(
      'ReferenceCity',
      lookup,
      async (id) => {
        const record = await this.prisma.referenceCity.findUnique({
          where: { id },
          include: { administrativeRegion: true },
        });
        return record ? this.mapToCityDto(record as unknown as DbCity) : null;
      },
    );
  }

  public async resolveLanguageCandidate(
    lookup: ReferenceLookup,
  ): Promise<ReferenceResolutionMatch<ReferenceLanguageDto> | null> {
    if (lookup.id) {
      const record = await this.prisma.referenceLanguage.findUnique({ where: { id: lookup.id } });
      if (record) return { record: this.mapToLanguageDto(record as unknown as DbLanguage), method: 'EXACT_ID' };
    }
    if (lookup.standardCode) {
      const code = lookup.standardCode.trim().toLowerCase();
      const record = await this.prisma.referenceLanguage.findUnique({ where: { isoCode: code } });
      if (record) return { record: this.mapToLanguageDto(record as unknown as DbLanguage), method: 'EXACT_STANDARD_CODE' };
    }
    return this.resolveMetadataBackedCandidate(
      'ReferenceLanguage',
      lookup,
      async (id) => {
        const record = await this.prisma.referenceLanguage.findUnique({ where: { id } });
        return record ? this.mapToLanguageDto(record as unknown as DbLanguage) : null;
      },
    );
  }

  public async resolveCurrencyCandidate(
    lookup: ReferenceLookup,
  ): Promise<ReferenceResolutionMatch<ReferenceCurrencyDto> | null> {
    if (lookup.id) {
      const record = await this.prisma.referenceCurrency.findUnique({ where: { id: lookup.id } });
      if (record) return { record: this.mapToCurrencyDto(record as unknown as DbCurrency), method: 'EXACT_ID' };
    }
    if (lookup.standardCode) {
      const code = lookup.standardCode.trim().toUpperCase();
      const record = await this.prisma.referenceCurrency.findUnique({ where: { isoCode: code } });
      if (record) return { record: this.mapToCurrencyDto(record as unknown as DbCurrency), method: 'EXACT_STANDARD_CODE' };
    }
    return this.resolveMetadataBackedCandidate(
      'ReferenceCurrency',
      lookup,
      async (id) => {
        const record = await this.prisma.referenceCurrency.findUnique({ where: { id } });
        return record ? this.mapToCurrencyDto(record as unknown as DbCurrency) : null;
      },
    );
  }

  private async resolveMetadataBackedCandidate<T>(
    tableName: 'ReferenceCountry' | 'ReferenceCity' | 'ReferenceLanguage' | 'ReferenceCurrency',
    lookup: ReferenceLookup,
    load: (id: string) => Promise<T | null>,
  ): Promise<ReferenceResolutionMatch<T> | null> {
    if (lookup.providerSystem && lookup.providerId) {
      const ids = await this.findMetadataCandidateIds(tableName, {
        providerSystem: lookup.providerSystem,
        providerId: lookup.providerId,
      });
      if (ids.length > 1) return null;
      if (ids.length === 1) {
        const record = await load(ids[0]);
        if (record) return { record, method: 'PROVIDER_MAPPING' };
      }
    }

    const alias = lookup.normalizedAlias || lookup.alias;
    if (alias) {
      const ids = await this.findMetadataCandidateIds(tableName, { alias });
      if (ids.length > 1) return null;
      if (ids.length === 1) {
        const record = await load(ids[0]);
        if (record) return { record, method: 'NORMALIZED_ALIAS' };
      }
    }
    return null;
  }

  private async findMetadataCandidateIds(
    tableName: 'ReferenceCountry' | 'ReferenceCity' | 'ReferenceLanguage' | 'ReferenceCurrency',
    lookup: { providerSystem?: string; providerId?: string; alias?: string },
  ): Promise<string[]> {
    const table = Prisma.raw(`"${tableName}"`);
    if (lookup.providerSystem && lookup.providerId) {
      const providerSystem = lookup.providerSystem.trim().toLowerCase();
      const providerId = lookup.providerId.trim().toLowerCase();
      const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id"
        FROM ${table}
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(
            CASE
              WHEN jsonb_typeof("metadata"->'providerMappings') = 'array'
                THEN "metadata"->'providerMappings'
              ELSE '[]'::jsonb
            END
          ) AS mapping
          WHERE lower(btrim(mapping->>'providerSystem')) = ${providerSystem}
            AND lower(btrim(mapping->>'providerId')) = ${providerId}
        )
        LIMIT 2
      `);
      return rows.map((row) => row.id);
    }

    if (lookup.alias) {
      const normalizedAlias = this.normalizeResolutionAlias(lookup.alias);
      const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id"
        FROM ${table}
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(
            CASE
              WHEN jsonb_typeof("metadata"->'aliases') = 'array'
                THEN "metadata"->'aliases'
              ELSE '[]'::jsonb
            END
          ) AS alias(value)
          WHERE btrim(
            regexp_replace(
              regexp_replace(lower(alias.value), '[^a-z0-9ء-ي]+', ' ', 'g'),
              '\\s+', ' ', 'g'
            )
          ) = ${normalizedAlias}
        )
        LIMIT 2
      `);
      return rows.map((row) => row.id);
    }

    return [];
  }

  private normalizeResolutionAlias(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public async listCountries(filters?: ReferenceDataFilters): Promise<ReferenceCountryDto[]> {
    const where: {
      isActive?: boolean;
      region?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        officialName?: { contains: string; mode: 'insensitive' };
        iso2Code?: { contains: string; mode: 'insensitive' };
        iso3Code?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (filters?.activeOnly) {
      where.isActive = true;
    }
    if (filters?.region) {
      where.region = filters.region;
    }
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { officialName: { contains: filters.q, mode: 'insensitive' } },
        { iso2Code: { contains: filters.q, mode: 'insensitive' } },
        { iso3Code: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    const records = await this.prisma.referenceCountry.findMany({
      where,
      orderBy: { name: 'asc' },
      ...this.pagination(filters)
    });

    return (records as unknown as DbCountry[]).map(record => this.mapToCountryDto(record));
  }

  public async getCountry(iso2Code: string): Promise<ReferenceCountryDto | null> {
    const record = await this.prisma.referenceCountry.findUnique({
      where: { iso2Code }
    });
    return record ? this.mapToCountryDto(record as unknown as DbCountry) : null;
  }

  public async upsertCountry(data: UpsertReferenceCountryDto): Promise<ReferenceCountryDto> {
    const record = await this.prisma.referenceCountry.upsert({
      where: { iso2Code: data.iso2Code },
      update: {
        iso3Code: data.iso3Code,
        name: data.name,
        nameAr: data.nameAr,
        officialName: data.officialName,
        region: data.region,
        subregion: data.subregion,
        defaultCurrencyCode: data.defaultCurrencyCode,
        defaultLanguageCode: data.defaultLanguageCode,
        callingCode: data.callingCode,
        flagAssetId: data.flagAssetId,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        metadata: data.metadata as any
      },
      create: {
        iso2Code: data.iso2Code,
        iso3Code: data.iso3Code,
        name: data.name,
        nameAr: data.nameAr,
        officialName: data.officialName,
        region: data.region,
        subregion: data.subregion,
        defaultCurrencyCode: data.defaultCurrencyCode,
        defaultLanguageCode: data.defaultLanguageCode,
        callingCode: data.callingCode,
        flagAssetId: data.flagAssetId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        metadata: data.metadata as any
      }
    });

    return this.mapToCountryDto(record as unknown as DbCountry);
  }

  public upsertCountryInTransaction(data: UpsertReferenceCountryDto, context: AtomicPersistenceContext): Promise<ReferenceCountryDto> {
    return this.transactionRepository(context).upsertCountry(data);
  }

  public async listCurrencies(filters?: ReferenceDataFilters): Promise<ReferenceCurrencyDto[]> {
    const where: {
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        isoCode?: { contains: string; mode: 'insensitive' };
        symbol?: { contains: string; mode: 'insensitive' };
        numericCode?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (filters?.activeOnly) {
      where.isActive = true;
    }
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { isoCode: { contains: filters.q, mode: 'insensitive' } },
        { symbol: { contains: filters.q, mode: 'insensitive' } },
        { numericCode: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    const records = await this.prisma.referenceCurrency.findMany({
      where,
      orderBy: { name: 'asc' },
      ...this.pagination(filters)
    });

    return (records as unknown as DbCurrency[]).map(record => this.mapToCurrencyDto(record));
  }

  public async getCurrency(isoCode: string): Promise<ReferenceCurrencyDto | null> {
    const record = await this.prisma.referenceCurrency.findUnique({
      where: { isoCode }
    });
    return record ? this.mapToCurrencyDto(record as unknown as DbCurrency) : null;
  }

  public async upsertCurrency(data: UpsertReferenceCurrencyDto): Promise<ReferenceCurrencyDto> {
    const record = await this.prisma.referenceCurrency.upsert({
      where: { isoCode: data.isoCode },
      update: {
        numericCode: data.numericCode,
        name: data.name,
        nameAr: data.nameAr,
        symbol: data.symbol,
        minorUnit: data.minorUnit,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        metadata: data.metadata as any
      },
      create: {
        isoCode: data.isoCode,
        numericCode: data.numericCode,
        name: data.name,
        nameAr: data.nameAr,
        symbol: data.symbol,
        minorUnit: data.minorUnit,
        isActive: data.isActive !== undefined ? data.isActive : true,
        metadata: data.metadata as any
      }
    });

    return this.mapToCurrencyDto(record as unknown as DbCurrency);
  }

  public upsertCurrencyInTransaction(data: UpsertReferenceCurrencyDto, context: AtomicPersistenceContext): Promise<ReferenceCurrencyDto> {
    return this.transactionRepository(context).upsertCurrency(data);
  }

  public async listLanguages(filters?: ReferenceDataFilters): Promise<ReferenceLanguageDto[]> {
    const where: {
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        nativeName?: { contains: string; mode: 'insensitive' };
        isoCode?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (filters?.activeOnly) {
      where.isActive = true;
    }
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { nativeName: { contains: filters.q, mode: 'insensitive' } },
        { isoCode: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    const records = await this.prisma.referenceLanguage.findMany({
      where,
      orderBy: { name: 'asc' },
      ...this.pagination(filters)
    });

    return (records as unknown as DbLanguage[]).map(record => this.mapToLanguageDto(record));
  }

  public async getLanguage(isoCode: string): Promise<ReferenceLanguageDto | null> {
    const record = await this.prisma.referenceLanguage.findUnique({
      where: { isoCode }
    });
    return record ? this.mapToLanguageDto(record as unknown as DbLanguage) : null;
  }

  public async upsertLanguage(data: UpsertReferenceLanguageDto): Promise<ReferenceLanguageDto> {
    const record = await this.prisma.referenceLanguage.upsert({
      where: { isoCode: data.isoCode },
      update: {
        name: data.name,
        nameAr: data.nameAr,
        nativeName: data.nativeName,
        direction: data.direction,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        metadata: data.metadata as any
      },
      create: {
        isoCode: data.isoCode,
        name: data.name,
        nameAr: data.nameAr,
        nativeName: data.nativeName,
        direction: data.direction,
        isActive: data.isActive !== undefined ? data.isActive : true,
        metadata: data.metadata as any
      }
    });

    return this.mapToLanguageDto(record as unknown as DbLanguage);
  }

  public upsertLanguageInTransaction(data: UpsertReferenceLanguageDto, context: AtomicPersistenceContext): Promise<ReferenceLanguageDto> {
    return this.transactionRepository(context).upsertLanguage(data);
  }

  public async listCities(filters?: ReferenceDataFilters): Promise<ReferenceCityDto[]> {
    const where: {
      isActive?: boolean;
      countryIso2Code?: string;
      region?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        timezone?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (filters?.activeOnly) {
      where.isActive = true;
    }
    if (filters?.countryIso2Code) {
      where.countryIso2Code = filters.countryIso2Code;
    }
    if (filters?.region) {
      where.region = filters.region;
    }
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { timezone: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    const records = await this.prisma.referenceCity.findMany({
      where,
      include: {
        administrativeRegion: true
      },
      orderBy: { name: 'asc' },
      ...this.pagination(filters)
    });

    return (records as unknown as DbCity[]).map(record => this.mapToCityDto(record));
  }

  public async listRegions(filters?: ReferenceDataFilters): Promise<AdministrativeRegionDto[]> {
    const records = await this.prisma.administrativeRegion.findMany({
      where: filters?.countryIso2Code ? { countryIso2Code: filters.countryIso2Code } : undefined,
      orderBy: [{ countryIso2Code: 'asc' }, { name: 'asc' }],
      ...this.pagination(filters)
    });
    return records.map((record) => this.mapToRegionDto(record));
  }

  public async getRegionById(id: string): Promise<AdministrativeRegionDto | null> {
    const record = await this.prisma.administrativeRegion.findUnique({ where: { id } });
    return record ? this.mapToRegionDto(record) : null;
  }

  private pagination(filters?: ReferenceDataFilters): { skip?: number; take?: number } {
    if (!filters?.page && !filters?.pageSize) return {};
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 50));
    return { skip: (page - 1) * pageSize, take: pageSize };
  }

  public async upsertCity(data: UpsertReferenceCityDto): Promise<ReferenceCityDto> {
    const canonicalIdentityKey = this.cityCanonicalIdentityKey(data);
    const updateData = {
      name: data.name,
      nameAr: data.nameAr,
      region: data.region,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
      administrativeRegionId: data.administrativeRegionId,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
      metadata: data.metadata as any,
    };

    const keyed = await this.prisma.referenceCity.findUnique({
      where: { canonicalIdentityKey },
      include: { administrativeRegion: true },
    });
    if (keyed) {
      const record = await this.prisma.referenceCity.update({
        where: { id: keyed.id },
        data: updateData,
        include: { administrativeRegion: true },
      });
      return this.mapToCityDto(record as unknown as DbCity);
    }

    // Compatibility bridge for pre-W3 rows. Existing rows intentionally remain
    // NULL until Google Studio duplicate inspection/backfill is approved. A
    // legacy row is claimed only when its canonical identity is unambiguous.
    const legacyRegionScope = data.administrativeRegionId
      ? { administrativeRegionId: data.administrativeRegionId }
      : {
          administrativeRegionId: null,
          region: data.region == null
            ? null
            : { equals: data.region, mode: 'insensitive' as const },
        };
    const legacyMatches = await this.prisma.referenceCity.findMany({
      where: {
        canonicalIdentityKey: null,
        countryIso2Code: data.countryIso2Code,
        name: { equals: data.name, mode: 'insensitive' },
        ...legacyRegionScope,
      },
      include: { administrativeRegion: true },
      take: 2,
    });
    if (legacyMatches.length > 1) {
      throw new Error('REFERENCE_CITY_LEGACY_IDENTITY_AMBIGUOUS');
    }

    if (legacyMatches.length === 1) {
      try {
        const record = await this.prisma.referenceCity.update({
          where: { id: legacyMatches[0].id },
          data: { canonicalIdentityKey, ...updateData },
          include: { administrativeRegion: true },
        });
        return this.mapToCityDto(record as unknown as DbCity);
      } catch (error) {
        // Another writer may have claimed the same canonical identity between
        // lookup and update. Resolve to the unique keyed row rather than
        // creating a duplicate or updating an arbitrary legacy row.
        if (!this.isUniqueConstraintViolation(error)) throw error;
        const winner = await this.prisma.referenceCity.findUnique({
          where: { canonicalIdentityKey },
          include: { administrativeRegion: true },
        });
        if (!winner) throw error;
        const record = await this.prisma.referenceCity.update({
          where: { id: winner.id },
          data: updateData,
          include: { administrativeRegion: true },
        });
        return this.mapToCityDto(record as unknown as DbCity);
      }
    }

    // New W3 identities use the database unique key directly. Prisma upsert
    // closes the previous findFirst -> create race for canonical city writes.
    const record = await this.prisma.referenceCity.upsert({
      where: { canonicalIdentityKey },
      update: updateData,
      create: {
        canonicalIdentityKey,
        countryIso2Code: data.countryIso2Code,
        ...updateData,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: { administrativeRegion: true },
    });
    return this.mapToCityDto(record as unknown as DbCity);
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }


  private cityCanonicalIdentityKey(data: UpsertReferenceCityDto): string {
    const normalize = (value: string | null | undefined) =>
      (value ?? '')
        .normalize('NFKC')
        .trim()
        .toLocaleLowerCase('en-US')
        .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const regionIdentity = data.administrativeRegionId
      ? `id:${data.administrativeRegionId.trim().toLowerCase()}`
      : normalize(data.region)
        ? `text:${normalize(data.region)}`
        : '~';
    const canonicalIdentity = [
      data.countryIso2Code.trim().toUpperCase(),
      normalize(data.name),
      regionIdentity,
    ].join('|');
    return createHash('sha256').update(canonicalIdentity, 'utf8').digest('hex');
  }


  public upsertCityInTransaction(data: UpsertReferenceCityDto, context: AtomicPersistenceContext): Promise<ReferenceCityDto> {
    return this.transactionRepository(context).upsertCity(data);
  }

  private transactionRepository(context: AtomicPersistenceContext): PrismaReferenceDataRepository {
    const transactionClient = (context as Partial<PrismaReferenceDataPersistenceContext>).transactionClient;
    if (!context.boundaryId || !transactionClient) {
      throw new Error('REFERENCE_DATA_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    }
    return new PrismaReferenceDataRepository(transactionClient as unknown as PrismaClient);
  }

  private mapToRegionDto(record: {
    id: string;
    countryIso2Code: string;
    regionCode: string;
    name: string;
    nameAr: string | null;
    localName: string | null;
    regionType: string | null;
  }): AdministrativeRegionDto {
    return {
      id: record.id,
      countryIso2Code: record.countryIso2Code,
      regionCode: record.regionCode,
      name: record.name,
      nameAr: record.nameAr,
      localName: record.localName,
      regionType: record.regionType,
    };
  }

  private mapToCountryDto(record: DbCountry): ReferenceCountryDto {
    return {
      id: record.id,
      iso2Code: record.iso2Code,
      iso3Code: record.iso3Code,
      name: record.name,
      nameAr: record.nameAr,
      officialName: record.officialName,
      region: record.region,
      subregion: record.subregion,
      defaultCurrencyCode: record.defaultCurrencyCode,
      defaultLanguageCode: record.defaultLanguageCode,
      callingCode: record.callingCode,
      flagAssetId: record.flagAssetId,
      isActive: record.isActive,
      metadata: record.metadata ? (record.metadata as Record<string, unknown>) : undefined
    };
  }

  private mapToCurrencyDto(record: DbCurrency): ReferenceCurrencyDto {
    return {
      id: record.id,
      isoCode: record.isoCode,
      numericCode: record.numericCode,
      name: record.name,
      nameAr: record.nameAr,
      symbol: record.symbol,
      minorUnit: record.minorUnit,
      isActive: record.isActive,
      metadata: record.metadata ? (record.metadata as Record<string, unknown>) : undefined
    };
  }

  private mapToLanguageDto(record: DbLanguage): ReferenceLanguageDto {
    return {
      id: record.id,
      isoCode: record.isoCode,
      name: record.name,
      nameAr: record.nameAr,
      nativeName: record.nativeName,
      direction: record.direction as 'LTR' | 'RTL',
      isActive: record.isActive,
      metadata: record.metadata ? (record.metadata as Record<string, unknown>) : undefined
    };
  }

  private mapToCityDto(record: DbCity): ReferenceCityDto {
    return {
      id: record.id,
      countryIso2Code: record.countryIso2Code,
      name: record.name,
      nameAr: record.nameAr,
      region: record.region,
      timezone: record.timezone,
      latitude: record.latitude,
      longitude: record.longitude,
      isActive: record.isActive,
      metadata: record.metadata ? (record.metadata as Record<string, unknown>) : undefined,
      administrativeRegionId: record.administrativeRegionId,
      administrativeRegion: record.administrativeRegion ? {
        id: record.administrativeRegion.id,
        countryIso2Code: record.administrativeRegion.countryIso2Code,
        regionCode: record.administrativeRegion.regionCode,
        name: record.administrativeRegion.name,
        nameAr: record.administrativeRegion.nameAr,
        localName: record.administrativeRegion.localName,
        regionType: record.administrativeRegion.regionType
      } : null
    };
  }
}
