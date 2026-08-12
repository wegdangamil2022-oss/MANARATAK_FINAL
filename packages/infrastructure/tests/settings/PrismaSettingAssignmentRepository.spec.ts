import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PrismaSettingAssignmentRepository } from '../../src/settings/PrismaSettingAssignmentRepository';
import { SettingAssignment, NamespacedKey, ScopeIdentifier, SettingVersion, StringValue, ScopeLevel } from '@manaratak/domain';

describe('PrismaSettingAssignmentRepository', () => {
  let mockPrisma: any;
  let repository: PrismaSettingAssignmentRepository;

  beforeEach(() => {
    mockPrisma = {
      settingAssignmentRecord: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        upsert: vi.fn()
      },
      settingVersionRecord: {
        upsert: vi.fn()
      }
    };
    repository = new PrismaSettingAssignmentRepository(mockPrisma as any);
  });

  it('maps setting assignment round trip including versions', async () => {
    const vCreatedAt = new Date();
    
    const record = {
      id: 'assign-1',
      key: 'test.key',
      scopeLevel: 'TENANT',
      scopeId: 'tenant-123',
      currentVersionId: 'v-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [
        {
          id: 'v-1',
          assignmentId: 'assign-1',
          value: 'test-value',
          valueType: 'String',
          authorId: 'admin-1',
          createdAt: vCreatedAt,
          rollbackOfVersionId: null
        }
      ]
    };

    mockPrisma.settingAssignmentRecord.findUnique.mockResolvedValue(record);

    const assignment = await repository.findByScopeAndKey(
      new ScopeIdentifier('TENANT', 'tenant-123'),
      new NamespacedKey('test.key')
    );

    expect(assignment).not.toBeNull();
    expect(assignment?.id).toBe('assign-1');
    expect(assignment?.key.getValue()).toBe('test.key');
    expect(assignment?.scope.getLevel()).toBe(ScopeLevel.TENANT);
    expect(assignment?.scope.getScopeId()).toBe('tenant-123');
    
    const versions = assignment?.getVersions();
    expect(versions).toHaveLength(1);
    expect(versions?.[0].id).toBe('v-1');
    expect(versions?.[0].value.type).toBe('String');
    expect(versions?.[0].value.getValue()).toBe('test-value');

    mockPrisma.settingAssignmentRecord.upsert.mockResolvedValue(record);
    mockPrisma.settingVersionRecord.upsert.mockResolvedValue(record.versions[0]);

    if (assignment) {
      await repository.save(assignment);
      expect(mockPrisma.settingAssignmentRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key_scopeLevel_scopeId: { key: 'test.key', scopeLevel: 'TENANT', scopeId: 'tenant-123' } },
          create: expect.objectContaining({
            id: 'assign-1',
            key: 'test.key',
            scopeLevel: 'TENANT',
            scopeId: 'tenant-123',
            currentVersionId: 'v-1'
          }),
          update: expect.objectContaining({
            currentVersionId: 'v-1'
          })
        })
      );

      expect(mockPrisma.settingVersionRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v-1' },
          create: expect.objectContaining({
            id: 'v-1',
            assignmentId: 'assign-1',
            value: 'test-value',
            valueType: 'String',
            authorId: 'admin-1'
          }),
          update: expect.objectContaining({
            value: 'test-value'
          })
        })
      );
    }
  });

  it('findBy returns all assignments that satisfy the spec', async () => {
    mockPrisma.settingAssignmentRecord.findMany.mockResolvedValue([
      {
        id: 'assign-1',
        key: 'test.key',
        scopeLevel: 'GLOBAL',
        scopeId: 'GLOBAL',
        currentVersionId: 'v-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        versions: [
          {
            id: 'v-1',
            assignmentId: 'assign-1',
            value: 'val1',
            valueType: 'String',
            authorId: null,
            createdAt: new Date(),
            rollbackOfVersionId: null
          }
        ]
      }
    ]);

    const assignments = await repository.findBy({
      isSatisfiedBy: (a) => a.id === 'assign-1'
    });

    expect(assignments).toHaveLength(1);
    expect(assignments[0].id).toBe('assign-1');
  });
});
