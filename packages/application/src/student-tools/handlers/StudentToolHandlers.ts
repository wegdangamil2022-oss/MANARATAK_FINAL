import {
  GpaCalculatorInput,
  GpaCalculatorOutput,
  IEnterpriseAIConsumerGateway,
  IScholarshipRecommendationGateway,
  IStudentToolHandler,
  IUniversityComparisonGateway,
  MotivationLetterInput,
  MotivationLetterOutput,
  ScholarshipRecommendationInput,
  ScholarshipRecommendationOutput,
  StudentToolExecutionContext,
  StudentToolExecutionType,
  UniversityComparisonInput,
  UniversityComparisonOutput,
} from '@manaratak/domain';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('TOOL_INPUT_INVALID');
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string, min = 1, max = 4000) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max)
    throw new Error(`TOOL_INPUT_INVALID:${field}`);
  return value.trim();
}
function strings(value: unknown, field: string, max = 20) {
  if (!Array.isArray(value) || value.length > max || value.some((item) => typeof item !== 'string'))
    throw new Error(`TOOL_INPUT_INVALID:${field}`);
  return [...new Set(value.map((item) => (item as string).trim()).filter(Boolean))];
}

export class GpaCalculatorHandler implements IStudentToolHandler<
  GpaCalculatorInput,
  GpaCalculatorOutput
> {
  readonly toolKey = 'gpa-calculator';
  readonly executionType = StudentToolExecutionType.DETERMINISTIC;
  validate(value: unknown): GpaCalculatorInput {
    const input = object(value);
    const scale = Number(input.scale);
    if (!Number.isFinite(scale) || scale < 1 || scale > 10)
      throw new Error('TOOL_INPUT_INVALID:scale');
    if (!Array.isArray(input.courses) || input.courses.length < 1 || input.courses.length > 50)
      throw new Error('TOOL_INPUT_INVALID:courses');
    const courses = input.courses.map((raw: unknown, index: number) => {
      const course = object(raw);
      const creditHours = Number(course.creditHours);
      const gradePoints = Number(course.gradePoints);
      if (!Number.isFinite(creditHours) || creditHours <= 0 || creditHours > 30)
        throw new Error(`TOOL_INPUT_INVALID:courses.${index}.creditHours`);
      if (!Number.isFinite(gradePoints) || gradePoints < 0 || gradePoints > scale)
        throw new Error(`TOOL_INPUT_INVALID:courses.${index}.gradePoints`);
      return {
        label: text(course.label, `courses.${index}.label`, 1, 120),
        creditHours,
        gradePoints,
      };
    });
    const existingCumulativeGpa =
      input.existingCumulativeGpa == null ? undefined : Number(input.existingCumulativeGpa);
    const existingCompletedCredits =
      input.existingCompletedCredits == null ? undefined : Number(input.existingCompletedCredits);
    if ((existingCumulativeGpa == null) !== (existingCompletedCredits == null))
      throw new Error('TOOL_INPUT_INVALID:cumulativePair');
    if (
      existingCumulativeGpa != null &&
      (!Number.isFinite(existingCumulativeGpa) ||
        existingCumulativeGpa < 0 ||
        existingCumulativeGpa > scale)
    )
      throw new Error('TOOL_INPUT_INVALID:existingCumulativeGpa');
    if (
      existingCompletedCredits != null &&
      (!Number.isFinite(existingCompletedCredits) ||
        existingCompletedCredits <= 0 ||
        existingCompletedCredits > 1000)
    )
      throw new Error('TOOL_INPUT_INVALID:existingCompletedCredits');
    return { scale, courses, existingCumulativeGpa, existingCompletedCredits };
  }
  async execute(
    _context: StudentToolExecutionContext,
    input: GpaCalculatorInput,
  ): Promise<GpaCalculatorOutput> {
    const courses = input.courses.map((course) => ({
      ...course,
      qualityPoints: course.creditHours * course.gradePoints,
    }));
    const totalSemesterCredits = courses.reduce((sum, course) => sum + course.creditHours, 0);
    const qualityPoints = courses.reduce((sum, course) => sum + course.qualityPoints, 0);
    const round = (n: number) => Number(n.toFixed(4));
    const output: GpaCalculatorOutput = {
      semesterGpa: round(qualityPoints / totalSemesterCredits),
      totalSemesterCredits: round(totalSemesterCredits),
      qualityPoints: round(qualityPoints),
      scale: input.scale,
      courses: courses.map((course) => ({ ...course, qualityPoints: round(course.qualityPoints) })),
    };
    if (input.existingCumulativeGpa != null && input.existingCompletedCredits != null) {
      output.projectedTotalCredits = round(input.existingCompletedCredits + totalSemesterCredits);
      output.projectedCumulativeGpa = round(
        (input.existingCumulativeGpa * input.existingCompletedCredits + qualityPoints) /
          output.projectedTotalCredits,
      );
    }
    return output;
  }
}

export class UniversityComparisonHandler implements IStudentToolHandler<
  UniversityComparisonInput,
  UniversityComparisonOutput
> {
  readonly toolKey = 'university-comparison';
  readonly executionType = StudentToolExecutionType.DETERMINISTIC;
  constructor(private readonly universities: IUniversityComparisonGateway) {}
  validate(value: unknown): UniversityComparisonInput {
    const input = object(value);
    const universityIds = strings(input.universityIds, 'universityIds', 4);
    if (universityIds.length < 2 || universityIds.length > 4)
      throw new Error('TOOL_INPUT_INVALID:universityIds');
    return { universityIds, hideUnavailableRows: input.hideUnavailableRows === true };
  }
  async execute(_context: StudentToolExecutionContext, input: UniversityComparisonInput) {
    const result = await this.universities.getUniversitiesByPublicIds(input.universityIds);
    return {
      universities: result.available,
      unavailableUniversityIds: result.unavailableIds,
      comparedCanonicalIds: result.available.map((item) => item.publicId),
    };
  }
}

export class MotivationLetterGeneratorHandler implements IStudentToolHandler<
  MotivationLetterInput,
  MotivationLetterOutput
> {
  readonly toolKey = 'motivation-letter-generator';
  readonly executionType = StudentToolExecutionType.AI_DELEGATED;
  constructor(private readonly ai: IEnterpriseAIConsumerGateway) {}
  validate(value: unknown): MotivationLetterInput {
    const input = object(value);
    const target = object(input.target);
    const background = object(input.studentBackground);
    const motivation = object(input.motivation);
    const preferences = object(input.outputPreferences);
    const language =
      preferences.language === 'en' ? 'en' : preferences.language === 'ar' ? 'ar' : null;
    const targetWords = Number(preferences.targetWords);
    if (
      !language ||
      !Number.isInteger(targetWords) ||
      targetWords < 250 ||
      targetWords > 1200 ||
      preferences.tone !== 'FORMAL'
    )
      throw new Error('TOOL_INPUT_INVALID:outputPreferences');
    return {
      target: {
        universityId: typeof target.universityId === 'string' ? target.universityId : undefined,
        program: text(target.program, 'target.program', 2, 200),
        degreeLevel: text(target.degreeLevel, 'target.degreeLevel', 2, 100),
        country: typeof target.country === 'string' ? target.country.trim() : undefined,
        applicationType: text(target.applicationType, 'target.applicationType', 2, 100),
      },
      studentBackground: {
        education: text(background.education, 'studentBackground.education', 10),
        academicInterests: strings(background.academicInterests, 'academicInterests'),
        experiences: strings(background.experiences, 'experiences'),
        achievements: strings(background.achievements, 'achievements'),
        skills: strings(background.skills, 'skills'),
      },
      motivation: {
        whyField: text(motivation.whyField, 'motivation.whyField', 10),
        whyProgram: text(motivation.whyProgram, 'motivation.whyProgram', 10),
        careerGoals: text(motivation.careerGoals, 'motivation.careerGoals', 10),
        contribution: text(motivation.contribution, 'motivation.contribution', 5),
        emphasizedExperiences: strings(motivation.emphasizedExperiences, 'emphasizedExperiences'),
      },
      outputPreferences: {
        language,
        targetWords,
        tone: 'FORMAL',
        specialInstructions:
          typeof preferences.specialInstructions === 'string'
            ? preferences.specialInstructions.slice(0, 1000)
            : undefined,
      },
    };
  }
  async execute(
    context: StudentToolExecutionContext,
    input: MotivationLetterInput,
  ): Promise<MotivationLetterOutput> {
    const response = await this.ai.executeCapability<
      MotivationLetterInput,
      Omit<MotivationLetterOutput, 'aiExecutionId' | 'safetyStatus'>
    >({
      consumerKey: 'phase18-student-tools',
      capabilityKey: 'student-tools.motivation-letter.generate',
      correlationId: context.correlationId,
      locale: context.locale,
      dataClassification: 'PRIVATE_STUDENT_DATA',
      payload: input,
      idempotencyKey: context.executionId,
      outputSchema: {
        type: 'object',
        required: ['draft', 'warnings'],
        properties: { draft: { type: 'string' }, warnings: { type: 'array' } },
      },
    });
    if (response.status !== 'COMPLETED' || !response.result || !response.executionReference)
      throw new Error(
        response.status === 'NOT_CONFIGURED'
          ? 'TOOL_AI_CAPABILITY_UNAVAILABLE'
          : (response.errorCode ?? 'TOOL_EXECUTION_FAILED'),
      );
    return {
      ...response.result,
      aiExecutionId: response.executionReference,
      safetyStatus: response.safetyStatus ?? 'ALLOWED',
    };
  }
}

export class ScholarshipRecommendationHandler implements IStudentToolHandler<
  ScholarshipRecommendationInput,
  ScholarshipRecommendationOutput
> {
  readonly toolKey = 'scholarship-recommendation';
  readonly executionType = StudentToolExecutionType.HYBRID;
  constructor(
    private readonly scholarships: IScholarshipRecommendationGateway,
    private readonly ai: IEnterpriseAIConsumerGateway,
  ) {}
  validate(value: unknown): ScholarshipRecommendationInput {
    const input = object(value);
    const fundingPreference =
      typeof input.fundingPreference === 'string' &&
      ['FULL', 'PARTIAL', 'ANY'].includes(input.fundingPreference)
        ? (input.fundingPreference as 'FULL' | 'PARTIAL' | 'ANY')
        : 'ANY';
    return {
      targetDegree: typeof input.targetDegree === 'string' ? input.targetDegree.trim() : undefined,
      studyField: typeof input.studyField === 'string' ? input.studyField.trim() : undefined,
      preferredCountries: strings(input.preferredCountries ?? [], 'preferredCountries', 10),
      fundingPreference,
      studyLanguage:
        typeof input.studyLanguage === 'string' ? input.studyLanguage.trim() : undefined,
      targetYear: input.targetYear == null ? undefined : Number(input.targetYear),
      academicInterests: strings(input.academicInterests ?? [], 'academicInterests'),
      careerGoals:
        typeof input.careerGoals === 'string' ? input.careerGoals.slice(0, 1000) : undefined,
    };
  }
  async execute(
    context: StudentToolExecutionContext,
    input: ScholarshipRecommendationInput,
  ): Promise<ScholarshipRecommendationOutput> {
    const candidates = (
      await this.scholarships.findPublishedCandidates({
        countries: input.preferredCountries,
        targetDegree: input.targetDegree,
        fundingPreference: input.fundingPreference,
        studyLanguage: input.studyLanguage,
      })
    ).slice(0, 25);
    const fallback = candidates.map((scholarship) => ({
      scholarship,
      constraintSummary: [
        input.targetDegree ? `degree:${input.targetDegree}` : 'degree:any',
        input.fundingPreference ? `funding:${input.fundingPreference}` : 'funding:any',
      ],
    }));
    if (!candidates.length)
      return {
        mode: 'DETERMINISTIC_FALLBACK',
        recommendations: [],
        disclaimer: 'النتائج إرشادية وتعتمد فقط على المنح المنشورة حاليًا.',
      };
    const response = await this.ai.executeCapability<
      {
        preferences: ScholarshipRecommendationInput;
        candidates: Array<{ publicId: string; displayName: string }>;
      },
      { rankings: Array<{ publicId: string; explanation: string }> }
    >({
      consumerKey: 'phase18-student-tools',
      capabilityKey: 'student-tools.scholarship-recommendation.rank',
      correlationId: context.correlationId,
      locale: context.locale,
      dataClassification: 'CANONICAL_PUBLIC_DATA',
      payload: {
        preferences: input,
        candidates: candidates.map(({ publicId, displayName }) => ({ publicId, displayName })),
      },
      idempotencyKey: context.executionId,
      outputSchema: {
        type: 'object',
        required: ['rankings'],
        properties: { rankings: { type: 'array' } },
      },
    });
    if (response.status !== 'COMPLETED' || !response.result)
      return {
        mode: 'DETERMINISTIC_FALLBACK',
        recommendations: fallback,
        disclaimer:
          'الترتيب احتياطي ويعتمد على المطابقة المباشرة لأن خدمة التحليل الذكي غير مهيأة.',
      };
    const byId = new Map(candidates.map((item) => [item.publicId, item]));
    const recommendations = response.result.rankings
      .filter((item) => byId.has(item.publicId))
      .map((item) => ({
        scholarship: byId.get(item.publicId)!,
        explanation: item.explanation,
        constraintSummary:
          fallback.find((entry) => entry.scholarship.publicId === item.publicId)
            ?.constraintSummary ?? [],
      }));
    return {
      mode: 'AI_ADVISORY',
      recommendations,
      disclaimer: 'هذه توصيات إرشادية وليست قرار قبول أو ضمان تمويل.',
      aiExecutionId: response.executionReference,
    };
  }
}
