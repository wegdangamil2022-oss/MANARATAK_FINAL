import {
  CmsCategoryDto,
  CmsContentDto,
  CmsContentFilters,
  CmsLocalizedContentDto,
  CreateCmsCategoryDto,
  CreateCmsContentDto,
  PaginatedCmsResult,
  PublicCmsContentDto,
  UpdateCmsContentDto,
  UpsertCmsLocalizedContentDto
} from '../entities/CmsContent';
import { CmsContentStatus } from '../enums/CmsContentStatus';

export interface ICmsRepository {
  createContent(data: CreateCmsContentDto): Promise<CmsContentDto>;
  updateContent(id: string, data: UpdateCmsContentDto): Promise<CmsContentDto>;
  findContentById(id: string): Promise<CmsContentDto | null>;
  findContentBySlug(slug: string): Promise<CmsContentDto | null>;
  updateStatus(id: string, status: CmsContentStatus, publishedAt?: Date | null): Promise<CmsContentDto>;
  listContent(filters: CmsContentFilters): Promise<PaginatedCmsResult<CmsContentDto>>;
  listPublished(filters: CmsContentFilters, locale?: string): Promise<PaginatedCmsResult<PublicCmsContentDto>>;
  getPublishedBySlug(slug: string, locale?: string): Promise<PublicCmsContentDto | null>;

  upsertLocalizedContent(data: UpsertCmsLocalizedContentDto): Promise<CmsLocalizedContentDto>;
  listLocalizedContent(contentId: string): Promise<CmsLocalizedContentDto[]>;

  createCategory(data: CreateCmsCategoryDto): Promise<CmsCategoryDto>;
  listCategories(): Promise<CmsCategoryDto[]>;
}
