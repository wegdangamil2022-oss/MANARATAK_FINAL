import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { adminApiClient } from '../api/client';
import { 
  FileText, GraduationCap, BookOpen, Sparkles, 
  FileCheck2, DollarSign, Globe, Link2, Lock, AlertCircle, ArrowLeft
} from 'lucide-react';

const API_BASE = '/reference-data';

interface Country {
  iso2Code: string;
  iso3Code: string | null;
  name: string;
  officialName: string | null;
  region: string | null;
  subregion: string | null;
  defaultCurrencyCode: string | null;
  defaultLanguageCode: string | null;
  callingCode: string | null;
  flagAssetId: string | null;
}

export function StudyDestinationDetailPage() {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  
  const { countryIso2Code } = useParams<{ countryIso2Code: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('reference');

  useEffect(() => {
    const fetchCountry = async () => {
      if (!countryIso2Code) return;
      setLoading(true);
      setError(null);
      try {
        const res = await adminApiClient.request<{ data: Country[] }>(`${API_BASE}/countries`);
        const found = (res.data || []).find((c: Country) => c.iso2Code === countryIso2Code);
        if (!found) throw new Error('Country not found');
        setCountry(found);
      } catch (err: any) {
        setError('UNAVAILABLE');
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
  }, [countryIso2Code]);

  if (loading) return <div className="p-8 text-gray-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>;
  if (error) return <div className="p-8 text-red-600">{isAr ? 'تعذر تحميل الدول من واجهة البيانات المرجعية.' : 'Unable to load countries from Reference Data API.'}</div>;
  if (!country) return <div className="p-8 text-gray-500">{isAr ? 'لم يتم العثور على الدولة' : 'Country not found'}</div>;

  const tabs = [
    { id: 'reference', labelEn: 'Reference Data', labelAr: 'البيانات المرجعية', icon: <FileText className="h-4 w-4" /> },
    { id: 'universities', labelEn: 'Universities', labelAr: 'الجامعات', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'majors', labelEn: 'Majors', labelAr: 'التخصصات', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'scholarships', labelEn: 'Scholarships', labelAr: 'المنح الدراسية', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'visa', labelEn: 'Visa & Requirements', labelAr: 'التأشيرة والمتطلبات', icon: <FileCheck2 className="h-4 w-4" /> },
    { id: 'living', labelEn: 'Cost of Living', labelAr: 'تكلفة المعيشة', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'student-life', labelEn: 'Student Life', labelAr: 'الحياة الطلابية', icon: <Globe className="h-4 w-4" /> },
    { id: 'official-links', labelEn: 'Official Links', labelAr: 'الروابط الرسمية', icon: <Link2 className="h-4 w-4" /> },
    { id: 'evidence', labelEn: 'Evidence & Provenance', labelAr: 'الأدلة والمصادر', icon: <Lock className="h-4 w-4" /> },
    { id: 'preview', labelEn: 'Public Preview', labelAr: 'المعاينة العامة', icon: <Globe className="h-4 w-4" /> },
    { id: 'readiness', labelEn: 'Profile Readiness / Public Review', labelAr: 'جاهزية الملف والمراجعة العامة', icon: <AlertCircle className="h-4 w-4" /> },
  ];

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${isAr ? 'rtl text-right' : 'ltr text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 mb-4">
        <Link to="/study-destinations" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-xs font-bold transition-colors">
          <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
          <span>{isAr ? 'العودة لدول الدراسة' : 'Back to Study Destinations'}</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-extrabold text-xs">{country.name}</span>
      </div>

      {/* Header Identity Block */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                {`ISO: ${country.iso2Code}`}
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {isAr ? 'بيانات معتمدة' : 'Verified Destination'}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
              {country.name}
            </h1>
            
            <p className="text-slate-400 text-xs md:text-sm font-medium">
              {country.officialName || country.name} • {country.region || 'Global'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-xs">
        {/* Vertical Tabs Sidebar */}
        <div className="w-full md:w-64 bg-slate-50/60 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-slate-200/80 flex-shrink-0">
          <div className="p-4 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isAr ? 'أقسام ملف الدولة' : 'Destination Sections'}
            </span>
          </div>
          <nav className="flex flex-col py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition-all text-left rtl:text-right ${
                  activeTab === tab.id
                    ? 'bg-emerald-50/60 text-[#0F4B3A] border-r-4 border-[#0F4B3A] rtl:border-r-0 rtl:border-l-4 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/50'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-emerald-700' : 'text-slate-400'}>{tab.icon}</span>
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 lg:p-8">
          {activeTab === 'reference' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                {isAr ? 'البيانات المرجعية' : 'Reference Data'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">ISO 2 Code</span>
                  <span className="font-medium text-gray-900">{country.iso2Code}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">ISO 3 Code</span>
                  <span className="font-medium text-gray-900">{country.iso3Code || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'الاسم' : 'Country Name'}</span>
                  <span className="font-medium text-gray-900">{country.name}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'الاسم الرسمي' : 'Official Name'}</span>
                  <span className="font-medium text-gray-900">{country.officialName || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'المنطقة' : 'Region'}</span>
                  <span className="font-medium text-gray-900">{country.region || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'المنطقة الفرعية' : 'Subregion'}</span>
                  <span className="font-medium text-gray-900">{country.subregion || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'العملة الافتراضية' : 'Default Currency'}</span>
                  <span className="font-medium text-gray-900">{country.defaultCurrencyCode || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'اللغة الافتراضية' : 'Default Language'}</span>
                  <span className="font-medium text-gray-900">{country.defaultLanguageCode || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'رمز الاتصال' : 'Calling Code'}</span>
                  <span className="font-medium text-gray-900">{country.callingCode ? `+${country.callingCode}` : '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'المدن' : 'Cities'}</span>
                  <span className="font-medium text-gray-500 italic text-sm">{isAr ? 'غير متوفر بعد' : 'Not available yet'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{isAr ? 'مرجع العلم' : 'Flag Asset Reference'}</span>
                  <span className="font-medium text-gray-900">{country.flagAssetId || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'universities' && (
            <div className="text-center py-20 text-gray-500">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'الجامعات قيد الانتظار' : 'Universities Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 11' : 'Phase 11'}</p>
            </div>
          )}

          {activeTab === 'majors' && (
            <div className="text-center py-20 text-gray-500">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'التخصصات قيد الانتظار' : 'Majors Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 10' : 'Phase 10'}</p>
            </div>
          )}

          {activeTab === 'scholarships' && (
            <div className="text-center py-20 text-gray-500">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'المنح الدراسية قيد الانتظار' : 'Scholarships Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 12' : 'Phase 12'}</p>
            </div>
          )}

          {activeTab === 'visa' && (
            <div className="text-center py-20 text-gray-500">
              <FileCheck2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'التأشيرة والمتطلبات قيد الانتظار' : 'Visa & Requirements Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 16' : 'Phase 16'}</p>
            </div>
          )}

          {activeTab === 'living' && (
            <div className="text-center py-20 text-gray-500">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'تكلفة المعيشة قيد الانتظار' : 'Cost of Living Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 16' : 'Phase 16'}</p>
            </div>
          )}

          {activeTab === 'student-life' && (
            <div className="text-center py-20 text-gray-500">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'الحياة الطلابية قيد الانتظار' : 'Student Life Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 16' : 'Phase 16'}</p>
            </div>
          )}

          {activeTab === 'official-links' && (
            <div className="text-center py-20 text-gray-500">
              <Link2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'الروابط الرسمية قيد الانتظار' : 'Official Links Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 16' : 'Phase 16'}</p>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="text-center py-20 text-gray-500">
              <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'الأدلة والمصادر قيد الانتظار' : 'Evidence & Provenance Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 06' : 'Phase 06'}</p>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="text-center py-20 text-gray-500">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">{isAr ? 'المعاينة العامة قيد الانتظار' : 'Public Preview Pending'}</p>
              <p className="text-sm">{isAr ? 'المرحلة 24' : 'Phase 24'}</p>
            </div>
          )}

          {activeTab === 'readiness' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-amber-100 text-amber-700 p-3 rounded-full mt-1 flex-shrink-0">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {isAr ? 'جاهزية الملف والمراجعة العامة' : 'Profile Readiness / Public Review'}
                    </h3>
                    <p className="text-sm font-semibold text-amber-700 mt-1">
                      {isAr ? 'الحالة الحالية: مسودة / غير مكتمل' : 'Current status: Draft / Incomplete'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-sm mb-6">
                  <p className="font-semibold text-slate-800 mb-3">{isAr ? 'الأقسام المطلوبة المفقودة:' : 'Missing required sections:'}</p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
                    <li>{isAr ? 'الجامعات (المرحلة 11)' : 'Universities (Phase 11)'}</li>
                    <li>{isAr ? 'التخصصات (المرحلة 10)' : 'Majors (Phase 10)'}</li>
                    <li>{isAr ? 'المنح الدراسية (المرحلة 12)' : 'Scholarships (Phase 12)'}</li>
                    <li>{isAr ? 'التأشيرة والمعيشة والحياة الطلابية (المرحلة 16)' : 'Visa, Living & Student Life (Phase 16)'}</li>
                  </ul>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-end">
                  <button disabled className="bg-gray-100 text-gray-400 font-semibold py-2.5 px-6 rounded-xl cursor-not-allowed border border-gray-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {isAr ? 'جاهز للمراجعة العامة' : 'Ready for Public Review'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
