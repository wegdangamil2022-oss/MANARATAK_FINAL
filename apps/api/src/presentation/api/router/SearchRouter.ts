import { Router } from 'express';
import { ManageSearchUseCase } from '@manaratak/application';

export class SearchRouter {
  public static create({ manageSearchUseCase  }: { manageSearchUseCase: ManageSearchUseCase }): Router {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        const dto = req.body;
        if (!dto.scope) {
          return res.status(400).json({ error: 'Search scope is required' });
        }
        if (!dto.criteria) {
          return res.status(400).json({ error: 'Search criteria is required' });
        }
        if (!dto.pagination) {
          return res.status(400).json({ error: 'Search pagination parameters are required' });
        }

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
      } catch (error: any) {
        next(error);
      }
    });

    router.get('/history/:reference', async (req, res, next) => {
      try {
        const reference = req.params.reference;
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
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
