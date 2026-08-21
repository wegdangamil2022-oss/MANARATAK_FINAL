import { mkdtemp, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { AssetStorageLocator, AssetStorageZone } from '@manaratak/domain';
import { LocalAssetStorageGateway } from '../../src/asset-platform/LocalAssetStorageGateway';

describe('LocalAssetStorageGateway course artifact read', () => {
  it('reads only within configured bucket and respects byte cap', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'manaratak-assets-'));
    const bucket = 'local-test';
    await mkdir(path.join(root, bucket, 'clean'), { recursive: true });
    await writeFile(path.join(root, bucket, 'clean', 'courses.csv'), Buffer.from('a,b\n1,2'));

    const gateway = new LocalAssetStorageGateway(bucket, root);
    const locator = new AssetStorageLocator(
      AssetStorageZone.CLEAN,
      bucket,
      'clean/courses.csv',
    );

    expect(Buffer.from(await gateway.read(locator, 100)).toString('utf8')).toBe('a,b\n1,2');
    await expect(gateway.read(locator, 2)).rejects.toThrow('ASSET_READ_SIZE_LIMIT_EXCEEDED');

    const traversal = new AssetStorageLocator(
      AssetStorageZone.CLEAN,
      bucket,
      '../escape.csv',
    );
    await expect(gateway.read(traversal, 100)).rejects.toThrow(
      'ASSET_STORAGE_PATH_OUTSIDE_ROOT',
    );
  });
});
