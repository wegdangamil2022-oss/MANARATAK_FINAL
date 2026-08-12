import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PrismaUniversityRepository } from '../../src/universities/PrismaUniversityRepository';

describe('PrismaUniversityRepository', () => {
  let mockPrisma: any;
  let repository: PrismaUniversityRepository;

  beforeEach(() => {
    mockPrisma = {
      university: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn()
      }
    };
    repository = new PrismaUniversityRepository(mockPrisma as any);
  });

  it('update merges existing optional fields correctly', async () => {
    mockPrisma.university.findUnique.mockResolvedValue({
      id: 'db-id-1',
      optionalFields: {
        oldField: 'oldValue'
      }
    });

    mockPrisma.university.update.mockResolvedValue({
      id: 'db-id-1',
      displayName: 'New Name',
      optionalFields: {
        oldField: 'oldValue',
        newField: 'newValue'
      }
    });

    const result = await repository.update('db-id-1', {
      displayName: 'New Name',
      newField: 'newValue' // should be mapped to optionalFields
    });

    expect(mockPrisma.university.update).toHaveBeenCalledWith({
      where: { id: 'db-id-1' },
      data: expect.objectContaining({
        displayName: 'New Name',
        optionalFields: {
          oldField: 'oldValue',
          newField: 'newValue'
        }
      })
    });

    expect(result.oldField).toBe('oldValue');
    expect(result.newField).toBe('newValue');
  });

  it('findByDedupKey returns mapped dto', async () => {
    mockPrisma.university.findUnique.mockResolvedValue({
      id: 'db-id-1',
      canonicalDedupKey: 'test|key',
      optionalFields: { foo: 'bar' }
    });

    const result = await repository.findByDedupKey('test|key');

    expect(mockPrisma.university.findUnique).toHaveBeenCalledWith({
      where: { canonicalDedupKey: 'test|key' }
    });
    expect(result.id).toBe('db-id-1');
    expect(result.foo).toBe('bar'); // mapped
  });
});
