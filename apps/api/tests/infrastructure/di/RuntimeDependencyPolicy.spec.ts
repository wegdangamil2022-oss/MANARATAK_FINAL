import { describe, expect, it } from 'vitest';
import { LocalAssetStorageGateway } from '@manaratak/infrastructure';
import { createAssetStorageGatewayForRuntime, isDatabaseRequiredForRuntime } from '../../../src/infrastructure/di/RuntimeDependencyPolicy';

describe('RuntimeDependencyPolicy', () => {
  it.each(['development', 'test'])('permits local asset storage in %s', (NODE_ENV) => {
    expect(createAssetStorageGatewayForRuntime({ NODE_ENV })).toBeInstanceOf(LocalAssetStorageGateway);
  });

  it.each(['production', 'staging'])('never selects local asset storage in %s', (NODE_ENV) => {
    expect(createAssetStorageGatewayForRuntime({ NODE_ENV })).not.toBeInstanceOf(LocalAssetStorageGateway);
  });

  it('keeps DB optional only in normal development and makes closure intent mandatory', () => {
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'development' })).toBe(false);
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'development', DATABASE_REQUIRED: 'true' })).toBe(true);
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'development', RUNTIME_CLOSURE_MODE: 'true' })).toBe(true);
    expect(isDatabaseRequiredForRuntime({ NODE_ENV: 'staging' })).toBe(true);
  });
});
