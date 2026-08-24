/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma CMS delegates are generated after the source-only migration is accepted by runtime. */
import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  CmsCategoryDto,
  CmsContentDetailDto,
  CmsContentDto,
  CmsContentFilters,
  CmsContentRevisionDto,
  CmsContentStatus,
  CmsLocalizedContentDto,
  CmsPublishingPolicy,
  CmsPublishingReadinessDto,
  CmsRestoreRevisionDto,
  CmsSeoMetadata,
  CmsTagDto,
  CmsWorkflowCommandDto,
  CreateCmsCategoryDto,
  CreateCmsContentDto,
  CreateCmsTagDto,
  ICmsRepository,
  PaginatedCmsResult,
  PublicCmsContentDto,
  UpdateCmsContentDto,
  UpsertCmsLocalizedContentDto,
} from '@manaratak/domain';

const json = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

export class PrismaCmsRepository implements ICmsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  private get db(): any {
    return this.prisma as any;
  }

  public async createContent(data: CreateCmsContentDto): Promise<CmsContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const category = await this.resolveCategory(tx, data.categoryId, data.categorySlug);
      const row = await tx.cmsContentNode.create({
        data: {
          ...data,
          categoryId: category?.id ?? null,
          categorySlug: category?.slug ?? data.categorySlug ?? null,
          seoMetadata: json(data.seoMetadata),
          editorialMetadata: json(data.editorialMetadata),
          metadata: json(data.metadata),
        },
      });
      await this.appendMutation(tx, row, null, 'CONTENT_CREATED', data.authorId, {
        slug: row.slug,
        contentType: row.contentType,
      });
      return this.content(row);
    });
  }

  public async updateContent(
    id: string,
    data: UpdateCmsContentDto,
    actorId: string,
  ): Promise<CmsContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const current = await this.requireContent(tx, id);
      this.assertVersion(current.version, data.expectedVersion);
      if (data.slug && data.slug !== current.slug) {
        const published = await tx.cmsPublishedContent.findFirst({ where: { contentId: id } });
        if (published) throw new Error('CMS_CANONICAL_IDENTITY_IMMUTABLE');
      }
      const category =
        data.categoryId !== undefined || data.categorySlug !== undefined
          ? await this.resolveCategory(tx, data.categoryId, data.categorySlug)
          : undefined;
      const { expectedVersion: _expectedVersion, ...values } = data;
      const row = await tx.cmsContentNode.update({
        where: { id },
        data: {
          ...values,
          ...(category !== undefined
            ? { categoryId: category?.id ?? null, categorySlug: category?.slug ?? null }
            : {}),
          seoMetadata: json(values.seoMetadata),
          editorialMetadata: json(values.editorialMetadata),
          metadata: json(values.metadata),
          version: { increment: 1 },
        },
      });
      await this.appendMutation(tx, row, null, 'CONTENT_UPDATED', actorId, {
        version: row.version,
      });
      return this.content(row);
    });
  }

  public async findContentById(id: string): Promise<CmsContentDto | null> {
    const row = await this.db.cmsContentNode.findUnique({ where: { id } });
    return row ? this.content(row) : null;
  }

  public async findContentBySlug(slug: string): Promise<CmsContentDto | null> {
    const row = await this.db.cmsContentNode.findUnique({ where: { slug } });
    return row ? this.content(row) : null;
  }

  public async getContentDetail(id: string): Promise<CmsContentDetailDto | null> {
    const row = await this.db.cmsContentNode.findUnique({
      where: { id },
      include: {
        localizedPayloads: {
          include: {
            tags: { include: { tag: true } },
            attachments: { orderBy: { sortOrder: 'asc' } },
            reviews: { orderBy: { requestedAt: 'desc' } },
            revisions: { orderBy: { versionNumber: 'desc' }, take: 30 },
          },
          orderBy: { locale: 'asc' },
        },
      },
    });
    if (!row) return null;
    const tags = new Map<string, CmsTagDto>();
    const attachments: any[] = [];
    const reviews: any[] = [];
    const revisions: CmsContentRevisionDto[] = [];
    const readiness: Record<string, CmsPublishingReadinessDto> = {};
    for (const localized of row.localizedPayloads) {
      for (const link of localized.tags) tags.set(link.tag.id, this.tag(link.tag));
      attachments.push(...localized.attachments);
      reviews.push(...localized.reviews);
      revisions.push(...localized.revisions.map((entry: any) => this.revision(entry)));
      readiness[localized.locale] = await this.readinessFromRows(row, localized);
    }
    return {
      ...this.content(row),
      localizedPayloads: row.localizedPayloads.map((entry: any) => this.localized(entry)),
      tags: [...tags.values()],
      attachments,
      reviews,
      revisions,
      readiness,
    };
  }

  public async listContent(filters: CmsContentFilters): Promise<PaginatedCmsResult<CmsContentDto>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const q = filters.q?.trim();
    const where: any = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.contentType ? { contentType: filters.contentType } : {}),
      ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
      ...(filters.siteIdentifier ? { siteIdentifier: filters.siteIdentifier } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
              { publicId: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.db.cmsContentNode.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.cmsContentNode.count({ where }),
    ]);
    return {
      data: rows.map((row: any) => this.content(row)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  public async upsertLocalizedContent(
    data: UpsertCmsLocalizedContentDto,
  ): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const content = await this.requireContent(tx, data.contentId);
      const existing = await tx.cmsLocalizedContent.findUnique({
        where: { contentId_locale: { contentId: data.contentId, locale: data.locale } },
      });
      if (existing) {
        this.assertVersion(existing.version, data.expectedVersion);
        if (
          [
            CmsContentStatus.IN_REVIEW,
            CmsContentStatus.READY_TO_PUBLISH,
            CmsContentStatus.SCHEDULED,
          ].includes(existing.state)
        ) {
          throw new Error('CMS_CONTENT_LOCKED_FOR_WORKFLOW');
        }
        const published = await tx.cmsPublishedContent.findUnique({
          where: { contentId_locale: { contentId: data.contentId, locale: data.locale } },
        });
        if (published && published.slug !== data.localizedSlug) {
          throw new Error('CMS_CANONICAL_IDENTITY_IMMUTABLE');
        }
        await this.captureRevision(tx, existing, data.actorId, 'BEFORE_EDIT');
      }
      const row = await tx.cmsLocalizedContent.upsert({
        where: { contentId_locale: { contentId: data.contentId, locale: data.locale } },
        create: {
          contentId: data.contentId,
          locale: data.locale,
          localizedSlug: data.localizedSlug,
          title: data.title,
          summary: data.summary,
          body: data.body,
          readingTimeMinutes: data.readingTimeMinutes,
          featuredAssetId: data.featuredAssetId,
          seoMetadata: json(data.seoMetadata),
          metadata: json(data.metadata),
          lastModifiedBy: data.actorId,
        },
        update: {
          localizedSlug: data.localizedSlug,
          title: data.title,
          summary: data.summary,
          body: data.body,
          readingTimeMinutes: data.readingTimeMinutes,
          featuredAssetId: data.featuredAssetId,
          seoMetadata: json(data.seoMetadata),
          metadata: json(data.metadata),
          lastModifiedBy: data.actorId,
          state: CmsContentStatus.DRAFT,
          scheduledAt: null,
          version: { increment: 1 },
        },
      });
      if (data.tagIds !== undefined) {
        await tx.cmsContentTag.deleteMany({ where: { localizedContentId: row.id } });
        if (data.tagIds.length) {
          await tx.cmsContentTag.createMany({
            data: [...new Set(data.tagIds)].map((tagId) => ({
              localizedContentId: row.id,
              tagId,
            })),
          });
        }
      }
      if (data.attachmentAssetIds !== undefined) {
        await tx.cmsContentAttachment.deleteMany({
          where: { localizedContentId: row.id, role: 'ATTACHMENT' },
        });
        if (data.attachmentAssetIds.length) {
          await tx.cmsContentAttachment.createMany({
            data: [...new Set(data.attachmentAssetIds)].map((assetId, index) => ({
              id: randomUUID(),
              localizedContentId: row.id,
              assetId,
              role: 'ATTACHMENT',
              sortOrder: index,
            })),
          });
        }
      }
      await tx.cmsContentNode.update({
        where: { id: content.id },
        data: {
          ...(data.locale === content.primaryLocale
            ? { title: data.title, summary: data.summary, status: CmsContentStatus.DRAFT }
            : {}),
          version: { increment: 1 },
        },
      });
      await this.appendMutation(tx, content, row.id, 'LOCALIZATION_SAVED', data.actorId, {
        locale: data.locale,
        version: row.version,
      });
      return this.localized(row);
    });
  }

  public async listLocalizedContent(contentId: string): Promise<CmsLocalizedContentDto[]> {
    return (
      await this.db.cmsLocalizedContent.findMany({
        where: { contentId },
        orderBy: { locale: 'asc' },
      })
    ).map((row: any) => this.localized(row));
  }

  public async getReadiness(contentId: string, locale: string): Promise<CmsPublishingReadinessDto> {
    const [content, localized] = await Promise.all([
      this.db.cmsContentNode.findUnique({ where: { id: contentId } }),
      this.db.cmsLocalizedContent.findUnique({
        where: { contentId_locale: { contentId, locale } },
        include: { tags: true },
      }),
    ]);
    if (!content || !localized) throw new Error('CMS_LOCALIZATION_NOT_FOUND');
    return this.readinessFromRows(content, localized);
  }

  public async submitForReview(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    return this.transition(command, CmsContentStatus.IN_REVIEW, 'REVIEW_REQUESTED');
  }

  public async approveReview(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const { content, localized } = await this.loadWorkflow(tx, command);
      CmsPublishingPolicy.assertTransition(localized.state, CmsContentStatus.READY_TO_PUBLISH);
      const review = await tx.cmsWorkflowReview.findFirst({
        where: { localizedContentId: localized.id, status: 'PENDING' },
        orderBy: { requestedAt: 'desc' },
      });
      if (!review) throw new Error('CMS_PENDING_REVIEW_NOT_FOUND');
      CmsPublishingPolicy.assertMakerChecker(review.requestedBy, command.actorId);
      await tx.cmsWorkflowReview.update({
        where: { id: review.id },
        data: {
          status: 'APPROVED',
          reviewedBy: command.actorId,
          reviewedAt: new Date(),
          comments: command.comments,
        },
      });
      const row = await tx.cmsLocalizedContent.update({
        where: { id: localized.id },
        data: { state: CmsContentStatus.READY_TO_PUBLISH, version: { increment: 1 } },
      });
      await tx.cmsContentNode.update({
        where: { id: content.id },
        data: { status: CmsContentStatus.READY_TO_PUBLISH, version: { increment: 1 } },
      });
      await this.appendMutation(tx, content, localized.id, 'REVIEW_APPROVED', command.actorId, {
        locale: command.locale,
        reviewId: review.id,
      });
      return this.localized(row);
    });
  }

  public async rejectReview(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const { content, localized } = await this.loadWorkflow(tx, command);
      CmsPublishingPolicy.assertTransition(localized.state, CmsContentStatus.DRAFT);
      const review = await tx.cmsWorkflowReview.findFirst({
        where: { localizedContentId: localized.id, status: 'PENDING' },
        orderBy: { requestedAt: 'desc' },
      });
      if (!review) throw new Error('CMS_PENDING_REVIEW_NOT_FOUND');
      CmsPublishingPolicy.assertMakerChecker(review.requestedBy, command.actorId);
      await tx.cmsWorkflowReview.update({
        where: { id: review.id },
        data: {
          status: 'REJECTED',
          reviewedBy: command.actorId,
          reviewedAt: new Date(),
          comments: command.comments,
        },
      });
      const row = await tx.cmsLocalizedContent.update({
        where: { id: localized.id },
        data: { state: CmsContentStatus.DRAFT, version: { increment: 1 } },
      });
      await tx.cmsContentNode.update({
        where: { id: content.id },
        data: { status: CmsContentStatus.DRAFT, version: { increment: 1 } },
      });
      await this.appendMutation(tx, content, localized.id, 'REVIEW_REJECTED', command.actorId, {
        locale: command.locale,
        reason: command.comments,
      });
      return this.localized(row);
    });
  }

  public async schedule(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    if (!command.scheduledAt) throw new Error('CMS_SCHEDULE_REQUIRED');
    return this.transition(command, CmsContentStatus.SCHEDULED, 'CONTENT_SCHEDULED', {
      scheduledAt: command.scheduledAt,
    });
  }

  public async publish(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const { content, localized } = await this.loadWorkflow(tx, command, true);
      if (localized.state === CmsContentStatus.SCHEDULED) {
        if (!localized.scheduledAt || localized.scheduledAt.getTime() > Date.now()) {
          throw new Error('CMS_SCHEDULE_NOT_DUE');
        }
      } else {
        CmsPublishingPolicy.assertTransition(localized.state, CmsContentStatus.PUBLISHED);
      }
      CmsPublishingPolicy.assertMakerChecker(content.authorId, command.actorId);
      const approved = await tx.cmsWorkflowReview.findFirst({
        where: { localizedContentId: localized.id, status: 'APPROVED' },
        orderBy: { reviewedAt: 'desc' },
      });
      if (!approved) throw new Error('CMS_APPROVAL_REQUIRED');
      const full = await tx.cmsLocalizedContent.findUnique({
        where: { id: localized.id },
        include: { tags: { include: { tag: true } }, attachments: true },
      });
      const readiness = await this.readinessFromRows(content, full);
      if (!readiness.ready) throw new Error(`CMS_NOT_READY:${readiness.missing.join(',')}`);
      await this.captureRevision(tx, full, command.actorId, 'PUBLISHED');
      const seo = this.seo(
        full.seoMetadata,
        full.title,
        full.summary,
        full.locale,
        full.localizedSlug,
      );
      const now = new Date();
      await tx.cmsPublishedContent.upsert({
        where: { contentId_locale: { contentId: content.id, locale: full.locale } },
        create: {
          id: randomUUID(),
          contentId: content.id,
          publicId: content.publicId,
          siteIdentifier: content.siteIdentifier,
          locale: full.locale,
          slug: full.localizedSlug,
          canonicalUrl: seo.canonicalUrl,
          contentType: content.contentType,
          title: full.title,
          summary: full.summary,
          body: full.body,
          categorySlug: content.categorySlug,
          featuredAssetId: full.featuredAssetId ?? content.featuredAssetId,
          attachmentAssetIds: json(full.attachments.map((entry: any) => entry.assetId)),
          tags: json(
            full.tags.map((entry: any) => ({
              normalizedValue: entry.tag.normalizedValue,
              labelAr: entry.tag.labelAr,
              labelEn: entry.tag.labelEn,
            })),
          ),
          seoMetadata: json(seo),
          versionNumber: full.version,
          publishedAt: now,
        },
        update: {
          title: full.title,
          summary: full.summary,
          body: full.body,
          categorySlug: content.categorySlug,
          featuredAssetId: full.featuredAssetId ?? content.featuredAssetId,
          attachmentAssetIds: json(full.attachments.map((entry: any) => entry.assetId)),
          tags: json(
            full.tags.map((entry: any) => ({
              normalizedValue: entry.tag.normalizedValue,
              labelAr: entry.tag.labelAr,
              labelEn: entry.tag.labelEn,
            })),
          ),
          seoMetadata: json(seo),
          versionNumber: full.version,
          status: CmsContentStatus.PUBLISHED,
          archivedAt: null,
          publishedAt: now,
        },
      });
      const row = await tx.cmsLocalizedContent.update({
        where: { id: full.id },
        data: {
          state: CmsContentStatus.PUBLISHED,
          publishedAt: now,
          scheduledAt: null,
          version: { increment: 1 },
        },
      });
      await tx.cmsContentNode.update({
        where: { id: content.id },
        data: {
          status: CmsContentStatus.PUBLISHED,
          publishedAt: now,
          scheduledAt: null,
          archivedAt: null,
          version: { increment: 1 },
        },
      });
      await this.appendMutation(tx, content, full.id, 'CONTENT_PUBLISHED', command.actorId, {
        locale: command.locale,
        versionNumber: full.version,
        canonicalUrl: seo.canonicalUrl,
      });
      return this.localized(row);
    });
  }

  public async archive(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const { content, localized } = await this.loadWorkflow(tx, command);
      CmsPublishingPolicy.assertTransition(localized.state, CmsContentStatus.ARCHIVED);
      const now = new Date();
      await tx.cmsPublishedContent.updateMany({
        where: { contentId: content.id, locale: command.locale },
        data: { status: CmsContentStatus.ARCHIVED, archivedAt: now },
      });
      const row = await tx.cmsLocalizedContent.update({
        where: { id: localized.id },
        data: { state: CmsContentStatus.ARCHIVED, version: { increment: 1 } },
      });
      await tx.cmsContentNode.update({
        where: { id: content.id },
        data: { status: CmsContentStatus.ARCHIVED, archivedAt: now, version: { increment: 1 } },
      });
      await this.appendMutation(tx, content, localized.id, 'CONTENT_ARCHIVED', command.actorId, {
        locale: command.locale,
      });
      return this.localized(row);
    });
  }

  public async listRevisions(contentId: string, locale: string): Promise<CmsContentRevisionDto[]> {
    const localized = await this.db.cmsLocalizedContent.findUnique({
      where: { contentId_locale: { contentId, locale } },
    });
    if (!localized) throw new Error('CMS_LOCALIZATION_NOT_FOUND');
    return (
      await this.db.cmsContentRevision.findMany({
        where: { localizedContentId: localized.id },
        orderBy: { versionNumber: 'desc' },
      })
    ).map((row: any) => this.revision(row));
  }

  public async restoreRevision(data: CmsRestoreRevisionDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const localized = await tx.cmsLocalizedContent.findUnique({
        where: { contentId_locale: { contentId: data.contentId, locale: data.locale } },
      });
      if (!localized) throw new Error('CMS_LOCALIZATION_NOT_FOUND');
      this.assertVersion(localized.version, data.expectedVersion);
      const revision = await tx.cmsContentRevision.findFirst({
        where: { id: data.revisionId, localizedContentId: localized.id },
      });
      if (!revision) throw new Error('CMS_REVISION_NOT_FOUND');
      const payload = revision.payload as any;
      await this.captureRevision(tx, localized, data.actorId, 'BEFORE_RESTORE');
      const row = await tx.cmsLocalizedContent.update({
        where: { id: localized.id },
        data: {
          title: payload.title,
          summary: payload.summary,
          body: payload.body,
          readingTimeMinutes: payload.readingTimeMinutes,
          featuredAssetId: payload.featuredAssetId,
          seoMetadata: json(payload.seoMetadata),
          metadata: json(payload.metadata),
          state: CmsContentStatus.DRAFT,
          lastModifiedBy: data.actorId,
          scheduledAt: null,
          version: { increment: 1 },
        },
      });
      const content = await this.requireContent(tx, data.contentId);
      await this.appendMutation(tx, content, localized.id, 'REVISION_RESTORED', data.actorId, {
        locale: data.locale,
        revisionId: revision.id,
      });
      return this.localized(row);
    });
  }

  public async createCategory(
    data: CreateCmsCategoryDto,
    actorId: string,
  ): Promise<CmsCategoryDto> {
    return this.db.$transaction(async (tx: any) => {
      if (data.parentCategoryId) {
        const parent = await tx.cmsCategory.findUnique({ where: { id: data.parentCategoryId } });
        if (!parent) throw new Error('CMS_PARENT_CATEGORY_NOT_FOUND');
      }
      const row = await tx.cmsCategory.create({ data: { ...data, metadata: json(data.metadata) } });
      await this.appendStandaloneMutation(tx, row.id, 'CmsCategory', 'CATEGORY_CREATED', actorId, {
        slug: row.slug,
      });
      return this.category(row);
    });
  }

  public async listCategories(): Promise<CmsCategoryDto[]> {
    return (
      await this.db.cmsCategory.findMany({
        include: { _count: { select: { contents: true } } },
        orderBy: [{ status: 'asc' }, { nameAr: 'asc' }],
      })
    ).map((row: any) => this.category(row));
  }

  public async createTag(data: CreateCmsTagDto, actorId: string): Promise<CmsTagDto> {
    return this.db.$transaction(async (tx: any) => {
      const row = await tx.cmsTag.upsert({
        where: { normalizedValue: data.normalizedValue },
        create: data,
        update: { labelAr: data.labelAr, labelEn: data.labelEn },
      });
      await this.appendStandaloneMutation(tx, row.id, 'CmsTag', 'TAG_UPSERTED', actorId, {
        normalizedValue: row.normalizedValue,
      });
      return this.tag(row);
    });
  }

  public async listTags(): Promise<CmsTagDto[]> {
    return (
      await this.db.cmsTag.findMany({
        include: { _count: { select: { contents: true } } },
        orderBy: { normalizedValue: 'asc' },
      })
    ).map((row: any) => this.tag(row));
  }

  public async listPublished(
    filters: CmsContentFilters,
    locale = 'ar',
  ): Promise<PaginatedCmsResult<PublicCmsContentDto>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const q = filters.q?.trim();
    const tag = filters.tag?.trim().toLocaleLowerCase('en');
    const where: any = {
      locale,
      status: CmsContentStatus.PUBLISHED,
      ...(filters.contentType ? { contentType: filters.contentType } : {}),
      ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
      ...(filters.siteIdentifier ? { siteIdentifier: filters.siteIdentifier } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
              { body: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.db.cmsPublishedContent.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.cmsPublishedContent.count({ where }),
    ]);
    const filtered = tag
      ? rows.filter((row: any) =>
          (Array.isArray(row.tags) ? row.tags : []).some(
            (entry: any) => entry.normalizedValue === tag,
          ),
        )
      : rows;
    const locales = await this.availableLocales(filtered.map((row: any) => row.contentId));
    return {
      data: filtered.map((row: any) => this.publicContent(row, locales.get(row.contentId) ?? [])),
      total: tag ? filtered.length : total,
      page,
      pageSize,
      totalPages: Math.ceil((tag ? filtered.length : total) / pageSize),
    };
  }

  public async getPublishedBySlug(
    slug: string,
    locale = 'ar',
  ): Promise<PublicCmsContentDto | null> {
    let row = await this.db.cmsPublishedContent.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    if (!row || row.status !== CmsContentStatus.PUBLISHED) {
      const node = await this.db.cmsContentNode.findUnique({ where: { slug } });
      if (!node) return null;
      row = await this.db.cmsPublishedContent.findFirst({
        where: {
          contentId: node.id,
          status: CmsContentStatus.PUBLISHED,
          locale: node.primaryLocale,
        },
      });
    }
    if (!row) return null;
    const locales = await this.availableLocales([row.contentId]);
    return this.publicContent(row, locales.get(row.contentId) ?? []);
  }

  private async transition(
    command: CmsWorkflowCommandDto,
    next: CmsContentStatus,
    action: string,
    extra: Record<string, unknown> = {},
  ): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const { content, localized } = await this.loadWorkflow(tx, command);
      CmsPublishingPolicy.assertTransition(localized.state, next);
      if (next === CmsContentStatus.IN_REVIEW) {
        const readiness = await this.readinessFromRows(content, localized);
        if (!readiness.ready) throw new Error(`CMS_NOT_READY:${readiness.missing.join(',')}`);
        await tx.cmsWorkflowReview.create({
          data: {
            id: randomUUID(),
            localizedContentId: localized.id,
            requestedBy: command.actorId,
            comments: command.comments,
          },
        });
      }
      if (next === CmsContentStatus.SCHEDULED) {
        const approved = await tx.cmsWorkflowReview.findFirst({
          where: { localizedContentId: localized.id, status: 'APPROVED' },
        });
        if (!approved) throw new Error('CMS_APPROVAL_REQUIRED');
      }
      const row = await tx.cmsLocalizedContent.update({
        where: { id: localized.id },
        data: { state: next, ...extra, version: { increment: 1 } },
      });
      await tx.cmsContentNode.update({
        where: { id: content.id },
        data: { status: next, ...extra, version: { increment: 1 } },
      });
      await this.appendMutation(tx, content, localized.id, action, command.actorId, {
        locale: command.locale,
        ...extra,
      });
      return this.localized(row);
    });
  }

  private async loadWorkflow(
    tx: any,
    command: CmsWorkflowCommandDto,
    includeRelations = false,
  ): Promise<{ content: any; localized: any }> {
    const content = await this.requireContent(tx, command.contentId);
    const localized = await tx.cmsLocalizedContent.findUnique({
      where: { contentId_locale: { contentId: command.contentId, locale: command.locale } },
      ...(includeRelations
        ? { include: { tags: { include: { tag: true } }, attachments: true } }
        : {}),
    });
    if (!localized) throw new Error('CMS_LOCALIZATION_NOT_FOUND');
    this.assertVersion(localized.version, command.expectedVersion);
    return { content, localized };
  }

  private async readinessFromRows(
    content: any,
    localized: any,
  ): Promise<CmsPublishingReadinessDto> {
    const base = CmsPublishingPolicy.readiness(this.content(content), this.localized(localized));
    const warnings = [...base.warnings];
    const tagCount = Array.isArray(localized.tags) ? localized.tags.length : undefined;
    if (tagCount === 0) warnings.push('tags');
    return { ...base, warnings };
  }

  private async resolveCategory(
    tx: any,
    categoryId?: string | null,
    categorySlug?: string | null,
  ): Promise<any | null> {
    if (!categoryId && !categorySlug) return null;
    const category = categoryId
      ? await tx.cmsCategory.findUnique({ where: { id: categoryId } })
      : await tx.cmsCategory.findUnique({ where: { slug: categorySlug } });
    if (!category) throw new Error('CMS_CATEGORY_NOT_FOUND');
    if (category.status !== 'ACTIVE') throw new Error('CMS_CATEGORY_INACTIVE');
    return category;
  }

  private async requireContent(tx: any, id: string): Promise<any> {
    const content = await tx.cmsContentNode.findUnique({ where: { id } });
    if (!content) throw new Error('CMS_CONTENT_NOT_FOUND');
    return content;
  }

  private assertVersion(current: number, expected?: number): void {
    if (expected !== undefined && current !== expected) throw new Error('CMS_VERSION_CONFLICT');
  }

  private async captureRevision(
    tx: any,
    localized: any,
    actorId: string,
    reason: string,
  ): Promise<void> {
    await tx.cmsContentRevision.upsert({
      where: {
        localizedContentId_versionNumber: {
          localizedContentId: localized.id,
          versionNumber: localized.version,
        },
      },
      create: {
        id: randomUUID(),
        localizedContentId: localized.id,
        versionNumber: localized.version,
        reason,
        capturedBy: actorId,
        payload: json({
          localizedSlug: localized.localizedSlug,
          title: localized.title,
          summary: localized.summary,
          body: localized.body,
          readingTimeMinutes: localized.readingTimeMinutes,
          featuredAssetId: localized.featuredAssetId,
          seoMetadata: localized.seoMetadata,
          metadata: localized.metadata,
        }),
      },
      update: {},
    });
  }

  private seo(
    value: unknown,
    title: string,
    summary: string | null,
    locale: string,
    slug: string,
  ): CmsSeoMetadata & { canonicalUrl: string } {
    const input = (value ?? {}) as Partial<CmsSeoMetadata>;
    return {
      title: input.title ?? title,
      description: input.description ?? summary ?? title,
      canonicalUrl: input.canonicalUrl ?? `/${locale}/articles/${slug}`,
      keywords: input.keywords ?? [],
      noIndex: input.noIndex ?? false,
      noFollow: input.noFollow ?? false,
      openGraphTitle: input.openGraphTitle ?? input.title ?? title,
      openGraphDescription: input.openGraphDescription ?? input.description ?? summary ?? title,
      openGraphAssetId: input.openGraphAssetId ?? null,
    };
  }

  private async appendMutation(
    tx: any,
    content: any,
    localizedContentId: string | null,
    action: string,
    actorId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await tx.cmsEditorialLedger.create({
      data: {
        id: randomUUID(),
        contentId: content.id,
        localizedContentId,
        action,
        actorId,
        payload: json(payload),
      },
    });
    await this.appendStandaloneMutation(tx, content.id, 'CmsContent', action, actorId, {
      publicId: content.publicId,
      localizedContentId,
      ...payload,
    });
  }

  private async appendStandaloneMutation(
    tx: any,
    targetId: string,
    targetType: string,
    action: string,
    actorId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const auditId = randomUUID();
    await tx.auditRecord.create({
      data: {
        id: auditId,
        reference: `cms-audit-${auditId}`,
        action,
        category: 'CMS',
        severity: action.includes('PUBLISHED') || action.includes('ARCHIVED') ? 'HIGH' : 'INFO',
        actorId,
        actorType: 'USER',
        targetId,
        targetType,
        source: 'Phase16',
        timestamp: new Date(),
        contextMetadata: json(payload),
      },
    });
    await tx.transactionalOutboxRecord.create({
      data: {
        id: randomUUID(),
        eventType: this.eventType(action),
        domain: 'CMS',
        aggregateType: targetType,
        aggregateId: targetId,
        payload: json({ targetId, action, ...payload }),
        metadata: json({ sourcePhase: 'Phase16', schemaVersion: '1.0' }),
      },
    });
  }

  private eventType(action: string): string {
    const names: Record<string, string> = {
      CONTENT_CREATED: 'CmsContentCreated',
      CONTENT_UPDATED: 'CmsContentUpdated',
      LOCALIZATION_SAVED: 'CmsLocalizationSaved',
      REVIEW_REQUESTED: 'CmsReviewRequested',
      REVIEW_APPROVED: 'CmsReviewApproved',
      REVIEW_REJECTED: 'CmsReviewRejected',
      CONTENT_SCHEDULED: 'CmsContentScheduled',
      CONTENT_PUBLISHED: 'CmsContentPublished',
      CONTENT_ARCHIVED: 'CmsContentArchived',
      REVISION_RESTORED: 'CmsRevisionRestored',
      CATEGORY_CREATED: 'CmsCategoryCreated',
      TAG_UPSERTED: 'CmsTagUpserted',
    };
    return names[action] ?? `Cms${action}`;
  }

  private async availableLocales(
    contentIds: string[],
  ): Promise<Map<string, Array<{ locale: string; slug: string }>>> {
    if (!contentIds.length) return new Map();
    const rows = await this.db.cmsPublishedContent.findMany({
      where: { contentId: { in: [...new Set(contentIds)] }, status: CmsContentStatus.PUBLISHED },
      select: { contentId: true, locale: true, slug: true },
    });
    const result = new Map<string, Array<{ locale: string; slug: string }>>();
    for (const row of rows) {
      const entries = result.get(row.contentId) ?? [];
      entries.push({ locale: row.locale, slug: row.slug });
      result.set(row.contentId, entries);
    }
    return result;
  }

  private content(row: any): CmsContentDto {
    return {
      ...row,
      status: row.status as CmsContentStatus,
      seoMetadata: row.seoMetadata as CmsSeoMetadata | null,
      editorialMetadata: row.editorialMetadata as Record<string, unknown> | null,
      metadata: row.metadata as Record<string, unknown> | null,
    };
  }

  private localized(row: any): CmsLocalizedContentDto {
    return {
      ...row,
      state: row.state as CmsContentStatus,
      seoMetadata: row.seoMetadata as CmsSeoMetadata | null,
      metadata: row.metadata as Record<string, unknown> | null,
      attachmentAssetIds: Array.isArray(row.attachments)
        ? row.attachments.map((entry: any) => entry.assetId)
        : [],
      tagIds: Array.isArray(row.tags) ? row.tags.map((entry: any) => entry.tagId) : [],
      actorId: row.lastModifiedBy,
    };
  }

  private category(row: any): CmsCategoryDto {
    const { _count, ...category } = row;
    return { ...category, contentCount: _count?.contents ?? 0 };
  }

  private tag(row: any): CmsTagDto {
    const { _count, ...tag } = row;
    return { ...tag, contentCount: _count?.contents ?? 0 };
  }

  private revision(row: any): CmsContentRevisionDto {
    return { ...row, payload: row.payload as Record<string, unknown> };
  }

  private publicContent(
    row: any,
    availableLocales: Array<{ locale: string; slug: string }>,
  ): PublicCmsContentDto {
    const seo = row.seoMetadata as CmsSeoMetadata;
    const tags = (Array.isArray(row.tags) ? row.tags : []).map((entry: any) => ({
      normalizedValue: entry.normalizedValue,
      label: row.locale.startsWith('ar') ? entry.labelAr : entry.labelEn,
    }));
    return {
      publicId: row.publicId,
      contentId: row.contentId,
      siteIdentifier: row.siteIdentifier,
      locale: row.locale,
      slug: row.slug,
      canonicalUrl: row.canonicalUrl,
      contentType: row.contentType,
      title: row.title,
      summary: row.summary,
      body: row.body,
      categorySlug: row.categorySlug,
      featuredAssetId: row.featuredAssetId,
      attachmentAssetIds: Array.isArray(row.attachmentAssetIds) ? row.attachmentAssetIds : [],
      tags,
      publishedAt: row.publishedAt,
      versionNumber: row.versionNumber,
      seoMetadata: seo,
      availableLocales,
      localizedPayload: {
        id: row.id,
        contentId: row.contentId,
        locale: row.locale,
        localizedSlug: row.slug,
        state: CmsContentStatus.PUBLISHED,
        version: row.versionNumber,
        title: row.title,
        summary: row.summary,
        body: row.body,
        readingTimeMinutes: Math.max(1, Math.ceil(row.body.split(/\s+/).length / 220)),
        featuredAssetId: row.featuredAssetId,
        seoMetadata: seo,
        metadata: null,
        attachmentAssetIds: Array.isArray(row.attachmentAssetIds) ? row.attachmentAssetIds : [],
        tagIds: [],
        actorId: 'published-projection',
        lastModifiedBy: 'published-projection',
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    };
  }
}
