import { Request, Response, NextFunction } from 'express';
import { IValidationService, ValidationException, Result } from '@manaratak/core';

export class DtoValidationMiddleware {
  constructor(private readonly validationService: IValidationService) {}

  public validateBody(schema: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.validationService.execute({
          payload: req.body,
          metadata: { path: req.originalUrl, source: 'body' }
        }, schema);

        if (result.isFailure) {
          const err = result.error;
          // Extract errors from details if available
          const validationErrors = err?.details?.errors ? (err.details.errors as any[]) : [];
          throw new ValidationException(err?.message || 'Validation Error', validationErrors);
        }

        // Replace body with validated/sanitized value
        req.body = result.getValue();
        next();
      } catch (error) {
        next(error); // Pass to GlobalExceptionHandler
      }
    };
  }

  public validateQuery(schema: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.validationService.execute({
          payload: req.query,
          metadata: { path: req.originalUrl, source: 'query' }
        }, schema);

        if (result.isFailure) {
          const err = result.error;
          const validationErrors = err?.details?.errors ? (err.details.errors as any[]) : [];
          throw new ValidationException(err?.message || 'Validation Error', validationErrors);
        }

        req.query = result.getValue() as any;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
