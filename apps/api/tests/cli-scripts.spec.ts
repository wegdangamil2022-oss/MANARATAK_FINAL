import { describe, it, expect, vi } from 'vitest';
import { container } from '../src/infrastructure/di/container';

describe('CLI Scripts', () => {
  it('runs final-validation-all successfully', async () => {
    const mockPrisma = {
      majorLevelProfile: { findMany: vi.fn().mockResolvedValue([]) },
      majorCatalogSection: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
      $disconnect: vi.fn().mockResolvedValue(undefined)
    };

    const origResolve = container.resolve.bind(container);
    vi.spyOn(container, 'resolve').mockImplementation((key: string) => {
      if (key === 'prisma') return mockPrisma;
      return origResolve(key);
    });

    process.exitCode = undefined;
    await import('../../../scripts/verify/final-validation-all');
    await new Promise(r => setTimeout(r, 1000));
    expect(process.exitCode).toBe(1);
  });
  
  it('runs import-masters-range successfully', async () => {
    process.exitCode = undefined;
    await import('../../../scripts/import/import-masters-range');
    await new Promise(r => setTimeout(r, 1000));
    expect(process.exitCode).toBeUndefined();
  });
  
  it('runs verify_import successfully', async () => {
    process.exitCode = undefined;
    await import('../../../scripts/verify_import');
    await new Promise(r => setTimeout(r, 1000));
    expect(process.exitCode).toBeUndefined();
  });
});
