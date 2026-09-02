import { IRateLimiter } from '@manaratak/core';
import { IAssetStorageGateway } from '@manaratak/domain';
import type { IImportRawSnapshotStore } from '@manaratak/application';
import {
  DefaultRateLimiter,
  LocalAssetStorageGateway,
  LocalImportRawSnapshotStore,
  RedisClientFactory,
  RedisRateLimiter,
  createUnavailableCapability,
} from '@manaratak/infrastructure';

export type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

type RuntimeCapability = {
  readonly capabilityStatus?: string;
  readonly isProductionReady?: boolean;
};

type RedisClientFactoryFn = typeof RedisClientFactory.createClient;

export function isDatabaseRequiredForRuntime(env: RuntimeEnvironment): boolean {
  return env.NODE_ENV === 'production' || env.NODE_ENV === 'staging' || env.DATABASE_REQUIRED === 'true' || env.RUNTIME_CLOSURE_MODE === 'true';
}

export function createAssetStorageGatewayForRuntime(env: RuntimeEnvironment): IAssetStorageGateway {
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging') {
    return createUnavailableCapability('assetStorageGateway') as IAssetStorageGateway;
  }
  return new LocalAssetStorageGateway(
    'local-dev-bucket',
    env.MANARATAK_LOCAL_ASSET_ROOT || undefined,
    false,
  );
}

export function assertAssetSecurityProvidersForRuntime(
  env: RuntimeEnvironment,
  providers: {
    storage: RuntimeCapability;
    malwareScanner: RuntimeCapability;
    sanitizer: RuntimeCapability;
  },
): void {
  if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'staging') return;

  const unavailable = Object.entries(providers)
    .filter(([, provider]) => provider?.isProductionReady !== true
      && provider?.capabilityStatus !== 'PRODUCTION_CAPABLE'
      && provider?.capabilityStatus !== 'AVAILABLE')
    .map(([name]) => name);

  if (unavailable.length > 0) {
    throw new Error(`Production asset security providers are unavailable: ${unavailable.join(', ')}`);
  }
}


export function createImportRawSnapshotStoreForRuntime(
  env: RuntimeEnvironment,
  configuredDirectory?: string,
): IImportRawSnapshotStore {
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging') {
    // Production must never silently write provenance artifacts to node-local ephemeral disk.
    // A durable provider adapter is injected during runtime closure; until then fail closed.
    return createUnavailableCapability('durableImportRawSnapshotStore') as IImportRawSnapshotStore;
  }
  return new LocalImportRawSnapshotStore(configuredDirectory);
}

export function createRateLimiterForRuntime(
  env: RuntimeEnvironment,
  logger?: unknown,
  createRedisClient: RedisClientFactoryFn = RedisClientFactory.createClient,
): IRateLimiter {
  const productionLike = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';
  if (!productionLike) return new DefaultRateLimiter();

  const redisUrl = env.REDIS_URL?.trim();
  if (!redisUrl) {
    throw new Error('REDIS_URL is required for production/staging distributed rate limiting');
  }

  const client = createRedisClient(
    {
      REDIS_URL: redisUrl,
      REDIS_NAMESPACE: env.REDIS_NAMESPACE,
    },
    logger,
  );
  const keyPrefix = typeof (client as any).buildKey === 'function'
    ? `${(client as any).buildKey('rate-limit', '')}`
    : 'manaratak:rate-limit:';
  return new RedisRateLimiter(client as any, keyPrefix);
}
