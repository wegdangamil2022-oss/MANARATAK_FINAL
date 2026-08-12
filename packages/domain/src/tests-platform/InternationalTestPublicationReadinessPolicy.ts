import {
  PublicationReadinessIssue,
  PublicationReadinessPolicy
} from '../publication-readiness/PublicationReadiness';
import { InternationalTestDto } from './contracts';
import { InternationalTestStatus, InternationalTestValidationSeverity } from './enums';
import { IInternationalTestValidationService, InternationalTestValidationService } from './validation';

export class InternationalTestPublicationReadinessPolicy implements PublicationReadinessPolicy<InternationalTestDto> {
  public readonly domain = 'INTERNATIONAL_TESTS';

  constructor(
    private readonly validationService: IInternationalTestValidationService = new InternationalTestValidationService()
  ) {}

  public evaluate(entity: InternationalTestDto) {
    const report = this.validationService.validate(entity);
    const blockingIssues: PublicationReadinessIssue[] = report.issues
      .filter(issue => issue.severity === InternationalTestValidationSeverity.ERROR)
      .map(issue => ({
        code: `INTERNATIONAL_TEST_${issue.field.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()}_INVALID`,
        message: issue.message,
        field: issue.field
      }));
    const warnings: PublicationReadinessIssue[] = report.warnings.map(issue => ({
      code: `INTERNATIONAL_TEST_${issue.field.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()}_WARNING`,
      message: issue.message,
      field: issue.field
    }));

    if (entity.status !== InternationalTestStatus.READY_TO_PUBLISH) {
      blockingIssues.push({ code: 'INTERNATIONAL_TEST_INVALID_PUBLICATION_STATUS', message: 'Test must be READY_TO_PUBLISH', field: 'status' });
    }
    if (!entity.localizedNameAr?.trim()) {
      blockingIssues.push({ code: 'INTERNATIONAL_TEST_ARABIC_NAME_MISSING', message: 'Arabic localized name is required for publication', field: 'localizedNameAr' });
    }
    if (!entity.localizedNameEn?.trim()) {
      blockingIssues.push({ code: 'INTERNATIONAL_TEST_ENGLISH_NAME_MISSING', message: 'English localized name is required for publication', field: 'localizedNameEn' });
    }
    if (!entity.providerId?.trim()) {
      blockingIssues.push({ code: 'INTERNATIONAL_TEST_CANONICAL_PROVIDER_MISSING', message: 'Canonical provider reference is required', field: 'providerId' });
    }
    if (!entity.isSourceVerified) {
      blockingIssues.push({ code: 'INTERNATIONAL_TEST_SOURCE_NOT_VERIFIED', message: 'Source identity must be verified before publication', field: 'isSourceVerified' });
    }

    return { blockingIssues, warnings };
  }
}
