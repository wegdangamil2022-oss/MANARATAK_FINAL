import { randomUUID } from 'node:crypto';
import {
  CmsCategoryDto,
  CmsContentDetailDto,
  CmsContentDto,
  CmsContentFilters,
  CmsContentRevisionDto,
  CmsContentStatus,
  CmsContentType,
  CmsLocalizedContentDto,
  CmsPublishingPolicy,
  CmsPublishingReadinessDto,
  CmsTagDto,
  CreateCmsCategoryDto,
  CreateCmsContentDto,
  CreateCmsTagDto,
  ICmsRepository,
  PaginatedCmsResult,
  PublicCmsContentDto,
  UpdateCmsContentDto,
  UpsertCmsLocalizedContentDto,
} from '@manaratak/domain';

type CreateContentInput = Omit<
  CreateCmsContentDto,
  'publicId' | 'status' | 'authorId' | 'ownerId'
> & { ownerId?: string };

export class AdminCmsUseCases {
  public constructor(private readonly repository: ICmsRepository) {}

  public async createContent(data: CreateContentInput, actorId: string): Promise<CmsContentDto> {
    this.ensureActor(actorId);
    CmsPublishingPolicy.assertSlug(data.slug);
    this.ensureAssetHandles([data.featuredAssetId, data.seoMetadata?.openGraphAssetId]);
    return this.repository.createContent({
      ...data,
      publicId: `cms-${randomUUID()}`,
      status: CmsContentStatus.DRAFT,
      authorId: actorId,
      ownerId: data.ownerId ?? actorId,
    });
  }

  public async updateContent(
    id: string,
    data: UpdateCmsContentDto,
    actorId: string,
  ): Promise<CmsContentDto> {
    this.ensureActor(actorId);
    if (data.slug) CmsPublishingPolicy.assertSlug(data.slug);
    this.ensureAssetHandles([data.featuredAssetId, data.seoMetadata?.openGraphAssetId]);
    return this.repository.updateContent(id, data, actorId);
  }

  public async listContent(filters: CmsContentFilters): Promise<PaginatedCmsResult<CmsContentDto>> {
    return this.repository.listContent(filters);
  }

  public async getContent(id: string): Promise<CmsContentDetailDto> {
    const content = await this.repository.getContentDetail(id);
    if (!content) throw new Error('CMS_CONTENT_NOT_FOUND');
    return content;
  }

  public async upsertLocalizedContent(
    data: Omit<UpsertCmsLocalizedContentDto, 'actorId'>,
    actorId: string,
  ): Promise<CmsLocalizedContentDto> {
    this.ensureActor(actorId);
    CmsPublishingPolicy.assertSlug(data.localizedSlug);
    if (!data.body.trim()) throw new Error('CMS_LOCALIZED_BODY_REQUIRED');
    this.ensureAssetHandles([
      data.featuredAssetId,
      data.seoMetadata?.openGraphAssetId,
      ...(data.attachmentAssetIds ?? []),
    ]);
    return this.repository.upsertLocalizedContent({ ...data, actorId });
  }

  public async getReadiness(contentId: string, locale: string): Promise<CmsPublishingReadinessDto> {
    return this.repository.getReadiness(contentId, locale);
  }

  public async submitForReview(
    contentId: string,
    locale: string,
    actorId: string,
    expectedVersion?: number,
    comments?: string | null,
  ): Promise<CmsLocalizedContentDto> {
    const readiness = await this.repository.getReadiness(contentId, locale);
    if (!readiness.ready) throw new Error(`CMS_NOT_READY:${readiness.missing.join(',')}`);
    return this.repository.submitForReview({
      contentId,
      locale,
      actorId,
      expectedVersion,
      comments,
    });
  }

  public async approveReview(
    contentId: string,
    locale: string,
    actorId: string,
    expectedVersion?: number,
    comments?: string | null,
  ): Promise<CmsLocalizedContentDto> {
    this.ensureActor(actorId);
    return this.repository.approveReview({
      contentId,
      locale,
      actorId,
      expectedVersion,
      comments,
    });
  }

  public async rejectReview(
    contentId: string,
    locale: string,
    actorId: string,
    comments: string,
    expectedVersion?: number,
  ): Promise<CmsLocalizedContentDto> {
    if (!comments.trim()) throw new Error('CMS_REJECTION_REASON_REQUIRED');
    return this.repository.rejectReview({
      contentId,
      locale,
      actorId,
      expectedVersion,
      comments,
    });
  }

  public async schedule(
    contentId: string,
    locale: string,
    actorId: string,
    scheduledAt: Date,
    expectedVersion?: number,
  ): Promise<CmsLocalizedContentDto> {
    if (scheduledAt.getTime() <= Date.now()) throw new Error('CMS_SCHEDULE_MUST_BE_FUTURE');
    return this.repository.schedule({
      contentId,
      locale,
      actorId,
      expectedVersion,
      scheduledAt,
    });
  }

  public async publish(
    contentId: string,
    locale: string,
    actorId: string,
    expectedVersion?: number,
  ): Promise<CmsLocalizedContentDto> {
    const readiness = await this.repository.getReadiness(contentId, locale);
    if (!readiness.ready) throw new Error(`CMS_NOT_READY:${readiness.missing.join(',')}`);
    return this.repository.publish({ contentId, locale, actorId, expectedVersion });
  }

  public async archive(
    contentId: string,
    locale: string,
    actorId: string,
    expectedVersion?: number,
  ): Promise<CmsLocalizedContentDto> {
    return this.repository.archive({ contentId, locale, actorId, expectedVersion });
  }

  public async listRevisions(contentId: string, locale: string): Promise<CmsContentRevisionDto[]> {
    return this.repository.listRevisions(contentId, locale);
  }

  public async restoreRevision(
    contentId: string,
    locale: string,
    revisionId: string,
    actorId: string,
    expectedVersion?: number,
  ): Promise<CmsLocalizedContentDto> {
    return this.repository.restoreRevision({
      contentId,
      locale,
      revisionId,
      actorId,
      expectedVersion,
    });
  }

  public async createCategory(
    data: CreateCmsCategoryDto,
    actorId: string,
  ): Promise<CmsCategoryDto> {
    CmsPublishingPolicy.assertSlug(data.slug);
    return this.repository.createCategory(data, actorId);
  }

  public async listCategories(): Promise<CmsCategoryDto[]> {
    return this.repository.listCategories();
  }

  public async createTag(data: CreateCmsTagDto, actorId: string): Promise<CmsTagDto> {
    if (!data.normalizedValue.trim()) throw new Error('CMS_TAG_REQUIRED');
    return this.repository.createTag(
      { ...data, normalizedValue: data.normalizedValue.trim().toLocaleLowerCase('en') },
      actorId,
    );
  }

  public async listTags(): Promise<CmsTagDto[]> {
    return this.repository.listTags();
  }

  private ensureAssetHandles(assetIds: Array<string | null | undefined>): void {
    for (const assetId of assetIds) CmsPublishingPolicy.assertAssetHandle(assetId);
  }

  private ensureActor(actorId: string): void {
    if (!actorId.trim()) throw new Error('CMS_AUTHENTICATED_ACTOR_REQUIRED');
  }
}

export class PublicCmsUseCases {
  public constructor(private readonly repository: ICmsRepository) {}

  public async listPublished(
    filters: CmsContentFilters,
    locale?: string,
  ): Promise<PaginatedCmsResult<PublicCmsContentDto>> {
    return this.repository.listPublished(filters, locale);
  }

  public async getBySlug(slug: string, locale?: string): Promise<PublicCmsContentDto> {
    const content = await this.repository.getPublishedBySlug(slug, locale);
    if (!content) throw new Error('CMS_CONTENT_NOT_FOUND');
    return content;
  }
}

export const CmsContentTypeValues = Object.values(CmsContentType);
