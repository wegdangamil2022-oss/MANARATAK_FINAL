import { describe, expect, it, vi } from 'vitest';
import { IReferenceDataRepository } from '@manaratak/domain';
import { ReferenceResolverService } from '../../src/reference-data/services/ReferenceResolverService';

describe('ReferenceResolverService canonical contract', () => {
  const repository: IReferenceDataRepository = {
    listCountries: vi.fn(async () => [
      {
        id: 'country-sa',
        iso2Code: 'SA',
        iso3Code: 'SAU',
        name: 'Saudi Arabia',
        isActive: true,
        metadata: {
          aliases: ['Kingdom of Saudi Arabia', 'KSA'],
          providerMappings: [{ providerSystem: 'restcountries', providerId: '682' }],
        },
      },
      {
        id: 'country-c1',
        iso2Code: 'C1',
        iso3Code: 'C01',
        name: 'Ambiguous One',
        isActive: true,
        metadata: { aliases: ['Shared Alias'] },
      },
      {
        id: 'country-c2',
        iso2Code: 'C2',
        iso3Code: 'C02',
        name: 'Ambiguous Two',
        isActive: true,
        metadata: { aliases: ['Shared Alias'] },
      },
    ]),
    listRegions: vi.fn(async () => [{ id: 'region-riyadh', countryIso2Code: 'SA', regionCode: 'SA-01', name: 'Riyadh' }]),
    listCities: vi.fn(async () => [{ id: 'city-riyadh', countryIso2Code: 'SA', name: 'Riyadh', isActive: true }]),
    listLanguages: vi.fn(async () => [{ id: 'language-ar', isoCode: 'ar', name: 'Arabic', direction: 'RTL', isActive: true }]),
    listCurrencies: vi.fn(async () => [{ id: 'currency-sar', isoCode: 'SAR', name: 'Saudi Riyal', isActive: true }]),
    getCountry: vi.fn(),
    getCurrency: vi.fn(),
    getLanguage: vi.fn(),
    getRegionById: vi.fn(),
    upsertCountry: vi.fn(),
    upsertCurrency: vi.fn(),
    upsertLanguage: vi.fn(),
    upsertCity: vi.fn(),
  } as unknown as IReferenceDataRepository;
  const resolver = new ReferenceResolverService(repository);

  it('resolves Country and Region by stable standard code', async () => {
    await expect(resolver.resolveCountry({ standardCode: 'sau' })).resolves.toMatchObject({ id: 'country-sa', type: 'COUNTRY', standardCode: 'SA', active: true, resolutionMethod: 'EXACT_STANDARD_CODE' });
    await expect(resolver.resolveRegion({ standardCode: 'sa-01' })).resolves.toMatchObject({ id: 'region-riyadh', type: 'REGION', standardCode: 'SA-01', resolutionMethod: 'EXACT_STANDARD_CODE' });
  });

  it('resolves City by canonical identity without name-only matching', async () => {
    await expect(resolver.resolveCity({ id: 'city-riyadh' })).resolves.toMatchObject({ id: 'city-riyadh', type: 'CITY', active: true, resolutionMethod: 'EXACT_ID' });
    await expect(resolver.resolveCity({ alias: 'Riyadh' })).resolves.toBeNull();
  });

  it('resolves Language and Currency case-insensitively without defaults', async () => {
    await expect(resolver.resolveLanguage({ standardCode: 'AR' })).resolves.toMatchObject({ id: 'language-ar', type: 'LANGUAGE' });
    await expect(resolver.resolveCurrency({ standardCode: 'sar' })).resolves.toMatchObject({ id: 'currency-sar', type: 'CURRENCY' });
    await expect(resolver.resolveCurrency({ standardCode: 'USD' })).resolves.toBeNull();
  });

  it('resolves provider IDs before normalized aliases and sends ambiguous aliases to review', async () => {
    await expect(resolver.resolveCountry({ providerSystem: 'RESTCOUNTRIES', providerId: '682' })).resolves.toMatchObject({
      id: 'country-sa',
      resolutionMethod: 'PROVIDER_MAPPING',
    });
    await expect(resolver.resolveCountry({ alias: 'kingdom-of-saudi arabia' })).resolves.toMatchObject({
      id: 'country-sa',
      resolutionMethod: 'NORMALIZED_ALIAS',
    });
    await expect(resolver.resolveCountry({ alias: 'shared alias' })).resolves.toBeNull();
  });
});
