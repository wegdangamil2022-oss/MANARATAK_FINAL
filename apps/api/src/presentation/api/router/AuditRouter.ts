import { Router } from 'express';
import { ManageAuditRecordsUseCase } from '@manaratak/application';

export class AuditRouter {
  public static create({ manageAuditRecordsUseCase  }: { manageAuditRecordsUseCase: ManageAuditRecordsUseCase }): Router {
    const router = Router();

    router.post('/records', async (req, res, next) => {
      try {
        const dto = {
          ...req.body,
          timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        };
        await manageAuditRecordsUseCase.createAuditRecord(dto);
        res.status(201).json({ message: 'Audit record appended successfully' });
      } catch (error: any) {
        next(error);
      }
    });

    router.get('/records', async (req, res, next) => {
      try {
        const results = await manageAuditRecordsUseCase.queryAuditRecords({
          actorId: req.query.actorId as string,
          targetId: req.query.targetId as string,
          action: req.query.action as string,
          category: req.query.category as string,
          severity: req.query.severity as string,
          correlationId: req.query.correlationId as string,
        });

        // Map domain objects to simple serializable objects for JSON transmission
        const payload = results.map(record => ({
          id: record.getId().getValue(),
          reference: record.getReference().getValue(),
          action: record.getAction().getValue(),
          category: record.getCategory().getValue(),
          severity: record.getSeverity().getValue(),
          actor: {
            actorId: record.getActor().getActorId(),
            actorType: record.getActor().getActorType(),
          },
          target: {
            targetId: record.getTarget().getTargetId(),
            targetType: record.getTarget().getTargetType(),
          },
          source: record.getSource().getValue(),
          timestamp: record.getTimestamp().getValue().toISOString(),
          contextMetadata: record.getContextMetadata().getData(),
          lifecycleState: record.getLifecycleState(),
          complianceMetadata: record.getComplianceMetadata()?.getRegulatoryTags(),
          correlationReference: record.getCorrelationReference()?.getValue(),
          traceReference: record.getTraceReference()?.getValue(),
          chainReference: record.getChainReference()?.getPreviousReference().getValue(),
          retentionMetadata: record.getRetentionMetadata() ? {
            retentionPeriodInDays: record.getRetentionMetadata()?.getRetentionPeriodInDays(),
            expiresAt: record.getRetentionMetadata()?.getExpiresAt().toISOString()
          } : undefined
        }));

        res.status(200).json(payload);
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
