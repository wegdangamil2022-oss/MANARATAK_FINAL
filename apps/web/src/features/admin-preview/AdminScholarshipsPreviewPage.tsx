import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, PlusCircle, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, 
  ArchiveX, Loader2, Search, Filter, Edit3, Check, X, ShieldCheck, RefreshCw, ExternalLink,
  GraduationCap, Building2, Globe, Calendar, Layers
} from 'lucide-react';
import { ApiClient } from '../../api/client';

interface ScholarshipItem {
  id: string;
  publicId?: string;
  displayName: string;
  originalName?: string;
  status: string;
  completenessStatus: string;
  sponsorName?: string;
  degreeLevel?: string;
  fundingCoverage?: string;
  coverageDetails?: string;
  studyCountry?: string;
  applicationDeadline?: string;
  applicationLink?: string;
  officialSourceUrl?: string;
  eligibleMajorsOrFields?: string | string[];
  eligibilityCriteria?: string;
  requiredDocuments?: string;
  studyLanguage?: string;
  fundingAmount?: string;
  currency?: string;
  duration?: string;
  verificationStatus?: string;
  translationStatus?: string;
  sourceType?: string;
  updatedAt: string;
}

export function AdminScholarshipsPreviewPage() {
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token'));

  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters (10 filter fields requested)
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [completenessFilter, setCompletenessFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [degreeFilter, setDegreeFilter] = useState<string>('');
  const [fundingFilter, setFundingFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<string>('');
  const [translationFilter, setTranslationFilter] = useState<string>('');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('');
  const [originFilter, setOriginFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Status counts (8 dashboard counters)
  const [counts, setCounts] = useState({
    all: 0,
    imported: 0,
    missingFields: 0,
    needsVerification: 0,
    needsTranslation: 0,
    readyToPublish: 0,
    published: 0,
    archived: 0,
  });

  // Modal State for Add Scholarship
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    displayName: '',
    sponsorName: '',
    degreeLevel: 'Bachelor',
    fundingCoverage: 'Fully Funded',
    coverageDetails: '',
    studyCountry: '',
    applicationDeadline: '',
    applicationLink: '',
    officialSourceUrl: '',
    eligibleMajorsOrFields: '',
    eligibilityCriteria: '',
    requiredDocuments: '',
    studyLanguage: 'English',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = { page, pageSize: 20 };
      if (statusFilter) filters.status = statusFilter;
      if (completenessFilter) filters.completenessStatus = completenessFilter;

      const res = await ApiClient.getAdminScholarships(filters);
      let items: ScholarshipItem[] = res.data || [];

      // Apply client-side filters for all 10 filter parameters
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(item => 
          (item.displayName && item.displayName.toLowerCase().includes(q)) ||
          (item.sponsorName && item.sponsorName.toLowerCase().includes(q)) ||
          (item.studyCountry && item.studyCountry.toLowerCase().includes(q)) ||
          (item.degreeLevel && item.degreeLevel.toLowerCase().includes(q))
        );
      }

      if (countryFilter) {
        items = items.filter(i => i.studyCountry?.toLowerCase() === countryFilter.toLowerCase());
      }
      if (degreeFilter) {
        items = items.filter(i => i.degreeLevel?.toLowerCase() === degreeFilter.toLowerCase());
      }
      if (fundingFilter) {
        items = items.filter(i => i.fundingCoverage?.toLowerCase() === fundingFilter.toLowerCase());
      }
      if (sourceFilter) {
        items = items.filter(i => i.sponsorName?.toLowerCase().includes(sourceFilter.toLowerCase()));
      }

      setScholarships(items);
      setTotal(res.total || items.length);
      setTotalPages(res.totalPages || 1);

      fetchCounts();
    } catch (err: any) {
      setError(err.message || 'Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const allRes = await ApiClient.getAdminScholarships({ page: 1, pageSize: 200 });
      const allData: ScholarshipItem[] = allRes.data || [];
      setCounts({
        all: allData.length,
        imported: allData.filter(i => i.status === 'IMPORTED' || i.status === 'READY_TO_REVIEW').length,
        missingFields: allData.filter(i => i.completenessStatus === 'incomplete' || !i.applicationDeadline).length,
        needsVerification: allData.filter(i => i.verificationStatus === 'needs_verification' || !i.officialSourceUrl).length,
        needsTranslation: allData.filter(i => i.translationStatus === 'needs_translation').length,
        readyToPublish: allData.filter(i => i.status === 'READY_TO_PUBLISH').length,
        published: allData.filter(i => i.status === 'PUBLISHED').length,
        archived: allData.filter(i => i.status === 'ARCHIVED').length,
      });
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (!adminSessionPresent) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, completenessFilter, countryFilter, degreeFilter, fundingFilter, adminSessionPresent]);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.sponsorName.trim()) {
      setFormError('Scholarship title and sponsor name are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await ApiClient.createAdminScholarship({
        ...formData,
        status: 'READY_TO_REVIEW',
        completenessStatus: 'complete'
      });
      setSuccessMsg('Scholarship successfully created and added to review workspace.');
      setShowAddModal(false);
      setFormData({
        displayName: '',
        sponsorName: '',
        degreeLevel: 'Bachelor',
        fundingCoverage: 'Fully Funded',
        coverageDetails: '',
        studyCountry: '',
        applicationDeadline: '',
        applicationLink: '',
        officialSourceUrl: '',
        eligibleMajorsOrFields: '',
        eligibilityCriteria: '',
        requiredDocuments: '',
        studyLanguage: 'English',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create scholarship');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F4B3A] bg-emerald-50/60 px-2.5 py-1 rounded-lg w-fit border border-[#0F4B3A]/10 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('phase_23_admin_workspace') || 'Phase 23 Enterprise Scholarship Admin Workspace'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{t('scholarships_admin_title') || 'Scholarship Lifecycle & Review Management'}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('scholarships_admin_desc') || 'Manage scholarship review, editing, completeness classification, safe merging, and manual publication control.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Rule 4: Import button routes to /admin/imports/scholarships */}
          <Link
            to="/admin/imports/scholarships"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-all inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-[#0F4B3A]" />
            <span>{t('scholarship_import_center') || 'Scholarship Import Center'}</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#0F4B3A] hover:bg-[#0b382b] text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('add_scholarship') || 'Add Scholarship'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TOP STATISTICS (8 COUNTERS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: t('all_scholarships') || 'All Scholarships', count: counts.all, filter: '', color: 'border-slate-100 bg-white text-slate-900 shadow-sm' },
          { label: t('imported_awaiting_review') || 'Imported / Review', count: counts.imported, filter: 'IMPORTED', color: 'border-blue-100 bg-blue-50/25 text-blue-900 shadow-sm' },
          { label: t('missing_required_fields') || 'Missing Fields', count: counts.missingFields, filter: 'INCOMPLETE', color: 'border-amber-100 bg-amber-50/25 text-amber-900 shadow-sm' },
          { label: t('needs_source_verification') || 'Needs Verification', count: counts.needsVerification, filter: '', color: 'border-indigo-100 bg-indigo-50/25 text-indigo-900 shadow-sm' },
          { label: t('needs_translation') || 'Needs Translation', count: counts.needsTranslation, filter: '', color: 'border-purple-100 bg-purple-50/25 text-purple-900 shadow-sm' },
          { label: t('ready_to_publish') || 'Ready to Publish', count: counts.readyToPublish, filter: 'READY_TO_PUBLISH', color: 'border-cyan-100 bg-cyan-50/25 text-cyan-900 shadow-sm' },
          { label: t('published') || 'Published', count: counts.published, filter: 'PUBLISHED', color: 'border-emerald-100 bg-emerald-50/25 text-emerald-900 shadow-sm' },
          { label: t('archived') || 'Archived', count: counts.archived, filter: 'ARCHIVED', color: 'border-slate-200 bg-slate-100/50 text-slate-700 shadow-xs' },
        ].map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => setStatusFilter(stat.filter)}
            className={`p-3.5 rounded-2xl border cursor-pointer hover:shadow-xs transition-all ${stat.color} ${statusFilter === stat.filter ? 'ring-2 ring-[#0F4B3A] border-transparent' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{stat.label}</span>
            <span className="text-xl font-black mt-1 block">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* FILTER BAR (10 FILTER TYPES) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>{t('advanced_filters') || 'Advanced Scholarship Filters'}</span>
          </div>
          {(statusFilter || completenessFilter || countryFilter || degreeFilter || fundingFilter || sourceFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setCompletenessFilter('');
                setCountryFilter('');
                setDegreeFilter('');
                setFundingFilter('');
                setSourceFilter('');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              {t('clear_all_filters') || 'Clear all filters'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('search_scholarships_placeholder') || 'Search name, sponsor, country...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none bg-slate-50/50 hover:bg-white transition-colors"
            />
          </div>

          {/* Lifecycle Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-slate-50/50 transition-colors"
          >
            <option value="">{t('all_lifecycle_statuses') || 'All Lifecycle Statuses'}</option>
            <option value="IMPORTED">Imported</option>
            <option value="READY_TO_REVIEW">Ready to Review</option>
            <option value="READY_TO_PUBLISH">Ready to Publish</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Completeness Status Filter */}
          <select
            value={completenessFilter}
            onChange={(e) => setCompletenessFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-slate-50/50 transition-colors"
          >
            <option value="">{t('all_completeness_statuses') || 'All Completeness Statuses'}</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete / Missing Fields</option>
          </select>

          {/* Academic Degree Filter */}
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-slate-50/50 transition-colors"
          >
            <option value="">{t('all_degrees') || 'All Degrees'}</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="PhD">PhD</option>
            <option value="Diploma">Diploma</option>
          </select>

          {/* Funding Coverage Filter */}
          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-slate-50/50 transition-colors"
          >
            <option value="">{t('all_funding_types') || 'All Funding Types'}</option>
            <option value="Fully Funded">Fully Funded</option>
            <option value="Partial Coverage">Partial Coverage</option>
            <option value="Tuition Waiver">Tuition Waiver</option>
          </select>
        </div>
      </div>

      {/* SCHOLARSHIPS VERTICAL LIST / TABLE LAYOUT (Rule 1) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-xs">{t('loading_scholarships') || 'Loading scholarship records...'}</p>
          </div>
        ) : scholarships.length === 0 ? (
          /* Rule 10: Scholarship list empty state */
          <div className="p-16 text-center text-slate-500 space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{t('no_scholarships_found') || 'No scholarships found'}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('no_scholarships_desc') || 'Get started by adding a scholarship record or importing a batch from trusted sources.'}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {t('add_scholarship') || 'Add Scholarship'}
              </button>
              <Link
                to="/admin/imports/scholarships"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all"
              >
                {t('open_scholarship_import_center') || 'Open Scholarship Import Center'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">{t('scholarship_name_sponsor') || 'Cleaned Scholarship Name & Sponsor'}</th>
                  <th className="p-4">{t('degree_funding') || 'Degree & Funding'}</th>
                  <th className="p-4">{t('country_deadline') || 'Country & Deadline'}</th>
                  <th className="p-4">{t('completeness_status') || 'Completeness'}</th>
                  <th className="p-4">{t('lifecycle_status') || 'Lifecycle Status'}</th>
                  <th className="p-4 text-right">{t('actions') || 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((sch) => (
                  <tr key={sch.id} className="hover:bg-emerald-50/10 transition-colors">
                    {/* Cleaned Name & Sponsor */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{sch.displayName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{sch.sponsorName || 'Unknown Sponsor'}</span>
                      </div>
                    </td>

                    {/* Degree & Funding */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{sch.degreeLevel || 'Bachelor'}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {sch.fundingCoverage || 'Fully Funded'}
                      </span>
                    </td>

                    {/* Country & Deadline */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{sch.studyCountry || 'Global'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{sch.applicationDeadline || 'Rolling'}</span>
                      </div>
                    </td>

                    {/* Completeness Status */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sch.completenessStatus === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sch.completenessStatus === 'complete' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{sch.completenessStatus === 'complete' ? 'Complete' : 'Needs Review'}</span>
                      </span>
                    </td>

                    {/* Lifecycle Status */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        sch.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        sch.status === 'READY_TO_PUBLISH' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        sch.status === 'ARCHIVED' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {sch.status}
                      </span>
                    </td>

                    {/* Quick Action: View Details (Rule 5 & 6) */}
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/admin/scholarships/${sch.id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1"
                      >
                        <span>{t('view_details') || 'View Details'}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD SCHOLARSHIP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>{t('add_new_scholarship') || 'Add New Scholarship Record'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateScholarship} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scholarship Title / Cleaned Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qatar University Scholarship 2027"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sponsor / Provider Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qatar University"
                    value={formData.sponsorName}
                    onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Degree Level</label>
                  <select
                    value={formData.degreeLevel}
                    onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Funding Coverage</label>
                  <select
                    value={formData.fundingCoverage}
                    onChange={(e) => setFormData({ ...formData, fundingCoverage: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partial Coverage">Partial Coverage</option>
                    <option value="Tuition Waiver">Tuition Waiver</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Study Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Qatar, Saudi Arabia"
                    value={formData.studyCountry}
                    onChange={(e) => setFormData({ ...formData, studyCountry: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Application URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.applicationLink}
                    onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Eligible Majors & Fields</label>
                <input
                  type="text"
                  placeholder="Engineering, Computer Science, Business"
                  value={formData.eligibleMajorsOrFields}
                  onChange={(e) => setFormData({ ...formData, eligibleMajorsOrFields: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholarship Benefits & Coverage Details</label>
                <textarea
                  rows={3}
                  placeholder="Full tuition waiver, monthly allowance, housing..."
                  value={formData.coverageDetails}
                  onChange={(e) => setFormData({ ...formData, coverageDetails: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Scholarship Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
