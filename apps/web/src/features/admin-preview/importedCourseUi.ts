export type ImportedCourseRecord = Record<string, any>;

export const MASTER_PROVIDER_OPTIONS = [
  'The Open University — OpenLearn',
  'freeCodeCamp',
  'FAO eLearning Academy',
  'IBM SkillsBuild',
  'HubSpot Academy',
  'Saylor University',
  'NextGenU',
  'openHPI — Hasso Plattner Institute',
  'Global Health Learning Center',
  'Semrush Academy',
  'JMOOC',
  'WIPO Academy',
  'UNDP Learning for Nature',
  'HP LIFE',
  'University of Helsinki — MOOC.fi',
  'Google Skillshop',
  'Harvard University — CS50',
] as const;

export const COURSE_TYPE_OPTIONS = [
  'دورة تدريبية',
  'مسار تعليمي',
  'دورة اعتماد أو شهادة',
  'اختبار شهادة',
  'معسكر تدريبي',
  'مشروع أو مختبر',
] as const;

export const COURSE_SPECIALTY_OPTIONS = [
  'الذكاء الاصطناعي وتعلّم الآلة',
  'البرمجة وتطوير البرمجيات',
  'تطوير الويب',
  'الحوسبة السحابية وDevOps',
  'الأمن السيبراني والشبكات',
  'البيانات وقواعد البيانات',
  'الأعمال والإدارة',
  'التسويق والمبيعات',
  'المالية والمحاسبة',
  'الصحة والطب',
  'الزراعة والغذاء',
  'البيئة والاستدامة',
  'التعليم والتدريب',
  'اللغات',
  'الهندسة والعلوم',
  'القانون والسياسة والمجتمع',
  'الفنون والعلوم الإنسانية',
  'التنمية والعمل الإنساني',
  'المهارات المهنية والتطوير الوظيفي',
  'أخرى',
] as const;

const STATUS_AR: Record<string, string> = {
  DRAFT: 'مسودة',
  IMPORTED: 'مستوردة',
  READY_TO_REVIEW: 'جاهزة للمراجعة',
  AWAITING_REVIEW: 'بانتظار المراجعة',
  UNDER_REVIEW: 'قيد المراجعة',
  MISSING_DATA: 'بيانات ناقصة',
  INCOMPLETE: 'ناقصة البيانات',
  READY_TO_PUBLISH: 'جاهزة للنشر',
  APPROVED: 'معتمدة',
  PUBLISHED: 'منشورة',
  REJECTED: 'مرفوضة',
  ARCHIVED: 'مؤرشفة',
  BROKEN_LINK: 'رابط معطل',
  DISABLED: 'معطلة',
};

const LINK_HEALTH_AR: Record<string, string> = {
  HEALTHY: 'الرابط سليم',
  VERIFIED: 'الرابط متحقق منه',
  NEEDS_VERIFICATION: 'الرابط يحتاج تحققًا',
  BROKEN: 'الرابط معطل',
  UNKNOWN: 'حالة الرابط غير معروفة',
};

const LANGUAGE_AR: Record<string, string> = {
  English: 'الإنجليزية',
  Arabic: 'العربية',
  Spanish: 'الإسبانية',
  French: 'الفرنسية',
  German: 'الألمانية',
  Japanese: 'اليابانية',
  Welsh: 'الويلزية',
  Russian: 'الروسية',
  Portuguese: 'البرتغالية',
  Chinese: 'الصينية',
  Turkish: 'التركية',
  Italian: 'الإيطالية',
  Ukrainian: 'الأوكرانية',
  Swahili: 'السواحيلية',
  'Scottish Gaelic': 'الغيلية الاسكتلندية',
};

const LEVEL_AR: Record<string, string> = {
  Beginner: 'مبتدئ',
  Intermediate: 'متوسط',
  Advanced: 'متقدم',
  Foundational: 'تأسيسي',
  Fundamentals: 'أساسيات',
  Basics: 'أساسي',
  Expert: 'خبير',
  'Advanced / Expert': 'متقدم / خبير',
  'Beginner to Intermediate': 'مبتدئ إلى متوسط',
  'Intermediate to Advanced': 'متوسط إلى متقدم',
  'Beginner to Advanced': 'مبتدئ إلى متقدم',
  'Beginner / Advanced': 'مبتدئ / متقدم',
  'Intermediate / Expert': 'متوسط / خبير',
  'Level 1: Introductory': 'المستوى 1: تمهيدي',
  'Level 2: Intermediate': 'المستوى 2: متوسط',
  'Level 3: Advanced': 'المستوى 3: متقدم',
  'Bachelor-level': 'مستوى البكالوريوس',
  'Master-level': 'مستوى الماجستير',
  'Graduate-level': 'مستوى الدراسات العليا',
  'Medical students': 'طلاب الطب',
  'Health professionals': 'الممارسون الصحيون',
  'Healthcare professionals': 'الممارسون في الرعاية الصحية',
  'Not officially specified': 'غير محدد رسميًا',
};

const CERTIFICATE_AR: Array<[RegExp, string]> = [
  [/^no free certificate verified$/i, 'لا توجد شهادة مجانية بعد التحقق'],
  [/^no free certificate$/i, 'لا توجد شهادة مجانية'],
  [/certificate of completion/i, 'شهادة إتمام'],
  [/statement of participation/i, 'إفادة مشاركة'],
  [/confirmation of participation/i, 'إفادة مشاركة'],
  [/digital badge/i, 'شارة رقمية'],
  [/digital certificate/i, 'شهادة رقمية'],
  [/electronic certificate/i, 'شهادة إلكترونية'],
  [/course certificate/i, 'شهادة دورة'],
  [/digital credential/i, 'اعتماد رقمي'],
  [/certification/i, 'شهادة اعتماد'],
];

const SPECIALTY_RULES: Array<[string, string[]]> = [
  ['الذكاء الاصطناعي وتعلّم الآلة', ['artificial intelligence', 'machine learning', 'deep learning', 'generative ai', 'neural', 'tensorflow', 'pytorch', 'llm', 'prompt engineering', 'embedding', 'mlops']],
  ['الأمن السيبراني والشبكات', ['cybersecurity', 'cyber security', 'networking', 'network security', 'ccna', 'cissp', 'ethical hacking', 'cryptography', 'oauth', 'identity and access']],
  ['الحوسبة السحابية وDevOps', ['cloud', 'devops', 'docker', 'kubernetes', 'aws ', 'azure', 'google cloud', 'terraform', 'ci/cd', 'observability', 'opentelemetry']],
  ['تطوير الويب', ['front-end', 'frontend', 'back-end', 'backend', 'full-stack', 'full stack', 'web development', 'html', 'css', 'react', 'webflow', 'mern', 'pern', 'php', 'ruby on rails']],
  ['البيانات وقواعد البيانات', ['data analysis', 'data science', 'database', 'sql', 'statistics', 'analytics', 'visualization', 'business intelligence', 'big data', 'databricks', 'spss']],
  ['البرمجة وتطوير البرمجيات', ['programming', 'python', 'javascript', 'typescript', 'java ', 'c++', 'c#', '.net', 'software development', 'coding', 'algorithms', 'data structures', 'operating systems', 'computer architecture', 'system design', 'git ', 'github', 'unity', 'unreal engine', 'go ', 'spring boot']],
  ['التسويق والمبيعات', ['marketing', 'seo', 'semrush', 'hubspot', 'sales', 'advertising', 'google ads', 'campaign', 'social media', 'content marketing', 'inbound', 'conversion optimization']],
  ['المالية والمحاسبة', ['finance', 'accounting', 'financial', 'bookkeeping', 'investment', 'cash flow', 'profit and loss', 'funding', 'economics', 'money']],
  ['الأعمال والإدارة', ['business', 'management', 'leadership', 'entrepreneurship', 'operations', 'human resources', 'project management', 'customer service', 'decision-making', 'consumer behavior']],
  ['الصحة والطب', ['health', 'medical', 'medicine', 'clinical', 'nursing', 'public health', 'digital health', 'healthcare', 'global health', 'epidemiology', 'psychology']],
  ['الزراعة والغذاء', ['agriculture', 'agribusiness', 'food security', 'food safety', 'fisheries', 'plant health', 'rural development', 'mechanization', 'tuna fisheries']],
  ['البيئة والاستدامة', ['climate', 'environment', 'sustainability', 'ecosystem', 'biodiversity', 'nature', 'forestry', 'forest ', 'circular economy', 'sdg', 'sustainable development']],
  ['التعليم والتدريب', ['education', 'learning', 'teaching', 'teacher', 'child development', 'pedagogy', 'training']],
  ['اللغات', ['language learning', 'english language', 'french language', 'spanish language', 'german language', 'japanese language', 'arabic language', 'welsh', 'finnish language']],
  ['الهندسة والعلوم', ['engineering', 'physics', 'chemistry', 'biology', 'science', 'quantum', 'mathematics', 'calculus', 'mechanics', 'electromagnetism']],
  ['القانون والسياسة والمجتمع', ['law', 'politics', 'society', 'human rights', 'governance', 'policy', 'government', 'justice']],
  ['الفنون والعلوم الإنسانية', ['arts', 'humanities', 'history', 'philosophy', 'literature', 'culture', 'music', 'art appreciation', 'existentialism']],
  ['التنمية والعمل الإنساني', ['humanitarian', 'international development', 'child labour', 'gender equality', 'monitoring & evaluation', 'voluntary national reviews']],
  ['المهارات المهنية والتطوير الوظيفي', ['career development', 'professional skills', 'workplace', 'hybrid work', 'communication', 'presentation', 'resume', 'grant proposal', 'information literacy', 'productivity', 'college success']],
];

function firstValue(course: ImportedCourseRecord, keys: string[]): any {
  for (const key of keys) {
    const value = key.split('.').reduce<any>((acc, segment) => acc?.[segment], course);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function parseBoolean(value: any): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['yes', 'true', '1', 'free', 'مجاني', 'نعم'].includes(normalized)) return true;
  if (['no', 'false', '0', 'paid', 'مدفوع', 'لا'].includes(normalized)) return false;
  return null;
}

export function containsArabic(value?: string | null): boolean {
  return Boolean(value && /[\u0600-\u06FF]/.test(value));
}

export function getArabicCourseTitle(course: ImportedCourseRecord): string {
  const explicitArabic = firstValue(course, [
    'titleAr',
    'arabicTitle',
    'displayNameAr',
    'localizedNameAr',
    'localizedNames.ar',
    'localizedNames.ar-SA',
    'translation.ar.title',
  ]);
  if (explicitArabic) return String(explicitArabic).trim();

  const candidates = [course.displayName, course.courseName, course.title, course.titleEn, course.originalTitle];
  const embeddedArabic = candidates.find(value => containsArabic(String(value || '')));
  if (embeddedArabic) return String(embeddedArabic).trim();

  return 'بانتظار الترجمة العربية';
}

export function getOriginalCourseTitle(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['originalTitle', 'courseName', 'titleEn', 'canonicalTitle', 'displayName', 'title']) || 'غير متوفر').trim();
}

export function getCourseProvider(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['provider', 'platformName', 'providerName', 'platform', 'platformUniversity', 'sourceProvider']) || 'مزود غير محدد').trim();
}

export function getCourseStatus(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['status', 'lifecycleState', 'publicationStatus', 'importStatus']) || 'IMPORTED').trim().toUpperCase();
}

export function getStatusArabic(status?: string | null): string {
  const normalized = String(status || '').trim().toUpperCase();
  return STATUS_AR[normalized] || 'غير مصنفة';
}

export function getStatusStyle(status?: string | null): string {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'PUBLISHED') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (normalized === 'READY_TO_PUBLISH' || normalized === 'APPROVED') return 'border-blue-200 bg-blue-50 text-blue-800';
  if (['MISSING_DATA', 'INCOMPLETE', 'BROKEN_LINK', 'REJECTED'].includes(normalized)) return 'border-rose-200 bg-rose-50 text-rose-800';
  if (normalized === 'ARCHIVED') return 'border-slate-200 bg-slate-100 text-slate-700';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

export function getLinkHealth(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['linkHealth', 'linkStatus', 'directUrlHealth']) || 'UNKNOWN').trim().toUpperCase();
}

export function getLinkHealthArabic(course: ImportedCourseRecord): string {
  const status = getLinkHealth(course);
  return LINK_HEALTH_AR[status] || 'حالة الرابط غير معروفة';
}

export function isSourceVerified(course: ImportedCourseRecord): boolean {
  const parsed = parseBoolean(firstValue(course, ['sourceVerified', 'isSourceVerified', 'isOfficialSourceVerified', 'verificationStatus']));
  if (parsed !== null) return parsed;
  return String(course.verificationStatus || '').toLowerCase() === 'verified';
}

export function getStudyFreeState(course: ImportedCourseRecord): boolean | null {
  const direct = parseBoolean(firstValue(course, [
    'studyFree',
    'freeStudy',
    'isFreeCourse',
    'isFreeStudy',
    'isFreeStudyVerified',
    'metadata.studyFree',
    'metadata.isFreeCourse',
  ]));
  if (direct !== null) return direct;

  const accessType = String(firstValue(course, ['accessType', 'externalPriceType', 'pricingType']) || '').toLowerCase();
  if (accessType.includes('free') || accessType.includes('audit')) return true;
  if (accessType.includes('paid')) return false;
  return null;
}

export function getFreeCertificateState(course: ImportedCourseRecord): boolean | null {
  const direct = parseBoolean(firstValue(course, [
    'freeCertificate',
    'isFreeCertificate',
    'hasFreeCertificate',
    'isFreeCertificateVerified',
    'metadata.freeCertificate',
    'metadata.isFreeCertificate',
  ]));
  if (direct !== null) return direct;

  const certificateType = String(firstValue(course, ['certificateType', 'credentialType', 'metadata.certificateType']) || '').toLowerCase();
  if (certificateType.includes('no free certificate')) return false;
  if (certificateType.includes('free certificate')) return true;
  return null;
}

export function getCertificateType(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['certificateType', 'credentialType', 'metadata.certificateType']) || '').trim();
}

export function getCertificateTypeArabic(course: ImportedCourseRecord): string {
  const raw = getCertificateType(course);
  if (!raw) {
    const free = getFreeCertificateState(course);
    if (free === true) return 'شهادة مجانية';
    if (free === false) return 'لا توجد شهادة مجانية';
    return 'غير محدد';
  }
  const hit = CERTIFICATE_AR.find(([pattern]) => pattern.test(raw));
  return hit?.[1] || (containsArabic(raw) ? raw : 'نوع شهادة مسجل في المصدر');
}

export function getCourseLanguageRaw(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['language', 'learningLanguage', 'studyLanguage', 'metadata.language']) || '').trim();
}

export function translateLanguage(value?: string | null): string {
  const raw = String(value || '').trim();
  if (!raw) return 'غير محددة';
  if (raw === 'Not officially specified') return 'غير محددة رسميًا';
  if (/multilingual|multiple languages/i.test(raw)) return 'متعدد اللغات';
  if (LANGUAGE_AR[raw]) return LANGUAGE_AR[raw];

  const translated = Object.entries(LANGUAGE_AR).reduce((current, [english, arabic]) => {
    return current.replace(new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), arabic);
  }, raw);
  return translated === raw && !containsArabic(raw) ? 'لغة مسجلة في المصدر' : translated;
}

export function getCourseLevelRaw(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['level', 'studyLevel', 'difficultyLevel', 'courseLevel', 'metadata.studyLevel']) || '').trim();
}

export function translateLevel(value?: string | null): string {
  const raw = String(value || '').trim();
  if (!raw) return 'غير محدد';
  if (LEVEL_AR[raw]) return LEVEL_AR[raw];
  if (/^A[12]/i.test(raw)) return `مستوى لغوي ${raw}`;
  if (/^B[12]/i.test(raw)) return `مستوى لغوي ${raw}`;
  if (/^C[12]/i.test(raw)) return `مستوى لغوي ${raw}`;
  return containsArabic(raw) ? raw : 'مستوى مسجل في المصدر';
}

export function getCourseDuration(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['duration', 'studyDuration', 'courseDuration', 'metadata.studyDuration']) || 'غير محددة').trim();
}

export function getDirectCourseUrl(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['directUrl', 'directCourseUrl', 'externalCourseUrl', 'courseUrl']) || '').trim();
}

export function getOfficialSourceUrl(course: ImportedCourseRecord): string {
  return String(firstValue(course, ['officialSourceUrl', 'sourceUrl', 'providerSourceUrl']) || '').trim();
}

export function getCourseTopics(course: ImportedCourseRecord): string[] {
  const value = firstValue(course, ['shortCourseTopics', 'shortTopics', 'courseTopics', 'topics', 'metadata.shortCourseTopics']);
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[•|;,]/).map(v => v.trim()).filter(Boolean);
  return [];
}

export function getLinkedSkills(course: ImportedCourseRecord): string[] {
  const value = firstValue(course, ['linkedSkills', 'acquiredSkills', 'skills', 'metadata.skills']);
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return value.split(/[•|;,]/).map(v => v.trim()).filter(Boolean);
  return [];
}

export function getLinkedMajors(course: ImportedCourseRecord): string[] {
  const value = firstValue(course, ['linkedMajors', 'relatedMajorsOrFields', 'majors', 'metadata.linkedMajors']);
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return value.split(/[•|;,]/).map(v => v.trim()).filter(Boolean);
  return [];
}

export function deriveCourseSpecialty(course: ImportedCourseRecord): string {
  const explicit = String(firstValue(course, ['specialtyAr', 'categoryAr']) || '').trim();
  if (explicit && containsArabic(explicit)) return explicit;

  const text = [
    firstValue(course, ['category']),
    getOriginalCourseTitle(course),
    ...getCourseTopics(course),
    ...getLinkedSkills(course),
    ...getLinkedMajors(course),
  ].filter(Boolean).join(' ').toLowerCase();

  for (const [label, keywords] of SPECIALTY_RULES) {
    if (keywords.some(keyword => text.includes(keyword))) return label;
  }
  return 'أخرى';
}

export function deriveCourseType(course: ImportedCourseRecord): string {
  const explicit = String(firstValue(course, ['courseTypeAr', 'courseType']) || '').trim();
  if (explicit && containsArabic(explicit)) return explicit;

  const title = getOriginalCourseTitle(course).toLowerCase();
  if (/specialization|learning path|pathway|professional certificate/.test(title)) return 'مسار تعليمي';
  if (/certification exam|certificate exam|exam.*certif/.test(title)) return 'اختبار شهادة';
  if (/certification|credential program/.test(title)) return 'دورة اعتماد أو شهادة';
  if (/bootcamp/.test(title)) return 'معسكر تدريبي';
  if (/\b(project|lab|workshop)\b/.test(title)) return 'مشروع أو مختبر';
  return 'دورة تدريبية';
}

export function getMissingFieldsCount(course: ImportedCourseRecord): number {
  const value = firstValue(course, ['missingFieldsCount']);
  if (typeof value === 'number') return value;
  if (Array.isArray(course.missingFields)) return course.missingFields.length;
  return 0;
}

export function getMissingFields(course: ImportedCourseRecord): string[] {
  if (Array.isArray(course.missingFields)) return course.missingFields.map(String);
  return [];
}

export function formatYesNo(value: boolean | null): string {
  if (value === true) return 'نعم';
  if (value === false) return 'لا';
  return 'غير محدد';
}

export function formatDateTime(value?: string | null): string {
  if (!value) return 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
