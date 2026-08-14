import { Prisma, PrismaClient } from '@prisma/client';
import {
  AtomicPersistenceContext,
  ITransactionalReferenceDataRepository,
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
  symbol: string | null;
  minorUnit: number | null;
  isActive: boolean;
  metadata: unknown;
}

interface DbLanguage {
  id: string;
  isoCode: string;
  name: string;
  nativeName: string | null;
  direction: string;
  isActive: boolean;
  metadata: unknown;
}

interface DbCity {
  id: string;
  countryIso2Code: string;
  name: string;
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

export class PrismaReferenceDataRepository implements ITransactionalReferenceDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
        symbol: data.symbol,
        minorUnit: data.minorUnit,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        metadata: data.metadata as any
      },
      create: {
        isoCode: data.isoCode,
        numericCode: data.numericCode,
        name: data.name,
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
        nativeName: data.nativeName,
        direction: data.direction,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        metadata: data.metadata as any
      },
      create: {
        isoCode: data.isoCode,
        name: data.name,
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
    return records.map((record) => ({
      id: record.id,
      countryIso2Code: record.countryIso2Code,
      regionCode: record.regionCode,
      name: record.name,
      nameAr: record.nameAr,
      localName: record.localName,
      regionType: record.regionType
    }));
  }

  public async getRegionById(id: string): Promise<AdministrativeRegionDto | null> {
    const record = await this.prisma.administrativeRegion.findUnique({ where: { id } });
    return record ? {
      id: record.id,
      countryIso2Code: record.countryIso2Code,
      regionCode: record.regionCode,
      name: record.name,
      nameAr: record.nameAr,
      localName: record.localName,
      regionType: record.regionType
    } : null;
  }

  private pagination(filters?: ReferenceDataFilters): { skip?: number; take?: number } {
    if (!filters?.page && !filters?.pageSize) return {};
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 50));
    return { skip: (page - 1) * pageSize, take: pageSize };
  }

  public async upsertCity(data: UpsertReferenceCityDto): Promise<ReferenceCityDto> {
    const cityWhere = {
      countryIso2Code: data.countryIso2Code,
      name: data.name,
      ...(data.region !== undefined ? { region: data.region } : {})
    };

    const existing = await this.prisma.referenceCity.findFirst({
      where: cityWhere,
      include: {
        administrativeRegion: true
      }
    });

    if (existing) {
      const record = await this.prisma.referenceCity.update({
        where: { id: existing.id },
        data: {
          timezone: data.timezone,
          latitude: data.latitude,
          longitude: data.longitude,
          administrativeRegionId: data.administrativeRegionId,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
          metadata: data.metadata as any
        },
        include: {
          administrativeRegion: true
        }
      });
      return this.mapToCityDto(record as unknown as DbCity);
    } else {
      const record = await this.prisma.referenceCity.create({
        data: {
          countryIso2Code: data.countryIso2Code,
          name: data.name,
          region: data.region,
          timezone: data.timezone,
          latitude: data.latitude,
          longitude: data.longitude,
          administrativeRegionId: data.administrativeRegionId,
          isActive: data.isActive !== undefined ? data.isActive : true,
          metadata: data.metadata as any
        },
        include: {
          administrativeRegion: true
        }
      });
      return this.mapToCityDto(record as unknown as DbCity);
    }
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

  private mapToCountryDto(record: DbCountry): ReferenceCountryDto {
    return {
      id: record.id,
      iso2Code: record.iso2Code,
      iso3Code: record.iso3Code,
      name: record.name,
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
