import { AIRequestPurpose } from '../enums';

export class PromptRegistryService {
  private readonly allowedPromptKeys = new Map<AIRequestPurpose, readonly string[]>([
    [AIRequestPurpose.TOOL_ASSISTANCE, ['student-tool.guidance', 'student-tool.document-draft']],
    [AIRequestPurpose.IMPORT_CLASSIFICATION, ['import.classify-record', 'import.suggest-mapping']],
    [AIRequestPurpose.CONTENT_DRAFT, ['cms.draft-summary', 'cms.draft-guide']],
    [AIRequestPurpose.RECOMMENDATION, ['recommend.scholarships', 'recommend.majors', 'recommend.courses']],
    [AIRequestPurpose.TRANSLATION, ['translation.generic']],
    [AIRequestPurpose.SUMMARIZATION, ['summary.generic']]
  ]);

  assertAllowed(purpose: AIRequestPurpose, promptKey: string): void {
    const allowed = this.allowedPromptKeys.get(purpose) || [];
    if (!allowed.includes(promptKey)) {
      throw new Error(`Prompt key ${promptKey} is not allowed for purpose ${purpose}.`);
    }
  }
}
