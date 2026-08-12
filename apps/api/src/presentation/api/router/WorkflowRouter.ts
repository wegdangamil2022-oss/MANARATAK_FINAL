import { Router } from 'express';
import { ManageWorkflowsUseCase } from '@manaratak/application';

export class WorkflowRouter {
  public static create({ manageWorkflowsUseCase  }: { manageWorkflowsUseCase: ManageWorkflowsUseCase }): Router {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        const result = await manageWorkflowsUseCase.createWorkflow(req.body);
        res.status(201).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/activate', async (req, res, next) => {
      try {
        const result = await manageWorkflowsUseCase.activateWorkflow(req.params.reference);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/transition', async (req, res, next) => {
      try {
        const dto = { reference: req.params.reference, toState: req.body.toState };
        const result = await manageWorkflowsUseCase.transitionWorkflow(dto);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/archive', async (req, res, next) => {
      try {
        const result = await manageWorkflowsUseCase.archiveWorkflow(req.params.reference);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
