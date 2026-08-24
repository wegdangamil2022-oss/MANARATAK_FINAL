import {
  CmsCategoryDto,
  CmsContentDetailDto,
  CmsContentDto,
  CmsContentFilters,
  CmsContentRevisionDto,
  CmsLocalizedContentDto,
  CmsPublishingReadinessDto,
  CmsRestoreRevisionDto,
  CmsTagDto,
  CmsWorkflowCommandDto,
  CreateCmsCategoryDto,
  CreateCmsContentDto,
  CreateCmsTagDto,
  PaginatedCmsResult,
  PublicCmsContentDto,
  UpdateCmsContentDto,
  UpsertCmsLocalizedContentDto,
} from '../entities/CmsContent';

export interface ICmsRepository {
  createContent(data: CreateCmsContentDto): Promise<CmsContentDto>;
  updateContent(id: string, data: UpdateCmsContentDto, actorId: string): Promise<CmsContentDto>;
  findContentById(id: string): Promise<CmsContentDto | null>;
  getContentDetail(id: string): Promise<CmsContentDetailDto | null>;
  findContentBySlug(slug: string): Promise<CmsContentDto | null>;
  listContent(filters: CmsContentFilters): Promise<PaginatedCmsResult<CmsContentDto>>;

  upsertLocalizedContent(data: UpsertCmsLocalizedContentDto): Promise<CmsLocalizedContentDto>;
  listLocalizedContent(contentId: string): Promise<CmsLocalizedContentDto[]>;
  getReadiness(contentId: string, locale: string): Promise<CmsPublishingReadinessDto>;
  submitForReview(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;
  approveReview(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;
  rejectReview(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;
  schedule(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;
  publish(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;
  archive(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;

  listRevisions(contentId: string, locale: string): Promise<CmsContentRevisionDto[]>;
  restoreRevision(data: CmsRestoreRevisionDto): Promise<CmsLocalizedContentDto>;

  createCategory(data: CreateCmsCategoryDto, actorId: string): Promise<CmsCategoryDto>;
  listCategories(): Promise<CmsCategoryDto[]>;
  createTag(data: CreateCmsTagDto, actorId: string): Promise<CmsTagDto>;
  listTags(): Promise<CmsTagDto[]>;

  listPublished(
    filters: CmsContentFilters,
    locale?: string,
  ): Promise<PaginatedCmsResult<PublicCmsContentDto>>;
  getPublishedBySlug(slug: string, locale?: string): Promise<PublicCmsContentDto | null>;
}
