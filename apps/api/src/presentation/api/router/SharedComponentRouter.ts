import { Router, Request, Response } from 'express';
import { ManageSharedComponentsUseCase } from '@manaratak/application';

export class SharedComponentRouter {
  public static create({ manageSharedComponentsUseCase  }: { manageSharedComponentsUseCase: ManageSharedComponentsUseCase }): Router {
    const router = Router();

    router.post('/', async (req: Request, res: Response) => {
      try {
        const result = await manageSharedComponentsUseCase.createComponent(req.body);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    router.post('/:ref/activate', async (req: Request, res: Response) => {
      try {
        const result = await manageSharedComponentsUseCase.activateComponent(req.params.ref);
        res.json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    router.post('/versions', async (req: Request, res: Response) => {
      try {
        const result = await manageSharedComponentsUseCase.publishVersion(req.body);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    router.post('/:ref/deprecate', async (req: Request, res: Response) => {
      try {
        const result = await manageSharedComponentsUseCase.deprecateComponent(req.params.ref);
        res.json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    router.post('/:ref/archive', async (req: Request, res: Response) => {
      try {
        const result = await manageSharedComponentsUseCase.archiveComponent(req.params.ref);
        res.json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    return router;
  }
}
