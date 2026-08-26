import { AIExecutionOrchestrator } from '@manaratak/application';
import {
  AIExecutionStatus,
  IEnterpriseAIConsumerGateway,
  IScholarshipRecommendationGateway,
  IStudentToolRateLimitGateway,
  IStudentToolSaveGateway,
  IStudentWorkspaceRepository,
  IStudentToolDependencyHealthGateway,
  IUniversityComparisonGateway,
  IScholarshipRepository,
  IUniversityRepository,
  ScholarshipCandidate,
  StudentToolDependency,
  StudentSavedItemType,
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
        dataClassification:
          request.dataClassification === 'PRIVATE_STUDENT_DATA'
            ? 'STUDENT_PRIVATE'
            : 'PUBLIC',
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

export class Phase15StudentToolSaveGateway implements IStudentToolSaveGateway {
  constructor(private readonly repository: IStudentWorkspaceRepository) {}
  async savePrivateResult(input: Parameters<IStudentToolSaveGateway['savePrivateResult']>[0]) {
    const saved = await this.repository.saveItem({
      studentReferenceId: input.studentReference,
      entityType: StudentSavedItemType.STUDENT_TOOL,
      entityId: input.executionId,
      entitySlug: input.toolKey,
      metadata: { sourceDomain: 'PHASE_18', resultReference: input.resultReference, privateResult: input.result },
    });
    return { savedReference: saved.id };
  }
}

export class CanonicalUniversityComparisonGateway implements IUniversityComparisonGateway {
  constructor(private readonly repository: IUniversityRepository) {}
  async getUniversitiesByPublicIds(publicIds: string[]) {
    const canonical = this.repository.findPublishedByPublicIds
      ? await this.repository.findPublishedByPublicIds(publicIds)
      : await this.findAcrossPublishedPages(publicIds);
    const selected = new Map(
      canonical
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
  private async findAcrossPublishedPages(publicIds: string[]) {
    const found = new Map<string, Awaited<ReturnType<IUniversityRepository['listPublished']>>['data'][number]>();
    let pageNumber = 1;
    let totalPages = 1;
    do {
      const page = await this.repository.listPublished({ page: pageNumber, pageSize: 100 });
      for (const item of page.data)
        if (publicIds.includes(item.publicId)) found.set(item.publicId, item);
      totalPages = page.totalPages;
      pageNumber += 1;
    } while (pageNumber <= totalPages && found.size < publicIds.length);
    return [...found.values()];
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
      ? await Promise.all(filters.countries.map((country) => this.listAllPublished({ studyCountry: country })))
      : [await this.listAllPublished({})];
    const unique = new Map<string, ScholarshipCandidate>();
    for (const item of pages.flat()) {
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

  private async listAllPublished(filters: { studyCountry?: string }) {
    const data: Awaited<ReturnType<IScholarshipRepository['listPublished']>>['data'] = [];
    let page = 1;
    let totalPages = 1;
    do {
      if (page > 500) throw new Error('SCHOLARSHIP_RECOMMENDATION_CANDIDATE_SCAN_LIMIT_EXCEEDED');
      const result = await this.repository.listPublished({ ...filters, page, pageSize: 100 });
      data.push(...result.data);
      totalPages = result.totalPages;
      page += 1;
    } while (page <= totalPages);
    return data;
  }
}

export class StudentToolRateLimitGateway implements IStudentToolRateLimitGateway {
  constructor(private readonly limiter: IRateLimiter) {}
  async consume(key: string, limit: number, windowMs: number) {
    const value = await this.limiter.consume(key, limit, windowMs);
    return { allowed: value.allowed, remaining: value.remaining, resetAt: value.resetTime };
  }
}

export class EnterpriseStudentToolDependencyHealthGateway
  implements IStudentToolDependencyHealthGateway
{
  constructor(
    private readonly aiExecution: AIExecutionOrchestrator,
    private readonly universities: IUniversityRepository,
    private readonly scholarships: IScholarshipRepository,
  ) {}

  async status(
    dependency: StudentToolDependency,
  ): Promise<'READY' | 'DEGRADED' | 'NOT_CONFIGURED' | 'UNAVAILABLE'> {
    try {
      if (dependency.phase === 'PHASE_11') {
        const page = await this.universities.listPublished({ page: 1, pageSize: 1 });
        return page.total > 0 ? 'READY' : 'NOT_CONFIGURED';
      }
      if (dependency.phase === 'PHASE_12') {
        const page = await this.scholarships.listPublished({ page: 1, pageSize: 1 });
        return page.total > 0 ? 'READY' : 'NOT_CONFIGURED';
      }
      if (dependency.phase === 'PHASE_17' && dependency.capabilityKey) {
        const dataClassification = dependency.capabilityKey.includes('motivation-letter')
          ? 'STUDENT_PRIVATE'
          : 'PUBLIC';
        const readiness = await this.aiExecution.capabilityReadiness({
          consumerKey: 'phase18-student-tools',
          capabilityKey: dependency.capabilityKey,
          dataClassification,
        });
        return readiness.ready ? 'READY' : 'NOT_CONFIGURED';
      }
      return 'NOT_CONFIGURED';
    } catch {
      return 'UNAVAILABLE';
    }
  }
}
