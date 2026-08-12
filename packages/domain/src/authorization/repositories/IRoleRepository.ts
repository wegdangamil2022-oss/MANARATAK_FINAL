import { Role } from '../aggregates/Role';
import { ISpecification } from '@manaratak/core';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  save(role: Role): Promise<void>;
  findBy(specification: ISpecification<Role>): Promise<Role[]>;
  delete(id: string): Promise<void>;
}
