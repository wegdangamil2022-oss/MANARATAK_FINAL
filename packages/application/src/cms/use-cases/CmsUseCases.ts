import { randomUUID } from 'crypto';
import {
  CmsCategoryDto,
  CmsContentDto,
  CmsContentFilters,
  CmsContentStatus,
  CmsContentType,
  CreateCmsCategoryDto,
  CreateCmsContentDto,
  ICmsRepository,
  PaginatedCmsResult,
  PublicCmsContentDto,
  UpdateCmsContentDto,
  UpsertCmsLocalizedContentDto
} from '@manaratak/domain';

export class AdminCmsUseCases {
  constructor(private readonly repository: ICmsRepository) {}

  public async createContent(data: Omit<CreateCmsContentDto, 'publicId' | 'status'> & { status?: CmsContentStatus }): Promise<CmsContentDto> {
    this.ensureNoRawAssetUrl(data.featuredAssetId);
    return this.repository.createContent({
      ...data,
      publicId: `cms-${randomUUID()}`,
      status: data.status || CmsContentStatus.DRAFT
    });
  }

  public async updateContent(id: string, data: UpdateCmsContentDto): Promise<CmsContentDto> {
    this.ensureNoRawAssetUrl(data.featuredAssetId);
    return this.repository.updateContent(id, data);
  }

  public async listContent(filters: CmsContentFilters): Promise<PaginatedCmsResult<CmsContentDto>> {
    return this.repository.listContent(filters);
  }

  public async getContent(id: string): Promise<CmsContentDto> {
    const content = await this.repository.findContentById(id);
    if (!content) {
      throw new Error('CMS content not found');
    }
    return content;
  }

  public async upsertLocalizedContent(data: UpsertCmsLocalizedContentDto) {
    if (!data.body.trim()) {
      throw new Error('Localized content body is required');
    }
    return this.repository.upsertLocalizedContent(data);
  }

  public async publish(id: string): Promise<CmsContentDto> {
    const localized = await this.repository.listLocalizedContent(id);
    if (localized.length === 0) {
      throw new Error('Cannot publish CMS content before adding at least one localized payload');
    }
    return this.repository.updateStatus(id, CmsContentStatus.PUBLISHED, new Date());
  }

  public async archive(id: string): Promise<CmsContentDto> {
    return this.repository.updateStatus(id, CmsContentStatus.ARCHIVED, null);
  }

  public async createCategory(data: CreateCmsCategoryDto): Promise<CmsCategoryDto> {
    return this.repository.createCategory(data);
  }

  public async listCategories(): Promise<CmsCategoryDto[]> {
    return this.repository.listCategories();
  }

  private ensureNoRawAssetUrl(assetId?: string | null): void {
    if (assetId && /^https?:\/\//i.test(assetId)) {
      throw new Error('featuredAssetId must be a Phase 05 EAP handle, not a raw URL');
    }
  }
}

export class PublicCmsUseCases {
  constructor(private readonly repository: ICmsRepository) {}

  public async listPublished(filters: CmsContentFilters, locale?: string): Promise<PaginatedCmsResult<PublicCmsContentDto>> {
    return this.repository.listPublished({ ...filters, status: CmsContentStatus.PUBLISHED }, locale);
  }

  public async getBySlug(slug: string, locale?: string): Promise<PublicCmsContentDto> {
    const content = await this.repository.getPublishedBySlug(slug, locale);
    if (!content) {
      throw new Error('CMS content not found');
    }
    return content;
  }
}

export const CmsContentTypeValues = Object.values(CmsContentType);
