import { RoleAssignment } from '../aggregates/RoleAssignment';
import { ISpecification } from '@manaratak/core';

export interface IRoleAssignmentRepository {
  findById(id: string): Promise<RoleAssignment | null>;
  save(assignment: RoleAssignment): Promise<void>;
  findBy(specification: ISpecification<RoleAssignment>): Promise<RoleAssignment[]>;
  findByIdentityId(identityId: string): Promise<RoleAssignment[]>;
  delete(id: string): Promise<void>;
}
