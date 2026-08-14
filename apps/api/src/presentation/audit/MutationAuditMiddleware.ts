import { NextFunction, Request, Response } from 'express';
import { IAuditRecordRepository } from '@manaratak/domain';
import { AuditHelper } from './AuditHelper';

export type MutationAuditClassification =
  | 'CRITICAL_AUDIT_REQUIRED'
  | 'STANDARD_AUDIT_REQUIRED'
  | 'BEST_EFFORT_ALLOWED'
  | 'NO_AUDIT_REQUIRED';

export type MutationAuditScope = 'AUTH' | 'ADMIN' | 'IDENTITY';

export class MutationAuditPolicy {
  private static readonly MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  public static classify(req: Request, scope: MutationAuditScope): MutationAuditClassification {
    if (!this.MUTATION_METHODS.has(req.method.toUpperCase())) return 'NO_AUDIT_REQUIRED';
    const path = req.originalUrl.split('?')[0].toLowerCase();
    if (scope === 'AUTH') return path.includes('/auth/') ? 'CRITICAL_AUDIT_REQUIRED' : 'NO_AUDIT_REQUIRED';
    if (scope === 'IDENTITY') return path.includes('/identities') ? 'CRITICAL_AUDIT_REQUIRED' : 'NO_AUDIT_REQUIRED';
    if (!path.includes('/admin/')) return 'NO_AUDIT_REQUIRED';

    if (path.endsWith('/preview') || path.includes('/bulk/preview') || path.endsWith('/nodes/validate') || path.endsWith('/transfer')) {
      return 'NO_AUDIT_REQUIRED';
    }
    if (path.includes('/workspace/') || path.endsWith('/academic-taxonomy/import-handoff')) {
      return 'STANDARD_AUDIT_REQUIRED';
    }

    const criticalAreas = [
      '/admin/identities', '/admin/authorization', '/admin/settings', '/admin/imports',
      '/admin/assets', '/admin/reference-data', '/admin/academic-taxonomy',
      '/admin/international-tests', '/admin/universities', '/admin/majors'
    ];
    return criticalAreas.some(prefix => path.includes(prefix))
      ? 'CRITICAL_AUDIT_REQUIRED'
      : 'NO_AUDIT_REQUIRED';
  }
}

export class MutationAuditMiddleware {
  constructor(
    private readonly repository: IAuditRecordRepository,
    private readonly scope: MutationAuditScope
  ) {}

  public generate() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const classification = MutationAuditPolicy.classify(req, this.scope);
      if (classification === 'NO_AUDIT_REQUIRED') {
        next();
        return;
      }

      const targetId = req.params?.id || req.params?.nodeId || req.params?.batchId || req.originalUrl.split('?')[0];
      const metadata = {
        auditEvent: 'MUTATION_INTENT',
        requestedMethod: req.method,
        requestedPath: req.originalUrl.split('?')[0],
        classification,
        atomicity: 'REQUEST_OUTCOME_ONLY',
        atomicBusinessAuditRequired: classification === 'CRITICAL_AUDIT_REQUIRED'
      };

      try {
        await AuditHelper.recordMutation(this.repository, req, {
          action: 'MUTATION_INTENT_RECORDED',
          category: classification === 'CRITICAL_AUDIT_REQUIRED' ? 'CRITICAL_MUTATION' : 'STANDARD_MUTATION',
          targetType: 'API_ROUTE',
          targetId,
          result: 'SUCCESS',
          severity: classification === 'CRITICAL_AUDIT_REQUIRED' ? 'WARNING' : 'INFO',
          metadata
        }, { reliability: classification === 'CRITICAL_AUDIT_REQUIRED' ? 'REQUIRED' : 'BEST_EFFORT' });
      } catch (error) {
        next(error);
        return;
      }

      res.once('finish', () => {
        void AuditHelper.recordMutation(this.repository, req, {
          action: 'MUTATION_OUTCOME_RECORDED',
          category: classification === 'CRITICAL_AUDIT_REQUIRED' ? 'CRITICAL_MUTATION' : 'STANDARD_MUTATION',
          targetType: 'API_ROUTE',
          targetId,
          result: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
          severity: res.statusCode < 400 ? 'INFO' : 'ERROR',
          metadata: { ...metadata, auditEvent: 'MUTATION_OUTCOME', httpStatus: res.statusCode }
        }, { reliability: 'BEST_EFFORT' });
      });
      next();
    };
  }
}
