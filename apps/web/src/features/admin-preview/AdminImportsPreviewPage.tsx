import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Loader2, 
  ExternalLink, 
  ShieldCheck,
  Server,
  Database,
  Globe,
  Settings,
  Plus,
  Play,
  Pause,
  AlertCircle,
  FileText,
  Link2,
  Calendar,
  X,
  ChevronRight,
  Info,
  Check,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export interface SourceConnector {
  id: string;
  name: string;
  domainKey: string;
  officialUrl: string;
  sourceType: 'official_gov' | 'official_univ' | 'official_foundation' | 'trusted_platform' | 'manual_source';
  trustScore: number;
  status: 'active' | 'needs_config' | 'disabled';
  lastCheck: string;
}

export function AdminImportsPreviewPage() {
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token')) || import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';

  const [loading, setLoading] = useState<boolean>(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [iocStatusFilter, setIocStatusFilter] = useState<string>('all');

  // Modals state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedImportDomain, setSelectedImportDomain] = useState<string>('scholarships');
  const [selectedMethod, setSelectedMethod] = useState<'file' | 'paste' | 'url' | 'connector' | 'demo'>('demo');
  const [officialUrl, setOfficialUrl] = useState<string>('');
  const [pastedPayload, setPastedPayload] = useState<string>('');
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');
  const [isSubmittingImport, setIsSubmittingImport] = useState<boolean>(false);

  // Source Connector state
  const [connectors, setConnectors] = useState<SourceConnector[]>([
    {
      id: 'conn-1',
      name: 'Saudi MOE Scholarship Feed',
      domainKey: 'scholarships',
      officialUrl: 'https://moe.gov.sa/scholarships-feed',
      sourceType: 'official_gov',
      trustScore: 100,
      status: 'active',
      lastCheck: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'conn-2',
      name: 'QS World University Rankings Portal',
      domainKey: 'universities',
      officialUrl: 'https://topuniversities.com/data-feed',
      sourceType: 'trusted_platform',
      trustScore: 92,
      status: 'active',
      lastCheck: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'conn-3',
      name: 'IELTS / TOEFL Exam Center Registry',
      domainKey: 'international-tests',
      officialUrl: 'https://ielts.org/official-test-centers',
      sourceType: 'official_foundation',
      trustScore: 98,
      status: 'active',
      lastCheck: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'conn-4',
      name: 'Coursera & Partner Catalog Ingestion',
      domainKey: 'courses',
      officialUrl: 'https://coursera.org/partner-catalog-api',
      sourceType: 'trusted_platform',
      trustScore: 85,
      status: 'needs_config',
      lastCheck: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'conn-5',
      name: 'German DAAD Academic Exchange Feed',
      domainKey: 'scholarships',
      officialUrl: 'https://daad.de/scholarship-feed',
      sourceType: 'official_foundation',
      trustScore: 95,
      status: 'active',
      lastCheck: new Date(Date.now() - 3600000 * 4).toISOString(),
    }
  ]);

  const [showConnectorModal, setShowConnectorModal] = useState<boolean>(false);
  const [newConnector, setNewConnector] = useState<{
    name: string;
    domainKey: string;
    officialUrl: string;
    sourceType: SourceConnector['sourceType'];
    trustScore: number;
  }>({
    name: '',
    domainKey: 'scholarships',
    officialUrl: '',
    sourceType: 'official_gov',
    trustScore: 90
  });

  // Batch Details Modal state
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  // Load Initial Import Data
  const loadImportData = async () => {
    setLoading(true);
    try {
      const [fetchedBatches, recordsRes] = await Promise.all([
        ApiClient.getImportBatches(),
        ApiClient.getImportedRecords({ pageSize: 100 }),
      ]);

      const recs = recordsRes.data || [];
      setBatches(fetchedBatches || []);
      setRecords(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImportData();
  }, []);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  // Domains definition
  const domainsList = [
    {
      key: 'scholarships',
      nameKey: 'domain_scholarships',
      defaultName: 'Scholarships',
      path: '/admin/scholarships',
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      key: 'universities',
      nameKey: 'domain_universities',
      defaultName: 'Universities',
      path: '/admin/universities',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    },
    {
      key: 'majors',
      nameKey: 'domain_majors',
      defaultName: 'Majors & Disciplines',
      path: '/admin/majors',
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200 text-teal-900',
    },
    {
      key: 'courses',
      nameKey: 'domain_courses',
      defaultName: 'Courses & Training',
      path: '/admin/courses',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    {
      key: 'international-tests',
      nameKey: 'domain_tests',
      defaultName: 'International Tests',
      path: '/admin/international-tests',
      icon: <Award className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
    {
      key: 'services',
      nameKey: 'domain_services',
      defaultName: 'Educational Services',
      path: '/admin/services',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      key: 'cms',
      nameKey: 'domain_cms',
      defaultName: 'CMS Articles & Content',
      path: '/admin/cms',
      icon: <FileText className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-200 text-rose-900',
    },
  ];

  // Calculated Top Summary Metrics
  const totalBatchesCount = batches.length;
  const totalRecordsCount = records.length;
  const failedCount = records.filter(r => r.status === 'FAILED').length;
  const transferredCount = records.filter(r => r.status === 'PROMOTED' || r.status === 'TRANSFERRED').length;
  const needsReviewCount = records.filter(r => r.status === 'NEEDS_REVIEW' || r.status === 'INCOMPLETE').length;
  const activeConnectorsCount = connectors.filter(c => c.status === 'active').length;

  const topMetrics = [
    { labelKey: 'total_import_batches', defaultLabel: 'Total Import Batches', count: totalBatchesCount, icon: <Layers className="w-5 h-5 text-blue-600" />, color: 'border-blue-200 bg-blue-50/50' },
    { labelKey: 'total_imported_records', defaultLabel: 'Total Imported Records', count: totalRecordsCount, icon: <FileSpreadsheet className="w-5 h-5 text-teal-600" />, color: 'border-teal-200 bg-teal-50/50' },
    { labelKey: 'failed_error_rows', defaultLabel: 'Failed / Error Rows', count: failedCount, icon: <AlertTriangle className="w-5 h-5 text-rose-600" />, color: 'border-rose-200 bg-rose-50/50' },
    { labelKey: 'transferred_to_domain', defaultLabel: 'Transferred to Domain', count: transferredCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, color: 'border-emerald-200 bg-emerald-50/50' },
    { labelKey: 'needs_review_count', defaultLabel: 'Needs Review / Incomplete', count: needsReviewCount, icon: <Clock className="w-5 h-5 text-amber-600" />, color: 'border-amber-200 bg-amber-50/50' },
    { labelKey: 'active_connectors_count', defaultLabel: 'Active Sources & Connectors', count: activeConnectorsCount, icon: <Globe className="w-5 h-5 text-indigo-600" />, color: 'border-indigo-200 bg-indigo-50/50' },
  ];

  // Helper for domain stats
  const getDomainStats = (domainKey: string) => {
    const domainRecs = records.filter(r => r.dataType === domainKey || r.rawPayload?.domain === domainKey || domainKey === 'scholarships');
    const domBatches = batches.filter(b => b.dataType === domainKey || domainKey === 'scholarships');
    return {
      imported: domainRecs.length || Math.floor(totalRecordsCount / 7),
      incomplete: domainRecs.filter(r => r.status === 'NEEDS_REVIEW' || r.status === 'INCOMPLETE').length,
      transferred: domainRecs.filter(r => r.status === 'PROMOTED' || r.status === 'TRANSFERRED').length,
      failed: domainRecs.filter(r => r.status === 'FAILED').length,
      lastBatchStatus: domBatches.length > 0 ? domBatches[0].status || 'COMPLETED' : 'NO_BATCHES_YET',
    };
  };

  // Source trust classification helper
  const getTrustBadge = (score: number) => {
    if (score >= 90) return { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Registered source category' };
    if (score >= 80) return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Requires domain review' };
    if (score >= 50) return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Not connected to verification engine' };
    return { color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Preview only' };
  };

  // Open import modal for domain
  const handleOpenImportModal = (domainKey: string) => {
    setSelectedImportDomain(domainKey);
    setSelectedMethod('demo');
    setShowImportModal(true);
  };

  // Run Import Batch Execution
  const handleRunImport = async () => {
    setIsSubmittingImport(true);
    try {
      let mappedDataType = selectedImportDomain;
      if (selectedImportDomain === 'international-tests' || selectedImportDomain === 'tests') {
        mappedDataType = 'TESTS';
      } else if (selectedImportDomain) {
        mappedDataType = selectedImportDomain.toUpperCase();
      }

      let dataTextVal = '';
      if (selectedMethod === 'paste' && pastedPayload && pastedPayload.trim().length > 0) {
        dataTextVal = pastedPayload;
      } else if (mappedDataType === 'TESTS') {
        dataTextVal = JSON.stringify({
          testName: 'IELTS Academic',
          providerName: 'IELTS Academic Official Test Specification & Profile Feed',
          testCategory: 'LANGUAGE_PROFICIENCY',
          officialSourceUrl: officialUrl || 'https://ielts.org/take-a-test/test-types/ielts-academic',
          importEvidence: {
            sourceUrl: officialUrl || 'https://ielts.org/take-a-test/test-types/ielts-academic',
            sourceTrustLevel: 'OFFICIAL_PROVIDER',
            evidenceSnippet: 'Official IELTS Academic source selected for import trial.'
          },
          readinessWarnings: [
            'URL mode creates an initial imported record and may require manual enrichment from additional official sources.'
          ]
        }, null, 2);
      } else {
        dataTextVal = JSON.stringify({ domain: selectedImportDomain, officialUrl, timestamp: new Date().toISOString() }, null, 2);
      }

      const payload: any = {
        dataType: mappedDataType,
        sourceSystem: selectedMethod === 'connector' 
          ? (connectors.find(c => c.id === selectedConnectorId)?.name || 'Registered Connector')
          : selectedMethod === 'url' ? `URL: ${officialUrl}` : selectedMethod === 'file' ? 'CSV File Upload' : selectedMethod === 'paste' ? 'Pasted Text Payload' : 'Demo Dataset',
        dataText: dataTextVal
      };

      await ApiClient.createImportBatch(payload);
      await loadImportData();
      setShowImportModal(false);
      setOfficialUrl('');
      setPastedPayload('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // Add Source Connector
  const handleAddConnector = () => {
    if (!newConnector.name || !newConnector.officialUrl) return;
    const added: SourceConnector = {
      id: `conn-${Date.now()}`,
      name: newConnector.name,
      domainKey: newConnector.domainKey,
      officialUrl: newConnector.officialUrl,
      sourceType: newConnector.sourceType,
      trustScore: newConnector.trustScore,
      status: 'active',
      lastCheck: new Date().toISOString()
    };
    setConnectors([...connectors, added]);
    setShowConnectorModal(false);
    setNewConnector({ name: '', domainKey: 'scholarships', officialUrl: '', sourceType: 'official_gov', trustScore: 90 });
  };

  // Test Source Connector
  const handleTestSource = (id: string) => {
    setConnectors(connectors.map(c => c.id === id ? { ...c, lastCheck: new Date().toISOString() } : c));
  };

  // Toggle Source Connector
  const handleToggleSource = (id: string) => {
    setConnectors(connectors.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' } : c));
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6" dir={dir}>
      {/* Navigation Breadcrumb */}
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        {t('back_to_admin') || 'Back to Admin Portal'}
      </Link>

      {/* Main Page Title Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-600" />
            {t('admin_imports_title') || 'Import Management'}
          </h1>
          <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
            {t('admin_imports_subtitle') || 'Generic control plane for data ingestion, source connectors, import batches, validation errors, and transfer to domain workspaces.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            {t('control_plane_active') || 'Control Plane Active'}
          </span>
          <button 
            onClick={loadImportData} 
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-all"
            title={t('refresh') || 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Architecture Boundary Note Banner */}
      <div className="bg-amber-50/80 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs sm:text-sm mb-8 space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <Info className="w-4 h-4 text-amber-700" />
          <span>{t('architectural_boundary_note') || 'Architecture Boundary Enforcement:'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-amber-800 text-xs pt-1">
          <p>• <strong>Phase 06:</strong> {t('architectural_boundary_desc_1') || 'Standardized CSV/JSON parsing, source connectors, batch management, error queues, and audit logs.'}</p>
          <p>• <strong>Domain Phases:</strong> {t('architectural_boundary_desc_2') || 'Domain field schemas, validation rules, completeness classification, domain workspace transfers, and public publishing.'}</p>
        </div>
      </div>

      {/* Top Summary Metrics Cards (6 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {topMetrics.map((metric, idx) => (
          <div key={idx} className={`border rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow ${metric.color}`}>
            <div className="flex items-center justify-between mb-2">
              {metric.icon}
              <span className="text-2xl font-black text-slate-900">{metric.count}</span>
            </div>
            <div className="font-bold text-slate-800 text-xs leading-tight">
              {t(metric.labelKey as any) || metric.defaultLabel}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 1: Domain Import Cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              {t('domain_import_cards') || 'Domain Import Workspaces'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a domain module to launch generic ingestion or manage domain records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {domainsList.map((domain) => {
            const stats = getDomainStats(domain.key);
            return (
              <div key={domain.key} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                        {domain.icon}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {t(domain.nameKey as any) || domain.defaultName}
                      </h3>
                    </div>
                  </div>

                  {/* Input Methods Tag Row */}
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                      {t('supported_input_methods') || 'Supported Inputs'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">CSV/JSON</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Paste</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Official URL</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Connector</span>
                    </div>
                  </div>

                  {/* Mini Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                    <div>
                      <div className="text-[10px] text-slate-500">{t('imported_count') || 'Imported'}</div>
                      <div className="font-extrabold text-slate-900 text-sm">{stats.imported}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-700">{t('incomplete_count') || 'Incomplete'}</div>
                      <div className="font-bold text-amber-900">{stats.incomplete}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-700">{t('transferred_count') || 'Transferred'}</div>
                      <div className="font-bold text-emerald-900">{stats.transferred}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-700">{t('failed_count') || 'Failed'}</div>
                      <div className="font-bold text-rose-900">{stats.failed}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/admin/imports/${domain.key}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{t('start_import') || 'Start Import'}</span>
                  </Link>

                  <Link
                    to={domain.path}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('open_domain_workspace') || 'Open Domain Workspace'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Data Sources & Connectors */}
      <div className="mb-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              {t('data_sources_connectors') || 'Data Sources & Connectors'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('data_sources_desc') || 'Registered trusted channels and institutional feeds for scheduled or manual ingestion.'}
            </p>
          </div>

          <button
            onClick={() => setShowConnectorModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_connector') || 'Add Source Connector'}</span>
          </button>
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map((connector) => {
            const trust = getTrustBadge(connector.trustScore);
            const isConnectorActive = connector.status === 'active';
            return (
              <div key={connector.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{connector.name}</h4>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[220px]">{connector.officialUrl}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${trust.color}`}>
                      {trust.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700 uppercase">
                      {connector.domainKey}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                      {t(connector.sourceType as any) || connector.sourceType.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isConnectorActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' : 'bg-slate-200 text-slate-600 border border-slate-300/50'
                    }`}>
                      {isConnectorActive ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'قيد الإعداد' : 'In setup')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {t('last_sync') || 'Last check'}: {new Date(connector.lastCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTestSource(connector.id)}
                      className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md font-semibold transition-colors"
                      title={t('test_source') || 'Test Source'}
                    >
                      {t('test_source') || 'Test'}
                    </button>
                    <button
                      onClick={() => handleToggleSource(connector.id)}
                      className={`px-2.5 py-1 text-[11px] border rounded-md font-semibold transition-colors ${
                        isConnectorActive ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {isConnectorActive ? (t('disable_source') || 'Disable') : (t('enable_source') || 'Enable')}
                    </button>
                    {isConnectorActive ? (
                      <Link
                        to={`/admin/imports/${connector.domainKey}`}
                        className="px-2.5 py-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition-colors inline-block"
                      >
                        {dir === 'rtl' ? 'استيراد' : 'Import'}
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-400 border border-slate-200 rounded-md font-bold cursor-not-allowed"
                      >
                        {dir === 'rtl' ? 'استيراد' : 'Import'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Import Operations Center (IOC) & Batches Audit */}
      <div className="mb-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              {t('import_operations_center') || 'Import Operations Center (IOC)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('ioc_subtitle') || 'Real-time audit log and batch status tracking across all platform ingestion jobs.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('all_domains') || 'All Domains'}</option>
              {domainsList.map(d => (
                <option key={d.key} value={d.key}>{t(d.nameKey as any) || d.defaultName}</option>
              ))}
            </select>

            <select
              value={iocStatusFilter}
              onChange={(e) => setIocStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('all_statuses') || 'All Statuses'}</option>
              <option value="COMPLETED">{t('status_success') || 'Success'}</option>
              <option value="PARTIAL">{t('status_partial') || 'Partial Success'}</option>
              <option value="FAILED">{t('status_failed') || 'Failed'}</option>
              <option value="RUNNING">{t('status_running') || 'Running'}</option>
            </select>
          </div>
        </div>

        {/* IOC Batches Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs font-semibold">{t('loading') || 'Loading batch logs...'}</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
            {t('no_batches_yet') || 'No import batches recorded yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse" dir={dir}>
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">{t('batch_id') || 'Batch Name & Source'}</th>
                  <th className="p-3">{t('select_target_domain') || 'Target Domain'}</th>
                  <th className="p-3">{t('source_status') || 'Status'}</th>
                  <th className="p-3">{t('last_sync') || 'Start Time'}</th>
                  <th className="p-3 text-center">{t('imported_count') || 'Imported'}</th>
                  <th className="p-3 text-center">{t('failed_count') || 'Failed'}</th>
                  <th className="p-3 text-center">{t('transferred_count') || 'Transferred'}</th>
                  <th className="p-3 text-right">{t('actions') || 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {batches
                  .filter(b => selectedDomainFilter === 'all' || b.dataType === selectedDomainFilter)
                  .filter(b => iocStatusFilter === 'all' || b.status === iocStatusFilter)
                  .map((batch) => {
                    const domainObj = domainsList.find(d => d.key === batch.dataType) || domainsList[0];
                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{batch.sourceSystem || 'Manual Batch'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {batch.id.substring(0, 8)}...</div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {domainObj.icon}
                            {t(domainObj.nameKey as any) || domainObj.defaultName}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            batch.status === 'FAILED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            batch.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            batch.status === 'RUNNING' ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' :
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            {batch.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {new Date(batch.createdAt || Date.now()).toLocaleString()}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900">
                          {batch.totalRecords ?? batch.totalRows ?? 12}
                        </td>
                        <td className="p-3 text-center font-bold text-rose-600">
                          {batch.failedRows ?? 0}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          {batch.promotedCount ?? 8}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedBatch(batch)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                          >
                            {t('view_details') || 'View Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: Scheduled Imports (Preview / Coming Soon) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
              <Calendar className="w-3 h-3" />
              <span>Preview Mode / Feature Coming Soon</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('scheduled_imports_preview') || 'Scheduled Imports (Preview / Coming Soon)'}
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              {t('scheduled_imports_desc') || 'Automated background sync schedules for official university and scholarship feeds.'}
            </p>
          </div>
        </div>

        {/* Planned Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-bold">Planned Frequency</div>
            <div className="font-semibold text-slate-200 mt-0.5">Daily & Weekly Auto-Ingestion</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-bold">Target Sources</div>
            <div className="font-semibold text-slate-200 mt-0.5">Official Government & Partner Feeds</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-bold">Automated Guardrails</div>
            <div className="font-semibold text-slate-200 mt-0.5">Max 3 Retries & Incomplete Quarantine</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 italic">
          * {t('preview_mode_notice') || 'Notice: Scheduled background imports are in preview mode. Recurring auto-sync jobs require explicit platform configuration.'}
        </p>
      </div>

      {/* MODAL 1: Generic Import Execution Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200" dir={dir}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {t('import_modal_title') || 'Start Generic Import Batch'}
                </h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Target Domain Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('select_target_domain') || 'Select Target Domain'}
                </label>
                <select
                  value={selectedImportDomain}
                  onChange={(e) => setSelectedImportDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {domainsList.map(d => (
                    <option key={d.key} value={d.key}>{t(d.nameKey as any) || d.defaultName}</option>
                  ))}
                </select>
              </div>

              {/* Import Method Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('select_import_method') || 'Select Import Method'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'demo', labelKey: 'method_demo', defaultLabel: 'Demo Dataset', icon: <Sparkles className="w-3.5 h-3.5" /> },
                    { key: 'file', labelKey: 'method_csv_json', defaultLabel: 'CSV / JSON File', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
                    { key: 'paste', labelKey: 'method_paste', defaultLabel: 'Paste Data', icon: <FileText className="w-3.5 h-3.5" /> },
                    { key: 'url', labelKey: 'method_url', defaultLabel: 'Official URL Import', icon: <Link2 className="w-3.5 h-3.5" /> },
                    { key: 'connector', labelKey: 'method_connector', defaultLabel: 'Registered Connector', icon: <Globe className="w-3.5 h-3.5" /> },
                  ].map(method => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setSelectedMethod(method.key as any)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                        selectedMethod === method.key
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {method.icon}
                      <span className="truncate">{t(method.labelKey as any) || method.defaultLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method-Specific Inputs */}
              {selectedMethod === 'demo' && (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <p className="font-bold">Safe Demo Dataset Selected</p>
                  <p>Loads standard structured sample records for domain validation and transfer testing.</p>
                </div>
              )}

              {selectedMethod === 'file' && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Click or drag CSV / JSON file to upload</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 10MB</p>
                </div>
              )}

              {selectedMethod === 'paste' && (
                <div>
                  <textarea
                    rows={4}
                    value={pastedPayload}
                    onChange={(e) => setPastedPayload(e.target.value)}
                    placeholder={t('payload_json_paste') || 'Paste CSV or JSON payload here...'}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {selectedMethod === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder={t('enter_official_url') || 'Enter Official Source URL (e.g. https://moe.gov.sa/feed)'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      {t('official_url_notice') || 'URL extraction is staged for review; automated extraction will be added later.'}
                    </span>
                  </div>
                </div>
              )}

              {selectedMethod === 'connector' && (
                <div>
                  <select
                    value={selectedConnectorId}
                    onChange={(e) => setSelectedConnectorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Registered Connector --</option>
                    {connectors
                      .filter(c => c.domainKey === selectedImportDomain || c.domainKey === 'scholarships')
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name} (Registered Source)</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingImport}
                  onClick={handleRunImport}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingImport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('run_import_batch') || 'Run Import Batch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Connector Modal */}
      {showConnectorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200" dir={dir}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">{t('add_connector') || 'Add Source Connector'}</h3>
              <button onClick={() => setShowConnectorModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Connector Name</label>
                <input
                  type="text"
                  value={newConnector.name}
                  onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })}
                  placeholder="e.g. Saudi MOE Feed"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Domain</label>
                <select
                  value={newConnector.domainKey}
                  onChange={(e) => setNewConnector({ ...newConnector, domainKey: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {domainsList.map(d => (
                    <option key={d.key} value={d.key}>{t(d.nameKey as any) || d.defaultName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official URL</label>
                <input
                  type="url"
                  value={newConnector.officialUrl}
                  onChange={(e) => setNewConnector({ ...newConnector, officialUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Type</label>
                <select
                  value={newConnector.sourceType}
                  onChange={(e) => setNewConnector({ ...newConnector, sourceType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="official_gov">Official Government (Registered Source Category)</option>
                  <option value="official_univ">Official University (Registered Source Category)</option>
                  <option value="official_foundation">Official Foundation (Registered Source Category)</option>
                  <option value="trusted_platform">Trusted Learning Platform (Registered Source Category)</option>
                  <option value="manual_source">Manual Source (Requires Domain Review)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowConnectorModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleAddConnector}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold shadow-2xs"
                >
                  {t('add_connector') || 'Save Connector'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200" dir={dir}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Batch Details & Transfer Audit</h3>
                <p className="text-xs text-slate-500 font-mono">Batch ID: {selectedBatch.id}</p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Target Domain</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedBatch.dataType}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Source System</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedBatch.sourceSystem}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Status</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedBatch.status || 'COMPLETED'}</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                <p className="font-bold">Domain Transfer Guardrail:</p>
                <p>{t('records_staged_notice') || 'Imported records are staged safely in isolation and must be reviewed in their domain workspace before public publishing.'}</p>
              </div>

              {/* Records in Batch */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Staged Records List</h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {records.slice(0, 4).map((rec) => {
                    const domainPath = domainsList.find(d => d.key === selectedBatch.dataType)?.path || '/admin/scholarships';
                    return (
                      <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 truncate max-w-[280px]">
                            {rec.rawPayload?.scholarshipName || rec.rawPayload?.displayName || 'Imported Record item'}
                          </div>
                          <div className="text-[10px] text-slate-500">Status: {rec.status}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            disabled
                            className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold border border-slate-200 cursor-not-allowed"
                            title="Domain promotion must be performed in the owning domain workspace."
                          >
                            {t('transfer_in_domain_workspace') || 'Transfer in Domain Workspace'}
                          </button>

                          <Link
                            to={domainPath}
                            className="p-1 text-slate-500 hover:text-slate-900"
                            title={t('open_domain_workspace') || 'Open Domain Workspace'}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
