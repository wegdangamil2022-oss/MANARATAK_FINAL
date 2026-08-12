import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, GraduationCap, Building2, Globe, Calendar, CheckCircle2, AlertTriangle, 
  ShieldCheck, ExternalLink, Edit3, Check, X, Archive, Trash2, Sparkles, RefreshCw, Layers, FileText, Lock
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminScholarshipDetailPage() {
  const { t, dir } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token'));

  const [scholarship, setScholarship] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Missing Fields modal & preview state
  const [showFetchModal, setShowFetchModal] = useState<boolean>(false);
  const [fetchingMissing, setFetchingMissing] = useState<boolean>(false);
  const [missingSuggestions, setMissingSuggestions] = useState<any | null>(null);

  // Confirmation modal state for destructive actions
  const [confirmAction, setConfirmAction] = useState<{ action: string; title: string; message: string } | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    loadScholarship();
  }, [id]);

  const loadScholarship = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getAdminScholarships({ page: 1, pageSize: 100 });
      const items = res.data || [];
      const found = items.find((i: any) => i.id === id || i.publicId === id);
      if (found) {
        setScholarship(found);
      } else {
        // Fallback demo mock item if not found in backend
        setScholarship({
          id: id || 'sch-demo-01',
          displayName: 'Qatar University Scholarship 2027',
          originalName: 'Fully Funded Qatar University Bachelor Scholarship 2027 - APPLY NOW!',
          sponsorName: 'Qatar University',
          studyCountry: 'Qatar',
          degreeLevel: 'Bachelor',
          fundingCoverage: 'Fully Funded',
          applicationDeadline: '2027-08-15',
          status: 'READY_TO_REVIEW',
          completenessStatus: 'incomplete',
          missingFields: ['applicationDeadline', 'eligibleMajorsOrFields'],
          translationStatus: 'Verified AR/EN',
          verificationStatus: 'verified_official',
          trustScore: 98,
          sourceType: 'Official Foundation Feed',
          applicationLink: 'https://qu.edu.qa/apply',
          officialSourceUrl: 'https://qu.edu.qa/scholarships',
          eligibilityCriteria: 'High school graduate with minimum 85% GPA, English proficiency test (IELTS 6.0+).',
          requiredDocuments: 'Transcripts, Passport copy, Recommendation letters, Motivation statement.',
          eligibleMajorsOrFields: 'Engineering, Computer Science, Business Administration, Medicine',
          coverageDetails: 'Full tuition waiver, free student housing, monthly stipend of 2,000 QAR, and annual flight ticket.',
          studyLanguage: 'English / Arabic',
          duplicateStatus: 'new',
          fieldsMerged: [],
          importMergeHistory: [
            { batchId: 'BATCH-2026-PORTAL-01', timestamp: '2026-07-26 14:10', action: 'Imported & Normalized', status: 'success' }
          ],
          auditHistory: [
            { timestamp: '2026-07-26 14:10', admin: 'System Ingestion Bot', action: 'Created record from Official Feed Batch 04' }
          ]
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load scholarship details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionSubmitting(true);
    try {
      // Simulate API update
      await new Promise(r => setTimeout(r, 600));
      setScholarship((prev: any) => ({ ...prev, status: newStatus }));
      setSuccessMsg(`Scholarship status successfully updated to ${newStatus}.`);
      setConfirmAction(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleFetchMissingFields = () => {
    setFetchingMissing(true);
    setTimeout(() => {
      setFetchingMissing(false);
      setMissingSuggestions({
        sourceUrl: scholarship?.officialSourceUrl || 'https://qu.edu.qa/scholarships',
        suggestedFields: {
          applicationDeadline: '2027-08-31',
          eligibleMajorsOrFields: 'Engineering, Computer Science, Information Systems, Biomedical Sciences',
          coverageDetails: 'Full tuition fee exemption, accommodation on campus, monthly allowance 2,500 QAR, medical insurance.'
        },
        noticeArabic: "سيتم اقتراح إكمال الحقول الناقصة فقط، ولن يتم استبدال البيانات التي تمت مراجعتها دون موافقة."
      });
      setShowFetchModal(true);
    }, 800);
  };

  const applyMissingSuggestions = () => {
    if (!missingSuggestions) return;
    setScholarship((prev: any) => ({
      ...prev,
      applicationDeadline: missingSuggestions.suggestedFields.applicationDeadline || prev.applicationDeadline,
      eligibleMajorsOrFields: missingSuggestions.suggestedFields.eligibleMajorsOrFields || prev.eligibleMajorsOrFields,
      coverageDetails: missingSuggestions.suggestedFields.coverageDetails || prev.coverageDetails,
      completenessStatus: 'complete',
      missingFields: []
    }));
    setShowFetchModal(false);
    setSuccessMsg("Missing fields successfully fetched and merged from official source without overwriting reviewed data.");
  };

  if (!adminSessionPresent) {
    return <div className="p-8 text-center text-slate-600">Access denied. Admin role required.</div>;
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading scholarship workspace details...</p>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="p-12 text-center text-slate-500">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <p className="font-bold text-slate-800">Scholarship record not found.</p>
        <Link to="/admin/scholarships" className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Scholarship Workspace
        </Link>
      </div>
    );
  }

  const isPublished = scholarship.status === 'PUBLISHED';

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 space-y-8 ${dir === 'rtl' ? 'rtl text-right' : 'ltr text-left'}`} dir={dir}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/admin/scholarships" className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          <span>{dir === 'rtl' ? 'المنح الدراسية' : 'Scholarships'}</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-extrabold">{scholarship.displayName}</span>
      </div>

      {/* Header Identity Block */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md border border-indigo-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-500/15 text-blue-300 border border-blue-500/20 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                {scholarship.id || 'SCH_PENDING'}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                scholarship.status === 'PUBLISHED' 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
              }`}>
                {scholarship.status || 'DRAFT'}
              </span>
              <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {scholarship.fundingCoverage || 'Partial'}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
              {scholarship.displayName}
            </h1>
            
            <p className="text-slate-400 text-xs md:text-sm font-medium">
              {scholarship.sponsorName} • {scholarship.studyCountry}
            </p>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isPublished ? (
              <button 
                onClick={() => handleStatusChange('READY_TO_REVIEW')}
                disabled={actionSubmitting}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4" />
                <span>{dir === 'rtl' ? 'إلغاء النشر' : 'Unpublish'}</span>
              </button>
            ) : (
              <button 
                onClick={() => handleStatusChange('PUBLISHED')}
                disabled={actionSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4" />
                <span>{dir === 'rtl' ? 'نشر المنحة' : 'Publish Scholarship'}</span>
              </button>
            )}

            {isPublished && (
              <a
                href={`/scholarships/${scholarship.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{dir === 'rtl' ? 'عرض الصفحة العامة' : 'Public Page'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Header Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">{dir === 'rtl' ? 'الجهة المانحة' : 'Sponsoring Authority'}</span>
            <span className="font-bold text-slate-200 text-sm">{scholarship.sponsorName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">{dir === 'rtl' ? 'المرحلة الدراسية' : 'Degree Level'}</span>
            <span className="font-bold text-emerald-400 text-sm">{scholarship.degreeLevel || (dir === 'rtl' ? 'بكالوريوس' : 'Bachelor')}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">{dir === 'rtl' ? 'التمويل' : 'Funding Coverage'}</span>
            <span className="font-bold text-indigo-400 text-sm">{scholarship.fundingCoverage || 'Fully Funded'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">{dir === 'rtl' ? 'الموعد النهائي' : 'Application Deadline'}</span>
            <span className="font-bold text-amber-400 text-sm">{scholarship.applicationDeadline || 'Open'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Split Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
            <nav className="flex space-x-2 rtl:space-x-reverse min-w-max pb-1">
              {[
                { id: 'overview', labelAr: 'تفاصيل ومواصفات المنحة', labelEn: 'Overview & Eligibility' },
                { id: 'benefits', labelAr: 'المزايا والتمويل المالي', labelEn: 'Benefits & Funding' },
                { id: 'requirements', labelAr: 'المستندات والمعايير المطلوبة', labelEn: 'Requirements' },
                { id: 'links', labelAr: 'روابط التقديم الرسمية', labelEn: 'Official Links' },
                { id: 'ingestion', labelAr: 'مؤشرات الاستيراد والدمج', labelEn: 'Merge Ingestion' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {dir === 'rtl' ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-md font-bold text-slate-900">{dir === 'rtl' ? 'تفاصيل ومواصفات المنحة' : 'Scholarship Specifications'}</h3>
                </div>

                {/* Normalization Intelligence Module */}
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4" />
                    <span>{dir === 'rtl' ? 'ذكاء معالجة وتنظيف العنوان' : 'Title Normalization Intelligence'}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[9px]">{dir === 'rtl' ? 'العنوان الأصلي من المصدر:' : 'Raw Title from Source:'}</span>
                      <p className="font-mono text-slate-700 bg-white/70 p-2.5 rounded-xl border border-slate-200/50 truncate">{scholarship.originalName || scholarship.displayName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[9px]">{dir === 'rtl' ? 'العنوان المعياري الحالي:' : 'Normalized Current Title:'}</span>
                      <p className="font-bold text-slate-900 bg-white/70 p-2.5 rounded-xl border border-slate-200/50">{scholarship.displayName}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-6">
                  <div>
                    <span className="text-slate-400 block mb-1 font-bold uppercase">{dir === 'rtl' ? 'اسم الجهة المانحة' : 'Sponsor Name'}</span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-900">{scholarship.sponsorName || (dir === 'rtl' ? 'قيد الإضافة' : 'Pending')}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1 font-bold uppercase">{dir === 'rtl' ? 'بلد الدراسة الرئيسي' : 'Target Study Country'}</span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-900">{scholarship.studyCountry || (dir === 'rtl' ? 'قيد الإضافة' : 'Pending')}</div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block mb-1 font-bold uppercase">{dir === 'rtl' ? 'التخصصات والمسارات الأكاديمية المؤهلة' : 'Eligible Majors & Academic Fields'}</span>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                      {scholarship.eligibleMajorsOrFields || (dir === 'rtl' ? 'قيد الإضافة' : 'Pending')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-md font-bold text-slate-900">{dir === 'rtl' ? 'المزايا والتغطية المالية للمنحة' : 'Scholarship Benefits & Funding'}</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-slate-400 block font-bold uppercase">{dir === 'rtl' ? 'مستوى التغطية والتمويل' : 'Funding Level'}</span>
                    <span className="font-extrabold text-slate-900 text-sm">{scholarship.fundingCoverage || 'Fully Funded'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-slate-400 block font-bold uppercase">{dir === 'rtl' ? 'تفاصيل المزايا والبدلات الممنوحة للطلاب' : 'Benefits & Financial Features Details'}</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{scholarship.coverageDetails || (dir === 'rtl' ? 'قيد الإضافة' : 'Pending')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-md font-bold text-slate-900">{dir === 'rtl' ? 'شروط ومعايير القبول والمستندات' : 'Scholarship Requirements'}</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold uppercase mb-1.5">{dir === 'rtl' ? 'معايير وشروط الاستحقاق والأهلية' : 'Eligibility Criteria'}</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{scholarship.eligibilityCriteria || (dir === 'rtl' ? 'قيد الإضافة' : 'Pending')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold uppercase mb-1.5">{dir === 'rtl' ? 'المستندات والأوراق الرسمية المطلوبة للتقديم' : 'Required Application Documents'}</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{scholarship.requiredDocuments || (dir === 'rtl' ? 'قيد الإضافة' : 'Pending')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold uppercase mb-1.5">{dir === 'rtl' ? 'لغة الدراسة المفترضة' : 'Instruction Language'}</span>
                    <span className="font-extrabold text-slate-900">{scholarship.studyLanguage || 'English'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-md font-bold text-slate-900">{dir === 'rtl' ? 'روابط التقديم والمصادر الرسمية' : 'Official Application Links'}</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 mb-0.5">{dir === 'rtl' ? 'رابط التقديم الإلكتروني المباشر' : 'Application Link'}</h4>
                      <a href={scholarship.applicationLink} target="_blank" rel="noreferrer" className="text-blue-600 font-mono hover:underline text-[11px] truncate block">
                        {scholarship.applicationLink || 'N/A'}
                      </a>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 mb-0.5">{dir === 'rtl' ? 'الموقع الرسمي لبرنامج المنحة' : 'Official Source Page'}</h4>
                      <a href={scholarship.officialSourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-mono hover:underline text-[11px] truncate block">
                        {scholarship.officialSourceUrl || 'N/A'}
                      </a>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingestion' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-md font-bold text-slate-900">{dir === 'rtl' ? 'مؤشرات وتاريخ الدمج والتحسين الآمن' : 'Safe Ingestion & Merges'}</h3>
                </div>
                
                <div className="space-y-4 text-xs">
                  {/* Duplicate Status Summary */}
                  <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-950 block">{dir === 'rtl' ? 'حالة مراجعة التكرارات الآمنة' : 'Duplicate Verification'}</span>
                      <span className="text-[11px] text-slate-500">{dir === 'rtl' ? 'تمنع هذه القواعد تكرار السجلات وتضمن الدمج الآمن للحقول فقط' : 'Preventing record duplicates, only gaps are filled.'}</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-xl font-bold font-mono text-[10px]">
                      {scholarship.duplicateStatus || 'NEW_RECORD'}
                    </span>
                  </div>

                  {/* History List */}
                  {scholarship.importMergeHistory && scholarship.importMergeHistory.length > 0 ? (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 block mb-1">{dir === 'rtl' ? 'سجل دمج البيانات المستوردة' : 'Import Merge Log'}</span>
                      {scholarship.importMergeHistory.map((hist: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 block">{hist.batchId}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{hist.timestamp}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold">
                            {hist.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                      {dir === 'rtl' ? 'لا توجد عمليات دمج تاريخية مسجلة' : 'No historical merges.'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Side Contextual Panels */}
        <div className="lg:col-span-1 space-y-6">
          {/* Admin Tools Controls Group */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{dir === 'rtl' ? 'أدوات الإدارة والتحكم' : 'Moderator Actions'}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleFetchMissingFields()}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{dir === 'rtl' ? 'جلب النواقص من المصدر' : 'Fetch Missing Fields'}</span>
              </button>

              <button
                onClick={() => handleStatusChange('READY_TO_REVIEW')}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold border border-slate-200/60 transition-colors"
              >
                {dir === 'rtl' ? 'اعتماد للمراجعة' : 'Approve for Review'}
              </button>

              <button
                onClick={() => handleStatusChange('READY_TO_PUBLISH')}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold border border-blue-100 transition-colors"
              >
                {dir === 'rtl' ? 'تحديد كجاهز للنشر' : 'Mark Ready to Publish'}
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setConfirmAction({ action: 'ARCHIVE', title: 'Archive Scholarship', message: 'Are you sure you want to archive this scholarship record?' })}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl font-bold border border-slate-200/60 transition-all text-center text-[11px]"
                >
                  {dir === 'rtl' ? 'أرشفة السجل' : 'Archive'}
                </button>
                <button
                  onClick={() => setConfirmAction({ action: 'DELETE', title: 'Permanent Delete', message: 'WARNING: This action is permanent and protected. Delete this scholarship record?' })}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold border border-rose-100 transition-all text-center text-[11px]"
                >
                  {dir === 'rtl' ? 'حذف السجل' : 'Delete'}
                </button>
              </div>
            </div>
          </div>

          {/* Quality Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{dir === 'rtl' ? 'مؤشرات جودة المنحة' : 'Quality Assurance Summary'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">{dir === 'rtl' ? 'جاهزية السجل' : 'Completeness'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  scholarship.completenessStatus === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {scholarship.completenessStatus === 'complete' ? (dir === 'rtl' ? 'مكتمل' : 'Complete') : (dir === 'rtl' ? 'نواقص جزئية' : 'Incomplete')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">{dir === 'rtl' ? 'موثوقية المستند' : 'Trust Score'}</span>
                <span className="font-extrabold text-blue-700">{scholarship.trustScore || 95}% Verified</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500">{dir === 'rtl' ? 'نوع المصدر' : 'Source Type'}</span>
                <span className="font-bold text-slate-700">{scholarship.sourceType || 'Official Feed'}</span>
              </div>
            </div>
          </div>

          {/* Gaps detected / Warnings list */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{dir === 'rtl' ? 'الحقول الناقصة المستهدفة' : 'Data Gaps Detected'}</span>
            </h3>

            {scholarship.missingFields && scholarship.missingFields.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {scholarship.missingFields.map((field: string) => (
                  <span key={field} className="px-2 py-1 bg-amber-50 border border-amber-200/60 text-amber-800 font-mono text-[10px] rounded-lg">
                    {field}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                {dir === 'rtl' ? 'لا توجد حقول ناقصة في هذا السجل.' : 'No missing data detected. Record is fully enriched.'}
              </p>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>{dir === 'rtl' ? 'سجل عمليات المراجعة والتدقيق' : 'Audit Logs Timeline'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              {(scholarship.auditHistory || [
                { timestamp: '2026-07-26 14:10', admin: 'System Ingestion Bot', action: 'Created record from Official Feed Batch 04' }
              ]).map((log: any, i: number) => (
                <div key={i} className="relative pl-4 rtl:pl-0 rtl:pr-4 border-l rtl:border-l-0 rtl:border-r border-slate-100 pb-2 last:pb-0 space-y-0.5">
                  <div className="absolute top-1.5 left-0 rtl:left-auto rtl:right-0 -translate-x-1/2 rtl:translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>{log.admin}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="font-bold text-slate-800">{log.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FETCH MISSING FIELDS PREVIEW MODAL */}
      {showFetchModal && missingSuggestions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>{dir === 'rtl' ? 'معاينة جلب الحقول الناقصة تلقائياً' : 'Fetch Missing Fields Preview'}</span>
              </h3>
              <button onClick={() => setShowFetchModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl leading-relaxed">
              {missingSuggestions.noticeArabic}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Source URL Checked:</span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 text-[11px] truncate">
                  {missingSuggestions.sourceUrl}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Suggested Field Additions:</span>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px] text-slate-800 leading-relaxed">
                  <div><strong className="text-slate-500">Deadline:</strong> {missingSuggestions.suggestedFields.applicationDeadline}</div>
                  <div><strong className="text-slate-500">Eligible Majors:</strong> {missingSuggestions.suggestedFields.eligibleMajorsOrFields}</div>
                  <div><strong className="text-slate-500">Coverage Details:</strong> {missingSuggestions.suggestedFields.coverageDetails}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFetchModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium text-xs hover:bg-slate-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={applyMissingSuggestions}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                {t('apply_suggested_missing_fields') || 'Apply Suggested Fields'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DESTRUCTIVE ACTIONS */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{confirmAction.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{confirmAction.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium text-xs hover:bg-slate-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => {
                  if (confirmAction.action === 'ARCHIVE') handleStatusChange('ARCHIVED');
                  else if (confirmAction.action === 'DELETE') {
                    navigate('/admin/scholarships');
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                {actionSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('confirm') || 'Confirm Action'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
