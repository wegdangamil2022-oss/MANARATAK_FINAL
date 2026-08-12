import { Router, Request, Response } from 'express';
import { ManageFilesUseCase } from '@manaratak/application';
import { ResponseFormatter } from '../response/ResponseFormatter';

export class FileManagementRouter {
  public static create({ manageFilesUseCase  }: { manageFilesUseCase: ManageFilesUseCase }): Router {
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');
    const useCase = manageFilesUseCase;

    router.post('/upload-locator', async (req: Request, res: Response) => {
      try {
        const locator = await useCase.generateUploadLocator(req.body);
        res.status(200).json(responseFormatter.success({ locator }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: error.message }));
      }
    });

    router.post('/register', async (req: Request, res: Response) => {
      try {
        await useCase.registerFile(req.body);
        res.status(201).json(responseFormatter.success({ message: 'File registered successfully' }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: error.message }));
      }
    });

    router.post('/:fileId/activate', async (req: Request, res: Response) => {
      try {
        await useCase.activateFile({ fileId: req.params.fileId, ...req.body });
        res.status(200).json(responseFormatter.success({ message: 'File activated successfully' }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: error.message }));
      }
    });

    router.post('/:fileId/archive', async (req: Request, res: Response) => {
      try {
        await useCase.archiveFile({ fileId: req.params.fileId });
        res.status(200).json(responseFormatter.success({ message: 'File archived successfully' }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: error.message }));
      }
    });

    router.delete('/:fileId', async (req: Request, res: Response) => {
      try {
        await useCase.softDeleteFile({ fileId: req.params.fileId });
        res.status(200).json(responseFormatter.success({ message: 'File soft deleted successfully' }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: error.message }));
      }
    });

    router.post('/:fileId/restore', async (req: Request, res: Response) => {
      try {
        await useCase.restoreFile({ fileId: req.params.fileId });
        res.status(200).json(responseFormatter.success({ message: 'File restored successfully' }));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: error.message }));
      }
    });

    return router;
  }
}
