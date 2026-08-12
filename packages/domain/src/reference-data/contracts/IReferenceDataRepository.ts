import {
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
} from '../dto/ReferenceDataContracts';

export interface IReferenceDataRepository {
  listCountries(filters: ReferenceDataFilters): Promise<ReferenceCountryDto[]>;
  listCurrencies(filters: ReferenceDataFilters): Promise<ReferenceCurrencyDto[]>;
  listLanguages(filters: ReferenceDataFilters): Promise<ReferenceLanguageDto[]>;
  listCities(filters: ReferenceDataFilters): Promise<ReferenceCityDto[]>;
  listRegions(filters: ReferenceDataFilters): Promise<AdministrativeRegionDto[]>;

  getCountry(iso2Code: string): Promise<ReferenceCountryDto | null>;
  getCurrency(isoCode: string): Promise<ReferenceCurrencyDto | null>;
  getLanguage(isoCode: string): Promise<ReferenceLanguageDto | null>;
  getRegionById(id: string): Promise<AdministrativeRegionDto | null>;
  
  upsertCountry(data: UpsertReferenceCountryDto): Promise<ReferenceCountryDto>;
  upsertCurrency(data: UpsertReferenceCurrencyDto): Promise<ReferenceCurrencyDto>;
  upsertLanguage(data: UpsertReferenceLanguageDto): Promise<ReferenceLanguageDto>;
  upsertCity(data: UpsertReferenceCityDto): Promise<ReferenceCityDto>;
}
