export type Language = 'ar' | 'en';

export type CategoryType =
  | 'all'
  | 'scholarships'
  | 'universities'
  | 'countries'
  | 'majors'
  | 'courses'
  | 'articles'
  | 'services'
  | 'exams'
  | 'jobs'
  | 'tools';

export type DegreeLevel =
  'بكالوريوس' | 'ماجستير' | 'دكتوراه' | 'دورات تدريبية' | 'زمالة أبحاث' | 'all';

export type FundingType = 'ممولة بالكامل' | 'ممولة جزئياً' | 'إعفاء من الرسوم' | 'راتب شهري وسكن';

export interface Scholarship {
  id: string;
  title: string;
  titleEn: string;
  country: string;
  countryEn: string;
  countryFlag: string;
  university: string;
  universityEn: string;
  degreeLevel: DegreeLevel[];
  fundingType: FundingType;
  financialCoverage: string[];
  deadline: string; // YYYY-MM-DD
  daysLeft: number;
  featured: boolean;
  tag: string;
  imageUrl: string;
  field: string;
  requirements: string[];
  description: string;
  applicationUrl: string;
  withoutIelts: boolean;
  matchScore?: number;
}

export interface CountryDestination {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  flagEmoji: string;
  continent: string;
  livingCost: string; // e.g. 'منخفضة' | 'متوسطة' | 'مرتفعة'
  scholarshipAvailability: string; // e.g. 'متوفرة بكثرة' | 'متوفرة' | 'محدودة'
  studentSuitability: string; // e.g. 'عالية' | 'ممتازة' | 'جيدة جداً'
  scholarshipsCount: number;
  universitiesCount: number;
  description: string;
  imageUrl: string;
  popularCities: string[];
  averageLivingCostUsd: string;
  languageOfStudy: string[];
  visaEase: string;
}

export interface UniversityRanking {
  name: string;
  year: number;
  rank: string;
  link?: string;
}

export interface UniversityTuitionFees {
  currency: string; // e.g. 'جنيه إسترليني (£)', 'دولار أمريكي ($)', 'يورو (€)'
  currencySymbol?: string; // e.g. '£', '$', '€', '¥'
  annualAverageTuition?: string; // e.g. '33,050 - 48,620 £ / سنوياً'
  generalDescription?: string;
  undergradTuition?: string;
  undergradNote?: string;
  medicineTuition?: string; // إذا كان متوفراً
  medicineNote?: string;
  engineeringTuition?: string; // إذا كان متوفراً
  engineeringNote?: string;
  postgradTuition?: string;
  postgradNote?: string;
  officialTuitionUrl?: string; // رابط الرسوم الرسمي
}

export interface UniversityScholarship {
  id: string;
  name: string;
  nameEn?: string;
  type?: string;
  audience?: string;
  officialUrl: string;
}

export interface UniversityLanguageRequirements {
  required: boolean;
  languages: string[];
  acceptedTests: string[];
  officialUrl: string;
}

export interface UniversityDocumentRequirements {
  generalDocuments: string[];
  graduateAdditionalDocuments: string[];
  officialUrl: string;
}

export interface UniversityHousing {
  available: boolean;
  internationalStudentsEligible: boolean;
  typicalCost: string;
  currency: string;
  officialUrl?: string;
}

export interface UniversityLivingCosts {
  monthlyEstimate: string;
  currency: string;
  variationNote: string;
  officialUrl?: string;
}

export interface UniversityOfficialLink {
  label: string;
  url: string;
}

export interface UniversityOfficialContacts {
  phone?: string;
  officialWebsite: string;
  mainSocial?: UniversityOfficialLink;
  governmentRegister?: UniversityOfficialLink;
  usefulLinks?: UniversityOfficialLink[];
}

export interface UniversityDataTrust {
  lastVerified: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface UniversityStudyPrograms {
  degrees?: string[];
  faculties?: string[];
  topKeyMajors?: string[];
  teachingLanguages?: string[];
  studyModes?: string[];
  undergradDirectoryUrl?: string;
  postgradDirectoryUrl?: string;
}

export interface UniversityInternationalAdmissions {
  acceptsInternationalStudents?: boolean;
  acceptsDescription?: string;
  undergradAdmissionUrl?: string;
  postgradAdmissionUrl?: string;
  internationalStudentsUrl?: string;
  applicationPortalUrl?: string;
}

export interface University {
  id: string;
  name: string;
  nameEn: string;
  type?: string; // e.g. جامعة، كلية جامعية، معهد
  ownership?: string; // e.g. حكومية، خاصة
  country: string;
  city?: string;
  foundationYear?: number;
  countryFlag: string;
  globalRank: number;
  scholarshipCount: number;
  acceptanceRate: string;
  imageUrl: string;
  description: string;
  topMajors: string[];
  websiteUrl: string;
  rankings?: UniversityRanking[];
  tuitionFees?: UniversityTuitionFees;
  scholarships?: UniversityScholarship[];
  languageRequirements?: UniversityLanguageRequirements;
  documentRequirements?: UniversityDocumentRequirements;
  housing?: UniversityHousing;
  livingCosts?: UniversityLivingCosts;
  officialContacts?: UniversityOfficialContacts;
  dataTrust?: UniversityDataTrust;
  studyPrograms?: UniversityStudyPrograms;
  internationalAdmissions?: UniversityInternationalAdmissions;
}

export interface Course {
  id: string;
  title: string;
  titleEn: string;
  provider: string;
  instructor: string;
  duration: string;
  lessonsCount: number;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  isFree: boolean;
  rating: number;
  studentsCount: number;
  imageUrl: string;
  category: string;
  progressPercent?: number;
}

export interface Major {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  degreeLevels?: DegreeLevel[];
  degreeLevelName?: string;
  iconName: string;
  code?: string;
  duration?: string;
  commonDegrees?: string;
  description: string;
  averageScholarships: number;
  futureDemand: 'مرتفع جداً' | 'مرتفع' | 'متوسط';
  topCountries: string[];
  popularCareers: string[];

  // Detailed Information
  associatedMajor?: string;
  academicField?: string;
  professionalOrResearchField?: string;
  fellowshipType?: string;
  fellowshipTypeDetails?: string[];
  licensingRequirement?: string;
  targetAudience?: string[];
  previousQualifications?: string[];
  previousQualificationsNote?: string;
  durationAndPattern?: string[];
  rotationsAndClinical?: string[];
  supervisedProcedures?: string[];
  researchAndQuality?: string[];
  targetCompetencies?: string[];
  assessmentAndCompletionRequirements?: string[];
  resultingCertificate?: string[];
  practiceScopeAndLicensing?: string;
  relationToResidencyBoardPhD?: { pathway: string; relation: string }[];
  similarFellowships?: { name: string; difference: string }[];
  professionalRegulatoryAlert?: string;
  programTypes?: string;
  studyModes?: string;
  natureOfStudy?: string;
  availabilityNature?: string;
  aboutMajor?: string;
  aboutMajorNote?: string;
  doctorateTypes?: string[];
  targetBackgrounds?: string[];
  closeBackgrounds?: string[];
  directEntryInfo?: string[];
  experienceOrLicensing?: string[];
  programStages?: string[];
  advancedTheory?: string[];
  researchMethodologies?: string[];
  ethicsAndIntegrity?: string[];
  qualifyingExamInfo?: string;
  researchProposalInfo?: string;
  originalContributionInfo?: string;
  supervisionEnvironment?: string[];
  supervisionAndEnvironment?: string[];
  researchPublishingTeaching?: string[];
  postDoctoralOpportunitiesIntro?: string;
  postDoctoralOpportunities?: string[];
  whatYouWillStudy?: string[];
  foundationSubjects?: string[];
  coreSubjects?: string[];
  practicalSide?: string[];
  subSpecialties?: string[];
  graduationRequirements?: string[];
  acquiredSkills?: string[];
  workFields?: string[];
  relatedJobs?: { job: string; entry: string; matchRate?: string; notes?: string }[];
  postgraduateOpportunitiesIntro?: string;
  postgraduateOpportunities?: string[];
  similarMajors?: { name: string; difference: string }[];
  academicAlertPoints?: { num?: string; title: string; desc: string }[];
  academicAlert?: string;
}

export interface ApplicationMilestone {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  country: string;
  deadline: string;
  stage:
    | 'تجهيز المستندات'
    | 'كتابة خطاب الدافع'
    | 'خطابات التوصية'
    | 'تم إرسال الطلب'
    | 'المقابلة الشخصية'
    | 'تم القبول بنجاح';
  progress: number; // 0 to 100
  notes: string;
  checklist: {
    id: string;
    task: string;
    completed: boolean;
  }[];
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'urgent' | 'opportunity' | 'course' | 'deadline' | 'system';
  read: boolean;
  actionType?: 'scholarship' | 'course' | 'ai-tools' | 'tracker';
  targetId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  degreeLevel: string;
  targetMajor: string;
  gpa: string;
  englishLevel: string;
  targetCountries: string[];
  avatarUrl?: string;
  notificationsEnabled: boolean;
}

export interface Exam {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  description: string;
  tags: string[];
}
