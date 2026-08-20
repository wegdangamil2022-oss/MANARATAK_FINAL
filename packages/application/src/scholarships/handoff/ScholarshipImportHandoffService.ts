import {
  ScholarshipCompletenessClassifier,
  ScholarshipCompletenessState,
  ScholarshipImportPayloadSchema,
  type IImportHandoffConsumer,
  type UniversalImportHandoff,
} from '@manaratak/domain';
import type {
  IScholarshipHandoffCanonicalScreening,
  ScholarshipImportStagingCandidate,
  ScholarshipImportStagingState,
} from './ScholarshipImportHandoffContracts';

const ALLOWED_OWNER_DOMAINS = new Set(['SCHOLARSHIP', 'SCHOLARSHIPS']);

/**
 * Phase 6 -> Phase 12 handoff adapter.
 *
 * This service performs semantic validation/screening only. It deliberately
 * does not persist a Scholarship, transfer a record to Catalog, or publish it.
 */
export class ScholarshipImportHandoffService
  implements IImportHandoffConsumer<ScholarshipImportStagingCandidate>
{
  constructor(private readonly screening?: IScholarshipHandoffCanonicalScreening) {}

  async accept(handoff: UniversalImportHandoff): Promise<ScholarshipImportStagingCandidate> {
    const ownerDomain = handoff.ownerDomain.trim().toUpperCase();
    if (!ALLOWED_OWNER_DOMAINS.has(ownerDomain)) {
      throw new Error(`SCHOLARSHIP_HANDOFF_OWNER_DOMAIN_INVALID:${handoff.ownerDomain}`);
    }
    if (handoff.validation.state === 'INVALID') {
      throw new Error('SCHOLARSHIP_HANDOFF_INVALID');
    }

    const parsed = ScholarshipImportPayloadSchema.safeParse(handoff.normalizedPayload);
    if (!parsed.success) {
      throw new Error('SCHOLARSHIP_HANDOFF_PAYLOAD_INVALID');
    }

    const completeness = ScholarshipCompletenessClassifier.classify(parsed.data);
    const canonicalScreening = this.screening
      ? await this.screening.screen(parsed.data)
      : [];

    return {
      stagingKey: this.stagingKey(handoff),
      stageState: this.stageState(completeness.state),
      normalizedPayload: parsed.data,
      completeness: {
        state: completeness.state,
        missingFields: [...(completeness.missingFields ?? [])],
      },
      canonicalScreening,
      evidence: {
        handoffId: handoff.handoffId,
        artifact: handoff.artifact,
        provenance: handoff.provenance,
        execution: handoff.execution,
        validation: handoff.validation,
        correlationId: handoff.correlationId,
        referenceMetadata: handoff.referenceMetadata,
      },
    };
  }

  private stagingKey(handoff: UniversalImportHandoff): string {
    return `SCHOLARSHIP|${handoff.execution.idempotencyKey}`;
  }

  private stageState(state: ScholarshipCompletenessState): ScholarshipImportStagingState {
    if (state === ScholarshipCompletenessState.COMPLETE) return 'STAGED_COMPLETE';
    if (state === ScholarshipCompletenessState.NEEDS_REVIEW) return 'STAGED_NEEDS_REVIEW';
    return 'STAGED_INCOMPLETE';
  }
}
