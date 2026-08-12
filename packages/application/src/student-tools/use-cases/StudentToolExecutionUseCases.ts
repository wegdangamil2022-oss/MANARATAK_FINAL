import {
  AIExecutionRequestDto,
  AIRequestPurpose,
  IStudentToolRegistryRepository,
  StudentToolExecutionType,
  StudentToolVisibilityStatus
} from '@manaratak/domain';
import { AIExecutionResponseDto, AIExecutionUseCases } from '../../ai-platform';

export interface StudentToolExecutionRequestDto {
  input: string;
  requesterReferenceId?: string | null;
  locale?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface StudentToolExecutionResponseDto {
  toolKey: string;
  executionPublicId: string;
  status: string;
  output?: string;
  blockedReason?: string;
}

export class StudentToolExecutionUseCases {
  constructor(
    private readonly repository: IStudentToolRegistryRepository,
    private readonly aiExecutionUseCases: AIExecutionUseCases
  ) {}

  public async execute(toolKey: string, request: StudentToolExecutionRequestDto): Promise<StudentToolExecutionResponseDto> {
    const tool = await this.repository.findByKey(toolKey);
    if (!tool || tool.adminOnly || !tool.publicEnabled) {
      throw new Error('Student tool not found');
    }
    if (tool.visibilityStatus !== StudentToolVisibilityStatus.ACTIVE) {
      throw new Error('Student tool is not active yet');
    }
    if (tool.executionType !== StudentToolExecutionType.AI_ASSISTED) {
      throw new Error('Only AI-assisted tools can execute through the AI Gateway');
    }

    const aiRequest: AIExecutionRequestDto = {
      purpose: AIRequestPurpose.TOOL_ASSISTANCE,
      promptKey: this.resolvePromptKey(toolKey),
      input: request.input,
      locale: request.locale,
      requesterReferenceId: request.requesterReferenceId,
      sourceDomain: 'Phase18StudentTools',
      metadata: {
        ...(request.metadata || {}),
        toolKey,
        toolDisplayName: tool.displayName,
        aiDependencyLevel: tool.aiDependencyLevel
      }
    };

    const result: AIExecutionResponseDto = await this.aiExecutionUseCases.execute(aiRequest);
    return {
      toolKey,
      executionPublicId: result.executionPublicId,
      status: result.status,
      output: result.result?.output,
      blockedReason: result.blockedReason
    };
  }

  private resolvePromptKey(toolKey: string): string {
    if (toolKey === 'statement-letter-builder') {
      return 'student-tool.document-draft';
    }
    return 'student-tool.guidance';
  }
}
