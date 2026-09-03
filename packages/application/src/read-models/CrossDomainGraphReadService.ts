import {
  ICourseRelationshipRepository,
  IMajorRepository,
  IReferenceDataRepository,
  IScholarshipRepository,
  IUniversityRepository,
  MajorDto,
  MajorStatus,
  PublicCourseFilters,
  ScholarshipDto,
  UniversityAcademicProgramReadDto,
  UniversityDto,
  UniversityStatus,
} from '@manaratak/domain';

type MajorGraphReadRepository = IMajorRepository & Required<Pick<IMajorRepository, 'findPublishedByIds'>>;
type UniversityGraphReadRepository = IUniversityRepository & Required<
  Pick<IUniversityRepository, 'findPublishedByIds' | 'findPublishedAcademicProgramsByIds'>
>;

export interface StableEntityReadIdentity {
  ownerId: string;
  publicId?: string;
  slug?: string;
  canonicalCode?: string;
  displayName: string;
}

export interface AcademicProgramGraphIdentity {
  ownerId: string;
  universityOwnerId: string;
  universityPublicId: string;
  universitySlug: string;
  universityDisplayName: string;
  sourceProgramName: string;
  degreeLevelId?: string | null;
  majorOwnerId?: string | null;
  majorMappingState: string;
  status: string;
}

export interface PaginatedGraphCollection<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MajorUniversityGraphItem extends StableEntityReadIdentity {
  matchingPrograms: Array<{
    ownerId: string;
    sourceProgramName: string;
    degreeLevelId?: string | null;
    majorOwnerId: string;
  }>;
}

export interface MajorGraphReadModel {
  subject: StableEntityReadIdentity;
  relationships: {
    universities: PaginatedGraphCollection<MajorUniversityGraphItem>;
    scholarships: PaginatedGraphCollection<StableEntityReadIdentity>;
    courses: PaginatedGraphCollection<StableEntityReadIdentity & {
      directCourseUrl: string;
      providerName?: string | null;
      category?: string | null;
    }>;
  };
}

export interface UniversityGraphReadModel {
  subject: StableEntityReadIdentity;
  countryOwnerId?: string | null;
  relationships: {
    majors: StableEntityReadIdentity[];
    academicPrograms: Array<{
      ownerId: string;
      sourceProgramName: string;
      degreeLevelId?: string | null;
      majorOwnerId: string;
    }>;
    scholarships: PaginatedGraphCollection<StableEntityReadIdentity>;
  };
}

export interface ScholarshipGraphReadModel {
  subject: StableEntityReadIdentity;
  countryOwnerId?: string | null;
  relationships: {
    universities: StableEntityReadIdentity[];
    academicPrograms: AcademicProgramGraphIdentity[];
    majors: StableEntityReadIdentity[];
  };
}

export interface CountryGraphReadModel {
  subject: StableEntityReadIdentity & { canonicalCode: string };
  relationships: {
    universities: PaginatedGraphCollection<StableEntityReadIdentity>;
    scholarships: PaginatedGraphCollection<StableEntityReadIdentity>;
    providerHeadquartersCourses: PaginatedGraphCollection<StableEntityReadIdentity & {
      directCourseUrl: string;
      providerName?: string | null;
      category?: string | null;
    }>;
  };
}

export interface CrossDomainGraphReadOptions {
  page?: number;
  pageSize?: number;
  courseFilters?: PublicCourseFilters;
}

/**
 * P4 composition-only read service.
 *
 * It does not persist cross-domain collections and it never resolves relationships by display name.
 * Every collection is queried from its owning domain repository using canonical owner IDs.
 */
export class CrossDomainGraphReadService {
  public constructor(
    private readonly majorRepository: MajorGraphReadRepository,
    private readonly universityRepository: UniversityGraphReadRepository,
    private readonly scholarshipRepository: IScholarshipRepository,
    private readonly courseRelationshipRepository: ICourseRelationshipRepository,
    private readonly referenceDataRepository: IReferenceDataRepository,
  ) {}

  public async getMajorGraphBySlug(slug: string, options: CrossDomainGraphReadOptions = {}): Promise<MajorGraphReadModel> {
    const major = await this.majorRepository.findBySlug(this.required(slug, 'MAJOR_SLUG_REQUIRED'));
    if (!major || major.status !== MajorStatus.PUBLISHED) throw new Error('Major not found');

    const { page, pageSize } = this.pagination(options);
    const [universities, scholarships, courses] = await Promise.all([
      this.universityRepository.listPublished({ majorId: major.id, page, pageSize }),
      this.scholarshipRepository.listPublished({ majorId: major.id, page, pageSize }),
      this.courseRelationshipRepository.listPublishedCoursesForMajor(major.id, {
        ...options.courseFilters,
        page,
        pageSize,
      }),
    ]);

    return {
      subject: this.majorIdentity(major),
      relationships: {
        universities: {
          ...universities,
          data: universities.data.map((university) => this.majorUniversityIdentity(university, major.id)),
        },
        scholarships: {
          ...scholarships,
          data: scholarships.data.map((scholarship) => this.scholarshipIdentity(scholarship)),
        },
        courses: {
          ...courses,
          data: courses.data.map((course) => ({
            ownerId: course.ownerId,
            publicId: course.publicId,
            slug: course.slug,
            displayName: course.displayName,
            directCourseUrl: course.directCourseUrl,
            providerName: course.providerName,
            category: course.category,
          })),
        },
      },
    };
  }

  public async getUniversityGraphBySlug(slug: string, options: CrossDomainGraphReadOptions = {}): Promise<UniversityGraphReadModel> {
    const university = await this.universityRepository.findBySlug(this.required(slug, 'UNIVERSITY_SLUG_REQUIRED'));
    if (!university || university.status !== UniversityStatus.PUBLISHED) throw new Error('University not found');

    const canonicalPrograms = (university.academicPrograms ?? []).filter(
      (program): program is UniversityAcademicProgramReadDto & { majorId: string; degreeLevelId: string } =>
        Boolean(program.majorId) &&
        Boolean(program.degreeLevelId) &&
        program.majorMappingState === 'CANONICALLY_MAPPED',
    );
    const majorIds = [...new Set(canonicalPrograms.map((program) => program.majorId))];
    const { page, pageSize } = this.pagination(options);
    const [majors, scholarships] = await Promise.all([
      this.majorRepository.findPublishedByIds(majorIds),
      this.scholarshipRepository.listPublished({ universityId: university.id, page, pageSize }),
    ]);
    const publishedMajorIds = new Set(majors.map((major) => major.id));
    const publishedCanonicalPrograms = canonicalPrograms.filter((program) => publishedMajorIds.has(program.majorId));

    return {
      subject: this.universityIdentity(university),
      countryOwnerId: university.countryReferenceId,
      relationships: {
        majors: majors.map((major) => this.majorIdentity(major)),
        academicPrograms: publishedCanonicalPrograms.map((program) => ({
          ownerId: program.id,
          sourceProgramName: program.sourceProgramName,
          degreeLevelId: program.degreeLevelId,
          majorOwnerId: program.majorId,
        })),
        scholarships: {
          ...scholarships,
          data: scholarships.data.map((scholarship) => this.scholarshipIdentity(scholarship)),
        },
      },
    };
  }

  public async getScholarshipGraphBySlug(slug: string): Promise<ScholarshipGraphReadModel> {
    const scholarship = await this.scholarshipRepository.findPublishedBySlug(this.required(slug, 'SCHOLARSHIP_SLUG_REQUIRED'));
    if (!scholarship) throw new Error('Scholarship not found');

    const universityIds = [...new Set(
      (scholarship.universityLinks ?? [])
        .map((link) => link.universityId)
        .filter((id): id is string => Boolean(id)),
    )];
    const academicProgramIds = [...new Set(
      (scholarship.universityLinks ?? [])
        .map((link) => link.academicProgramId)
        .filter((id): id is string => Boolean(id)),
    )];
    const directMajorIds = [...new Set([
      ...(scholarship.majorTargets ?? []).map((target) => target.majorId),
      ...(scholarship.eligibilityItems ?? []).map((item) => item.majorId),
    ].filter((id): id is string => Boolean(id)))];

    const [universities, programs] = await Promise.all([
      this.universityRepository.findPublishedByIds(universityIds),
      this.universityRepository.findPublishedAcademicProgramsByIds(academicProgramIds),
    ]);
    const programMajorIds = programs.map((program) => program.majorId).filter((id): id is string => Boolean(id));
    const majors = await this.majorRepository.findPublishedByIds([...new Set([...directMajorIds, ...programMajorIds])]);

    const programUniversityIdentities: StableEntityReadIdentity[] = programs.map((program) => ({
      ownerId: program.universityOwnerId,
      publicId: program.universityPublicId,
      slug: program.universitySlug,
      displayName: program.universityDisplayName,
    }));

    return {
      subject: this.scholarshipIdentity(scholarship),
      countryOwnerId: scholarship.countryReferenceId,
      relationships: {
        universities: this.uniqueIdentities([
          ...universities.map((university) => this.universityIdentity(university)),
          ...programUniversityIdentities,
        ]),
        academicPrograms: programs.map((program) => ({
          ownerId: program.ownerId,
          universityOwnerId: program.universityOwnerId,
          universityPublicId: program.universityPublicId,
          universitySlug: program.universitySlug,
          universityDisplayName: program.universityDisplayName,
          sourceProgramName: program.sourceProgramName,
          degreeLevelId: program.degreeLevelId,
          majorOwnerId: program.majorId,
          majorMappingState: program.majorMappingState,
          status: program.status,
        })),
        majors: majors.map((major) => this.majorIdentity(major)),
      },
    };
  }

  public async getCountryGraphByIso2Code(iso2Code: string, options: CrossDomainGraphReadOptions = {}): Promise<CountryGraphReadModel> {
    const normalizedCode = this.required(iso2Code, 'COUNTRY_CODE_REQUIRED').toUpperCase();
    const country = await this.referenceDataRepository.getCountry(normalizedCode);
    if (!country || !country.isActive) throw new Error('Country not found');
    if (!country.id) throw new Error('COUNTRY_CANONICAL_ID_REQUIRED');

    const { page, pageSize } = this.pagination(options);
    const [universities, scholarships, courses] = await Promise.all([
      this.universityRepository.listPublished({ countryReferenceId: country.id, page, pageSize }),
      this.scholarshipRepository.listPublished({ countryReferenceId: country.id, page, pageSize }),
      this.courseRelationshipRepository.listPublishedRelatedCourses({
        ...options.courseFilters,
        providerHeadquartersCountryReferenceId: country.id,
        page,
        pageSize,
      }),
    ]);

    return {
      subject: {
        ownerId: country.id,
        canonicalCode: country.iso2Code,
        displayName: country.name,
      },
      relationships: {
        universities: {
          ...universities,
          data: universities.data.map((university) => this.universityIdentity(university)),
        },
        scholarships: {
          ...scholarships,
          data: scholarships.data.map((scholarship) => this.scholarshipIdentity(scholarship)),
        },
        providerHeadquartersCourses: {
          ...courses,
          data: courses.data.map((course) => ({
            ownerId: course.ownerId,
            publicId: course.publicId,
            slug: course.slug,
            displayName: course.displayName,
            directCourseUrl: course.directCourseUrl,
            providerName: course.providerName,
            category: course.category,
          })),
        },
      },
    };
  }

  private majorUniversityIdentity(university: UniversityDto, majorId: string): MajorUniversityGraphItem {
    const programs = (university.academicPrograms ?? []).filter(
      (program): program is UniversityAcademicProgramReadDto & { majorId: string } =>
        program.majorId === majorId && program.majorMappingState === 'CANONICALLY_MAPPED',
    );
    return {
      ...this.universityIdentity(university),
      matchingPrograms: programs.map((program) => ({
        ownerId: program.id,
        sourceProgramName: program.sourceProgramName,
        degreeLevelId: program.degreeLevelId,
        majorOwnerId: program.majorId,
      })),
    };
  }

  private majorIdentity(major: MajorDto): StableEntityReadIdentity {
    return { ownerId: major.id, publicId: major.publicId, slug: major.slug, displayName: major.displayName };
  }

  private universityIdentity(university: UniversityDto): StableEntityReadIdentity {
    return { ownerId: university.id, publicId: university.publicId, slug: university.slug, displayName: university.displayName };
  }

  private scholarshipIdentity(scholarship: ScholarshipDto): StableEntityReadIdentity {
    return { ownerId: scholarship.id, publicId: scholarship.publicId, slug: scholarship.slug, displayName: scholarship.displayName };
  }

  private uniqueIdentities(items: StableEntityReadIdentity[]): StableEntityReadIdentity[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.ownerId)) return false;
      seen.add(item.ownerId);
      return true;
    });
  }

  private pagination(options: CrossDomainGraphReadOptions): { page: number; pageSize: number } {
    return {
      page: Math.max(1, options.page ?? 1),
      pageSize: Math.min(50, Math.max(1, options.pageSize ?? 12)),
    };
  }

  private required(value: string, code: string): string {
    const normalized = value.trim();
    if (!normalized) throw new Error(code);
    return normalized;
  }

}
