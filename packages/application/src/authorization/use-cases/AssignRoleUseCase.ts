import { 
  IRoleAssignmentRepository, 
  ITransactionalRoleAssignmentRepository,
  RoleAssignment
} from '@manaratak/domain';
import { AssignRoleInput } from '../dtos/AuthorizationDtos';
import { AtomicDomainMutationCoordinator, AtomicMutationRequestContext } from '../../event-foundation/use-cases/AtomicDomainMutationCoordinator';

export class AssignRoleUseCase {
  constructor(private readonly roleAssignmentRepository: IRoleAssignmentRepository, private readonly atomicMutations?: AtomicDomainMutationCoordinator) {}

  public async execute(input: AssignRoleInput, context?: AtomicMutationRequestContext): Promise<void> {
    const assignment = new RoleAssignment({
      id: input.id,
      identityId: input.identityId,
      roleId: input.roleId,
      assignedAt: new Date()
    });

    if (!this.atomicMutations) return this.roleAssignmentRepository.save(assignment);
    const repository = this.roleAssignmentRepository as Partial<ITransactionalRoleAssignmentRepository>;
    if (!repository.withTransaction) throw new Error('ROLE_ASSIGNMENT_TRANSACTIONAL_PERSISTENCE_REQUIRED');
    await this.atomicMutations.execute({ domain: 'AUTHORIZATION', aggregateType: 'ROLE_ASSIGNMENT', aggregateId: input.id, action: 'ROLE_ASSIGNED', context },
      transaction => repository.withTransaction!(transaction).save(assignment));
  }
}
