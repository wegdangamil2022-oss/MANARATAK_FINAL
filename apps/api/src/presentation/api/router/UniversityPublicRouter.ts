import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LocalizedPublicUniversityUseCases } from '@manaratak/application';
import { IReferenceDataRepository, IUniversityRepository, PublicUniversityFilters } from '@manaratak/domain';
import { localeQuerySchema, parseRequestLocale, toApiValidationErrorPayload } from '../locale/LocaleQueryContract';

export class UniversityPublicRouter {
  public static create(cradle: { universityRepository: IUniversityRepository; referenceDataRepository: IReferenceDataRepository }): Router {
    const router = Router();
    const localized = new LocalizedPublicUniversityUseCases(cradle.universityRepository);

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      country: z.string().optional(),
      institutionType: z.string().optional(),
      city: z.string().optional(),
      page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform((val) => Math.min(val ? parseInt(val, 10) : 20, 50)),
    }).merge(localeQuerySchema);

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const { locale, ...filters } = listQuerySchema.parse(req.query);
      let resolvedFilters: PublicUniversityFilters = filters;
      if (filters.country) {
        const country = await cradle.referenceDataRepository.getCountry(filters.country.toUpperCase());
        if (!country) throw new Error('COUNTRY_FILTER_NOT_FOUND');
        const { country: _country, ...rest } = filters;
        resolvedFilters = { ...rest, countryReferenceId: country.id };
      }
      res.json(await localized.listUniversities(resolvedFilters, locale));
    }));

    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      try {
        res.json(await localized.getUniversity(req.params.slug, parseRequestLocale(req.query)));
      } catch (err: any) {
        if (err.message === 'University not found') return res.status(404).json({ error: 'Not found' });
        throw err;
      }
    }));

    router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError) return res.status(400).json(toApiValidationErrorPayload(err));
      res.status(500).json({ error: 'Internal Server Error' });
    });
    return router;
  }
}
