import { readFile, stat } from 'fs/promises';
import * as path from 'path';
import {
  IAssetStorageGateway,
  AssetStorageLocator,
  AssetStorageZone
} from '@manaratak/domain';

export class LocalAssetStorageGateway implements IAssetStorageGateway {
  constructor(
    private readonly localBucketName: string = 'local-dev-bucket',
    private readonly localRoot: string = process.env.MANARATAK_LOCAL_ASSET_ROOT
      || path.resolve(process.cwd(), 'storage', 'assets'),
  ) {}

  async generateUploadLocator(zone?: AssetStorageZone): Promise<AssetStorageLocator> {
    const targetZone = zone || AssetStorageZone.QUARANTINE;
    const pathKey = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return new AssetStorageLocator(targetZone, this.localBucketName, pathKey);
  }

  async moveToCleanZone(quarantineLocator: AssetStorageLocator): Promise<AssetStorageLocator> {
    const cleanPathKey = quarantineLocator.pathKey.replace(/^uploads\//, 'clean/');
    return new AssetStorageLocator(AssetStorageZone.CLEAN, this.localBucketName, cleanPathKey);
  }

  async read(locator: AssetStorageLocator, maxBytes: number): Promise<Uint8Array> {
    if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
      throw new Error('ASSET_READ_MAX_BYTES_INVALID');
    }
    if (locator.bucketName !== this.localBucketName) {
      throw new Error(`ASSET_STORAGE_BUCKET_NOT_AVAILABLE:${locator.bucketName}`);
    }

    const bucketRoot = path.resolve(this.localRoot, locator.bucketName);
    const resolvedPath = path.resolve(bucketRoot, locator.pathKey);
    if (resolvedPath !== bucketRoot && !resolvedPath.startsWith(`${bucketRoot}${path.sep}`)) {
      throw new Error('ASSET_STORAGE_PATH_OUTSIDE_ROOT');
    }

    const metadata = await stat(resolvedPath);
    if (!metadata.isFile()) {
      throw new Error('ASSET_STORAGE_LOCATOR_NOT_FILE');
    }
    if (metadata.size > maxBytes) {
      throw new Error(`ASSET_READ_SIZE_LIMIT_EXCEEDED:${metadata.size}:${maxBytes}`);
    }

    const data = await readFile(resolvedPath);
    if (data.byteLength > maxBytes) {
      throw new Error(`ASSET_READ_SIZE_LIMIT_EXCEEDED:${data.byteLength}:${maxBytes}`);
    }
    return new Uint8Array(data);
  }

  async archive(_locator: AssetStorageLocator): Promise<void> {
    // Local dev: No-op for archive
  }

  async restore(_locator: AssetStorageLocator): Promise<void> {
    // Local dev: No-op for restore
  }

  async delete(_locator: AssetStorageLocator): Promise<void> {
    // Local dev: No-op for delete
  }
}
