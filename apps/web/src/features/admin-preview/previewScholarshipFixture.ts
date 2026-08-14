export const PREVIEW_SCHOLARSHIP_ID = 'preview-scholarship-001';

export const previewScholarshipFixture = {
  id: PREVIEW_SCHOLARSHIP_ID,
  publicId: 'SCH-PREVIEW-001',
  displayName: 'منحة جامعة قطر للطلبة الدوليين 2027',
  originalName: 'Qatar University International Students Scholarship 2027',
  sponsorName: 'Qatar University', sponsorNameEn: 'Qatar University', studyCountry: 'قطر', degreeLevel: 'Bachelor',
  fundingCoverage: 'Fully Funded', applicationDeadline: '2027-08-15',
  status: 'READY_TO_REVIEW', completenessStatus: 'complete', missingFields: [],
  translationStatus: 'Verified AR/EN', verificationStatus: 'verified_official', trustScore: 98,
  sourceType: 'PREVIEW_ONLY',
  applicationLink: 'https://www.qu.edu.qa/students/admission/scholarships',
  officialSourceUrl: 'https://www.qu.edu.qa/students/admission/scholarships',
  eligibilityCriteria: 'قبول أكاديمي مستوفٍ لشروط الجامعة، وسجل دراسي متميز، واستيفاء متطلبات البرنامج المختار.',
  requiredDocuments: 'جواز السفر، الشهادة وكشف الدرجات، إثبات اللغة عند طلب البرنامج، والمستندات المحددة في بوابة القبول.',
  eligibleMajorsOrFields: ['الهندسة', 'علوم الحاسب', 'إدارة الأعمال', 'العلوم الصحية'],
  eligibleMajorsByDegree: {
    Bachelor: ['الهندسة', 'علوم الحاسب', 'إدارة الأعمال', 'العلوم الصحية'],
    Master: ['هندسة الحاسب', 'إدارة الأعمال', 'الصحة العامة'],
    PhD: ['الهندسة', 'العلوم الحيوية'],
    Fellowship: ['الزمالات الطبية والبحثية'],
  },
  coverageDetails: 'إعفاء من الرسوم الدراسية، سكن جامعي، تذكرة سفر سنوية، ومخصصات وفق الشروط الرسمية للمنحة.',
  studyLanguage: 'العربية / الإنجليزية', fundingAmount: 'حسب لائحة المنحة', currency: 'QAR',
  duration: 'مدة البرنامج الأكاديمي', duplicateStatus: 'PREVIEW_RECORD', fieldsMerged: [],
  targetUniversityName: 'Qatar University',
  requiredLanguageTests: ['IELTS عند اشتراط البرنامج أو الجامعة', 'TOEFL عند قبوله من البرنامج'],
  benefits: ['الإعفاء الكامل من الرسوم الدراسية', 'السكن الجامعي', 'تذكرة سفر سنوية', 'مخصصات مالية وفق اللائحة'],
  updatedAt: '2026-08-14T00:00:00.000Z',
  importMergeHistory: [{ batchId: 'LOCAL-PREVIEW', timestamp: '2026-08-14 00:00', action: 'Preview fixture loaded', status: 'success' }],
  auditHistory: [{ timestamp: '2026-08-14 00:00', admin: 'Local Preview', action: 'Temporary scholarship created for design review only' }],
};

export const localScholarshipPreviewEnabled = () => import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
