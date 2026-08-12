import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  ExternalLink,
  FileClock,
  FileText,
  GitCompareArrows,
  Globe2,
  Loader2,
  PauseCircle,
  Save,
  Search,
  Send,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import { ApiClient } from '../../api/client';

type AdminTestRecord = {
  id?: string;
  displayName?: string;
  canonicalName?: string;
  localizedNameAr?: string;
  localizedNameEn?: string;
  nameAr?: string;
  nameEn?: string;
  abbreviation?: string;
  providerName?: string;
  provider?: string;
  testCategory?: string;
  category?: string;
  status?: string;
  completenessStatus?: string;
  isSourceVerified?: boolean;
  sourceImportRecordId?: string;
  updatedAt?: string;
  createdAt?: string;
  officialSourceUrl?: string;
  officialRegistrationUrl?: string;
  scoreRange?: string;
  validity?: string;
  fee?: string;
  description?: string;
  sections?: TestSection[];
  markdownContent?: string;
  optionalFields?: Record<string, unknown>;
};

type ImportedCard = {
  id?: string;
  testId?: string;
  title?: string;
  titleAr?: string;
  testCode?: string;
  abbreviation?: string;
  providerName?: string;
  category?: string;
  status?: string;
  scoreRange?: string;
  validity?: string;
  fee?: string;
  notes?: string;
  officialSourceUrl?: string;
  officialRegistrationUrl?: string;
  sections?: TestSection[];
  markdownContent?: string;
};

type TestSection = {
  name?: string;
  sectionName?: string;
  title?: string;
  duration?: string;
  durationMinutes?: number;
  count?: string;
  questionTypes?: string[];
  score?: string;
  scoreMinimum?: number;
  scoreMaximum?: number;
};

type ResolvedTest = {
  id: string;
  displayName: string;
  nameAr?: string;
  nameEn?: string;
  abbreviation?: string;
  category?: string;
  providerName?: string;
  status: string;
  scoreRange?: string;
  validity?: string;
  fee?: string;
  description?: string;
  officialSourceUrl?: string;
  officialRegistrationUrl?: string;
  sections: TestSection[];
  markdownContent: string;
  sourceImportRecordId?: string;
  updatedAt?: string;
  isSourceVerified?: boolean;
};

type MarkdownSection = {
  id: string;
  title: string;
  level: number;
  content: string;
};

type ImportVersion = {
  id: string;
  versionNumber: number;
  status: string;
  sourceFileName?: string;
  sourceHash?: string;
  importedAt?: string;
  publishedAt?: string;
  changeSummary?: Record<string, unknown>;
  contentBlocks?: unknown[];
};

const quickTabs = [
  { key: 'overview', label: 'الملخص' },
  { key: 'sections', label: 'الأقسام' },
  { key: 'content', label: 'المحتوى' },
  { key: 'import', label: 'الاستيراد' },
  { key: 'audit', label: 'التدقيق' }
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asSectionArray(value: unknown): TestSection[] {
  return Array.isArray(value) ? value.filter((item): item is TestSection => !!item && typeof item === 'object') : [];
}

function asImportVersion(value: unknown): ImportVersion | null {
  const record = asRecord(value);
  const id = asString(record.id);
  const versionNumber = typeof record.versionNumber === 'number' ? record.versionNumber : undefined;
  const status = asString(record.status);
  if (!id || versionNumber === undefined || !status) return null;
  return {
    id,
    versionNumber,
    status,
    sourceFileName: asString(record.sourceFileName),
    sourceHash: asString(record.sourceHash),
    importedAt: asString(record.importedAt),
    publishedAt: asString(record.publishedAt),
    changeSummary: asRecord(record.changeSummary),
    contentBlocks: Array.isArray(record.contentBlocks) ? record.contentBlocks : []
  };
}

function getImportedCards(): ImportedCard[] {
  try {
    const raw = localStorage.getItem('manaratak_test_import_cards');
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is ImportedCard => !!item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

async function findMarkdownContentAsync(
  testId: string,
  record?: AdminTestRecord,
  card?: ImportedCard,
  versions?: any[]
): Promise<string> {
  if (versions && versions.length > 0) {
    const versionWithBlocks = versions.find(v => v.contentBlocks && v.contentBlocks.length > 0) || versions[0];
    if (versionWithBlocks && versionWithBlocks.contentBlocks && versionWithBlocks.contentBlocks.length > 0) {
      const sortedBlocks = [...versionWithBlocks.contentBlocks].sort((a: any, b: any) => {
        const keyA = String(a.blockKey || '');
        const keyB = String(b.blockKey || '');
        return keyA.localeCompare(keyB);
      });
      const concatenatedMarkdown = sortedBlocks.map((b: any) => b.content).filter(Boolean).join('\n\n');
      if (concatenatedMarkdown.trim().length > 0) {
        return concatenatedMarkdown;
      }
    }
  }

  const optional = asRecord(record?.optionalFields);
  const explicit = card?.markdownContent || record?.markdownContent || asString(optional.markdownContent);
  return explicit || '';
}

function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split(/\r?\n/);
  const headings = lines
    .map((line, index) => {
      const match = /^##\s+(.+)$/.exec(line.trim());
      return match ? { index, level: 2, title: match[1].replace(/[*_`]/g, '').trim() } : null;
    })
    .filter((item): item is { index: number; level: number; title: string } => !!item);

  if (headings.length === 0) {
    return [{ id: 'full', title: 'المحتوى الكامل', level: 1, content: markdown }];
  }

  const sections: MarkdownSection[] = [];
  
  // Capture introductory text before the first heading
  const firstHeading = headings[0];
  if (firstHeading.index > 0) {
    const introContent = lines.slice(0, firstHeading.index).join('\n').trim();
    if (introContent) {
      sections.push({
        id: 'intro',
        title: 'مقدمة ومعلومات الإصدار',
        level: 2,
        content: introContent
      });
    }
  }

  // Map headings to sections
  headings.forEach((heading, index) => {
    const next = headings[index + 1];
    const content = lines.slice(heading.index, next ? next.index : lines.length).join('\n').trim();
    sections.push({
      id: `${index}-${heading.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section'}`,
      title: heading.title,
      level: heading.level,
      content
    });
  });

  return sections;
}

function inferDisplayName(testId: string, record?: AdminTestRecord, card?: ImportedCard): string {
  return card?.title || card?.titleAr || record?.displayName || record?.localizedNameAr || record?.localizedNameEn || record?.canonicalName || testId;
}

function inferCategory(test: ResolvedTest): string {
  const text = `${test.id} ${test.displayName} ${test.category ?? ''}`.toLowerCase();
  if (/(cpa|plab|usmle|pmp|licens|professional)/.test(text)) return 'ترخيص مهني';
  if (/(dat|mcat|gamsat|ucat|imat|bmat|medical|dental)/.test(text)) return 'قبول تخصصي';
  if (/(sat|act|gre|gmat|ap|csat|csca|cuet|eju|a-level|abitur|clt|admission)/.test(text)) return 'قبول جامعي';
  return 'اختبار لغة';
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    IMPORTED: 'مستورد',
    READY_TO_REVIEW: 'بانتظار المراجعة',
    READY_TO_PUBLISH: 'جاهز للنشر',
    PUBLISHED: 'منشور',
    ARCHIVED: 'مؤرشف',
    DRAFT: 'مسودة'
  };
  return labels[status] ?? status;
}

function markdownSummary(markdown: string): string {
  const firstParagraph = markdown
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^#+\s*/gm, '').replace(/[*_`>|-]/g, '').trim())
    .find((part) => part.length > 80);
  return firstParagraph?.slice(0, 240) ?? 'ملف تفاصيل الاختبار محفوظ ومتاح للمراجعة والتحرير.';
}

function resolveSections(record?: AdminTestRecord, card?: ImportedCard): TestSection[] {
  const optional = asRecord(record?.optionalFields);
  return [
    ...asSectionArray(card?.sections),
    ...asSectionArray(record?.sections),
    ...asSectionArray(optional.sections)
  ];
}

function DetailActionButton({ icon: Icon, label, tone = 'default' }: { icon: React.ElementType; label: string; tone?: 'default' | 'primary' | 'danger' }) {
  const toneClass = tone === 'primary'
    ? 'bg-[#0F4B3A] text-white border-[#0F4B3A]'
    : tone === 'danger'
      ? 'bg-rose-50 text-rose-800 border-rose-200'
      : 'bg-white text-slate-700 border-slate-200';

  return (
    <button className={`h-10 px-3 rounded-xl border text-[12px] font-black inline-flex items-center justify-center gap-2 shadow-sm ${toneClass}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

export function AdminInternationalTestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<ResolvedTest | null>(null);
  const [importVersions, setImportVersions] = useState<ImportVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSectionId, setActiveSectionId] = useState<string>('0');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        let record: AdminTestRecord | undefined;
        try {
          record = await ApiClient.getAdminInternationalTestById(id) as AdminTestRecord;
        } catch {
          record = undefined;
        }

        if (!record) {
          setError('تعذر تحميل تفاصيل الاختبار من الخادم (غير موجود أو الخطأ في الاتصال بالشبكة).');
          setLoading(false);
          return;
        }

        let resolvedVersions: ImportVersion[] = [];
        try {
          const versions = await ApiClient.getAdminInternationalTestVersions(id);
          resolvedVersions = versions.map(asImportVersion).filter((version): version is ImportVersion => !!version);
          setImportVersions(resolvedVersions);
        } catch {
          setImportVersions([]);
        }

        const importedCard = getImportedCards().find((card) => card.testId === id || card.id === id);
        const optional = asRecord(record?.optionalFields);
        const markdownContent = await findMarkdownContentAsync(id, record, importedCard, resolvedVersions);
        const resolved: ResolvedTest = {
          id,
          displayName: inferDisplayName(id, record, importedCard),
          nameAr: importedCard?.titleAr || record?.localizedNameAr || record?.nameAr || asString(optional.localizedNameAr),
          nameEn: importedCard?.title || record?.localizedNameEn || record?.nameEn || asString(optional.localizedNameEn),
          abbreviation: importedCard?.testCode || importedCard?.abbreviation || record?.abbreviation || asString(optional.abbreviation),
          category: importedCard?.category || record?.testCategory || record?.category || asString(optional.category),
          providerName: importedCard?.providerName || record?.providerName || record?.provider || 'غير محدد',
          status: importedCard?.status || record?.status || 'PUBLISHED',
          scoreRange: importedCard?.scoreRange || record?.scoreRange || asString(optional.scoreRange),
          validity: importedCard?.validity || record?.validity || asString(optional.validity),
          fee: importedCard?.fee || record?.fee || asString(optional.fee),
          description: importedCard?.notes || record?.description || asString(optional.description) || markdownSummary(markdownContent),
          officialSourceUrl: importedCard?.officialSourceUrl || record?.officialSourceUrl || asString(optional.officialSourceUrl),
          officialRegistrationUrl: importedCard?.officialRegistrationUrl || record?.officialRegistrationUrl || asString(optional.officialRegistrationUrl),
          sections: resolveSections(record, importedCard),
          markdownContent,
          sourceImportRecordId: record?.sourceImportRecordId,
          updatedAt: record?.updatedAt,
          isSourceVerified: record?.isSourceVerified
        };
        setTest(resolved);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'تعذر تحميل تفاصيل الاختبار.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const markdownSections = useMemo(() => parseMarkdownSections(test?.markdownContent ?? ''), [test?.markdownContent]);
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return markdownSections;
    return markdownSections.filter((section) => `${section.title} ${section.content}`.toLowerCase().includes(query));
  }, [markdownSections, searchQuery]);
  const activeSection = filteredSections.find((section) => section.id === activeSectionId) ?? filteredSections[0] ?? markdownSections[0];

  useEffect(() => {
    if (filteredSections[0] && !filteredSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [activeSectionId, filteredSections]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F4B3A] mx-auto" />
          <p className="text-sm font-bold text-slate-600">جاري تحميل تفاصيل الاختبار...</p>
        </div>
      </div>
    );
  }

  if (!test || error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="max-w-xl mx-auto bg-white border border-rose-200 rounded-2xl p-5 text-center space-y-4">
          <p className="text-sm font-bold text-rose-800">{error ?? 'لم يتم العثور على الاختبار.'}</p>
          <Link to="/admin/international-tests" className="inline-flex h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            العودة للقائمة
          </Link>
        </div>
      </div>
    );
  }

  const familyLabel = inferCategory(test);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-3 py-4 md:px-6 md:py-7 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/admin/international-tests" className="h-10 px-3 rounded-xl bg-slate-900 text-white text-[12px] font-black inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            القائمة
          </Link>
          <Link to="/admin/imports/international-tests" className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-black inline-flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#0F4B3A]" />
            الاستيراد
          </Link>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0F4B3A] border border-emerald-100 text-[12px] font-black">
                  {test.abbreviation || familyLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[12px] font-bold">
                  {familyLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[12px] font-bold">
                  {statusLabel(test.status)}
                </span>
              </div>
              <div>
                <h1 className="text-[20px] md:text-[26px] leading-tight font-black text-slate-950">{test.displayName}</h1>
                {(test.nameAr || test.nameEn) && (
                  <p className="mt-1 text-[13px] md:text-[14px] leading-7 text-slate-500 font-semibold">
                    {test.nameAr || test.nameEn}
                  </p>
                )}
              </div>
              <p className="text-[13px] md:text-[15px] leading-8 text-slate-700 max-w-3xl">{test.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:min-w-[210px]">
              <InfoPill label="الجهة" value={test.providerName || 'غير محدد'} />
              <InfoPill label="آخر تحديث" value={test.updatedAt ? new Date(test.updatedAt).toLocaleDateString('ar') : 'غير محدد'} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricCard icon={FileText} label="الأقسام المكتشفة" value={String(markdownSections.length)} />
            <MetricCard icon={ClipboardCheck} label="أقسام منظمة" value={String(test.sections.length)} />
            <MetricCard icon={Globe2} label="الصلاحية" value={test.validity || 'حسب الجهة'} />
            <MetricCard icon={ShieldCheck} label="توثيق المصدر" value={test.isSourceVerified ? 'موثق' : 'بحاجة مراجعة'} />
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <DetailActionButton icon={Edit3} label="تعديل" />
          <DetailActionButton icon={Save} label="حفظ مسودة" />
          <DetailActionButton icon={GitCompareArrows} label="مقارنة النسخ" />
          <DetailActionButton icon={ClipboardCheck} label="مراجعة" />
          <DetailActionButton icon={CheckCircle2} label="اعتماد" tone="primary" />
          <DetailActionButton icon={Send} label="نشر" tone="primary" />
          <DetailActionButton icon={PauseCircle} label="إلغاء النشر" tone="danger" />
        </div>

        <nav className="sticky top-0 z-10 bg-[#F7F8FA]/95 backdrop-blur border-y border-slate-200 py-2 -mx-3 px-3 md:mx-0 md:px-0 md:border-y-0">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`h-10 px-4 rounded-xl text-[13px] font-black whitespace-nowrap border ${
                  activeTab === tab.key ? 'bg-[#0F4B3A] text-white border-[#0F4B3A]' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoPanel title="البيانات الأساسية" rows={[
              ['الاختصار', test.abbreviation || '-'],
              ['النوع', familyLabel],
              ['الجهة المالكة', test.providerName || 'غير محدد'],
              ['الحالة', statusLabel(test.status)]
            ]} />
            <InfoPanel title="الدرجات والرسوم" rows={[
              ['سلم الدرجة', test.scoreRange || 'غير محدد'],
              ['صلاحية النتيجة', test.validity || 'حسب الجهة'],
              ['الرسوم', test.fee || 'حسب البلد والمركز']
            ]} />
            <InfoPanel title="المصادر" rows={[
              ['سجل الاستيراد', test.sourceImportRecordId || 'لا يوجد'],
              ['الملف', test.markdownContent ? 'محفوظ' : 'غير محفوظ'],
              ['الأقسام', `${markdownSections.length} قسم`]
            ]} />
          </div>
        )}

        {activeTab === 'sections' && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="text-[16px] font-black">الأقسام والمهارات</h2>
            {test.sections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {test.sections.map((section, index) => (
                  <div key={`${section.name ?? section.sectionName ?? index}`} className="border border-slate-200 rounded-2xl p-3 bg-slate-50">
                    <p className="text-[14px] font-black text-slate-900">{section.name || section.sectionName || section.title || `قسم ${index + 1}`}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-slate-600">
                      <span>المدة: {section.duration || (section.durationMinutes ? `${section.durationMinutes} دقيقة` : '-')}</span>
                      <span>الدرجة: {section.score || [section.scoreMinimum, section.scoreMaximum].filter((value) => value !== undefined).join(' - ') || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] leading-7 text-slate-600">
                لا توجد أقسام منظمة بعد. تم استخراج أقسام الملف أدناه تلقائيًا من العناوين، ويمكن تحويلها لاحقًا إلى أقسام منظمة دون حذف المحتوى الخام.
              </p>
            )}
          </section>
        )}

        {activeTab === 'content' && (
          <section className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-3">
            <aside className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm lg:sticky lg:top-20 lg:self-start">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="بحث داخل التفاصيل"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 text-[13px] font-bold outline-none focus:border-[#0F4B3A]"
                />
              </div>
              <div className="flex lg:block gap-2 overflow-x-auto lg:overflow-visible space-y-0 lg:space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full min-w-[180px] lg:min-w-0 text-right rounded-xl border px-3 py-2 text-[12px] font-bold leading-6 ${
                      activeSection?.id === section.id ? 'bg-[#0F4B3A] text-white border-[#0F4B3A]' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </aside>

            <article className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden">
              {activeSection ? (
                <MarkdownView content={activeSection.content} />
              ) : (
                <p className="text-[13px] text-slate-500">لا يوجد محتوى مطابق للبحث.</p>
              )}
            </article>
          </section>
        )}

        {activeTab === 'import' && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
            <h2 className="text-[16px] font-black">الاستيراد والنسخ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TimelineCard icon={FileClock} title="النسخة الحالية" value={importVersions[0] ? `v${importVersions[0].versionNumber} - ${statusLabel(importVersions[0].status)}` : statusLabel(test.status)} />
              <TimelineCard icon={UploadCloud} title="مصدر الملف" value={importVersions[0]?.sourceFileName || test.sourceImportRecordId || 'ملف محفوظ داخل المشروع'} />
              <TimelineCard icon={GitCompareArrows} title="المقارنة" value={asString(importVersions[0]?.changeSummary?.comparisonStatus) || 'BASELINE_VERSION'} />
            </div>
            {importVersions.length > 0 ? (
              <div className="space-y-2">
                {importVersions.map((version) => (
                  <div key={version.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-black text-slate-900">نسخة {version.versionNumber} - {statusLabel(version.status)}</p>
                        <p className="text-[12px] font-bold text-slate-500 mt-1">{version.sourceFileName || 'مصدر غير محدد'}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-slate-600">
                        {version.contentBlocks?.length ?? 0} كتلة
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
                      <span className="rounded-xl bg-white border border-slate-200 px-2 py-1 font-bold text-slate-600">
                        الاستيراد: {version.importedAt ? new Date(version.importedAt).toLocaleDateString('ar') : 'غير محدد'}
                      </span>
                      <span className="rounded-xl bg-white border border-slate-200 px-2 py-1 font-bold text-slate-600">
                        النشر: {version.publishedAt ? new Date(version.publishedAt).toLocaleDateString('ar') : 'غير منشور'}
                      </span>
                      <span className="rounded-xl bg-white border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-500 truncate" title={version.sourceHash}>
                        {version.sourceHash || 'no-hash'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] leading-7 text-slate-600">
                لا توجد نسخ محفوظة من API بعد. عند تشغيل seed الجديد سيتم إنشاء نسخة أساسية منشورة لكل اختبار وربطها بملفها وبصمتها.
              </p>
            )}
          </section>
        )}

        {activeTab === 'audit' && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
            <h2 className="text-[16px] font-black">سجل التدقيق</h2>
            <div className="space-y-2">
              {['تم فتح ملف الاختبار للمراجعة', 'المحتوى الخام محفوظ كمرجع', 'الأقسام المختلفة لا تُحذف وتحتاج مراجعة'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[13px] font-bold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0F4B3A]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(test.officialSourceUrl || test.officialRegistrationUrl) && (
          <div className="flex flex-col sm:flex-row gap-2 pb-8">
            {test.officialSourceUrl && <ExternalLinkButton href={test.officialSourceUrl} label="المصدر الرسمي" />}
            {test.officialRegistrationUrl && <ExternalLinkButton href={test.officialRegistrationUrl} label="التسجيل الرسمي" />}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="text-[13px] font-black text-slate-800 truncate">{value}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 min-h-[82px]">
      <Icon className="w-4 h-4 text-[#0F4B3A]" />
      <p className="mt-2 text-[11px] font-bold text-slate-500">{label}</p>
      <p className="text-[14px] font-black text-slate-900 truncate">{value}</p>
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <h2 className="text-[16px] font-black mb-3">{title}</h2>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 text-[13px] border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
            <span className="font-bold text-slate-500">{label}</span>
            <span className="font-black text-slate-800 text-left">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineCard({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <Icon className="w-5 h-5 text-[#0F4B3A]" />
      <p className="mt-2 text-[12px] font-bold text-slate-500">{title}</p>
      <p className="text-[14px] font-black text-slate-900">{value}</p>
    </div>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-black inline-flex items-center justify-center gap-2">
      <ExternalLink className="w-4 h-4 text-[#0F4B3A]" />
      <span>{label}</span>
    </a>
  );
}

function MarkdownView({ content }: { content: string }) {
  return (
    <div className="max-w-none text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-[19px] md:text-[22px] font-black leading-9 mt-0 mb-4 text-slate-950">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[17px] md:text-[20px] font-black leading-8 mt-6 mb-3 text-slate-950">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[15px] md:text-[17px] font-black leading-8 mt-5 mb-2 text-slate-900">{children}</h3>,
          p: ({ children }) => <p className="text-[13px] md:text-[15px] leading-8 mb-3 text-slate-700">{children}</p>,
          li: ({ children }) => <li className="text-[13px] md:text-[15px] leading-8 mb-1 text-slate-700">{children}</li>,
          ul: ({ children }) => <ul className="list-disc pr-5 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pr-5 mb-4 space-y-1">{children}</ol>,
          strong: ({ children }) => <strong className="font-black text-slate-950">{children}</strong>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="font-bold text-[#0F4B3A] underline underline-offset-4">{children}</a>,
          table: ({ children }) => <div className="overflow-x-auto rounded-xl border border-slate-200 my-4"><table className="min-w-full text-[12px]">{children}</table></div>,
          th: ({ children }) => <th className="bg-slate-100 px-3 py-2 text-right font-black text-slate-800 border-b border-slate-200">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 align-top border-b border-slate-100 text-slate-700">{children}</td>,
          code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[12px] text-slate-800">{children}</code>,
          pre: ({ children }) => <pre className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-3 text-[12px] leading-7 my-4">{children}</pre>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
