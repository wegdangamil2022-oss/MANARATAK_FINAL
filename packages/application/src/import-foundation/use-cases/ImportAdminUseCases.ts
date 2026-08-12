import { ImportRecordStatus } from '@manaratak/domain';
import { v4 as uuidv4 } from 'uuid';
import { IImportQueueGateway } from '../gateways/IImportQueueGateway';
import { InlineDataParser } from '../parsers/InlineDataParser';

type ImportRepository = {
  createBatch(data: Record<string, unknown>): Promise<any>;
  createRecord(data: Record<string, unknown>): Promise<any>;
  bulkCreateRecords?(records: Array<Record<string, unknown>>): Promise<{ count: number }>;
  updateBatchStats(id: string, data: Record<string, unknown>): Promise<any>;
  listBatches(filters?: Record<string, unknown>): Promise<any[]>;
  listRecords(filters?: Record<string, unknown>): Promise<any>;
};

export interface StageImportRowsInput {
  ownerDomain: string;
  sourceSystem: string;
  rows: Array<Readonly<Record<string, unknown>>>;
  validationIssues?: Array<readonly unknown[]>;
}

export class ImportAdminUseCases {
  constructor(
    private readonly importRepository: ImportRepository,
    private readonly importQueueGateway?: IImportQueueGateway
  ) {}

  async importData(input: { dataText: string; sourceSystem?: string; dataType?: string }) {
    const text = input.dataText.trim();
    const ownerDomain = this.resolveOwnerDomain(input.dataType);
    const maxLength = 90 * 1024;
    if (text.length > maxLength) {
      throw new Error('Import payload is too large. Large imports must use the artifact import flow.');
    }

    const rows = await InlineDataParser.parse(text);
    return this.stageNormalizedRows({
      ownerDomain,
      sourceSystem: input.sourceSystem || 'ADMIN_CONSOLE',
      rows: rows.map((row) => ({ ...row }))
    });
  }

  async stageNormalizedRows(input: StageImportRowsInput) {
    if (!input.ownerDomain.trim()) {
      throw new Error('Import ownerDomain is required.');
    }

    const batch = await this.importRepository.createBatch({
      sourceSystem: input.sourceSystem,
      dataType: input.ownerDomain,
      batchStatus: 'PROCESSING',
      totalRecords: input.rows.length,
      processedRecords: 0,
      failedRecords: 0
    });

    let processedRecords = 0;
    let failedRecords = 0;
    let stagedRecords = 0;
    const recordsToReturn: any[] = [];
    const chunkSize = 500;

    try {
      for (let offset = 0; offset < input.rows.length; offset += chunkSize) {
        const chunk = input.rows.slice(offset, offset + chunkSize);
        const records = chunk.map((payload, index) => {
          const sourceRowNumber = offset + index + 1;
          const issues = input.validationIssues?.[sourceRowNumber - 1] ?? [];
          const validObject = payload !== null && typeof payload === 'object' && Object.keys(payload).length > 0;
          const status = validObject && issues.length === 0
            ? ImportRecordStatus.COMPLETE
            : ImportRecordStatus.INCOMPLETE;

          if (status === ImportRecordStatus.COMPLETE) processedRecords++;
          else failedRecords++;

          return {
            id: `rec-${uuidv4().substring(0, 8)}`,
            batchId: batch.id,
            status,
            rawPayload: { ...payload, _sourceRowNumber: sourceRowNumber },
            validationErrors: issues.length > 0 ? issues : validObject ? null : ['EMPTY_NORMALIZED_PAYLOAD'],
            processingNotes: `Source row ${sourceRowNumber}`,
            sourceDedupKey: `${input.sourceSystem}|${input.ownerDomain}|${sourceRowNumber}`.toLowerCase(),
            chunkIndex: Math.floor((sourceRowNumber - 1) / chunkSize),
            sourceRowNumber
          };
        });

        if (records.length > 0) {
          if (this.importRepository.bulkCreateRecords) {
            const created = await this.importRepository.bulkCreateRecords(records);
            stagedRecords += created.count;
          } else {
            for (const record of records) {
              await this.importRepository.createRecord(record);
              stagedRecords++;
            }
          }
          if (recordsToReturn.length < 100) {
            recordsToReturn.push(...records.slice(0, 100 - recordsToReturn.length));
          }
        }
      }

      const finalBatch = await this.importRepository.updateBatchStats(batch.id, {
        totalRecords: input.rows.length,
        processedRecords,
        failedRecords,
        batchStatus: 'COMPLETED'
      });

      return {
        batch: finalBatch,
        summary: {
          totalRecords: input.rows.length,
          processedRecords,
          failedRecords,
          stagedRecords,
          skippedDuplicates: 0
        },
        records: recordsToReturn
      };
    } catch (error) {
      await this.importRepository.updateBatchStats(batch.id, {
        totalRecords: input.rows.length,
        processedRecords,
        failedRecords,
        batchStatus: 'FAILED'
      });
      throw error;
    }
  }

  async listBatches(filters?: any) {
    return this.importRepository.listBatches(this.normalizeLegacyFilters(filters));
  }

  async listRecords(filters?: any) {
    const normalized = this.normalizeLegacyFilters(filters);
    normalized.page = this.boundedNumber(normalized.page, 1, 1, Number.MAX_SAFE_INTEGER);
    normalized.pageSize = this.boundedNumber(normalized.pageSize, 50, 1, 100);
    return this.importRepository.listRecords(normalized);
  }

  async getQueueJobStatus(batchId: string) {
    return this.importQueueGateway?.getJobStatus(batchId) ?? null;
  }

  async pauseQueueJob(batchId: string, reason?: string): Promise<boolean> {
    return this.importQueueGateway?.pauseJob({ batchId, reason }) ?? false;
  }

  async resumeQueueJob(batchId: string): Promise<boolean> {
    return this.importQueueGateway?.resumeJob({ batchId }) ?? false;
  }

  async cancelQueueJob(batchId: string, reason?: string): Promise<boolean> {
    return this.importQueueGateway?.cancelJob({ batchId, reason }) ?? false;
  }

  async replayQueueJob(batchId: string, fromCheckpoint?: boolean): Promise<boolean> {
    return this.importQueueGateway?.replayJob({ batchId, fromCheckpoint }) ?? false;
  }

  private resolveOwnerDomain(dataType?: string): string {
    const requested = (dataType || 'GENERIC').trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9_-]{1,63}$/.test(requested)) {
      throw new Error('Invalid import owner domain identifier.');
    }
    return requested;
  }

  private normalizeLegacyFilters(filters?: any): Record<string, any> {
    return { ...(filters || {}) };
  }

  private boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  }
}
