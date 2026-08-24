import { createHash, randomUUID } from 'node:crypto';
import {
  ExecuteStudentToolRequest,
  IStudentToolRegistryRepository,
  IStudentToolRateLimitGateway,
  StudentToolExecutionContext,
  StudentToolExecutionStatus,
  StudentToolHandlerRegistryLike,
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
    const allowance = await this.rateLimit.consume(
      `${toolKey}:${hash(identity)}`,
      request.consumerType === 'ANONYMOUS' ? 10 : 30,
      60_000,
    );
    if (!allowance.allowed) throw new Error('TOOL_RATE_LIMITED');
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
    });
    try {
      const result = await handler.execute(context, input as never);
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
  findExecution(executionId: string) {
    return this.repository.findExecution(executionId);
  }
}
