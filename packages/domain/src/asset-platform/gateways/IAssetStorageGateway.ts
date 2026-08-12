import { AssetStorageLocator } from '../value-objects/AssetStorageLocator';
import { AssetStorageZone } from '../enums/AssetStorageZone';

export interface IAssetStorageGateway {
  generateUploadLocator(zone?: AssetStorageZone): Promise<AssetStorageLocator>;
  moveToCleanZone(quarantineLocator: AssetStorageLocator): Promise<AssetStorageLocator>;
  archive(locator: AssetStorageLocator): Promise<void>;
  restore(locator: AssetStorageLocator): Promise<void>;
  delete(locator: AssetStorageLocator): Promise<void>;
}
