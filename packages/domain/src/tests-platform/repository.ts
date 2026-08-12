import { 
  InternationalTestDto, 
  UpsertInternationalTestDto,
  InternationalTestFilters,
  PaginatedInternationalTestResult,
  InternationalTestVariantDto,
  UpsertInternationalTestVariantDto,
  InternationalTestSectionDto,
  UpsertInternationalTestSectionDto,
  InternationalTestScoreScaleDto,
  UpsertInternationalTestScoreScaleDto,
  InternationalTestFeeMetadataDto,
  UpsertInternationalTestFeeMetadataDto,
  InternationalTestOfficialLinkDto,
  UpsertInternationalTestOfficialLinkDto,
  InternationalTestAvailabilityDto,
  UpsertInternationalTestAvailabilityDto,
  InternationalTestPreparationMaterialDto,
  UpsertInternationalTestPreparationMaterialDto,
  InternationalTestEvidenceDto,
  InternationalTestImportDraftRequestDto,
  InternationalTestImportDraftResultDto,
  InternationalTestVersionDto
} from './contracts';
import { InternationalTestStatus } from './enums';

export interface IInternationalTestRepository {
  // Legacy / current application compatibility methods
  findById(id: string): Promise<InternationalTestDto | null>;
  findBySlug(slug: string): Promise<InternationalTestDto | null>;
  findByDedupKey(dedupKey: string): Promise<InternationalTestDto | null>;
  create(data: UpsertInternationalTestDto): Promise<InternationalTestDto>;
  update(id: string, data: Partial<UpsertInternationalTestDto>): Promise<InternationalTestDto>;
  updateStatus(id: string, status: InternationalTestStatus): Promise<InternationalTestDto>;
  list(filters: InternationalTestFilters): Promise<PaginatedInternationalTestResult<InternationalTestDto>>;
  listPublished(filters?: Omit<InternationalTestFilters, 'status'>): Promise<PaginatedInternationalTestResult<InternationalTestDto>>;
  
  // Forward-looking Phase 09 profile methods
  listTests?(filters: InternationalTestFilters): Promise<PaginatedInternationalTestResult<InternationalTestDto>>;
  getTest?(id: string): Promise<InternationalTestDto | null>;
  getTestBySlug?(slug: string): Promise<InternationalTestDto | null>;
  getTestByDeterministicKey?(key: string): Promise<InternationalTestDto | null>;
  upsertTest?(data: UpsertInternationalTestDto): Promise<InternationalTestDto>;
  
  listVariants?(testId: string): Promise<InternationalTestVariantDto[]>;
  upsertVariant?(testId: string, data: UpsertInternationalTestVariantDto): Promise<InternationalTestVariantDto>;
  
  listSections?(testId: string): Promise<InternationalTestSectionDto[]>;
  upsertSection?(testId: string, data: UpsertInternationalTestSectionDto): Promise<InternationalTestSectionDto>;
  
  upsertScoreScale?(testId: string, data: UpsertInternationalTestScoreScaleDto): Promise<InternationalTestScoreScaleDto>;
  
  upsertFeeMetadata?(testId: string, data: UpsertInternationalTestFeeMetadataDto): Promise<InternationalTestFeeMetadataDto>;
  
  upsertOfficialLink?(testId: string, data: UpsertInternationalTestOfficialLinkDto): Promise<InternationalTestOfficialLinkDto>;
  
  listAvailability?(testId: string): Promise<InternationalTestAvailabilityDto | null>;
  upsertAvailability?(testId: string, data: UpsertInternationalTestAvailabilityDto): Promise<InternationalTestAvailabilityDto>;
  
  listPreparationMaterials?(testId: string): Promise<InternationalTestPreparationMaterialDto[]>;
  upsertPreparationMaterial?(testId: string, data: UpsertInternationalTestPreparationMaterialDto): Promise<InternationalTestPreparationMaterialDto>;
  
  listEvidence?(testId: string): Promise<InternationalTestEvidenceDto[]>;
  addEvidence?(testId: string, data: InternationalTestEvidenceDto): Promise<InternationalTestEvidenceDto>;

  createImportDraftVersion?(testId: string, data: InternationalTestImportDraftRequestDto): Promise<InternationalTestImportDraftResultDto>;
  listImportVersions?(testId: string): Promise<InternationalTestVersionDto[]>;
}
