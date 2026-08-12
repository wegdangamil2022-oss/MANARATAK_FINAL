import {
  IReferenceDataRepository,
  ReferenceDataSeedBatch,
  ReferenceDataSeedStatus,
  UpsertReferenceCountryDto,
  UpsertReferenceCurrencyDto,
  UpsertReferenceLanguageDto,
  UpsertReferenceCityDto
} from '@manaratak/domain';

export class ReferenceDataSeedApplyService {
  constructor(private readonly repository: IReferenceDataRepository) {}

  public async applyBatch(
    batch: ReferenceDataSeedBatch,
    appliedBy: string
  ): Promise<ReferenceDataSeedBatch> {
    if (batch.status !== ReferenceDataSeedStatus.READY_TO_APPLY) {
      throw new Error(`Cannot apply batch: status must be READY_TO_APPLY, but got ${batch.status}`);
    }

    if (!batch.validationSummary) {
      throw new Error('Cannot apply batch: missing validationSummary');
    }

    if (batch.validationSummary.invalidRecords > 0) {
      throw new Error('Cannot apply batch: validationSummary contains invalid records');
    }

    for (const record of batch.records) {
      if (!record.validationReport) {
        throw new Error('Cannot apply batch: one or more records are missing validationReport');
      }

      if (!record.validationReport.canBeImported) {
        throw new Error('Cannot apply batch: one or more records cannot be imported');
      }

      if (!record.deterministicKey) {
        throw new Error('Cannot apply batch: one or more records are missing deterministicKey');
      }
    }

    for (const record of batch.records) {
      switch (record.entityType) {
        case 'COUNTRY':
          await this.repository.upsertCountry(record.payload as UpsertReferenceCountryDto);
          break;
        case 'CURRENCY':
          await this.repository.upsertCurrency(record.payload as UpsertReferenceCurrencyDto);
          break;
        case 'LANGUAGE':
          await this.repository.upsertLanguage(record.payload as UpsertReferenceLanguageDto);
          break;
        case 'CITY':
          await this.repository.upsertCity(record.payload as UpsertReferenceCityDto);
          break;
        default:
          throw new Error(`Unsupported entityType: ${(record as any).entityType}`);
      }
    }

    return {
      ...batch,
      status: ReferenceDataSeedStatus.APPLIED,
      appliedAt: new Date(),
      appliedBy,
      records: batch.records.map(r => ({ ...r }))
    };
  }
}
