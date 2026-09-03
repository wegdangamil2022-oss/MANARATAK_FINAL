import {
  ApiClient,
  type PublicCareerJobDto,
  type PublicCmsContentDto,
  type PublicCourseDto,
  type PublicInternationalTestDto,
  type PublicMajorDto,
  type PublicServiceCatalogItemDto,
  type PublicStudentToolDto,
  type PublicUniversityDto,
  type ReferenceCountryDto,
} from '../../api/client';
import { mapPublicScholarshipDto, type PublicScholarshipDataStatus } from './publicScholarshipDataSource';
import type {
  CareerOpportunityKind,
  CareerOpportunityPreview,
  CareerWorkMode,
  CountryDestination,
  Course,
  DegreeLevel,
  Exam,
  ImportedCourse,
  Major,
  PublicArticle,
  Service,
  StudentToolCategory,
  StudentToolExecutionLabel,
  StudentToolPreview,
  University,
} from './types';

export type PublicLiveLocale = 'ar' | 'en';

export type PublicLiveDomain =
  | 'scholarships'
  | 'universities'
  | 'majors'
  | 'countries'
  | 'exams'
  | 'courses'
  | 'articles'
  | 'services'
  | 'careers'
  | 'tools';

export type PublicLiveDomainStatus = Exclude<PublicScholarshipDataStatus, 'prototype'> | 'empty';

export interface PublicLiveDataSnapshot {
  scholarships: ReturnType<typeof mapPublicScholarshipDto>[];
  universities: University[];
  majors: Major[];
  countries: CountryDestination[];
  exams: Exam[];
  courses: Course[];
  importedCourses: ImportedCourse[];
  articles: PublicArticle[];
  services: Service[];
  careers: CareerOpportunityPreview[];
  tools: StudentToolPreview[];
}

export interface PublicLiveLoadResult {
  data: PublicLiveDataSnapshot;
  statuses: Record<PublicLiveDomain, PublicLiveDomainStatus>;
  errors: Partial<Record<PublicLiveDomain, string>>;
}

const emptyData = (): PublicLiveDataSnapshot => ({
  scholarships: [], universities: [], majors: [], countries: [], exams: [], courses: [], importedCourses: [],
  articles: [], services: [], careers: [], tools: [],
});

const emptyStatuses = (): Record<PublicLiveDomain, PublicLiveDomainStatus> => ({
  scholarships: 'loading', universities: 'loading', majors: 'loading', countries: 'loading', exams: 'loading',
  courses: 'loading', articles: 'loading', services: 'loading', careers: 'loading', tools: 'loading',
});

function splitText(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value.split(/[,،;\n]/).map((item) => item.trim()).filter(Boolean);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function recordStringArray(value: unknown, key: string): string[] {
  return splitText(asRecord(value)[key]);
}

function firstString(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return fallback;
}

function countryFlagEmoji(iso2Code: string): string {
  const code = iso2Code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

function rankFromUniversity(dto: PublicUniversityDto): number {
  const rankings = Array.isArray(dto.rankings) ? dto.rankings : [];
  for (const raw of rankings) {
    const rank = asRecord(raw).rank;
    const numeric = Number(String(rank ?? '').replace(/[^0-9]/g, ''));
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return Number.MAX_SAFE_INTEGER;
}

function mapUniversity(dto: PublicUniversityDto): University {
  const programs = Array.isArray(dto.academicPrograms) ? dto.academicPrograms : [];
  const majorLinks = programs
    .map((raw) => asRecord(raw))
    .filter((program) => typeof program.majorId === 'string' && program.majorMappingState === 'CANONICALLY_MAPPED')
    .map((program) => ({
      label: firstString(program.sourceProgramName, 'برنامج أكاديمي'),
      majorId: String(program.majorId),
      degreeLabel: firstString(program.degreeLevelId),
      programLabel: firstString(program.sourceProgramName),
    }));
  return {
    id: dto.slug,
    publicId: dto.publicId,
    slug: dto.slug,
    countryReferenceId: dto.countryReferenceId,
    regionReferenceId: dto.regionReferenceId,
    cityReferenceId: dto.cityReferenceId,
    name: dto.displayName,
    nameEn: dto.canonicalName,
    type: dto.institutionType,
    country: dto.country ?? '',
    city: dto.city ?? undefined,
    foundationYear: dto.foundedYear ?? undefined,
    countryFlag: '',
    globalRank: rankFromUniversity(dto),
    scholarshipCount: 0,
    acceptanceRate: '',
    imageUrl: '',
    description: dto.description ?? '',
    topMajors: majorLinks.map((item) => item.label).slice(0, 8),
    websiteUrl: dto.officialWebsite ?? dto.officialSourceUrl ?? dto.sourceUrl ?? '',
    studyPrograms: {
      majorLinks,
      teachingLanguages: dto.languagesOfInstruction ?? [],
    },
    officialContacts: dto.officialWebsite ? {
      officialWebsite: dto.officialWebsite,
      phone: dto.contactPhone,
    } : undefined,
  };
}

function degreeLevels(value: string): DegreeLevel[] {
  const normalized = value.toLowerCase();
  const result: DegreeLevel[] = [];
  if (/bachelor|undergraduate|بكالوريوس/.test(normalized)) result.push('بكالوريوس');
  if (/master|postgraduate|ماجستير/.test(normalized)) result.push('ماجستير');
  if (/doctor|phd|دكتوراه/.test(normalized)) result.push('دكتوراه');
  if (/fellow|زمال/.test(normalized)) result.push('زمالة أبحاث');
  if (/course|training|دور/.test(normalized)) result.push('دورات تدريبية');
  return result.length ? result : [];
}

function mapMajor(dto: PublicMajorDto): Major {
  const sectionText = (dto.contentSections ?? []).map((section) => section.content).filter(Boolean).join('\n');
  const description = dto.description ?? dto.studentFriendlySummary ?? sectionText;
  return {
    id: dto.slug,
    publicId: dto.publicId,
    slug: dto.slug,
    name: dto.displayName,
    nameEn: dto.canonicalName,
    category: dto.academicFieldOrDiscipline ?? dto.collegeOrFaculty ?? 'تخصص أكاديمي',
    degreeLevels: degreeLevels(dto.degreeLevel),
    degreeLevelName: dto.degreeLevel,
    iconName: 'GraduationCap',
    code: dto.classificationCode ?? undefined,
    description: description ?? '',
    averageScholarships: 0,
    futureDemand: 'متوسط',
    topCountries: [],
    popularCareers: dto.careerOutcomes ?? [],
    academicField: dto.academicFieldOrDiscipline ?? undefined,
    aboutMajor: dto.studentFriendlySummary ?? dto.description,
    acquiredSkills: dto.acquiredSkills ?? [],
    workFields: dto.careerOutcomes ?? [],
  };
}

function mapCourse(dto: PublicCourseDto): { course: Course; imported: ImportedCourse } {
  const levelRaw = (dto.difficultyLevel ?? '').toLowerCase();
  const level: Course['level'] = /advanced|متقدم/.test(levelRaw) ? 'متقدم' : /intermediate|متوسط/.test(levelRaw) ? 'متوسط' : 'مبتدئ';
  const provider = dto.providerName ?? dto.platformName ?? 'منارتك';
  const course: Course = {
    id: dto.slug,
    ownerId: dto.ownerId,
    publicId: dto.publicId,
    slug: dto.slug,
    title: dto.displayName,
    titleEn: dto.canonicalName,
    provider,
    instructor: provider,
    duration: dto.studyDuration ?? '',
    lessonsCount: 0,
    level,
    isFree: dto.accessType !== 'PAID',
    rating: 0,
    studentsCount: 0,
    imageUrl: '',
    category: dto.category ?? 'تعلم',
  };
  const imported: ImportedCourse = {
    id: dto.slug,
    ownerId: dto.ownerId,
    publicId: dto.publicId,
    slug: dto.slug,
    title: dto.displayName,
    provider,
    field: dto.category ?? splitText(dto.relatedMajorsOrFields)[0] ?? '',
    language: dto.learningLanguage ?? '',
    level,
    duration: dto.studyDuration ?? '',
    studyFree: dto.accessType !== 'PAID',
    freeCertificate: Boolean(dto.certificateAvailable),
    certificateType: dto.certificateAvailable ? 'Completion Certificate' : '',
    topics: splitText(dto.courseContent),
    directCourseUrl: dto.directCourseUrl,
  };
  return { course, imported };
}

function mapCountry(dto: ReferenceCountryDto): CountryDestination {
  const meta = asRecord(dto.metadata);
  return {
    id: dto.id,
    ownerId: dto.id,
    slug: dto.iso2Code.toLowerCase(),
    name: dto.name,
    nameEn: dto.officialName ?? dto.name,
    flag: countryFlagEmoji(dto.iso2Code),
    flagEmoji: countryFlagEmoji(dto.iso2Code),
    continent: dto.region ?? '',
    livingCost: firstString(meta.livingCost, 'غير متوفر'),
    scholarshipAvailability: firstString(meta.scholarshipAvailability, 'غير متوفر'),
    studentSuitability: firstString(meta.studentSuitability, 'غير متوفر'),
    scholarshipsCount: 0,
    universitiesCount: 0,
    description: firstString(meta.description),
    imageUrl: '',
    popularCities: splitText(meta.popularCities),
    averageLivingCostUsd: firstString(meta.averageLivingCostUsd),
    languageOfStudy: dto.defaultLanguageCode ? [dto.defaultLanguageCode] : [],
    visaEase: firstString(meta.visaEase, 'غير متوفر'),
    iso2Code: dto.iso2Code,
    iso3Code: dto.iso3Code,
    subregion: dto.subregion ?? undefined,
    currencyCode: dto.defaultCurrencyCode ?? undefined,
    callingCode: dto.callingCode ?? undefined,
    officialLanguages: dto.defaultLanguageCode ? [dto.defaultLanguageCode] : [],
  };
}

function mapExam(dto: PublicInternationalTestDto): Exam {
  const score = dto.scoreScale;
  const variants = dto.variants?.filter((variant) => variant.isActive).map((variant) => ({
    name: variant.variantName,
    meta: variant.deliveryMode,
    note: variant.administrativeNotes,
  })) ?? [];
  return {
    id: dto.slug,
    ownerId: dto.id,
    publicId: dto.publicId,
    slug: dto.slug,
    name: dto.displayName,
    nameEn: dto.canonicalName,
    category: dto.testCategory,
    description: firstString(dto.registrationRequirements),
    tags: [dto.abbreviation, dto.testCode, dto.providerName].filter((value): value is string => Boolean(value)),
    providerName: dto.providerName,
    testCode: dto.testCode,
    scoreRange: score ? `${score.overallMinimum}–${score.overallMaximum}` : undefined,
    validity: score?.resultValidityDurationMonths ? `${score.resultValidityDurationMonths} شهر` : undefined,
    status: dto.status,
    variants,
    sections: dto.sections?.map((section) => ({
      name: section.sectionName,
      duration: section.durationMinutes ? `${section.durationMinutes} دقيقة` : undefined,
      score: section.scoreMinimum !== undefined && section.scoreMaximum !== undefined ? `${section.scoreMinimum}–${section.scoreMaximum}` : undefined,
      meta: section.sectionType,
    })) ?? [],
    registrationRequirements: splitText(dto.registrationRequirements),
    retakeNotes: splitText(dto.retakePolicy),
    officialLinks: dto.officialLinks?.map((link) => ({ label: link.description ?? link.linkType, url: link.url })) ?? [],
  };
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapArticle(dto: PublicCmsContentDto): PublicArticle {
  const plain = stripHtml(dto.body);
  const kind = dto.contentType.toUpperCase();
  const contentType: PublicArticle['contentType'] = kind.includes('NEWS') ? 'NEWS' : kind.includes('GUIDE') ? 'STUDY_GUIDE' : kind.includes('CHECKLIST') ? 'CHECKLIST' : 'ARTICLE';
  return {
    id: dto.slug,
    publicId: dto.publicId,
    ownerId: dto.contentId,
    slug: dto.slug,
    titleAr: dto.title,
    titleEn: dto.title,
    contentType,
    contentTypeLabelAr: contentType === 'NEWS' ? 'خبر' : contentType === 'STUDY_GUIDE' ? 'دليل دراسي' : contentType === 'CHECKLIST' ? 'قائمة تحقق' : 'مقال',
    categoryAr: dto.categorySlug ?? 'محتوى',
    author: 'منارتك',
    updatedAt: dto.publishedAt,
    readingTime: dto.localizedPayload?.readingTimeMinutes ? `${dto.localizedPayload.readingTimeMinutes} دقائق` : undefined,
    excerptAr: dto.summary ?? plain.slice(0, 220),
    tags: dto.tags.map((tag) => tag.label),
    sections: plain ? [{ title: dto.title, paragraphs: [plain] }] : [],
    officialLinks: [{ label: 'الرابط المنشور', url: dto.canonicalUrl }],
  };
}

function mapService(dto: PublicServiceCatalogItemDto): Service {
  const metadata = asRecord(dto.publicDisplayMetadata);
  const audience: Service['audience'] = /student/i.test(dto.serviceCategory) || /student/i.test(dto.responsibleServiceOwnerType) ? 'student' : 'general';
  return {
    id: dto.slug,
    publicId: dto.publicId,
    slug: dto.slug,
    supportedCountryReferenceIds: dto.supportedCountryReferenceIds ?? [],
    supportedLanguageReferenceIds: dto.supportedLanguageReferenceIds ?? [],
    title: dto.displayName,
    audience,
    category: dto.serviceCategory,
    badge: firstString(metadata.badge, audience === 'student' ? 'خدمة طلابية' : 'خدمة عامة'),
    shortDescription: dto.serviceDescription,
    description: dto.serviceDescription,
    priceLabel: firstString(metadata.priceLabel, dto.pricingReferenceId ? 'راجع تفاصيل التسعير' : 'يحدد حسب الطلب'),
    turnaround: dto.estimatedDeliveryTime ?? '',
    deliveryMode: dto.deliveryMode,
    includes: recordStringArray(metadata, 'includes'),
    excludes: recordStringArray(metadata, 'excludes'),
    requirements: dto.requiredInputsOrDocuments ?? [],
    faqs: [],
    cancellationPolicy: firstString(metadata.cancellationPolicy),
    availabilityNote: dto.serviceAvailabilityStatus,
    requestContextFields: dto.servicePrerequisites ?? [],
    contextualLinks: [],
  };
}

const toolCategoryMap: Record<string, StudentToolCategory> = {
  WRITING_DOCUMENTS: 'الكتابة والوثائق', GUIDANCE: 'الإرشاد والتوجيه', STUDY_PLANNING: 'التخطيط الدراسي',
  ACADEMIC_CALCULATORS: 'الحاسبات الأكاديمية', ADMISSION_READINESS: 'القبول والجاهزية', SEARCH_COMPARISON: 'البحث والمقارنة',
  FINANCIAL_PLANNING: 'التخطيط المالي', DOCUMENT_VERIFICATION: 'التحقق من الوثائق',
};
function mapTool(dto: PublicStudentToolDto, locale: PublicLiveLocale): StudentToolPreview {
  const executionLabel: StudentToolExecutionLabel = /AI|MODEL|PROMPT/i.test(dto.executionType) ? 'أداة ذكية' : /CALC/i.test(dto.executionType) ? 'حسابية' : /HYBRID/i.test(dto.executionType) ? 'هجينة' : 'بيانات ومقارنة';
  const active = dto.implementationStatus === 'IMPLEMENTED' && dto.visibility === 'ACTIVE' && dto.availability.publicEnabled;
  return {
    id: dto.toolKey,
    ownerId: dto.id,
    toolKey: dto.toolKey,
    title: locale === 'en' ? dto.nameEn : dto.nameAr,
    titleEn: dto.nameEn,
    shortDescription: locale === 'en' ? (dto.descriptionEn ?? dto.descriptionAr) : dto.descriptionAr,
    category: toolCategoryMap[dto.category] ?? 'الإرشاد والتوجيه',
    executionLabel,
    availability: active ? 'متاحة الآن' : 'قريبًا',
    estimatedTime: dto.estimatedMinutes ? `${dto.estimatedMinutes} دقائق` : '',
    badge: dto.lifecycle,
    purpose: locale === 'en' ? (dto.descriptionEn ?? dto.descriptionAr) : dto.descriptionAr,
    howItWorks: [],
    inputs: [],
    outputs: [],
  };
}

function mapCareer(dto: PublicCareerJobDto): CareerOpportunityPreview {
  const metadata = asRecord(dto.metadata);
  const kind: CareerOpportunityKind = dto.opportunityType === 'INTERNSHIP' ? 'تدريب' : dto.opportunityType === 'GRADUATE_PROGRAM' ? 'برنامج خريجين' : 'وظيفة';
  const workMode: CareerWorkMode = dto.remoteOption || dto.employmentType === 'REMOTE' ? 'عن بعد' : 'حضوري';
  const employer = dto.employer?.displayName ?? 'جهة ناشرة';
  return {
    id: dto.slug,
    ownerId: dto.id,
    publicId: dto.publicId,
    slug: dto.slug,
    countryReferenceId: dto.countryReferenceId,
    cityReferenceId: dto.cityReferenceId,
    title: dto.title,
    titleEn: dto.canonicalTitle,
    employerName: employer,
    kind,
    subtype: dto.opportunityType,
    country: dto.country ?? dto.employer?.country ?? '',
    city: dto.city ?? dto.employer?.city ?? undefined,
    workMode,
    industry: dto.employer?.industry ?? dto.jobCategory,
    employmentType: dto.employmentType,
    experienceLevel: dto.opportunityType === 'GRADUATE_PROGRAM' ? 'حديث التخرج' : dto.opportunityType === 'INTERNSHIP' ? 'طالب جامعي' : 'مبتدئ',
    salaryLabel: firstString(asRecord(dto.salaryRange).label, 'غير معلن'),
    durationLabel: firstString(metadata.durationLabel) || undefined,
    summary: firstString(metadata.summary, dto.description.slice(0, 220)),
    description: dto.description,
    responsibilities: recordStringArray(metadata, 'responsibilities'),
    requirements: [dto.educationRequirement, ...(dto.languageRequirements ?? [])].filter((value): value is string => Boolean(value)),
    targetSkills: dto.requiredSkills ?? [],
    benefits: recordStringArray(metadata, 'benefits'),
    applicationSteps: recordStringArray(metadata, 'applicationSteps'),
    contextLinks: [],
    suggestTools: Boolean(metadata.suggestTools),
  };
}

export async function loadPublishedUniversities(locale: PublicLiveLocale = 'ar'): Promise<University[]> {
  const result = await ApiClient.getUniversities({ locale, page: 1, pageSize: 50 });
  return result.data.map(mapUniversity);
}
export async function loadPublishedMajors(locale: PublicLiveLocale = 'ar'): Promise<Major[]> {
  const result = await ApiClient.getMajors({ locale, page: 1, pageSize: 50 });
  return result.data.map(mapMajor);
}
export async function loadPublishedCountries(): Promise<CountryDestination[]> {
  const result = await ApiClient.getReferenceCountries({ activeOnly: true });
  return result.filter((item) => item.isActive).map(mapCountry);
}
export async function loadPublishedExams(locale: PublicLiveLocale = 'ar'): Promise<Exam[]> {
  const result = await ApiClient.getInternationalTests({ locale, page: 1, pageSize: 50 });
  return result.data.map(mapExam);
}
export async function loadPublishedCourses(): Promise<{ courses: Course[]; importedCourses: ImportedCourse[] }> {
  const result = await ApiClient.getCourses({ page: 1, pageSize: 50 });
  const mapped = result.data.map(mapCourse);
  return { courses: mapped.map((item) => item.course), importedCourses: mapped.map((item) => item.imported) };
}
export async function loadPublishedArticles(locale: PublicLiveLocale = 'ar'): Promise<PublicArticle[]> {
  const result = await ApiClient.getCmsContent({ locale, page: 1, pageSize: 50 });
  return result.data.map(mapArticle);
}
export async function loadPublishedServices(): Promise<Service[]> {
  const result = await ApiClient.getServices({ page: 1, pageSize: 50 });
  return result.data.map(mapService);
}
export async function loadPublishedCareers(): Promise<CareerOpportunityPreview[]> {
  const result = await ApiClient.getCareerJobs({ page: 1, pageSize: 50 });
  return result.data.map(mapCareer);
}
export async function loadPublishedTools(locale: PublicLiveLocale = 'ar'): Promise<StudentToolPreview[]> {
  const result = await ApiClient.getStudentTools();
  return result.filter((item) => item.availability.publicEnabled).map((item) => mapTool(item, locale));
}

export async function loadPublicLiveSnapshot(locale: PublicLiveLocale = 'ar'): Promise<PublicLiveLoadResult> {
  const data = emptyData();
  const statuses = emptyStatuses();
  const errors: Partial<Record<PublicLiveDomain, string>> = {};
  const loaders: Array<[PublicLiveDomain, () => Promise<unknown>]> = [
    ['scholarships', () => ApiClient.getScholarships({ page: 1, pageSize: 50 }).then((result) => result.data.map((dto) => mapPublicScholarshipDto(dto)))],
    ['universities', () => loadPublishedUniversities(locale)], ['majors', () => loadPublishedMajors(locale)], ['countries', loadPublishedCountries],
    ['exams', () => loadPublishedExams(locale)], ['courses', loadPublishedCourses], ['articles', () => loadPublishedArticles(locale)],
    ['services', loadPublishedServices], ['careers', loadPublishedCareers], ['tools', () => loadPublishedTools(locale)],
  ];
  await Promise.all(loaders.map(async ([domain, loader]) => {
    try {
      const result = await loader();
      if (domain === 'courses') {
        const value = result as Awaited<ReturnType<typeof loadPublishedCourses>>;
        data.courses = value.courses; data.importedCourses = value.importedCourses;
        statuses.courses = value.courses.length ? 'ready' : 'empty';
        return;
      }
      (data as unknown as Record<string, unknown>)[domain] = result;
      const size = Array.isArray(result) ? result.length : 0;
      statuses[domain] = size ? 'ready' : 'empty';
    } catch (error) {
      statuses[domain] = 'unavailable';
      errors[domain] = error instanceof Error ? error.message : `Failed to load ${domain}`;
    }
  }));
  return { data, statuses, errors };
}
