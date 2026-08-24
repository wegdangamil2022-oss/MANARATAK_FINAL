import { AIExecutionOrchestrator } from '@manaratak/application';
import {
  AIExecutionStatus,
  IEnterpriseAIConsumerGateway,
  IScholarshipRecommendationGateway,
  IStudentToolRateLimitGateway,
  IUniversityComparisonGateway,
  IScholarshipRepository,
  IUniversityRepository,
  ScholarshipCandidate,
  UniversityComparisonItem,
} from '@manaratak/domain';
import { IRateLimiter } from '@manaratak/core';

export class Phase17StudentToolsAIConsumerGateway implements IEnterpriseAIConsumerGateway {
  constructor(private readonly orchestrator: AIExecutionOrchestrator) {}
  async executeCapability<TResult>(
    request: Parameters<IEnterpriseAIConsumerGateway['executeCapability']>[0],
  ) {
    try {
      const response = await this.orchestrator.executeCapability({
        consumerKey: request.consumerKey,
        capabilityKey: request.capabilityKey,
        input: JSON.stringify(request.payload),
        locale: request.locale,
        sourceDomain: 'Phase18StudentTools',
        metadata: {
          correlationId: request.correlationId,
          dataClassification: request.dataClassification,
        },
        idempotencyKey: request.idempotencyKey,
        structuredOutputSchema: request.outputSchema,
      });
      let result: TResult | undefined;
      if (response.result) {
        try {
          result = JSON.parse(response.result) as TResult;
        } catch {
          return {
            status: 'FAILED' as const,
            executionReference: response.executionPublicId,
            errorCode: 'AI_STRUCTURED_OUTPUT_INVALID',
          };
        }
      }
      return {
        status:
          response.status === AIExecutionStatus.COMPLETED
            ? ('COMPLETED' as const)
            : response.status === AIExecutionStatus.BLOCKED
              ? ('BLOCKED' as const)
              : ('FAILED' as const),
        result,
        executionReference: response.executionPublicId,
        safetyStatus: response.status === AIExecutionStatus.BLOCKED ? 'BLOCKED' : 'ALLOWED',
        errorCode: response.errorCode ?? undefined,
      };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'AI_CAPABILITY_UNAVAILABLE';
      return {
        status:
          code.includes('NOT_CONFIGURED') || code.includes('NOT_DEPLOYED')
            ? ('NOT_CONFIGURED' as const)
            : ('FAILED' as const),
        errorCode: code,
      };
    }
  }
}

export class CanonicalUniversityComparisonGateway implements IUniversityComparisonGateway {
  constructor(private readonly repository: IUniversityRepository) {}
  async getUniversitiesByPublicIds(publicIds: string[]) {
    const page = await this.repository.listPublished({ page: 1, pageSize: 100 });
    const selected = new Map(
      page.data
        .filter((item) => publicIds.includes(item.publicId))
        .map((item) => [item.publicId, item]),
    );
    const available: UniversityComparisonItem[] = publicIds.flatMap((id) => {
      const item = selected.get(id);
      return item
        ? [
            {
              publicId: item.publicId,
              slug: item.slug,
              displayName: item.displayName,
              country: item.country,
              city: item.city,
              institutionType: item.institutionType,
              institutionalOwnership: item.institutionalOwnership,
              officialWebsite: item.officialWebsite,
              languagesOfInstruction: item.languagesOfInstruction,
              academicProgramCount: item.academicPrograms?.length ?? 0,
              updatedAt: item.updatedAt,
            },
          ]
        : [];
    });
    return { available, unavailableIds: publicIds.filter((id) => !selected.has(id)) };
  }
}

export class CanonicalScholarshipRecommendationGateway implements IScholarshipRecommendationGateway {
  constructor(private readonly repository: IScholarshipRepository) {}
  async findPublishedCandidates(filters: {
    countries: string[];
    targetDegree?: string;
    fundingPreference?: string;
    studyLanguage?: string;
  }) {
    const pages = filters.countries.length
      ? await Promise.all(
          filters.countries.map((country) =>
            this.repository.listPublished({ country, page: 1, pageSize: 50 }),
          ),
        )
      : [await this.repository.listPublished({ page: 1, pageSize: 100 })];
    const unique = new Map<string, ScholarshipCandidate>();
    for (const item of pages.flatMap((page) => page.data)) {
      if (
        filters.targetDegree &&
        !(item.degreeTargets ?? []).some((target) =>
          String(target.sourceLabel ?? target.degreeLevelId ?? '')
            .toLowerCase()
            .includes(filters.targetDegree!.toLowerCase()),
        )
      )
        continue;
      if (filters.fundingPreference === 'FULL' && !item.isFullyFunded) continue;
      if (
        filters.studyLanguage &&
        item.studyLanguageSourceLabel &&
        !item.studyLanguageSourceLabel.toLowerCase().includes(filters.studyLanguage.toLowerCase())
      )
        continue;
      unique.set(item.publicId, {
        publicId: item.publicId,
        slug: item.slug,
        displayName: item.displayName,
        country: item.countryScope ?? item.countrySourceLabel,
        degreeLevels: (item.degreeTargets ?? [])
          .map((target) => String(target.sourceLabel ?? target.degreeLevelId ?? ''))
          .filter(Boolean),
        fundingType: item.fundingTypeCode,
        isFullyFunded: item.isFullyFunded,
        deadline: item.applicationDeadline,
        canonicalUrl: item.officialWebsite ?? item.applicationUrl,
        publicationStatus: String(item.publicationStatus),
      });
    }
    return [...unique.values()];
  }
}

export class StudentToolRateLimitGateway implements IStudentToolRateLimitGateway {
  constructor(private readonly limiter: IRateLimiter) {}
  async consume(key: string, limit: number, windowMs: number) {
    const value = await this.limiter.consume(key, limit, windowMs);
    return { allowed: value.allowed, remaining: value.remaining, resetAt: value.resetTime };
  }
}
