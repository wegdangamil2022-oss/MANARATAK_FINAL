import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  UniversityImportCompletenessState,
  UniversityStatus,
  UpdateUniversityDto
} from '@manaratak/domain';
import { AdminUniversityUseCases } from '@manaratak/application';

export class UniversityAdminRouter {
  public static create(cradle: { adminUniversityUseCases: AdminUniversityUseCases }): Router {
    const router = Router();
    const { adminUniversityUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      status: z.nativeEnum(UniversityStatus).optional(),
      completenessStatus: z.nativeEnum(UniversityImportCompletenessState).optional(),
      country: z.string().optional(),
      search: z.string().trim().min(1).max(200).optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(50),
    });

    const updateBodySchema = z.object({
      displayName: z.string().optional(),
      officialWebsite: z.string().url().optional(),
      country: z.string().optional(),
      institutionType: z.string().optional(),
      sourceUrl: z.union([z.string().url(), z.literal('')]).optional(),
      officialSourceUrl: z.union([z.string().url(), z.literal('')]).optional(),
      city: z.string().optional(),
      logoAssetId: z.string().optional(),
      foundedYear: z.number().int().min(1000).max(new Date().getFullYear()).nullable().optional(),
      localizedNames: z.record(z.string(), z.string()).optional(),
      campuses: z.array(z.record(z.string(), z.unknown())).optional(),
      accreditations: z.array(z.record(z.string(), z.unknown())).optional(),
      rankings: z.array(z.record(z.string(), z.unknown())).optional(),
      description: z.string().optional(),
      languagesOfInstruction: z.array(z.string()).optional(),
      tuitionReferences: z.array(z.record(z.string(), z.unknown())).optional(),
      admissionRequirements: z.array(z.record(z.string(), z.unknown())).optional(),
      academicPrograms: z.array(z.record(z.string(), z.unknown())).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      socialLinks: z.record(z.string(), z.string().url()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      const result = await adminUniversityUseCases.listUniversities(filters);
      res.json(result);
    }));

    router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      const university = await adminUniversityUseCases.getUniversity(req.params.id);
      res.json(university);
    }));

    router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
      const updates = updateBodySchema.parse(req.body);

      const optionalFields: Record<string, unknown> = {};
      if (updates.localizedNames !== undefined) optionalFields.localizedNames = updates.localizedNames;
      if (updates.campuses !== undefined) optionalFields.campuses = updates.campuses;
      if (updates.accreditations !== undefined) optionalFields.accreditations = updates.accreditations;
      if (updates.rankings !== undefined) optionalFields.rankings = updates.rankings;
      if (updates.description !== undefined) optionalFields.description = updates.description;
      if (updates.languagesOfInstruction !== undefined) optionalFields.languagesOfInstruction = updates.languagesOfInstruction;
      if (updates.tuitionReferences !== undefined) optionalFields.tuitionReferences = updates.tuitionReferences;
      if (updates.admissionRequirements !== undefined) optionalFields.admissionRequirements = updates.admissionRequirements;
      if (updates.academicPrograms !== undefined) optionalFields.academicPrograms = updates.academicPrograms;
      if (updates.contactEmail !== undefined) optionalFields.contactEmail = updates.contactEmail;
      if (updates.contactPhone !== undefined) optionalFields.contactPhone = updates.contactPhone;
      if (updates.socialLinks !== undefined) optionalFields.socialLinks = updates.socialLinks;
      if (updates.metadata !== undefined) optionalFields.metadata = updates.metadata;

      const dataToUpdate: UpdateUniversityDto = {
        displayName: updates.displayName,
        officialWebsite: updates.officialWebsite,
        country: updates.country,
        institutionType: updates.institutionType,
        sourceUrl: updates.sourceUrl === '' ? null : updates.sourceUrl,
        officialSourceUrl: updates.officialSourceUrl === '' ? null : updates.officialSourceUrl,
        city: updates.city,
        logoAssetId: updates.logoAssetId,
        foundedYear: updates.foundedYear,
      };

      if (Object.keys(optionalFields).length > 0) {
        dataToUpdate.optionalFields = optionalFields;
      }

      const university = await adminUniversityUseCases.updateUniversity(req.params.id, dataToUpdate);
      res.json(university);
    }));

    router.post('/:id/mark-ready', asyncHandler(async (req: Request, res: Response) => {
      await adminUniversityUseCases.markReadyToReview(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/mark-publishable', asyncHandler(async (req: Request, res: Response) => {
      await adminUniversityUseCases.markReadyToPublish(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      await adminUniversityUseCases.publish(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/unpublish', asyncHandler(async (req: Request, res: Response) => {
      await adminUniversityUseCases.unpublish(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
      await adminUniversityUseCases.reject(req.params.id);
      res.status(200).json({ success: true });
    }));

    router.post('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      await adminUniversityUseCases.archive(req.params.id);
      res.status(200).json({ success: true });
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
