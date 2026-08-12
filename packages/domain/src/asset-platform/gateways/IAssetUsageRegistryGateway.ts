import { AssetId } from '../value-objects/AssetId';

export interface IAssetUsageRegistryGateway {
  isAssetInUse(id: AssetId): Promise<boolean>;
  registerUsage(id: AssetId, consumerUrn: string): Promise<void>;
  unregisterUsage(id: AssetId, consumerUrn: string): Promise<void>;
}
