import { PrismaClient } from '@prisma/client';
import {
  CreateServiceCatalogItemDto,
  CreateServiceRequestDto,
  IServiceCatalogRepository,
  IServiceRequestRepository,
  PaginatedServiceCatalogResult,
  PaginatedServiceRequestResult,
  PublicServiceCatalogFilters,
  ServiceCatalogFilters,
  ServiceCatalogItemDto,
  ServiceRequestDto,
  ServiceRequestFilters,
  ServiceRequestStatus,
  ServiceStatus,
  ServiceCatalogRepositoryUpdateDto,
} from '@manaratak/domain';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
const asStrings = (value: unknown): string[] | null =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : null;

export class PrismaServicePlatformRepository implements IServiceCatalogRepository, IServiceRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private catalog() { return (this.prisma as any).serviceCatalogRecord; }
  private requests() { return (this.prisma as any).serviceRequestRecord; }

  async create(data: CreateServiceCatalogItemDto): Promise<ServiceCatalogItemDto> {
    const row = await this.catalog().create({
      data: {
        publicId: data.publicId,
        slug: data.slug,
        canonicalName: data.canonicalName,
        canonicalDedupKey: data.canonicalDedupKey,
        displayName: data.displayName,
        status: data.status,
        completenessStatus: data.completenessStatus,
        serviceCategory: data.serviceCategory,
        fulfillmentType: data.fulfillmentType,
        serviceDescription: data.serviceDescription,
        serviceAvailabilityStatus: data.serviceAvailabilityStatus,
        requiredInputsOrDocuments: data.requiredInputsOrDocuments,
        deliveryMode: data.deliveryMode,
        responsibleServiceOwnerType: data.responsibleServiceOwnerType,
        providerName: data.providerName,
        providerReferenceId: data.providerReferenceId,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        slaPolicy: data.slaPolicy,
        appointmentRequired: data.appointmentRequired,
        supportedCountryLabels: data.supportedCountries,
        supportedLanguageLabels: data.supportedLanguages,
        servicePrerequisites: data.servicePrerequisites,
        deliveryArtifactTypes: data.deliveryArtifactTypes,
        pricingReferenceId: data.pricingReferenceId,
        thumbnailAssetId: data.thumbnailAssetId,
        publicDisplayMetadata: data.publicDisplayMetadata,
        optionalFields: data.optionalFields,
        supportedCountries: data.supportedCountryReferenceIds?.length ? {
          create: data.supportedCountryReferenceIds.map((countryReferenceId) => ({ countryReferenceId })),
        } : undefined,
        supportedLanguages: data.supportedLanguageReferenceIds?.length ? {
          create: data.supportedLanguageReferenceIds.map((languageReferenceId) => ({ languageReferenceId })),
        } : undefined,
      },
      include: this.catalogInclude(),
    });
    return this.mapCatalog(row);
  }

  async update(id: string, data: ServiceCatalogRepositoryUpdateDto): Promise<ServiceCatalogItemDto> {
    const countryIds = data.supportedCountryReferenceIds;
    const languageIds = data.supportedLanguageReferenceIds;
    const row = await this.catalog().update({
      where: { id },
      data: {
        // publicId is immutable after creation; repository updates must never rewrite identity.
        slug: data.slug,
        canonicalName: data.canonicalName,
        canonicalDedupKey: data.canonicalDedupKey,
        displayName: data.displayName,
        status: data.status,
        completenessStatus: data.completenessStatus,
        serviceCategory: data.serviceCategory,
        fulfillmentType: data.fulfillmentType,
        serviceDescription: data.serviceDescription,
        serviceAvailabilityStatus: data.serviceAvailabilityStatus,
        requiredInputsOrDocuments: data.requiredInputsOrDocuments,
        deliveryMode: data.deliveryMode,
        responsibleServiceOwnerType: data.responsibleServiceOwnerType,
        providerName: data.providerName,
        providerReferenceId: data.providerReferenceId,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        slaPolicy: data.slaPolicy,
        appointmentRequired: data.appointmentRequired,
        supportedCountryLabels: data.supportedCountries,
        supportedLanguageLabels: data.supportedLanguages,
        servicePrerequisites: data.servicePrerequisites,
        deliveryArtifactTypes: data.deliveryArtifactTypes,
        pricingReferenceId: data.pricingReferenceId,
        thumbnailAssetId: data.thumbnailAssetId,
        publicDisplayMetadata: data.publicDisplayMetadata,
        optionalFields: data.optionalFields,
        supportedCountries: countryIds === undefined ? undefined : {
          deleteMany: {},
          create: (countryIds ?? []).map((countryReferenceId) => ({ countryReferenceId })),
        },
        supportedLanguages: languageIds === undefined ? undefined : {
          deleteMany: {},
          create: (languageIds ?? []).map((languageReferenceId) => ({ languageReferenceId })),
        },
      },
      include: this.catalogInclude(),
    });
    return this.mapCatalog(row);
  }

  async findById(id: string) {
    const row = await this.catalog().findUnique({ where: { id }, include: this.catalogInclude() });
    return row ? this.mapCatalog(row) : null;
  }
  async findBySlug(slug: string) {
    const row = await this.catalog().findUnique({ where: { slug }, include: this.catalogInclude() });
    return row ? this.mapCatalog(row) : null;
  }
  async findByDedupKey(canonicalDedupKey: string) {
    const row = await this.catalog().findUnique({ where: { canonicalDedupKey }, include: this.catalogInclude() });
    return row ? this.mapCatalog(row) : null;
  }
  async updateStatus(id: string, status: ServiceStatus): Promise<void> {
    await this.catalog().update({ where: { id }, data: { status } });
  }

  async list(filters: ServiceCatalogFilters): Promise<PaginatedServiceCatalogResult<ServiceCatalogItemDto>> {
    return this.listCatalog(filters, false);
  }
  async listPublished(filters: PublicServiceCatalogFilters): Promise<PaginatedServiceCatalogResult<ServiceCatalogItemDto>> {
    return this.listCatalog({ ...filters, status: ServiceStatus.PUBLISHED }, true);
  }

  private async listCatalog(filters: ServiceCatalogFilters, publishedOnly: boolean) {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const where: any = {
      status: publishedOnly ? ServiceStatus.PUBLISHED : filters.status,
      completenessStatus: filters.completenessStatus,
      serviceCategory: filters.serviceCategory,
      fulfillmentType: filters.fulfillmentType,
      serviceAvailabilityStatus: filters.serviceAvailabilityStatus,
      deliveryMode: filters.deliveryMode,
      supportedCountries: filters.supportedCountryReferenceId ? { some: { countryReferenceId: filters.supportedCountryReferenceId } } : undefined,
      supportedLanguages: filters.supportedLanguageReferenceId ? { some: { languageReferenceId: filters.supportedLanguageReferenceId } } : undefined,
    };
    Object.keys(where).forEach((key) => where[key] === undefined && delete where[key]);
    const [rows, total] = await Promise.all([
      this.catalog().findMany({ where, include: this.catalogInclude(), orderBy: { updatedAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.catalog().count({ where }),
    ]);
    return { data: rows.map((row: any) => this.mapCatalog(row)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createRequest(data: CreateServiceRequestDto): Promise<ServiceRequestDto> {
    return this.mapRequest(await this.requests().create({ data }));
  }
  async findRequestById(id: string) {
    const row = await this.requests().findUnique({ where: { id } });
    return row ? this.mapRequest(row) : null;
  }
  async findRequestByPublicId(publicId: string) {
    const row = await this.requests().findUnique({ where: { publicId } });
    return row ? this.mapRequest(row) : null;
  }
  async listRequests(filters: ServiceRequestFilters): Promise<PaginatedServiceRequestResult> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const where: any = {
      studentReferenceId: filters.studentReferenceId,
      serviceId: filters.serviceId,
      status: filters.status,
    };
    Object.keys(where).forEach((key) => where[key] === undefined && delete where[key]);
    const [rows, total] = await Promise.all([
      this.requests().findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.requests().count({ where }),
    ]);
    return { data: rows.map((row: any) => this.mapRequest(row)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  async updateRequestStatus(id: string, status: ServiceRequestStatus, fulfillmentMetadata?: Record<string, unknown> | null) {
    const row = await this.requests().update({
      where: { id },
      data: { status, fulfillmentMetadata, completedAt: status === ServiceRequestStatus.COMPLETED ? new Date() : undefined },
    });
    return this.mapRequest(row);
  }
  async linkFinanceInvoice(id: string, financeInvoiceId: string, financeInvoicePublicId: string) {
    const row = await this.requests().update({ where: { id }, data: { financeInvoiceId, financeInvoicePublicId, status: ServiceRequestStatus.AWAITING_PAYMENT } });
    return this.mapRequest(row);
  }
  async assignProvider(id: string, providerReferenceId: string) {
    const row = await this.requests().update({ where: { id }, data: { providerReferenceId } });
    return this.mapRequest(row);
  }

  private catalogInclude() {
    return { supportedCountries: true, supportedLanguages: true };
  }

  private mapCatalog(row: any): ServiceCatalogItemDto {
    return {
      id: row.id,
      publicId: row.publicId,
      slug: row.slug,
      canonicalName: row.canonicalName,
      canonicalDedupKey: row.canonicalDedupKey,
      displayName: row.displayName,
      status: row.status,
      completenessStatus: row.completenessStatus,
      serviceCategory: row.serviceCategory,
      fulfillmentType: row.fulfillmentType,
      serviceDescription: row.serviceDescription,
      serviceAvailabilityStatus: row.serviceAvailabilityStatus,
      requiredInputsOrDocuments: asStrings(row.requiredInputsOrDocuments) ?? [],
      deliveryMode: row.deliveryMode,
      responsibleServiceOwnerType: row.responsibleServiceOwnerType,
      providerName: row.providerName,
      providerReferenceId: row.providerReferenceId,
      estimatedDeliveryTime: row.estimatedDeliveryTime,
      slaPolicy: asRecord(row.slaPolicy),
      appointmentRequired: row.appointmentRequired,
      supportedCountryReferenceIds: (row.supportedCountries ?? []).map((item: any) => item.countryReferenceId),
      supportedLanguageReferenceIds: (row.supportedLanguages ?? []).map((item: any) => item.languageReferenceId),
      supportedCountries: asStrings(row.supportedCountryLabels),
      supportedLanguages: asStrings(row.supportedLanguageLabels),
      servicePrerequisites: asStrings(row.servicePrerequisites),
      deliveryArtifactTypes: asStrings(row.deliveryArtifactTypes),
      pricingReferenceId: row.pricingReferenceId,
      thumbnailAssetId: row.thumbnailAssetId,
      publicDisplayMetadata: asRecord(row.publicDisplayMetadata),
      optionalFields: asRecord(row.optionalFields),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapRequest(row: any): ServiceRequestDto {
    return {
      id: row.id,
      publicId: row.publicId,
      studentReferenceId: row.studentReferenceId,
      serviceId: row.serviceId,
      status: row.status,
      requestParameters: asRecord(row.requestParameters) ?? {},
      providerReferenceId: row.providerReferenceId,
      financeInvoiceId: row.financeInvoiceId,
      financeInvoicePublicId: row.financeInvoicePublicId,
      fulfillmentMetadata: asRecord(row.fulfillmentMetadata),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt,
    };
  }
}
