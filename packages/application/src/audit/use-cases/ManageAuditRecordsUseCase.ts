import { 
  AuditRecord, 
  AuditId, 
  AuditReference, 
  AuditAction, 
  AuditCategory, 
  AuditSeverity, 
  ActorReference, 
  TargetReference, 
  SourceReference, 
  AuditTimestamp, 
  ContextMetadata, 
  ComplianceMetadata, 
  CorrelationReference, 
  TraceReference, 
  AuditChainReference, 
  AuditRetentionMetadata,
  IAuditRecordRepository,
  AuditRecordQuerySpecification
} from '@manaratak/domain';
import { CreateAuditRecordDto, AuditRecordQueryDto } from '../dtos/AuditDtos';

export class ManageAuditRecordsUseCase {
  constructor(
    private readonly auditRepository: IAuditRecordRepository
  ) {}

  public async createAuditRecord(dto: CreateAuditRecordDto): Promise<void> {
    const id = AuditId.create(dto.id);
    const reference = AuditReference.create(dto.reference);
    const action = AuditAction.create(dto.action);
    const category = AuditCategory.create(dto.category);
    const severity = AuditSeverity.create(dto.severity);
    const actor = ActorReference.create(dto.actorId, dto.actorType);
    const target = TargetReference.create(dto.targetId, dto.targetType);
    const source = SourceReference.create(dto.source);
    const timestamp = AuditTimestamp.create(dto.timestamp);
    const contextMetadata = ContextMetadata.create(dto.contextMetadata);

    const complianceMetadata = dto.regulatoryTags 
      ? ComplianceMetadata.create(dto.regulatoryTags) 
      : undefined;

    const correlationReference = dto.correlationReference 
      ? CorrelationReference.create(dto.correlationReference) 
      : undefined;

    const traceReference = dto.traceReference 
      ? TraceReference.create(dto.traceReference) 
      : undefined;

    const chainReference = dto.chainReference 
      ? AuditChainReference.create(AuditReference.create(dto.chainReference)) 
      : undefined;

    const retentionMetadata = dto.retentionPeriodInDays !== undefined
      ? AuditRetentionMetadata.create(dto.retentionPeriodInDays, dto.timestamp)
      : undefined;

    const record = AuditRecord.create(
      id,
      reference,
      action,
      category,
      severity,
      actor,
      target,
      source,
      timestamp,
      contextMetadata,
      complianceMetadata,
      correlationReference,
      traceReference,
      chainReference,
      retentionMetadata
    );

    await this.auditRepository.save(record);
  }

  public async queryAuditRecords(dto: AuditRecordQueryDto): Promise<AuditRecord[]> {
    const spec = new AuditRecordQuerySpecification({
      actorId: dto.actorId,
      targetId: dto.targetId,
      action: dto.action,
      category: dto.category,
      severity: dto.severity,
      correlationId: dto.correlationId
    });

    return this.auditRepository.findBy(spec);
  }
}
