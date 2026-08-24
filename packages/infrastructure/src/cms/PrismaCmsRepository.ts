/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma CMS delegates are generated after the source-only migration is accepted by runtime. */
import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  CmsCategoryDto,
  CmsAnnouncementDto,
  CmsBlockSchemaDto,
  CmsContentBlockDto,
  CmsContentDetailDto,
  CmsContentDto,
  CmsContentFilters,
  CmsContentRevisionDto,
  CmsContentStatus,
  CmsNavigationMenuDto,
  CmsLocalizedContentDto,
  CmsPublishingPolicy,
  CmsPublishingReadinessDto,
  CmsRedirectDto,
  CmsScheduleResultDto,
  CmsSlugChangeDto,
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
    const row = await this.db.cmsContentNode.findFirst({ where: { slug }, orderBy: { updatedAt: 'desc' } });
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
          siteIdentifier: content.siteIdentifier,
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
          siteIdentifier: content.siteIdentifier,
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

  public async cancelSchedule(command: CmsWorkflowCommandDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const { content, localized } = await this.loadWorkflow(tx, command);
      CmsPublishingPolicy.assertTransition(localized.state, CmsContentStatus.DRAFT);
      await tx.cmsScheduledJob.updateMany({ where: { localizedContentId: localized.id, status: 'PENDING' }, data: { status: 'CANCELLED', completedAt: new Date() } });
      const row = await tx.cmsLocalizedContent.update({ where: { id: localized.id }, data: { state: CmsContentStatus.DRAFT, scheduledAt: null, version: { increment: 1 } } });
      await tx.cmsContentNode.update({ where: { id: content.id }, data: { status: CmsContentStatus.DRAFT, scheduledAt: null, version: { increment: 1 } } });
      await this.appendMutation(tx, content, localized.id, 'SCHEDULE_CANCELLED', command.actorId, { locale: command.locale });
      return this.localized(row);
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
    siteIdentifier = 'manaratak',
  ): Promise<PublicCmsContentDto | null> {
    let row = await this.db.cmsPublishedContent.findUnique({
      where: { siteIdentifier_locale_slug: { siteIdentifier, locale, slug } },
    });
    if (!row || row.status !== CmsContentStatus.PUBLISHED) {
      const direct = await this.db.cmsPublishedContent.findFirst({ where: { siteIdentifier, slug, status: CmsContentStatus.PUBLISHED } });
      const node = direct
        ? await this.db.cmsContentNode.findUnique({ where: { id: direct.contentId } })
        : await this.db.cmsContentNode.findFirst({ where: { siteIdentifier, slug } });
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

  public async changeLocalizedSlug(data: CmsSlugChangeDto): Promise<CmsLocalizedContentDto> {
    return this.db.$transaction(async (tx: any) => {
      const content = await this.requireContent(tx, data.contentId);
      const localized = await tx.cmsLocalizedContent.findUnique({ where: { contentId_locale: { contentId: data.contentId, locale: data.locale } } });
      if (!localized) throw new Error('CMS_LOCALIZATION_NOT_FOUND');
      this.assertVersion(localized.version, data.expectedVersion);
      if (localized.localizedSlug === data.newSlug) return this.localized(localized);
      const sourcePath = `/${data.locale}/articles/${localized.localizedSlug}`;
      const destinationPath = `/${data.locale}/articles/${data.newSlug}`;
      CmsPublishingPolicy.assertRedirect(sourcePath, destinationPath);
      const reverse = await tx.cmsRedirect.findFirst({ where: { siteIdentifier: content.siteIdentifier, locale: data.locale, sourcePath: destinationPath, destinationPath: sourcePath, active: true } });
      if (reverse) throw new Error('CMS_REDIRECT_LOOP');
      await this.captureRevision(tx, localized, data.actorId, 'BEFORE_SLUG_CHANGE');
      const row = await tx.cmsLocalizedContent.update({ where: { id: localized.id }, data: { localizedSlug: data.newSlug, state: CmsContentStatus.DRAFT, lastModifiedBy: data.actorId, version: { increment: 1 } } });
      await tx.cmsRedirect.upsert({
        where: { siteIdentifier_locale_sourcePath: { siteIdentifier: content.siteIdentifier, locale: data.locale, sourcePath } },
        create: { id: randomUUID(), siteIdentifier: content.siteIdentifier, locale: data.locale, sourcePath, destinationPath, statusCode: 301, reason: data.reason, contentId: content.id, createdBy: data.actorId },
        update: { destinationPath, statusCode: 301, reason: data.reason, active: true },
      });
      await this.appendMutation(tx, content, localized.id, 'SLUG_CHANGED', data.actorId, { locale: data.locale, sourcePath, destinationPath, reason: data.reason });
      return this.localized(row);
    });
  }

  public async listRedirects(siteIdentifier?: string, locale?: string): Promise<CmsRedirectDto[]> {
    return this.db.cmsRedirect.findMany({ where: { ...(siteIdentifier ? { siteIdentifier } : {}), ...(locale ? { locale } : {}) }, orderBy: { updatedAt: 'desc' } });
  }

  public async createRedirect(data: Omit<CmsRedirectDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<CmsRedirectDto> {
    return this.db.$transaction(async (tx: any) => {
      CmsPublishingPolicy.assertRedirect(data.sourcePath, data.destinationPath);
      const reverse = await tx.cmsRedirect.findFirst({ where: { siteIdentifier: data.siteIdentifier, locale: data.locale, sourcePath: data.destinationPath, destinationPath: data.sourcePath, active: true } });
      if (reverse) throw new Error('CMS_REDIRECT_LOOP');
      const row = await tx.cmsRedirect.create({ data: { id: randomUUID(), ...data } });
      await this.appendStandaloneMutation(tx, row.id, 'CmsRedirect', 'REDIRECT_CREATED', data.createdBy, { siteIdentifier: data.siteIdentifier, locale: data.locale, sourcePath: data.sourcePath, destinationPath: data.destinationPath });
      return row;
    });
  }

  public async listNavigation(siteIdentifier: string, locale: string): Promise<CmsNavigationMenuDto[]> {
    const rows = await this.db.cmsNavigationMenu.findMany({ where: { siteIdentifier, locale }, include: { nodes: { orderBy: { sortOrder: 'asc' } } }, orderBy: { locationKey: 'asc' } });
    return rows.map((row: any) => this.navigation(row));
  }

  public async saveNavigation(data: Omit<CmsNavigationMenuDto, 'id' | 'version' | 'createdAt' | 'updatedAt'> & { id?: string; expectedVersion?: number }): Promise<CmsNavigationMenuDto> {
    return this.db.$transaction(async (tx: any) => {
      const existing = data.id ? await tx.cmsNavigationMenu.findUnique({ where: { id: data.id } }) : await tx.cmsNavigationMenu.findUnique({ where: { siteIdentifier_locale_locationKey: { siteIdentifier: data.siteIdentifier, locale: data.locale, locationKey: data.locationKey } } });
      if (existing) this.assertVersion(existing.version, data.expectedVersion);
      if (existing && data.status === CmsContentStatus.PUBLISHED) CmsPublishingPolicy.assertMakerChecker(existing.updatedBy, data.updatedBy);
      const menu = existing
        ? await tx.cmsNavigationMenu.update({ where: { id: existing.id }, data: { status: data.status, updatedBy: data.updatedBy, version: { increment: 1 } } })
        : await tx.cmsNavigationMenu.create({ data: { id: randomUUID(), siteIdentifier: data.siteIdentifier, locale: data.locale, locationKey: data.locationKey, status: CmsContentStatus.DRAFT, updatedBy: data.updatedBy } });
      await tx.cmsNavigationNode.deleteMany({ where: { menuId: menu.id } });
      if (data.nodes.length) await tx.cmsNavigationNode.createMany({ data: data.nodes.map((node, index) => ({ id: node.id ?? randomUUID(), menuId: menu.id, parentNodeId: node.parentNodeId, displayText: node.displayText, targetType: node.targetType, targetValue: node.targetValue, sortOrder: node.sortOrder ?? index, openInNewWindow: node.openInNewWindow, metadata: json(node.metadata) })) });
      await this.appendStandaloneMutation(tx, menu.id, 'CmsNavigationMenu', data.status === CmsContentStatus.PUBLISHED ? 'NAVIGATION_PUBLISHED' : 'NAVIGATION_UPDATED', data.updatedBy, { siteIdentifier: data.siteIdentifier, locale: data.locale, locationKey: data.locationKey });
      const row = await tx.cmsNavigationMenu.findUnique({ where: { id: menu.id }, include: { nodes: { orderBy: { sortOrder: 'asc' } } } });
      return this.navigation(row);
    });
  }

  public async listBlockSchemas(): Promise<CmsBlockSchemaDto[]> {
    return (await this.db.cmsBlockSchema.findMany({ orderBy: [{ key: 'asc' }, { version: 'desc' }] })).map((row: any) => this.blockSchema(row));
  }

  public async createBlockSchema(data: Omit<CmsBlockSchemaDto, 'id' | 'createdAt'>): Promise<CmsBlockSchemaDto> {
    return this.db.$transaction(async (tx: any) => {
      const row = await tx.cmsBlockSchema.create({ data: { ...data, id: randomUUID(), fieldSchema: json(data.fieldSchema), localizedFields: json(data.localizedFields), assetFields: json(data.assetFields) } });
      await this.appendStandaloneMutation(tx, row.id, 'CmsBlockSchema', 'BLOCK_SCHEMA_CREATED', data.createdBy, { key: data.key, version: data.version });
      return this.blockSchema(row);
    });
  }

  public async listBlocks(siteIdentifier: string, locale: string): Promise<CmsContentBlockDto[]> {
    return (await this.db.cmsContentBlock.findMany({ where: { siteIdentifier, locale }, orderBy: { updatedAt: 'desc' } })).map((row: any) => this.block(row));
  }

  public async saveBlock(data: Omit<CmsContentBlockDto, 'id' | 'publicId' | 'version' | 'createdAt' | 'updatedAt'> & { id?: string; expectedVersion?: number }): Promise<CmsContentBlockDto> {
    return this.db.$transaction(async (tx: any) => {
      const schema = await tx.cmsBlockSchema.findUnique({ where: { id: data.schemaId } });
      if (!schema || schema.status !== 'ACTIVE') throw new Error('CMS_BLOCK_SCHEMA_NOT_ACTIVE');
      this.validateBlockPayload(data.payload, schema.fieldSchema, schema.assetFields);
      const existing = data.id ? await tx.cmsContentBlock.findUnique({ where: { id: data.id } }) : null;
      if (existing) this.assertVersion(existing.version, data.expectedVersion);
      const row = existing
        ? await tx.cmsContentBlock.update({ where: { id: existing.id }, data: { name: data.name, payload: json(data.payload), status: CmsContentStatus.DRAFT, updatedBy: data.updatedBy, version: { increment: 1 } } })
        : await tx.cmsContentBlock.create({ data: { id: randomUUID(), publicId: `cms-block-${randomUUID()}`, siteIdentifier: data.siteIdentifier, locale: data.locale, schemaId: data.schemaId, name: data.name, payload: json(data.payload), status: CmsContentStatus.DRAFT, updatedBy: data.updatedBy } });
      await this.appendStandaloneMutation(tx, row.id, 'CmsContentBlock', 'BLOCK_SAVED', data.updatedBy, { schemaId: data.schemaId, version: row.version });
      return this.block(row);
    });
  }

  public async listAnnouncements(siteIdentifier: string, locale: string, publicOnly = false): Promise<CmsAnnouncementDto[]> {
    const now = new Date();
    return this.db.cmsAnnouncement.findMany({ where: { siteIdentifier, locale, ...(publicOnly ? { status: CmsContentStatus.PUBLISHED, startsAt: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } : {}) }, orderBy: [{ urgency: 'desc' }, { startsAt: 'desc' }] });
  }

  public async saveAnnouncement(data: Omit<CmsAnnouncementDto, 'id' | 'publicId' | 'version' | 'createdAt' | 'updatedAt'> & { id?: string; expectedVersion?: number }): Promise<CmsAnnouncementDto> {
    return this.db.$transaction(async (tx: any) => {
      const existing = data.id ? await tx.cmsAnnouncement.findUnique({ where: { id: data.id } }) : null;
      if (existing) this.assertVersion(existing.version, data.expectedVersion);
      if (data.expiresAt && data.expiresAt <= data.startsAt) throw new Error('CMS_ANNOUNCEMENT_WINDOW_INVALID');
      if (data.status === CmsContentStatus.PUBLISHED) {
        if (!existing) throw new Error('CMS_ANNOUNCEMENT_REVIEW_REQUIRED');
        CmsPublishingPolicy.assertMakerChecker(existing.createdBy, data.createdBy);
      }
      const values = { siteIdentifier: data.siteIdentifier, locale: data.locale, title: data.title, body: data.body, urgency: data.urgency, audience: data.audience, startsAt: data.startsAt, expiresAt: data.expiresAt };
      const row = existing
        ? await tx.cmsAnnouncement.update({ where: { id: existing.id }, data: { ...values, status: data.status, approvedBy: data.status === CmsContentStatus.PUBLISHED ? data.createdBy : existing.approvedBy, publishedAt: data.status === CmsContentStatus.PUBLISHED ? new Date() : existing.publishedAt, version: { increment: 1 } } })
        : await tx.cmsAnnouncement.create({ data: { id: randomUUID(), publicId: `cms-ann-${randomUUID()}`, ...values, status: CmsContentStatus.DRAFT, createdBy: data.createdBy } });
      await this.appendStandaloneMutation(tx, row.id, 'CmsAnnouncement', row.status === CmsContentStatus.PUBLISHED ? 'ANNOUNCEMENT_PUBLISHED' : 'ANNOUNCEMENT_SAVED', data.createdBy, { siteIdentifier: data.siteIdentifier, locale: data.locale, version: row.version });
      return row;
    });
  }

  public async processDueSchedules(actorId: string, now: Date, limit = 50): Promise<CmsScheduleResultDto> {
    const jobs = await this.db.cmsScheduledJob.findMany({ where: { status: 'PENDING', scheduledAt: { lte: now } }, orderBy: { scheduledAt: 'asc' }, take: Math.min(100, limit) });
    const result: CmsScheduleResultDto = { processed: 0, published: 0, archived: 0, failed: 0, affectedSites: [] };
    const affectedSites = new Set<string>();
    for (const job of jobs) {
      result.processed += 1;
      try {
        const localized = await this.db.cmsLocalizedContent.findUnique({ where: { id: job.localizedContentId } });
        if (!localized) throw new Error('CMS_LOCALIZATION_NOT_FOUND');
        const content = await this.db.cmsContentNode.findUnique({ where: { id: localized.contentId }, select: { siteIdentifier: true } });
        if (content) affectedSites.add(content.siteIdentifier);
        if (job.jobType === 'PUBLISH') { await this.publish({ contentId: localized.contentId, locale: localized.locale, actorId, expectedVersion: localized.version }); result.published += 1; }
        else { await this.archive({ contentId: localized.contentId, locale: localized.locale, actorId, expectedVersion: localized.version }); result.archived += 1; }
        await this.db.cmsScheduledJob.update({ where: { id: job.id }, data: { status: 'COMPLETED', completedAt: new Date(), attemptCount: { increment: 1 } } });
      } catch (error) {
        result.failed += 1;
        await this.db.cmsScheduledJob.update({ where: { id: job.id }, data: { status: 'FAILED', failureCode: error instanceof Error ? error.message.slice(0, 120) : 'CMS_SCHEDULE_FAILED', attemptCount: { increment: 1 } } });
      }
    }
    result.affectedSites = [...affectedSites];
    return result;
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
        await tx.cmsScheduledJob.upsert({
          where: { idempotencyKey: `publish:${localized.id}:${localized.version + 1}` },
          create: {
            id: randomUUID(), localizedContentId: localized.id, jobType: 'PUBLISH',
            scheduledAt: command.scheduledAt, idempotencyKey: `publish:${localized.id}:${localized.version + 1}`,
          },
          update: { scheduledAt: command.scheduledAt, status: 'PENDING', failureCode: null },
        });
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
      SCHEDULE_CANCELLED: 'CmsScheduleCancelled',
      CONTENT_PUBLISHED: 'CmsContentPublished',
      CONTENT_ARCHIVED: 'CmsContentArchived',
      REVISION_RESTORED: 'CmsRevisionRestored',
      CATEGORY_CREATED: 'CmsCategoryCreated',
      TAG_UPSERTED: 'CmsTagUpserted',
      SLUG_CHANGED: 'CmsSlugChanged',
      REDIRECT_CREATED: 'CmsRedirectCreated',
      NAVIGATION_UPDATED: 'CmsNavigationUpdated',
      NAVIGATION_PUBLISHED: 'CmsNavigationPublished',
      BLOCK_SCHEMA_CREATED: 'CmsBlockSchemaCreated',
      BLOCK_SAVED: 'CmsContentBlockSaved',
      ANNOUNCEMENT_SAVED: 'CmsAnnouncementSaved',
      ANNOUNCEMENT_PUBLISHED: 'CmsAnnouncementPublished',
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

  private navigation(row: any): CmsNavigationMenuDto {
    return { ...row, status: row.status as CmsContentStatus, nodes: row.nodes.map((node: any) => ({ ...node, metadata: node.metadata as Record<string, unknown> | null })) };
  }

  private blockSchema(row: any): CmsBlockSchemaDto {
    return { ...row, fieldSchema: row.fieldSchema as Record<string, unknown>, localizedFields: Array.isArray(row.localizedFields) ? row.localizedFields : [], assetFields: Array.isArray(row.assetFields) ? row.assetFields : [] };
  }

  private block(row: any): CmsContentBlockDto {
    return { ...row, status: row.status as CmsContentStatus, payload: row.payload as Record<string, unknown> };
  }

  private validateBlockPayload(payload: Record<string, unknown>, fieldSchema: unknown, assetFields: unknown): void {
    const schema = (fieldSchema ?? {}) as { required?: string[]; properties?: Record<string, { type?: string }> };
    for (const key of schema.required ?? []) if (payload[key] === undefined || payload[key] === null || payload[key] === '') throw new Error(`CMS_BLOCK_FIELD_REQUIRED:${key}`);
    for (const [key, definition] of Object.entries(schema.properties ?? {})) {
      const value = payload[key]; if (value === undefined || !definition.type) continue;
      if (definition.type === 'array' ? !Array.isArray(value) : definition.type === 'object' ? typeof value !== 'object' || Array.isArray(value) || value === null : typeof value !== definition.type) throw new Error(`CMS_BLOCK_FIELD_TYPE_INVALID:${key}`);
    }
    for (const key of Array.isArray(assetFields) ? assetFields : []) {
      const value = payload[String(key)];
      if (Array.isArray(value)) for (const item of value) CmsPublishingPolicy.assertAssetHandle(typeof item === 'string' ? item : null);
      else CmsPublishingPolicy.assertAssetHandle(typeof value === 'string' ? value : null);
    }
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
