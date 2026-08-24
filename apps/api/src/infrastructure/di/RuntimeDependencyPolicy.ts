import { IAssetStorageGateway } from '@manaratak/domain';
import { LocalAssetStorageGateway, createUnavailableCapability } from '@manaratak/infrastructure';

export function isDatabaseRequiredForRuntime(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV === 'production' || env.NODE_ENV === 'staging' || env.DATABASE_REQUIRED === 'true' || env.RUNTIME_CLOSURE_MODE === 'true';
}

export function createAssetStorageGatewayForRuntime(env: NodeJS.ProcessEnv): IAssetStorageGateway {
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging') {
    return createUnavailableCapability('assetStorageGateway') as IAssetStorageGateway;
  }
  return new LocalAssetStorageGateway();
}
