import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  ServiceAvailabilityStatus,
  ServiceCategory,
  ServiceDeliveryMode,
  ServiceFulfillmentType,
  ServiceStatus,
  ServiceCompletenessStatus,
  UpdateServiceCatalogItemDto
} from '@manaratak/domain';
import { AdminServiceCatalogUseCases } from '@manaratak/application';

export class ServiceAdminRouter {
  public static create(cradle: { adminServiceCatalogUseCases: AdminServiceCatalogUseCases }): Router {
    const router = Router();
    const { adminServiceCatalogUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      status: z.nativeEnum(ServiceStatus).optional(),
      completenessStatus: z.nativeEnum(ServiceCompletenessStatus).optional(),
      serviceCategory: z.nativeEnum(ServiceCategory).optional(),
      fulfillmentType: z.nativeEnum(ServiceFulfillmentType).optional(),
      serviceAvailabilityStatus: z.nativeEnum(ServiceAvailabilityStatus).optional(),
      deliveryMode: z.nativeEnum(ServiceDeliveryMode).optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(parseInt(value, 10), 50) : 20)
    });

    const serviceBodySchema = z.object({
      displayName: z.string().min(1),
      serviceCategory: z.nativeEnum(ServiceCategory),
      fulfillmentType: z.nativeEnum(ServiceFulfillmentType),
      serviceDescription: z.string().min(1),
      serviceAvailabilityStatus: z.nativeEnum(ServiceAvailabilityStatus),
      requiredInputsOrDocuments: z.array(z.string().min(1)).min(1),
      deliveryMode: z.nativeEnum(ServiceDeliveryMode),
      responsibleServiceOwnerType: z.string().min(1),
      providerName: z.string().nullable().optional(),
      providerReferenceId: z.string().nullable().optional(),
      estimatedDeliveryTime: z.string().nullable().optional(),
      slaPolicy: z.record(z.string(), z.unknown()).nullable().optional(),
      appointmentRequired: z.boolean().nullable().optional(),
      supportedCountries: z.array(z.string()).nullable().optional(),
      supportedLanguages: z.array(z.string()).nullable().optional(),
      servicePrerequisites: z.array(z.string()).nullable().optional(),
      deliveryArtifactTypes: z.array(z.string()).nullable().optional(),
      pricingReferenceId: z.string().nullable().optional(),
      thumbnailAssetId: z.string().nullable().optional(),
      publicDisplayMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      optionalFields: z.record(z.string(), z.unknown()).nullable().optional()
    });

    const updateBodySchema = serviceBodySchema.partial();

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      res.json(await adminServiceCatalogUseCases.listServices(filters));
    }));

    router.post('/', asyncHandler(async (req: Request, res: Response) => {
      const body = serviceBodySchema.parse(req.body);
      res.status(201).json(await adminServiceCatalogUseCases.createService(body));
    }));

    router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminServiceCatalogUseCases.getService(req.params.id));
    }));

    router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
      const updates = updateBodySchema.parse(req.body) as UpdateServiceCatalogItemDto;
      res.json(await adminServiceCatalogUseCases.updateService(req.params.id, updates));
    }));

    router.post('/:id/mark-ready', asyncHandler(async (req: Request, res: Response) => {
      await adminServiceCatalogUseCases.markReadyToReview(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/mark-publishable', asyncHandler(async (req: Request, res: Response) => {
      await adminServiceCatalogUseCases.markReadyToPublish(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      await adminServiceCatalogUseCases.publish(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/unpublish', asyncHandler(async (req: Request, res: Response) => {
      await adminServiceCatalogUseCases.unpublish(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
      await adminServiceCatalogUseCases.reject(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      await adminServiceCatalogUseCases.archive(req.params.id);
      res.json({ success: true });
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
