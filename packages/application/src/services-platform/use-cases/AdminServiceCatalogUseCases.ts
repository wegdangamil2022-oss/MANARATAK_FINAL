import {
  CreateServiceCatalogItemDto,
  IServiceCatalogRepository,
  PaginatedServiceCatalogResult,
  ServiceCatalogFilters,
  ServiceCatalogItemDto,
  ServiceCompletenessStatus,
  ServiceStatus,
  UpdateServiceCatalogItemDto
} from '@manaratak/domain';

export class AdminServiceCatalogUseCases {
  constructor(private readonly repository: IServiceCatalogRepository) {}

  public async createService(data: Omit<CreateServiceCatalogItemDto, 'publicId' | 'slug' | 'canonicalName' | 'canonicalDedupKey' | 'status' | 'completenessStatus'>): Promise<ServiceCatalogItemDto> {
    const canonicalName = normalizeServiceName(data.displayName);
    const canonicalDedupKey = [
      canonicalName,
      data.serviceCategory,
      data.fulfillmentType,
      data.deliveryMode
    ].join('|');

    const existing = await this.repository.findByDedupKey(canonicalDedupKey);
    if (existing) {
      throw new Error('A matching service already exists');
    }

    const completenessStatus = this.classifyCompleteness(data);

    return this.repository.create({
      ...data,
      publicId: `svc_${Date.now().toString(36)}`,
      slug: slugify(data.displayName),
      canonicalName,
      canonicalDedupKey,
      status: ServiceStatus.READY_TO_REVIEW,
      completenessStatus
    });
  }

  public async listServices(filters: ServiceCatalogFilters): Promise<PaginatedServiceCatalogResult<ServiceCatalogItemDto>> {
    return this.repository.list(filters);
  }

  public async getService(id: string): Promise<ServiceCatalogItemDto> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new Error(`Service with id ${id} not found`);
    }
    return service;
  }

  public async updateService(id: string, updates: UpdateServiceCatalogItemDto): Promise<ServiceCatalogItemDto> {
    const existing = await this.getService(id);
    const merged = {
      ...existing,
      ...updates
    };

    return this.repository.update(id, {
      ...updates,
      completenessStatus: this.classifyCompleteness(merged)
    });
  }

  public async markReadyToReview(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.completenessStatus === ServiceCompletenessStatus.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE service as READY_TO_REVIEW');
    }
    await this.repository.updateStatus(id, ServiceStatus.READY_TO_REVIEW);
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.completenessStatus !== ServiceCompletenessStatus.COMPLETE) {
      throw new Error('Only COMPLETE services can be marked as READY_TO_PUBLISH');
    }
    await this.repository.updateStatus(id, ServiceStatus.READY_TO_PUBLISH);
  }

  public async publish(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.status !== ServiceStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH services can be PUBLISHED');
    }
    await this.repository.updateStatus(id, ServiceStatus.PUBLISHED);
  }

  public async unpublish(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.status !== ServiceStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a service that is not PUBLISHED');
    }
    await this.repository.updateStatus(id, ServiceStatus.READY_TO_REVIEW);
  }

  public async reject(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.status === ServiceStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED service. Unpublish first.');
    }
    await this.repository.updateStatus(id, ServiceStatus.REJECTED);
  }

  public async archive(id: string): Promise<void> {
    await this.repository.updateStatus(id, ServiceStatus.ARCHIVED);
  }

  private classifyCompleteness(updates: UpdateServiceCatalogItemDto): ServiceCompletenessStatus {
    const requiredValues = [
      updates.displayName,
      updates.serviceCategory,
      updates.fulfillmentType,
      updates.serviceDescription,
      updates.serviceAvailabilityStatus,
      updates.deliveryMode,
      updates.responsibleServiceOwnerType
    ];

    const hasRequiredStrings = requiredValues.every((value) => typeof value === 'string' && value.trim().length > 0);
    const hasDocuments = Array.isArray(updates.requiredInputsOrDocuments) && updates.requiredInputsOrDocuments.length > 0;

    return hasRequiredStrings && hasDocuments
      ? ServiceCompletenessStatus.COMPLETE
      : ServiceCompletenessStatus.INCOMPLETE;
  }
}

function normalizeServiceName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(best|offer|urgent|new|limited|deal)\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string): string {
  const slug = normalizeServiceName(value).replace(/\s+/g, '-');
  return slug || `service-${Date.now().toString(36)}`;
}
