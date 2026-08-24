import { createHash, randomUUID } from 'node:crypto';
import {
  ExecuteStudentToolRequest,
  IStudentToolDependencyHealthGateway,
  IStudentToolRegistryRepository,
  IStudentToolRateLimitGateway,
  IStudentToolSaveGateway,
  StudentToolExecutionContext,
  StudentToolExecutionStatus,
  StudentToolHandlerRegistryLike,
  StudentToolExecutionRequester,
  StudentToolImplementationStatus,
  StudentToolLifecycleStatus,
  StudentToolVisibilityStatus,
} from '@manaratak/domain';
const hash = (value?: string) =>
  value ? createHash('sha256').update(`phase18:${value}`).digest('hex') : null;
export class StudentToolExecutionUseCases {
  constructor(
    private readonly repository: IStudentToolRegistryRepository,
    private readonly handlers: StudentToolHandlerRegistryLike,
    private readonly rateLimit: IStudentToolRateLimitGateway,
    private readonly dependencyHealth: IStudentToolDependencyHealthGateway,
    private readonly saveGateway?: IStudentToolSaveGateway,
  ) {}
  async execute(toolKey: string, request: ExecuteStudentToolRequest) {
    const tool = await this.repository.findByKey(toolKey);
    if (!tool || tool.availability.adminOnly || !tool.availability.publicEnabled)
      throw new Error('TOOL_NOT_FOUND');
    if (
      tool.implementationStatus !== StudentToolImplementationStatus.IMPLEMENTED ||
      !this.handlers.has(toolKey)
    )
      throw new Error('TOOL_NOT_IMPLEMENTED');
    if (
      tool.lifecycle !== StudentToolLifecycleStatus.ACTIVE ||
      tool.visibility !== StudentToolVisibilityStatus.ACTIVE ||
      !tool.featureFlags.globallyEnabled
    )
      throw new Error('TOOL_NOT_ACTIVE');
    if (tool.featureFlags.maintenanceMode || tool.availability.maintenanceMode)
      throw new Error('TOOL_MAINTENANCE');
    if (
      request.consumerType === 'ANONYMOUS' &&
      (!tool.availability.anonymousEnabled || !tool.featureFlags.anonymousEnabled)
    )
      throw new Error('TOOL_AUTH_REQUIRED');
    if (
      request.consumerType === 'AUTHENTICATED_STUDENT' &&
      (!tool.availability.authenticatedEnabled || !tool.featureFlags.authenticatedEnabled)
    )
      throw new Error('TOOL_ACCESS_DENIED');
    const identity =
      request.authenticatedStudentReference ??
      request.anonymousSessionReference ??
      request.requestId ??
      'unknown';
    const idempotencyKeyHash = request.idempotencyKey
      ? hash(`${identity}:${request.idempotencyKey}`)
      : null;
    if (idempotencyKeyHash) {
      const previous = await this.repository.findExecutionByIdempotency(
        toolKey,
        idempotencyKeyHash,
      );
      if (previous)
        return {
          executionId: previous.executionId,
          toolKey,
          toolVersion: previous.toolVersion,
          status: previous.status,
          warnings: ['IDEMPOTENT_REPLAY_RESULT_NOT_PERSISTED'],
          aiExecutionReference: previous.aiExecutionReference ?? undefined,
          executedAt: previous.completedAt ?? previous.startedAt,
        };
    }
    const rateLimit =
      request.consumerType === 'ANONYMOUS'
        ? tool.rateLimitPolicy.anonymousRequestsPerMinute
        : request.consumerType === 'ADMIN_TEST'
          ? tool.rateLimitPolicy.adminTestRequestsPerMinute
          : tool.rateLimitPolicy.authenticatedRequestsPerMinute;
    const allowance = await this.rateLimit.consume(
      `${toolKey}:${hash(identity)}`,
      rateLimit,
      60_000,
    );
    if (!allowance.allowed) throw new Error('TOOL_RATE_LIMITED');
    const dependencyEntries = await Promise.all(
      tool.dependencies.map(async (dependency) => [
        `${dependency.phase}:${dependency.capabilityKey ?? dependency.type}`,
        await this.dependencyHealth.status(dependency),
      ] as const),
    );
    const dependencyStatus = Object.fromEntries(dependencyEntries);
    const unavailableRequired = tool.dependencies.find((dependency) => {
      const key = `${dependency.phase}:${dependency.capabilityKey ?? dependency.type}`;
      return dependency.required && dependencyStatus[key] !== 'READY';
    });
    if (unavailableRequired) throw new Error('TOOL_DEPENDENCY_UNAVAILABLE');
    const handler = this.handlers.get(toolKey)!;
    const executionId = `stx_${randomUUID()}`;
    const startedAt = new Date();
    const context: StudentToolExecutionContext = {
      executionId,
      requestId: request.requestId ?? randomUUID(),
      correlationId: randomUUID(),
      traceId: randomUUID(),
      toolKey,
      toolVersion: tool.currentVersion.semanticVersion,
      locale: request.locale ?? 'ar',
      consumerType: request.consumerType,
      authenticatedStudentReference: request.authenticatedStudentReference,
      anonymousSessionReference: request.anonymousSessionReference,
      startedAt,
    };
    const input = handler.validate(request.input);
    await this.repository.recordExecution({
      executionId,
      toolKey,
      toolVersion: context.toolVersion,
      status: StudentToolExecutionStatus.RUNNING,
      consumerType: request.consumerType,
      studentReferenceHash: hash(request.authenticatedStudentReference),
      anonymousSessionHash: hash(request.anonymousSessionReference),
      idempotencyKeyHash,
      correlationId: context.correlationId,
      traceId: context.traceId,
      isTest: request.isTest === true,
      startedAt,
      safeUsageMetadata: { locale: context.locale },
      dependencyStatus,
    });
    try {
      const unvalidatedResult = await handler.execute(context, input as never);
      const result = handler.validateOutput(unvalidatedResult);
      const completedAt = new Date();
      const aiExecutionReference =
        'aiExecutionId' in result && typeof result.aiExecutionId === 'string'
          ? result.aiExecutionId
          : null;
      await this.repository.completeExecution(executionId, {
        status: StudentToolExecutionStatus.COMPLETED,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        aiExecutionReference,
      });
      return {
        executionId,
        toolKey,
        toolVersion: context.toolVersion,
        status: StudentToolExecutionStatus.COMPLETED,
        result,
        aiExecutionReference: aiExecutionReference ?? undefined,
        executedAt: completedAt,
      };
    } catch (error) {
      const completedAt = new Date();
      const errorCode =
        error instanceof Error ? error.message.split(':')[0] : 'TOOL_EXECUTION_FAILED';
      await this.repository.completeExecution(executionId, {
        status: errorCode.includes('UNAVAILABLE')
          ? StudentToolExecutionStatus.BLOCKED
          : StudentToolExecutionStatus.FAILED,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        errorCode,
      });
      throw error;
    }
  }
  async findExecutionForRequester(executionId: string, requester: StudentToolExecutionRequester) {
    const record = await this.repository.findExecution(executionId);
    if (!record || record.consumerType !== requester.consumerType) return null;
    const expected =
      requester.consumerType === 'AUTHENTICATED_STUDENT'
        ? hash(requester.authenticatedStudentReference)
        : hash(requester.anonymousSessionReference);
    const actual =
      requester.consumerType === 'AUTHENTICATED_STUDENT'
        ? record.studentReferenceHash
        : record.anonymousSessionHash;
    return expected && actual === expected ? record : null;
  }
  async saveExecutionForStudent(executionId: string, authenticatedStudentReference: string, result: unknown) {
    if (!authenticatedStudentReference) throw new Error('TOOL_AUTH_REQUIRED');
    if (!this.saveGateway) throw new Error('TOOL_SAVE_NOT_CONFIGURED');
    const record = await this.findExecutionForRequester(executionId, {
      consumerType: 'AUTHENTICATED_STUDENT',
      authenticatedStudentReference,
    });
    if (!record) throw new Error('TOOL_EXECUTION_NOT_FOUND');
    if (record.status !== StudentToolExecutionStatus.COMPLETED) throw new Error('TOOL_EXECUTION_NOT_SAVABLE');
    const handler = this.handlers.get(record.toolKey);
    if (!handler) throw new Error('TOOL_NOT_IMPLEMENTED');
    const validatedResult = handler.validateOutput(result);
    return this.saveGateway.savePrivateResult({
      studentReference: authenticatedStudentReference,
      toolKey: record.toolKey,
      executionId: record.executionId,
      resultReference: record.executionId,
      result: validatedResult,
    });
  }
}
