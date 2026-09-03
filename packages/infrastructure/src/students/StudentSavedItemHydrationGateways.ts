import {
  ICmsRepository,
  IServiceCatalogRepository,
  IStudentSavedItemHydrationGateway,
  ServiceStatus,
  StudentSavedItemDto,
  StudentSavedItemType,
} from '@manaratak/domain';

export class CmsStudentSavedItemHydrationGateway implements IStudentSavedItemHydrationGateway {
  constructor(private readonly cms: ICmsRepository) {}
  supports(entityType: StudentSavedItemType): boolean { return entityType === StudentSavedItemType.CMS_CONTENT; }
  async hydrate(item: StudentSavedItemDto) {
    const content = await this.cms.findContentById(item.entityId);
    if (!content) return { ownerType: item.entityType, ownerId: item.entityId, available: false };
    const published = await this.cms.getPublishedBySlug(item.entitySlug ?? content.slug, undefined, content.siteIdentifier);
    if (!published) return { ownerType: item.entityType, ownerId: item.entityId, publicId: content.publicId, slug: content.slug, displayName: content.title, lifecycleStatus: String(content.status), available: false };
    return { ownerType: item.entityType, ownerId: item.entityId, publicId: published.publicId, slug: published.slug, displayName: published.title, lifecycleStatus: 'PUBLISHED', available: true };
  }
}

export class ServiceStudentSavedItemHydrationGateway implements IStudentSavedItemHydrationGateway {
  constructor(private readonly services: IServiceCatalogRepository) {}
  supports(entityType: StudentSavedItemType): boolean { return entityType === StudentSavedItemType.SERVICE; }
  async hydrate(item: StudentSavedItemDto) {
    const service = await this.services.findById(item.entityId);
    if (!service) return { ownerType: item.entityType, ownerId: item.entityId, available: false };
    return {
      ownerType: item.entityType,
      ownerId: item.entityId,
      publicId: service.publicId,
      slug: service.slug,
      displayName: service.displayName,
      lifecycleStatus: service.status,
      available: service.status === ServiceStatus.PUBLISHED,
    };
  }
}
