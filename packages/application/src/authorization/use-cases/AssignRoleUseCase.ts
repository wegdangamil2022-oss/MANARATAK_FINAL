import { 
  IRoleAssignmentRepository, 
  RoleAssignment
} from '@manaratak/domain';
import { AssignRoleInput } from '../dtos/AuthorizationDtos';

export class AssignRoleUseCase {
  constructor(private readonly roleAssignmentRepository: IRoleAssignmentRepository) {}

  public async execute(input: AssignRoleInput): Promise<void> {
    const assignment = new RoleAssignment({
      id: input.id,
      identityId: input.identityId,
      roleId: input.roleId,
      assignedAt: new Date()
    });

    await this.roleAssignmentRepository.save(assignment);
  }
}
