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
    const result = this.resolveFrom(records, lookup, (item) => [item.iso2Code, item.iso3Code]);
    return result?.record.id ? { id: result.record.id, type: 'COUNTRY', standardCode: result.record.iso2Code, active: result.record.isActive, resolutionMethod: result.method } : null;
  }

  public async resolveRegion(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listRegions({});
    const result = this.resolveFrom(records, lookup, (item) => [item.regionCode]);
    return result ? { id: result.record.id, type: 'REGION', standardCode: result.record.regionCode, active: null, resolutionMethod: result.method } : null;
  }

  public async resolveCity(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listCities({ activeOnly: false });
    const result = this.resolveFrom(records, lookup, () => []);
    return result ? { id: result.record.id, type: 'CITY', active: result.record.isActive, resolutionMethod: result.method } : null;
  }

  public async resolveLanguage(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listLanguages({ activeOnly: false });
    const result = this.resolveFrom(records, lookup, (item) => [item.isoCode]);
    return result?.record.id ? { id: result.record.id, type: 'LANGUAGE', standardCode: result.record.isoCode, active: result.record.isActive, resolutionMethod: result.method } : null;
  }

  public async resolveCurrency(lookup: ReferenceLookup): Promise<CanonicalReference | null> {
    const records = await this.repository.listCurrencies({ activeOnly: false });
    const result = this.resolveFrom(records, lookup, (item) => [item.isoCode]);
    return result?.record.id ? { id: result.record.id, type: 'CURRENCY', standardCode: result.record.isoCode, active: result.record.isActive, resolutionMethod: result.method } : null;
  }

  private resolveFrom<T extends { id?: string; metadata?: Record<string, unknown> }>(
    records: T[],
    lookup: ReferenceLookup,
    standardCodes: (record: T) => Array<string | null | undefined>,
  ): { record: T; method: NonNullable<CanonicalReference['resolutionMethod']> } | null {
    if (lookup.id) {
      const exact = records.find((item) => item.id === lookup.id);
      if (exact) return { record: exact, method: 'EXACT_ID' };
    }

    if (lookup.standardCode) {
      const expected = lookup.standardCode.trim().toUpperCase();
      const exact = records.find((item) =>
        standardCodes(item).some((code) => code?.trim().toUpperCase() === expected),
      );
      if (exact) return { record: exact, method: 'EXACT_STANDARD_CODE' };
    }

    if (lookup.providerSystem && lookup.providerId) {
      const expectedSystem = this.normalizeProviderKey(lookup.providerSystem);
      const expectedId = this.normalizeProviderKey(lookup.providerId);
      const matches = records.filter((item) =>
        this.providerMappings(item.metadata).some((mapping) =>
          this.normalizeProviderKey(mapping.providerSystem) === expectedSystem &&
          this.normalizeProviderKey(mapping.providerId) === expectedId,
        ),
      );
      if (matches.length === 1) return { record: matches[0], method: 'PROVIDER_MAPPING' };
      if (matches.length > 1) return null;
    }

    const alias = lookup.normalizedAlias || lookup.alias;
    if (alias) {
      const expectedAlias = this.normalizeAlias(alias);
      const matches = records.filter((item) => this.aliases(item.metadata).includes(expectedAlias));
      if (matches.length === 1) return { record: matches[0], method: 'NORMALIZED_ALIAS' };
    }

    return null;
  }

  private providerMappings(metadata: Record<string, unknown> | undefined): Array<{ providerSystem: string; providerId: string }> {
    const raw = metadata?.providerMappings;
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      const providerSystem = typeof record.providerSystem === 'string' ? record.providerSystem : '';
      const providerId = typeof record.providerId === 'string' ? record.providerId : '';
      return providerSystem && providerId ? [{ providerSystem, providerId }] : [];
    });
  }

  private aliases(metadata: Record<string, unknown> | undefined): string[] {
    const raw = metadata?.aliases;
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is string => typeof item === 'string').map((item) => this.normalizeAlias(item));
  }

  private normalizeAlias(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private normalizeProviderKey(value: string): string {
    return value.trim().toLowerCase();
  }
}
