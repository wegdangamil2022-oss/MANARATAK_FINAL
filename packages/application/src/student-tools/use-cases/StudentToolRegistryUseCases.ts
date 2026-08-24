import {
  IStudentToolRegistryRepository,
  StudentToolFilters,
  StudentToolImplementationStatus,
  StudentToolLifecycleStatus,
  StudentToolVisibilityStatus,
} from '@manaratak/domain';
import { OFFICIAL_STUDENT_TOOLS } from '../OfficialStudentToolRegistry';
export class StudentToolRegistryUseCases {
  constructor(private readonly repository: IStudentToolRegistryRepository) {}
  async installOfficialRegistry(actorReferenceId: string) {
    if (!actorReferenceId) throw new Error('ACTOR_REQUIRED');
    const values = [];
    for (const tool of OFFICIAL_STUDENT_TOOLS)
      values.push(await this.repository.upsertDefinition(tool, actorReferenceId));
    return values;
  }
  listAdminTools(filters: StudentToolFilters = {}) {
    return this.repository.list(filters);
  }
  listPublicTools(filters: StudentToolFilters = {}) {
    return this.repository.listPublic(filters);
  }
  findTool(toolKey: string) {
    return this.repository.findByKey(toolKey);
  }
  telemetry(toolKey?: string) {
    return this.repository.telemetry(toolKey);
  }
  executions(toolKey: string, page?: number, pageSize?: number) {
    return this.repository.listExecutions(toolKey, page, pageSize);
  }
  audit(toolKey: string) {
    return this.repository.audit(toolKey);
  }
  async update(toolKey: string, patch: Record<string, unknown>, actorReferenceId: string) {
    if (['toolKey', 'id', 'createdAt'].some((key) => key in patch))
      throw new Error('IMMUTABLE_TOOL_IDENTITY');
    return this.repository.updateDefinition(
      toolKey,
      patch,
      actorReferenceId,
      'STUDENT_TOOL_UPDATED',
    );
  }
  async transition(
    toolKey: string,
    lifecycle: StudentToolLifecycleStatus,
    actorReferenceId: string,
  ) {
    const tool = await this.repository.findByKey(toolKey);
    if (!tool) throw new Error('TOOL_NOT_FOUND');
    if (
      lifecycle === StudentToolLifecycleStatus.ACTIVE &&
      tool.implementationStatus !== StudentToolImplementationStatus.IMPLEMENTED
    )
      throw new Error('TOOL_NOT_IMPLEMENTED');
    const visibility =
      lifecycle === StudentToolLifecycleStatus.ACTIVE
        ? StudentToolVisibilityStatus.ACTIVE
        : lifecycle === StudentToolLifecycleStatus.RETIRED
          ? StudentToolVisibilityStatus.RETIRED
          : tool.visibility;
    return this.repository.updateDefinition(
      toolKey,
      { lifecycle, visibility },
      actorReferenceId,
      `STUDENT_TOOL_${lifecycle}`,
    );
  }
}
