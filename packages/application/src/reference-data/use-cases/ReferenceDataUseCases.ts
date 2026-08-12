import {
  IReferenceDataRepository,
  ReferenceCityDto,
  ReferenceCountryDto,
  ReferenceCurrencyDto,
  ReferenceDataFilters,
  ReferenceLanguageDto,
  UpsertReferenceCityDto,
  UpsertReferenceCountryDto,
  UpsertReferenceCurrencyDto,
  UpsertReferenceLanguageDto
} from '@manaratak/domain';

export class ReferenceDataUseCases {
  constructor(private readonly repository: IReferenceDataRepository) {}

  public listCountries(filters: ReferenceDataFilters = {}): Promise<ReferenceCountryDto[]> {
    return this.repository.listCountries({ activeOnly: true, ...filters });
  }

  public listCurrencies(filters: ReferenceDataFilters = {}): Promise<ReferenceCurrencyDto[]> {
    return this.repository.listCurrencies({ activeOnly: true, ...filters });
  }

  public listLanguages(filters: ReferenceDataFilters = {}): Promise<ReferenceLanguageDto[]> {
    return this.repository.listLanguages({ activeOnly: true, ...filters });
  }

  public listCities(filters: ReferenceDataFilters = {}): Promise<ReferenceCityDto[]> {
    return this.repository.listCities({ activeOnly: true, ...filters });
  }

  public async getCountry(iso2Code: string): Promise<ReferenceCountryDto> {
    const country = await this.repository.getCountry(iso2Code);
    if (!country || !country.isActive) {
      throw new Error(`Country not found: ${iso2Code}`);
    }
    return country;
  }

  public async getCurrency(isoCode: string): Promise<ReferenceCurrencyDto> {
    const currency = await this.repository.getCurrency(isoCode);
    if (!currency || !currency.isActive) {
      throw new Error(`Currency not found: ${isoCode}`);
    }
    return currency;
  }

  public async getLanguage(isoCode: string): Promise<ReferenceLanguageDto> {
    const language = await this.repository.getLanguage(isoCode);
    if (!language || !language.isActive) {
      throw new Error(`Language not found: ${isoCode}`);
    }
    return language;
  }

  public upsertCountry(data: UpsertReferenceCountryDto): Promise<ReferenceCountryDto> {
    return this.repository.upsertCountry(data);
  }

  public upsertCurrency(data: UpsertReferenceCurrencyDto): Promise<ReferenceCurrencyDto> {
    return this.repository.upsertCurrency(data);
  }

  public upsertLanguage(data: UpsertReferenceLanguageDto): Promise<ReferenceLanguageDto> {
    return this.repository.upsertLanguage(data);
  }

  public async upsertCity(data: UpsertReferenceCityDto): Promise<ReferenceCityDto> {
    const country = await this.repository.getCountry(data.countryIso2Code);
    if (!country || !country.isActive) {
      throw new Error(`Active canonical country not found: ${data.countryIso2Code}`);
    }
    if (data.administrativeRegionId) {
      const region = await this.repository.getRegionById(data.administrativeRegionId);
      if (!region) {
        throw new Error(`Canonical region not found: ${data.administrativeRegionId}`);
      }
      if (region.countryIso2Code !== country.iso2Code) {
        throw new Error('City administrative region must belong to the selected country.');
      }
    }
    return this.repository.upsertCity(data);
  }
}
