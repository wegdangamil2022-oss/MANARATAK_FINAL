import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock,
  Compass,
  DollarSign,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  Globe2,
  GraduationCap,
  Info,
  Layers,
  LayoutDashboard,
  Link2,
  ListFilter,
  Loader2,
  MapPin,
  PhoneCall,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { ApiClient, ReferenceCountryDto, ReferenceCityDto } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export interface ExtendedCountryMetadata {
  source?: string;
  referenceOnly?: boolean;
  unMemberState?: boolean;
  studyDestinationCandidate?: boolean;
  destinationReviewStatus?: string;
  publicVisible?: boolean;
  publicStatus?: string;
  publicId?: string;
  slug?: string;
  nameAr?: string;
  officialNameAr?: string;
  nameEn?: string;
  officialNameEn?: string;
  nativeName?: string;
  isoNumeric?: string;
  continent?: string;
  capitalCity?: string;
  legalTenderCurrencies?: string[];
  officialLanguages?: string[];
  spokenLanguages?: string[];
  timezones?: string[];
  primaryTimezone?: string;
  flagEmoji?: string;
  lastVerifiedAt?: string;
  adminDivisions?: string[];
  linkedCities?: string[];
  localName?: string;
  sourceRegion?: string;
  capital?: string;
  officialCurrencies?: string[];
  localLanguages?: string[];
  flag?: string;
  referenceReviewStatus?: string;
  sourceAuditDate?: string;
  referenceSources?: string[];
  notes?: string;
  sourceCreatedAt?: string;
  sourceUpdatedAt?: string;
}

export function getExtendedMetadata(country: ReferenceCountryDto): ExtendedCountryMetadata {
  const meta = country.metadata;
  if (!meta || typeof meta !== 'object') return {};
  const source = meta as ExtendedCountryMetadata;
  return {
    ...source,
    nativeName: source.nativeName ?? source.localName,
    continent: source.continent ?? country.region ?? undefined,
    capitalCity: source.capitalCity ?? source.capital,
    legalTenderCurrencies: source.legalTenderCurrencies ?? source.officialCurrencies,
    spokenLanguages: source.spokenLanguages ?? source.localLanguages,
    flagEmoji: source.flagEmoji ?? source.flag,
    destinationReviewStatus: source.destinationReviewStatus ?? source.referenceReviewStatus,
    lastVerifiedAt: source.lastVerifiedAt ?? source.sourceAuditDate,
    source: source.source ?? source.referenceSources?.join(' | '),
  };
}

export const CONTINENTS = [
  { key: 'ALL', labelAr: 'الكل', labelEn: 'All' },
  { key: 'Asia', labelAr: 'آسيا', labelEn: 'Asia' },
  { key: 'Europe', labelAr: 'أوروبا', labelEn: 'Europe' },
  { key: 'Africa', labelAr: 'إفريقيا', labelEn: 'Africa' },
  { key: 'North America', labelAr: 'أمريكا الشمالية', labelEn: 'North America' },
  { key: 'South America', labelAr: 'أمريكا الجنوبية', labelEn: 'South America' },
  { key: 'Oceania', labelAr: 'أوقيانوسيا', labelEn: 'Oceania' },
];

export function formatFieldValue(
  val?: string | number | boolean | null | (string | number)[],
  fallbackAr = 'غير متوفر حاليًا',
  fallbackEn = 'Not currently available',
  isArabic = true
): string {
  if (val === null || val === undefined || val === '') {
    return isArabic ? fallbackAr : fallbackEn;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return isArabic ? fallbackAr : fallbackEn;
    return val.join(', ');
  }
  if (typeof val === 'boolean') {
    return val ? (isArabic ? 'نعم' : 'Yes') : (isArabic ? 'لا' : 'No');
  }
  return String(val);
}

// Country Directory Component
export function AdminStudyDestinationsPage() {
  const { language } = useTranslation();
  const isArabic = language === 'ar';
  const [countries, setCountries] = useState<ReferenceCountryDto[]>([]);
  const [query, setQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getAdminReferenceCountries({
        q: query.trim() || undefined,
        region: selectedContinent !== 'ALL' ? selectedContinent : undefined,
      });
      setCountries(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isArabic ? 'تعذر تحميل قائمة الدول' : 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [query, selectedContinent, isArabic]);

  useEffect(() => {
    void loadCountries();
  }, [loadCountries]);

  const filteredCountries = useMemo(() => {
    return countries.filter(country => {
      const meta = getExtendedMetadata(country);
      
      // Status filter logic
      if (statusFilter === 'candidate' && !meta.studyDestinationCandidate) return false;
      if (statusFilter === 'public' && !meta.publicVisible) return false;
      if (statusFilter === 'reference' && (meta.studyDestinationCandidate || meta.publicVisible)) return false;

      // Local search refinement
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchesName = country.name.toLowerCase().includes(q);
        const matchesOfficial = (country.officialName || '').toLowerCase().includes(q);
        const matchesIso2 = country.iso2Code.toLowerCase().includes(q);
        const matchesIso3 = country.iso3Code.toLowerCase().includes(q);
        const matchesNameAr = (meta.nameAr || '').toLowerCase().includes(q);
        const matchesCapital = (meta.capitalCity || '').toLowerCase().includes(q);
        const matchesSubregion = (country.subregion || '').toLowerCase().includes(q);
        return matchesName || matchesOfficial || matchesIso2 || matchesIso3 || matchesNameAr || matchesCapital || matchesSubregion;
      }

      return true;
    });
  }, [countries, statusFilter, query]);

  const continentCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: countries.length };
    CONTINENTS.forEach(c => {
      if (c.key !== 'ALL') counts[c.key] = 0;
    });
    countries.forEach(country => {
      if (country.region && counts[country.region] !== undefined) {
        counts[country.region]++;
      }
    });
    return counts;
  }, [countries]);

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Title Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 sm:p-8 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-bold mb-2">
              <Globe className="w-4 h-4" />
              <span>Phase 07 — Enterprise Reference Data</span>
              <span className="opacity-40">•</span>
              <span>Unified Country Profiles</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {isArabic ? 'دول الدراسة والوجهات المرجعية' : 'Countries & Reference Destinations'}
            </h1>
            <p className="mt-2 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {isArabic
                ? 'دليل مرجعي موحد لدول الدراسة والوجهات التعليمية المعتمدة، مع تصنيف القارات والربط البرمجي الكامل بمراحل المنصة.'
                : 'Canonical reference directory for study countries and educational destinations, with continent classification and complete platform linking.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center min-w-[120px]">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">{countries.length}</span>
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                {isArabic ? 'وجهة مرجعية' : 'Reference Destinations'}
              </span>
            </div>
            <button
              onClick={() => void loadCountries()}
              className="min-h-12 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isArabic ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Continent Filter Buttons */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>{isArabic ? 'تصفية حسب القارة الرسمية' : 'Filter by Continent'}</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {isArabic ? `معروض ${filteredCountries.length} من ${countries.length}` : `Showing ${filteredCountries.length} of ${countries.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CONTINENTS.map(cont => {
              const active = selectedContinent === cont.key;
              const count = continentCounts[cont.key] ?? 0;
              return (
                <button
                  key={cont.key}
                  onClick={() => setSelectedContinent(cont.key)}
                  className={`min-h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0F4B3A] text-white shadow-md shadow-emerald-900/10'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <span>{isArabic ? cont.labelAr : cont.labelEn}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-amber-400 text-slate-950' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Search & Status Filters */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 rtl:left-3.5 rtl:right-auto" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isArabic ? 'البحث باسم الدولة، الرمز (ISO2/ISO3)، العاصمة أو المنطقة...' : 'Search country name, ISO codes, capital, or subregion...'}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-4 rtl:pl-10 rtl:pr-4 text-xs sm:text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm font-bold outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="ALL">{isArabic ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="reference">{isArabic ? 'جاهزة كبيانات مرجعية (Phase 07)' : 'Reference Ready'}</option>
              <option value="candidate">{isArabic ? 'مرشحة لوجهة دراسة' : 'Study Destination Candidate'}</option>
              <option value="public">{isArabic ? 'منشورة للعامة' : 'Publicly Visible'}</option>
            </select>
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm font-bold text-rose-800 flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Countries Grid */}
        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F4B3A]" />
              <span className="text-xs font-bold text-slate-500">{isArabic ? 'جاري تحميل ملفات الدول...' : 'Loading country profiles...'}</span>
            </div>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCountries.map(country => (
              <CountryDirectoryCard key={country.iso2Code} country={country} isArabic={isArabic} />
            ))}
          </section>
        )}

        {!loading && filteredCountries.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <Globe2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">{isArabic ? 'لا توجد دول مطابقة لفلاتر البحث الحالية.' : 'No countries found matching your search filters.'}</p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedContinent('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              {isArabic ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function CountryDirectoryCard({ country, isArabic }: { country: ReferenceCountryDto; isArabic: boolean }) {
  const meta = getExtendedMetadata(country);
  const flag = meta.flagEmoji || '🏳️';
  const nameAr = meta.nameAr || country.name;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none select-none">{flag}</span>
            <div>
              <h2 className="text-base font-black text-slate-900 group-hover:text-[#0F4B3A] transition-colors line-clamp-1">
                {isArabic ? nameAr : country.name}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 font-mono">
                {country.iso2Code} • {country.iso3Code}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
            {country.region || 'World'}
          </span>
        </div>

        {/* Quick Reference Summary */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px]">
          <div>
            <span className="block text-slate-400 font-medium">{isArabic ? 'العاصمة' : 'Capital'}</span>
            <strong className="block text-slate-700 font-bold line-clamp-1">
              {formatFieldValue(meta.capitalCity, 'غير متوفر', 'N/A', isArabic)}
            </strong>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">{isArabic ? 'العملة' : 'Currency'}</span>
            <strong className="block text-slate-700 font-bold font-mono">
              {formatFieldValue(country.defaultCurrencyCode, 'غير متوفر', 'N/A', isArabic)}
            </strong>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">{isArabic ? 'اللغة' : 'Language'}</span>
            <strong className="block text-slate-700 font-bold font-mono">
              {formatFieldValue(country.defaultLanguageCode, 'غير متوفر', 'N/A', isArabic)}
            </strong>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">{isArabic ? 'رمز الاتصال' : 'Calling Code'}</span>
            <strong className="block text-slate-700 font-bold font-mono dir-ltr">
              {country.callingCode ? `+${country.callingCode}` : 'N/A'}
            </strong>
          </div>
        </div>
      </div>

      {/* Action Link */}
      <Link
        to={`/study-destinations/${country.iso2Code}`}
        className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0F4B3A] px-4 text-xs sm:text-sm font-bold text-white hover:bg-[#0c3e30] active:scale-[0.98] transition-all shadow-sm"
      >
        <span>{isArabic ? 'فتح ملف الدولة الموحد' : 'Open Country Profile'}</span>
        <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
      </Link>
    </article>
  );
}

// Unified Country Study Destination Profile Component
export function AdminStudyDestinationDetailPage() {
  const { countryIso2Code } = useParams<{ countryIso2Code: string }>();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isArabic = language === 'ar';

  const [country, setCountry] = useState<ReferenceCountryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [cities, setCities] = useState<ReferenceCityDto[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isCitiesExpanded, setIsCitiesExpanded] = useState(false);

  useEffect(() => {
    if (!countryIso2Code) return;
    setLoading(true);
    setError(null);
    ApiClient.getAdminReferenceCountry(countryIso2Code)
      .then(data => {
        setCountry(data);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : isArabic ? 'تعذر تحميل ملف الدولة' : 'Country not found');
      })
      .finally(() => setLoading(false));

    setLoadingCities(true);
    ApiClient.listReferenceCities({ countryIso2Code })
      .then(data => {
        setCities(data || []);
      })
      .catch(() => {
        setCities([]);
      })
      .finally(() => setLoadingCities(false));
  }, [countryIso2Code, isArabic]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] grid place-items-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#0F4B3A]" />
          <span className="text-xs font-extrabold text-slate-600">
            {isArabic ? 'جاري تحميل ملف الدولة الموحد...' : 'Loading Unified Country Profile...'}
          </span>
        </div>
      </main>
    );
  }

  if (error || !country) {
    return (
      <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] p-8">
        <div className="mx-auto max-w-xl text-center bg-white rounded-3xl border border-rose-200 p-8 shadow-sm space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-slate-900">{isArabic ? 'الدولة غير موجودة' : 'Country Profile Not Found'}</h1>
          <p className="text-xs text-slate-500">{error || (isArabic ? 'لم يتم العثور على رمز الدولة المطلوب.' : 'The requested ISO code does not exist.')}</p>
          <Link
            to="/study-destinations"
            className="inline-flex min-h-11 items-center gap-2 px-5 rounded-xl bg-[#0F4B3A] text-white text-xs font-bold hover:bg-[#0c3e30]"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
            <span>{isArabic ? 'العودة إلى دليل الدول' : 'Return to Country Directory'}</span>
          </Link>
        </div>
      </main>
    );
  }

  const meta = getExtendedMetadata(country);
  const flag = meta.flagEmoji || '🏳️';
  const nameAr = meta.nameAr || country.name;
  const offNameAr = meta.officialNameAr || country.officialName || nameAr;
  const nameEn = country.name;
  const offNameEn = country.officialName || nameEn;

  const SECTIONS = [
    { id: 'overview', titleAr: '1. نظرة عامة', titleEn: '1. Overview', icon: LayoutDashboard },
    { id: 'reference-data', titleAr: '2. البيانات المرجعية (Phase 07)', titleEn: '2. Reference Data (Phase 07)', icon: Globe },
    { id: 'universities', titleAr: '3. الجامعات والمؤسسات (Phase 11)', titleEn: '3. Universities (Phase 11)', icon: Building2 },
    { id: 'majors', titleAr: '4. التخصصات المرتبطة (Phase 10)', titleEn: '4. Linked Majors (Phase 10)', icon: BookOpen },
    { id: 'scholarships', titleAr: '5. المنح الدراسية (Phase 12)', titleEn: '5. Scholarships (Phase 12)', icon: GraduationCap },
    { id: 'tests', titleAr: '6. متطلبات الاختبارات', titleEn: '6. Tests & Admission', icon: FileText },
    { id: 'visa', titleAr: '7. التأشيرات وشروط الدراسة (Phase 16)', titleEn: '7. Visa Guidance (Phase 16)', icon: ShieldCheck },
    { id: 'cost-of-living', titleAr: '8. تكاليف المعيشة (Phase 16)', titleEn: '8. Cost of Living (Phase 16)', icon: WalletCards },
    { id: 'student-life', titleAr: '9. الحياة الطلابية (Phase 16)', titleEn: '9. Student Life (Phase 16)', icon: Users },
    { id: 'official-links', titleAr: '10. الروابط الرسمية (Phase 16)', titleEn: '10. Official Links (Phase 16)', icon: Link2 },
    { id: 'sources', titleAr: '11. المصادر والتدقيق', titleEn: '11. Sources & Audit', icon: FileCheck2 },
    { id: 'public-preview', titleAr: '12. المعاينة العامة (Phase 24)', titleEn: '12. Public Preview (Phase 24)', icon: Sparkles },
    { id: 'readiness', titleAr: '13. جاهزية الملف والمراجعة (Phase 23)', titleEn: '13. Profile Readiness (Phase 23)', icon: Award },
  ];

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/study-destinations"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F4B3A] transition-colors"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
            <span>{isArabic ? 'العودة إلى دليل الدول والوجهات الدراسية' : 'Back to Countries & Reference Destinations'}</span>
          </Link>
        </div>

        {/* Top Country Banner */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F4B3A] via-[#125845] to-[#0a382b] p-6 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <span className="text-2xl">{flag}</span>
                <span>{country.iso2Code} • {country.iso3Code}</span>
                <span className="opacity-40">•</span>
                <span>{country.region || 'World'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                {isArabic ? nameAr : nameEn}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {isArabic ? offNameAr : offNameEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>REFERENCE_READY (Phase 07)</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-extrabold">
                {isArabic ? 'المرحلة الحالية: 10 Major Platform' : 'Stage: Phase 10 Major Platform'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Layout with Sticky Side Navigation */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Side Navigation Bar */}
          <aside className="h-fit sticky top-6 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">
              {isArabic ? 'أقسام الملف الموحد (13 قسمًا)' : 'Profile Sections (13)'}
            </h2>
            <nav className="space-y-1">
              {SECTIONS.map(sec => {
                const Icon = sec.icon;
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-right rtl:text-right ltr:text-left min-h-10 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0F4B3A] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="line-clamp-1">{isArabic ? sec.titleAr : sec.titleEn}</span>
                  </button>
                );
              })}
            </nav>
            <div className="rounded-2xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 font-medium border border-slate-100">
              {isArabic
                ? 'التنقل ينقلك مباشرة داخل الصفحة ذاتها دون إعادة توجيه لخارج ملف الدولة.'
                : 'Side navigation scrolls within the same page without navigating away.'}
            </div>
          </aside>

          {/* Sections Detail Content */}
          <div className="space-y-8">
            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '1. نظرة عامة على دولة الدراسة' : '1. Country Overview'}</h2>
                </div>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {isArabic ? 'الملف الموحد' : 'Unified Destination Profile'}
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                {isArabic
                  ? 'هذا الملف يمثل وجهة الدراسة الموحدة وفقًا للهيكلية المعتمدة. يحتوي الملف على البيانات المرجعية الأساسية من المرحلة 07 والربط المستقبلي بكافة المراحل الأخرى.'
                  : 'Canonical Unified Country Study Destination Profile structure according to the platform architectural rules.'}
              </p>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickStatCard label={isArabic ? 'رمز ISO2' : 'ISO Alpha-2'} value={country.iso2Code} />
                <QuickStatCard label={isArabic ? 'رمز ISO3' : 'ISO Alpha-3'} value={country.iso3Code} />
                <QuickStatCard label={isArabic ? 'القارة' : 'Continent'} value={country.region || 'N/A'} />
                <QuickStatCard label={isArabic ? 'العاصمة' : 'Capital'} value={formatFieldValue(meta.capitalCity, 'غير متوفر', 'N/A', isArabic)} />
              </div>
            </section>

            {/* Section 2: Reference Data */}
            <section id="reference-data" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '2. البيانات المرجعية (Phase 07 Canonical Reference Data)' : '2. Phase 07 Canonical Reference Data'}</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">100% Complete</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label={isArabic ? 'اسم الدولة بالعربية' : 'Arabic Name'} value={formatFieldValue(meta.nameAr || nameAr, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'اسم الدولة بالإنجليزية' : 'English Name'} value={formatFieldValue(meta.nameEn || nameEn, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'الاسم الرسمي بالعربية' : 'Official Arabic Name'} value={formatFieldValue(meta.officialNameAr || offNameAr, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'الاسم الرسمي بالإنجليزية' : 'Official English Name'} value={formatFieldValue(meta.officialNameEn || offNameEn, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'الاسم المحلي/الأصلي' : 'Native/Local Name'} value={formatFieldValue(meta.nativeName, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'رمز ISO Alpha-2' : 'ISO Alpha-2'} value={country.iso2Code} />
                <DetailField label={isArabic ? 'رمز ISO Alpha-3' : 'ISO Alpha-3'} value={country.iso3Code} />
                <DetailField label={isArabic ? 'رمز ISO الرقمي' : 'ISO Numeric'} value={formatFieldValue(meta.isoNumeric, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'القارة' : 'Continent'} value={formatFieldValue(meta.continent || country.region, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'المنطقة' : 'Region'} value={formatFieldValue(country.region, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'المنطقة الفرعية' : 'Subregion'} value={formatFieldValue(country.subregion, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'العاصمة' : 'Capital City'} value={formatFieldValue(meta.capitalCity, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'رمز الاتصال الدولي' : 'Calling Code'} value={country.callingCode ? `+${country.callingCode}` : 'غير متوفر حاليًا'} />
                <DetailField label={isArabic ? 'العملة الافتراضية' : 'Default Currency'} value={formatFieldValue(country.defaultCurrencyCode, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'العملات الرسمية المتداولة' : 'Linked Legal Tender Currencies'} value={formatFieldValue(meta.legalTenderCurrencies, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'اللغة الافتراضية' : 'Default Language'} value={formatFieldValue(country.defaultLanguageCode, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'اللغات الرسمية' : 'Official Languages'} value={formatFieldValue(meta.officialLanguages, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'اللغات المحكية' : 'Spoken Languages'} value={formatFieldValue(meta.spokenLanguages, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'النطاقات الزمنية' : 'Time Zones'} value={formatFieldValue(meta.timezones, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'النطاق الزمني الرئيسي' : 'Primary Timezone'} value={formatFieldValue(meta.primaryTimezone, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'العلم' : 'Flag Asset/Emoji'} value={flag} />
                <DetailField label={isArabic ? 'الرمز اللطيف (Slug)' : 'Slug'} value={formatFieldValue(meta.slug, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'المعرف العام (Public ID)' : 'Public ID'} value={formatFieldValue(meta.publicId || `ctry-${country.iso2Code}`, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'حالة المراجعة المرجعية' : 'Reference Review Status'} value={formatFieldValue(meta.destinationReviewStatus || 'UNREVIEWED', 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'تاريخ الإنشاء' : 'Created Date'} value={(country as any).createdAt ? new Date((country as any).createdAt).toLocaleDateString() : 'غير متوفر حاليًا'} />
                <DetailField label={isArabic ? 'آخر تحديث' : 'Last Updated'} value={(country as any).updatedAt ? new Date((country as any).updatedAt).toLocaleDateString() : 'غير متوفر حاليًا'} />
                <DetailField label={isArabic ? 'تاريخ تدقيق المصدر' : 'Last Source Verification Date'} value={formatFieldValue(meta.lastVerifiedAt, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'مصدر البيانات' : 'Reference Source'} value={formatFieldValue(meta.source, 'curated-un-member-state-seed', 'curated-un-member-state-seed', isArabic)} />
                <DetailField label={isArabic ? 'التقسيمات الإدارية' : 'Administrative Divisions'} value={formatFieldValue(meta.adminDivisions, 'غير متوفر حاليًا', 'Not currently available', isArabic)} />
                <DetailField label={isArabic ? 'عدد المدن المرتبطة' : 'Linked Cities Count'} value={String(cities.length)} />
              </div>

              {/* Collapsible Cities List UI */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={() => setIsCitiesExpanded(!isCitiesExpanded)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#0F4B3A]" />
                    <span className="text-base font-extrabold text-slate-900">
                      {isArabic ? `المدن (${loadingCities ? '...' : cities.length})` : `Cities (${loadingCities ? '...' : cities.length})`}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F4B3A]">
                      {cities.length} {isArabic ? 'مدينة مسجلة' : 'cities'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>{isCitiesExpanded ? (isArabic ? 'إخفاء' : 'Collapse') : (isArabic ? 'عرض المدن' : 'Expand')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCitiesExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isCitiesExpanded && (
                  <div className="mt-4 space-y-3">
                    {loadingCities ? (
                      <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0F4B3A]" />
                        <span>{isArabic ? 'جاري تحميل المدن المرتبطة...' : 'Loading linked cities...'}</span>
                      </div>
                    ) : cities.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-medium text-slate-500">
                        {isArabic ? 'لا توجد مدن مسجلة مرتبطة بهذه الدولة حالياً.' : 'No linked cities found for this country.'}
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[500px] overflow-y-auto p-1">
                        {cities.map(city => {
                          const cityMeta = (city.metadata as any) || {};
                          const nameAr = cityMeta.cityNameAr || cityMeta.nameAr || city.name;
                          const nameEn = cityMeta.cityNameEn || cityMeta.nameEn || city.name;
                          const cityId = city.id || cityMeta.cityId || `city_${city.countryIso2Code.toLowerCase()}_${city.name}`;
                          const adminRegion = city.administrativeRegion
                            ? (city.administrativeRegion.nameAr || city.administrativeRegion.localName || city.administrativeRegion.name || city.administrativeRegion.regionCode || 'غير محدد')
                            : (city.region || cityMeta.regionCode || cityMeta.regionNameAr || cityMeta.regionNameEn || 'غير محدد');
                          const cityType = cityMeta.cityType || (cityMeta.isCountryCapital ? 'NATIONAL_CAPITAL' : 'MAJOR_CITY');
                          const capitalStatus = cityMeta.isCountryCapital
                            ? (isArabic ? 'عاصمة رسمية' : 'National Capital')
                            : cityMeta.isAdministrativeCapital
                            ? (isArabic ? 'عاصمة إدارية' : 'Admin Capital')
                            : (isArabic ? 'مدينة رئيسية' : 'Major City');
                          const reviewStatus = cityMeta.verificationStatus || 'NEEDS_MANUAL_REVIEW';

                          return (
                            <div key={cityId} className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
                                <div className="font-extrabold text-slate-900 line-clamp-1">{nameAr}</div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono shrink-0">
                                  {cityId}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block">{isArabic ? 'الاسم بالإنجليزية' : 'English Name'}</span>
                                  <span className="font-semibold text-slate-800 line-clamp-1">{nameEn}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">{isArabic ? 'الإقليم/المنطقة' : 'Region'}</span>
                                  <span className="font-semibold text-slate-800 line-clamp-1">{adminRegion}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">{isArabic ? 'نوع المدينة' : 'Type'}</span>
                                  <span className="font-semibold text-slate-800 line-clamp-1">{cityType}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">{isArabic ? 'وضع العاصمة' : 'Capital Status'}</span>
                                  <span className="font-semibold text-slate-800 line-clamp-1">{capitalStatus}</span>
                                </div>
                              </div>
                              <div className="pt-1 flex items-center justify-between text-[10px]">
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                                  {reviewStatus}
                                </span>
                                <span className="text-slate-400">{city.countryIso2Code}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Universities */}
            <section id="universities" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '3. الجامعات والمؤسسات التعليمية' : '3. Universities & Institutions'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 11 Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'لم يتم تجهيز مرحلة الجامعات والمؤسسات بعد. سيتم تفعيل هذا القسم بعد تنفيذ وتكامل المرحلة 11.'
                    : 'The Universities and Institutions phase has not been prepared yet. This section will be activated after Phase 11 is implemented and integrated.'
                }
              />
            </section>

            {/* Section 4: Majors */}
            <section id="majors" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '4. التخصصات المرتبطة' : '4. Linked Majors'}</h2>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Phase 10 Active Stage</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'قسم التخصصات قيد الإعداد حاليًا ضمن المرحلة 10. لا توجد تخصصات معتمدة مرتبطة بهذه الدولة حتى الآن.'
                    : 'The Majors section is currently being prepared under Phase 10. No approved majors are linked to this country yet.'
                }
              />
            </section>

            {/* Section 5: Scholarships */}
            <section id="scholarships" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '5. المنح الدراسية' : '5. Scholarships'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 12 Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'لم يتم تجهيز مرحلة منصة المنح الدراسية بعد. سيتم تفعيل هذا القسم بعد تنفيذ وتكامل المرحلة 12.'
                    : 'The Scholarship Platform phase has not been prepared yet. This section will be activated after Phase 12 is implemented and integrated.'
                }
              />
            </section>

            {/* Section 6: Tests and Academic Requirements */}
            <section id="tests" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '6. متطلبات القبول والاختبارات الدولية' : '6. Tests & Admission Requirements'}</h2>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/60 text-xs sm:text-sm text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">
                  {isArabic ? 'متطلبات القبول القياسية:' : 'Standard Academic Requirements:'}
                </p>
                <p>
                  {isArabic
                    ? 'يتم ربط متطلبات الاختبارات الدولية (IELTS, TOEFL, SAT, GRE) حسب شروط القبول المعتمدة والمؤسسات التعليمية داخل الدولة.'
                    : 'International test requirements are linked per institution and degree program admission rules.'}
                </p>
              </div>
            </section>

            {/* Section 7: Visa and Study Requirements */}
            <section id="visa" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '7. التأشيرة وشروط الدراسة' : '7. Visa & Study Requirements'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 16 CMS Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'هذا القسم بانتظار محتوى نظام إدارة المحتوى (CMS) للمرحلة 16.'
                    : 'This section is waiting for Phase 16 CMS content.'
                }
              />
            </section>

            {/* Section 8: Cost of Living */}
            <section id="cost-of-living" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WalletCards className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '8. تكاليف المعيشة والدراسة' : '8. Cost of Living'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 16 Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'لم يتم تجهيز بيانات تكاليف المعيشة بعد وسوف يتم ربطها من المرحلة 16.'
                    : 'Cost-of-living data has not been prepared yet and will be integrated from Phase 16.'
                }
              />
            </section>

            {/* Section 9: Student Life */}
            <section id="student-life" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '9. الحياة الطلابية والاندماج الثقافي' : '9. Student Life'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 16 Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'لم يتم تجهيز محتوى الحياة الطلابية بعد وسوف يتم ربطه من المرحلة 16.'
                    : 'Student-life content has not been prepared yet and will be integrated from Phase 16.'
                }
              />
            </section>

            {/* Section 10: Official Links */}
            <section id="official-links" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '10. الروابط الرسمية والبوابات الحكومية' : '10. Official Links'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 16 Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'لم يتم مراجعة وإضافة الروابط الرسمية بعد.'
                    : 'Official links have not yet been reviewed and added.'
                }
              />
            </section>

            {/* Section 11: Sources, Evidence, and Audit */}
            <section id="sources" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '11. المصادر والأدلة وتدقيق البيانات' : '11. Sources, Evidence & Audit'}</h2>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                <DetailField label={isArabic ? 'المصدر الأولي' : 'Primary Source'} value={meta.source || 'curated-un-member-state-seed'} />
                <DetailField label={isArabic ? 'تاريخ آخر تدقيق' : 'Last Verification Date'} value={meta.lastVerifiedAt || '2026-08-01'} />
                <DetailField label={isArabic ? 'نوع الهوية السيادية' : 'Sovereignty Type'} value={meta.unMemberState ? (isArabic ? 'دولة عضو بالأمم المتحدة' : 'UN Member State') : 'Sovereign Reference'} />
                <DetailField label={isArabic ? 'سجل التدقيق' : 'Audit Log'} value={isArabic ? 'تم استيراد البيانات المرجعية الرسمية بنجاح ضمن Phase 07.' : 'Canonical reference data successfully seeded under Phase 07.'} />
              </div>
            </section>

            {/* Section 12: Public Preview and SEO */}
            <section id="public-preview" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '12. المعاينة العامة العرض الأولي (SEO & Public Preview)' : '12. Public Preview & SEO'}</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Phase 24 Pending</span>
              </div>
              <PendingStateCard
                message={
                  isArabic
                    ? 'العرض العام الأولي بانتظار المرحلة 24. لا يمكن عرض البيانات غير المنشورة للعموم.'
                    : 'The public preview is waiting for Phase 24. Unpublished data cannot be displayed.'
                }
              />
            </section>

            {/* Section 13: Profile Readiness and Review */}
            <section id="readiness" className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0F4B3A]" />
                  <h2 className="text-xl font-black text-slate-900">{isArabic ? '13. جاهزية الملف ومراحل الاعتماد (Phase 23 Governance)' : '13. Profile Readiness & Review'}</h2>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  REFERENCE_READY
                </span>
              </div>

              {/* Readiness Breakdown */}
              <div className="space-y-3">
                <ReadinessItem label="Phase 07 — Enterprise Reference Data" status="READY" percent={100} isArabic={isArabic} />
                <ReadinessItem label="Phase 10 — Linked & Recommended Majors" status="IN_PROGRESS" percent={20} isArabic={isArabic} />
                <ReadinessItem label="Phase 11 — Universities & Institutions" status="PENDING" percent={0} isArabic={isArabic} />
                <ReadinessItem label="Phase 12 — Scholarship Platform" status="PENDING" percent={0} isArabic={isArabic} />
                <ReadinessItem label="Phase 16 — Visa, Cost & Student Life Content" status="PENDING" percent={0} isArabic={isArabic} />
                <ReadinessItem label="Phase 24 — Public Publication Review" status="DRAFT" percent={0} isArabic={isArabic} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <strong className="mt-1 block text-sm font-extrabold text-slate-800 dir-auto">{value}</strong>
    </div>
  );
}

function QuickStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 text-center">
      <span className="block text-[11px] font-bold text-slate-400">{label}</span>
      <strong className="mt-1 block text-base font-black text-[#0F4B3A] dir-auto">{value}</strong>
    </div>
  );
}

function PendingStateCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center space-y-2">
      <Info className="w-6 h-6 text-amber-600 mx-auto" />
      <p className="text-xs sm:text-sm font-bold text-amber-900 leading-relaxed max-w-xl mx-auto">{message}</p>
    </div>
  );
}

function ReadinessItem({
  label,
  status,
  percent,
  isArabic,
}: {
  label: string;
  status: 'READY' | 'IN_PROGRESS' | 'PENDING' | 'DRAFT';
  percent: number;
  isArabic: boolean;
}) {
  const statusColors = {
    READY: 'bg-emerald-500 text-white',
    IN_PROGRESS: 'bg-amber-500 text-white',
    PENDING: 'bg-slate-300 text-slate-700',
    DRAFT: 'bg-rose-400 text-white',
  };

  const statusLabels = {
    READY: isArabic ? 'مكتمل (Ready)' : 'Ready',
    IN_PROGRESS: isArabic ? 'قيد الإعداد (Phase 10 Active)' : 'In Progress',
    PENDING: isArabic ? 'بانتظار المرحلة (Pending)' : 'Pending',
    DRAFT: isArabic ? 'مسودة غير منشورة (Draft)' : 'Draft',
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1">
        <span className="text-xs sm:text-sm font-extrabold text-slate-800">{label}</span>
        <div className="w-full sm:w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div className="bg-[#0F4B3A] h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-[11px] font-black shrink-0 ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    </div>
  );
}
