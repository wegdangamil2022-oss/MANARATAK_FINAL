import {
  IAssetStorageGateway,
  AssetStorageLocator,
  AssetStorageZone
} from '@manaratak/domain';

export class LocalAssetStorageGateway implements IAssetStorageGateway {
  constructor(private readonly localBucketName: string = 'local-dev-bucket') {}

  async generateUploadLocator(zone?: AssetStorageZone): Promise<AssetStorageLocator> {
    const targetZone = zone || AssetStorageZone.QUARANTINE;
    const pathKey = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return new AssetStorageLocator(targetZone, this.localBucketName, pathKey);
  }

  async moveToCleanZone(quarantineLocator: AssetStorageLocator): Promise<AssetStorageLocator> {
    const cleanPathKey = quarantineLocator.pathKey.replace(/^uploads\//, 'clean/');
    return new AssetStorageLocator(AssetStorageZone.CLEAN, this.localBucketName, cleanPathKey);
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
