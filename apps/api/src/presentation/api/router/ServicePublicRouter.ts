import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  ServiceAvailabilityStatus,
  ServiceCategory,
  ServiceDeliveryMode,
  ServiceFulfillmentType
} from '@manaratak/domain';
import { PublicServiceCatalogUseCases } from '@manaratak/application';

export class ServicePublicRouter {
  public static create(cradle: { publicServiceCatalogUseCases: PublicServiceCatalogUseCases }): Router {
    const router = Router();
    const { publicServiceCatalogUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      serviceCategory: z.nativeEnum(ServiceCategory).optional(),
      fulfillmentType: z.nativeEnum(ServiceFulfillmentType).optional(),
      serviceAvailabilityStatus: z.nativeEnum(ServiceAvailabilityStatus).optional(),
      deliveryMode: z.nativeEnum(ServiceDeliveryMode).optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(parseInt(value, 10), 50) : 20)
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      res.json(await publicServiceCatalogUseCases.listServices(filters));
    }));

    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      res.json(await publicServiceCatalogUseCases.getService(req.params.slug));
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(err.message === 'Service not found' ? 404 : 400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
