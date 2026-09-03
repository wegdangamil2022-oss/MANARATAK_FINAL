import { createHash, randomUUID } from 'node:crypto';
import {
  CreateServiceCatalogItemDto,
  IServiceCatalogRepository,
  IServiceReferenceGateway,
  PaginatedServiceCatalogResult,
  ServiceCatalogFilters,
  ServiceCatalogItemDto,
  ServiceCompletenessStatus,
  ServiceStatus,
  UpdateServiceCatalogItemDto,
} from '@manaratak/domain';

type ServiceCreateInput = Omit<
  CreateServiceCatalogItemDto,
  'publicId' | 'slug' | 'canonicalName' | 'canonicalDedupKey' | 'status' | 'completenessStatus' | 'supportedCountryReferenceIds' | 'supportedLanguageReferenceIds'
> & {
  supportedCountryReferenceIds?: string[] | null;
  supportedLanguageReferenceIds?: string[] | null;
};

export class AdminServiceCatalogUseCases {
  constructor(
    private readonly repository: IServiceCatalogRepository,
    private readonly references: IServiceReferenceGateway,
  ) {}

  public async createService(data: ServiceCreateInput): Promise<ServiceCatalogItemDto> {
    const canonicalName = normalizeServiceName(data.displayName);
    const canonicalDedupKey = [canonicalName, data.serviceCategory, data.fulfillmentType, data.deliveryMode].join('|');
    const existing = await this.repository.findByDedupKey(canonicalDedupKey);
    if (existing) throw new Error('A matching service already exists');

    const [supportedCountryReferenceIds, supportedLanguageReferenceIds] = await Promise.all([
      this.resolveCountries(data.supportedCountryReferenceIds ?? data.supportedCountries),
      this.resolveLanguages(data.supportedLanguageReferenceIds ?? data.supportedLanguages),
    ]);

    const normalized: ServiceCreateInput = {
      ...data,
      supportedCountryReferenceIds,
      supportedLanguageReferenceIds,
    };
    return this.repository.create({
      ...normalized,
      publicId: `svc_${randomUUID()}`,
      slug: `${slugify(data.displayName)}-${shortHash(canonicalDedupKey)}`,
      canonicalName,
      canonicalDedupKey,
      status: ServiceStatus.READY_TO_REVIEW,
      completenessStatus: this.classifyCompleteness(normalized),
    });
  }

  public async listServices(filters: ServiceCatalogFilters): Promise<PaginatedServiceCatalogResult<ServiceCatalogItemDto>> {
    return this.repository.list(filters);
  }
  public async getService(id: string): Promise<ServiceCatalogItemDto> {
    const service = await this.repository.findById(id);
    if (!service) throw new Error(`Service with id ${id} not found`);
    return service;
  }

  public async updateService(id: string, updates: UpdateServiceCatalogItemDto): Promise<ServiceCatalogItemDto> {
    const existing = await this.getService(id);
    const normalized: UpdateServiceCatalogItemDto = { ...updates };
    if (updates.supportedCountryReferenceIds !== undefined || updates.supportedCountries !== undefined) {
      normalized.supportedCountryReferenceIds = await this.resolveCountries(
        updates.supportedCountryReferenceIds ?? updates.supportedCountries,
      );
    }
    if (updates.supportedLanguageReferenceIds !== undefined || updates.supportedLanguages !== undefined) {
      normalized.supportedLanguageReferenceIds = await this.resolveLanguages(
        updates.supportedLanguageReferenceIds ?? updates.supportedLanguages,
      );
    }
    const merged = { ...existing, ...normalized };
    const canonicalName = updates.displayName ? normalizeServiceName(updates.displayName) : existing.canonicalName;
    const canonicalDedupKey = [canonicalName, merged.serviceCategory, merged.fulfillmentType, merged.deliveryMode].join('|');
    if (canonicalDedupKey !== existing.canonicalDedupKey) {
      const duplicate = await this.repository.findByDedupKey(canonicalDedupKey);
      if (duplicate && duplicate.id !== id) throw new Error('A matching service already exists');
    }
    return this.repository.update(id, {
      ...normalized,
      canonicalName,
      canonicalDedupKey,
      completenessStatus: this.classifyCompleteness(merged),
    });
  }

  public async markReadyToReview(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.completenessStatus === ServiceCompletenessStatus.INCOMPLETE)
      throw new Error('Cannot mark INCOMPLETE service as READY_TO_REVIEW');
    await this.repository.updateStatus(id, ServiceStatus.READY_TO_REVIEW);
  }
  public async markReadyToPublish(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.completenessStatus !== ServiceCompletenessStatus.COMPLETE)
      throw new Error('Only COMPLETE services can be marked as READY_TO_PUBLISH');
    await this.repository.updateStatus(id, ServiceStatus.READY_TO_PUBLISH);
  }
  public async publish(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.status !== ServiceStatus.READY_TO_PUBLISH)
      throw new Error('Only READY_TO_PUBLISH services can be PUBLISHED');
    await this.repository.updateStatus(id, ServiceStatus.PUBLISHED);
  }
  public async unpublish(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.status !== ServiceStatus.PUBLISHED)
      throw new Error('Cannot unpublish a service that is not PUBLISHED');
    await this.repository.updateStatus(id, ServiceStatus.READY_TO_REVIEW);
  }
  public async reject(id: string): Promise<void> {
    const existing = await this.getService(id);
    if (existing.status === ServiceStatus.PUBLISHED)
      throw new Error('Cannot reject a PUBLISHED service. Unpublish first.');
    await this.repository.updateStatus(id, ServiceStatus.REJECTED);
  }
  public async archive(id: string): Promise<void> {
    await this.repository.updateStatus(id, ServiceStatus.ARCHIVED);
  }

  private async resolveCountries(values?: string[] | null): Promise<string[] | null> {
    if (values == null) return null;
    const resolved = await Promise.all(values.map((value) => this.references.resolveCountryReference(value)));
    return [...new Set(resolved.map((item) => item.id))];
  }
  private async resolveLanguages(values?: string[] | null): Promise<string[] | null> {
    if (values == null) return null;
    const resolved = await Promise.all(values.map((value) => this.references.resolveLanguageReference(value)));
    return [...new Set(resolved.map((item) => item.id))];
  }
  private classifyCompleteness(updates: Partial<CreateServiceCatalogItemDto>): ServiceCompletenessStatus {
    const requiredValues = [
      updates.displayName,
      updates.serviceCategory,
      updates.fulfillmentType,
      updates.serviceDescription,
      updates.serviceAvailabilityStatus,
      updates.deliveryMode,
      updates.responsibleServiceOwnerType,
    ];
    const hasRequiredStrings = requiredValues.every((value) => typeof value === 'string' && value.trim().length > 0);
    const hasDocuments = Array.isArray(updates.requiredInputsOrDocuments) && updates.requiredInputsOrDocuments.length > 0;
    return hasRequiredStrings && hasDocuments ? ServiceCompletenessStatus.COMPLETE : ServiceCompletenessStatus.INCOMPLETE;
  }
}

function normalizeServiceName(value: string): string {
  return value.toLowerCase().replace(/\b(best|offer|urgent|new|limited|deal)\b/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function slugify(value: string): string {
  const slug = normalizeServiceName(value).replace(/\s+/g, '-');
  return slug || 'service';
}
function shortHash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 8);
}

