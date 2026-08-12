import { CmsCategoryStatus } from '../enums/CmsCategoryStatus';
import { CmsContentStatus } from '../enums/CmsContentStatus';
import { CmsContentType } from '../enums/CmsContentType';

export interface CreateCmsContentDto {
  publicId: string;
  slug: string;
  contentType: CmsContentType;
  status: CmsContentStatus;
  title: string;
  summary?: string | null;
  categorySlug?: string | null;
  featuredAssetId?: string | null;
  seoMetadata?: Record<string, unknown> | null;
  editorialMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  publishedAt?: Date | null;
}

export interface UpdateCmsContentDto {
  slug?: string;
  contentType?: CmsContentType;
  status?: CmsContentStatus;
  title?: string;
  summary?: string | null;
  categorySlug?: string | null;
  featuredAssetId?: string | null;
  seoMetadata?: Record<string, unknown> | null;
  editorialMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  publishedAt?: Date | null;
}

export interface CmsContentDto extends CreateCmsContentDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertCmsLocalizedContentDto {
  contentId: string;
  locale: string;
  title: string;
  summary?: string | null;
  body: string;
  readingTimeMinutes?: number | null;
  seoMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface CmsLocalizedContentDto extends UpsertCmsLocalizedContentDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCmsCategoryDto {
  slug: string;
  name: string;
  description?: string | null;
  status: CmsCategoryStatus;
  metadata?: Record<string, unknown> | null;
}

export interface CmsCategoryDto extends CreateCmsCategoryDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CmsContentFilters {
  status?: CmsContentStatus;
  contentType?: CmsContentType;
  categorySlug?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PublicCmsContentDto {
  publicId: string;
  slug: string;
  contentType: CmsContentType;
  title: string;
  summary?: string | null;
  categorySlug?: string | null;
  featuredAssetId?: string | null;
  publishedAt?: Date | null;
  localizedPayload?: CmsLocalizedContentDto | null;
  seoMetadata?: Record<string, unknown> | null;
}

export interface PaginatedCmsResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
