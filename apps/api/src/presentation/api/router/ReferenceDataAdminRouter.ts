import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  ReferenceDataInvariantError,
  ReferenceDataNotFoundError,
  ReferenceDataUseCases,
  ReferenceDataValidationError,
} from '@manaratak/application';

export class ReferenceDataAdminRouter {
  public static create(cradle: { referenceDataUseCases: ReferenceDataUseCases }): Router {
    const router = Router();
    const { referenceDataUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const mutationContext = (req: Request) => {
      if (!req.authUserId) throw new Error('AUTHENTICATED_ADMIN_ACTOR_REQUIRED');
      return {
        actorId: req.authUserId,
        actorType: 'IDENTITY',
        correlationId:
          (req.headers['x-correlation-id'] as string | undefined) ||
          (req.headers['x-request-id'] as string | undefined),
        source: 'admin-reference-data-api',
      };
    };

    const countrySchema = z.object({
      iso2Code: z.string().regex(/^[A-Z]{2}$/),
      iso3Code: z.string().regex(/^[A-Z]{3}$/),
      name: z.string().min(1),
      nameAr: z.string().min(1).nullable().optional(),
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
      isoCode: z.string().regex(/^[A-Z]{3}$/),
      numericCode: z.string().regex(/^\d{3}$/).nullable().optional(),
      name: z.string().min(1),
      nameAr: z.string().min(1).nullable().optional(),
      symbol: z.string().nullable().optional(),
      minorUnit: z.number().int().min(0).max(4).nullable().optional(),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const languageSchema = z.object({
      isoCode: z.string().regex(/^[a-z]{2,8}(-[a-z0-9]+)*$/),
      name: z.string().min(1),
      nameAr: z.string().min(1).nullable().optional(),
      nativeName: z.string().nullable().optional(),
      direction: z.enum(['LTR', 'RTL']),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const citySchema = z.object({
      countryIso2Code: z.string().regex(/^[A-Z]{2}$/),
      name: z.string().min(1),
      nameAr: z.string().min(1).nullable().optional(),
      region: z.string().nullable().optional(),
      timezone: z.string().nullable().optional(),
      latitude: z.number().min(-90).max(90).nullable().optional(),
      longitude: z.number().min(-180).max(180).nullable().optional(),
      administrativeRegionId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const explicitBooleanQuery = z.preprocess((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return true;
        if (normalized === 'false' || normalized === '0') return false;
      }
      return value;
    }, z.boolean().optional());

    const querySchema = z.object({
      region: z.string().optional(),
      countryIso2Code: z.string().optional(),
      q: z.string().optional(),
      activeOnly: explicitBooleanQuery,
    });

    const countryImportPreviewSchema = z.object({
      sourceName: z.string().min(1).max(200),
      sourceVersion: z.string().min(1).max(100),
      sha256: z
        .string()
        .regex(/^[a-fA-F0-9]{64}$/)
        .optional(),
      records: z.array(z.record(z.string(), z.unknown())).min(1).max(500),
    });

    router.get(
      '/countries',
      asyncHandler(async (req: Request, res: Response) => {
        const filters = querySchema.parse(req.query);
        res.json({ data: await referenceDataUseCases.listCountries(filters) });
      }),
    );

    router.post(
      '/countries/import-preview',
      asyncHandler(async (req: Request, res: Response) => {
        const input = countryImportPreviewSchema.parse(req.body);
        res.json(referenceDataUseCases.previewCountryImport(input));
      }),
    );

    router.post(
      '/countries/derived-reference-preview',
      asyncHandler(async (req: Request, res: Response) => {
        const input = z
          .object({ records: z.array(z.record(z.string(), z.unknown())).min(1).max(500) })
          .parse(req.body);
        res.json(referenceDataUseCases.previewCountryDerivedReferences(input.records));
      }),
    );

    router.get(
      '/countries/:iso2Code',
      asyncHandler(async (req: Request, res: Response) => {
        const country = await referenceDataUseCases.getCountry(req.params.iso2Code);
        if (!country) return res.status(404).json({ error: 'Country not found' });
        res.json(country);
      }),
    );

    router.get(
      '/regions',
      asyncHandler(async (req: Request, res: Response) => {
        const filters = querySchema.parse(req.query);
        res.json({ data: await referenceDataUseCases.listRegions(filters) });
      }),
    );

    router.get(
      '/cities',
      asyncHandler(async (req: Request, res: Response) => {
        const filters = querySchema.parse(req.query);
        res.json({ data: await referenceDataUseCases.listCities(filters) });
      }),
    );

    router.put(
      '/countries/:iso2Code',
      asyncHandler(async (req: Request, res: Response) => {
        const body = countrySchema.parse({ ...req.body, iso2Code: req.params.iso2Code });
        res.json(await referenceDataUseCases.upsertCountry(body, mutationContext(req)));
      }),
    );

    router.put(
      '/currencies/:isoCode',
      asyncHandler(async (req: Request, res: Response) => {
        const body = currencySchema.parse({ ...req.body, isoCode: req.params.isoCode });
        res.json(await referenceDataUseCases.upsertCurrency(body, mutationContext(req)));
      }),
    );

    router.put(
      '/languages/:isoCode',
      asyncHandler(async (req: Request, res: Response) => {
        const body = languageSchema.parse({ ...req.body, isoCode: req.params.isoCode });
        res.json(await referenceDataUseCases.upsertLanguage(body, mutationContext(req)));
      }),
    );

    router.put(
      '/cities',
      asyncHandler(async (req: Request, res: Response) => {
        const body = citySchema.parse(req.body);
        res.json(await referenceDataUseCases.upsertCity(body, mutationContext(req)));
      }),
    );

    router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      if (err instanceof ReferenceDataValidationError) {
        return res.status(422).json({ error: err.code, entityType: err.entityType, details: err.issues });
      }
      if (err instanceof ReferenceDataNotFoundError) {
        return res.status(404).json({ error: err.code, entityType: err.entityType, reference: err.reference });
      }
      if (err instanceof ReferenceDataInvariantError) {
        return res.status(422).json({ error: err.code, message: err.message });
      }
      return next(err);
    });

    return router;
  }
}
