import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ReferenceDataUseCases } from '@manaratak/application';

export class ReferenceDataPublicRouter {
  public static create(cradle: { referenceDataUseCases: ReferenceDataUseCases }): Router {
    const router = Router();
    const { referenceDataUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const querySchema = z.object({
      region: z.string().optional(),
      countryIso2Code: z.string().optional(),
      q: z.string().optional(),
      page: z.coerce.number().int().min(1).optional(),
      pageSize: z.coerce.number().int().min(1).max(100).optional()
    });

    router.get('/countries', asyncHandler(async (req: Request, res: Response) => {
      const filters = querySchema.parse(req.query);
      res.json({ data: await referenceDataUseCases.listCountries(filters) });
    }));

    router.get('/countries/:iso2Code', asyncHandler(async (req: Request, res: Response) => {
      res.json(await referenceDataUseCases.getCountry(req.params.iso2Code));
    }));

    router.get('/currencies', asyncHandler(async (req: Request, res: Response) => {
      const filters = querySchema.parse(req.query);
      res.json({ data: await referenceDataUseCases.listCurrencies(filters) });
    }));

    router.get('/languages', asyncHandler(async (req: Request, res: Response) => {
      const filters = querySchema.parse(req.query);
      res.json({ data: await referenceDataUseCases.listLanguages(filters) });
    }));

    router.get('/cities', asyncHandler(async (req: Request, res: Response) => {
      const filters = querySchema.parse(req.query);
      res.json({ data: await referenceDataUseCases.listCities(filters) });
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
