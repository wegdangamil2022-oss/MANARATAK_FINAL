import { Router } from 'express';
import { ManageApiServicesUseCase } from '@manaratak/application';

export class ApiFoundationRouter {
  public static create({ manageApiServicesUseCase  }: { manageApiServicesUseCase: ManageApiServicesUseCase }): Router {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        const result = await manageApiServicesUseCase.createApiService(req.body);
        res.status(201).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.get('/', async (req, res, next) => {
      try {
        const criteria = {
          ownerReference: req.query.ownerReference as string,
          lifecycleState: req.query.lifecycleState as string
        };
        const result = await manageApiServicesUseCase.listApiServices(criteria);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.get('/:reference', async (req, res, next) => {
      try {
        const result = await manageApiServicesUseCase.getApiServiceByReference(req.params.reference);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/activate', async (req, res, next) => {
      try {
        const result = await manageApiServicesUseCase.activateApiService(req.params.reference);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/deprecate', async (req, res, next) => {
      try {
        const result = await manageApiServicesUseCase.deprecateApiService(req.params.reference);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/archive', async (req, res, next) => {
      try {
        const result = await manageApiServicesUseCase.archiveApiService(req.params.reference);
        res.status(200).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:reference/publish-version', async (req, res, next) => {
      try {
        const dto = {
          reference: req.params.reference,
          endpoints: req.body.endpoints,
          operations: req.body.operations,
          version: req.body.version,
          contractMetadata: req.body.contractMetadata,
          compatibilityMetadata: req.body.compatibilityMetadata,
          exposureIntent: req.body.exposureIntent,
          metadata: req.body.metadata
        };
        const result = await manageApiServicesUseCase.publishVersion(dto);
        res.status(201).json(result);
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
