import { PrismaClient } from '@prisma/client';
import {
  ISettingDefinitionRepository,
  SettingDefinition,
  NamespacedKey,
  ValueType
} from '@manaratak/domain';

export interface SettingDefinitionRecordRow {
  id: string;
  key: string;
  valueType: string;
  description: string | null;
  defaultValue: unknown | null;
  isFeatureFlag: boolean;
  isDeprecated: boolean;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaSettingDefinitionDelegate {
  findUnique(args: { where: { key: string } }): Promise<SettingDefinitionRecordRow | null>;
  findMany(args?: { where?: unknown }): Promise<SettingDefinitionRecordRow[]>;
  upsert(args: {
    where: { key: string };
    update: Omit<SettingDefinitionRecordRow, 'createdAt' | 'updatedAt' | 'id' | 'key'>;
    create: Omit<SettingDefinitionRecordRow, 'createdAt' | 'updatedAt'>;
  }): Promise<SettingDefinitionRecordRow>;
}

export interface SettingsPrismaClient {
  settingDefinitionRecord: PrismaSettingDefinitionDelegate;
}

export class PrismaSettingDefinitionRepository implements ISettingDefinitionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private get client(): SettingsPrismaClient {
    return this.prisma as unknown as SettingsPrismaClient;
  }

  private mapToDomain(row: SettingDefinitionRecordRow): SettingDefinition {
    return new SettingDefinition({
      id: row.id,
      key: new NamespacedKey(row.key),
      valueType: row.valueType as ValueType,
      description: row.description || undefined,
      defaultValue: row.defaultValue,
      isFeatureFlag: row.isFeatureFlag,
      isDeprecated: row.isDeprecated,
      isSecret: row.isSecret
    }, false);
  }

  async findByKey(key: NamespacedKey): Promise<SettingDefinition | null> {
    const record = await this.client.settingDefinitionRecord.findUnique({
      where: { key: key.getValue() }
    });
    return record ? this.mapToDomain(record) : null;
  }

  async save(definition: SettingDefinition): Promise<void> {
    const keyStr = definition.key.getValue();
    const data = {
      valueType: definition.valueType,
      description: definition.description || null,
      defaultValue: definition.defaultValue !== undefined ? definition.defaultValue : null,
      isFeatureFlag: definition.isFeatureFlag,
      isDeprecated: definition.isDeprecated,
      isSecret: definition.isSecret
    };

    await this.client.settingDefinitionRecord.upsert({
      where: { key: keyStr },
      update: data,
      create: {
        id: definition.id,
        key: keyStr,
        ...data
      }
    });
  }
}

