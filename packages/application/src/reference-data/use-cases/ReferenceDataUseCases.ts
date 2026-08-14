import { randomUUID } from 'crypto';
import {
  IReferenceDataRepository,
  ITransactionalReferenceDataRepository,
  OutboxProcessingState,
  ReferenceCityDto,
  ReferenceCountryDto,
  ReferenceCurrencyDto,
  ReferenceDataFilters,
  ReferenceLanguageDto,
  AdministrativeRegionDto,
  UpsertReferenceCityDto,
  UpsertReferenceCountryDto,
  UpsertReferenceCurrencyDto,
  UpsertReferenceLanguageDto
} from '@manaratak/domain';
import { AtomicAuditedOutboxMutationExecutor } from '../../event-foundation/use-cases/AtomicAuditedOutboxMutationExecutor';
import { CountryImportPreviewService, CountrySourceRecord } from '../services/CountryImportPreviewService';
import { CountryDerivedReferencePreviewService } from '../services/CountryDerivedReferencePreviewService';

export interface ReferenceDataMutationContext {
  actorId: string;
  actorType?: string;
  correlationId?: string;
  source?: string;
}

export class ReferenceDataUseCases {
  constructor(
    private readonly repository: IReferenceDataRepository,
    private readonly countryImportPreview = new CountryImportPreviewService(),
    private readonly derivedReferencePreview = new CountryDerivedReferencePreviewService(),
    private readonly atomicMutationExecutor?: AtomicAuditedOutboxMutationExecutor,
  ) {}

  public previewCountryImport(input: {
    sourceName: string;
    sourceVersion: string;
    sha256?: string;
    records: CountrySourceRecord[];
  }) {
    return this.countryImportPreview.preview(input);
  }

  public previewCountryDerivedReferences(records: CountrySourceRecord[]) {
    return this.derivedReferencePreview.preview(records);
  }

  public listCountries(filters: ReferenceDataFilters = {}): Promise<ReferenceCountryDto[]> {
    return this.repository.listCountries({ activeOnly: true, ...filters });
  }

  public listCurrencies(filters: ReferenceDataFilters = {}): Promise<ReferenceCurrencyDto[]> {
    return this.repository.listCurrencies({ activeOnly: true, ...filters });
  }

  public listLanguages(filters: ReferenceDataFilters = {}): Promise<ReferenceLanguageDto[]> {
    return this.repository.listLanguages({ activeOnly: true, ...filters });
  }

  public listCities(filters: ReferenceDataFilters = {}): Promise<ReferenceCityDto[]> {
    return this.repository.listCities({ activeOnly: true, ...filters });
  }

  public listRegions(filters: ReferenceDataFilters = {}): Promise<AdministrativeRegionDto[]> {
    return this.repository.listRegions(filters);
  }

  public async getCountry(iso2Code: string): Promise<ReferenceCountryDto> {
    const country = await this.repository.getCountry(iso2Code);
    if (!country || !country.isActive) {
      throw new Error(`Country not found: ${iso2Code}`);
    }
    return country;
  }

  public async getCurrency(isoCode: string): Promise<ReferenceCurrencyDto> {
    const currency = await this.repository.getCurrency(isoCode);
    if (!currency || !currency.isActive) {
      throw new Error(`Currency not found: ${isoCode}`);
    }
    return currency;
  }

  public async getLanguage(isoCode: string): Promise<ReferenceLanguageDto> {
    const language = await this.repository.getLanguage(isoCode);
    if (!language || !language.isActive) {
      throw new Error(`Language not found: ${isoCode}`);
    }
    return language;
  }

  public upsertCountry(data: UpsertReferenceCountryDto, context?: ReferenceDataMutationContext): Promise<ReferenceCountryDto> {
    return this.atomicUpsert('COUNTRY', data.iso2Code, context, transaction => transaction.repository.upsertCountryInTransaction(data, transaction.context), () => this.repository.upsertCountry(data));
  }

  public upsertCurrency(data: UpsertReferenceCurrencyDto, context?: ReferenceDataMutationContext): Promise<ReferenceCurrencyDto> {
    return this.atomicUpsert('CURRENCY', data.isoCode, context, transaction => transaction.repository.upsertCurrencyInTransaction(data, transaction.context), () => this.repository.upsertCurrency(data));
  }

  public upsertLanguage(data: UpsertReferenceLanguageDto, context?: ReferenceDataMutationContext): Promise<ReferenceLanguageDto> {
    return this.atomicUpsert('LANGUAGE', data.isoCode, context, transaction => transaction.repository.upsertLanguageInTransaction(data, transaction.context), () => this.repository.upsertLanguage(data));
  }

  public async upsertCity(data: UpsertReferenceCityDto, context?: ReferenceDataMutationContext): Promise<ReferenceCityDto> {
    const country = await this.repository.getCountry(data.countryIso2Code);
    if (!country || !country.isActive) {
      throw new Error(`Active canonical country not found: ${data.countryIso2Code}`);
    }
    if (data.administrativeRegionId) {
      const region = await this.repository.getRegionById(data.administrativeRegionId);
      if (!region) {
        throw new Error(`Canonical region not found: ${data.administrativeRegionId}`);
      }
      if (region.countryIso2Code !== country.iso2Code) {
        throw new Error('City administrative region must belong to the selected country.');
      }
    }
    const identity = `${data.countryIso2Code}:${data.name}:${data.region ?? ''}`;
    return this.atomicUpsert('CITY', identity, context, transaction => transaction.repository.upsertCityInTransaction(data, transaction.context), () => this.repository.upsertCity(data));
  }

  private atomicUpsert<T>(
    entityType: string,
    entityId: string,
    requestContext: ReferenceDataMutationContext | undefined,
    mutation: (transaction: { repository: ITransactionalReferenceDataRepository; context: import('@manaratak/domain').AtomicPersistenceContext }) => Promise<T>,
    legacyMutation: () => Promise<T>,
  ): Promise<T> {
    if (!this.atomicMutationExecutor) return legacyMutation();

    const repository = this.repository as Partial<ITransactionalReferenceDataRepository>;
    if (!repository.upsertCountryInTransaction || !repository.upsertCurrencyInTransaction || !repository.upsertLanguageInTransaction || !repository.upsertCityInTransaction) {
      throw new Error('REFERENCE_DATA_TRANSACTIONAL_PERSISTENCE_REQUIRED');
    }

    const now = new Date();
    const auditId = randomUUID();
    const outboxId = randomUUID();
    const actorId = requestContext?.actorId || 'SYSTEM';
    const correlationId = requestContext?.correlationId;
    const action = `REFERENCE_${entityType}_UPSERTED`;

    return this.atomicMutationExecutor.execute(
      {
        id: auditId,
        reference: `AUD-${auditId}`,
        action,
        category: 'REFERENCE_DATA_MUTATION',
        severity: 'INFO',
        actorId,
        actorType: requestContext?.actorType || 'IDENTITY',
        targetId: entityId,
        targetType: `REFERENCE_${entityType}`,
        source: requestContext?.source || 'admin-reference-data-api',
        timestamp: now,
        contextMetadata: { result: 'SUCCESS', atomicity: 'BUSINESS_AUDIT_OUTBOX' },
        correlationReference: correlationId,
      },
      {
        id: outboxId,
        eventType: action,
        domain: 'REFERENCE_DATA',
        aggregate: { domain: 'REFERENCE_DATA', aggregateType: entityType, aggregateId: entityId },
        payload: { entityType, entityId, operation: 'UPSERT' },
        metadata: { actorId, atomicity: 'BUSINESS_AUDIT_OUTBOX' },
        correlationId,
        createdAt: now,
        availableAt: now,
        state: OutboxProcessingState.PENDING,
        attempts: 0,
      },
      atomicContext => mutation({ repository: repository as ITransactionalReferenceDataRepository, context: atomicContext }),
    );
  }
}
