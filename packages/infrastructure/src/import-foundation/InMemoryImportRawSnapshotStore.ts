import { createHash } from 'node:crypto';
import type { IImportRawSnapshotStore, SourceAcquisitionResult, StoredImportRawSnapshot } from '@manaratak/application';
export class InMemoryImportRawSnapshotStore implements IImportRawSnapshotStore {
  private readonly snapshots = new Map<string, StoredImportRawSnapshot>();
  async store(acquisition: SourceAcquisitionResult): Promise<StoredImportRawSnapshot> {
    const sha256 = createHash('sha256').update(acquisition.rawBytes).digest('hex');
    const stored: StoredImportRawSnapshot = { artifactId: `raw_${sha256}`, contentHash: sha256, byteSize: acquisition.rawBytes.byteLength, storedAt: new Date(), rawArtifactReference: `memory://import-raw/${sha256}`, sourceId: acquisition.sourceId, connectorId: acquisition.connectorId, connectorVersion: acquisition.connectorVersion, fetchedAt: acquisition.fetchedAt, requestedUrl: acquisition.requestedUrl, finalUrl: acquisition.finalUrl, statusCode: acquisition.statusCode, contentType: acquisition.contentType, etag: acquisition.etag, lastModified: acquisition.lastModified };
    this.snapshots.set(stored.artifactId, stored); return stored;
  }
  async get(snapshotId: string): Promise<StoredImportRawSnapshot | null> { return this.snapshots.get(snapshotId) ?? null; }
}
