import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ReferenceDataUseCases } from '@manaratak/application';

export class ReferenceDataAdminRouter {
  public static create(cradle: { referenceDataUseCases: ReferenceDataUseCases }): Router {
    const router = Router();
    const { referenceDataUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const countrySchema = z.object({
      iso2Code: z.string().length(2),
      iso3Code: z.string().length(3),
      name: z.string().min(1),
      officialName: z.string().nullable().optional(),
      region: z.string().nullable().optional(),
      subregion: z.string().nullable().optional(),
      defaultCurrencyCode: z.string().nullable().optional(),
      defaultLanguageCode: z.string().nullable().optional(),
      callingCode: z.string().nullable().optional(),
      flagAssetId: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const currencySchema = z.object({
      isoCode: z.string().length(3),
      numericCode: z.string().nullable().optional(),
      name: z.string().min(1),
      symbol: z.string().nullable().optional(),
      minorUnit: z.number().int().min(0).nullable().optional(),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const languageSchema = z.object({
      isoCode: z.string().min(2),
      name: z.string().min(1),
      nativeName: z.string().nullable().optional(),
      direction: z.enum(['LTR', 'RTL']),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const citySchema = z.object({
      countryIso2Code: z.string().length(2),
      name: z.string().min(1),
      region: z.string().nullable().optional(),
      timezone: z.string().nullable().optional(),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      administrativeRegionId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const querySchema = z.object({
      region: z.string().optional(),
      countryIso2Code: z.string().optional(),
      q: z.string().optional(),
      activeOnly: z.coerce.boolean().optional(),
    });

    router.get('/countries', asyncHandler(async (req: Request, res: Response) => {
      const filters = querySchema.parse(req.query);
      res.json({ data: await referenceDataUseCases.listCountries(filters) });
    }));

    router.get('/countries/:iso2Code', asyncHandler(async (req: Request, res: Response) => {
      const country = await referenceDataUseCases.getCountry(req.params.iso2Code);
      if (!country) return res.status(404).json({ error: 'Country not found' });
      res.json(country);
    }));

    router.put('/countries/:iso2Code', asyncHandler(async (req: Request, res: Response) => {
      const body = countrySchema.parse({ ...req.body, iso2Code: req.params.iso2Code });
      res.json(await referenceDataUseCases.upsertCountry(body));
    }));

    router.put('/currencies/:isoCode', asyncHandler(async (req: Request, res: Response) => {
      const body = currencySchema.parse({ ...req.body, isoCode: req.params.isoCode });
      res.json(await referenceDataUseCases.upsertCurrency(body));
    }));

    router.put('/languages/:isoCode', asyncHandler(async (req: Request, res: Response) => {
      const body = languageSchema.parse({ ...req.body, isoCode: req.params.isoCode });
      res.json(await referenceDataUseCases.upsertLanguage(body));
    }));

    router.put('/cities', asyncHandler(async (req: Request, res: Response) => {
      const body = citySchema.parse(req.body);
      res.json(await referenceDataUseCases.upsertCity(body));
    }));

    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err instanceof Error ? err.message : 'An error occurred' });
    });

    return router;
  }
}
