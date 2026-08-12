import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IServiceCatalogRepository,
  ServiceAvailabilityStatus,
  ServiceCategory,
  ServiceCompletenessStatus,
  ServiceDeliveryMode,
  ServiceFulfillmentType,
  ServiceStatus
} from '@manaratak/domain';
import { AdminServiceCatalogUseCases } from '../../src/services-platform/use-cases/AdminServiceCatalogUseCases';

describe('AdminServiceCatalogUseCases', () => {
  let repository: IServiceCatalogRepository;
  let useCases: AdminServiceCatalogUseCases;

  const completeService = {
    id: 'svc-1',
    publicId: 'svc_public',
    slug: 'visa-review',
    canonicalName: 'visa review',
    canonicalDedupKey: 'visa review|VISA_SERVICES|CONSULTATION|ONLINE',
    displayName: 'Visa Review',
    serviceCategory: ServiceCategory.VISA_SERVICES,
    fulfillmentType: ServiceFulfillmentType.CONSULTATION,
    serviceDescription: 'Review visa readiness.',
    serviceAvailabilityStatus: ServiceAvailabilityStatus.AVAILABLE,
    requiredInputsOrDocuments: ['Passport'],
    deliveryMode: ServiceDeliveryMode.ONLINE,
    responsibleServiceOwnerType: 'MANARATAK_TEAM',
    status: ServiceStatus.READY_TO_PUBLISH,
    completenessStatus: ServiceCompletenessStatus.COMPLETE,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    repository = {
      create: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'svc-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
      update: vi.fn(),
      findById: vi.fn().mockResolvedValue(completeService),
      findBySlug: vi.fn(),
      findByDedupKey: vi.fn().mockResolvedValue(null),
      updateStatus: vi.fn(),
      list: vi.fn(),
      listPublished: vi.fn()
    };
    useCases = new AdminServiceCatalogUseCases(repository);
  });

  it('creates a complete service catalog item with generated identity fields', async () => {
    const result = await useCases.createService({
      displayName: 'Visa Review',
      serviceCategory: ServiceCategory.VISA_SERVICES,
      fulfillmentType: ServiceFulfillmentType.CONSULTATION,
      serviceDescription: 'Review visa readiness.',
      serviceAvailabilityStatus: ServiceAvailabilityStatus.AVAILABLE,
      requiredInputsOrDocuments: ['Passport'],
      deliveryMode: ServiceDeliveryMode.ONLINE,
      responsibleServiceOwnerType: 'MANARATAK_TEAM'
    });

    expect(result.slug).toBe('visa-review');
    expect(result.completenessStatus).toBe(ServiceCompletenessStatus.COMPLETE);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      canonicalDedupKey: 'visa review|VISA_SERVICES|CONSULTATION|ONLINE'
    }));
  });

  it('prevents publishing unless the service is ready to publish', async () => {
    vi.mocked(repository.findById).mockResolvedValueOnce({
      ...completeService,
      status: ServiceStatus.READY_TO_REVIEW
    });

    await expect(useCases.publish('svc-1')).rejects.toThrow('READY_TO_PUBLISH');
  });
});
