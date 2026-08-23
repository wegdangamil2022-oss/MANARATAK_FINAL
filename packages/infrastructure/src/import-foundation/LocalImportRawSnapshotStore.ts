import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { IImportRawSnapshotStore, SourceAcquisitionResult, StoredImportRawSnapshot } from '@manaratak/application';
export class LocalImportRawSnapshotStore implements IImportRawSnapshotStore {
  constructor(private readonly rootDirectory = path.resolve(process.env.IMPORT_RAW_SNAPSHOT_DIR ?? 'var/import-raw')) {}
  async store(acquisition: SourceAcquisitionResult): Promise<StoredImportRawSnapshot> {
    const sha256 = createHash('sha256').update(acquisition.rawBytes).digest('hex'); const snapshotId = `raw_${sha256}`;
    await fs.mkdir(this.rootDirectory, { recursive: true }); const finalPath = path.join(this.rootDirectory, `${snapshotId}.bin`); const metadataPath = path.join(this.rootDirectory, `${snapshotId}.json`); const temporaryPath = `${finalPath}.${process.pid}.tmp`; const metadataTemporaryPath = `${metadataPath}.${process.pid}.tmp`;
    try { await fs.writeFile(temporaryPath, acquisition.rawBytes, { flag: 'wx' }); await fs.rename(temporaryPath, finalPath); } catch (error) { await fs.rm(temporaryPath, { force: true }); try { await fs.access(finalPath); } catch { throw error; } }
    const stored: StoredImportRawSnapshot = { artifactId: snapshotId, contentHash: sha256, byteSize: acquisition.rawBytes.byteLength, storedAt: new Date(), rawArtifactReference: finalPath, sourceId: acquisition.sourceId, connectorId: acquisition.connectorId, connectorVersion: acquisition.connectorVersion, fetchedAt: acquisition.fetchedAt, requestedUrl: acquisition.requestedUrl, finalUrl: acquisition.finalUrl, statusCode: acquisition.statusCode, contentType: acquisition.contentType, etag: acquisition.etag, lastModified: acquisition.lastModified };
    try { await fs.writeFile(metadataTemporaryPath, JSON.stringify(stored, null, 2), { flag: 'wx' }); await fs.rename(metadataTemporaryPath, metadataPath); } catch (error) { await fs.rm(metadataTemporaryPath, { force: true }); try { await fs.access(metadataPath); } catch { throw error; } }
    return (await this.get(snapshotId)) ?? stored;
  }
  async get(artifactId: string): Promise<StoredImportRawSnapshot | null> {
    if (!/^raw_[a-f0-9]{64}$/.test(artifactId)) return null;
    try { const value = JSON.parse(await fs.readFile(path.join(this.rootDirectory, `${artifactId}.json`), 'utf8')) as StoredImportRawSnapshot; return { ...value, storedAt: new Date(value.storedAt), fetchedAt: new Date(value.fetchedAt) }; } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  }
}
