import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaReferenceDataRepository } from '../../src/reference-data/PrismaReferenceDataRepository';
import { PrismaClient } from '@prisma/client';
import {
  UpsertReferenceCountryDto,
  UpsertReferenceCurrencyDto,
  UpsertReferenceLanguageDto,
  UpsertReferenceCityDto,
  ReferenceDataFilters
} from '@manaratak/domain';

function createMockPrismaClient() {
  return {
    referenceCountry: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn()
    },
    referenceCurrency: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn()
    },
    referenceLanguage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn()
    },
    referenceCity: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn()
    }
  } as unknown as PrismaClient;
}

describe('PrismaReferenceDataRepository', () => {
  let mockPrisma: any;
  let repository: PrismaReferenceDataRepository;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    repository = new PrismaReferenceDataRepository(mockPrisma);
  });

  describe('Countries', () => {
    it('listCountries builds filters for activeOnly, region, and q', async () => {
      const dbRecords = [
        {
          id: 'country-1',
          iso2Code: 'EG',
          iso3Code: 'EGY',
          name: 'Egypt',
          officialName: 'Arab Republic of Egypt',
          region: 'Africa',
          subregion: 'Northern Africa',
          defaultCurrencyCode: 'EGP',
          defaultLanguageCode: 'ar',
          callingCode: '+20',
          flagAssetId: 'flag-eg',
          isActive: true,
          metadata: { population: 100000000 },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.referenceCountry.findMany.mockResolvedValue(dbRecords);

      const filters: ReferenceDataFilters = {
        activeOnly: true,
        region: 'Africa',
        q: 'Egy'
      };

      const result = await repository.listCountries(filters);

      expect(mockPrisma.referenceCountry.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          region: 'Africa',
          OR: [
            { name: { contains: 'Egy', mode: 'insensitive' } },
            { officialName: { contains: 'Egy', mode: 'insensitive' } },
            { iso2Code: { contains: 'Egy', mode: 'insensitive' } },
            { iso3Code: { contains: 'Egy', mode: 'insensitive' } }
          ]
        },
        orderBy: { name: 'asc' }
      });

      expect(result).toEqual([
        {
          id: 'country-1',
          iso2Code: 'EG',
          iso3Code: 'EGY',
          name: 'Egypt',
          officialName: 'Arab Republic of Egypt',
          region: 'Africa',
          subregion: 'Northern Africa',
          defaultCurrencyCode: 'EGP',
          defaultLanguageCode: 'ar',
          callingCode: '+20',
          flagAssetId: 'flag-eg',
          isActive: true,
          metadata: { population: 100000000 }
        }
      ]);
      expect((result[0] as any).id).toBe('country-1');
      expect((result[0] as any).createdAt).toBeUndefined();
    });

    it('getCountry calls referenceCountry.findUnique with iso2Code', async () => {
      const dbRecord = {
        id: 'country-1',
        iso2Code: 'EG',
        iso3Code: 'EGY',
        name: 'Egypt',
        officialName: null,
        region: 'Africa',
        subregion: null,
        defaultCurrencyCode: 'EGP',
        defaultLanguageCode: 'ar',
        callingCode: '+20',
        flagAssetId: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.referenceCountry.findUnique.mockResolvedValue(dbRecord);

      const result = await repository.getCountry('EG');

      expect(mockPrisma.referenceCountry.findUnique).toHaveBeenCalledWith({
        where: { iso2Code: 'EG' }
      });
      expect(result).toEqual({
        id: 'country-1',
        iso2Code: 'EG',
        iso3Code: 'EGY',
        name: 'Egypt',
        officialName: null,
        region: 'Africa',
        subregion: null,
        defaultCurrencyCode: 'EGP',
        defaultLanguageCode: 'ar',
        callingCode: '+20',
        flagAssetId: null,
        isActive: true,
        metadata: undefined
      });
    });

    it('upsertCountry calls referenceCountry.upsert using iso2Code as unique key', async () => {
      const input: UpsertReferenceCountryDto = {
        iso2Code: 'EG',
        iso3Code: 'EGY',
        name: 'Egypt',
        isActive: true,
        metadata: { key: 'value' }
      };

      const dbRecord = {
        id: 'country-1',
        iso2Code: 'EG',
        iso3Code: 'EGY',
        name: 'Egypt',
        officialName: null,
        region: null,
        subregion: null,
        defaultCurrencyCode: null,
        defaultLanguageCode: null,
        callingCode: null,
        flagAssetId: null,
        isActive: true,
        metadata: { key: 'value' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.referenceCountry.upsert.mockResolvedValue(dbRecord);

      const result = await repository.upsertCountry(input);

      expect(mockPrisma.referenceCountry.upsert).toHaveBeenCalledWith({
        where: { iso2Code: 'EG' },
        update: {
          iso3Code: 'EGY',
          name: 'Egypt',
          officialName: undefined,
          region: undefined,
          subregion: undefined,
          defaultCurrencyCode: undefined,
          defaultLanguageCode: undefined,
          callingCode: undefined,
          flagAssetId: undefined,
          isActive: true,
          metadata: { key: 'value' }
        },
        create: {
          iso2Code: 'EG',
          iso3Code: 'EGY',
          name: 'Egypt',
          officialName: undefined,
          region: undefined,
          subregion: undefined,
          defaultCurrencyCode: undefined,
          defaultLanguageCode: undefined,
          callingCode: undefined,
          flagAssetId: undefined,
          isActive: true,
          metadata: { key: 'value' }
        }
      });

      expect(result.iso2Code).toBe('EG');
      expect(result.metadata).toEqual({ key: 'value' });
    });
  });

  describe('Currencies', () => {
    it('listCurrencies builds filters for activeOnly and q', async () => {
      const dbRecords = [
        {
          id: 'curr-1',
          isoCode: 'USD',
          numericCode: '840',
          name: 'US Dollar',
          symbol: '$',
          minorUnit: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.referenceCurrency.findMany.mockResolvedValue(dbRecords);

      const filters: ReferenceDataFilters = { activeOnly: true, q: 'USD' };
      const result = await repository.listCurrencies(filters);

      expect(mockPrisma.referenceCurrency.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'USD', mode: 'insensitive' } },
            { isoCode: { contains: 'USD', mode: 'insensitive' } },
            { symbol: { contains: 'USD', mode: 'insensitive' } },
            { numericCode: { contains: 'USD', mode: 'insensitive' } }
          ]
        },
        orderBy: { name: 'asc' }
      });

      expect(result).toEqual([
        {
          id: 'curr-1',
          isoCode: 'USD',
          numericCode: '840',
          name: 'US Dollar',
          symbol: '$',
          minorUnit: 2,
          isActive: true,
          metadata: undefined
        }
      ]);
    });

    it('getCurrency calls referenceCurrency.findUnique with isoCode', async () => {
      const dbRecord = {
        id: 'curr-1',
        isoCode: 'USD',
        numericCode: '840',
        name: 'US Dollar',
        symbol: '$',
        minorUnit: 2,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.referenceCurrency.findUnique.mockResolvedValue(dbRecord);

      const result = await repository.getCurrency('USD');
      expect(mockPrisma.referenceCurrency.findUnique).toHaveBeenCalledWith({
        where: { isoCode: 'USD' }
      });
      expect(result?.isoCode).toBe('USD');
    });

    it('upsertCurrency calls referenceCurrency.upsert using isoCode', async () => {
      const input: UpsertReferenceCurrencyDto = {
        isoCode: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isActive: true
      };

      const dbRecord = {
        id: 'curr-1',
        isoCode: 'USD',
        numericCode: null,
        name: 'US Dollar',
        symbol: '$',
        minorUnit: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.referenceCurrency.upsert.mockResolvedValue(dbRecord);

      const result = await repository.upsertCurrency(input);
      expect(mockPrisma.referenceCurrency.upsert).toHaveBeenCalledWith({
        where: { isoCode: 'USD' },
        update: {
          numericCode: undefined,
          name: 'US Dollar',
          symbol: '$',
          minorUnit: undefined,
          isActive: true,
          metadata: undefined
        },
        create: {
          isoCode: 'USD',
          numericCode: undefined,
          name: 'US Dollar',
          symbol: '$',
          minorUnit: undefined,
          isActive: true,
          metadata: undefined
        }
      });
      expect(result.isoCode).toBe('USD');
    });
  });

  describe('Languages', () => {
    it('listLanguages builds filters for activeOnly and q', async () => {
      const dbRecords = [
        {
          id: 'lang-1',
          isoCode: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          direction: 'RTL',
          isActive: true,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.referenceLanguage.findMany.mockResolvedValue(dbRecords);

      const filters: ReferenceDataFilters = { activeOnly: true, q: 'ar' };
      const result = await repository.listLanguages(filters);

      expect(mockPrisma.referenceLanguage.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'ar', mode: 'insensitive' } },
            { nativeName: { contains: 'ar', mode: 'insensitive' } },
            { isoCode: { contains: 'ar', mode: 'insensitive' } }
          ]
        },
        orderBy: { name: 'asc' }
      });

      expect(result).toEqual([
        {
          id: 'lang-1',
          isoCode: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          direction: 'RTL',
          isActive: true,
          metadata: undefined
        }
      ]);
    });

    it('getLanguage calls referenceLanguage.findUnique with isoCode', async () => {
      const dbRecord = {
        id: 'lang-1',
        isoCode: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'LTR',
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.referenceLanguage.findUnique.mockResolvedValue(dbRecord);

      const result = await repository.getLanguage('en');
      expect(mockPrisma.referenceLanguage.findUnique).toHaveBeenCalledWith({
        where: { isoCode: 'en' }
      });
      expect(result?.direction).toBe('LTR');
    });

    it('upsertLanguage calls referenceLanguage.upsert using isoCode', async () => {
      const input: UpsertReferenceLanguageDto = {
        isoCode: 'en',
        name: 'English',
        direction: 'LTR',
        isActive: true
      };

      const dbRecord = {
        id: 'lang-1',
        isoCode: 'en',
        name: 'English',
        nativeName: null,
        direction: 'LTR',
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.referenceLanguage.upsert.mockResolvedValue(dbRecord);

      const result = await repository.upsertLanguage(input);
      expect(mockPrisma.referenceLanguage.upsert).toHaveBeenCalledWith({
        where: { isoCode: 'en' },
        update: {
          name: 'English',
          nativeName: undefined,
          direction: 'LTR',
          isActive: true,
          metadata: undefined
        },
        create: {
          isoCode: 'en',
          name: 'English',
          nativeName: undefined,
          direction: 'LTR',
          isActive: true,
          metadata: undefined
        }
      });
      expect(result.direction).toBe('LTR');
    });
  });

  describe('Cities', () => {
    it('listCities builds filters for activeOnly, countryIso2Code, region, and q', async () => {
      const dbRecords = [
        {
          id: 'city-1',
          countryIso2Code: 'EG',
          name: 'Cairo',
          region: 'Cairo Governorate',
          timezone: 'Africa/Cairo',
          latitude: 30.0444,
          longitude: 31.2357,
          isActive: true,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.referenceCity.findMany.mockResolvedValue(dbRecords);

      const filters: ReferenceDataFilters = {
        activeOnly: true,
        countryIso2Code: 'EG',
        region: 'Cairo Governorate',
        q: 'Cai'
      };

      const result = await repository.listCities(filters);

      expect(mockPrisma.referenceCity.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          countryIso2Code: 'EG',
          region: 'Cairo Governorate',
          OR: [
            { name: { contains: 'Cai', mode: 'insensitive' } },
            { timezone: { contains: 'Cai', mode: 'insensitive' } }
          ]
        },
        include: { administrativeRegion: true },
        orderBy: { name: 'asc' }
      });

      expect(result).toEqual([
        {
          id: 'city-1',
          countryIso2Code: 'EG',
          name: 'Cairo',
          region: 'Cairo Governorate',
          administrativeRegionId: undefined,
          administrativeRegion: null,
          timezone: 'Africa/Cairo',
          latitude: 30.0444,
          longitude: 31.2357,
          isActive: true,
          metadata: undefined
        }
      ]);
    });

    it('upsertCity calls findFirst with countryIso2Code + name only when region is undefined', async () => {
      const input: UpsertReferenceCityDto = {
        countryIso2Code: 'EG',
        name: 'Cairo',
        isActive: true
      };

      mockPrisma.referenceCity.findFirst.mockResolvedValue(null);
      mockPrisma.referenceCity.create.mockResolvedValue({
        id: 'city-new',
        countryIso2Code: 'EG',
        name: 'Cairo',
        region: null,
        timezone: null,
        latitude: null,
        longitude: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await repository.upsertCity(input);

      expect(mockPrisma.referenceCity.findFirst).toHaveBeenCalledWith({
        where: {
          countryIso2Code: 'EG',
          name: 'Cairo'
        },
        include: { administrativeRegion: true }
      });
      expect(mockPrisma.referenceCity.create).toHaveBeenCalled();
    });

    it('upsertCity calls findFirst with countryIso2Code + name + region when region is defined', async () => {
      const input: UpsertReferenceCityDto = {
        countryIso2Code: 'EG',
        name: 'Cairo',
        region: 'Giza',
        isActive: true
      };

      mockPrisma.referenceCity.findFirst.mockResolvedValue(null);
      mockPrisma.referenceCity.create.mockResolvedValue({
        id: 'city-new',
        countryIso2Code: 'EG',
        name: 'Cairo',
        region: 'Giza',
        timezone: null,
        latitude: null,
        longitude: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await repository.upsertCity(input);

      expect(mockPrisma.referenceCity.findFirst).toHaveBeenCalledWith({
        where: {
          countryIso2Code: 'EG',
          name: 'Cairo',
          region: 'Giza'
        },
        include: { administrativeRegion: true }
      });
    });

    it('upsertCity updates by id when existing city is found', async () => {
      const input: UpsertReferenceCityDto = {
        countryIso2Code: 'EG',
        name: 'Cairo',
        timezone: 'Africa/Cairo',
        isActive: true
      };

      mockPrisma.referenceCity.findFirst.mockResolvedValue({
        id: 'city-existing',
        countryIso2Code: 'EG',
        name: 'Cairo',
        region: null,
        timezone: null,
        latitude: null,
        longitude: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockPrisma.referenceCity.update.mockResolvedValue({
        id: 'city-existing',
        countryIso2Code: 'EG',
        name: 'Cairo',
        region: null,
        timezone: 'Africa/Cairo',
        latitude: null,
        longitude: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await repository.upsertCity(input);

      expect(mockPrisma.referenceCity.update).toHaveBeenCalledWith({
        where: { id: 'city-existing' },
        include: { administrativeRegion: true },
        data: {
          timezone: 'Africa/Cairo',
          latitude: undefined,
          longitude: undefined,
          isActive: true,
          metadata: undefined
        }
      });
      expect(result.timezone).toBe('Africa/Cairo');
    });

    it('upsertCity creates a new record when no existing city is found', async () => {
      const input: UpsertReferenceCityDto = {
        countryIso2Code: 'EG',
        name: 'Alexandria',
        timezone: 'Africa/Cairo',
        isActive: true
      };

      mockPrisma.referenceCity.findFirst.mockResolvedValue(null);
      mockPrisma.referenceCity.create.mockResolvedValue({
        id: 'city-alex',
        countryIso2Code: 'EG',
        name: 'Alexandria',
        region: null,
        timezone: 'Africa/Cairo',
        latitude: null,
        longitude: null,
        isActive: true,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await repository.upsertCity(input);

      expect(mockPrisma.referenceCity.create).toHaveBeenCalledWith({
        include: { administrativeRegion: true },
        data: {
          countryIso2Code: 'EG',
          name: 'Alexandria',
          region: undefined,
          timezone: 'Africa/Cairo',
          latitude: undefined,
          longitude: undefined,
          isActive: true,
          metadata: undefined
        }
      });
      expect(result.name).toBe('Alexandria');
    });
  });
});
