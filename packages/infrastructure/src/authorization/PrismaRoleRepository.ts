import { PrismaClient } from '@prisma/client';
import { Role, PermissionReference, IRoleRepository } from '@manaratak/domain';
import { ISpecification } from '@manaratak/core';

export interface RoleRecordRow {
  id: string;
  name: string;
  description: string;
  permissions: unknown;
  policyIds: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaRoleDelegate {
  findUnique(args: { where: { id: string } }): Promise<RoleRecordRow | null>;
  findMany(args?: { where?: unknown }): Promise<RoleRecordRow[]>;
  upsert(args: {
    where: { id: string };
    update: Omit<RoleRecordRow, 'id' | 'createdAt' | 'updatedAt'>;
    create: Omit<RoleRecordRow, 'createdAt' | 'updatedAt'>;
  }): Promise<RoleRecordRow>;
  delete(args: { where: { id: string } }): Promise<unknown>;
}

export interface RolePrismaClient {
  roleRecord: PrismaRoleDelegate;
}

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private get client(): RolePrismaClient {
    return this.prisma as unknown as RolePrismaClient;
  }

  private mapToDomain(row: RoleRecordRow): Role {
    const rawPermissions = Array.isArray(row.permissions) ? (row.permissions as string[]) : [];
    const rawPolicyIds = Array.isArray(row.policyIds) ? (row.policyIds as string[]) : [];

    return new Role({
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: rawPermissions.map(p => new PermissionReference(p)),
      policyIds: rawPolicyIds,
    });
  }

  async findById(id: string): Promise<Role | null> {
    const record = await this.client.roleRecord.findUnique({
      where: { id },
    });

    return record ? this.mapToDomain(record) : null;
  }

  async save(role: Role): Promise<void> {
    await this.client.roleRecord.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(p => p.value),
        policyIds: role.policyIds,
      },
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(p => p.value),
        policyIds: role.policyIds,
      },
    });
  }

  async findBy(specification: ISpecification<Role>): Promise<Role[]> {
    const records = await this.client.roleRecord.findMany();
    const domainRoles = records.map(record => this.mapToDomain(record));
    return domainRoles.filter(role => specification.isSatisfiedBy(role));
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.roleRecord.delete({
        where: { id },
      });
    } catch (error) {
      // Ignore if record not found
    }
  }
}
