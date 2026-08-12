import {
  IStudentToolRegistryRepository,
  PublicStudentToolDto,
  StudentToolAiDependencyLevel,
  StudentToolExecutionType,
  StudentToolFilters,
  StudentToolImplementationPriority,
  StudentToolRegistryEntryDto,
  StudentToolVisibilityStatus,
  UpsertStudentToolRegistryEntryDto
} from '@manaratak/domain';

export class StudentToolRegistryUseCases {
  constructor(private readonly repository: IStudentToolRegistryRepository) {}

  public async seedOfficialTools(): Promise<StudentToolRegistryEntryDto[]> {
    const seeded: StudentToolRegistryEntryDto[] = [];
    for (const tool of OFFICIAL_STUDENT_TOOLS) {
      seeded.push(await this.repository.upsertTool(tool));
    }
    return seeded;
  }

  public async upsertTool(data: UpsertStudentToolRegistryEntryDto): Promise<StudentToolRegistryEntryDto> {
    if (!data.toolKey.trim()) {
      throw new Error('toolKey is required');
    }
    if (data.aiDependencyLevel !== StudentToolAiDependencyLevel.NONE && data.executionType !== StudentToolExecutionType.AI_ASSISTED) {
      throw new Error('AI-dependent tools must use AI_ASSISTED execution type');
    }
    return this.repository.upsertTool(data);
  }

  public async listAdminTools(filters: StudentToolFilters): Promise<StudentToolRegistryEntryDto[]> {
    return this.repository.listTools(filters);
  }

  public async listPublicTools(filters: StudentToolFilters): Promise<PublicStudentToolDto[]> {
    return this.repository.listPublicTools(filters);
  }

  public async updateVisibility(toolKey: string, visibilityStatus: StudentToolVisibilityStatus): Promise<StudentToolRegistryEntryDto> {
    return this.repository.updateVisibility(toolKey, visibilityStatus);
  }
}

export const OFFICIAL_STUDENT_TOOLS: UpsertStudentToolRegistryEntryDto[] = [
  {
    toolKey: 'scholarship-matcher',
    displayName: 'Scholarship Matcher',
    description: 'Helps students discover scholarships that may match their goals.',
    category: 'Scholarships',
    executionType: StudentToolExecutionType.AI_ASSISTED,
    visibilityStatus: StudentToolVisibilityStatus.COMING_SOON,
    implementationPriority: StudentToolImplementationPriority.P1_CORE_LAUNCH,
    aiDependencyLevel: StudentToolAiDependencyLevel.REQUIRED_LOW_COST,
    publicEnabled: true,
    anonymousEnabled: false,
    authenticatedEnabled: true,
    launchOrder: 10
  },
  {
    toolKey: 'major-fit-helper',
    displayName: 'Major Fit Helper',
    description: 'Guides students toward fields and majors based on interests and goals.',
    category: 'Majors',
    executionType: StudentToolExecutionType.AI_ASSISTED,
    visibilityStatus: StudentToolVisibilityStatus.COMING_SOON,
    implementationPriority: StudentToolImplementationPriority.P1_CORE_LAUNCH,
    aiDependencyLevel: StudentToolAiDependencyLevel.REQUIRED_LOW_COST,
    publicEnabled: true,
    anonymousEnabled: true,
    authenticatedEnabled: true,
    launchOrder: 20
  },
  {
    toolKey: 'statement-letter-builder',
    displayName: 'Statement & Letter Builder',
    description: 'Drafts structured motivation letters and study statements for student review.',
    category: 'Documents',
    executionType: StudentToolExecutionType.AI_ASSISTED,
    visibilityStatus: StudentToolVisibilityStatus.UNDER_DEVELOPMENT,
    implementationPriority: StudentToolImplementationPriority.P2_EXPANSION,
    aiDependencyLevel: StudentToolAiDependencyLevel.REQUIRED_HIGH_COST,
    publicEnabled: true,
    anonymousEnabled: false,
    authenticatedEnabled: true,
    launchOrder: 30
  },
  {
    toolKey: 'cost-estimator',
    displayName: 'Study Cost Estimator',
    description: 'Estimates study costs using approved finance and reference data.',
    category: 'Planning',
    executionType: StudentToolExecutionType.DETERMINISTIC_CALCULATOR,
    visibilityStatus: StudentToolVisibilityStatus.COMING_SOON,
    implementationPriority: StudentToolImplementationPriority.P2_EXPANSION,
    aiDependencyLevel: StudentToolAiDependencyLevel.NONE,
    publicEnabled: true,
    anonymousEnabled: true,
    authenticatedEnabled: true,
    launchOrder: 40
  },
  {
    toolKey: 'document-checklist',
    displayName: 'Application Document Checklist',
    description: 'Creates a simple checklist of documents for selected opportunities.',
    category: 'Documents',
    executionType: StudentToolExecutionType.STATIC_FORM,
    visibilityStatus: StudentToolVisibilityStatus.ACTIVE,
    implementationPriority: StudentToolImplementationPriority.P1_CORE_LAUNCH,
    aiDependencyLevel: StudentToolAiDependencyLevel.NONE,
    publicEnabled: true,
    anonymousEnabled: true,
    authenticatedEnabled: true,
    launchOrder: 5
  }
];
