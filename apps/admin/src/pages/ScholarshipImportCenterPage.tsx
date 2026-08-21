import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Database,
  FileDiff,
  History,
  Loader2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Split,
  Waypoints,
  XCircle,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nProvider';
import {
  scholarshipImportCenterApi,
  type ScholarshipImportCenterDiff,
  type ScholarshipImportCenterMergeProposal,
  type ScholarshipImportCenterOverview,
  type ScholarshipImportCenterRecordList,
  type ScholarshipImportCenterRecordView,
  type ScholarshipImportCenterScanResult,
  type ScholarshipImportCenterSources,
  type ScholarshipImportOperationalClass,
  type ScholarshipImportReviewAction,
} from '../api/scholarshipImportCenter';

type WorkspaceTab =
  | 'overview'
  | 'sources'
  | 'incoming'
  | 'screening'
  | 'duplicates'
  | 'missing'
  | 'verification'
  | 'review'
  | 'ready'
  | 'history';

type Copy = {
  title: string;
  subtitle: string;
  backToImports: string;
  refresh: string;
  operationalClass: string;
  exactCounts: string;
  partialCounts: string;
  scanned: string;
  sourceTotal: string;
  loading: string;
  noRecords: string;
  inspect: string;
  record: string;
  source: string;
  completeness: string;
  duplicate: string;
  verification: string;
  canonical: string;
  reviewReasons: string;
  ready: string;
  transferred: string;
  rawPayload: string;
  diff: string;
  current: string;
  incomingValue: string;
  state: string;
  mergeProposal: string;
  reviewPersistenceUnavailable: string;
  transferDeferred: string;
  transferReady: string;
  transferNotReady: string;
  decisionRecorded: string;
  transferCompleted: string;
  reasonPlaceholder: string;
  capabilities: string;
  registryPending: string;
  observedSources: string;
  incompleteRegistry: string;
  batches: string;
  records: string;
  lastBatch: string;
  totalIncoming: string;
  newRecords: string;
  duplicateRecords: string;
  updateRecords: string;
  incomplete: string;
  conflicts: string;
  needsReview: string;
  readyToTransfer: string;
  failedProcessing: string;
  transferredCount: string;
  tabs: Record<WorkspaceTab, string>;
  action: Record<ScholarshipImportReviewAction, string>;
};

const copy: Record<'en' | 'ar', Copy> = {
  en: {
    title: 'Scholarship Import Center',
    subtitle: 'Phase 12 workspace backed only by the Scholarship Import Center API. No local counters or demo records are used.',
    backToImports: 'Back to Import Management',
    refresh: 'Refresh',
    operationalClass: 'Operational class',
    exactCounts: 'Counts are exact',
    partialCounts: 'Scan limit reached; counts are partial',
    scanned: 'Scanned',
    sourceTotal: 'Source total',
    loading: 'Loading Scholarship import data…',
    noRecords: 'No records returned by the API for this view.',
    inspect: 'Inspect',
    record: 'Record',
    source: 'Source',
    completeness: 'Completeness',
    duplicate: 'Dedupe',
    verification: 'Verification',
    canonical: 'Canonical',
    reviewReasons: 'Review reasons',
    ready: 'Ready',
    transferred: 'Transferred',
    rawPayload: 'Raw payload',
    diff: 'Field diff',
    current: 'Current',
    incomingValue: 'Incoming',
    state: 'State',
    mergeProposal: 'Merge proposal',
    reviewPersistenceUnavailable: 'Review decision persistence is not configured. Merge / Keep / Split are intentionally disabled.',
    transferDeferred: 'Atomic transfer is deferred to WP12-10. This UI will not bypass that backend gate.',
    transferReady: 'Transfer to draft catalog',
    transferNotReady: 'Record is not ready to transfer.',
    decisionRecorded: 'Review decision recorded.',
    transferCompleted: 'Record transferred to a draft Scholarship.',
    reasonPlaceholder: 'Optional review reason',
    capabilities: 'Backend capabilities',
    registryPending: 'Source registry runtime proof is still pending.',
    observedSources: 'Observed Phase 6 sources',
    incompleteRegistry: 'This is an observed source list from recent Phase 6 batches, not a complete runtime registry.',
    batches: 'Batches',
    records: 'Records',
    lastBatch: 'Last batch',
    totalIncoming: 'Incoming',
    newRecords: 'New',
    duplicateRecords: 'Duplicates',
    updateRecords: 'Updates',
    incomplete: 'Incomplete',
    conflicts: 'Conflicts',
    needsReview: 'Needs review',
    readyToTransfer: 'Ready to transfer',
    failedProcessing: 'Failed processing',
    transferredCount: 'Transferred',
    tabs: {
      overview: 'Overview',
      sources: 'Sources',
      incoming: 'Incoming Records',
      screening: 'Screening',
      duplicates: 'Duplicates / Updates',
      missing: 'Missing Data',
      verification: 'Verification',
      review: 'Review Queue',
      ready: 'Ready to Transfer',
      history: 'History',
    },
    action: {
      MERGE: 'Merge',
      KEEP_CURRENT: 'Keep current',
      SPLIT: 'Split',
    },
  },
  ar: {
    title: 'مركز استيراد المنح',
    subtitle: 'مساحة عمل المرحلة 12 وتعتمد فقط على API الحقيقي لمركز استيراد المنح، دون عدادات محلية أو سجلات تجريبية.',
    backToImports: 'العودة إلى إدارة الاستيراد',
    refresh: 'تحديث',
    operationalClass: 'الفئة التشغيلية',
    exactCounts: 'الأعداد دقيقة',
    partialCounts: 'تم بلوغ حد الفحص؛ الأعداد جزئية',
    scanned: 'تم فحص',
    sourceTotal: 'إجمالي المصدر',
    loading: 'جارٍ تحميل بيانات استيراد المنح…',
    noRecords: 'لم يُرجع API سجلات لهذا العرض.',
    inspect: 'فحص',
    record: 'السجل',
    source: 'المصدر',
    completeness: 'الاكتمال',
    duplicate: 'التكرار',
    verification: 'التحقق',
    canonical: 'الربط المرجعي',
    reviewReasons: 'أسباب المراجعة',
    ready: 'جاهز',
    transferred: 'منقول',
    rawPayload: 'البيانات الخام',
    diff: 'فروقات الحقول',
    current: 'الحالي',
    incomingValue: 'الوارد',
    state: 'الحالة',
    mergeProposal: 'اقتراح الدمج',
    reviewPersistenceUnavailable: 'تخزين قرارات المراجعة غير مهيأ. تم تعطيل الدمج / الاحتفاظ / الفصل عمدًا.',
    transferDeferred: 'النقل الذري مؤجل إلى WP12-10، ولن تتجاوز الواجهة بوابة الـBackend.',
    transferReady: 'نقل إلى كتالوج المسودات',
    transferNotReady: 'السجل غير جاهز للنقل.',
    decisionRecorded: 'تم تسجيل قرار المراجعة.',
    transferCompleted: 'تم نقل السجل إلى منحة بحالة مسودة.',
    reasonPlaceholder: 'سبب المراجعة اختياري',
    capabilities: 'قدرات الـBackend',
    registryPending: 'إثبات تشغيل سجل المصادر ما زال مؤجلًا للـRuntime.',
    observedSources: 'المصادر المرصودة من Phase 6',
    incompleteRegistry: 'هذه قائمة مصادر مرصودة من دفعات Phase 6 الحديثة وليست سجل المصادر التشغيلي الكامل.',
    batches: 'الدفعات',
    records: 'السجلات',
    lastBatch: 'آخر دفعة',
    totalIncoming: 'الوارد',
    newRecords: 'جديد',
    duplicateRecords: 'مكرر',
    updateRecords: 'تحديثات',
    incomplete: 'ناقص',
    conflicts: 'تعارضات',
    needsReview: 'يحتاج مراجعة',
    readyToTransfer: 'جاهز للنقل',
    failedProcessing: 'فشل المعالجة',
    transferredCount: 'منقول',
    tabs: {
      overview: 'نظرة عامة',
      sources: 'المصادر',
      incoming: 'السجلات الواردة',
      screening: 'الفحص',
      duplicates: 'التكرار / التحديثات',
      missing: 'البيانات الناقصة',
      verification: 'التحقق',
      review: 'قائمة المراجعة',
      ready: 'جاهز للنقل',
      history: 'السجل التاريخي',
    },
    action: {
      MERGE: 'دمج',
      KEEP_CURRENT: 'الاحتفاظ بالحالي',
      SPLIT: 'فصل',
    },
  },
};

const tabOrder: WorkspaceTab[] = [
  'overview',
  'sources',
  'incoming',
  'screening',
  'duplicates',
  'missing',
  'verification',
  'review',
  'ready',
  'history',
];

const operationalClasses: ScholarshipImportOperationalClass[] = [
  'REAL',
  'TEST',
  'DEMO',
  'ARCHIVED',
  'UNCLASSIFIED',
];

function badgeClass(value: string): string {
  if (value.includes('FAILED') || value.includes('INCOMPLETE') || value.includes('CONFLICT') || value.includes('COLLISION')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (value.includes('REVIEW') || value.includes('PENDING') || value.includes('NOT_') || value.includes('DEFERRED')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (value.includes('READY') || value.includes('COMPLETE') || value.includes('VERIFIED') || value.includes('CLEAR') || value === 'NEW') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${badgeClass(value)}`}>
      {value}
    </span>
  );
}

function metricRows(overview: ScholarshipImportCenterOverview, text: Copy) {
  return [
    [text.totalIncoming, overview.totalIncoming],
    [text.newRecords, overview.newRecords],
    [text.duplicateRecords, overview.duplicateRecords],
    [text.updateRecords, overview.updateRecords],
    [text.incomplete, overview.incomplete],
    [text.conflicts, overview.conflicts],
    [text.needsReview, overview.needsReview],
    [text.readyToTransfer, overview.readyToTransfer],
    [text.failedProcessing, overview.failedProcessing],
    [text.transferredCount, overview.transferred],
  ] as const;
}

function SegmentNotice({ scan, text }: { scan: Pick<ScholarshipImportCenterScanResult, 'countsExact' | 'scanTruncated' | 'scannedRecords' | 'sourceTotal'>; text: Copy }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${scan.countsExact ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-semibold">{scan.countsExact ? text.exactCounts : text.partialCounts}</span>
        <span>{text.scanned}: {scan.scannedRecords}</span>
        <span>{text.sourceTotal}: {scan.sourceTotal}</span>
        {scan.scanTruncated && <AlertTriangle className="h-4 w-4" />}
      </div>
    </div>
  );
}

export function ScholarshipImportCenterPage() {
  const { language } = useTranslation();
  const text = copy[language === 'ar' ? 'ar' : 'en'];
  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [operationalClass, setOperationalClass] = useState<ScholarshipImportOperationalClass>('REAL');
  const [overview, setOverview] = useState<ScholarshipImportCenterOverview | null>(null);
  const [sources, setSources] = useState<ScholarshipImportCenterSources | null>(null);
  const [records, setRecords] = useState<ScholarshipImportCenterRecordView[]>([]);
  const [segmentMeta, setSegmentMeta] = useState<ScholarshipImportCenterScanResult | null>(null);
  const [recordListMeta, setRecordListMeta] = useState<ScholarshipImportCenterRecordList | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ScholarshipImportCenterRecordView | null>(null);
  const [diff, setDiff] = useState<ScholarshipImportCenterDiff | null>(null);
  const [proposal, setProposal] = useState<ScholarshipImportCenterMergeProposal | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadOverview = useCallback(async () => {
    const result = await scholarshipImportCenterApi.overview(operationalClass);
    setOverview(result);
    return result;
  }, [operationalClass]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setMessage(null);

    const load = async () => {
      try {
        const currentOverview = await scholarshipImportCenterApi.overview(operationalClass);
        if (!active) return;
        setOverview(currentOverview);
        setSources(null);
        setRecords([]);
        setSegmentMeta(null);
        setRecordListMeta(null);

        if (tab === 'sources') {
          const result = await scholarshipImportCenterApi.sources();
          if (active) setSources(result);
          return;
        }
        if (tab === 'incoming') {
          const result = await scholarshipImportCenterApi.records({ operationalClass, page: 1, pageSize: 100 });
          if (active) {
            setRecords(result.data);
            setRecordListMeta(result);
          }
          return;
        }
        if (tab === 'overview') return;

        const segmentByTab: Record<Exclude<WorkspaceTab, 'overview' | 'sources' | 'incoming'>, Parameters<typeof scholarshipImportCenterApi.scan>[0]> = {
          screening: 'screening',
          duplicates: 'duplicates',
          missing: 'missing-data',
          verification: 'verification',
          review: 'review-queue',
          ready: 'ready-to-transfer',
          history: 'history',
        };
        const result = await scholarshipImportCenterApi.scan(segmentByTab[tab], operationalClass);
        if (active) {
          setRecords(result.data);
          setSegmentMeta(result);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : String(caught));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [tab, operationalClass, refreshToken]);

  const inspectRecord = async (record: ScholarshipImportCenterRecordView) => {
    setSelectedRecord(record);
    setDiff(null);
    setProposal(null);
    setReason('');
    setMessage(null);
    setDetailLoading(true);
    setError(null);
    try {
      const [detail, recordDiff, mergeProposal] = await Promise.all([
        scholarshipImportCenterApi.record(record.id),
        scholarshipImportCenterApi.diff(record.id),
        scholarshipImportCenterApi.mergeProposal(record.id),
      ]);
      setSelectedRecord(detail);
      setDiff(recordDiff);
      setProposal(mergeProposal);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setDetailLoading(false);
    }
  };

  const submitDecision = async (action: ScholarshipImportReviewAction) => {
    if (!selectedRecord || overview?.capabilities.reviewDecisionPersistence !== 'CONFIGURED') return;
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      await scholarshipImportCenterApi.decision(selectedRecord.id, action, reason.trim() || undefined);
      setMessage(text.decisionRecorded);
      await loadOverview();
      setRefreshToken((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setActionLoading(false);
    }
  };

  const transfer = async () => {
    if (!selectedRecord || overview?.capabilities.atomicTransfer !== 'CONFIGURED' || !selectedRecord.readyToTransfer) return;
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      await scholarshipImportCenterApi.transfer(selectedRecord.id);
      setMessage(text.transferCompleted);
      await loadOverview();
      const detail = await scholarshipImportCenterApi.record(selectedRecord.id);
      setSelectedRecord(detail);
      setRefreshToken((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setActionLoading(false);
    }
  };

  const recordsMeta = useMemo(() => {
    if (segmentMeta) return segmentMeta;
    if (recordListMeta) {
      return {
        countsExact: recordListMeta.countsExact,
        scanTruncated: recordListMeta.scanTruncated,
        scannedRecords: recordListMeta.scannedRecords,
        sourceTotal: recordListMeta.sourceTotal,
      };
    }
    return null;
  }, [segmentMeta, recordListMeta]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <a href="/imports" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            {text.backToImports}
          </a>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">{text.title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{text.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {text.operationalClass}
            <select
              value={operationalClass}
              onChange={(event) => setOperationalClass(event.target.value as ScholarshipImportOperationalClass)}
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900"
            >
              {operationalClasses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setRefreshToken((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {text.refresh}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="font-mono text-xs break-all">{error}</div>
        </div>
      )}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          {message}
        </div>
      )}

      {overview && (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {metricRows(overview, text).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-2xl font-bold text-slate-950">{value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              {text.capabilities}
            </div>
            <div className="space-y-2 text-xs">
              <CapabilityRow label="Review decisions" value={overview.capabilities.reviewDecisionPersistence} />
              <CapabilityRow label="Atomic transfer" value={overview.capabilities.atomicTransfer} />
              <CapabilityRow label="Source registry" value={overview.capabilities.sourceRegistryRuntime} />
            </div>
            <div className="mt-4 border-t border-slate-700 pt-3 text-xs text-slate-300">
              {overview.countsExact ? text.exactCounts : text.partialCounts} · {text.scanned}: {overview.scannedRecords} · {text.sourceTotal}: {overview.sourceTotal}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-1">
          {tabOrder.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${tab === item ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
            >
              {text.tabs[item]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            {text.loading}
          </div>
        </div>
      ) : tab === 'overview' ? (
        <OverviewPanel overview={overview} text={text} />
      ) : tab === 'sources' ? (
        <SourcesPanel sources={sources} text={text} />
      ) : (
        <div className="space-y-4">
          {recordsMeta && <SegmentNotice scan={recordsMeta} text={text} />}
          <RecordsTable records={records} text={text} onInspect={inspectRecord} />
        </div>
      )}

      {selectedRecord && (
        <RecordDrawer
          record={selectedRecord}
          diff={diff}
          proposal={proposal}
          text={text}
          loading={detailLoading}
          actionLoading={actionLoading}
          reason={reason}
          setReason={setReason}
          canRecordDecision={overview?.capabilities.reviewDecisionPersistence === 'CONFIGURED'}
          canTransfer={overview?.capabilities.atomicTransfer === 'CONFIGURED'}
          onDecision={submitDecision}
          onTransfer={transfer}
          onClose={() => {
            setSelectedRecord(null);
            setDiff(null);
            setProposal(null);
          }}
        />
      )}
    </div>
  );
}

function CapabilityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-[10px] font-semibold text-white">{value}</span>
    </div>
  );
}

function OverviewPanel({ overview, text }: { overview: ScholarshipImportCenterOverview | null; text: Copy }) {
  if (!overview) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Database className="h-5 w-5" />
          {text.tabs.overview}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {metricRows(overview, text).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold">{value}</div>
              <div className="mt-1 text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="h-5 w-5" />
          Runtime gates
        </div>
        {overview.capabilities.reviewDecisionPersistence !== 'CONFIGURED' && <p>{text.reviewPersistenceUnavailable}</p>}
        {overview.capabilities.atomicTransfer !== 'CONFIGURED' && <p>{text.transferDeferred}</p>}
        <p>{text.registryPending}</p>
      </div>
    </div>
  );
}

function SourcesPanel({ sources, text }: { sources: ScholarshipImportCenterSources | null; text: Copy }) {
  if (!sources) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-semibold">{text.incompleteRegistry}</div>
        <div className="mt-1 font-mono text-xs">{sources.registryState} · {sources.sourceRegistryRuntime} · limit {sources.observedBatchLimit}</div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 text-lg font-bold">{text.observedSources}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">{text.source}</th>
                <th className="px-4 py-3">{text.batches}</th>
                <th className="px-4 py-3">{text.records}</th>
                <th className="px-4 py-3">{text.lastBatch}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.sources.map((source) => (
                <tr key={source.sourceSystem}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{source.sourceSystem}</td>
                  <td className="px-4 py-3">{source.batches}</td>
                  <td className="px-4 py-3">{source.totalRecords}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(source.lastBatchAt)}</td>
                </tr>
              ))}
              {sources.sources.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">{text.noRecords}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecordsTable({ records, text, onInspect }: { records: ScholarshipImportCenterRecordView[]; text: Copy; onInspect: (record: ScholarshipImportCenterRecordView) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{text.record}</th>
              <th className="px-4 py-3">{text.source}</th>
              <th className="px-4 py-3">{text.completeness}</th>
              <th className="px-4 py-3">{text.duplicate}</th>
              <th className="px-4 py-3">{text.verification}</th>
              <th className="px-4 py-3">{text.canonical}</th>
              <th className="px-4 py-3">{text.reviewReasons}</th>
              <th className="px-4 py-3">{text.ready}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="align-top hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <div className="max-w-[280px] font-semibold text-slate-950">{record.cleanedScholarshipName || record.rawSourceTitle || record.id}</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400">{record.id}</div>
                  <div className="mt-1"><StatusBadge value={record.operationalClass} /></div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-mono text-xs">{record.sourceSystem}</div>
                  <div className="mt-1 text-xs text-slate-400">row {record.sourceRowNumber ?? '—'}</div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={record.completeness.state} />
                  {record.completeness.missingFields.length > 0 && (
                    <div className="mt-2 max-w-56 text-xs text-slate-500">{record.completeness.missingFields.join(', ')}</div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={record.dedupe.state} />
                  {record.dedupe.matchIds.length > 0 && <div className="mt-2 text-xs text-slate-500">{record.dedupe.matchIds.join(', ')}</div>}
                </td>
                <td className="px-4 py-4"><StatusBadge value={record.verification.state} /></td>
                <td className="px-4 py-4">
                  <StatusBadge value={record.canonical.state} />
                  <div className="mt-2 text-xs text-slate-500">U {record.canonical.unresolvedCount} · A {record.canonical.ambiguousCount} · R {record.canonical.reviewRequiredCount}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-[260px] text-xs text-slate-600">{record.reviewReasons.length ? record.reviewReasons.join(' · ') : '—'}</div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={record.transferred ? 'TRANSFERRED' : record.readyToTransfer ? 'READY_TO_TRANSFER' : 'NOT_READY'} />
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onInspect(record)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
                  >
                    {text.inspect}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-16 text-center text-slate-500">{text.noRecords}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordDrawer(props: {
  record: ScholarshipImportCenterRecordView;
  diff: ScholarshipImportCenterDiff | null;
  proposal: ScholarshipImportCenterMergeProposal | null;
  text: Copy;
  loading: boolean;
  actionLoading: boolean;
  reason: string;
  setReason: (value: string) => void;
  canRecordDecision: boolean;
  canTransfer: boolean;
  onDecision: (action: ScholarshipImportReviewAction) => void;
  onTransfer: () => void;
  onClose: () => void;
}) {
  const { record, diff, proposal, text } = props;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{record.id}</div>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">{record.cleanedScholarshipName || record.rawSourceTitle || record.id}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge value={record.completeness.state} />
              <StatusBadge value={record.dedupe.state} />
              <StatusBadge value={record.verification.state} />
              <StatusBadge value={record.canonical.state} />
            </div>
          </div>
          <button type="button" onClick={props.onClose} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {props.loading ? (
            <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <InfoCard icon={<SearchCheck className="h-5 w-5" />} title={text.completeness}>
                  <p className="text-xs text-slate-600">{record.completeness.missingFields.length ? record.completeness.missingFields.join(', ') : '—'}</p>
                </InfoCard>
                <InfoCard icon={<Waypoints className="h-5 w-5" />} title={text.duplicate}>
                  <p className="break-all font-mono text-[11px] text-slate-600">{record.dedupe.duplicateKey || '—'}</p>
                </InfoCard>
                <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title={text.verification}>
                  <p className="text-xs text-slate-600">traceable: {String(record.verification.sourceTraceable)}</p>
                </InfoCard>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                  <Database className="h-5 w-5" />
                  {text.rawPayload}
                </div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(record.rawPayload, null, 2)}</pre>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <FileDiff className="h-5 w-5" />
                  {text.diff}
                </div>
                {diff ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Field</th>
                          <th className="px-3 py-2">{text.current}</th>
                          <th className="px-3 py-2">{text.incomingValue}</th>
                          <th className="px-3 py-2">{text.state}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {diff.fields.map((field) => (
                          <tr key={field.field}>
                            <td className="px-3 py-3 font-mono font-semibold">{field.field}</td>
                            <td className="max-w-64 px-3 py-3"><Value value={field.currentValue} /></td>
                            <td className="max-w-64 px-3 py-3"><Value value={field.incomingValue} /></td>
                            <td className="px-3 py-3"><StatusBadge value={field.state} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <div className="text-sm text-slate-500">—</div>}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <Split className="h-5 w-5" />
                    {text.mergeProposal}
                  </div>
                  {proposal ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={proposal.duplicateState} />
                        <StatusBadge value={proposal.requiresReview ? 'REVIEW_REQUIRED' : 'NO_REVIEW_REQUIRED'} />
                      </div>
                      {!props.canRecordDecision && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{text.reviewPersistenceUnavailable}</div>
                      )}
                      <input
                        value={props.reason}
                        onChange={(event) => props.setReason(event.target.value)}
                        placeholder={text.reasonPlaceholder}
                        disabled={!props.canRecordDecision || props.actionLoading}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                      />
                      <div className="flex flex-wrap gap-2">
                        {proposal.suggestedActions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            disabled={!props.canRecordDecision || props.actionLoading}
                            onClick={() => props.onDecision(action)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {text.action[action]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : <div className="text-sm text-slate-500">—</div>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <History className="h-5 w-5" />
                    Transfer
                  </div>
                  {!props.canTransfer ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{text.transferDeferred}</div>
                  ) : !record.readyToTransfer ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">{text.transferNotReady}</div>
                  ) : null}
                  <button
                    type="button"
                    disabled={!props.canTransfer || !record.readyToTransfer || record.transferred || props.actionLoading}
                    onClick={props.onTransfer}
                    className="mt-3 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {props.actionLoading ? '…' : text.transferReady}
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

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">{icon}{title}</div>
      {children}
    </div>
  );
}

function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="text-slate-400">—</span>;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <span className="break-words">{String(value)}</span>;
  }
  return <span className="break-words font-mono text-[10px]">{JSON.stringify(value)}</span>;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
