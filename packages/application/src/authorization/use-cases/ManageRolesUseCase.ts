import { 
  IRoleRepository, 
  Role, 
  PermissionReference 
} from '@manaratak/domain';
import { CreateRoleInput } from '../dtos/AuthorizationDtos';

export class ManageRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  public async createRole(input: CreateRoleInput): Promise<void> {
    const role = new Role({
      id: input.id,
      name: input.name,
      description: input.description,
      permissions: input.permissions.map(p => new PermissionReference(p)),
      policyIds: input.policyIds
    });

    await this.roleRepository.save(role);
  }

  public async getRole(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }
}
