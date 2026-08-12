import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import { 
  FileSpreadsheet, 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UploadCloud, 
  RefreshCw, 
  Loader2, 
  Check, 
  PlusCircle,
  HelpCircle,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { adminApiClient } from "../api/client";

export function ImportAdminPage() {
  const { t, language } = useTranslation();

  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const handleQueueAction = async (batchId: string, action: 'pause' | 'resume' | 'cancel' | 'replay') => {
    setActionLoading(`${batchId}-${action}`);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminApiClient.request(`/admin/imports/queue/jobs/${batchId}/${action}`, { method: 'POST' });
      setSuccessMsg(`Successfully executed ${action} on job ${batchId}`);
      await loadData(selectedDomain);
    } catch(err: any) {
      setErrorMsg(err.message || `Failed to ${action} queue job`);
    } finally {
      setActionLoading(null);
    }
  };
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  
  const [metrics, setMetrics] = useState({
    batchesCount: 0,
    totalRecords: 0,
    needsReviewCount: 0,
    failedCount: 0,
    readyCount: 0,
  });

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [modalDomain, setModalDomain] = useState<string>('SCHOLARSHIPS');
  const [importText, setImportText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<React.ReactNode | null>(null);

  const loadData = async (domain = selectedDomain) => {
    setLoading(true);
    try {
      const domainParam = domain === 'ALL' ? '' : domain;
      const batchesUrl = `/admin/imports/batches` + (domainParam ? `?dataType=${domainParam}` : '');
      const recordsUrl = `/admin/imports/records?pageSize=50` + (domainParam ? `&dataType=${domainParam}` : '');

      const [fetchedBatches, recordsRes] = await Promise.all([
        adminApiClient.request<any[]>(batchesUrl),
        adminApiClient.request<{ data: any[]; total: number }>(recordsUrl),
      ]);

      
      const recs = recordsRes.data || [];
      const batchList = fetchedBatches || [];
      // Also fetch queue jobs status for each batch
      const batchesWithJobs = await Promise.all(batchList.map(async (b: any) => {
        try {
          const jobRes = await adminApiClient.request(`/admin/imports/queue/jobs/${b.id}`);
          return { ...b, jobStatus: jobRes ? (jobRes as any).status : 'NO_JOB' };
        } catch(e) {
          return { ...b, jobStatus: 'UNKNOWN' };
        }
      }));
      setBatches(batchesWithJobs);

      setRecords(recs);

      setMetrics({
        batchesCount: (fetchedBatches || []).length,
        totalRecords: recordsRes.total || recs.length,
        needsReviewCount: recs.filter((r: any) => r.status === 'NEEDS_REVIEW' || r.status === 'INCOMPLETE').length,
        failedCount: recs.filter((r: any) => r.status === 'FAILED').length,
        readyCount: recs.filter((r: any) => r.status === 'READY_FOR_REVIEW').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDomain);
  }, [selectedDomain]);

  const insertSampleCsv = (domain = modalDomain) => {
    let sample = '';
    if (domain === 'SCHOLARSHIPS') {
      sample = `scholarshipName,fundingCoverage,degreeLevel,applicationLink,officialSourceUrl,sponsorName,studyCountry,applicationDeadline,eligibleMajorsOrFields
King Abdulaziz University Scholarship,Fully Funded,Master,https://kau.edu.sa/apply,https://kau.edu.sa,Ministry of Education,Saudi Arabia,2027-11-30,Computer Science
Chevening UK Leadership Scholarship,Fully Funded,Master,https://chevening.org/apply,https://chevening.org,UK Foreign Office,United Kingdom,2027-11-03,All Majors
DAAD German Academic Exchange,Fully Funded,Master,https://daad.de/apply,https://daad.de,DAAD Germany,Germany,2027-10-15,Engineering`;
    } else if (domain === 'UNIVERSITIES') {
      sample = `name,country,city,institutionType,officialWebsite,foundedYear
Qatar University,Qatar,Doha,Public,https://www.qu.edu.qa,1977
Istanbul Technical University,Turkey,Istanbul,Public,https://www.itu.edu.tr,1773`;
    } else if (domain === 'MAJORS') {
      sample = `name,facultyName,classificationCode
Software Engineering,College of Engineering,SWE-404
Financial Technology,School of Business,FIN-302`;
    } else if (domain === 'INTERNATIONAL_TESTS') {
      sample = `testCode,name,nameAr,testCategory,providerName,officialSourceUrl,description,totalDurationMinutes,skillSections,scoringScale
IELTS-ACAD,IELTS Academic,اختبار آيلتس الأكاديمي,Language,IDP / British Council / Cambridge,https://ielts.org/take-a-test/test-types/ielts-academic,Official English language proficiency test for academic study,165,Listening;Reading;Writing;Speaking,1.0 - 9.0 Band Scale
TOEFL-IBT,TOEFL iBT,اختبار توفل الرقمي,Language,ETS,https://ets.org/toefl/ibt/about,Standardized academic English assessment for university entry,120,Reading;Listening;Speaking;Writing,0 - 120 Total Score`;
    } else if (domain === 'COURSES') {
      sample = `name,learningLanguage,duration,accessType
Python Essentials,English,4 weeks,Free
Academic Writing in Arabic,Arabic,6 weeks,Paid`;
    } else if (domain === 'SERVICES') {
      sample = `name,providerName,deliveryMode
Student Visa Advisory,Manaratak Concierge,Online
Academic Translation,Verified Partner,Manual`;
    }

    setImportText(sample);
    setErrorMsg(null);
  };

  const handleProcessImport = async () => {
    if (!importText.trim()) {
      setErrorMsg('Please enter or upload CSV/JSON data.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminApiClient.request<{ batch: any; records: any[] }>('/admin/imports', {
        method: 'POST',
        body: JSON.stringify({ 
          dataText: importText, 
          sourceSystem: 'ADMIN_PORTAL',
          dataType: modalDomain,
          
        }),
      });

      setSuccessMsg(
        <div className="flex flex-col gap-1 w-full text-xs font-semibold">
          <span>{`${t('import_success_msg') || 'Import batch processed!'} ${res.records.length} records ingested.`}</span>
          <span className="text-slate-600 font-medium">
            {language === 'ar' 
              ? 'السجلات محفوظة في جداول الاستيراد العامة لـ Phase 06. الترقية غير مفعلة هنا ويجب أن تتم عبر مساحة عمل المجال الخادمة.' 
              : 'Records are staged in Phase 06 generic import tables. Domain review proposal is active. Approval must be performed by the owning domain workspace.'}
          </span>
        </div>
      );
      setImportText('');
      setShowUploadModal(false);
      loadData(selectedDomain);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process import');
    } finally {
      setSubmitting(false);
    }
  };

  const domains = [
    { key: 'ALL', label: t('all_domains') || 'All Domains' },
    { key: 'SCHOLARSHIPS', label: t('domain_scholarships') || 'Scholarships' },
    { key: 'UNIVERSITIES', label: t('domain_universities') || 'Universities' },
    { key: 'MAJORS', label: t('domain_majors') || 'Majors' },
    { key: 'INTERNATIONAL_TESTS', label: t('domain_tests') || 'International Tests' },
    { key: 'COURSES', label: t('domain_courses') || 'Courses' },
    { key: 'SERVICES', label: t('domain_services') || 'Services' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('admin_imports') || 'Import Management'}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('import_control_plane_desc') || 'Control plane visibility for data import batches, validation logs, error queues, and domain review proposal.'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setShowUploadModal(true);
              const defaultModalDomain = selectedDomain === 'ALL' ? 'SCHOLARSHIPS' : selectedDomain;
              setModalDomain(defaultModalDomain);
              insertSampleCsv(defaultModalDomain);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('start_import') || 'Start Import'}</span>
          </button>
          <button
            onClick={() => loadData(selectedDomain)}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title={t('refresh') || 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Architecture Note Alert Box */}
      <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-4 flex gap-3 items-start shadow-sm">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">{t('boundary_note') || 'Architecture Boundary Note'}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('import_boundary_note') || 'Phase 06 owns generic import mechanics such as CSV/JSON parsing, batch creation, records, errors, and retries. Domain validation and review rules remain owned by each target domain.'}
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Domain Filtering Selector */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl w-fit max-w-full overflow-x-auto">
        {domains.map((dom) => (
          <button
            key={dom.key}
            onClick={() => setSelectedDomain(dom.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDomain === dom.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {dom.label}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">{metrics.batchesCount}</span>
          </div>
          <div className="font-semibold text-slate-800 mb-1 text-xs uppercase tracking-wider">{t('batches') || 'Import Batches'}</div>
          <span className="inline-block text-[10px] text-slate-500 font-medium">Active Ingestions</span>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <span className="text-2xl font-bold text-slate-800">{metrics.totalRecords}</span>
          </div>
          <div className="font-semibold text-slate-800 mb-1 text-xs uppercase tracking-wider">{t('records') || 'Imported Records'}</div>
          <span className="inline-block text-[10px] text-slate-500 font-medium">Across Batches</span>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-700">{metrics.needsReviewCount}</span>
          </div>
          <div className="font-semibold text-slate-800 mb-1 text-xs uppercase tracking-wider">{t('needs_review') || 'Needs Review'}</div>
          <span className="inline-block text-[10px] text-slate-500 font-medium">Pending Review</span>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span className="text-2xl font-bold text-rose-700">{metrics.failedCount}</span>
          </div>
          <div className="font-semibold text-slate-800 mb-1 text-xs uppercase tracking-wider">{t('issues') || 'Failed / Errors'}</div>
          <span className="inline-block text-[10px] text-slate-500 font-medium">Verification Issues</span>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">{metrics.readyCount}</span>
          </div>
          <div className="font-semibold text-slate-800 mb-1 text-xs uppercase tracking-wider">{t('ready') || 'Ready for Review'}</div>
          <span className="inline-block text-[10px] text-slate-500 font-medium">Awaiting owning domain approval</span>
        </div>
      </div>

      
      {/* Batches Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>{'Import Batches & Queue Jobs'}</span>
          <span className="text-xs text-slate-400 font-normal">{batches.length} batches</span>
        </h3>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs font-semibold">Loading batches...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
            No batches found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 font-semibold text-slate-500">Batch ID</th>
                  <th className="p-3 font-semibold text-slate-500">Domain</th>
                  <th className="p-3 font-semibold text-slate-500">Status</th>
                  <th className="p-3 font-semibold text-slate-500 text-right">Job Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono text-[10px] text-slate-600">{batch.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{batch.targetDomain}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{batch.jobStatus || 'N/A'}</td>
                    <td className="p-3 flex justify-end gap-2">
                      <button 
                        onClick={() => handleQueueAction(batch.id, 'pause')} 
                        disabled={actionLoading === `${batch.id}-pause`}
                        className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 disabled:opacity-50 font-medium"
                      >
                        {actionLoading === `${batch.id}-pause` ? '...' : 'Pause'}
                      </button>
                      <button 
                        onClick={() => handleQueueAction(batch.id, 'resume')} 
                        disabled={actionLoading === `${batch.id}-resume`}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 disabled:opacity-50 font-medium"
                      >
                        {actionLoading === `${batch.id}-resume` ? '...' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => handleQueueAction(batch.id, 'cancel')} 
                        disabled={actionLoading === `${batch.id}-cancel`}
                        className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 disabled:opacity-50 font-medium"
                      >
                        {actionLoading === `${batch.id}-cancel` ? '...' : 'Cancel'}
                      </button>
                      <button 
                        onClick={() => handleQueueAction(batch.id, 'replay')} 
                        disabled={actionLoading === `${batch.id}-replay`}
                        className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 font-medium"
                      >
                        {actionLoading === `${batch.id}-replay` ? '...' : 'Replay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>{t('imported_records_queue') || 'Imported Records Queue'}</span>
          <span className="text-xs text-slate-400 font-normal">{records.length} {t('records') || 'records'}</span>
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs font-semibold">{t('loading') || 'Loading records...'}</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
            {t('no_records_yet') || 'No records found. Click "Start Import" to ingest data.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3 text-center w-12">#</th>
                  {selectedDomain === 'ALL' && <th className="p-3">{t('domain') || 'Domain'}</th>}
                  <th className="p-3">{t('display_name') || 'Record Name'}</th>
                  <th className="p-3">{t('status') || 'Validation Status'}</th>
                  <th className="p-3">{t('missing_fields') || 'Missing Fields'}</th>
                  <th className="p-3 text-right">{t('actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {records.map((rec) => {
                  const raw = rec.rawPayload || {};
                  const name = raw.displayName || raw.scholarshipName || raw.name || raw.title || 'Unnamed Record';
                  const domainLabel = rec.batch?.dataType || 'SCHOLARSHIPS';
                  
                  // Extract secondary metadata
                  const secondary = raw.sponsorName || raw.providerName || raw.country || raw.facultyName || '';
                  const missing: string[] = rec.validationErrors || [];
                  const isReady = rec.status === 'READY_FOR_REVIEW';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-400 font-bold text-center">
                        {rec.rawPayload?._sourceRowNumber ? `#${rec.rawPayload._sourceRowNumber}` : '-'}
                      </td>
                      {selectedDomain === 'ALL' && (
                        <td className="p-3 font-semibold">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            <FolderOpen className="w-3 h-3" />
                            {domainLabel}
                          </span>
                        </td>
                      )}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{name}</div>
                        {secondary && <div className="text-[10px] text-slate-500 font-medium mt-0.5">{secondary}</div>}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold 
                          ${rec.status === 'READY_FOR_REVIEW' ? 'bg-purple-100 text-purple-800' :
                            rec.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'NEEDS_REVIEW' ? 'bg-amber-100 text-amber-800' :
                            rec.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-700'}`}>
                          {rec.status === 'READY_FOR_REVIEW' ? ('Ready for Review') :
                           rec.status === 'COMPLETE' ? (language === 'ar' ? 'مكتمل' : 'Complete') :
                           rec.status === 'NEEDS_REVIEW' ? (language === 'ar' ? 'بحاجة لمراجعة' : 'Needs Review') :
                           rec.status === 'FAILED' ? (language === 'ar' ? 'فشل' : 'Failed') :
                           rec.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {missing.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {missing.map((m, idx) => (
                              <span key={idx} className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.5 rounded border border-rose-100 font-medium">
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[10px]">{'Ready for Domain Review'}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isReady ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-purple-600" />
                              {'Ready for Review'}
                            </span>
                            <a
                              href={
                                domainLabel === 'SCHOLARSHIPS' ? '/admin/scholarships' :
                                domainLabel === 'UNIVERSITIES' ? '/admin/universities' :
                                domainLabel === 'MAJORS' ? '/admin/majors' :
                                domainLabel === 'COURSES' ? '/admin/courses' :
                                domainLabel === 'INTERNATIONAL_TESTS' ? '/admin/international-tests' :
                                '/admin/services'
                              }
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>
                                {domainLabel === 'SCHOLARSHIPS' ? (t('view_in_scholarships') || 'View in Scholarships') :
                                 domainLabel === 'UNIVERSITIES' ? (language === 'ar' ? 'عرض في لوحة الجامعات' : 'View in Universities') :
                                 domainLabel === 'MAJORS' ? (language === 'ar' ? 'عرض في لوحة التخصصات' : 'View in Majors') :
                                 domainLabel === 'COURSES' ? (language === 'ar' ? 'عرض في لوحة الدورات' : 'View in Courses') :
                                 domainLabel === 'INTERNATIONAL_TESTS' ? (language === 'ar' ? 'عرض في لوحة الاختبارات' : 'View in Tests') :
                                 (language === 'ar' ? 'عرض في لوحة الخدمات' : 'View in Services')}
                              </span>
                              <ArrowRight className="w-3 h-3 text-blue-600" />
                            </a>
                          </div>
                        ) : domainLabel === 'SERVICES' ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold italic">
                              {t('requires_domain_integration') || 'Requires owning domain workflow'}
                            </span>
                            <button
                              disabled
                              className="px-2.5 py-1 bg-slate-100 text-slate-400 font-semibold rounded text-[10px] border border-slate-200 cursor-not-allowed inline-flex items-center gap-1"
                            >
                              <PlusCircle className="w-3 h-3 text-slate-300" />
                              <span>{'Ready for Domain Review'}</span>
                            </button>
                          </div>
                        ) : rec.status === 'INCOMPLETE' || rec.status === 'FAILED' ? (
                          <button
                            disabled
                            className="px-2.5 py-1 bg-slate-100 text-slate-400 font-semibold rounded text-[10px] border border-slate-200 cursor-not-allowed inline-flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3 text-slate-300" />
                            <span>
                              {rec.status === 'FAILED' 
                                ? (language === 'ar' ? 'فشل الاستيراد - بيانات تالفة' : 'Import failed - corrupted data') 
                                : ('Cannot propose - missing fields')}
                            </span>
                          </button>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {language === 'ar'
                                ? 'الترقية تتم عبر مساحة عمل المجال'
                                : 'Approval must be done in domain workspace'}
                            </span>
                            <button
                              disabled
                              className="px-2.5 py-1 bg-slate-100 text-slate-400 font-semibold rounded text-[10px] border border-slate-200 cursor-not-allowed inline-flex items-center gap-1"
                              title="Domain review proposal is active. Approval must be performed by the owning domain workspace."
                            >
                              <PlusCircle className="w-3 h-3 text-slate-300" />
                              <span>{'Ready for Domain Review'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Import Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <span>{t('upload_import_batch') || 'Upload Import Batch'}</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>

            <div className="space-y-4">
              {/* Target Domain Selector Inside Modal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t('select_target_domain') || 'Select Target Domain:'}</label>
                <select
                  value={modalDomain}
                  onChange={(e) => {
                    const nextDom = e.target.value;
                    setModalDomain(nextDom);
                    insertSampleCsv(nextDom);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {domains.filter(d => d.key !== 'ALL').map(d => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Staging Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">
                  {language === 'ar' ? 'ملاحظة تخزين المرحلة Phase 06:' : 'Phase 06 Staging Notice:'}
                </span>
                {language === 'ar'
                  ? 'السجلات محفوظة في جداول الاستيراد العامة لـ Phase 06. الترقية غير مفعلة هنا ويجب أن تتم عبر مساحة عمل المجال الخادمة.'
                  : 'Records are staged in Phase 06 generic import tables. Domain review proposal is active. Approval must be performed by the owning domain workspace.'}
              </div>

              {modalDomain === 'SCHOLARSHIPS' && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-[11px] text-blue-800 leading-relaxed">
                  <strong>Scholarships (Phase 12 Specific Validation Rules):</strong> Automatically maps fields to scholarships, triggering completeness validations (fundingCoverage, degreeLevel, applicationLink/officialSourceUrl, and scholarshipName).
                </div>
              )}

              {modalDomain !== 'SCHOLARSHIPS' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed">
                  <strong>{modalDomain} General Ingestion:</strong> Phase 06 ingestion mechanics. Automatically accepts fields with basic record creation and generic review workflows.
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{t('paste_data_below') || 'Paste CSV or JSON payload below (Max 90KB):'}</span>
                <button
                  type="button"
                  onClick={() => insertSampleCsv(modalDomain)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded text-[11px] hover:bg-slate-200"
                >
                  {t('insert_sample_csv') || 'Insert Sample CSV'}
                </button>
              </div>

              <textarea
                rows={7}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste CSV or JSON rows here..."
                className="w-full font-mono text-[11px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none focus:border-transparent leading-normal bg-slate-50/30"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  disabled={submitting || !importText.trim()}
                  onClick={handleProcessImport}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('process_batch') || 'Process Batch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
