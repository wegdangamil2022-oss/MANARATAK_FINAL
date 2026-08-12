import { Router } from 'express';
import { ManageCacheUseCase } from '@manaratak/application';

export class CacheRouter {
  public static create({ manageCacheUseCase  }: { manageCacheUseCase: ManageCacheUseCase }): Router {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        const dto = req.body;
        if (!dto.scope || !dto.key || !dto.payload) {
          return res.status(400).json({ error: 'scope, key, and payload are required' });
        }
        if (dto.ttlSeconds === undefined) {
          return res.status(400).json({ error: 'ttlSeconds is required' });
        }

        const reference = await manageCacheUseCase.allocateCache({
          scope: dto.scope,
          key: dto.key,
          payload: dto.payload,
          ttlSeconds: Number(dto.ttlSeconds),
          absoluteExpirationTime: dto.absoluteExpirationTime,
          invalidationTokens: dto.invalidationTokens,
          ownerReference: dto.ownerReference,
          policyTags: dto.policyTags,
        });

        res.status(201).json({ reference });
      } catch (error: any) {
        next(error);
      }
    });

    router.get('/:scope/:key', async (req, res, next) => {
      try {
        const { scope, key } = req.params;
        const payload = await manageCacheUseCase.getCache({ scope, key });

        if (!payload) {
          return res.status(404).json({ error: 'Cache entry not found or expired' });
        }

        res.status(200).json({ payload });
      } catch (error: any) {
        next(error);
      }
    });

    router.delete('/:scope/:key', async (req, res, next) => {
      try {
        const { scope, key } = req.params;
        await manageCacheUseCase.invalidateCache({ scope, key });
        res.status(204).send();
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
