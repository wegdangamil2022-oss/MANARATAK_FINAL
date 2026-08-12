import {
  ReferenceDataSeedPlanner,
  ReferenceDataSeedBatch,
  ReferenceDataSeedRecord,
  ReferenceCountryDto,
  ReferenceCurrencyDto,
  ReferenceLanguageDto,
  ReferenceCityDto,
  UpsertReferenceCountryDto,
  UpsertReferenceCurrencyDto,
  UpsertReferenceLanguageDto,
  UpsertReferenceCityDto
} from '@manaratak/domain';

export interface ReferenceDataImportHandoffCommand {
  seedBatchId: string;
  sourceName: string;
  sourceVersion: string;
  entityType: 'COUNTRY' | 'CURRENCY' | 'LANGUAGE' | 'CITY';
  records: Array<Record<string, unknown>>;
}

export class ReferenceDataImportHandoffService {
  constructor(
    private readonly seedPlanner: ReferenceDataSeedPlanner = new ReferenceDataSeedPlanner()
  ) {}

  public prepareSeedBatch(command: ReferenceDataImportHandoffCommand): ReferenceDataSeedBatch {
    const seedRecords: ReferenceDataSeedRecord[] = command.records.map((rawRecord) => {
      let deterministicKey: string | undefined;

      switch (command.entityType) {
        case 'COUNTRY':
          if (rawRecord.iso2Code) {
            deterministicKey = String(rawRecord.iso2Code).trim();
          }
          break;
        case 'CURRENCY':
        case 'LANGUAGE':
          if (rawRecord.isoCode) {
            deterministicKey = String(rawRecord.isoCode).trim();
          }
          break;
        case 'CITY':
          if (rawRecord.countryIso2Code && rawRecord.name) {
            deterministicKey = `${String(rawRecord.countryIso2Code).trim()}:${String(rawRecord.name).trim()}`;
          }
          break;
      }

      const payload = ({ ...rawRecord } as unknown) as
        | ReferenceCountryDto
        | UpsertReferenceCountryDto
        | ReferenceCurrencyDto
        | UpsertReferenceCurrencyDto
        | ReferenceLanguageDto
        | UpsertReferenceLanguageDto
        | ReferenceCityDto
        | UpsertReferenceCityDto;

      return {
        entityType: command.entityType,
        deterministicKey,
        payload
      };
    });

    const draftBatch = this.seedPlanner.createBatch({
      seedBatchId: command.seedBatchId,
      sourceName: command.sourceName,
      sourceVersion: command.sourceVersion,
      records: seedRecords
    });

    const validatedBatch = this.seedPlanner.validateBatch(draftBatch);

    if (validatedBatch.validationSummary && validatedBatch.validationSummary.invalidRecords === 0) {
      return this.seedPlanner.markReadyToApply(validatedBatch);
    }

    return validatedBatch;
  }
}
