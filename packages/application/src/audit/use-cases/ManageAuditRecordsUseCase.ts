import { AuditRecord, IAuditRecordRepository, AuditRecordQuerySpecification } from '@manaratak/domain';
import { CreateAuditRecordDto, AuditRecordQueryDto } from '../dtos/AuditDtos';
import { createAuditRecordFromDto } from './AuditRecordFactory';

export class ManageAuditRecordsUseCase {
  constructor(
    private readonly auditRepository: IAuditRecordRepository
  ) {}

  public async createAuditRecord(dto: CreateAuditRecordDto): Promise<void> {
    await this.auditRepository.save(createAuditRecordFromDto(dto));
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
