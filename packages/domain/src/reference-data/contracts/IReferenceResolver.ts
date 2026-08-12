export type CanonicalReferenceType = 'COUNTRY' | 'REGION' | 'CITY' | 'LANGUAGE' | 'CURRENCY';

export interface ReferenceLookup {
  id?: string;
  standardCode?: string;
}

export interface CanonicalReference {
  id: string;
  type: CanonicalReferenceType;
  standardCode?: string;
  active: boolean | null;
}

export interface IReferenceResolver {
  resolveCountry(lookup: ReferenceLookup): Promise<CanonicalReference | null>;
  resolveRegion(lookup: ReferenceLookup): Promise<CanonicalReference | null>;
  resolveCity(lookup: ReferenceLookup): Promise<CanonicalReference | null>;
  resolveLanguage(lookup: ReferenceLookup): Promise<CanonicalReference | null>;
  resolveCurrency(lookup: ReferenceLookup): Promise<CanonicalReference | null>;
}
