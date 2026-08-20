export interface ReferenceDataFilters {
  activeOnly?: boolean;
  region?: string;
  countryIso2Code?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface ReferenceCountryDto {
  id?: string;
  iso2Code: string;
  iso3Code: string;
  name: string;
  nameAr?: string | null;
  officialName?: string | null;
  region?: string | null;
  subregion?: string | null;
  defaultCurrencyCode?: string | null;
  defaultLanguageCode?: string | null;
  callingCode?: string | null;
  flagAssetId?: string | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpsertReferenceCountryDto {
  iso2Code: string;
  iso3Code: string;
  name: string;
  nameAr?: string | null;
  officialName?: string | null;
  region?: string | null;
  subregion?: string | null;
  defaultCurrencyCode?: string | null;
  defaultLanguageCode?: string | null;
  callingCode?: string | null;
  flagAssetId?: string | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ReferenceCurrencyDto {
  id?: string;
  isoCode: string;
  numericCode?: string | null;
  name: string;
  nameAr?: string | null;
  symbol?: string | null;
  minorUnit?: number | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpsertReferenceCurrencyDto {
  isoCode: string;
  numericCode?: string | null;
  name: string;
  nameAr?: string | null;
  symbol?: string | null;
  minorUnit?: number | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ReferenceLanguageDto {
  id?: string;
  isoCode: string;
  name: string;
  nameAr?: string | null;
  nativeName?: string | null;
  direction: 'LTR' | 'RTL';
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpsertReferenceLanguageDto {
  isoCode: string;
  name: string;
  nameAr?: string | null;
  nativeName?: string | null;
  direction: 'LTR' | 'RTL';
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AdministrativeRegionDto {
  id: string;
  countryIso2Code: string;
  regionCode: string;
  name: string;
  nameAr?: string | null;
  localName?: string | null;
  regionType?: string | null;
}

export interface ReferenceCityDto {
  id: string;
  countryIso2Code: string;
  name: string;
  nameAr?: string | null;
  region?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  administrativeRegionId?: string | null;
  administrativeRegion?: AdministrativeRegionDto | null;
}

export interface UpsertReferenceCityDto {
  countryIso2Code: string;
  name: string;
  nameAr?: string | null;
  region?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  administrativeRegionId?: string | null;
}
