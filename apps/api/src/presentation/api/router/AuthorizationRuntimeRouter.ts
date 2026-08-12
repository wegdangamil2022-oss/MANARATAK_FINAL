import { Router, Request, Response } from 'express';
import { EvaluateAccessUseCase } from '@manaratak/application';
import { ResponseFormatter } from '../response/ResponseFormatter';

export class AuthorizationRuntimeRouter {
  public static create({ evaluateAccessUseCase  }: { evaluateAccessUseCase: EvaluateAccessUseCase }): Router {
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');

    router.post('/evaluate', async (req: Request, res: Response) => {
      try {
        const decision = await evaluateAccessUseCase.execute(req.body);
        res.status(200).json(responseFormatter.success(decision));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({
          code: 'EVALUATION_ERROR',
          message: error.message || 'Failed to evaluate access'
        }));
      }
    });

    return router;
  }
}
