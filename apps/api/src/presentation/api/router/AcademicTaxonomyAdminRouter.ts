import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AdminAcademicTaxonomyUseCases, AdminMajorUseCases, DegreeLevelUseCases } from '@manaratak/application';
import {
  AcademicTaxonomyNodeType,
  AcademicTaxonomyStatus,
  AcademicStandardType,
  AcademicMappingStrength,
  DegreeLevelStatus,
} from '@manaratak/domain';

export class AcademicTaxonomyAdminRouter {
  public static create(cradle: {
    adminAcademicTaxonomyUseCases: AdminAcademicTaxonomyUseCases;
    degreeLevelUseCases: DegreeLevelUseCases;
    adminMajorUseCases: AdminMajorUseCases;
  }): Router {
    const router = Router();
    const { adminAcademicTaxonomyUseCases, adminMajorUseCases, degreeLevelUseCases } = cradle;

    const asyncHandler =
      (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
      };

    const nodeTypeSchema = z.nativeEnum(AcademicTaxonomyNodeType);
    const statusSchema = z.nativeEnum(AcademicTaxonomyStatus);
    const standardTypeSchema = z.nativeEnum(AcademicStandardType);
    const strengthSchema = z.nativeEnum(AcademicMappingStrength);

    const upsertNodeSchema = z.object({
      nodeType: nodeTypeSchema,
      status: statusSchema.optional(),
      standardType: standardTypeSchema.optional(),
      canonicalCode: z.string().min(1),
      canonicalName: z.string().min(1),
      description: z.string().optional(),
      standardCode: z.string().optional(),
      localizedNames: z.record(z.string(), z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const upsertEdgeSchema = z.object({
      parentNodeId: z.string().min(1),
      childNodeId: z.string().min(1),
      isPrimary: z.boolean().optional(),
    });

    const upsertAliasSchema = z.object({
      nodeId: z.string().min(1),
      alias: z.string().min(1),
      locale: z.string().optional(),
    });

    const upsertMappingSchema = z.object({
      sourceNodeId: z.string().min(1),
      targetNodeId: z.string().min(1),
      sourceStandard: standardTypeSchema,
      targetStandard: standardTypeSchema,
      strength: strengthSchema,
      confidence: z.number().optional(),
      notes: z.string().optional(),
    });

    const importHandoffCommandSchema = z.object({
      seedBatchId: z.string().min(1),
      sourceName: z.string().min(1),
      sourceVersion: z.string().min(1),
      sourceUrl: z.string().optional(),
      records: z.array(z.any()),
      autoMarkReadyIfValid: z.boolean().optional(),
      existingNodes: z.array(z.any()).optional(),
      existingEdges: z.array(z.any()).optional(),
      existingAliases: z.array(z.any()).optional(),
      existingMappings: z.array(z.any()).optional(),
    });

    const listNodesQuerySchema = z.object({
      nodeType: nodeTypeSchema.optional(),
      standardType: standardTypeSchema.optional(),
      status: statusSchema.optional(),
      q: z.string().optional(),
      parentNodeId: z.string().optional(),
      page: z.coerce.number().int().min(1).optional(),
      pageSize: z.coerce.number().int().min(1).max(100).optional(),
    });

    router.get('/nodes', asyncHandler(async (req: Request, res: Response) => {
      const filters = listNodesQuerySchema.parse(req.query);
      res.json({ data: await adminAcademicTaxonomyUseCases.listNodes(filters) });
    }));

    router.get('/nodes/:nodeId', asyncHandler(async (req: Request, res: Response) => {
      const node = await adminAcademicTaxonomyUseCases.getNode(req.params.nodeId);
      if (!node) return res.status(404).json({ error: 'Academic taxonomy node not found' });
      res.json(node);
    }));

    router.get('/nodes/:nodeId/children', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await adminAcademicTaxonomyUseCases.listChildren(req.params.nodeId) });
    }));

    router.get('/nodes/:nodeId/parents', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await adminAcademicTaxonomyUseCases.listParents(req.params.nodeId) });
    }));

    router.get('/nodes/:nodeId/aliases', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await adminAcademicTaxonomyUseCases.listAliases(req.params.nodeId) });
    }));

    router.get('/nodes/:nodeId/mappings', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await adminAcademicTaxonomyUseCases.listMappings(req.params.nodeId) });
    }));

    router.get('/nodes/:nodeId/mapped-majors', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await adminMajorUseCases.listByTaxonomyNode(req.params.nodeId) });
    }));

    router.post(
      '/nodes/validate',
      asyncHandler(async (req: Request, res: Response) => {
        const data = upsertNodeSchema.parse(req.body);
        const report = adminAcademicTaxonomyUseCases.validateNode(data as any);
        res.json(report);
      })
    );

    router.put(
      '/nodes',
      asyncHandler(async (req: Request, res: Response) => {
        const data = upsertNodeSchema.parse(req.body);
        const result = await adminAcademicTaxonomyUseCases.upsertNode(data as any);
        res.json(result);
      })
    );

    router.post(
      '/edges',
      asyncHandler(async (req: Request, res: Response) => {
        const data = upsertEdgeSchema.parse(req.body);
        const edge = await adminAcademicTaxonomyUseCases.addEdge(data);
        res.json(edge);
      })
    );

    router.delete(
      '/edges/by-nodes',
      asyncHandler(async (req: Request, res: Response) => {
        const parentNodeId = req.query.parentNodeId as string;
        const childNodeId = req.query.childNodeId as string;
        if (!parentNodeId || !childNodeId) {
          return res.status(400).json({ error: 'parentNodeId and childNodeId are required' });
        }
        const removed = await adminAcademicTaxonomyUseCases.removeEdgeByNodes(parentNodeId, childNodeId);
        if (!removed) {
          return res.status(404).json({ error: 'Edge not found' });
        }
        res.json({ ok: true });
      })
    );

    router.delete(
      '/aliases/:aliasId',
      asyncHandler(async (req: Request, res: Response) => {
        const { aliasId } = req.params;
        await adminAcademicTaxonomyUseCases.removeAlias(aliasId);
        res.json({ ok: true });
      })
    );

    router.delete(
      '/mappings/:mappingId',
      asyncHandler(async (req: Request, res: Response) => {
        const { mappingId } = req.params;
        await adminAcademicTaxonomyUseCases.removeMapping(mappingId);
        res.json({ ok: true });
      })
    );

    router.delete(
      '/edges/:edgeId',
      asyncHandler(async (req: Request, res: Response) => {
        const { edgeId } = req.params;
        await adminAcademicTaxonomyUseCases.removeEdge(edgeId);
        res.json({ ok: true });
      })
    );

    router.post(
      '/aliases',
      asyncHandler(async (req: Request, res: Response) => {
        const data = upsertAliasSchema.parse(req.body);
        const alias = await adminAcademicTaxonomyUseCases.addAlias(data);
        res.json(alias);
      })
    );

    router.post(
      '/mappings',
      asyncHandler(async (req: Request, res: Response) => {
        const data = upsertMappingSchema.parse(req.body);
        const mapping = await adminAcademicTaxonomyUseCases.addMapping(data);
        res.json(mapping);
      })
    );

    router.post(
      '/import-handoff',
      asyncHandler(async (req: Request, res: Response) => {
        const data = importHandoffCommandSchema.parse(req.body);
        const batch = adminAcademicTaxonomyUseCases.prepareImportHandoff(data as any);
        res.json(batch);
      })
    );

    // --- Degree Levels ---
    const updateDegreeLevelSchema = z.object({
      nameEn: z.string().min(1),
      nameAr: z.string().min(1),
      displayRank: z.number().int().optional(),
      status: z.nativeEnum(DegreeLevelStatus).optional(),
    });

    router.get('/degree-levels', asyncHandler(async (req: Request, res: Response) => {
      const list = await degreeLevelUseCases.list();
      res.json({ data: list });
    }));

    router.get('/degree-levels/:id', asyncHandler(async (req: Request, res: Response) => {
      const item = await degreeLevelUseCases.getById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Degree level not found' });
      res.json(item);
    }));

    router.put('/degree-levels/:id', asyncHandler(async (req: Request, res: Response) => {
      const body = updateDegreeLevelSchema.parse(req.body);
      const updated = await degreeLevelUseCases.update(req.params.id, body);
      if (!updated) {
        return res.status(404).json({ error: 'Degree level not found' });
      }
      res.json(updated);
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
