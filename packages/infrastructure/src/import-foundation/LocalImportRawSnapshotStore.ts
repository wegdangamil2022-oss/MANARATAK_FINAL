import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { IImportRawSnapshotStore, SourceAcquisitionResult, StoredImportRawSnapshot } from '@manaratak/application';
export class LocalImportRawSnapshotStore implements IImportRawSnapshotStore {
  constructor(private readonly rootDirectory = path.resolve(process.env.IMPORT_RAW_SNAPSHOT_DIR ?? 'var/import-raw')) {}
  async store(acquisition: SourceAcquisitionResult): Promise<StoredImportRawSnapshot> {
    const sha256 = createHash('sha256').update(acquisition.rawBytes).digest('hex'); const snapshotId = `raw_${sha256}`;
    await fs.mkdir(this.rootDirectory, { recursive: true }); const finalPath = path.join(this.rootDirectory, `${snapshotId}.bin`); const temporaryPath = `${finalPath}.${process.pid}.tmp`;
    try { await fs.writeFile(temporaryPath, acquisition.rawBytes, { flag: 'wx' }); await fs.rename(temporaryPath, finalPath); } catch (error) { await fs.rm(temporaryPath, { force: true }); try { await fs.access(finalPath); } catch { throw error; } }
    return { artifactId: snapshotId, contentHash: sha256, byteSize: acquisition.rawBytes.byteLength, storedAt: new Date(), rawArtifactReference: finalPath };
  }
}
