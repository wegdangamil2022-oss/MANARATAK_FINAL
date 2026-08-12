import { PrismaClient } from '@prisma/client';
import {
  ISettingAssignmentRepository,
  SettingAssignment,
  SettingVersion,
  NamespacedKey,
  ScopeIdentifier,
  ValueType,
  SettingValueData,
  StringValue,
  NumberValue,
  BooleanValue,
  JsonValue
} from '@manaratak/domain';

export interface SettingVersionRecordRow {
  id: string;
  assignmentId: string;
  value: unknown;
  valueType: string;
  authorId: string | null;
  createdAt: Date;
  rollbackOfVersionId: string | null;
}

export interface SettingAssignmentRecordRow {
  id: string;
  key: string;
  scopeLevel: string;
  scopeId: string;
  currentVersionId: string;
  createdAt: Date;
  updatedAt: Date;
  versions?: SettingVersionRecordRow[];
}

export interface PrismaSettingAssignmentDelegate {
  findUnique(args: { where: { key_scopeLevel_scopeId: { key: string, scopeLevel: string, scopeId: string } }, include?: unknown }): Promise<SettingAssignmentRecordRow | null>;
  findMany(args?: { where?: unknown, include?: unknown }): Promise<SettingAssignmentRecordRow[]>;
  upsert(args: {
    where: { key_scopeLevel_scopeId: { key: string, scopeLevel: string, scopeId: string } };
    update: Omit<SettingAssignmentRecordRow, 'createdAt' | 'updatedAt' | 'id' | 'key' | 'scopeLevel' | 'scopeId' | 'versions'>;
    create: Omit<SettingAssignmentRecordRow, 'createdAt' | 'updatedAt' | 'versions'>;
  }): Promise<SettingAssignmentRecordRow>;
}

export interface PrismaSettingVersionDelegate {
  upsert(args: {
    where: { id: string };
    update: Omit<SettingVersionRecordRow, 'createdAt' | 'id' | 'assignmentId'>;
    create: Omit<SettingVersionRecordRow, 'createdAt'>;
  }): Promise<SettingVersionRecordRow>;
}

export interface SettingsAssignmentPrismaClient {
  settingAssignmentRecord: PrismaSettingAssignmentDelegate;
  settingVersionRecord: PrismaSettingVersionDelegate;
}

export class PrismaSettingAssignmentRepository implements ISettingAssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private get client(): SettingsAssignmentPrismaClient {
    return this.prisma as unknown as SettingsAssignmentPrismaClient;
  }

  private createValueData(type: string, value: unknown): SettingValueData {
    switch (type) {
      case ValueType.String: return new StringValue(value as string);
      case ValueType.Number: return new NumberValue(value as number);
      case ValueType.Boolean: return new BooleanValue(value as boolean);
      case ValueType.Json: return new JsonValue(value as Record<string, unknown>);
      default: throw new Error(`Unsupported value type: ${type}`);
    }
  }

  private mapToDomain(row: SettingAssignmentRecordRow): SettingAssignment {
    const versions = (row.versions || []).map(vRow => {
      return new SettingVersion(
        vRow.id,
        this.createValueData(vRow.valueType, vRow.value),
        vRow.createdAt,
        vRow.authorId || undefined
      );
    });
    
    // Sort versions by createdAt ascending just in case
    versions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return new SettingAssignment({
      id: row.id,
      key: new NamespacedKey(row.key),
      scope: new ScopeIdentifier(row.scopeLevel, row.scopeId || undefined),
      versions
    }, false);
  }

  async findByScopeAndKey(scope: ScopeIdentifier, key: NamespacedKey): Promise<SettingAssignment | null> {
    const record = await this.client.settingAssignmentRecord.findUnique({
      where: {
        key_scopeLevel_scopeId: {
          key: key.getValue(),
          scopeLevel: scope.getLevel(),
          scopeId: scope.getScopeId() || 'GLOBAL'
        }
      },
      include: {
        versions: true
      }
    });

    return record ? this.mapToDomain(record) : null;
  }

  async findBy(spec: { isSatisfiedBy: (assignment: SettingAssignment) => boolean }): Promise<SettingAssignment[]> {
    // Note: Due to lack of query specifications, we fetch all. 
    // In a real implementation we would map the spec to prisma query.
    const records = await this.client.settingAssignmentRecord.findMany({
      include: {
        versions: true
      }
    });
    
    const assignments = records.map(record => this.mapToDomain(record));
    return assignments.filter(assignment => spec.isSatisfiedBy(assignment));
  }

  async save(assignment: SettingAssignment): Promise<void> {
    const keyStr = assignment.key.getValue();
    const scopeLevel = assignment.scope.getLevel();
    const scopeId = assignment.scope.getScopeId() || 'GLOBAL';
    const currentVersion = assignment.getCurrentVersion();

    // 1. Save Assignment
    await this.client.settingAssignmentRecord.upsert({
      where: {
        key_scopeLevel_scopeId: {
          key: keyStr,
          scopeLevel: scopeLevel,
          scopeId: scopeId
        }
      },
      update: {
        currentVersionId: currentVersion.id
      },
      create: {
        id: assignment.id,
        key: keyStr,
        scopeLevel: scopeLevel,
        scopeId: scopeId,
        currentVersionId: currentVersion.id
      }
    });

    // 2. Save Versions
    for (const version of assignment.getVersions()) {
      await this.client.settingVersionRecord.upsert({
        where: { id: version.id },
        update: {
          value: version.value.getValue(),
          valueType: version.value.type,
          authorId: version.authorId || null,
          rollbackOfVersionId: null // We don't track this in domain currently
        },
        create: {
          id: version.id,
          assignmentId: assignment.id,
          value: version.value.getValue(),
          valueType: version.value.type,
          authorId: version.authorId || null,
          rollbackOfVersionId: null
        }
      });
    }
  }
}
