import { AIExecutionRequestDto, AIExecutionResultDto } from '../entities';

export interface IAIProviderGateway {
  execute(request: AIExecutionRequestDto): Promise<AIExecutionResultDto>;
}
