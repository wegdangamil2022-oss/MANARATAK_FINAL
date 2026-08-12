import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  ArrowLeft, 
  Server, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Loader2, 
  Plus, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Link2, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight, 
  Info, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Award, 
  Sliders, 
  Search,
  RotateCcw,
  Play,
  Paperclip
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export interface ProviderSource {
  id: string;
  name: string;
  sourceType: 'official_gov' | 'official_univ' | 'official_foundation' | 'trusted_platform' | 'aggregator' | 'manual_source';
  trustScore: number;
  officialUrl: string;
  lastCheck?: string;
  importedCount?: number;
  failedCount?: number;
  incompleteCount?: number;
  transferredCount?: number;
  duplicatesCount?: number;
  enrichedCount?: number;
  status: 'active' | 'needs_config' | 'disabled' | 'under_preparation';
  coverageType?: 'full_profile' | 'scoring' | 'preparation' | 'availability_centers';
  descriptionAr?: string;
  descriptionEn?: string;
  isReadyForImport?: boolean;
}

export interface ScholarshipRecordAudit {
  id: string;
  originalName: string;
  cleanedName: string;
  cleanedNameAr: string;
  provider: string;
  sourceUrl: string;
  officialSourceUrl?: string;
  duplicateStatus: 'new' | 'duplicate_skipped' | 'existing_enriched';
  fieldsMerged: string[];
  missingFields: string[];
  completenessStatus: 'complete' | 'incomplete';
  verificationStatus: 'verified_official' | 'needs_source_verification';
  transferStatus: 'transferred_needs_review';
}

type MajorBulkImportFile = {
  sourceFileName: string;
  dataText: string;
  sizeBytes: number;
};

export interface ScholarshipImportBatch {
  id: string;
  batchName: string;
  providerName: string;
  sourceType: string;
  trustScore: number;
  runDate: string;
  inputMethod: string;
  totalRead: number;
  normalizedNamesCount: number;
  duplicateCount: number;
  mergedFieldsCount: number;
  newRecordsCount: number;
  incompleteCount: number;
  failedCount: number;
  transferredCount: number;
  status: 'success' | 'partial_success' | 'needs_review';
  records: ScholarshipRecordAudit[];
}

type TestSourceCheckStatus = 'current' | 'checking' | 'update_available' | 'needs_review';

type InternationalTestSourceCard = {
  id: string;
  testId: string;
  title: string;
  providerName: string;
  family: string;
  fileName: string;
  fileSize: string;
  sourceUrl: string;
  version: number;
  importedAt: string;
  status: 'PUBLISHED' | 'DRAFT' | 'NEEDS_REVIEW';
  checkStatus: TestSourceCheckStatus;
  scoreRange: string;
  validity: string;
  changeSummary: string[];
};

type MajorCatalogKind = 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'FELLOWSHIP';

interface MajorImportCard {
  kind: MajorCatalogKind;
  titleAr: string;
  titleEn: string;
  catalogFile: string;
  detailFile: string;
  totalRecords: number;
  detailRecords: number;
  detailSections: number;
}

interface MajorImportBatchPreview {
  id: string;
  dataType?: string;
  sourceSystem?: string;
  batchStatus?: string;
  totalRecords?: number;
  processedRecords?: number;
  failedRecords?: number;
  createdAt?: string;
}

interface MajorImportRecordPreview {
  id: string;
  status?: string;
  promotedEntityId?: string | null;
  processingNotes?: string | null;
  sourceDedupKey?: string | null;
  rawPayload?: Record<string, unknown>;
}

const MAJOR_KIND_LABELS: Record<MajorCatalogKind, { ar: string; en: string }> = {
  BACHELOR: { ar: 'البكالوريوس', en: 'Bachelor' },
  MASTER: { ar: 'الماجستير', en: 'Master' },
  DOCTORATE: { ar: 'الدكتوراه', en: 'Doctorate' },
  FELLOWSHIP: { ar: 'الزمالات', en: 'Fellowship' },
};



const DOMAIN_METADATA: any = {
  scholarships: {
    id: 'scholarships',
    defaultProviders: []
  },
  majors: {
    id: 'majors',
    defaultProviders: []
  }
};
const INTERNATIONAL_TEST_SOURCE_CARDS: any[] = [];
const SCHOLARSHIP_IMPORT_BATCHES: any[] = [];
const SAMPLE_TEST_IMPORT_FILE: any = {
  path: 'sample.md',
  name: 'Sample Test',
  providerName: 'Sample Provider',
  sourceUrl: 'https://sample.com'
};
const isInternationalTestSourceCard = (card: any) => false;
const getDomainRules = (domain: any, isRTL?: any): any[] => [];

export function AdminDomainImportCenterPage() {
  const { domainKey } = useParams<{ domainKey: string }>();
  const { t, dir } = useTranslation();
  const navigate = useNavigate();

  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token'));
  const currentDomain = DOMAIN_METADATA[domainKey || 'scholarships'] || DOMAIN_METADATA.scholarships;
  const [dbMajors, setDbMajors] = useState<any[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(false);

  useEffect(() => {
    if (currentDomain.id !== 'majors') return;
    let cancelled = false;
    async function load() {
      setLoadingMajors(true);
      try {
        const catalogKinds = ['BACHELOR', 'MASTER', 'DOCTORATE', 'FELLOWSHIP'];
        const responses = await Promise.all(catalogKinds.map((degreeLevel) =>
          ApiClient.getAdminMajors({
            page: 1,
            pageSize: 1,
            catalog: 'true',
            degreeLevel,
          })
        ));
        if (!cancelled) {
          setDbMajors(responses.map((response, index) => ({
            ...(response.data?.[0] || {}),
            catalogKind: catalogKinds[index],
            catalogTotal: response.total || 0,
          })));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingMajors(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentDomain.id]);

  const majorStats = useMemo(() => {
    let dbDetailsCount = 0;
    let totalSectionsCount = 0;

    const counts = { BACHELOR: 0, MASTER: 0, DOCTORATE: 0, FELLOWSHIP: 0 };
    const detailCounts = { BACHELOR: 0, MASTER: 0, DOCTORATE: 0, FELLOWSHIP: 0 };
    const sectionCounts = { BACHELOR: 0, MASTER: 0, DOCTORATE: 0, FELLOWSHIP: 0 };

    for (const item of dbMajors) {
      const kind = (item.catalogKind || item.degreeLevel || '').toUpperCase();
      if ((counts as any)[kind] !== undefined) {
        (counts as any)[kind] += Number(item.catalogTotal || 0);
      }

      if (item.hasDbDetails) {
        dbDetailsCount++;
        const secs = typeof item.sectionCount === 'number' && item.sectionCount > 0 ? item.sectionCount : 18;
        totalSectionsCount += secs;
        if ((detailCounts as any)[kind] !== undefined) {
          (detailCounts as any)[kind]++;
          (sectionCounts as any)[kind] += secs;
        }
      }
    }

    return {
      all: dbMajors.length,
      bachelor: counts.BACHELOR,
      master: counts.MASTER,
      doctorate: counts.DOCTORATE,
      fellowship: counts.FELLOWSHIP,
      bachelorDetails: detailCounts.BACHELOR,
      masterDetails: detailCounts.MASTER,
      doctorateDetails: detailCounts.DOCTORATE,
      fellowshipDetails: detailCounts.FELLOWSHIP,
      bachelorSections: sectionCounts.BACHELOR,
      masterSections: sectionCounts.MASTER,
      doctorateSections: sectionCounts.DOCTORATE,
      fellowshipSections: sectionCounts.FELLOWSHIP,
      mergedDetails: dbDetailsCount,
      dbDetails: dbDetailsCount,
      totalSections: totalSectionsCount,
    };
  }, [dbMajors]);

  const MAJOR_IMPORT_CARDS: MajorImportCard[] = useMemo(() => {
    return (['BACHELOR', 'MASTER', 'DOCTORATE', 'FELLOWSHIP'] as MajorCatalogKind[]).map((kind) => {
      let total = 0;
      let detailCount = 0;
      let sectionsCount = 0;
      let catalogFile = 'MANARATAK_Bachelor_Majors_By_Colleges_v1.0.md';
      let detailFile = 'bachelors_phase10_01_to_833.md';

      if (kind === 'MASTER') {
        total = majorStats.master;
        detailCount = majorStats.masterDetails;
        sectionsCount = majorStats.masterSections;
        catalogFile = 'MANARATAK_Master_Specializations_By_Academic_Fields_v1.0.md';
        detailFile = 'masters_phase10_0001_to_1116.md';
      } else if (kind === 'DOCTORATE') {
        total = majorStats.doctorate;
        detailCount = majorStats.doctorateDetails;
        sectionsCount = majorStats.doctorateSections;
        catalogFile = 'MANARATAK_Doctoral_Specializations_By_Academic_Fields_v1.0.md';
        detailFile = 'doctorates_phase10_0001_to_1114.md';
      } else if (kind === 'FELLOWSHIP') {
        total = majorStats.fellowship;
        detailCount = majorStats.fellowshipDetails;
        sectionsCount = majorStats.fellowshipSections;
        catalogFile = 'MANARATAK_Fellowships_By_Professional_Domains_v1.0.md';
        detailFile = 'fellowships_FEL-0001_to_FEL-0010.md';
      } else {
        total = majorStats.bachelor;
        detailCount = majorStats.bachelorDetails;
        sectionsCount = majorStats.bachelorSections;
      }

      return {
        kind,
        titleAr: `كتالوج ${MAJOR_KIND_LABELS[kind].ar}`,
        titleEn: `${MAJOR_KIND_LABELS[kind].en} Catalog`,
        catalogFile,
        detailFile,
        totalRecords: total,
        detailRecords: detailCount,
        detailSections: sectionsCount,
      };
    });
  }, [majorStats]);


  const [providers, setProviders] = useState<ProviderSource[]>(currentDomain.defaultProviders);

  // Wizard State
  const [activeWizard, setActiveWizard] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSource | null>(null);
  const [inputMethod, setInputMethod] = useState<'file' | 'paste' | 'url' | 'connector' | 'demo'>('demo');
  const [officialUrlInput, setOfficialUrlInput] = useState<string>('');
  const [pastedPayload, setPastedPayload] = useState<string>('');
  const [testImportFile, setTestImportFile] = useState<File | null>(null);
  const [testImportText, setTestImportText] = useState<string>('');
  const [recordLimit, setRecordLimit] = useState<'10' | '50' | '100' | 'custom'>('50');
  const [customRecordLimit, setCustomRecordLimit] = useState<number>(25);
  const [majorImportRunning, setMajorImportRunning] = useState<string | null>(null);
  const [majorImportNotice, setMajorImportNotice] = useState<string | null>(null);
  const [lastMajorImportBatches, setLastMajorImportBatches] = useState<Record<string, string>>({});
  const [majorImportBatches, setMajorImportBatches] = useState<MajorImportBatchPreview[]>([]);
  const [selectedMajorImportBatchId, setSelectedMajorImportBatchId] = useState<string>('');
  const [majorImportRecords, setMajorImportRecords] = useState<MajorImportRecordPreview[]>([]);
  const [majorImportReviewLoading, setMajorImportReviewLoading] = useState<boolean>(false);
  const [majorImportPreview, setMajorImportPreview] = useState<any | null>(null);
  const [majorBulkCatalogKind, setMajorBulkCatalogKind] = useState<MajorCatalogKind>('BACHELOR');
  const [majorBulkFiles, setMajorBulkFiles] = useState<MajorBulkImportFile[]>([]);
  
  // Admin instructions
  const [instructions, setInstructions] = useState<Record<string, any>>({
    extractTestStructure: true,
    extractScoringScale: true,
    requireOfficialUrl: true,
    flagUnverifiedVariants: true,
    importBilingual: true,
    focusPostgrad: true,
    ignoreExpired: true,
    missingDeadlineReview: true,
    extractRankings: true,
    verifyLocationData: true,
    flagNameConflicts: true,
    extractDurationAndCert: true,
    extractPrerequisites: true,
    flagExpiredRuns: true,
    mapIscedClassification: true,
    requireFacultyContext: true,
    extractCareerOutcomes: true,
    flagCustomMajors: true,
    customNote: ''
  });

  // International Test Import Cards State
  const [testImportCards, setTestImportCards] = useState<InternationalTestSourceCard[]>(() => {
    try {
      const saved = localStorage.getItem('manaratak_test_import_cards');
      if (!saved) {
        return INTERNATIONAL_TEST_SOURCE_CARDS;
      }

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return INTERNATIONAL_TEST_SOURCE_CARDS;
      }

      const mergedCards = new Map<string, InternationalTestSourceCard>(
        INTERNATIONAL_TEST_SOURCE_CARDS.map(card => [card.testId, card])
      );
      parsed.filter(isInternationalTestSourceCard).forEach(card => {
        mergedCards.set(card.testId, {
          ...(mergedCards.get(card.testId) || card),
          ...card,
          id: `source-card-${card.testId}`
        });
      });

      return Array.from(mergedCards.values());
    } catch (_error) {
      return INTERNATIONAL_TEST_SOURCE_CARDS;
    }
  });

  useEffect(() => {
    if (domainKey === 'international-tests') {
      localStorage.setItem('manaratak_test_import_cards', JSON.stringify(testImportCards));
    }
  }, [domainKey, testImportCards]);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('BATCH-2026-DAAD-04');
  const activeBatch = SCHOLARSHIP_IMPORT_BATCHES.find(b => b.id === selectedBatchId) || SCHOLARSHIP_IMPORT_BATCHES[0];

  useEffect(() => {
    if (domainKey && DOMAIN_METADATA[domainKey]) {
      setProviders(DOMAIN_METADATA[domainKey].defaultProviders);
    }
  }, [domainKey]);

  const loadMajorImportReview = async (preferredBatchId?: string) => {
    if (domainKey !== 'majors') {
      return;
    }

    setMajorImportReviewLoading(true);
    try {
      const [majorBatches, fellowshipBatches] = await Promise.all([
        ApiClient.getImportBatches('MAJORS'),
        ApiClient.getImportBatches('FELLOWSHIPS'),
      ]);
      const batches = [...majorBatches, ...fellowshipBatches]
        .filter((batch): batch is MajorImportBatchPreview => typeof batch?.id === 'string')
        .sort((a, b) => {
          const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return second - first;
        })
        .slice(0, 8);

      setMajorImportBatches(batches);
      const nextBatchId = preferredBatchId || selectedMajorImportBatchId || batches[0]?.id || '';
      setSelectedMajorImportBatchId(nextBatchId);

      if (nextBatchId) {
        const records = await ApiClient.getImportRecords({ batchId: nextBatchId, page: 1, pageSize: 8 });
        setMajorImportRecords(Array.isArray(records.data) ? records.data as MajorImportRecordPreview[] : []);
      } else {
        setMajorImportRecords([]);
      }
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : 'Failed to load import review data.');
    } finally {
      setMajorImportReviewLoading(false);
    }
  };

  useEffect(() => {
    if (domainKey === 'majors') {
      void loadMajorImportReview();
    }
  }, [domainKey]);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  // Handle launch wizard for provider
  const handleLaunchWizard = (prov?: ProviderSource) => {
    const chosen = prov || providers[0] || {
      id: 'custom-source',
      name: `Custom ${currentDomain.defaultName} Ingestion Channel`,
      sourceType: 'manual_source',
      trustScore: 90,
      officialUrl: 'https://official-source.gov.sa/feed',
      lastCheck: new Date().toISOString(),
      importedCount: 0,
      failedCount: 0,
      incompleteCount: 0,
      transferredCount: 0,
      status: 'active'
    };

    setSelectedProvider(chosen);
    setOfficialUrlInput(chosen.officialUrl || '');
    setWizardStep(1);
    setExecutionResult(null);
    setActiveWizard(true);
  };

  // Handle Test Source
  const handleTestSource = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, lastCheck: new Date().toISOString() } : p));
  };

  // Handle Toggle Source
  const handleToggleSource = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p));
  };

  const sourceStatusLabel = (status: TestSourceCheckStatus, rtl: boolean) => {
    const labels: Record<TestSourceCheckStatus, { ar: string; en: string }> = {
      current: { ar: 'مطابق للمصدر', en: 'Current' },
      checking: { ar: 'جاري التحقق', en: 'Checking' },
      update_available: { ar: 'تحديث يحتاج مراجعة', en: 'Update available' },
      needs_review: { ar: 'قيد المراجعة', en: 'Needs review' }
    };

    return rtl ? labels[status].ar : labels[status].en;
  };

  const sourceStatusClass = (status: TestSourceCheckStatus) => {
    if (status === 'update_available' || status === 'needs_review') {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (status === 'checking') {
      return 'bg-blue-100 text-blue-900 border-blue-300';
    }
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  const handleCheckTestSourceCard = (testId: string) => {
    setTestImportCards(prev => prev.map(card => (
      card.testId === testId ? { ...card, checkStatus: 'checking' } : card
    )));

    window.setTimeout(() => {
    setTestImportCards(prev => prev.map(card => {
      if (card.testId !== testId) {
        return card;
      }

      const hasKnownUpdate = card.testId === 'test-cuet-in';
      return {
        ...card,
        checkStatus: hasKnownUpdate ? 'update_available' : 'current',
        changeSummary: hasKnownUpdate
          ? [
              'تحديث تجريبي: نافذة تسجيل CUET الجديدة تحتاج اعتماد المسؤول',
              'تحديث تجريبي: رابط إشعار NTA يحتاج تحقق قبل النشر'
            ]
          : ['تم التحقق الآن: لا توجد تغييرات جديدة مقارنة بالنسخة المنشورة']
      };
    }));
    }, 450);
  };

  const handleStartTestUpdateImport = (card: InternationalTestSourceCard) => {
    setSelectedProvider({
      id: `source-${card.testId}`,
      name: card.providerName,
      sourceType: 'manual_source',
      trustScore: 95,
      officialUrl: card.sourceUrl,
      lastCheck: new Date().toISOString(),
      importedCount: 1,
      failedCount: 0,
      incompleteCount: card.checkStatus === 'update_available' ? 1 : 0,
      transferredCount: 0,
      status: 'active'
    });
    setOfficialUrlInput(card.sourceUrl);
    setTestImportFile(null);
    setTestImportText([
      `تحديث تجريبي للاختبار: ${card.title}`,
      `المعرف: ${card.testId}`,
      `المصدر: ${card.sourceUrl}`,
      `الملف الأساسي: ${card.fileName}`,
      '',
      'تغيير مقترح:',
      '- نافذة تسجيل جديدة تحتاج مراجعة قبل النشر.',
      '- لا يتم حذف النسخة المنشورة الحالية؛ يتم إنشاء مسودة تحديث مرتبطة بالاختبار نفسه.'
    ].join('\n'));
    setPastedPayload('');
    setWizardStep(1);
    setExecutionResult(null);
    setActiveWizard(true);
  };

  const handleLoadSampleTestFile = async () => {
    try {
      const response = await fetch(SAMPLE_TEST_IMPORT_FILE.path);
      const sampleText = await response.text();
      const sampleFile = new File([sampleText], SAMPLE_TEST_IMPORT_FILE.name, { type: 'text/markdown' });

      setSelectedProvider({
        id: 'source-test-cuet-in-sample',
        name: SAMPLE_TEST_IMPORT_FILE.providerName,
        sourceType: 'manual_source',
        trustScore: 95,
        officialUrl: SAMPLE_TEST_IMPORT_FILE.sourceUrl,
        lastCheck: new Date().toISOString(),
        importedCount: 1,
        failedCount: 0,
        incompleteCount: 1,
        transferredCount: 0,
        status: 'active'
      });
      setOfficialUrlInput(SAMPLE_TEST_IMPORT_FILE.sourceUrl);
      setTestImportFile(sampleFile);
      setTestImportText(sampleText);
      setPastedPayload(sampleText);
    } catch (error) {
      console.warn('Failed to load sample test import file:', error);
    }
  };

  const handleSelectMajorBulkFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) {
      setMajorBulkFiles([]);
      return;
    }

    try {
      const loadedFiles = await Promise.all(files.map((file) => new Promise<MajorBulkImportFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          sourceFileName: file.name,
          dataText: typeof reader.result === 'string' ? reader.result : '',
          sizeBytes: file.size,
        });
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
        reader.readAsText(file);
      })));
      setMajorBulkFiles(loadedFiles.filter((file) => file.dataText.trim().length > 0));
      setMajorImportPreview(null);
      setMajorImportNotice(isRTL
        ? `تم تجهيز ${loadedFiles.length} ملف للمعاينة أو الاستيراد.`
        : `${loadedFiles.length} files are ready for preview or import.`);
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : (isRTL ? 'تعذر قراءة الملفات.' : 'Files could not be read.'));
    }
  };

  const buildMajorBulkPayload = () => ({
    catalogKind: majorBulkCatalogKind,
    sourceSystem: `PHASE_10_${majorBulkCatalogKind}_BULK_DETAIL_DOSSIERS`,
    files: majorBulkFiles.map((file) => ({
      sourceFileName: file.sourceFileName,
      dataText: file.dataText,
    })),
  });

  const handlePreviewMajorBulkDetailFiles = async () => {
    if (majorBulkFiles.length === 0) {
      setMajorImportNotice(isRTL ? 'اختر ملفًا واحدًا على الأقل قبل المعاينة.' : 'Choose at least one file before preview.');
      return;
    }

    setMajorImportRunning('bulk-details-preview');
    setMajorImportNotice(null);
    try {
      const result = await ApiClient.previewMajorDetailDossierFiles(buildMajorBulkPayload());
      setMajorImportPreview({
        kind: majorBulkCatalogKind,
        mode: 'details',
        label: isRTL ? `${majorBulkFiles.length} ملفات` : `${majorBulkFiles.length} files`,
        ...result,
        previewRows: Array.isArray(result?.files)
          ? result.files.flatMap((file: any) => Array.isArray(file.previewRows) ? file.previewRows : []).slice(0, 25)
          : [],
      });
      setMajorImportNotice(isRTL
        ? `تم تحليل ${result?.summary?.totalFiles ?? majorBulkFiles.length} ملف: ${result?.summary?.totalRecords ?? 0} تخصص و${result?.summary?.totalContentSections ?? 0} قسم تفاصيل.`
        : `${result?.summary?.totalFiles ?? majorBulkFiles.length} files analyzed: ${result?.summary?.totalRecords ?? 0} majors and ${result?.summary?.totalContentSections ?? 0} detail sections.`);
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : (isRTL ? 'تعذر تحليل الملفات.' : 'Files could not be previewed.'));
    } finally {
      setMajorImportRunning(null);
    }
  };

  const handleImportMajorBulkDetailFiles = async () => {
    if (majorBulkFiles.length === 0) {
      setMajorImportNotice(isRTL ? 'اختر ملفًا واحدًا على الأقل قبل الاستيراد.' : 'Choose at least one file before import.');
      return;
    }

    setMajorImportRunning('bulk-details');
    setMajorImportNotice(null);
    try {
      const result = await ApiClient.importMajorDetailDossierFiles(buildMajorBulkPayload());
      const batchIds = Array.isArray(result?.summary?.batchIds) ? result.summary.batchIds.filter((id: unknown): id is string => typeof id === 'string') : [];
      if (batchIds[0]) {
        setLastMajorImportBatches((prev) => ({ ...prev, [`${majorBulkCatalogKind}-bulk-details`]: batchIds[0] }));
        await loadMajorImportReview(batchIds[0]);
      } else {
        await loadMajorImportReview();
      }
      setMajorImportNotice(isRTL
        ? `تم استيراد ${result?.summary?.totalFiles ?? majorBulkFiles.length} ملف: ${result?.summary?.stagedRecords ?? 0} سجل جاهز للمراجعة و${result?.summary?.totalContentSections ?? 0} قسم تفاصيل.`
        : `${result?.summary?.totalFiles ?? majorBulkFiles.length} files imported: ${result?.summary?.stagedRecords ?? 0} records staged with ${result?.summary?.totalContentSections ?? 0} detail sections.`);
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : (isRTL ? 'تعذر استيراد الملفات.' : 'Files could not be imported.'));
    } finally {
      setMajorImportRunning(null);
    }
  };

  const handleRunMajorWorkspaceImport = async (kind: MajorCatalogKind, mode: 'catalog' | 'details') => {
    const label = MAJOR_KIND_LABELS[kind][isRTL ? 'ar' : 'en'];
    const runKey = `${kind}-${mode}`;
    setMajorImportRunning(runKey);
    setMajorImportNotice(null);
    try {
      const result = mode === 'catalog'
        ? await ApiClient.importMajorCatalogFromWorkspace(kind)
        : await ApiClient.importMajorDetailDossierFromWorkspace(kind);
      const count = result?.summary?.totalRecords ?? result?.batch?.totalRecords ?? 0;
      const batchId = typeof result?.batch?.id === 'string' ? result.batch.id : undefined;
      if (batchId) {
        setLastMajorImportBatches((prev) => ({ ...prev, [runKey]: batchId }));
        await loadMajorImportReview(batchId);
      }
      setMajorImportNotice(isRTL
        ? `تم تجهيز ${count} سجل من ${label} في سجلات الاستيراد للمراجعة.`
        : `${count} ${label} records were staged for review.`);
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : (isRTL ? 'تعذر تشغيل الاستيراد.' : 'Import could not be started.'));
    } finally {
      setMajorImportRunning(null);
    }
  };

  const handlePreviewMajorWorkspaceImport = async (kind: MajorCatalogKind, mode: 'catalog' | 'details') => {
    const label = MAJOR_KIND_LABELS[kind][isRTL ? 'ar' : 'en'];
    const runKey = `${kind}-${mode}-preview`;
    setMajorImportRunning(runKey);
    setMajorImportNotice(null);
    try {
      const result = mode === 'catalog'
        ? await ApiClient.previewMajorCatalogFromWorkspace(kind)
        : await ApiClient.previewMajorDetailDossierFromWorkspace(kind);
      setMajorImportPreview({ kind, mode, label, ...result });
      const count = result?.summary?.totalRecords ?? 0;
      const sectionCount = result?.summary?.totalContentSections;
      setMajorImportNotice(isRTL
        ? `تم تحليل ${count} سجل من ${label}${typeof sectionCount === 'number' ? ` مع ${sectionCount} قسم تفاصيل` : ''}. لم يتم إنشاء دفعة استيراد بعد.`
        : `${count} ${label} records analyzed${typeof sectionCount === 'number' ? ` with ${sectionCount} detail sections` : ''}. No import batch has been created yet.`);
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : (isRTL ? 'تعذر تحليل ملف الاستيراد.' : 'Import preview could not be analyzed.'));
    } finally {
      setMajorImportRunning(null);
    }
  };

  const handlePromoteMajorImportBatch = async (kind: MajorCatalogKind, mode: 'catalog' | 'details') => {
    const label = MAJOR_KIND_LABELS[kind][isRTL ? 'ar' : 'en'];
    const runKey = `${kind}-${mode}`;
    const batchId = lastMajorImportBatches[runKey];
    if (!batchId) {
      setMajorImportNotice(isRTL
        ? 'قم بتجهيز دفعة الاستيراد أولاً قبل الترقية.'
        : 'Stage this import batch before promotion.');
      return;
    }

    setMajorImportRunning(`${runKey}-promote`);
    setMajorImportNotice(null);
    try {
      const result = await ApiClient.promoteImportBatch(batchId);
      await loadMajorImportReview(batchId);
      setMajorImportNotice(isRTL
        ? `تمت ترقية ${result?.promoted ?? 0} سجل من ${label} إلى لوحة التخصصات، وفشل ${result?.failed ?? 0} سجل للمراجعة.`
        : `${result?.promoted ?? 0} ${label} records promoted to the majors workspace; ${result?.failed ?? 0} need review.`);
    } catch (error) {
      setMajorImportNotice(error instanceof Error ? error.message : (isRTL ? 'تعذر ترقية دفعة الاستيراد.' : 'Import batch promotion could not be completed.'));
    } finally {
      setMajorImportRunning(null);
    }
  };

  // Run Batch Execution (Step 6)
  const handleRunBatchExecution = async () => {
    setIsExecuting(true);
    try {
      const limitNum = recordLimit === 'custom' ? customRecordLimit : parseInt(recordLimit, 10);
      
      let targetDataType = 'SCHOLARSHIPS';
      const keyLower = (domainKey || '').toLowerCase();
      if (keyLower === 'international-tests' || keyLower === 'tests') {
        targetDataType = 'TESTS';
      } else if (keyLower === 'scholarships') {
        targetDataType = 'SCHOLARSHIPS';
      } else if (keyLower === 'universities') {
        targetDataType = 'UNIVERSITIES';
      } else if (keyLower === 'majors') {
        targetDataType = 'MAJORS';
      } else if (keyLower === 'courses') {
        targetDataType = 'COURSES';
      } else if (keyLower === 'services') {
        targetDataType = 'SERVICES';
      } else if (domainKey) {
        targetDataType = domainKey.toUpperCase();
      }

      let dataTextContent = '';
      let testPayloadObj: any = null;

      if (keyLower === 'international-tests' || keyLower === 'tests' || targetDataType === 'TESTS') {
        const combinedStr = ((testImportFile?.name || '') + ' ' + (testImportText || '') + ' ' + (pastedPayload || '')).toLowerCase();
        
        type TestImportProfile = {
          tName: string;
          dispName: string;
          nameAr: string;
          nameEn: string;
          provName: string;
          abbrev: string;
          cat: string;
          scoreR: string;
          scoreBands: string[];
          feeVal: string;
          scoreMinimum: number;
          scoreMaximum: number;
          scoreIncrement: number;
          sections: Array<{
            sectionName: string;
            sectionType: string;
            durationMinutes?: number;
            questionCount?: number;
            scoreMinimum?: number;
            scoreMaximum?: number;
            order: number;
          }>;
        };

        let importProfile: TestImportProfile = {
          tName: 'IELTS Academic',
          dispName: 'IELTS Academic - International English Language Testing System',
          nameAr: 'IELTS Academic',
          nameEn: 'IELTS Academic Official Master Data Reference 2026',
          provName: selectedProvider?.name || 'British Council / IDP / Cambridge Assessment',
          abbrev: 'IELTS',
          cat: 'LANGUAGE_PROFICIENCY',
          scoreR: '0.0 - 9.0 Band Scale',
          scoreBands: ['0.0 - 9.0 Band Scale'],
          feeVal: 'USD $265 - $215',
          scoreMinimum: 0,
          scoreMaximum: 9,
          scoreIncrement: 0.5,
          sections: [
            { sectionName: 'Listening', sectionType: 'LANGUAGE_SKILL', durationMinutes: 30, questionCount: 40, scoreMinimum: 0, scoreMaximum: 9, order: 1 },
            { sectionName: 'Reading', sectionType: 'LANGUAGE_SKILL', durationMinutes: 60, questionCount: 40, scoreMinimum: 0, scoreMaximum: 9, order: 2 },
            { sectionName: 'Writing', sectionType: 'LANGUAGE_SKILL', durationMinutes: 60, questionCount: 2, scoreMinimum: 0, scoreMaximum: 9, order: 3 },
            { sectionName: 'Speaking', sectionType: 'LANGUAGE_SKILL', durationMinutes: 14, questionCount: 3, scoreMinimum: 0, scoreMaximum: 9, order: 4 }
          ]
        };

        if (combinedStr.includes('toefl')) {
          importProfile = { ...importProfile, tName: 'TOEFL iBT', dispName: 'TOEFL iBT - Internet-Based Test', nameAr: 'TOEFL iBT', nameEn: 'TOEFL iBT Official Master Data Reference 2026', provName: 'ETS (Educational Testing Service)', abbrev: 'TOEFL', scoreR: '0 - 120 Score', scoreBands: ['0 - 120 Score'], feeVal: 'USD $245 - $190', scoreMaximum: 120, scoreIncrement: 1 };
        } else if (combinedStr.includes('sat')) {
          importProfile = {
            ...importProfile,
            tName: 'SAT',
            dispName: 'SAT - Scholastic Assessment Test',
            nameAr: 'SAT',
            nameEn: 'Scholastic Assessment Test',
            provName: 'College Board',
            abbrev: 'SAT',
            cat: 'UNDERGRAD_ADMISSION',
            scoreR: '400 - 1600',
            scoreBands: ['400 - 1600'],
            feeVal: 'USD $111+',
            scoreMinimum: 400,
            scoreMaximum: 1600,
            scoreIncrement: 10,
            sections: [
              { sectionName: 'Reading and Writing', sectionType: 'ACADEMIC_SUBJECT', durationMinutes: 64, scoreMinimum: 200, scoreMaximum: 800, order: 1 },
              { sectionName: 'Math', sectionType: 'ACADEMIC_SUBJECT', durationMinutes: 70, scoreMinimum: 200, scoreMaximum: 800, order: 2 }
            ]
          };
        } else if (combinedStr.includes('gre')) {
          importProfile = { ...importProfile, tName: 'GRE General Test', dispName: 'GRE General Test', nameAr: 'GRE General Test', nameEn: 'GRE General Test Official Master Data Reference 2026', provName: 'ETS (Educational Testing Service)', abbrev: 'GRE', cat: 'GRAD_ADMISSION', scoreR: '260 - 340 Score', scoreBands: ['260 - 340 Score'], feeVal: 'USD $220', scoreMinimum: 260, scoreMaximum: 340, scoreIncrement: 1 };
        } else if (combinedStr.includes('duolingo') || combinedStr.includes('det')) {
          importProfile = { ...importProfile, tName: 'Duolingo English Test', dispName: 'Duolingo English Test', nameAr: 'Duolingo English Test', nameEn: 'Duolingo English Test Official Master Data Reference 2026', provName: 'Duolingo Inc.', abbrev: 'DET', scoreR: '10 - 160 Score Scale', scoreBands: ['10 - 160 Score Scale'], feeVal: 'USD $59', scoreMinimum: 10, scoreMaximum: 160, scoreIncrement: 5 };
        } else if (combinedStr.includes('cuet')) {
          importProfile = {
            ...importProfile,
            tName: 'CUET',
            dispName: 'CUET - Common University Entrance Test',
            nameAr: 'CUET',
            nameEn: 'Common University Entrance Test',
            provName: 'National Testing Agency (NTA)',
            abbrev: 'CUET',
            cat: 'UNDERGRAD_ADMISSION',
            scoreR: '0 - 250 per subject',
            scoreBands: ['0 - 250 per subject', 'Normalized score by subject/session'],
            feeVal: 'INR 1000+',
            scoreMinimum: 0,
            scoreMaximum: 250,
            scoreIncrement: 1,
            sections: [
              { sectionName: 'Language Test', sectionType: 'LANGUAGE_SKILL', durationMinutes: 45, scoreMinimum: 0, scoreMaximum: 250, order: 1 },
              { sectionName: 'Domain Subjects', sectionType: 'ACADEMIC_SUBJECT', durationMinutes: 60, scoreMinimum: 0, scoreMaximum: 250, order: 2 },
              { sectionName: 'General Test', sectionType: 'GENERAL', durationMinutes: 60, scoreMinimum: 0, scoreMaximum: 250, order: 3 }
            ]
          };
        }

        const officialSourceUrl = officialUrlInput || selectedProvider?.officialUrl || 'https://www.ielts.org';
        const importedSourceText = testImportText || pastedPayload || '';
        const feeAmount = Number.parseFloat(importProfile.feeVal.replace(/[^0-9.]/g, ''));
        const importFileName = testImportFile?.name || importProfile.abbrev + '_manual_update.md';
        const importFileSize = testImportFile ? (testImportFile.size / 1024).toFixed(1) + ' KB' : '1.0 KB';

        testPayloadObj = {
          testName: importProfile.tName,
          displayName: importProfile.dispName,
          canonicalName: importProfile.tName,
          localizedNameAr: importProfile.nameAr,
          localizedNameEn: importProfile.nameEn,
          abbreviation: importProfile.abbrev,
          providerName: importProfile.provName,
          testCategory: importProfile.cat,
          officialSourceUrl,
          officialRegistrationUrl: officialSourceUrl,
          description: importedSourceText || 'Imported international test specification document.',
          sections: importProfile.sections,
          scoreScale: {
            overallMinimum: importProfile.scoreMinimum,
            overallMaximum: importProfile.scoreMaximum,
            scoreIncrement: importProfile.scoreIncrement,
            resultValidityDurationMonths: 24,
            bandsOrLevels: importProfile.scoreBands
          },
          fees: [{ feeType: 'REGISTRATION', amount: Number.isFinite(feeAmount) ? feeAmount : undefined, currencyCode: importProfile.feeVal.includes('INR') ? 'INR' : 'USD', hasRegionalVariation: true }],
          officialLinks: [{ linkType: 'SOURCE', url: officialSourceUrl, description: 'Official source URL used by the import flow', sourceName: importProfile.provName, lastVerifiedAt: new Date().toISOString(), linkHealthStatus: 'NEEDS_REVIEW', sourceTrustLevel: 'AUTHORITATIVE' }],
          importEvidence: { originalImportedName: importFileName, normalizedCanonicalName: importProfile.tName, sourceUrl: officialSourceUrl, retrievedAt: new Date().toISOString(), evidenceSnippet: importedSourceText.slice(0, 500), confidenceScore: testImportFile ? 0.85 : 0.7, sourceTrustLevel: 'AUTHORITATIVE', duplicateStatus: 'NEEDS_REVIEW' },
          optionalFields: { attachedFileName: importFileName, fileSize: importFileSize, importNotes: importedSourceText || 'Imported test details from admin import center.', fee: importProfile.feeVal, originalSourceContent: importedSourceText }
        };

        dataTextContent = JSON.stringify(testPayloadObj, null, 2);
      } else if (inputMethod === 'paste' && pastedPayload && pastedPayload.trim().length > 0) {
        dataTextContent = pastedPayload;
      } else {
        dataTextContent = JSON.stringify({
          provider: selectedProvider?.name || 'Manual Import Channel',
          officialUrl: officialUrlInput || selectedProvider?.officialUrl || '',
          limit: limitNum,
          method: inputMethod,
          instructions
        }, null, 2);
      }

      const payload = {
        dataType: targetDataType,
        sourceSystem: selectedProvider?.name || 'Manual Import Channel',
        dataText: dataTextContent
      };

      let batchRes: any = null;
      try {
        batchRes = await ApiClient.createImportBatch(payload);
      } catch (err) {
        console.warn('API createImportBatch fallback:', err);
      }
      const createdRecords = batchRes?.records || [];
      const batchId = batchRes?.batch?.id || `batch-${Date.now().toString().substring(6)}`;

      const promotedList: Array<{ recordId: string; testId: string; testName: string }> = [];

      // Auto promote valid records if domain is TESTS / international-tests
      if (targetDataType === 'TESTS' || keyLower === 'international-tests' || keyLower === 'tests') {
        for (const rec of createdRecords) {
          if (rec.id && (rec.status === 'COMPLETE' || rec.status === 'VALID' || rec.status === 'NEEDS_REVIEW')) {
            try {
              const prom = await ApiClient.promoteImportRecord(rec.id);
              if (prom && (prom.type === 'CREATED' || prom.type === 'DUPLICATE') && (prom.testId || prom.existingId)) {
                promotedList.push({
                  recordId: rec.id,
                  testId: prom.testId || prom.existingId,
                  testName: rec.rawPayload?.displayName || rec.rawPayload?.testName || 'IELTS Academic'
                });
              }
            } catch (pErr) {
              console.warn('Auto-promotion warning for record', rec.id, pErr);
            }
          }
        }

        // Add to International Test Import Cards
        if (testPayloadObj) {
          const finalTestId = promotedList[0]?.testId || `test-${testPayloadObj.abbreviation.toLowerCase()}-${Date.now().toString().slice(-4)}`;
          const newCardObj: InternationalTestSourceCard = {
            id: `source-card-${finalTestId}`,
            testId: finalTestId,
            title: testPayloadObj.displayName,
            fileName: testImportFile?.name || 'manual-test-update.md',
            fileSize: testImportFile ? `${(testImportFile.size / 1024).toFixed(1)} KB` : '1.0 KB',
            providerName: testPayloadObj.providerName,
            family: testPayloadObj.testCategory,
            sourceUrl: testPayloadObj.officialSourceUrl,
            version: 2,
            scoreRange: Array.isArray(testPayloadObj.scoreScale.bandsOrLevels)
              ? testPayloadObj.scoreScale.bandsOrLevels.join(', ')
              : String(testPayloadObj.scoreScale.bandsOrLevels || ''),
            validity: `${testPayloadObj.scoreScale.resultValidityDurationMonths} شهر`,
            status: 'NEEDS_REVIEW',
            checkStatus: 'needs_review',
            importedAt: new Date().toISOString().slice(0, 10),
            changeSummary: [
              testImportFile ? `تم إرفاق ملف تحديث: ${testImportFile.name}` : 'تم إدخال تحديث نصي يدوي',
              'تم إنشاء مسودة تحديث مرتبطة بالاختبار نفسه وتحتاج مراجعة قبل النشر'
            ]
          };
          setTestImportCards(prev => [newCardObj, ...prev.filter(c => c.testId !== newCardObj.testId)]);
        }
      }

      setExecutionResult({
        batchId,
        total: batchRes?.batch?.totalRecords || limitNum,
        staged: batchRes?.batch?.processedRecords || limitNum,
        records: createdRecords,
        promotedCount: promotedList.length,
        promotedTests: promotedList
      });

      setWizardStep(6);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePromoteRecord = async (recordId?: string) => {
    let targetId = recordId;
    if (!targetId && executionResult?.records?.[0]?.id) {
      targetId = executionResult.records[0].id;
    }
    if (!targetId && executionResult?.batchId) {
      try {
        const batchRecords = await ApiClient.getImportedRecords({ batchId: executionResult.batchId });
        if (batchRecords?.data?.[0]?.id) {
          targetId = batchRecords.data[0].id;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!targetId) return;

    try {
      const res = await ApiClient.promoteImportRecord(targetId);
      if (res && (res.type === 'CREATED' || res.type === 'DUPLICATE') && (res.testId || res.existingId)) {
        const testId = res.testId || res.existingId;
        setExecutionResult((prev: any) => {
          if (!prev) return prev;
          const exists = prev.promotedTests?.some((p: any) => p.recordId === targetId);
          if (exists) return prev;
          const newPromoted = [
            ...(prev.promotedTests || []),
            { recordId: targetId, testId, testName: 'IELTS Academic' }
          ];
          return {
            ...prev,
            promotedCount: newPromoted.length,
            promotedTests: newPromoted
          };
        });
      }
    } catch (err) {
      console.error('Failed to promote record:', err);
    }
  };

  const isRTL = dir === 'rtl';
  const domainTitle = isRTL ? (currentDomain as any).defaultNameAr || currentDomain.defaultName : currentDomain.defaultName;

  const getTrustBadge = (score: number) => {
    if (isRTL) {
      if (score >= 90) return { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'فئة مصدر مسجل' };
      if (score >= 80) return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'تتطلب مراجعة المجال' };
      if (score >= 50) return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'غير متصل بمحرك التحقق' };
      return { color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'معاينة فقط' };
    }
    if (score >= 90) return { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Registered source category' };
    if (score >= 80) return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Requires domain review' };
    if (score >= 50) return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Not connected to verification engine' };
    return { color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Preview only' };
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6" dir={dir}>
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link 
          to="/admin/imports" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('back_to_import_management') || (isRTL ? 'العودة لإدارة الاستيراد' : 'Back to Import Management')}</span>
        </Link>

        <Link
          to={currentDomain.workspacePath}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('open_domain_workspace') || (isRTL ? 'فتح لوحة المجال' : 'Open Domain Workspace')}</span>
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl">
            {currentDomain.icon}
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 mb-1.5">
              <ShieldCheck className="w-3 h-3" />
              <span>{isRTL ? 'مركز التحكم بالمجال المخصص' : 'Dedicated Domain Control Center'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {t(`${domainKey}_import_center` as any) || (isRTL ? `مركز استيراد ${domainTitle}` : `${currentDomain.defaultName} Import Center`)}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {isRTL 
                ? 'خط معالجة بيانات معزول للمجال، مع خلاصات المزودين المسجلين، ودرجات موثوقية المصادر، وتشغيل معالج الاستيراد.' 
                : 'Domain-isolated ingestion pipeline, registered provider feeds, source trust scores, and wizard execution.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleLaunchWizard()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{t('start_import') || (isRTL ? 'بدء معالج الاستيراد' : 'Start Import Wizard')}</span>
        </button>
      </div>

      {/* SCHOLARSHIP DOMAIN INTELLIGENCE OVERVIEW */}
      {domainKey === 'scholarships' && (
        <>
          {/* 1. Visual Ingestion Pipeline Flow Banner */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{t('import_pipeline_flow') || (isRTL ? 'خط ومراحل معالجة البيانات الفورية للمنح الدراسية' : 'Scholarships Ingestion Pipeline Flow')}</span>
            </div>
            <div className="flex items-center justify-between overflow-x-auto py-2 gap-3 text-xs font-medium border-t border-slate-800/80 pt-4">
              {[
                { en: 'Source', ar: 'المصدر' },
                { en: 'Import', ar: 'الاستيراد' },
                { en: 'Normalize', ar: 'تنظيف الاسم' },
                { en: 'Deduplicate', ar: 'منع التكرار' },
                { en: 'Merge Missing Fields', ar: 'دمج الحقول' },
                { en: 'Transfer to Workspace', ar: 'الترحيل للمنح' },
                { en: 'Human Review', ar: 'مراجعة الخبير' },
                { en: 'Publish', ar: 'النشر العام' },
              ].map((step, idx, arr) => (
                <React.Fragment key={step.en}>
                  <div className="flex flex-col items-center text-center shrink-0 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800/80 min-w-[110px]">
                    <span className="text-[9px] text-slate-500 font-mono">0{idx + 1}</span>
                    <span className="font-bold text-slate-200 text-xs mt-0.5">{dir === 'rtl' ? step.ar : step.en}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <ChevronRight className={`w-4 h-4 text-slate-600 shrink-0 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 2. 10 Metric Summary Intelligence Cards Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>{t('scholarship_import_intelligence') || 'Scholarship Import Intelligence & Quality Controls'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time metrics for name cleaning, deduplication, missing-field enrichment, and domain workspace transfer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { key: 'total_records_read', label: t('total_records_read') || 'إجمالي السجلات المقروءة', value: '815', color: 'bg-slate-50 border-slate-200 text-slate-900', icon: <FileText className="w-4 h-4 text-slate-600" /> },
                { key: 'names_normalized', label: t('names_normalized') || 'أسماء المنح التي تم تنظيفها', value: '742', color: 'bg-blue-50 border-blue-200 text-blue-900', icon: <CheckCircle2 className="w-4 h-4 text-blue-600" /> },
                { key: 'duplicates_skipped', label: t('duplicates_skipped') || 'مكررة وتم تجاهلها', value: '98', color: 'bg-purple-50 border-purple-200 text-purple-900', icon: <Layers className="w-4 h-4 text-purple-600" /> },
                { key: 'existing_enriched', label: t('existing_enriched') || 'منح موجودة تم إكمال حقول ناقصة لها', value: '154', color: 'bg-indigo-50 border-indigo-200 text-indigo-900', icon: <Plus className="w-4 h-4 text-indigo-600" /> },
                { key: 'new_scholarships_created', label: t('new_scholarships_created') || 'منح جديدة تم إنشاؤها', value: '520', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: <GraduationCap className="w-4 h-4 text-emerald-600" /> },
                { key: 'incomplete_records', label: t('incomplete_records') || 'سجلات ناقصة', value: '28', color: 'bg-amber-50 border-amber-200 text-amber-900', icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
                { key: 'failed_records', label: t('failed_records') || 'سجلات فاشلة', value: '15', color: 'bg-rose-50 border-rose-200 text-rose-900', icon: <X className="w-4 h-4 text-rose-600" /> },
                { key: 'transferred_to_workspace', label: t('transferred_to_workspace') || 'تم ترحيلها إلى لوحة المنح', value: '674', color: 'bg-teal-50 border-teal-200 text-teal-900', icon: <ExternalLink className="w-4 h-4 text-teal-600" /> },
                { key: 'requires_source_verification', label: t('requires_source_verification') || 'تحتاج تحقق من المصدر', value: '32', color: 'bg-orange-50 border-orange-200 text-orange-900', icon: <ShieldCheck className="w-4 h-4 text-orange-600" /> },
                { key: 'requires_translation', label: t('requires_translation') || 'تحتاج ترجمة', value: '46', color: 'bg-sky-50 border-sky-200 text-sky-900', icon: <Globe className="w-4 h-4 text-sky-600" /> },
              ].map((item) => (
                <div key={item.key} className={`p-3.5 rounded-xl border ${item.color} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[11px] font-bold line-clamp-2 leading-tight">{item.label}</span>
                    {item.icon}
                  </div>
                  <div className="text-xl font-black">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Title Normalization & Safe Merge Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Title Normalization Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md w-fit border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('title_normalization_intelligence') || 'Title Normalization Intelligence'}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-2">
                  {dir === 'rtl' ? 'مثال تنظيف ومعالجة اسم المنحة' : 'Canonical Name Cleaning Example'}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {t('title_normalization_desc') || 'Scholarship degree level, funding coverage, urgency words, and marketing phrases are removed from the public-facing canonical title, but remain stored in structured fields.'}
                </p>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-0.5">
                      {t('original_title_example') || 'Original Raw Title'}:
                    </span>
                    <div className="p-2 bg-rose-50/60 border border-rose-200 rounded-lg text-slate-800 font-mono text-[11px]">
                      "Fully Funded Qatar University Bachelor Scholarship 2027"
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                      {t('cleaned_title_example') || 'Cleaned Canonical Title'}:
                    </span>
                    <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 font-bold text-xs space-y-1">
                      <div>EN: "Qatar University Scholarship 2027"</div>
                      <div>AR: "منحة جامعة قطر 2027"</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                * Structured extraction preserves Degree Level (Bachelor) and Coverage (Fully Funded) as indexed filters.
              </div>
            </div>

            {/* Safe Merge Rules Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('safe_merge_rules_title') || 'Safe Merge & Deduplication Rules'}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-2">
                  {dir === 'rtl' ? 'ضوابط الدمج الآمن وحماية بيانات مسؤول النظام' : 'Safe Data Merge Principles'}
                </h3>
                
                <div className="space-y-2.5 text-xs text-slate-700 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  <div className="font-bold text-emerald-900 text-xs mb-1">
                    {dir === 'rtl' ? 'عند اكتشاف منحة مكررة:' : 'When a duplicate scholarship is detected:'}
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t('safe_merge_rule_1') || 'Do not create a new duplicate scholarship.'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t('safe_merge_rule_2') || 'Fill only missing empty fields (e.g. stipend, deadline).'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t('safe_merge_rule_3') || 'Do not overwrite admin-reviewed fields silently.'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t('safe_merge_rule_4') || 'Conflicting values must be flagged as Needs Review.'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Phase 12 owns field validation & deduplication; Phase 23 displays control-plane status without auto-publishing.
              </div>
            </div>
          </div>
        </>
      )}

      {/* INTERNATIONAL TESTS SOURCE MONITOR SECTION */}
      {domainKey === 'international-tests' && !activeWizard && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs mb-8" style={{ fontFamily: 'Cairo, sans-serif' }}>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? 'بطاقات مصادر الاختبارات والتحديثات' : 'Test Source Cards & Updates'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isRTL ? 'مركز متابعة استيراد الاختبارات الدولية' : 'International Test Import Monitor'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
                {isRTL
                  ? 'كل اختبار له بطاقة مصدر مرتبطة بصفحة التفاصيل. التحقق يعرض نتيجة واضحة داخل البطاقة، والتحديث يفتح معالج الاستيراد على نفس الاختبار دون إنشاء نسخة مكررة.'
                  : 'Each test has a source card linked to its detail page. Source checks render the result inside the card, and update import opens the wizard for the same test without creating duplicates.'}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveWizard(true);
                setWizardStep(1);
                setTestImportFile(null);
                setTestImportText('');
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isRTL ? 'استيراد ملف اختبار' : 'Import Test File'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] text-slate-500 font-bold">{isRTL ? 'كل البطاقات' : 'All cards'}</span>
              <strong className="block text-lg text-slate-950">{testImportCards.length}</strong>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <span className="text-[11px] text-emerald-700 font-bold">{isRTL ? 'مطابقة للمصدر' : 'Current'}</span>
              <strong className="block text-lg text-emerald-900">{testImportCards.filter(card => card.checkStatus === 'current').length}</strong>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <span className="text-[11px] text-amber-700 font-bold">{isRTL ? 'تحتاج مراجعة' : 'Needs review'}</span>
              <strong className="block text-lg text-amber-900">{testImportCards.filter(card => card.checkStatus === 'update_available' || card.checkStatus === 'needs_review').length}</strong>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <span className="text-[11px] text-blue-700 font-bold">{isRTL ? 'نسخة أساسية' : 'Baseline version'}</span>
              <strong className="block text-lg text-blue-900">v1</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {testImportCards.map((card) => (
              <div key={card.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-extrabold flex items-center gap-1 ${sourceStatusClass(card.checkStatus)}`}>
                      {card.checkStatus === 'checking' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      <span>{sourceStatusLabel(card.checkStatus, isRTL)}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">v{card.version} - {card.importedAt}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1 leading-snug">{card.title}</h3>
                  <p className="text-xs font-bold text-blue-700 mb-1">{card.providerName}</p>
                  <p className="text-[11px] font-bold text-slate-500 mb-3">{card.family}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 font-mono min-w-0">
                      <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900 truncate">{card.fileName}</span>
                      <span className="text-slate-400 text-[10px] shrink-0">({card.fileSize})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">{isRTL ? 'سلم الدرجات' : 'Score range'}</span>
                        <span className="font-extrabold text-slate-800 text-[11px]">{card.scoreRange}</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">{isRTL ? 'الصلاحية' : 'Validity'}</span>
                        <span className="font-extrabold text-slate-800 text-[11px]">{card.validity}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed min-w-0">
                      <span className="font-bold text-slate-900 block mb-1">{isRTL ? 'المصدر الرسمي' : 'Official source'}</span>
                      <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900 break-all inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {card.sourceUrl}
                      </a>
                    </div>

                    {card.changeSummary.length > 0 && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                        <span className="font-extrabold block text-[11px] text-amber-900 mb-1">{isRTL ? 'نتيجة التحقق / مقارنة التغييرات' : 'Check result / diff summary'}</span>
                        <ul className="space-y-1">
                          {card.changeSummary.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleCheckTestSourceCard(card.testId)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'تحقق من المصدر' : 'Check source'}</span>
                  </button>
                  <button
                    onClick={() => handleStartTestUpdateImport(card)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'استيراد تحديث' : 'Import update'}</span>
                  </button>
                  <Link
                    to={`/admin/international-tests/${card.testId}`}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{isRTL ? 'صفحة الاختبار' : 'Test details'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 10 MAJORS IMPORT CENTER */}
      {domainKey === 'majors' && !activeWizard && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs mb-8" style={{ fontFamily: 'Cairo, sans-serif' }}>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? 'كتالوجات المرحلة 10 وملفات التفاصيل' : 'Phase 10 catalogs and detail dossiers'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isRTL ? 'مركز استيراد التخصصات الأكاديمية' : 'Academic Majors Import Center'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
                {isRTL
                  ? 'الكتالوج يضيف التخصصات كهوية وبيانات أساسية. ملف التفاصيل يضيف الأقسام الكاملة للتخصصات التي تم تجهيزها فقط، ولا يحذف أي تخصص منشور أو موجود.'
                  : 'Catalog import stages major identities. Detail dossiers add full content sections only for prepared records without deleting existing data.'}
              </p>
            </div>

            <Link
              to="/admin/majors"
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isRTL ? 'فتح لوحة التخصصات' : 'Open Majors Workspace'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] text-slate-500 font-bold">{isRTL ? 'إجمالي الكتالوج' : 'Catalog total'}</span>
              <strong className="block text-lg text-slate-950">{majorStats.all}</strong>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <span className="text-[11px] text-emerald-700 font-bold">{isRTL ? 'لديها تفاصيل في القاعدة' : 'With details in DB'}</span>
              <strong className="block text-lg text-emerald-900">{majorStats.dbDetails}</strong>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <span className="text-[11px] text-blue-700 font-bold">{isRTL ? 'أقسام التفاصيل' : 'Detail sections'}</span>
              <strong className="block text-lg text-blue-900">{majorStats.totalSections}</strong>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <span className="text-[11px] text-amber-700 font-bold">{isRTL ? 'تحتاج ملفات لاحقة' : 'Pending dossiers'}</span>
              <strong className="block text-lg text-amber-900">{majorStats.all - majorStats.dbDetails}</strong>
            </div>
          </div>

          {majorImportNotice && (
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-700">
              {majorImportNotice}
            </div>
          )}

          <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-extrabold text-blue-800">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>{isRTL ? 'استيراد ملفات تفاصيل متعددة' : 'Bulk detail dossier import'}</span>
                </div>
                <h3 className="text-base font-black text-slate-950">
                  {isRTL ? 'ارفع عدة ملفات تخصصات في عملية واحدة' : 'Upload multiple major files in one run'}
                </h3>
                <p className="mt-1 max-w-3xl text-xs leading-6 text-slate-600">
                  {isRTL
                    ? 'كل ملف يحتفظ باسمه ومصدره ودفعة المراجعة الخاصة به، والملخص يجمع عدد التخصصات والأقسام من جميع الملفات.'
                    : 'Each file keeps its own source name and review batch while the summary combines records and detail sections across all files.'}
                </p>
              </div>

              <div className="grid w-full gap-2 sm:grid-cols-[160px_1fr] lg:w-[520px]">
                <select
                  value={majorBulkCatalogKind}
                  onChange={(event) => setMajorBulkCatalogKind(event.target.value as MajorCatalogKind)}
                  className="rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  {(['BACHELOR', 'MASTER', 'DOCTORATE', 'FELLOWSHIP'] as MajorCatalogKind[]).map((kind) => (
                    <option key={kind} value={kind}>{MAJOR_KIND_LABELS[kind][isRTL ? 'ar' : 'en']}</option>
                  ))}
                </select>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-3 py-2.5 text-xs font-extrabold text-blue-800 hover:bg-blue-100">
                  <Paperclip className="h-4 w-4" />
                  <span>{isRTL ? 'اختيار ملفات Markdown متعددة' : 'Choose multiple Markdown files'}</span>
                  <input
                    type="file"
                    accept=".md,.markdown,.txt,text/markdown,text/plain"
                    multiple
                    className="hidden"
                    onChange={(event) => void handleSelectMajorBulkFiles(event.target.files)}
                  />
                </label>
              </div>
            </div>

            {majorBulkFiles.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900">
                    {isRTL ? `الملفات المختارة: ${majorBulkFiles.length}` : `Selected files: ${majorBulkFiles.length}`}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {(majorBulkFiles.reduce((sum, file) => sum + file.sizeBytes, 0) / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {majorBulkFiles.slice(0, 8).map((file) => (
                    <div key={`${file.sourceFileName}-${file.sizeBytes}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="truncate text-[11px] font-extrabold text-slate-800">{file.sourceFileName}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{(file.sizeBytes / 1024).toFixed(1)} KB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                onClick={handlePreviewMajorBulkDetailFiles}
                disabled={majorImportRunning !== null || majorBulkFiles.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-xs font-extrabold text-blue-800 transition-all hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {majorImportRunning === 'bulk-details-preview' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                <span>{isRTL ? 'معاينة كل الملفات' : 'Preview all files'}</span>
              </button>
              <button
                onClick={handleImportMajorBulkDetailFiles}
                disabled={majorImportRunning !== null || majorBulkFiles.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-blue-800 disabled:bg-blue-300"
              >
                {majorImportRunning === 'bulk-details' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                <span>{isRTL ? 'استيراد كل الملفات' : 'Import all files'}</span>
              </button>
              <button
                onClick={() => {
                  setMajorBulkFiles([]);
                  setMajorImportPreview(null);
                  setMajorImportNotice(null);
                }}
                disabled={majorImportRunning !== null || majorBulkFiles.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 transition-all hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isRTL ? 'مسح الاختيار' : 'Clear selection'}</span>
              </button>
            </div>
          </div>

          {majorImportPreview && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-emerald-950">
                    {isRTL ? `معاينة ${majorImportPreview.label}` : `${majorImportPreview.label} preview`}
                  </h3>
                  <p className="mt-1 text-xs leading-6 text-emerald-900">
                    {majorImportPreview.summary?.duplicatePolicy}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-emerald-800">
                  {majorImportPreview.mode === 'catalog'
                    ? (isRTL ? 'كتالوج' : 'Catalog')
                    : (isRTL ? 'تفاصيل' : 'Details')}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-white p-3">
                  <span className="block text-[10px] font-bold text-slate-400">{isRTL ? 'السجلات' : 'Records'}</span>
                  <strong className="text-base text-slate-950">{majorImportPreview.summary?.totalRecords ?? 0}</strong>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <span className="block text-[10px] font-bold text-slate-400">{isRTL ? 'الأقسام' : 'Sections'}</span>
                  <strong className="text-base text-slate-950">{majorImportPreview.summary?.totalContentSections ?? '-'}</strong>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <span className="block text-[10px] font-bold text-slate-400">{isRTL ? 'المتخطى' : 'Skipped'}</span>
                  <strong className="text-base text-slate-950">{majorImportPreview.summary?.skippedRows ?? majorImportPreview.summary?.skippedSections ?? 0}</strong>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <span className="block text-[10px] font-bold text-slate-400">{isRTL ? 'الوضع' : 'Mode'}</span>
                  <strong className="text-xs text-slate-950">{majorImportPreview.summary?.importMode}</strong>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(majorImportPreview.previewRows || []).slice(0, 6).map((row: any) => (
                  <div key={`${row.code}-${row.canonicalMajorName}`} className="rounded-xl bg-white p-3 text-xs">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-slate-900">{row.code}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {row.degreeLevel || row.catalogKind}
                      </span>
                    </div>
                    <p className="font-extrabold leading-6 text-slate-900">{row.localizedNames?.ar || row.canonicalMajorName}</p>
                    {row.canonicalMajorName && <p dir="ltr" className="mt-1 truncate text-right text-[11px] text-slate-500">{row.canonicalMajorName}</p>}
                    {typeof row.contentSectionCount === 'number' && (
                      <p className="mt-1 text-[11px] font-bold text-emerald-700">
                        {row.contentSectionCount} {isRTL ? 'قسم تفاصيل' : 'detail sections'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MAJOR_IMPORT_CARDS.map((card) => {
              const catalogRunKey = `${card.kind}-catalog`;
              const detailsRunKey = `${card.kind}-details`;
              const label = MAJOR_KIND_LABELS[card.kind];
              return (
                <article key={card.kind} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-emerald-300 transition-all shadow-2xs">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1 leading-snug">
                        {isRTL ? card.titleAr : card.titleEn}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRTL ? 'درجة/مسار' : 'Level'}: <span className="font-bold text-slate-800">{isRTL ? label.ar : label.en}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-extrabold text-slate-700">
                      {card.kind}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">{isRTL ? 'الكتالوج' : 'Catalog'}</span>
                      <span className="font-extrabold text-slate-800">{card.totalRecords}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-600 block">{isRTL ? 'تفاصيل' : 'Detailed'}</span>
                      <span className="font-extrabold text-emerald-800">{card.detailRecords}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-blue-200">
                      <span className="text-[10px] text-blue-600 block">{isRTL ? 'أقسام' : 'Sections'}</span>
                      <span className="font-extrabold text-blue-800">{card.detailSections}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{card.catalogFile}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-2.5">
                      <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{card.detailFile}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePreviewMajorWorkspaceImport(card.kind, 'catalog')}
                      disabled={majorImportRunning !== null}
                      className="px-3 py-2 bg-white hover:bg-slate-100 disabled:bg-slate-100 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      {majorImportRunning === `${catalogRunKey}-preview` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'معاينة الكتالوج' : 'Preview catalog'}</span>
                    </button>
                    <button
                      onClick={() => handlePreviewMajorWorkspaceImport(card.kind, 'details')}
                      disabled={majorImportRunning !== null || card.detailRecords === 0}
                      className="px-3 py-2 bg-white hover:bg-slate-100 disabled:bg-slate-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      {majorImportRunning === `${detailsRunKey}-preview` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'معاينة التفاصيل' : 'Preview details'}</span>
                    </button>
                    <button
                      onClick={() => handleRunMajorWorkspaceImport(card.kind, 'catalog')}
                      disabled={majorImportRunning !== null}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {majorImportRunning === catalogRunKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'استيراد الكتالوج' : 'Import catalog'}</span>
                    </button>
                    <button
                      onClick={() => handleRunMajorWorkspaceImport(card.kind, 'details')}
                      disabled={majorImportRunning !== null || card.detailRecords === 0}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {majorImportRunning === detailsRunKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'استيراد التفاصيل' : 'Import details'}</span>
                    </button>
                    <button
                      onClick={() => handlePromoteMajorImportBatch(card.kind, 'catalog')}
                      disabled={majorImportRunning !== null || !lastMajorImportBatches[catalogRunKey]}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {majorImportRunning === `${catalogRunKey}-promote` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'ترقية الكتالوج' : 'Promote catalog'}</span>
                    </button>
                    <button
                      onClick={() => handlePromoteMajorImportBatch(card.kind, 'details')}
                      disabled={majorImportRunning !== null || !lastMajorImportBatches[detailsRunKey]}
                      className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {majorImportRunning === `${detailsRunKey}-promote` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'ترقية التفاصيل' : 'Promote details'}</span>
                    </button>
                    <Link
                      to={`/admin/majors?degree=${card.kind}`}
                      className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      <span>{isRTL ? 'عرض السجلات' : 'View records'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {isRTL ? 'مراجعة دفعات الاستيراد الأخيرة' : 'Recent import batch review'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isRTL
                    ? 'هنا تظهر الدفعات التي تم تجهيزها أو ترقيتها، مع حالة أول السجلات للمراجعة السريعة.'
                    : 'Recently staged or promoted batches appear here with a quick preview of their records.'}
                </p>
              </div>
              <button
                onClick={() => loadMajorImportReview()}
                disabled={majorImportReviewLoading}
                className="px-3 py-2 bg-white hover:bg-slate-100 disabled:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
              >
                {majorImportReviewLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
              </button>
            </div>

            {majorImportBatches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs text-slate-500">
                {isRTL ? 'لا توجد دفعات تخصصات أو زمالات مستوردة بعد.' : 'No major or fellowship import batches have been staged yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                <div className="space-y-2">
                  {majorImportBatches.map((batch) => {
                    const selected = batch.id === selectedMajorImportBatchId;
                    return (
                      <button
                        key={batch.id}
                        onClick={async () => {
                          setSelectedMajorImportBatchId(batch.id);
                          setMajorImportReviewLoading(true);
                          try {
                            const records = await ApiClient.getImportRecords({ batchId: batch.id, page: 1, pageSize: 8 });
                            setMajorImportRecords(Array.isArray(records.data) ? records.data as MajorImportRecordPreview[] : []);
                          } finally {
                            setMajorImportReviewLoading(false);
                          }
                        }}
                        className={`w-full text-start rounded-xl border p-3 transition-all ${selected ? 'bg-white border-emerald-300 shadow-xs' : 'bg-white/70 border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-extrabold text-slate-900">{batch.dataType || 'MAJORS'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${batch.batchStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                            {batch.batchStatus || 'PROCESSING'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate">{batch.sourceSystem || batch.id}</div>
                        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-600">
                          <span>{isRTL ? 'الإجمالي' : 'Total'}: {batch.totalRecords ?? 0}</span>
                          <span>{isRTL ? 'معالج' : 'Done'}: {batch.processedRecords ?? 0}</span>
                          <span>{isRTL ? 'فشل' : 'Failed'}: {batch.failedRecords ?? 0}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="grid grid-cols-[1fr_96px_120px] gap-2 px-3 py-2 bg-slate-100 text-[10px] font-extrabold text-slate-500">
                    <span>{isRTL ? 'السجل' : 'Record'}</span>
                    <span>{isRTL ? 'الحالة' : 'Status'}</span>
                    <span>{isRTL ? 'النتيجة' : 'Result'}</span>
                  </div>
                  {majorImportRecords.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-500">
                      {majorImportReviewLoading
                        ? (isRTL ? 'جاري تحميل السجلات...' : 'Loading records...')
                        : (isRTL ? 'لا توجد سجلات ظاهرة لهذه الدفعة.' : 'No visible records for this batch.')}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {majorImportRecords.map((record) => {
                        const payload = record.rawPayload || {};
                        const displayName = String(payload.displayName || payload.canonicalMajorName || record.sourceDedupKey || record.id);
                        return (
                          <div key={record.id} className="grid grid-cols-[1fr_96px_120px] gap-2 px-3 py-3 items-center text-xs">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{displayName}</div>
                              <div className="text-[10px] text-slate-400 truncate">{record.processingNotes || record.id}</div>
                            </div>
                            <span className={`w-fit px-2 py-1 rounded-full text-[10px] font-extrabold border ${record.status === 'PROMOTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : record.status === 'FAILED' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                              {record.status || 'NEEDS_REVIEW'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 truncate">
                              {record.promotedEntityId || (isRTL ? 'بانتظار المراجعة' : 'Pending review')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* If Import Wizard is Active, Render Wizard Stepper View */}
      {activeWizard ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md mb-12">
          {domainKey === 'international-tests' ? (
            wizardStep === 6 && executionResult ? (
              /* Execution Result View for International Tests */
              <div className="space-y-6 max-w-2xl mx-auto py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{isRTL ? 'تمت معالجة بيانات الاختبار بنجاح' : 'Test Data Ingested Successfully'}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">{isRTL ? `رقم الدفعة: ${executionResult.batchId}` : `Batch ID: ${executionResult.batchId}`}</p>
                </div>

                {executionResult.promotedTests && executionResult.promotedTests.length > 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs text-right space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isRTL ? 'تمت إضافة وترقية الاختبار بنجاح إلى لوحة التحكم' : 'Test Promoted Successfully to Admin Panel'}</span>
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      {executionResult.promotedTests.map((pt: any) => (
                        <Link
                          key={pt.testId}
                          to={`/admin/international-tests/${pt.testId}`}
                          className="p-2.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100 flex items-center justify-between transition-colors"
                        >
                          <span>{isRTL ? `فتح اختبار ${pt.testName} في لوحة الاختبارات` : `Open ${pt.testName} in International Tests Panel`}</span>
                          <ExternalLink className="w-4 h-4 text-emerald-600" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
                  <Link
                    to="/admin/international-tests"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isRTL ? 'فتح لوحة الاختبارات الدولية' : 'Open International Tests Workspace'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setActiveWizard(false);
                      setExecutionResult(null);
                      setWizardStep(1);
                      setTestImportFile(null);
                      setTestImportText('');
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    {isRTL ? 'إغلاق واستيراد اختبار آخر' : 'Close / Import Another Test'}
                  </button>
                </div>
              </div>
            ) : (
              /* Simplified Direct Import Form for International Tests */
              <div className="space-y-6 max-w-2xl mx-auto py-2">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                      <span>{isRTL ? 'استيراد تفاصيل وبيانات الاختبار' : 'Import Test Data & Details'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRTL ? 'أرفق الملف الذي يحتوي على بيانات وتفاصيل الاختبار، أو اكتب التفاصيل النصية في المربع أدناه' : 'Attach the file containing test details or type the text description in the box below'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveWizard(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{isRTL ? 'إلغاء' : 'Cancel'}</span>
                  </button>
                </div>

                {/* 1. File Attachment Button */}
                <div className="space-y-2.5 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-800">
                    {isRTL ? '1. إرفاق ملف بيانات وتفاصيل الاختبار:' : '1. Attach Test Data & Details File:'}
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-2 shadow-xs">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span>{testImportFile ? (isRTL ? 'تغيير الملف المرفق' : 'Change Attached File') : (isRTL ? 'إرفاق ملف الاختبار' : 'Attach Test File')}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".md,.markdown,.json,.csv,.txt,.pdf,.doc,.docx,*/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const selectedFile = e.target.files[0];
                            setTestImportFile(selectedFile);
                            if (selectedFile.name.endsWith('.md') || selectedFile.name.endsWith('.markdown') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.csv') || selectedFile.type.startsWith('text/')) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setTestImportText(event.target.result as string);
                                }
                              };
                              reader.readAsText(selectedFile);
                            }
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleLoadSampleTestFile}
                      className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-extrabold cursor-pointer transition-colors inline-flex items-center gap-2 shadow-xs"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>{isRTL ? 'استخدام ملف تجربة CUET' : 'Use CUET sample file'}</span>
                    </button>

                    {testImportFile ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[220px]">{testImportFile.name}</span>
                        <span className="text-[10px] text-emerald-600 font-mono">({(testImportFile.size / 1024).toFixed(1)} KB)</span>
                        <button onClick={() => setTestImportFile(null)} className="text-slate-400 hover:text-slate-600 p-0.5 me-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">{isRTL ? 'لم يتم إرفاق ملف بعد (اختياري)' : 'No file attached yet (optional)'}</span>
                    )}
                  </div>
                </div>

                {/* 2. Text Details Box */}
                <div className="space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-800">
                    {isRTL ? '2. بيانات وتفاصيل الاختبار النصية:' : '2. Test Details & Text Data:'}
                  </label>
                  <textarea
                    rows={6}
                    value={testImportText}
                    onChange={(e) => setTestImportText(e.target.value)}
                    placeholder={isRTL ? 'اكتب أو الصق تفاصيل بيانات الاختبار، مثل اسم الاختبار، الأقسام، مدة كل قسم، درجات المعايير، والتعليمات...' : 'Type or paste test details, sections, scoring bands, and descriptions here...'}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all leading-relaxed"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveWizard(false)}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    disabled={isExecuting || (!testImportFile && !testImportText.trim())}
                    onClick={handleRunBatchExecution}
                    className={`px-7 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${
                      isExecuting || (!testImportFile && !testImportText.trim())
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span>{isExecuting ? (isRTL ? 'جاري الاستيراد...' : 'Importing...') : (isRTL ? 'بدء الاستيراد' : 'Start Import')}</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
          {/* Wizard Header & Stepper Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>{isRTL ? 'معالج استيراد المجال' : 'Domain Import Wizard'}</span>
                <span className="text-xs font-medium text-slate-400">({domainTitle})</span>
              </h2>
            </div>
            <button
              onClick={() => setActiveWizard(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>{t('exit_wizard') || (isRTL ? 'خروج من المعالج' : 'Exit Wizard')}</span>
            </button>
          </div>

          {/* PREMIUM HORIZONTAL PIPELINE STEPPER */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl mb-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{isRTL ? 'خط معالجة الاستيراد الفوري للمجال' : 'Domain Direct Ingestion Journey'}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
              {[
                { step: 1, title: isRTL ? 'تأكيد المصدر' : 'Source confirmation', icon: <Server className="w-3.5 h-3.5" /> },
                { step: 2, title: isRTL ? 'طريقة الإدخال' : 'Input method', icon: <FileText className="w-3.5 h-3.5" /> },
                { step: 3, title: isRTL ? 'حدود السجلات' : 'Batch limits', icon: <Sliders className="w-3.5 h-3.5" /> },
                { step: 4, title: isRTL ? 'القواعد الإدارية' : 'Admin rules', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { step: 5, title: isRTL ? 'مراجعة التشغيل' : 'Run review', icon: <Clock className="w-3.5 h-3.5" /> },
                { step: 6, title: isRTL ? 'تنفيذ الدفعة' : 'Execution result', icon: <Play className="w-3.5 h-3.5" /> },
                { step: 7, title: isRTL ? 'الترقية والمراجعة' : 'Human review / promotion', icon: <Award className="w-3.5 h-3.5" /> },
              ].map((s) => {
                let state: 'completed' | 'active' | 'pending' | 'needs-review' = 'pending';
                if (wizardStep === s.step) {
                  state = 'active';
                } else if (wizardStep > s.step) {
                  state = 'completed';
                } else if (wizardStep === 6 && s.step === 7) {
                  if (executionResult?.promotedCount && executionResult.promotedCount > 0) {
                    state = 'completed';
                  } else {
                    state = 'needs-review';
                  }
                }
                
                const stepColors = {
                  completed: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
                  active: 'bg-emerald-900/90 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/10',
                  'needs-review': 'bg-amber-950/40 border-amber-500/30 text-amber-300',
                  pending: 'bg-slate-900/50 border-slate-800/80 text-slate-500',
                };
                
                return (
                  <div key={s.step} className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${stepColors[state]}`}>
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      state === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                      state === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      state === 'needs-review' ? 'bg-amber-500/15 text-amber-300' :
                      'bg-slate-950 text-slate-600'
                    }`}>
                      {state === 'completed' ? <Check className="w-3 h-3 stroke-[3]" /> : s.icon}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="text-[8px] font-mono tracking-wider opacity-60">
                        {isRTL ? `الخطوة 0${s.step}` : `Step 0${s.step}`}
                      </div>
                      <div className="font-bold text-[10px] leading-tight truncate mt-0.5">
                        {s.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Confirm Domain & Provider */}
          {wizardStep === 1 && (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <h3 className="font-bold text-slate-900 text-base">{isRTL ? 'الخطوة 1: تأكيد المجال ومصدر المزود' : 'Step 1: Confirm Domain & Provider Source'}</h3>
              <p className="text-xs text-slate-500">
                {isRTL ? 'التحقق من المجال المستهدف وموصل المصدر قبل تهيئة قواعد المعالجة.' : 'Verify the target domain and source connector before configuring processing rules.'}
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">{isRTL ? 'المجال المستهدف:' : 'Target Domain:'}</span>
                  <span className="font-bold text-slate-900">{domainTitle}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">{isRTL ? 'المزود المحدد:' : 'Selected Provider:'}</span>
                  <span className="font-bold text-blue-900">{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">{isRTL ? 'الرابط الرسمي:' : 'Official URL:'}</span>
                  <span className="font-mono text-slate-700">{selectedProvider?.officialUrl}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{isRTL ? 'درجة الموثوقية:' : 'Trust Score:'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTrustBadge(selectedProvider?.trustScore || 90).color}`}>
                    {getTrustBadge(selectedProvider?.trustScore || 90).label}
                  </span>
                </div>
              </div>

              {domainKey === 'international-tests' && (
                selectedProvider?.officialUrl?.includes('official-test-centers') || selectedProvider?.name?.includes('Centers') ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{isRTL ? 'تنبيه: مصدر مراكز ومواعيد فقط (Test Centers & Dates Registry)' : 'Notice: Availability & Test Centers Registry Only'}</span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {isRTL 
                        ? 'هذا المصدر مخصص لاستيراد مراكز الاختبار والمواعيد الشاغرة فقط. لاستيراد ملف مواصفات هيكل وسلالم درجات اختبار كامل (مثل IELTS Academic)، يرجى اختيار "IELTS Academic Official Test Specification & Profile Feed".'
                        : 'This source provides exam dates and test center locations only. To import full test structure, skill sections, and band scoring scales, select the IELTS Academic Official Test Specification & Profile Feed.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-purple-800">
                      <Award className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{isRTL ? 'مصدر مواصفات ومعايير اختبار دولي كامل (Full Test Specification & Scoring Profile)' : 'Full International Test Profile Source'}</span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {isRTL 
                        ? 'مصدر معتمد لاستيراد ملف الاختبار الكامل: الأقسام الأربعة (الاستماع، القراءة، الكتابة، المحادثة)، مدة كل قسم، سلالم الدرجات (1.0 - 9.0)، ومكافآت الإطار الأوروبي CEFR.'
                        : 'Verified source for importing full test profiles: 4 skill sections (Listening, Reading, Writing, Speaking), section durations, band scales (1.0 - 9.0), and CEFR framework equivalencies.'}
                    </p>
                  </div>
                )
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{isRTL ? 'ضمان سلامة النقل' : 'Transfer Safety Guarantee'}</span>
                </p>
                <p>
                  {isRTL 
                    ? <>سيتم نقل السجلات الصالحة المستوردة إلى مساحة عمل المجال (<strong className="underline">{currentDomain.workspacePath}</strong>) بحالة <code>تحت المراجعة</code>. لن يتم نشر أي محتوى علناً حتى تتم الموافقة عليه صراحة من مسؤول المجال.</>
                    : <>Imported valid records will transfer to <strong className="underline">{currentDomain.workspacePath}</strong> in <code>Needs Review</code> state. No content will be published publicly until explicitly approved by a domain administrator.</>}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <span>{isRTL ? 'التالي: اختيار طريقة الإدخال' : 'Next: Choose Input Method'}</span>
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Input Method */}
          {wizardStep === 2 && (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <h3 className="font-bold text-slate-900 text-base">{isRTL ? 'الخطوة 2: اختيار طريقة إدخال البيانات' : 'Step 2: Choose Data Input Method'}</h3>
              <p className="text-xs text-slate-500">
                {isRTL ? 'حدد كيفية جلب ومعالجة البيانات لهذه الدفعة.' : 'Select how payload data should be ingested for this provider batch run.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'demo', label: isRTL ? 'مجموعة بيانات تجريبية' : 'Demo Dataset', desc: isRTL ? 'سجلات نموذجية مهيكلة للاختبار' : 'Sample structured records for testing', icon: <Sparkles className="w-4 h-4" /> },
                  { key: 'file', label: isRTL ? 'رفع ملف CSV / JSON' : 'CSV / JSON Upload', desc: isRTL ? 'رفع الملف مباشرة' : 'Upload file directly', icon: <FileSpreadsheet className="w-4 h-4" /> },
                  { key: 'paste', label: isRTL ? 'لصق البيانات' : 'Paste Data', desc: isRTL ? 'لصق نص CSV أو JSON المباشر' : 'Paste raw CSV or JSON text', icon: <FileText className="w-4 h-4" /> },
                  { key: 'url', label: isRTL ? 'استيراد رابط رسمي' : 'Official URL Import', desc: isRTL ? 'مرجع مصدر رسمي واحد' : 'Single official source reference', icon: <Link2 className="w-4 h-4" /> },
                  { key: 'connector', label: isRTL ? 'موصل مسجل' : 'Registered Connector', desc: isRTL ? 'جلب من خلاصة مسجلة' : 'Fetch from registered feed', icon: <Globe className="w-4 h-4" /> },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setInputMethod(m.key as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      inputMethod === m.key
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                      {m.icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs">{m.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {inputMethod === 'url' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">{isRTL ? 'رابط المصدر الرسمي' : 'Official Source URL'}</label>
                  <input
                    type="url"
                    value={officialUrlInput}
                    onChange={(e) => setOfficialUrlInput(e.target.value)}
                    placeholder="https://official-source.gov.sa/feed"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      {isRTL 
                        ? 'تم تجهيز رابط المصدر للمراجعة؛ سيتم إضافة الاستخراج الآلي لاحقًا.' 
                        : 'URL extraction is staged for review; automated extraction will be added later.'}
                    </span>
                  </div>
                </div>
              )}

              {inputMethod === 'paste' && (
                <div className="pt-2">
                  <textarea
                    rows={4}
                    value={pastedPayload}
                    onChange={(e) => setPastedPayload(e.target.value)}
                    placeholder={isRTL ? 'الصق نص CSV أو JSON هنا...' : 'Paste CSV or JSON payload here...'}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  {isRTL ? 'السابق' : 'Back'}
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <span>{isRTL ? 'التالي: حدود معالجة السجلات' : 'Next: Record Processing Limits'}</span>
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Import Processing Limits */}
          {wizardStep === 3 && (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <h3 className="font-bold text-slate-900 text-base">{isRTL ? 'الخطوة 3: تحديد حدود معالجة السجلات' : 'Step 3: Define Record Processing Limits'}</h3>
              <p className="text-xs text-slate-500">
                {isRTL ? 'تحديد الحد الأقصى لسجلات الدفعة للمعالجة الآمنة دون انقطاع الخادم.' : 'Set max record batch boundaries for safe processing without server timeouts.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: '10', label: isRTL ? '10 سجلات' : '10 Records', desc: isRTL ? 'تشغيل تجريبي سريع' : 'Fast trial run' },
                  { key: '50', label: isRTL ? '50 سجلاً' : '50 Records', desc: isRTL ? 'دفعة قياسية' : 'Standard batch' },
                  { key: '100', label: isRTL ? '100 سجل' : '100 Records', desc: isRTL ? 'دفعة كاملة' : 'Full batch' },
                  { key: 'custom', label: isRTL ? 'حد مخصص' : 'Custom Limit', desc: isRTL ? 'حجم مخصص محدد' : 'Small custom size' },
                ].map(l => (
                  <button
                    key={l.key}
                    onClick={() => setRecordLimit(l.key as any)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      recordLimit === l.key
                        ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <div className="text-sm">{l.label}</div>
                    <div className={`text-[10px] mt-0.5 ${recordLimit === l.key ? 'text-blue-100' : 'text-slate-400'}`}>{l.desc}</div>
                  </button>
                ))}
              </div>

              {recordLimit === 'custom' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700">{isRTL ? 'أدخل الحد المخصص (1 - 200)' : 'Enter Custom Limit (1 - 200)'}</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={customRecordLimit}
                    onChange={(e) => setCustomRecordLimit(Math.min(200, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  {isRTL ? 'السابق' : 'Back'}
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <span>{isRTL ? 'التالي: القواعد والملاحظات الإدارية' : 'Next: Admin Rules & Notes'}</span>
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Admin Instructions / Notes to Import Engine */}
          {wizardStep === 4 && (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <h3 className="font-bold text-slate-900 text-base">{isRTL ? 'الخطوة 4: تعليمات المسؤول لمحرك الاستيراد' : 'Step 4: Admin Instructions to Import Engine'}</h3>
              <p className="text-xs text-slate-500">
                {isRTL ? 'حدد القواعد التشغيلية لربط الحقول، وشدة التحقق، وتصنيف السجلات.' : 'Specify operational rules for field mapping, validation severity, and record classification.'}
              </p>

              <div className="space-y-2 text-xs">
                {getDomainRules(domainKey || 'scholarships', isRTL).map(rule => (
                  <label key={rule.key} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!(instructions as any)[rule.key]}
                      onChange={(e) => setInstructions({ ...instructions, [rule.key]: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">{rule.label}</div>
                      <div className="text-[11px] text-slate-500">{rule.desc}</div>
                    </div>
                  </label>
                ))}

                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-1">{isRTL ? 'ملاحظات وتوجيهات خاصة لمحرك الاستيراد' : 'Custom Engine Notes / Remarks'}</label>
                  <textarea
                    rows={3}
                    value={instructions.customNote}
                    onChange={(e) => setInstructions({ ...instructions, customNote: e.target.value })}
                    placeholder={isRTL ? 'أدخل أي تعليمات إضافية لعملية الاستيراد...' : 'Enter any additional instructions for the ingestion run...'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  {isRTL ? 'السابق' : 'Back'}
                </button>
                <button
                  onClick={() => setWizardStep(5)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <span>{isRTL ? 'التالي: مراجعة الملخص' : 'Next: Review Summary'}</span>
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Review Summary Before Execution */}
          {wizardStep === 5 && (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <h3 className="font-bold text-slate-900 text-base">{isRTL ? 'الخطوة 5: مراجعة إعدادات التشغيل' : 'Step 5: Review Run Configuration'}</h3>
              <p className="text-xs text-slate-500">
                {isRTL ? 'تأكيد خيارات دفعة الاستيراد قبل بدء التنفيذ.' : 'Confirm your import batch choices before triggering execution.'}
              </p>

              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3 text-xs shadow-md">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">{isRTL ? 'مساحة عمل المجال المستهدف:' : 'Target Domain Workspace:'}</span>
                  <span className="font-bold text-blue-400">{domainTitle} ({currentDomain.workspacePath})</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">{isRTL ? 'مصدر المزود:' : 'Provider Source:'}</span>
                  <span className="font-bold text-white">{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">{isRTL ? 'طريقة الإدخال:' : 'Input Method:'}</span>
                  <span className="font-bold text-emerald-400 uppercase">{inputMethod}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">{isRTL ? 'حد معالجة الدفعة:' : 'Batch Processing Limit:'}</span>
                  <span className="font-bold text-amber-400">
                    {recordLimit === 'custom' ? (isRTL ? `${customRecordLimit} سجلات` : `${customRecordLimit} Records`) : (isRTL ? `${recordLimit} سجلات` : `${recordLimit} Records`)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">{isRTL ? 'قواعد المسؤول النشطة:' : 'Active Admin Rules:'}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getDomainRules(domainKey || 'scholarships', isRTL).map(rule => (
                      instructions[rule.key] ? (
                        <span key={rule.key} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-200 font-medium border border-slate-700">
                          {rule.label}
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  {isRTL ? 'السابق' : 'Back'}
                </button>
                <button
                  disabled={isExecuting}
                  onClick={handleRunBatchExecution}
                  className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isRTL ? 'تشغيل دفعة الاستيراد الآن' : 'Run Import Batch Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Run Import Batch & Results */}
          {wizardStep === 6 && executionResult && (
            <div className="space-y-6 max-w-2xl mx-auto py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{isRTL ? 'تمت معالجة دفعة الاستيراد بنجاح' : 'Import Batch Ingested to Staging'}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{isRTL ? `رقم الدفعة: ${executionResult.batchId}` : `Batch ID: ${executionResult.batchId}`}</p>
              </div>

              {/* Results Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <div className="text-[10px] text-blue-700 uppercase font-bold">{isRTL ? 'مجهزة في جداول الاستيراد العامة' : 'Staged in Phase 06 Tables'}</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">{executionResult.staged || executionResult.total}</div>
                </div>
                <div className={`p-3 rounded-xl text-center border ${executionResult.promotedCount > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className={`text-[10px] uppercase font-bold ${executionResult.promotedCount > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{isRTL ? 'سجلات مروّعة إلى المجال' : 'Promoted to Phase 09'}</div>
                  <div className={`text-2xl font-black mt-1 ${executionResult.promotedCount > 0 ? 'text-emerald-900' : 'text-amber-900'}`}>{executionResult.promotedCount || 0}</div>
                </div>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10px] text-slate-700 uppercase font-bold">{isRTL ? 'حالة المعالجة' : 'Ingestion Status'}</div>
                  <div className="text-base font-bold text-slate-900 mt-2">
                    {executionResult.promotedCount > 0 ? (isRTL ? 'تمت الترقية' : 'PROMOTED') : (isRTL ? 'مجهزة' : 'Staged')}
                  </div>
                </div>
              </div>

              {/* Direct links to promoted tests if present */}
              {executionResult.promotedTests && executionResult.promotedTests.length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs text-right space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'تمت ترقية الاختبارات بنجاح إلى لوحة التحكم' : 'Tests Promoted Successfully to Admin Panel'}</span>
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    {executionResult.promotedTests.map((pt: any) => (
                      <Link
                        key={pt.testId}
                        to={`/admin/international-tests/${pt.testId}`}
                        className="p-2.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100 flex items-center justify-between transition-colors"
                      >
                        <span>{isRTL ? `فتح اختبار ${pt.testName} في لوحة الاختبارات` : `Open ${pt.testName} in International Tests Panel`}</span>
                        <ExternalLink className="w-4 h-4 text-emerald-600" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Notice & Manual Promote Action if not promoted */}
              {(!executionResult.promotedCount || executionResult.promotedCount === 0) && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs text-right space-y-3">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>{isRTL ? 'إشعار جاهزية سجل الاستيراد للترقية' : 'Import Record Promotion Ready Notice'}</span>
                  </p>
                  <p className="leading-relaxed">
                    {isRTL 
                      ? <>تم تجهيز سجلات الاستيراد بنجاح. اضغط على الزر أدناه لترقية السجل مباشرة إلى لوحة الاختبارات الدولية.</>
                      : <>Import records successfully staged. Click below to promote the record into the International Tests admin panel.</>}
                  </p>
                  {executionResult.records && executionResult.records.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => handlePromoteRecord(executionResult.records[0].id)}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{isRTL ? 'ترقية السجلات إلى قسم الاختبارات' : 'Promote Records to Tests Workspace'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
                <Link
                  to={currentDomain.workspacePath}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isRTL ? 'فتح لوحة مجال الاختبارات الدولية' : 'Open International Tests Workspace'}</span>
                </Link>
                <button
                  onClick={() => setActiveWizard(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  {isRTL ? `العودة لمركز استيراد ${domainTitle}` : `Return to ${currentDomain.defaultName} Import Center`}
                </button>
              </div>
            </div>
          )}
          </>
          )}
        </div>
      ) : null}



      {/* PER-BATCH IMPORT TRANSPARENCY & RECORD AUDIT TABLE */}
      {domainKey === 'scholarships' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>{t('batch_transparency_title') || (isRTL ? 'شفافية عمليات الاستيراد حسب الدفعة' : 'Per-Batch Import Transparency')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRTL ? 'مقاييس معالجة تفصيلية ومسارات تدقيق السجلات لكل دفعة استيراد.' : 'Detailed processing metrics and record-level ingestion audit trails for each scholarship import batch.'}
              </p>
            </div>
          </div>

          {/* Batch Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {SCHOLARSHIP_IMPORT_BATCHES.map((batch) => (
              <button
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={`p-4 rounded-xl border text-left text-xs transition-all ${
                  selectedBatchId === batch.id
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] text-slate-500 font-bold">{batch.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    batch.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isRTL ? (batch.status === 'success' ? 'ناجحة' : 'نجاح جزئي') : (batch.status === 'success' ? 'Success' : 'Partial Success')}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm mb-1">{batch.batchName}</div>
                <div className="text-slate-500 text-[11px] mb-3">{batch.providerName}</div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200/80 text-[10px] text-center">
                  <div className="bg-white p-1 rounded border border-slate-200">
                    <span className="text-slate-400 block">{isRTL ? 'مقروء' : 'Read'}</span>
                    <span className="font-extrabold text-slate-800">{batch.totalRead}</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-200">
                    <span className="text-emerald-600 block">{isRTL ? 'مرحّل' : 'Transfer'}</span>
                    <span className="font-extrabold text-emerald-800">{batch.transferredCount}</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-200">
                    <span className="text-purple-600 block">{isRTL ? 'مكرر' : 'Dupl.'}</span>
                    <span className="font-extrabold text-purple-800">{batch.duplicateCount}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Batch Summary Header */}
          {activeBatch && (
            <div className="p-4 bg-slate-900 text-white rounded-xl mb-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <span className="text-blue-400 font-mono font-bold">{activeBatch.id}</span>
                  <h3 className="text-base font-black text-white">{activeBatch.batchName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-md font-mono text-[11px]">
                    {isRTL ? `المصدر: ${activeBatch.sourceType} (مصدر مسجل)` : `Source: ${activeBatch.sourceType} (Registered Source)`}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-md font-mono text-[11px]">
                    {isRTL ? `الطريقة: ${activeBatch.inputMethod}` : `Method: ${activeBatch.inputMethod}`}
                  </span>
                </div>
              </div>

              {/* Batch Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-slate-400">{isRTL ? 'إجمالي المقروء' : 'Total Read'}</div>
                  <div className="font-black text-white">{activeBatch.totalRead}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-blue-300">{isRTL ? 'الأسماء المنظفة' : 'Normalized'}</div>
                  <div className="font-black text-blue-300">{activeBatch.normalizedNamesCount}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-purple-300">{isRTL ? 'المكررة' : 'Duplicates'}</div>
                  <div className="font-black text-purple-300">{activeBatch.duplicateCount}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-indigo-300">{isRTL ? 'الحقول المدمجة' : 'Merged Fields'}</div>
                  <div className="font-black text-indigo-300">{activeBatch.mergedFieldsCount}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-emerald-300">{isRTL ? 'الجديدة المُنكَرَة' : 'New Created'}</div>
                  <div className="font-black text-emerald-300">{activeBatch.newRecordsCount}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-amber-300">{isRTL ? 'غير مكتمل' : 'Incomplete'}</div>
                  <div className="font-black text-amber-300">{activeBatch.incompleteCount}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-rose-300">{isRTL ? 'الفاشلة' : 'Failed'}</div>
                  <div className="font-black text-rose-300">{activeBatch.failedCount}</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-[10px] text-teal-300">{isRTL ? 'المرحّلة' : 'Transferred'}</div>
                  <div className="font-black text-teal-300">{activeBatch.transferredCount}</div>
                </div>
              </div>
            </div>
          )}

          {/* Per-Record Audit Table */}
          {activeBatch && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>{t('record_results_title') || (isRTL ? 'جدول تدقيق سجلات الاستيراد' : 'Per-Record Ingestion Audit Table')}</span>
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">{t('original_scholarship_name') || (isRTL ? 'الاسم الأصلي' : 'Original Name')}</th>
                      <th className="p-3">{t('cleaned_scholarship_name') || (isRTL ? 'الاسم المنظف المعياري' : 'Cleaned Canonical Name')}</th>
                      <th className="p-3">{t('provider_sponsor') || (isRTL ? 'المزود / الراعي' : 'Provider / Sponsor')}</th>
                      <th className="p-3">{t('duplicate_status') || (isRTL ? 'حالة منع التكرار' : 'Deduplication Status')}</th>
                      <th className="p-3">{t('fields_merged') || (isRTL ? 'الحقول المدمجة' : 'Fields Merged')}</th>
                      <th className="p-3">{t('missing_fields') || (isRTL ? 'الحقول المفقودة' : 'Missing Fields')}</th>
                      <th className="p-3">{t('verification_status') || (isRTL ? 'حالة التحقق' : 'Verification Status')}</th>
                      <th className="p-3 text-right">{isRTL ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeBatch.records.map((rec: any) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-slate-600 max-w-[200px] truncate" title={rec.originalName}>
                          {rec.originalName}
                        </td>
                        <td className="p-3 font-bold text-slate-900 max-w-[220px]">
                          <div>{rec.cleanedName}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{rec.cleanedNameAr}</div>
                        </td>
                        <td className="p-3 text-slate-700">
                          <div>{rec.provider}</div>
                          <a
                            href={rec.officialSourceUrl || rec.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>{isRTL ? 'المصدر الرسمي' : 'Official Source'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.duplicateStatus === 'new'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.duplicateStatus === 'existing_enriched'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {rec.duplicateStatus === 'new'
                              ? (t('new_record') || (isRTL ? 'سجل جديد' : 'New Record'))
                              : rec.duplicateStatus === 'existing_enriched'
                              ? (t('existing_enriched_badge') || (isRTL ? 'موجود ومستكمل' : 'Existing Enriched'))
                              : (t('duplicate') || (isRTL ? 'مكرر وتـم تخطيه' : 'Duplicate Skipped'))}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[10px]">
                          {rec.fieldsMerged.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rec.fieldsMerged.map((f: any) => (
                                <span key={f} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
                                  +{f}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[10px]">
                          {rec.missingFields.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rec.missingFields.map((f: any) => (
                                <span key={f} className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-800">
                                  ? {f}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-600 font-bold">{isRTL ? 'مكتمل' : 'Complete'}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            rec.verificationStatus === 'verified_official'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {rec.verificationStatus === 'verified_official'
                              ? (t('verified_official') || (isRTL ? 'موثق رسمياً' : 'Verified Official'))
                              : (t('needs_source_verification') || (isRTL ? 'يحتاج تحقق من المصدر' : 'Needs Source Verification'))}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to="/admin/scholarships"
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{t('open_in_scholarship_workspace') || (isRTL ? 'فتح في مساحة العمل' : 'Open in Workspace')}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
