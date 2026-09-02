import { Router } from 'express';
import { ManageSearchUseCase } from '@manaratak/application';
import { z } from 'zod';

const searchScalar = z.union([z.string().max(500), z.number().finite(), z.boolean(), z.null()]);
const searchRequestSchema = z.object({
  scope: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9:_-]+$/),
  criteria: z.object({
    query: z.string().trim().max(200).optional(),
    filters: z.array(z.object({
      field: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9._-]+$/),
      operator: z.string().trim().min(1).max(40).regex(/^[A-Z_]+$/),
      value: z.union([searchScalar, z.array(searchScalar).max(50)]),
    }).strict()).max(20).optional(),
    logicalOperator: z.enum(['AND', 'OR']).optional(),
  }).strict(),
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(10_000),
    limit: z.coerce.number().int().min(1).max(100),
  }).strict(),
  sorting: z.object({
    field: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9._-]+$/),
    direction: z.enum(['ASC', 'DESC']),
  }).strict().optional(),
}).strict();

export class SearchRouter {
  public static create({ manageSearchUseCase  }: { manageSearchUseCase: ManageSearchUseCase }): Router {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        const dto = searchRequestSchema.parse(req.body);

        const result = await manageSearchUseCase.executeSearch({
          scope: dto.scope,
          criteria: {
            query: dto.criteria.query,
            filters: dto.criteria.filters,
            logicalOperator: dto.criteria.logicalOperator,
          },
          pagination: {
            page: Number(dto.pagination.page),
            limit: Number(dto.pagination.limit),
          },
          sorting: dto.sorting ? {
            field: dto.sorting.field,
            direction: dto.sorting.direction,
          } : undefined,
        });

        const payload = {
          requestId: result.getRequestId().getValue(),
          reference: result.getReference().getValue(),
          matches: result.getMatches().map((match: any) => ({
            target: {
              entityNamespace: match.getTarget().getEntityNamespace(),
              resourceKey: match.getTarget().getResourceKey(),
            },
            score: match.getScore(),
            payload: match.getPayload(),
          })),
          totalCount: result.getTotalCount(),
          executionTimeMs: result.getExecutionTimeMs(),
        };

        res.status(200).json(payload);
      } catch (error: unknown) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'SEARCH_REQUEST_INVALID' });
        next(error);
      }
    });

    router.get('/history/:reference', async (req, res, next) => {
      try {
        const reference = z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/).parse(req.params.reference);
        const results = await manageSearchUseCase.getSearchRequestHistory(reference);

        const payload = results.map(request => ({
          id: request.getId().getValue(),
          reference: request.getReference().getValue(),
          scope: request.getScope().getValue(),
          criteria: {
            query: request.getCriteria().getQuery(),
            filters: request.getCriteria().getFilters().map((f: any) => ({
              field: f.getField(),
              operator: f.getOperator(),
              value: f.getValue(),
            })),
            logicalOperator: request.getCriteria().getLogicalOperator(),
          },
          pagination: {
            page: request.getPagination().getPage(),
            limit: request.getPagination().getLimit(),
            offset: request.getPagination().getOffset(),
          },
          sorting: request.getSorting() ? {
            field: request.getSorting()?.getField(),
            direction: request.getSorting()?.getDirection(),
          } : undefined,
          timestamp: request.getTimestamp().toISOString(),
          isCompleted: request.getIsCompleted(),
          isExpired: request.getIsExpired(),
        }));

        res.status(200).json(payload);
      } catch (error: unknown) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'SEARCH_REFERENCE_INVALID' });
        next(error);
      }
    });

    return router;
  }
}
