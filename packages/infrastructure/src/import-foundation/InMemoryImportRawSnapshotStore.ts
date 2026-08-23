import { createHash } from 'node:crypto';
import type { IImportRawSnapshotStore, SourceAcquisitionResult, StoredImportRawSnapshot } from '@manaratak/application';
export class InMemoryImportRawSnapshotStore implements IImportRawSnapshotStore {
  private readonly snapshots = new Map<string, StoredImportRawSnapshot>();
  async store(acquisition: SourceAcquisitionResult): Promise<StoredImportRawSnapshot> {
    const sha256 = createHash('sha256').update(acquisition.rawBytes).digest('hex');
    const stored = { artifactId: `raw_${sha256}`, contentHash: sha256, byteSize: acquisition.rawBytes.byteLength, storedAt: new Date(), rawArtifactReference: `memory://import-raw/${sha256}` };
    this.snapshots.set(stored.artifactId, stored); return stored;
  }
  get(snapshotId: string): StoredImportRawSnapshot | undefined { return this.snapshots.get(snapshotId); }
}
