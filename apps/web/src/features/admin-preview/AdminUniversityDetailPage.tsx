import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, AlertCircle, Edit3, X, 
  Save, Eye, ExternalLink, Info, MapPin, Globe, Building2, BookOpen, Clock, Loader2, Send, Check
} from 'lucide-react';

// Demo Record
const DEMO_RECORD = {
  id: 'demo-qu-0001',
  
  // Phase 0 fields
  referenceId: 'INS-QAT-0001',
  nationalCode: '',
  englishName: 'Qatar University',
  localName: 'جامعة قطر',
  country: 'Qatar',
  iso3: 'QAT',
  city: 'Doha',
  institutionType: 'University',
  ownership: 'Public',
  status: 'PUBLISHED',
  officialWebsite: 'https://www.qu.edu.qa/',
  officialSource: 'https://www.edu.gov.qa/',
  
  // Phase 1 fields
  importRefId: 'INS-QAT-0001',
  importOriginalName: 'Qatar University',
  importCountry: 'Qatar',
  importIso3: 'QAT',
  importCity: 'Doha',
  importInstitutionType: 'University',
  importOwnership: 'Public',
  importWebsite: 'https://www.qu.edu.qa/',
  importSource: '',
  
  verifiedEnglishName: 'Qatar University',
  verifiedLocalName: 'جامعة قطر',
  verifiedAbbreviation: 'QU',
  verifiedInstitutionType: 'University',
  verifiedOwnership: 'Public',
  foundedYear: '1973',
  shortDescription: 'Qatar University is the primary institution of higher education in Qatar.',
  
  continent: 'Asia',
  region: 'Doha Municipality',
  verifiedCity: 'Doha',
  mainCampusAddress: 'University Street, Doha, Qatar',
  mapLink: 'https://maps.google.com/?q=Qatar+University',
  
  verifiedWebsite: 'https://www.qu.edu.qa/',
  websiteStatus: 'Active',
  websiteSource: 'Official',
  applicationPortal: 'https://mybanner.qu.edu.qa/',
  governmentRegistry: '',
  governmentEntityName: 'Ministry of Education and Higher Education',
  universitySystem: '',
  centralAdmission: '',
  trustedDirectory: 'https://www.whed.net/',
  externalId: 'QA-001',
  primarySourceType: 'Government',
  primarySourceLink: 'https://www.edu.gov.qa/',
  
  officialPhone: '+974 4403 3333',
  socialMediaLink: 'https://twitter.com/QatarUniversity',
  
  importContinentFile: 'asia_universities.csv',
  importBatch: 'Batch-2023-11',
  importDate: '2023-11-15',
  lastVerificationDate: '2023-12-01',
  phase1CompletionStatus: 'Complete',
  reviewStatus: 'READY_TO_PUBLISH',
  duplicationStatus: 'Clean',
  dataConfidence: 'High',
  reviewNotes: 'Verified against ministry records. All good.',
  
  // Phase 3 fields
  availableDegrees: [],
  colleges: [],
  instructionLanguages: [],
  studyModes: [],
  officialProgramsDirectory: '',
  importantMajors: [],
  
  acceptsInternationalStudents: null,
  bachelorAdmissionsUrl: '',
  graduateAdmissionsUrl: '',
  internationalAdmissionsUrl: '',
  officialApplicationPortalUrl: '',
  
  hasLanguageRequirements: null,
  requiredLanguages: [],
  acceptedLanguageTests: [],
  languageRequirementsUrl: '',
  
  hasInternationalScholarships: null,
  internationalScholarships: [],
  
  // Phase 4 fields
  annualTuitionFees: '',
  hasMedicineBachelor: true,
  medicineBachelorTuition: '',
  hasEngineeringTuition: true,
  engineeringTuition: [],
  graduateTuition: '',
  tuitionCurrency: '',
  tuitionUrl: '',
  
  housingAvailable: null,
  housingInternationalEligibility: null,
  housingCost: '',
  housingCurrency: '',
  
  livingCost: '',
  livingCostCurrency: '',
  livingCostNote: '',
  
  generalRequiredDocuments: [],
  graduateRequiredDocuments: [],
  requiredDocumentsUrl: '',

  // Phase 5 fields
  rankings: [
    { provider: 'QS', year: '', globalRank: '', subjectRank: '', sourceUrl: '', verifiedAt: '' },
    { provider: 'THE', year: '', globalRank: '', subjectRank: '', sourceUrl: '', verifiedAt: '' },
    { provider: 'ARWU', year: '', globalRank: '', subjectRank: '', sourceUrl: '', verifiedAt: '' },
  ],
};

const PHASE_0_FIELDS = [
  { section: 'الهوية', fields: [
    { key: 'referenceId', label: 'معرف الجامعة المرجعي', type: 'text' },
    { key: 'nationalCode', label: 'الرمز الوطني', type: 'text' },
    { key: 'englishName', label: 'الاسم الرسمي بالإنجليزية', type: 'text' },
    { key: 'localName', label: 'الاسم المحلي', type: 'text' },
  ]},
  { section: 'الموقع', fields: [
    { key: 'country', label: 'الدولة', type: 'text' },
    { key: 'iso3', label: 'رمز الدولة ISO3', type: 'text' },
    { key: 'city', label: 'المدينة', type: 'text' },
  ]},
  { section: 'معلومات المؤسسة', fields: [
    { key: 'institutionType', label: 'نوع المؤسسة', type: 'select', options: ['University', 'College', 'Institute', 'Academy', 'Other'] },
    { key: 'ownership', label: 'الملكية', type: 'select', options: ['Public', 'Private', 'Non-profit', 'Other'] },
    { key: 'status', label: 'الحالة', type: 'select', options: ['PUBLISHED', 'ARCHIVED', 'READY_TO_REVIEW', 'READY_TO_PUBLISH'] },
  ]},
  { section: 'الروابط الرسمية', fields: [
    { key: 'officialWebsite', label: 'الموقع الرسمي', type: 'url' },
    { key: 'officialSource', label: 'المصدر الرسمي', type: 'url' },
  ]}
];

const PHASE_1_FIELDS = [
  { section: 'البيانات الأصلية المستوردة', fields: [
    { key: 'importRefId', label: 'معرف الجامعة المرجعي', type: 'text' },
    { key: 'importOriginalName', label: 'الاسم الأصلي المستورد', type: 'text' },
    { key: 'importCountry', label: 'الدولة', type: 'text' },
    { key: 'importIso3', label: 'رمز الدولة ISO3', type: 'text' },
    { key: 'importCity', label: 'المدينة', type: 'text' },
    { key: 'importInstitutionType', label: 'نوع المؤسسة الأصلي', type: 'text' },
    { key: 'importOwnership', label: 'الملكية الأصلية', type: 'text' },
    { key: 'importWebsite', label: 'رابط الموقع الأصلي', type: 'url' },
    { key: 'importSource', label: 'رابط المصدر الأصلي', type: 'url' },
  ]},
  { section: 'الهوية المتحقق منها', fields: [
    { key: 'verifiedEnglishName', label: 'الاسم الرسمي بالإنجليزية', type: 'text' },
    { key: 'verifiedLocalName', label: 'الاسم الرسمي باللغة المحلية', type: 'text' },
    { key: 'verifiedAbbreviation', label: 'الاختصار الرسمي', type: 'text' },
    { key: 'verifiedInstitutionType', label: 'نوع المؤسسة المتحقق منه', type: 'text' },
    { key: 'verifiedOwnership', label: 'الملكية المتحقق منها', type: 'text' },
    { key: 'foundedYear', label: 'سنة التأسيس', type: 'number' },
    { key: 'shortDescription', label: 'الوصف المختصر', type: 'textarea' },
  ]},
  { section: 'الموقع المتحقق منه', fields: [
    { key: 'continent', label: 'القارة', type: 'select', options: ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania'] },
    { key: 'region', label: 'الولاية أو المنطقة', type: 'text' },
    { key: 'verifiedCity', label: 'المدينة المتحقق منها', type: 'text' },
    { key: 'mainCampusAddress', label: 'عنوان الحرم الرئيسي', type: 'text' },
    { key: 'mapLink', label: 'رابط الخريطة', type: 'url' },
  ]},
  { section: 'الموقع والمصادر الرسمية', fields: [
    { key: 'verifiedWebsite', label: 'رابط الموقع الرسمي', type: 'url' },
    { key: 'websiteStatus', label: 'حالة الموقع الرسمي', type: 'select', options: ['Active', 'Inactive', 'Redirected'] },
    { key: 'websiteSource', label: 'مصدر الموقع الرسمي', type: 'select', options: ['Official', 'Secondary', 'Manual'] },
    { key: 'applicationPortal', label: 'رابط بوابة التقديم الرسمية', type: 'url' },
    { key: 'governmentRegistry', label: 'رابط السجل الحكومي', type: 'url' },
    { key: 'governmentEntityName', label: 'اسم الجهة الحكومية', type: 'text' },
    { key: 'universitySystem', label: 'رابط نظام الجامعة', type: 'url' },
    { key: 'centralAdmission', label: 'رابط بوابة القبول المركزية', type: 'url' },
    { key: 'trustedDirectory', label: 'رابط دليل دولي موثوق', type: 'url' },
    { key: 'externalId', label: 'المعرف الخارجي للمؤسسة', type: 'text' },
    { key: 'primarySourceType', label: 'نوع المصدر الأساسي', type: 'select', options: ['Government', 'University', 'International', 'Other'] },
    { key: 'primarySourceLink', label: 'رابط المصدر الأساسي', type: 'url' },
  ]},
  { section: 'التواصل الرسمي', fields: [
    { key: 'officialPhone', label: 'الهاتف الرسمي', type: 'text' },
    { key: 'socialMediaLink', label: 'رابط وسيلة التواصل الاجتماعي الرسمية الرئيسية', type: 'url' },
  ]},
  { section: 'معلومات الاستيراد والمراجعة', fields: [
    { key: 'importContinentFile', label: 'ملف القارة المستورد', type: 'text' },
    { key: 'importBatch', label: 'دفعة الاستيراد', type: 'text' },
    { key: 'importDate', label: 'تاريخ الاستيراد', type: 'date' },
    { key: 'lastVerificationDate', label: 'تاريخ آخر تحقق', type: 'date' },
    { key: 'phase1CompletionStatus', label: 'حالة اكتمال المرحلة الثانية', type: 'select', options: ['Complete', 'Incomplete'] },
    { key: 'reviewStatus', label: 'حالة المراجعة', type: 'select', options: ['READY_TO_REVIEW', 'READY_TO_PUBLISH', 'PUBLISHED', 'ARCHIVED'] },
    { key: 'duplicationStatus', label: 'حالة فحص التكرار', type: 'select', options: ['Clean', 'Duplicate', 'Possible Duplicate'] },
    { key: 'dataConfidence', label: 'درجة الثقة بالبيانات', type: 'select', options: ['High', 'Medium', 'Low'] },
    { key: 'reviewNotes', label: 'ملاحظات المراجعة', type: 'textarea' },
  ]},
];


const PHASE_3_SECTIONS = [
  { section: 'التعريف', fields: [
    { key: 'referenceId', label: 'معرف الجامعة المرجعي', type: 'readonly-text' },
  ]},
  { section: 'الدراسة والبرامج', fields: [
    { key: 'availableDegrees', label: 'الدرجات المتاحة', type: 'tags' },
    { key: 'colleges', label: 'الكليات', type: 'tags' },
    { key: 'instructionLanguages', label: 'لغات التدريس', type: 'tags' },
    { key: 'studyModes', label: 'أنماط الدراسة', type: 'tags' },
    { key: 'officialProgramsDirectory', label: 'رابط دليل البرامج الرسمي', type: 'url' },
    { key: 'importantMajors', label: 'أهم التخصصات', type: 'tags', max: 8 },
  ]},
  { section: 'القبول', fields: [
    { key: 'acceptsInternationalStudents', label: 'هل تقبل طلاباً دوليين؟', type: 'yes-no' },
    { key: 'bachelorAdmissionsUrl', label: 'رابط قبول البكالوريوس', type: 'url' },
    { key: 'graduateAdmissionsUrl', label: 'رابط قبول الدراسات العليا', type: 'url' },
    { key: 'internationalAdmissionsUrl', label: 'رابط قبول الطلاب الدوليين', type: 'url', dependsOn: { key: 'acceptsInternationalStudents', value: true } },
    { key: 'officialApplicationPortalUrl', label: 'رابط بوابة التقديم الرسمية', type: 'url' },
  ]},
  { section: 'متطلبات اللغة', fields: [
    { key: 'hasLanguageRequirements', label: 'هل توجد متطلبات لغة؟', type: 'yes-no' },
    { key: 'requiredLanguages', label: 'اللغات المطلوبة', type: 'tags', dependsOn: { key: 'hasLanguageRequirements', value: true } },
    { key: 'acceptedLanguageTests', label: 'اختبارات اللغة المقبولة', type: 'tags', dependsOn: { key: 'hasLanguageRequirements', value: true } },
    { key: 'languageRequirementsUrl', label: 'رابط متطلبات اللغة الرسمي', type: 'url', dependsOn: { key: 'hasLanguageRequirements', value: true } },
  ]},
  { section: 'منح الطلاب الدوليين', fields: [
    { key: 'hasInternationalScholarships', label: 'هل توجد منح للطلاب الدوليين؟', type: 'yes-no' },
    { key: 'internationalScholarships', label: 'تفاصيل أهم المنح للطلاب الدوليين', type: 'scholarships', dependsOn: { key: 'hasInternationalScholarships', value: true } },
  ]}
];




const PHASE_4_SECTIONS = [
  { section: 'التعريف', fields: [
    { key: 'referenceId', label: 'معرف الجامعة المرجعي', type: 'readonly-text' },
  ]},
  { section: 'الرسوم الدراسية', fields: [
    { key: 'annualTuitionFees', label: 'الرسوم الدراسية للعام', type: 'number' },
    { key: 'medicineBachelorTuition', label: 'رسوم بكالوريوس الطب، إن وجد', type: 'medicine-tuition' },
    { key: 'engineeringTuition', label: 'رسوم بكالوريوس التخصصات الهندسية حسب الكلية', type: 'engineering-tuition' },
    { key: 'graduateTuition', label: 'رسوم الدراسات العليا', type: 'number' },
    { key: 'tuitionCurrency', label: 'العملة', type: 'select', options: ['QAR', 'USD', 'EUR', 'GBP', 'SAR', 'AED'] },
    { key: 'tuitionUrl', label: 'رابط الرسوم الدراسية', type: 'url' },
  ]},
  { section: 'السكن الجامعي', fields: [
    { key: 'housingAvailable', label: 'هل السكن الجامعي متاح؟', type: 'yes-no' },
    { key: 'housingInternationalEligibility', label: 'هل الطلاب الدوليون مؤهلون للسكن؟', type: 'yes-no', dependsOn: { key: 'housingAvailable', value: true } },
    { key: 'housingCost', label: 'تكلفة السكن النموذجية', type: 'number', dependsOn: { key: 'housingAvailable', value: true } },
    { key: 'housingCurrency', label: 'عملة تكلفة السكن', type: 'select', options: ['QAR', 'USD', 'EUR', 'GBP', 'SAR', 'AED'], dependsOn: { key: 'housingAvailable', value: true } },
  ]},
  { section: 'تكاليف المعيشة', fields: [
    { key: 'livingCost', label: 'متوسط تكلفة المعيشة الشهرية', type: 'number' },
    { key: 'livingCostCurrency', label: 'العملة', type: 'select', options: ['QAR', 'USD', 'EUR', 'GBP', 'SAR', 'AED'] },
    { key: 'livingCostNote', label: 'ملاحظة اختلاف التكاليف', type: 'textarea' },
  ]},
  { section: 'الوثائق المطلوبة', fields: [
    { key: 'generalRequiredDocuments', label: 'الوثائق العامة المطلوبة', type: 'tags' },
    { key: 'graduateRequiredDocuments', label: 'المتطلبات الإضافية للدراسات العليا', type: 'tags' },
    { key: 'requiredDocumentsUrl', label: 'رابط الوثائق المطلوبة الرسمي', type: 'url' },
  ]}
];

const PHASE_5_SECTIONS = [
  { section: 'التصنيفات العالمية الثلاثة', fields: [
    { key: 'rankings', label: 'QS وTHE وARWU (Shanghai)', type: 'global-rankings' },
  ]},
];

const RANKING_LABELS: Record<string, string> = {
  QS: 'QS World University Rankings',
  THE: 'Times Higher Education (THE)',
  ARWU: 'Academic Ranking of World Universities (Shanghai)',
};

const GlobalRankingsInput = ({ value = [], onChange, disabled = false }: any) => {
  const providers = ['QS', 'THE', 'ARWU'];
  const rows = providers.map((provider) => value.find((item: any) => item.provider === provider) ?? {
    provider, year: '', globalRank: '', subjectRank: '', sourceUrl: '', verifiedAt: '',
  });
  const update = (provider: string, key: string, nextValue: string) => {
    onChange(rows.map((row: any) => row.provider === provider ? { ...row, [key]: nextValue } : row));
  };

  return (
    <div className="space-y-3">
      {rows.map((row: any) => (
        <div key={row.provider} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 text-sm font-black text-slate-900">{RANKING_LABELS[row.provider]}</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
            <input disabled={disabled} type="number" min="2000" max="2100" value={row.year} onChange={(event) => update(row.provider, 'year', event.target.value)} placeholder="السنة" className="rounded-md border border-slate-300 p-2 text-sm" />
            <input disabled={disabled} value={row.globalRank} onChange={(event) => update(row.provider, 'globalRank', event.target.value)} placeholder="الترتيب العالمي" className="rounded-md border border-slate-300 p-2 text-sm" />
            <input disabled={disabled} value={row.subjectRank} onChange={(event) => update(row.provider, 'subjectRank', event.target.value)} placeholder="الترتيب حسب التخصص (اختياري)" className="rounded-md border border-slate-300 p-2 text-sm" />
            <input disabled={disabled} type="url" value={row.sourceUrl} onChange={(event) => update(row.provider, 'sourceUrl', event.target.value)} placeholder="رابط المصدر الرسمي" className="rounded-md border border-slate-300 p-2 text-sm" />
            <input disabled={disabled} type="date" value={row.verifiedAt} onChange={(event) => update(row.provider, 'verifiedAt', event.target.value)} aria-label="تاريخ التحقق" className="rounded-md border border-slate-300 p-2 text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
};


const TagInput = ({ value = [], onChange, max = Infinity, disabled = false }: any) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && value.length < max && !value.includes(val)) {
        onChange([...(value || []), val]);
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-wrap gap-2">
        {value?.map((tag: string) => (
          <span key={tag} className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded-md text-sm">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {value?.length < max && (
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder={value?.length === 0 ? "اضغط Enter لإضافة عنصر" : "أضف المزيد..."}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900"
        />
      )}
    </div>
  );
};

const YesNoControl = ({ value, onChange, disabled = false }: any) => {
  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors border ${value === true ? 'bg-[#0F4B3A] text-white border-[#0F4B3A]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
      >
        نعم
      </button>
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors border ${value === false ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
      >
        لا
      </button>
    </div>
  );
};

const ScholarshipsInput = ({ value = [], onChange, disabled = false }: any) => {
  const addScholarship = () => {
    onChange([...value, { name: '', url: '' }]);
  };
  
  const updateScholarship = (index: number, key: string, val: string) => {
    const newScholarships = [...value];
    newScholarships[index][key] = val;
    onChange(newScholarships);
  };
  
  const removeScholarship = (index: number) => {
    const newScholarships = [...value];
    newScholarships.splice(index, 1);
    onChange(newScholarships);
  };
  
  return (
    <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {value.map((sch: any, idx: number) => (
        <div key={idx} className="flex flex-col md:flex-row gap-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
          <input 
            type="text" 
            placeholder="اسم المنحة أو نوعها" 
            value={sch.name} 
            onChange={(e) => updateScholarship(idx, 'name', e.target.value)}
            className="w-full md:w-1/2 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900"
          />
          <input 
            type="url" 
            placeholder="رابط المنحة الرسمي" 
            value={sch.url} 
            onChange={(e) => updateScholarship(idx, 'url', e.target.value)}
            className="w-full md:w-1/2 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900"
          />
          <button onClick={() => removeScholarship(idx)} className="mt-2 md:mt-2 text-rose-500 hover:text-rose-700 shrink-0 self-end md:self-auto p-1 bg-white border border-rose-200 rounded-md transition-colors shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={addScholarship} className="self-start text-sm font-bold text-[#0F4B3A] hover:text-[#0a3327] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors">
        + إضافة منحة
      </button>
    </div>
  );
};



const MedicineTuitionInput = ({ value, hasMedicine, onChangeValue, onChangeHasMedicine, disabled = false }: any) => {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input 
          type="checkbox" 
          checked={!hasMedicine} 
          onChange={(e) => onChangeHasMedicine(!e.target.checked)} 
          className="rounded border-slate-300 text-[#0F4B3A] focus:ring-[#0F4B3A]"
        />
        لا يوجد بكالوريوس طب
      </label>
      <input 
        type="text" 
        placeholder="رسوم بكالوريوس الطب" 
        value={value || ''} 
        onChange={(e) => onChangeValue(e.target.value)}
        disabled={!hasMedicine || disabled}
        className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
};

const EngineeringTuitionInput = ({ value = [], hasEngineering, onChangeValue, onChangeHasEngineering, disabled = false }: any) => {
  const addEntry = () => {
    onChangeValue([...value, { college: '', fee: '' }]);
  };
  
  const updateEntry = (index: number, key: string, val: string) => {
    const newEntries = [...value];
    newEntries[index][key] = val;
    onChangeValue(newEntries);
  };
  
  const removeEntry = (index: number) => {
    const newEntries = [...value];
    newEntries.splice(index, 1);
    onChangeValue(newEntries);
  };
  
  return (
    <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input 
          type="checkbox" 
          checked={!hasEngineering} 
          onChange={(e) => onChangeHasEngineering(!e.target.checked)} 
          className="rounded border-slate-300 text-[#0F4B3A] focus:ring-[#0F4B3A]"
        />
        لا توجد تخصصات هندسية
      </label>
      
      {hasEngineering && (
        <div className="flex flex-col gap-3">
          {value.map((entry: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row gap-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input 
                type="text" 
                placeholder="اسم الكلية" 
                value={entry.college} 
                onChange={(e) => updateEntry(idx, 'college', e.target.value)}
                className="w-full md:w-1/2 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900"
              />
              <input 
                type="text" 
                placeholder="قيمة الرسوم" 
                value={entry.fee} 
                onChange={(e) => updateEntry(idx, 'fee', e.target.value)}
                className="w-full md:w-1/2 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900"
              />
              <button onClick={() => removeEntry(idx)} className="mt-2 md:mt-2 text-rose-500 hover:text-rose-700 shrink-0 self-end md:self-auto p-1 bg-white border border-rose-200 rounded-md transition-colors shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addEntry} className="self-start text-sm font-bold text-[#0F4B3A] hover:text-[#0a3327] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors">
            + إضافة كلية
          </button>
        </div>
      )}
    </div>
  );
};


export function AdminUniversityDetailPage() {
  const readOnlyReadinessPreview = true;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(DEMO_RECORD);
  const [editData, setEditData] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'phase0' | 'phase1' | 'phase3' | 'phase4' | 'phase5'>('phase0');
  const [isEditing, setIsEditing] = useState(false);
  
  // Dialog states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');

  // Fallback if not demo record
  useEffect(() => {
    if (id !== 'demo-qu-0001') {
      setData({...DEMO_RECORD, id: id || 'demo-qu-0001'});
    }
  }, [id]);

  const handleEditClick = () => {
    setEditData({ ...data });
    setIsEditing(true);
  };

  const handleCancelEditClick = () => {
    setConfirmTitle('إلغاء التعديلات');
    setConfirmMessage('هل أنت متأكد من إلغاء كافة التعديلات غير المحفوظة؟');
    setConfirmAction(() => () => {
      setIsEditing(false);
      setEditData(null);
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleSaveClick = () => {
    setConfirmTitle('حفظ التعديلات');
    setConfirmMessage('هل أنت متأكد من حفظ التعديلات على بيانات هذه الجامعة؟');
    setConfirmAction(() => () => {
      setData({ ...editData });
      setIsEditing(false);
      setEditData(null);
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handlePublishClick = () => {
    setConfirmTitle('نشر الجامعة');
    setConfirmMessage('هل أنت متأكد من نشر هذه الجامعة لتصبح مرئية في المنصة؟');
    setConfirmAction(() => () => {
      setData({ ...data, status: 'PUBLISHED' });
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleUnpublishClick = () => {
    setConfirmTitle('إلغاء النشر');
    setConfirmMessage('هل أنت متأكد من إلغاء نشر هذه الجامعة؟ سيتم إخفاؤها من المنصة العامة.');
    setConfirmAction(() => () => {
      setData({ ...data, status: 'ARCHIVED' });
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleReviewClick = () => {
    setConfirmTitle('إرسال للمراجعة');
    setConfirmMessage('هل أنت متأكد من إرسال هذه الجامعة للمراجعة؟');
    setConfirmAction(() => () => {
      setData({ ...data, reviewStatus: 'READY_TO_REVIEW' });
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleApproveClick = () => {
    setConfirmTitle('اعتماد');
    setConfirmMessage('هل أنت متأكد من اعتماد هذه الجامعة؟ ستكون جاهزة للنشر.');
    setConfirmAction(() => () => {
      setData({ ...data, reviewStatus: 'READY_TO_PUBLISH' });
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const calculateCompletion = (sections: any[]) => {
    let total = 0;
    let completed = 0;
    sections.forEach(sec => {
      sec.fields.forEach((f: any) => {
        total++;
        if (data[f.key] && data[f.key].toString().trim() !== '') {
          completed++;
        }
      });
    });
    return {
      completed,
      total,
      missing: total - completed,
      status: completed === total ? 'مكتملة' : completed > 0 ? 'تحتاج مراجعة' : 'غير مكتملة'
    };
  };

  
  const calculatePhase3Completion = () => {
    let total = 18;
    let completed = 0;
    
    // 1
    if (data.referenceId) completed++;
    
    // 2-7
    if (data.availableDegrees?.length > 0) completed++;
    if (data.colleges?.length > 0) completed++;
    if (data.instructionLanguages?.length > 0) completed++;
    if (data.studyModes?.length > 0) completed++;
    if (data.officialProgramsDirectory) completed++;
    if (data.importantMajors?.length > 0) completed++;
    
    // 8
    if (data.acceptsInternationalStudents === true || data.acceptsInternationalStudents === false) completed++;
    
    // 9-12
    if (data.bachelorAdmissionsUrl) completed++;
    if (data.graduateAdmissionsUrl) completed++;
    if (data.officialApplicationPortalUrl) completed++;
    
    if (data.acceptsInternationalStudents === false) {
      completed++; 
    } else {
      if (data.internationalAdmissionsUrl) completed++;
    }
    
    // 13
    if (data.hasLanguageRequirements === true || data.hasLanguageRequirements === false) completed++;
    
    // 14-16
    if (data.hasLanguageRequirements === false) {
      completed += 3;
    } else {
      if (data.requiredLanguages?.length > 0) completed++;
      if (data.acceptedLanguageTests?.length > 0) completed++;
      if (data.languageRequirementsUrl) completed++;
    }
    
    // 17
    if (data.hasInternationalScholarships === true || data.hasInternationalScholarships === false) completed++;
    
    // 18
    if (data.hasInternationalScholarships === false) {
      completed++;
    } else {
      if (data.internationalScholarships?.length > 0 && data.internationalScholarships.some((s: any) => s.name || s.url)) completed++;
    }

    return {
      completed,
      total,
      missing: total - completed,
      status: completed === total ? 'مكتملة' : completed > 0 ? 'تحتاج مراجعة' : 'غير مكتملة'
    };
  };

  
  const calculatePhase4Completion = () => {
    let total = 17;
    let completed = 0;
    
    // 1
    if (data.referenceId) completed++;
    
    // 2-7
    if (data.annualTuitionFees !== '' && data.annualTuitionFees !== null) completed++;
    
    if (data.hasMedicineBachelor === false) {
      completed++;
    } else {
      if (data.medicineBachelorTuition !== '' && data.medicineBachelorTuition !== null) completed++;
    }

    if (data.hasEngineeringTuition === false) {
      completed++;
    } else {
      if (data.engineeringTuition?.length > 0 && data.engineeringTuition.some((e: any) => e.college || e.fee)) completed++;
    }
    
    if (data.graduateTuition !== '' && data.graduateTuition !== null) completed++;
    if (data.tuitionCurrency) completed++;
    if (data.tuitionUrl) completed++;
    
    // 8-11
    if (data.housingAvailable === true || data.housingAvailable === false) completed++;
    
    if (data.housingAvailable === false) {
      completed += 3;
    } else {
      if (data.housingInternationalEligibility === true || data.housingInternationalEligibility === false) completed++;
      if (data.housingCost !== '' && data.housingCost !== null) completed++;
      if (data.housingCurrency) completed++;
    }
    
    // 12-14
    if (data.livingCost !== '' && data.livingCost !== null) completed++;
    if (data.livingCostCurrency) completed++;
    if (data.livingCostNote) completed++;
    
    // 15-17
    if (data.generalRequiredDocuments?.length > 0) completed++;
    if (data.graduateRequiredDocuments?.length > 0) completed++;
    if (data.requiredDocumentsUrl) completed++;
    
    return {
      completed,
      total,
      missing: total - completed,
      status: completed === total ? 'مكتملة' : completed > 0 ? 'تحتاج مراجعة' : 'غير مكتملة'
    };
  };

  const phase0Stats = calculateCompletion(PHASE_0_FIELDS);
  const phase1Stats = calculateCompletion(PHASE_1_FIELDS);
  const phase3Stats = calculatePhase3Completion();
  const phase4Stats = calculatePhase4Completion();
  const phase5Stats = (() => {
    const rows = Array.isArray(data.rankings) ? data.rankings : [];
    const completed = ['QS', 'THE', 'ARWU'].filter((provider) => {
      const row = rows.find((item: any) => item.provider === provider);
      return row?.year && row?.globalRank && row?.sourceUrl && row?.verifiedAt;
    }).length;
    return {
      completed,
      total: 3,
      missing: 3 - completed,
      status: completed === 3 ? 'مكتملة' : completed > 0 ? 'تحتاج مراجعة' : 'غير مكتملة',
    };
  })();



  const getStatusColor = (status: string) => {
    if (status === 'مكتملة') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'تحتاج مراجعة') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

    const renderField = (field: any, val: any, onChange: (val: any) => void) => {
    const isDependsDisabled = field.dependsOn && data[field.dependsOn.key] !== field.dependsOn.value;
    
    if (!isEditing) {
      if (isDependsDisabled) return <span className="text-slate-400 text-sm italic">غير منطبق</span>;
      
      
      if (field.type === 'medicine-tuition') {
        if (data.hasMedicineBachelor === false) return <span className="text-slate-400 text-sm italic">لا يوجد بكالوريوس طب</span>;
        if (!val) return <span className="text-slate-400 text-sm italic">غير متوفر</span>;
        return <span className="text-slate-900 text-sm font-medium">{val} {data.tuitionCurrency}</span>;
      }

      if (field.type === 'engineering-tuition') {
        if (data.hasEngineeringTuition === false) return <span className="text-slate-400 text-sm italic">لا توجد تخصصات هندسية</span>;
        if (!val || val.length === 0 || (val.length === 1 && !val[0].college && !val[0].fee)) return <span className="text-slate-400 text-sm italic">غير متوفر</span>;
        return (
          <div className="flex flex-col gap-2">
            {val.map((entry: any, idx: number) => (
              entry.college || entry.fee ? (
                <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="text-sm font-bold text-slate-800">{entry.college || '-'}</span>
                  <span className="text-sm font-medium text-slate-600">{entry.fee ? `${entry.fee} ${data.tuitionCurrency || ''}` : '-'}</span>
                </div>
              ) : null
            ))}
          </div>
        );
      }
      
      // Handle numeric with currency display
      if (field.type === 'number' && (field.key === 'housingCost' || field.key === 'annualTuitionFees' || field.key === 'graduateTuition' || field.key === 'livingCost')) {
         if (!val) return <span className="text-slate-400 text-sm italic">غير متوفر</span>;
         let currency = '';
         if (field.key.includes('housing')) currency = data.housingCurrency || '';
         else if (field.key.includes('living')) currency = data.livingCostCurrency || '';
         else currency = data.tuitionCurrency || '';
         return <span className="text-slate-900 text-sm font-medium">{val} {currency}</span>;
      }

      
      if (field.type === 'yes-no') {
        if (val === true) return <span className="text-slate-900 text-sm font-medium">نعم</span>;
        if (val === false) {
           if (field.key === 'housingAvailable') return <span className="text-slate-400 text-sm italic">لا يتوفر سكن جامعي</span>;
           return <span className="text-slate-900 text-sm font-medium">لا</span>;
        }
        return <span className="text-slate-400 text-sm italic">غير متوفر</span>;
      }
      
      if (field.type === 'tags') {
        if (!val || val.length === 0) return <span className="text-slate-400 text-sm italic">غير متوفر</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {val.map((tag: string) => (
              <span key={tag} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-xs font-bold">
                {tag}
              </span>
            ))}
          </div>
        );
      }
      
      if (field.type === 'scholarships') {
        if (!val || val.length === 0 || (val.length === 1 && !val[0].name && !val[0].url)) {
          if (data.hasInternationalScholarships === false) {
             return <span className="text-slate-400 text-sm italic">لا توجد منح للطلاب الدوليين</span>;
          }
          return <span className="text-slate-400 text-sm italic">غير متوفر</span>;
        }
        return (
          <div className="flex flex-col gap-2">
            {val.map((sch: any, idx: number) => (
              sch.name || sch.url ? (
                <div key={idx} className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  {sch.name && <span className="text-sm font-bold text-slate-800 mb-1">{sch.name}</span>}
                  {sch.url && (
                    <a href={sch.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {sch.url}
                    </a>
                  )}
                </div>
              ) : null
            ))}
          </div>
        );
      }

      if (field.type === 'global-rankings') {
        const rows = Array.isArray(val) ? val : [];
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {['QS', 'THE', 'ARWU'].map((provider) => {
              const row = rows.find((item: any) => item.provider === provider);
              return (
                <div key={provider} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-black text-slate-900">{RANKING_LABELS[provider]}</div>
                  {row?.globalRank ? (
                    <div className="mt-2 space-y-1 text-xs text-slate-700">
                      <div>السنة: <strong>{row.year || '-'}</strong></div>
                      <div>الترتيب العالمي: <strong>{row.globalRank}</strong></div>
                      {row.subjectRank && <div>حسب التخصص: <strong>{row.subjectRank}</strong></div>}
                      <div>آخر تحقق: <strong>{row.verifiedAt || '-'}</strong></div>
                      {row.sourceUrl && <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline"><ExternalLink className="h-3 w-3" />المصدر الرسمي</a>}
                    </div>
                  ) : <div className="mt-2 text-xs italic text-slate-400">غير متوفر</div>}
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <div className="flex flex-col h-full justify-center min-h-[42px]">
          {val ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-900 text-sm font-medium break-all">{val}</span>
              {field.type === 'url' && (
                <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 shrink-0" title="فتح الرابط">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-sm italic">غير متوفر</span>
          )}
        </div>
      );
    }

    
    if (field.type === 'medicine-tuition') {
      return (
        <MedicineTuitionInput 
          value={val} 
          hasMedicine={data.hasMedicineBachelor}
          onChangeValue={onChange}
          onChangeHasMedicine={(has: boolean) => setData((prev: any) => ({ ...prev, hasMedicineBachelor: has }))}
          disabled={isDependsDisabled} 
        />
      );
    }
    
    if (field.type === 'engineering-tuition') {
      return (
        <EngineeringTuitionInput 
          value={val} 
          hasEngineering={data.hasEngineeringTuition}
          onChangeValue={onChange}
          onChangeHasEngineering={(has: boolean) => setData((prev: any) => ({ ...prev, hasEngineeringTuition: has }))}
          disabled={isDependsDisabled} 
        />
      );
    }

    if (field.type === 'readonly-text') {
      return (
        <div className="w-full p-2 border border-slate-200 bg-slate-50 rounded-md text-sm text-slate-500 font-medium">
          {val || 'غير متوفر'}
        </div>
      );
    }
    
    if (field.type === 'yes-no') {
      return <YesNoControl value={val} onChange={onChange} disabled={isDependsDisabled} />;
    }
    
    if (field.type === 'tags') {
      return <TagInput value={val} onChange={onChange} max={field.max} disabled={isDependsDisabled} />;
    }
    
    if (field.type === 'scholarships') {
      return <ScholarshipsInput value={val} onChange={onChange} disabled={isDependsDisabled} />;
    }

    if (field.type === 'global-rankings') {
      return <GlobalRankingsInput value={val} onChange={onChange} disabled={isDependsDisabled} />;
    }

    if (field.type === 'select') {
      return (
        <select
          value={val || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDependsDisabled}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900 bg-white disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">اختيار...</option>
          {field.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={val || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDependsDisabled}
          rows={3}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
        />
      );
    }

    return (
      <input
        type={field.type === 'url' ? 'url' : field.type === 'number' ? 'text' : field.type === 'date' ? 'date' : 'text'}
        value={val || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDependsDisabled}
        className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
      />
    );
  };

  const renderSections = (sections: any[]) => {
    return sections.map((sec, i) => (
      <div key={i} className="mb-8 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm">{sec.section}</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {sec.fields.map((field: any) => {
              const val = isEditing ? editData[field.key] : data[field.key];
              return (
                <div key={field.key} className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5">{field.label}</label>
                  {renderField(field, val, (newVal) => setEditData({...editData, [field.key]: newVal}))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ));
  };

  const currentStats = activeTab === 'phase0'
    ? phase0Stats
    : activeTab === 'phase1'
      ? phase1Stats
      : activeTab === 'phase3'
        ? phase3Stats
        : activeTab === 'phase4'
          ? phase4Stats
          : phase5Stats;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f8fa] text-slate-900 font-sans pb-20">
      
      {/* Header Sticky Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <button 
                onClick={() => navigate('/admin/universities')}
                className="mt-1 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="العودة إلى الجامعات"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-black text-slate-900">{data.englishName}</h1>
                  <span className="text-sm font-bold text-slate-500 border-r border-slate-300 pr-3">{data.localName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5"/> {data.referenceId}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {data.country}، {data.city}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5"/> {data.status === 'PUBLISHED' ? 'منشورة' : 'غير منشورة'}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1 text-blue-600"><Info className="w-3.5 h-3.5"/> {data.reviewStatus === 'READY_TO_PUBLISH' ? 'جاهزة للاعتماد' : 'بانتظار المراجعة'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isEditing ? (
                <>
                  <button disabled={readOnlyReadinessPreview} onClick={handleReviewClick} className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                    إرسال للمراجعة
                  </button>
                  <button disabled={readOnlyReadinessPreview} onClick={handleApproveClick} className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                    اعتماد
                  </button>
                  {data.status === 'PUBLISHED' ? (
                    <button disabled={readOnlyReadinessPreview} onClick={handleUnpublishClick} className="px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors border border-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
                      إلغاء النشر
                    </button>
                  ) : (
                    <button disabled={readOnlyReadinessPreview} onClick={handlePublishClick} className="px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 disabled:cursor-not-allowed disabled:opacity-50">
                      نشر
                    </button>
                  )}
                  <button disabled={readOnlyReadinessPreview} onClick={handleEditClick} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[#0F4B3A] hover:bg-[#0a3327] rounded-md transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleCancelEditClick} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors">
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                  <button onClick={handleSaveClick} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm">
                    <Save className="w-4 h-4" />
                    حفظ التعديلات
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('phase0')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'phase0' ? 'border-[#0F4B3A] text-[#0F4B3A]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm">المرحلة الأولى: الاستيراد الأساسي</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getStatusColor(phase0Stats.status)}`}>
              {phase0Stats.status}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('phase1')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'phase1' ? 'border-[#0F4B3A] text-[#0F4B3A]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm">المرحلة الثانية: إثراء بيانات الجامعة</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getStatusColor(phase1Stats.status)}`}>
              {phase1Stats.status}
            </span>
          </button>
                  <button
            onClick={() => setActiveTab('phase3')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'phase3' ? 'border-[#0F4B3A] text-[#0F4B3A]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm">المرحلة الثالثة: الدراسة والقبول واللغة والمنح</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getStatusColor(phase3Stats.status)}`}>
              {phase3Stats.status}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('phase4')}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'phase4' ? 'border-[#0F4B3A] text-[#0F4B3A]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm">المرحلة الرابعة: الرسوم والسكن والوثائق</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getStatusColor(phase4Stats.status)}`}>
              {phase4Stats.status}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('phase5')}
            className={`flex shrink-0 items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'phase5' ? 'border-[#0F4B3A] text-[#0F4B3A]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm">المرحلة الخامسة: التصنيفات العالمية</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getStatusColor(phase5Stats.status)}`}>
              {phase5Stats.status}
            </span>
          </button>
        </div>

        {/* Completion Summary */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {activeTab === 'phase0' ? 'المرحلة الأولى: الاستيراد الأساسي' : activeTab === 'phase1' ? 'المرحلة الثانية: الهوية والموقع والمصادر الرسمية (44 حقلًا)' : activeTab === 'phase3' ? 'المرحلة الثالثة: الدراسة والقبول واللغة والمنح' : activeTab === 'phase4' ? 'المرحلة الرابعة: الرسوم والسكن والوثائق' : 'المرحلة الخامسة: التصنيفات العالمية'}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentStats.completed} من {currentStats.total} حقلاً مكتملة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-emerald-600">{currentStats.completed} مكتمل</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-rose-600">{currentStats.missing} ناقص</span>
          </div>
        </div>

        {/* Fields Sections */}
        <div className="space-y-6">
          {activeTab === 'phase0' ? renderSections(PHASE_0_FIELDS) : activeTab === 'phase1' ? renderSections(PHASE_1_FIELDS) : activeTab === 'phase3' ? renderSections(PHASE_3_SECTIONS) : activeTab === 'phase4' ? renderSections(PHASE_4_SECTIONS) : renderSections(PHASE_5_SECTIONS)}
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{confirmMessage}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => confirmAction && confirmAction()}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#0F4B3A] hover:bg-[#0a3327] rounded-lg transition-colors shadow-sm"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
