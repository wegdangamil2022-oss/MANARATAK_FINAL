import {
  CmsCategoryDto,
  CmsAnnouncementDto,
  CmsBlockSchemaDto,
  CmsContentBlockDto,
  CmsContentDetailDto,
  CmsContentDto,
  CmsContentFilters,
  CmsContentRevisionDto,
  CmsNavigationMenuDto,
  CmsLocalizedContentDto,
  CmsPublishingReadinessDto,
  CmsRedirectDto,
  CmsScheduleResultDto,
  CmsSlugChangeDto,
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

export interface ICmsDeliveryCache {
  getPublished(siteIdentifier: string, locale: string, slug: string): Promise<PublicCmsContentDto | null>;
  setPublished(content: PublicCmsContentDto): Promise<void>;
  invalidateSite(siteIdentifier: string, reason: string): Promise<void>;
}

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
  cancelSchedule(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto>;
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
  getPublishedBySlug(slug: string, locale?: string, siteIdentifier?: string): Promise<PublicCmsContentDto | null>;
  changeLocalizedSlug(data: CmsSlugChangeDto): Promise<CmsLocalizedContentDto>;
  listRedirects(siteIdentifier?: string, locale?: string): Promise<CmsRedirectDto[]>;
  createRedirect(data: Omit<CmsRedirectDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<CmsRedirectDto>;
  listNavigation(siteIdentifier: string, locale: string): Promise<CmsNavigationMenuDto[]>;
  saveNavigation(data: Omit<CmsNavigationMenuDto, 'id' | 'version' | 'createdAt' | 'updatedAt'> & { id?: string; expectedVersion?: number }): Promise<CmsNavigationMenuDto>;
  listBlockSchemas(): Promise<CmsBlockSchemaDto[]>;
  createBlockSchema(data: Omit<CmsBlockSchemaDto, 'id' | 'createdAt'>): Promise<CmsBlockSchemaDto>;
  listBlocks(siteIdentifier: string, locale: string): Promise<CmsContentBlockDto[]>;
  saveBlock(data: Omit<CmsContentBlockDto, 'id' | 'publicId' | 'version' | 'createdAt' | 'updatedAt'> & { id?: string; expectedVersion?: number }): Promise<CmsContentBlockDto>;
  listAnnouncements(siteIdentifier: string, locale: string, publicOnly?: boolean): Promise<CmsAnnouncementDto[]>;
  saveAnnouncement(data: Omit<CmsAnnouncementDto, 'id' | 'publicId' | 'version' | 'createdAt' | 'updatedAt'> & { id?: string; expectedVersion?: number }): Promise<CmsAnnouncementDto>;
  processDueSchedules(actorId: string, now: Date, limit?: number): Promise<CmsScheduleResultDto>;
}
