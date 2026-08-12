import {
  CanonicalReference,
  IReferenceDataRepository,
  IReferenceResolver,
  ReferenceLookup
} from '@manaratak/domain';

export class ReferenceResolverService implements IReferenceResolver {
  constructor(private readonly repository: IReferenceDataRepository) {}

  public async resolveCountry(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listCountries({ activeOnly: false });
    const record = records.find((item) =>
      item.id === lookup.id ||
      item.iso2Code.toUpperCase() === lookup.standardCode?.toUpperCase() ||
      item.iso3Code.toUpperCase() === lookup.standardCode?.toUpperCase()
    );
    return record?.id ? { id: record.id, type: 'COUNTRY', standardCode: record.iso2Code, active: record.isActive } : null;
  }

  public async resolveRegion(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listRegions({});
    const record = records.find((item) =>
      item.id === lookup.id || item.regionCode.toUpperCase() === lookup.standardCode?.toUpperCase()
    );
    return record ? { id: record.id, type: 'REGION', standardCode: record.regionCode, active: null } : null;
  }

  public async resolveCity(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    if (!lookup.id) return null;
    const record = (await this.repository.listCities({ activeOnly: false })).find((item) => item.id === lookup.id);
    return record ? { id: record.id, type: 'CITY', active: record.isActive } : null;
  }

  public async resolveLanguage(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listLanguages({ activeOnly: false });
    const record = records.find((item) =>
      item.id === lookup.id || item.isoCode.toLowerCase() === lookup.standardCode?.toLowerCase()
    );
    return record?.id ? { id: record.id, type: 'LANGUAGE', standardCode: record.isoCode, active: record.isActive } : null;
  }

  public async resolveCurrency(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listCurrencies({ activeOnly: false });
    const record = records.find((item) =>
      item.id === lookup.id || item.isoCode.toUpperCase() === lookup.standardCode?.toUpperCase()
    );
    return record?.id ? { id: record.id, type: 'CURRENCY', standardCode: record.isoCode, active: record.isActive } : null;
  }
}
