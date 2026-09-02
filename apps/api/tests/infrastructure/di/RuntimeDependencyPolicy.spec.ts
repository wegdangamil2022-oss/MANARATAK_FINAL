import { describe, expect, it, vi } from 'vitest';
import {
  assertAssetSecurityProvidersForRuntime,
  createAssetStorageGatewayForRuntime,
  createImportRawSnapshotStoreForRuntime,
  createRateLimiterForRuntime,
  isDatabaseRequiredForRuntime,
} from '../../../src/infrastructure/di/RuntimeDependencyPolicy';


describe('RuntimeDependencyPolicy', () => {
  it('requires database in production, staging and runtime-closure modes', () => {
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'production' })).toBe(true);
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'staging' })).toBe(true);
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'development', RUNTIME_CLOSURE_MODE: 'true' })).toBe(true);
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'development' })).toBe(false);
  });

  it('keeps local asset storage development-only', () => {
    expect(() => createAssetStorageGatewayForRuntime({ NODE_ENV: 'development' })).not.toThrow();
    const productionGateway = createAssetStorageGatewayForRuntime({ NODE_ENV: 'production' }) as any;
    expect(productionGateway.capabilityStatus ?? productionGateway.status?.()).toBeDefined();
  });

  it('fails production and staging closed when mandatory asset security providers are unavailable', () => {
    const unavailable = { capabilityStatus: 'UNAVAILABLE' };
    const providers = { storage: unavailable, malwareScanner: unavailable, sanitizer: unavailable };

    expect(() => assertAssetSecurityProvidersForRuntime({ NODE_ENV: 'production' }, providers))
      .toThrow(/storage, malwareScanner, sanitizer/);
    expect(() => assertAssetSecurityProvidersForRuntime({ NODE_ENV: 'staging' }, providers))
      .toThrow(/Production asset security providers are unavailable/);
    expect(() => assertAssetSecurityProvidersForRuntime({ NODE_ENV: 'development' }, providers))
      .not.toThrow();
  });

  it('accepts only explicitly production-capable asset security providers', () => {
    const ready = { capabilityStatus: 'PRODUCTION_CAPABLE' };
    expect(() => assertAssetSecurityProvidersForRuntime(
      { NODE_ENV: 'production' },
      { storage: ready, malwareScanner: ready, sanitizer: ready },
    )).not.toThrow();
  });


  it('keeps raw import snapshots local only in non-production environments', async () => {
    const developmentStore = createImportRawSnapshotStoreForRuntime(
      { NODE_ENV: 'development' },
      'var/test-import-raw',
    ) as any;
    expect(developmentStore.persistenceClassification).toBe('DEVELOPMENT_ONLY');

    const productionStore = createImportRawSnapshotStoreForRuntime({ NODE_ENV: 'production' }) as any;
    await expect(productionStore.get('raw_deadbeef')).rejects.toThrow();
  });

  it('selects process-local limiter only outside production-like environments', () => {
    const limiter = createRateLimiterForRuntime({ NODE_ENV: 'development' });
    expect(limiter.isProductionReady).toBe(false);
    expect(limiter.kind).toBe('process-local');
  });

  it('requires Redis for production-like rate limiting', () => {
    expect(() => createRateLimiterForRuntime({ NODE_ENV: 'production' })).toThrow(/REDIS_URL/);
  });

  it('builds a production-capable Redis limiter from the composition boundary', () => {
    const evalMock = vi.fn().mockResolvedValue([1, 60_000]);
    const fakeClient = {
      eval: evalMock,
      buildKey: (feature: string, key: string) => `mnr:${feature}:${key}`,
    };
    const factory = vi.fn(() => fakeClient as any);
    const limiter = createRateLimiterForRuntime(
      { NODE_ENV: 'production', REDIS_URL: 'redis://redis.internal:6379', REDIS_NAMESPACE: 'mnr:' },
      undefined,
      factory as any,
    );

    expect(limiter.isProductionReady).toBe(true);
    expect(limiter.kind).toBe('real');
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
