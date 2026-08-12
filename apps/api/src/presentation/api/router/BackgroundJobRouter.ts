import { Router } from 'express';
import { ManageBackgroundJobsUseCase } from '@manaratak/application';

export class BackgroundJobRouter {
  public static create({ manageBackgroundJobsUseCase  }: { manageBackgroundJobsUseCase: ManageBackgroundJobsUseCase }): Router {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        const dto = req.body;
        if (!dto.jobType || !dto.parameters) {
          return res.status(400).json({ error: 'jobType and parameters are required' });
        }

        const reference = await manageBackgroundJobsUseCase.enqueueJob({
          jobType: dto.jobType,
          parameters: dto.parameters,
          priority: dto.priority ? Number(dto.priority) : undefined,
          runAt: dto.runAt,
          cronExpression: dto.cronExpression,
          timeoutSeconds: dto.timeoutSeconds ? Number(dto.timeoutSeconds) : undefined,
          concurrentLimits: dto.concurrentLimits ? Number(dto.concurrentLimits) : undefined,
          maxAttempts: dto.maxAttempts ? Number(dto.maxAttempts) : undefined,
          backoffType: dto.backoffType,
          ownerReference: dto.ownerReference
        });

        res.status(201).json({ reference });
      } catch (error: any) {
        next(error);
      }
    });

    router.get('/:jobReference/status', async (req, res, next) => {
      try {
        const { jobReference } = req.params;
        const status = await manageBackgroundJobsUseCase.getJobStatus({ jobReference });

        res.status(200).json({ status });
      } catch (error: any) {
        if (error.message === 'Job not found') {
          return res.status(404).json({ error: error.message });
        }
        next(error);
      }
    });

    router.delete('/:jobReference', async (req, res, next) => {
      try {
        const { jobReference } = req.params;
        await manageBackgroundJobsUseCase.cancelJob({ jobReference });
        res.status(204).send();
      } catch (error: any) {
        if (error.message === 'Job not found') {
          return res.status(404).json({ error: error.message });
        }
        next(error);
      }
    });

    router.post('/:jobReference/start', async (req, res, next) => {
      try {
        const { jobReference } = req.params;
        await manageBackgroundJobsUseCase.markJobStarted({ jobReference });
        res.status(204).send();
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:jobReference/complete', async (req, res, next) => {
      try {
        const { jobReference } = req.params;
        await manageBackgroundJobsUseCase.markJobCompleted({ jobReference });
        res.status(204).send();
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/:jobReference/fail', async (req, res, next) => {
      try {
        const { jobReference } = req.params;
        const { reason } = req.body;
        await manageBackgroundJobsUseCase.markJobFailed({ jobReference, reason });
        res.status(204).send();
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
