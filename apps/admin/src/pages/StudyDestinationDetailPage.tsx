import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, DollarSign, FileCheck2, FileText, Globe, GraduationCap, Link2, Lock, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/I18nProvider';
import { adminApiClient } from '../api/client';

const API_BASE = '/reference-data';

interface CountryMetadata {
  nameAr?: string; officialNameAr?: string; localName?: string; isoNumeric?: string;
  sourceRegion?: string; capital?: string; officialCurrencies?: string[];
  officialLanguages?: string[]; localLanguages?: string[]; primaryTimezone?: string;
  timezones?: string[]; flag?: string; slug?: string; publicId?: string;
  referenceReviewStatus?: string; sourceAuditDate?: string; referenceSources?: string[]; notes?: string;
  sourceCreatedAt?: string; sourceUpdatedAt?: string;
}

interface Country {
  iso2Code: string; iso3Code: string; name: string; officialName?: string | null;
  region?: string | null; subregion?: string | null; defaultCurrencyCode?: string | null;
  defaultLanguageCode?: string | null; callingCode?: string | null; flagAssetId?: string | null;
  metadata?: CountryMetadata;
}

interface Region { id: string; regionCode: string; name: string; nameAr?: string | null; localName?: string | null; regionType?: string | null; }
interface City { id: string; name: string; region?: string | null; timezone?: string | null; administrativeRegion?: Region | null; }
interface AcademicProgram { sourceProgramName?: string; degreeLevelCanonicalCode?: string; majorId?: string; status?: string; }
interface University { id: string; publicId: string; displayName: string; country?: string; city?: string; institutionType?: string; officialWebsite?: string; status: string; completenessStatus: string; academicPrograms?: AcademicProgram[]; }
interface UniversityResult { data: University[]; total: number; page: number; pageSize: number; totalPages: number; }
interface Scholarship { id: string; displayName: string; sponsorName?: string; studyCountry?: string; applicationDeadline?: string; status: string; completenessStatus: string; }
interface InternationalTestCountryRelationship { countryIso2Code: string; relationshipType: string; notes?: string; }
interface InternationalTest { id: string; publicId?: string; displayName?: string; canonicalName: string; abbreviation?: string; providerName?: string; testCategory?: string; status: string; completenessStatus?: string; countryRelationships?: InternationalTestCountryRelationship[]; }
interface PageResult<T> { data: T[]; total: number; page: number; pageSize?: number; limit?: number; totalPages?: number; }

export function StudyDestinationDetailPage() {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { countryIso2Code } = useParams<{ countryIso2Code: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [universities, setUniversities] = useState<UniversityResult>({ data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 });
  const [scholarships, setScholarships] = useState<PageResult<Scholarship>>({ data: [], total: 0, page: 1 });
  const [internationalTests, setInternationalTests] = useState<PageResult<InternationalTest>>({ data: [], total: 0, page: 1 });
  const [activeTab, setActiveTab] = useState('reference');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!countryIso2Code) return;
    setLoading(true);
    adminApiClient.request<Country>(`${API_BASE}/countries/${countryIso2Code}`).then(async countryResult => {
      const [regionResult, cityResult, universityResult, scholarshipResult, testResult] = await Promise.all([
        adminApiClient.request<{ data: Region[] }>(`${API_BASE}/regions?countryIso2Code=${encodeURIComponent(countryIso2Code)}`).catch(() => ({ data: [] })),
        adminApiClient.request<{ data: City[] }>(`${API_BASE}/cities?countryIso2Code=${encodeURIComponent(countryIso2Code)}`).catch(() => ({ data: [] })),
        adminApiClient.request<UniversityResult>(`/admin/universities?country=${encodeURIComponent(countryResult.name)}&page=1&pageSize=100`).catch(() => ({ data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 })),
        adminApiClient.request<PageResult<Scholarship>>(`/admin/scholarships?country=${encodeURIComponent(countryResult.name)}&page=1&pageSize=100`).catch(() => ({ data: [], total: 0, page: 1 })),
        adminApiClient.request<PageResult<InternationalTest>>(`/admin/international-tests?countryIso2Code=${encodeURIComponent(countryIso2Code)}&page=1&pageSize=100`).catch(() => ({ data: [], total: 0, page: 1 })),
      ]);
      setCountry(countryResult);
      setRegions(regionResult.data || []);
      setCities(cityResult.data || []);
      setUniversities(universityResult);
      setScholarships(scholarshipResult);
      setInternationalTests(testResult);
      setError(false);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [countryIso2Code]);

  if (loading) return <div className="p-8 text-gray-500">{isAr ? 'جاري تحميل ملف الدولة...' : 'Loading country profile...'}</div>;
  if (error || !country) return <div className="p-8 text-red-600">{isAr ? 'تعذر تحميل ملف الدولة من البيانات المرجعية.' : 'Unable to load the country profile.'}</div>;

  const meta = country.metadata ?? {};
  const flag = meta.flag || flagEmoji(country.iso2Code);
  const tabs = [
    ['reference', isAr ? 'البيانات المرجعية' : 'Reference Data', FileText],
    ['locations', isAr ? 'المناطق والمدن' : 'Regions & Cities', MapPin],
    ['universities', isAr ? 'الجامعات' : 'Universities', GraduationCap],
    ['majors', isAr ? 'التخصصات' : 'Majors', BookOpen],
    ['scholarships', isAr ? 'المنح الدراسية' : 'Scholarships', Sparkles],
    ['tests', isAr ? 'الاختبارات الدولية' : 'International Tests', FileCheck2],
    ['visa', isAr ? 'التأشيرة والمتطلبات' : 'Visa & Requirements', FileCheck2],
    ['living', isAr ? 'تكلفة المعيشة' : 'Cost of Living', DollarSign],
    ['official-links', isAr ? 'الروابط الرسمية' : 'Official Links', Link2],
    ['evidence', isAr ? 'الأدلة والمصادر' : 'Evidence & Provenance', Lock],
    ['readiness', isAr ? 'جاهزية الملف' : 'Profile Readiness', AlertCircle],
  ] as const;

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <Link to="/study-destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />{isAr ? 'العودة إلى دول الدراسة' : 'Back to Study Destinations'}
      </Link>

      <header className="bg-slate-950 text-white rounded-2xl p-6 md:p-8 border border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-5xl" aria-hidden>{flag}</span>
          <div>
            <div className="text-xs font-mono text-emerald-300 mb-2">{country.iso2Code} / {country.iso3Code}</div>
            <h1 className="text-3xl font-black">{isAr ? meta.nameAr || country.name : country.name}</h1>
            <p className="text-slate-300 mt-1">{isAr ? meta.officialNameAr || country.officialName : country.officialName || country.name}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] border border-slate-200 rounded-2xl overflow-hidden bg-white min-h-[640px]">
        <nav className="bg-slate-50 border-b lg:border-b-0 lg:border-e border-slate-200 p-2">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded text-start ${activeTab === id ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Icon className="h-4 w-4 shrink-0" />{label}
            </button>
          ))}
        </nav>

        <main className="p-5 md:p-7">
          {activeTab === 'reference' && <ReferencePanel country={country} meta={meta} isAr={isAr} flag={flag} cities={cities.length} regions={regions.length} />}
          {activeTab === 'locations' && <LocationsPanel regions={regions} cities={cities} isAr={isAr} />}
          {activeTab === 'universities' && <UniversitiesPanel result={universities} isAr={isAr} />}
          {activeTab === 'majors' && <CountryMajorsPanel universities={universities.data} isAr={isAr} />}
          {activeTab === 'scholarships' && <ScholarshipsPanel result={scholarships} isAr={isAr} />}
          {activeTab === 'tests' && <InternationalTestsPanel result={internationalTests} isAr={isAr} />}
          {['visa', 'living', 'official-links'].includes(activeTab) && <PendingPanel icon={Globe} title={tabs.find(tab => tab[0] === activeTab)?.[1] ?? ''} text={isAr ? 'هذا القسم غير متاح بعد ولم يتم ادعاء اكتماله.' : 'This section is not configured yet.'} />}
          {activeTab === 'evidence' && <EvidencePanel meta={meta} isAr={isAr} />}
          {activeTab === 'readiness' && <ReadinessPanel meta={meta} isAr={isAr} />}
        </main>
      </div>
    </div>
  );
}

function ReferencePanel({ country, meta, isAr, flag, cities, regions }: { country: Country; meta: CountryMetadata; isAr: boolean; flag: string; cities: number; regions: number }) {
  const fields: Array<[string, unknown]> = [
    [isAr ? 'اسم الدولة بالعربية' : 'Arabic name', meta.nameAr], [isAr ? 'اسم الدولة بالإنجليزية' : 'English name', country.name],
    [isAr ? 'الاسم الرسمي بالعربية' : 'Official Arabic name', meta.officialNameAr], [isAr ? 'الاسم الرسمي بالإنجليزية' : 'Official English name', country.officialName],
    [isAr ? 'الاسم المحلي' : 'Local name', meta.localName], ['ISO Alpha-2', country.iso2Code], ['ISO Alpha-3', country.iso3Code],
    [isAr ? 'رمز ISO الرقمي' : 'ISO numeric', meta.isoNumeric], [isAr ? 'القارة' : 'Continent', country.region],
    [isAr ? 'المنطقة المصدرية' : 'Source region', meta.sourceRegion], [isAr ? 'المنطقة الفرعية' : 'Subregion', country.subregion],
    [isAr ? 'العاصمة' : 'Capital', meta.capital], [isAr ? 'العملة الافتراضية' : 'Default currency', country.defaultCurrencyCode],
    [isAr ? 'العملات الرسمية' : 'Official currencies', meta.officialCurrencies], [isAr ? 'اللغة الافتراضية' : 'Default language', country.defaultLanguageCode],
    [isAr ? 'اللغات الرسمية' : 'Official languages', meta.officialLanguages], [isAr ? 'اللغات المحلية' : 'Local languages', meta.localLanguages],
    [isAr ? 'المنطقة الزمنية الرئيسية' : 'Primary timezone', meta.primaryTimezone], [isAr ? 'المناطق الزمنية' : 'Timezones', meta.timezones],
    [isAr ? 'رمز الاتصال' : 'Calling code', country.callingCode], [isAr ? 'العلم' : 'Flag', flag], [isAr ? 'الرمز اللطيف' : 'Slug', meta.slug],
    [isAr ? 'المعرف العام' : 'Public ID', meta.publicId], [isAr ? 'حالة المراجعة' : 'Review status', meta.referenceReviewStatus],
    [isAr ? 'تاريخ الإنشاء في المصدر' : 'Source created date', meta.sourceCreatedAt], [isAr ? 'آخر تحديث في المصدر' : 'Source updated date', meta.sourceUpdatedAt],
    [isAr ? 'تاريخ تدقيق المصدر' : 'Source audit date', meta.sourceAuditDate], [isAr ? 'المناطق المرتبطة' : 'Linked regions', regions],
    [isAr ? 'المدن المرتبطة' : 'Linked cities', cities], [isAr ? 'ملاحظات' : 'Notes', meta.notes],
  ];
  return <section><SectionTitle>{isAr ? 'البيانات المرجعية للدولة' : 'Country Reference Data'}</SectionTitle><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{fields.map(([label, value]) => <Field key={label} label={label} value={value} />)}</div></section>;
}

function LocationsPanel({ regions, cities, isAr }: { regions: Region[]; cities: City[]; isAr: boolean }) {
  return <section className="space-y-7"><div><SectionTitle>{isAr ? `المناطق الإدارية (${regions.length})` : `Administrative Regions (${regions.length})`}</SectionTitle>{regions.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{regions.map(region => <Field key={region.id} label={`${region.regionCode} · ${region.regionType || '-'}`} value={isAr ? region.nameAr || region.localName || region.name : region.name} />)}</div> : <Empty text={isAr ? 'لا توجد مناطق مرتبطة حاليًا.' : 'No linked regions are available.'} />}</div><div><SectionTitle>{isAr ? `المدن (${cities.length})` : `Cities (${cities.length})`}</SectionTitle>{cities.length ? <div className="overflow-x-auto border border-slate-200 rounded"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-start">{isAr ? 'المدينة' : 'City'}</th><th className="p-3 text-start">{isAr ? 'المنطقة' : 'Region'}</th><th className="p-3 text-start">{isAr ? 'المنطقة الزمنية' : 'Timezone'}</th></tr></thead><tbody className="divide-y">{cities.map(city => <tr key={city.id}><td className="p-3 font-semibold">{city.name}</td><td className="p-3">{city.administrativeRegion?.name || city.region || '-'}</td><td className="p-3 font-mono text-xs">{city.timezone || '-'}</td></tr>)}</tbody></table></div> : <Empty text={isAr ? 'لا توجد مدن مرتبطة حاليًا.' : 'No linked cities are available.'} />}</div></section>;
}

function UniversitiesPanel({ result, isAr }: { result: UniversityResult; isAr: boolean }) {
  return <section><SectionTitle>{isAr ? `الجامعات المرتبطة (${result.total})` : `Linked Universities (${result.total})`}</SectionTitle>{result.data.length ? <div className="space-y-3">{result.data.map(university => <div key={university.id} className="border border-slate-200 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><div className="font-bold text-slate-900">{university.displayName}</div><div className="text-xs text-slate-500 mt-1">{[university.city, university.institutionType, university.publicId].filter(Boolean).join(' · ')}</div></div><div className="flex items-center gap-2"><Status value={university.status} /><Status value={university.completenessStatus} />{university.officialWebsite && <a href={university.officialWebsite} target="_blank" rel="noreferrer" className="text-sm text-blue-700 hover:underline">{isAr ? 'الموقع الرسمي' : 'Official site'}</a>}</div></div>)}</div> : <Empty text={isAr ? 'لا توجد جامعات مستوردة في قاعدة التشغيل لهذه الدولة حتى الآن. ملفات Stage 1 جاهزة للاستيراد لاحقًا.' : 'No universities are imported for this country in the runtime database. Stage 1 source remains ready for later import.'} />}{result.total > result.data.length && <p className="text-xs text-amber-700 mt-3">{isAr ? `تظهر أول ${result.data.length} جامعة من أصل ${result.total}.` : `Showing the first ${result.data.length} of ${result.total} universities.`}</p>}</section>;
}

function CountryMajorsPanel({ universities, isAr }: { universities: University[]; isAr: boolean }) {
  const programs = universities.flatMap(university => (university.academicPrograms ?? []).map(program => ({ ...program, university: university.displayName })));
  const linked = programs.filter(program => program.status === 'MATCHED' && program.majorId);
  const unresolved = programs.filter(program => program.status !== 'MATCHED' || !program.majorId);
  return <section className="space-y-6"><SectionTitle>{isAr ? 'التخصصات عبر برامج الجامعات' : 'Majors Through University Programs'}</SectionTitle><div className="grid grid-cols-3 gap-3"><Metric label={isAr ? 'البرامج' : 'Programs'} value={programs.length} /><Metric label={isAr ? 'مرتبطة Canonical' : 'Canonical links'} value={linked.length} /><Metric label={isAr ? 'تحتاج مراجعة' : 'Needs review'} value={unresolved.length} /></div>{programs.length ? <div className="overflow-x-auto border border-slate-200 rounded"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-start">{isAr ? 'الجامعة' : 'University'}</th><th className="p-3 text-start">{isAr ? 'البرنامج' : 'Program'}</th><th className="p-3 text-start">{isAr ? 'الدرجة' : 'Degree'}</th><th className="p-3 text-start">Major ID</th><th className="p-3 text-start">{isAr ? 'الحالة' : 'Status'}</th></tr></thead><tbody className="divide-y">{programs.map((program, index) => <tr key={`${program.university}-${program.sourceProgramName}-${index}`}><td className="p-3">{program.university}</td><td className="p-3 font-semibold">{program.sourceProgramName || '-'}</td><td className="p-3">{program.degreeLevelCanonicalCode || '-'}</td><td className="p-3 font-mono text-xs">{program.majorId || '-'}</td><td className="p-3"><Status value={program.status || 'UNMAPPED'} /></td></tr>)}</tbody></table></div> : <Empty text={isAr ? 'المرحلة الأولى للجامعات لا تحتوي برامج أكاديمية؛ لذلك لا توجد علاقة تخصصات قابلة للعرض بعد. ستظهر هنا فقط عند وصول بيانات البرامج وربطها بمعرفات Major Canonical.' : 'University Stage 1 contains no academic programs, so no country-major relationship exists yet. Programs will appear only after canonical Major linkage.'} />}</section>;
}

function EvidencePanel({ meta, isAr }: { meta: CountryMetadata; isAr: boolean }) {
  return <section><SectionTitle>{isAr ? 'الأدلة والمصادر' : 'Evidence & Provenance'}</SectionTitle><Field label={isAr ? 'تاريخ تدقيق المصدر' : 'Source audit date'} value={meta.sourceAuditDate} /><div className="mt-4 space-y-2">{meta.referenceSources?.map(source => <a key={source} href={source} target="_blank" rel="noreferrer" className="block text-sm text-blue-700 hover:underline break-all">{source}</a>) || <Empty text={isAr ? 'لا توجد مصادر مسجلة.' : 'No sources recorded.'} />}</div></section>;
}

function ReadinessPanel({ meta, isAr }: { meta: CountryMetadata; isAr: boolean }) {
  const status = meta.referenceReviewStatus || 'UNREVIEWED';
  return <section><SectionTitle>{isAr ? 'جاهزية ملف الدولة' : 'Country Profile Readiness'}</SectionTitle><div className="border border-amber-200 bg-amber-50 text-amber-900 p-4 rounded"><div className="font-bold">{status}</div><p className="text-sm mt-1">{isAr ? 'لا يسمح بالنشر قبل إغلاق مراجعة المصدر واكتمال الأقسام التابعة المطلوبة.' : 'Publication remains blocked until source review and required related sections are complete.'}</p></div></section>;
}

function ScholarshipsPanel({ result, isAr }: { result: PageResult<Scholarship>; isAr: boolean }) {
  return <section><SectionTitle>{isAr ? `المنح المرتبطة (${result.total})` : `Linked Scholarships (${result.total})`}</SectionTitle>{result.data.length ? <div className="space-y-3">{result.data.map(item => <div key={item.id} className="border border-slate-200 rounded p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"><div><div className="font-bold">{item.displayName}</div><div className="text-xs text-slate-500 mt-1">{[item.sponsorName, item.studyCountry].filter(Boolean).join(' · ')}</div></div><div className="flex gap-2"><Status value={item.status} /><Status value={item.completenessStatus} /></div></div>{item.applicationDeadline && <div className="text-xs text-slate-600 mt-3">{isAr ? 'آخر موعد: ' : 'Deadline: '}{new Date(item.applicationDeadline).toLocaleDateString(isAr ? 'ar' : 'en')}</div>}</div>)}</div> : <Empty text={isAr ? 'لا توجد منح تحمل هذه الدولة في بيانات التشغيل حتى الآن.' : 'No runtime scholarships currently identify this study country.'} />}</section>;
}

function InternationalTestsPanel({ result, isAr }: { result: PageResult<InternationalTest>; isAr: boolean }) {
  return <section><SectionTitle>{isAr ? `الاختبارات المرتبطة (${result.total})` : `Linked International Tests (${result.total})`}</SectionTitle>{result.data.length ? <div className="space-y-3">{result.data.map(item => <div key={item.id} className="border border-slate-200 rounded p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><div className="font-bold">{item.displayName || item.canonicalName}{item.abbreviation ? ` (${item.abbreviation})` : ''}</div><div className="text-xs text-slate-500 mt-1">{[item.providerName, item.testCategory, item.publicId].filter(Boolean).join(' · ')}</div></div><div className="flex gap-2"><Status value={item.status} />{item.completenessStatus && <Status value={item.completenessStatus} />}</div></div><div className="flex flex-wrap gap-2 mt-3">{(item.countryRelationships ?? []).map((relationship, index) => <span key={`${relationship.countryIso2Code}-${relationship.relationshipType}-${index}`} title={relationship.notes} className="text-[11px] font-semibold px-2 py-1 rounded bg-blue-50 text-blue-800">{relationship.relationshipType}</span>)}</div></div>)}</div> : <Empty text={isAr ? 'لا توجد علاقات دولة موثقة للاختبارات في بيانات التشغيل حتى الآن.' : 'No documented test-country relationships are available in runtime data yet.'} />}</section>;
}

function PendingPanel({ icon: Icon, title, text }: { icon: typeof Globe; title: string; text: string }) { return <div className="text-center py-20"><Icon className="h-10 w-10 mx-auto text-slate-300 mb-3" /><h2 className="text-xl font-bold">{title}</h2><p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">{text}</p></div>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">{children}</h2>; }
function Field({ label, value }: { label: string; value: unknown }) { const display = Array.isArray(value) ? value.join(', ') : String(value ?? '').trim(); return <div className="border border-slate-200 bg-slate-50 p-3 rounded min-w-0"><div className="text-xs text-slate-500 mb-1">{label}</div><div className="text-sm font-semibold text-slate-900 break-words">{display || '-'}</div></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="border border-slate-200 rounded p-3"><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-bold mt-1">{value}</div></div>; }
function Status({ value }: { value: string }) { const warning = /REVIEW|INCOMPLETE|UNMAPPED|AMBIGUOUS/.test(value); return <span className={`text-[11px] font-semibold px-2 py-1 rounded ${warning ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>{value}</span>; }
function Empty({ text }: { text: string }) { return <p className="border border-dashed border-slate-300 rounded p-5 text-sm text-slate-500">{text}</p>; }
function flagEmoji(code: string) { try { return String.fromCodePoint(...code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0))); } catch { return '🏳'; } }
