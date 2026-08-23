import type { IImportRawSnapshotStore, ISourceRegistryGateway, AcquireImportSourceUseCase, ImportAdminUseCases } from '@manaratak/application';
import type { ImportSourceDefinition } from '@manaratak/domain';
import type { ScholarshipAcquisitionPlanner } from '../source-registry/ScholarshipAcquisitionPlanner';
import type { ScholarshipSourceConfiguration } from '../source-registry/ScholarshipSourceRegistryContracts';

export type ScholarshipImportNewResult =
  | { state: 'STAGED'; snapshot: Awaited<ReturnType<IImportRawSnapshotStore['store']>>; staging: Awaited<ReturnType<ImportAdminUseCases['stageNormalizedRows']>> }
  | { state: 'ACQUIRED_AWAITING_EXTRACTION_MAPPING'; snapshot: Awaited<ReturnType<IImportRawSnapshotStore['store']>>; reason: string }
  | { state: 'REJECTED_SOURCE'; reason: string }
  | { state: 'FAILED'; reason: string };

export class ScholarshipImportNewUseCase {
  constructor(
    private readonly sourceRegistry: ISourceRegistryGateway,
    private readonly planner: ScholarshipAcquisitionPlanner,
    private readonly acquisition: AcquireImportSourceUseCase,
    private readonly importAdmin: ImportAdminUseCases,
  ) {}
  async execute(input: { sourceId: string; targetUrl?: string; manualInput?: { rawBytes?: Uint8Array; structuredContent?: unknown; fileName?: string; contentType?: string; approvedAssetReference?: string }; parserHint?: 'json' | 'ndjson' | 'csv'; correlationId?: string; executionId?: string; importSessionId?: string }): Promise<ScholarshipImportNewResult> {
    const source = await this.sourceRegistry.getSource(input.sourceId);
    if (!source || source.metadata?.ownerDomain !== 'SCHOLARSHIPS') return { state: 'REJECTED_SOURCE', reason: 'SCHOLARSHIP_SOURCE_NOT_FOUND_OR_NOT_OWNED' };
    const configuration = this.configuration(source); let plan;
    try { plan = this.planner.prepare(configuration, input.targetUrl); } catch (error) { return { state: 'REJECTED_SOURCE', reason: error instanceof Error ? error.message : 'SCHOLARSHIP_SOURCE_REJECTED' }; }
    try {
      const manualInput = input.manualInput?.structuredContent !== undefined
        ? { rawBytes: new TextEncoder().encode(JSON.stringify(input.manualInput.structuredContent)), fileName: input.manualInput.fileName, contentType: input.manualInput.contentType ?? 'application/json', assetReference: input.manualInput.approvedAssetReference }
        : input.manualInput?.rawBytes ? { rawBytes: input.manualInput.rawBytes, fileName: input.manualInput.fileName, contentType: input.manualInput.contentType, assetReference: input.manualInput.approvedAssetReference } : undefined;
      const acquired = await this.acquisition.execute(source, { targetUrl: plan.targetUrl ?? undefined, manualInput });
      const rows = this.rows(acquired.acquisition.rawBytes, input.parserHint, acquired.acquisition.contentType);
      if (!rows) return { state: 'ACQUIRED_AWAITING_EXTRACTION_MAPPING', snapshot: acquired.snapshot, reason: 'NO_APPROVED_GENERIC_EXTRACTION_MAPPING' };
      const staging = await this.importAdmin.stageNormalizedRows({ ownerDomain: 'SCHOLARSHIPS', sourceSystem: source.sourceId, rows, handoffContext: { artifactId: acquired.snapshot.artifactId, rawArtifactReference: acquired.snapshot.rawArtifactReference, correlationId: input.correlationId, executionId: input.executionId, importSessionId: input.importSessionId, attempt: acquired.attempts, referenceMetadata: { contentHash: acquired.snapshot.contentHash } } });
      return { state: 'STAGED', snapshot: acquired.snapshot, staging };
    } catch (error) { return { state: 'FAILED', reason: error instanceof Error ? error.message : 'SCHOLARSHIP_IMPORT_NEW_FAILED' }; }
  }
  private configuration(source: ImportSourceDefinition): ScholarshipSourceConfiguration {
    const metadata = source.metadata ?? {}; return { sourceId: source.sourceId, sourceName: source.displayName, baseUrl: source.baseUrl.startsWith('manual://') ? undefined : source.baseUrl, sourceType: (metadata.scholarshipSourceType as ScholarshipSourceConfiguration['sourceType']) ?? 'MANUAL_FILE', status: (metadata.scholarshipSourceStatus as ScholarshipSourceConfiguration['status']) ?? (source.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'), acquisitionMode: (metadata.acquisitionMode as ScholarshipSourceConfiguration['acquisitionMode']) ?? 'MANUAL_FILE', allowedUrlScope: metadata.allowedUrlScope as ScholarshipSourceConfiguration['allowedUrlScope'], rateLimitPolicy: metadata.rateLimitPolicy as ScholarshipSourceConfiguration['rateLimitPolicy'], lastExecution: (metadata.lastExecution as ScholarshipSourceConfiguration['lastExecution']) ?? { state: 'NEVER_RUN' } };
  }
  private rows(bytes: Uint8Array, hint?: 'json' | 'ndjson' | 'csv', contentType?: string): Array<Record<string, unknown>> | null {
    const text = new TextDecoder().decode(bytes).trim(); const parser = hint ?? (contentType?.includes('ndjson') ? 'ndjson' : contentType?.includes('csv') ? 'csv' : contentType?.includes('json') ? 'json' : undefined);
    if (parser === 'json') { try { const parsed = JSON.parse(text) as unknown; if (Array.isArray(parsed) && parsed.every((row) => row && typeof row === 'object' && !Array.isArray(row))) return parsed as Array<Record<string, unknown>>; if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return [parsed as Record<string, unknown>]; } catch { return null; } }
    if (parser === 'ndjson') { try { const rows = text.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as unknown); return rows.every((row) => row && typeof row === 'object' && !Array.isArray(row)) ? rows as Array<Record<string, unknown>> : null; } catch { return null; } }
    if (parser === 'csv') { const lines = text.split(/\r?\n/u).filter(Boolean); if (lines.length < 2) return null; const headers = lines[0].split(',').map((header) => header.trim()); if (headers.some((header) => !header)) return null; return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, line.split(',')[index]?.trim() ?? '']))); }
    return null;
  }
}
