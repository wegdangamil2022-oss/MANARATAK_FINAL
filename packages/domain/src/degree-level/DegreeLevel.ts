export const CANONICAL_DEGREE_LEVEL_CODES = [
  'ASSOCIATE',
  'DIPLOMA',
  'BACHELOR',
  'MASTER',
  'FELLOWSHIP',
  'DOCTORATE',
  'CERTIFICATE'
] as const;

export type CanonicalDegreeLevelCode = typeof CANONICAL_DEGREE_LEVEL_CODES[number];

export interface DegreeLevelReference {
  degreeLevelId: string;
  canonicalCode: CanonicalDegreeLevelCode;
}

export interface DegreeLevelDto {
  id: string;
  canonicalCode: CanonicalDegreeLevelCode;
  nameEn: string;
  nameAr: string;
  displayRank: number;
  status: string;
  aliases?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDegreeLevelDto {
  canonicalCode: CanonicalDegreeLevelCode;
  nameEn: string;
  nameAr: string;
  displayRank?: number;
  status?: string;
  aliases?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}
