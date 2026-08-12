import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PublicAcademicTaxonomyUseCases } from '@manaratak/application';
import {
  AcademicTaxonomyNodeType,
  AcademicTaxonomyStatus,
  AcademicStandardType,
} from '@manaratak/domain';

export class AcademicTaxonomyPublicRouter {
  public static create(cradle: {
    publicAcademicTaxonomyUseCases: PublicAcademicTaxonomyUseCases;
  }): Router {
    const router = Router();
    const { publicAcademicTaxonomyUseCases } = cradle;

    const asyncHandler =
      (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
      };

    const nodeTypeSchema = z.nativeEnum(AcademicTaxonomyNodeType);
    const statusSchema = z.nativeEnum(AcademicTaxonomyStatus);
    const standardTypeSchema = z.nativeEnum(AcademicStandardType);

    const listNodesQuerySchema = z.object({
      nodeType: nodeTypeSchema.optional(),
      standardType: standardTypeSchema.optional(),
      status: statusSchema.optional(),
      q: z.string().optional(),
    });

    const getByKeyQuerySchema = z.object({
      nodeType: nodeTypeSchema,
      canonicalCode: z.string().min(1),
      standardType: standardTypeSchema.optional(),
    });

    const searchQuerySchema = z.object({
      q: z.string().min(1),
      nodeType: nodeTypeSchema.optional(),
      standardType: standardTypeSchema.optional(),
      status: statusSchema.optional(),
    });

    router.get(
      '/nodes',
      asyncHandler(async (req: Request, res: Response) => {
        const filters = listNodesQuerySchema.parse(req.query);
        const nodes = await publicAcademicTaxonomyUseCases.listNodes(filters);
        res.json({ data: nodes });
      })
    );

    router.get(
      '/nodes/by-key',
      asyncHandler(async (req: Request, res: Response) => {
        const input = getByKeyQuerySchema.parse(req.query);
        const node = await publicAcademicTaxonomyUseCases.getNodeByCanonicalKey(input);
        if (!node) {
          return res.status(404).json({ error: 'Academic taxonomy node not found' });
        }
        res.json(node);
      })
    );

    router.get(
      '/nodes/:nodeId',
      asyncHandler(async (req: Request, res: Response) => {
        const { nodeId } = req.params;
        const node = await publicAcademicTaxonomyUseCases.getNode(nodeId);
        if (!node) {
          return res.status(404).json({ error: 'Academic taxonomy node not found' });
        }
        res.json(node);
      })
    );

    router.get(
      '/nodes/:nodeId/children',
      asyncHandler(async (req: Request, res: Response) => {
        const { nodeId } = req.params;
        const children = await publicAcademicTaxonomyUseCases.listChildren(nodeId);
        res.json({ data: children });
      })
    );

    router.get(
      '/nodes/:nodeId/parents',
      asyncHandler(async (req: Request, res: Response) => {
        const { nodeId } = req.params;
        const parents = await publicAcademicTaxonomyUseCases.listParents(nodeId);
        res.json({ data: parents });
      })
    );

    router.get(
      '/search',
      asyncHandler(async (req: Request, res: Response) => {
        const { q, nodeType, standardType, status } = searchQuerySchema.parse(req.query);
        const filters = { nodeType, standardType, status };
        const nodes = await publicAcademicTaxonomyUseCases.searchNodes(q, filters);
        res.json({ data: nodes });
      })
    );

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
