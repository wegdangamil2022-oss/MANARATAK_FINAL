import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowRight,
  BookOpen,
  Database,
  FileText,
  GitCompare,
  Globe,
  Layers3,
  Loader2,
  Pencil,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { ApiClient } from '../../api/client';
import { getMajorDegreeTemplate } from '../majors/majorDegreeTemplates';

export interface Phase10MajorSection {
  sectionKey: string;
  title: string;
  content: string;
  reviewStatus: string;
  profileId?: string;
}

interface MajorDetailState {
  id: string;
  displayName: string;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  degreeLevel?: string;
  collegeOrField?: string;
  status: string;
  completenessStatus?: string;
  sourceFileName?: string;
  sourceType?: string;
}

interface MajorProfileLike {
  id?: string;
  level?: string;
  code?: string;
  displayName?: string;
  collegeContext?: string;
  status?: string;
  completenessStatus?: string;
}

interface MajorVersionLike {
  id?: string;
  versionNumber?: number;
  status?: string;
  sourceFileName?: string;
  sourceHash?: string;
  importedAt?: string;
}

interface MajorSourceLike {
  id?: string;
  sourceType?: string;
  sourceName?: string;
  sourceHash?: string;
  importedAt?: string;
}

type DetailTab = 'basic' | 'profile' | 'content' | 'sources';

const tabs: Array<{ id: DetailTab; label: string; icon: typeof BookOpen }> = [
  { id: 'basic', label: 'البيانات الأساسية', icon: BookOpen },
  { id: 'profile', label: 'ملف الدرجة', icon: Layers3 },
  { id: 'content', label: 'المحتوى التفصيلي', icon: FileText },
  { id: 'sources', label: 'المصادر والنسخ', icon: GitCompare },
];

function normalizeMajor(value: Record<string, unknown>, id: string): MajorDetailState {
  const optionalFields = typeof value.optionalFields === 'object' && value.optionalFields ? value.optionalFields as Record<string, unknown> : {};
  const localizedNames = typeof optionalFields.localizedNames === 'object' && optionalFields.localizedNames
    ? optionalFields.localizedNames as Record<string, unknown>
    : {};
  const metadata = typeof optionalFields.metadata === 'object' && optionalFields.metadata ? optionalFields.metadata as Record<string, unknown> : {};

  return {
    id: String(value.id ?? id),
    displayName: String(value.displayName ?? value.canonicalName ?? localizedNames.ar ?? localizedNames.en ?? 'تخصص بدون اسم'),
    nameAr: typeof localizedNames.ar === 'string' ? localizedNames.ar : undefined,
    nameEn: typeof localizedNames.en === 'string' ? localizedNames.en : undefined,
    code: typeof value.classificationCode === 'string' ? value.classificationCode : undefined,
    degreeLevel: typeof value.degreeLevel === 'string' ? value.degreeLevel : undefined,
    collegeOrField: typeof value.academicFieldOrDiscipline === 'string'
      ? value.academicFieldOrDiscipline
      : typeof value.collegeOrFaculty === 'string'
        ? value.collegeOrFaculty
        : undefined,
    status: String(value.status ?? 'READY_TO_REVIEW'),
    completenessStatus: typeof value.completenessStatus === 'string' ? value.completenessStatus : undefined,
    sourceType: typeof metadata.sourceImportMode === 'string' ? metadata.sourceImportMode : undefined,
  };
}

function statusLabel(value: string | undefined): string {
  const map: Record<string, string> = {
    READY_TO_REVIEW: 'تحتاج مراجعة',
    NEEDS_REVIEW: 'تحتاج مراجعة',
    IMPORTED: 'مستوردة',
    READY_TO_PUBLISH: 'جاهزة للنشر',
    PUBLISHED: 'منشورة',
    ARCHIVED: 'مؤرشفة',
  };
  return value ? map[value] ?? value : 'غير محدد';
}

function degreeLabel(value: string | undefined): string {
  const map: Record<string, string> = {
    Bachelor: 'بكالوريوس',
    Master: 'ماجستير',
    Doctorate: 'دكتوراه',
    Fellowship: 'زمالة',
  };
  return value ? map[value] ?? value : 'غير محدد';
}

function FieldCard({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <span className="block text-[12px] font-bold text-slate-400">{label}</span>
      <span className="mt-1 block break-words text-[14px] font-extrabold leading-6 text-slate-900">{value || 'غير محدد'}</span>
    </div>
  );
}

export function AdminMajorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const adminSessionPresent = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [activeTab, setActiveTab] = useState<DetailTab>('basic');
  const [major, setMajor] = useState<MajorDetailState | null>(null);
  const [profiles, setProfiles] = useState<MajorProfileLike[]>([]);
  const [sections, setSections] = useState<Phase10MajorSection[]>([]);
  const [versions, setVersions] = useState<MajorVersionLike[]>([]);
  const [sources, setSources] = useState<MajorSourceLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminSessionPresent || !id) return;

    let cancelled = false;
    
    // Reset state when ID changes
    setLoading(true);
    setError(null);
    setMajor(null);
    setProfiles([]);
    setSections([]);
    setVersions([]);
    setSources([]);

    const majorId = id;
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const [majorResult, profileResult, sectionResult, versionResult, sourceResult] = await Promise.all([
          ApiClient.getAdminMajorById(majorId),
          ApiClient.getAdminMajorProfiles(majorId),
          ApiClient.getAdminMajorContentSections(majorId),
          ApiClient.getAdminMajorVersions(majorId),
          ApiClient.getAdminMajorSources(majorId),
        ]);
        if (cancelled) return;
        const loadedSections = Array.isArray(sectionResult.data) ? sectionResult.data as Phase10MajorSection[] : [];
        if (majorResult && (majorResult as Record<string, unknown>).id) {
          setMajor(normalizeMajor(majorResult as Record<string, unknown>, majorId));
          setProfiles(Array.isArray(profileResult.data) ? profileResult.data as MajorProfileLike[] : []);
          setSections(loadedSections);
          setVersions(Array.isArray(versionResult.data) ? versionResult.data as MajorVersionLike[] : []);
          setSources(Array.isArray(sourceResult.data) ? sourceResult.data as MajorSourceLike[] : []);
          setLoading(false);
          return;
        }

        if (!cancelled) {
          setError('تعذر تحميل تفاصيل التخصص.');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل تفاصيل التخصص.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [adminSessionPresent, id]);

  const selectedProfile = useMemo(() => {
    if (!profiles || profiles.length === 0) return null;
    return profiles.find((p) => p.id === id) || profiles[0];
  }, [profiles, id]);

  const activeLevel = selectedProfile?.level || major?.degreeLevel;
  const activeDisplayName = selectedProfile?.displayName || major?.displayName;
  const activeCode = selectedProfile?.code || major?.code;

  const filteredSections = useMemo(() => {
    if (!selectedProfile) return sections;
    const matching = sections.filter((s) => !s.profileId || s.profileId === selectedProfile.id);
    return matching.length > 0 ? matching : sections;
  }, [sections, selectedProfile]);

  const contentGroups = useMemo(() => {
    const important = filteredSections.slice(0, 6);
    const remaining = filteredSections.slice(6);
    return { important, remaining };
  }, [filteredSections]);

  const degreeTemplate = useMemo(() => getMajorDegreeTemplate(activeLevel), [activeLevel]);

  const templateCoverage = useMemo(() => {
    return degreeTemplate.sections.map((templateSection) => {
      const matched = filteredSections.find((section) => {
        const key = section.sectionKey.toLowerCase();
        const rawTitle = section.title.toLowerCase();
        const cleanTitle = rawTitle.replace(/^\d+[\).:-]?\s*/, '').trim();

        const checkMatch = (target?: string) => {
          if (!target) return false;
          const normTarget = target.trim().toLowerCase();
          const targetNoAl = normTarget.replace(/^ال/, '');
          const titleNoAl = cleanTitle.replace(/^ال/, '');

          return (
            cleanTitle.includes(normTarget) ||
            normTarget.includes(cleanTitle) ||
            (titleNoAl.length > 2 && targetNoAl.length > 2 && (titleNoAl.includes(targetNoAl) || targetNoAl.includes(titleNoAl))) ||
            key.includes(normTarget)
          );
        };

        if (checkMatch(templateSection.titleAr)) return true;
        if (checkMatch(templateSection.titleEn)) return true;
        if (checkMatch(templateSection.key)) return true;
        if (templateSection.aliasesAr?.some((alias) => checkMatch(alias))) return true;

        return false;
      });

      return { ...templateSection, matched };
    });
  }, [degreeTemplate, filteredSections]);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-slate-500" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <span className="text-[13px] font-bold">جاري تحميل تفاصيل التخصص...</span>
        </div>
      </main>
    );
  }

  const usingSample = major?.sourceType === "DETAIL_DOSSIER";

  if (!major) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f7f8fa] px-4 py-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6 text-center">
          <p className="text-[14px] font-extrabold text-rose-700">لم يتم العثور على التخصص.</p>
          <Link to="/admin/majors" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 text-[13px] font-bold text-white">العودة للقائمة</Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fa] px-4 py-5 text-slate-900 sm:px-6 lg:px-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="mx-auto max-w-7xl space-y-5">
        <Link to="/admin/majors" className="inline-flex items-center gap-2 text-[13px] font-extrabold text-slate-600 hover:text-emerald-800">
          <ArrowRight className="h-4 w-4" />
          العودة إلى التخصصات
        </Link>

        <header className="rounded-3xl bg-[#071322] p-5 text-white shadow-lg sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-[12px] font-bold">{activeCode ?? 'NO-CODE'}</span>
                <span className="rounded-lg bg-emerald-400/15 px-2.5 py-1 text-[12px] font-bold text-emerald-200">{degreeLabel(activeLevel)}</span>
                <span className="rounded-lg bg-blue-400/15 px-2.5 py-1 text-[12px] font-bold text-blue-200">{statusLabel(major.status)}</span>
              </div>
              <h1 className="mt-4 text-2xl font-black leading-9 sm:text-4xl">{activeDisplayName}</h1>
              {major.nameEn && <p dir="ltr" className="mt-2 text-right text-[14px] font-semibold text-slate-300">{major.nameEn}</p>}
              <p className="mt-3 max-w-3xl text-[13px] leading-7 text-slate-300">
                صفحة موحدة تعرض التفاصيل حسب نوع الدرجة. لا يتم فرض أقسام البكالوريوس على الماجستير أو الدكتوراه أو الزماهة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4 lg:min-w-[460px]">
              <FieldCard label="أقسام التفاصيل" value={filteredSections.length} />
              <FieldCard label="النسخ" value={versions.length} />
              <FieldCard label="المصادر" value={sources.length} />
              <FieldCard label="المراجعة" value={statusLabel(major.completenessStatus)} />
            </div>
          </div>
        </header>

        {usingSample && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[12px] leading-6 text-amber-900">
            {filteredSections.length > 0
              ? `هذه تفاصيل معاينة من ملف المرحلة 10: ${major.sourceFileName}. بعد استيراد السجلات واعتمادها ستظهر نفس الأقسام من قاعدة البيانات.`
              : `هذا التخصص موجود في كتالوج المرحلة 10: ${major.sourceFileName}. لم يتم إرفاق ملف تفاصيل له بعد.`}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[12px] leading-6 text-rose-800">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 px-2 text-[12px] font-extrabold text-slate-400">أقسام ملف التخصص</div>
            <nav className="grid gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-right text-[13px] font-extrabold ${selected ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <h2 className="text-[18px] font-black">البيانات الأساسية</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldCard label="الاسم العربي" value={major.nameAr ?? major.displayName} />
                  <FieldCard label="الاسم الإنجليزي" value={major.nameEn} />
                  <FieldCard label="الرمز" value={major.code} />
                  <FieldCard label="الدرجة" value={degreeLabel(major.degreeLevel)} />
                  <FieldCard label="المجال/الكلية" value={major.collegeOrField} />
                  <FieldCard label="حالة النشر" value={statusLabel(major.status)} />
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h2 className="text-[18px] font-black">ملف الدرجة</h2>
                <div className="grid gap-3">
                  {profiles.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-500">لم يتم إنشاء ملف درجة بعد.</p>
                  ) : profiles.map((profile) => (
                    <article key={profile.id ?? profile.code} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-white px-2 py-1 font-mono text-[12px] font-bold">{profile.code ?? major.code}</span>
                        <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[12px] font-bold text-emerald-800">{degreeLabel(profile.level ?? major.degreeLevel)}</span>
                      </div>
                      <h3 className="mt-3 text-[15px] font-black">{profile.displayName ?? major.displayName}</h3>
                      <p className="mt-1 text-[13px] text-slate-500">السياق: {profile.collegeContext ?? major.collegeOrField ?? 'غير محدد'}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-[18px] font-black">المحتوى التفصيلي</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-600">{filteredSections.length} قسم محفوظ</span>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-[15px] font-black text-emerald-950">قالب {degreeTemplate.labelAr}</h3>
                    <span className="text-[12px] font-bold text-emerald-800">
                      {templateCoverage.filter((item) => item.matched).length} / {templateCoverage.length} أقسام مكتملة
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-6 text-emerald-900">{degreeTemplate.summaryAr}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {templateCoverage.map((item) => (
                      <div key={item.key} className="rounded-xl bg-white/80 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-extrabold text-slate-900">{item.titleAr}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.matched ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {item.matched ? 'موجود' : 'ناقص'}
                          </span>
                        </div>
                        {!item.matched && <p className="mt-1 text-[12px] leading-6 text-slate-500">{item.purposeAr}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {filteredSections.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-500">لا توجد أقسام تفاصيل لهذا التخصص بعد.</p>
                ) : (
                  <div className="grid gap-4">
                    {filteredSections.map((section) => (
                      <article key={section.sectionKey} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <h3 className="text-[16px] font-black text-slate-900">{section.title}</h3>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
                            {statusLabel(section.reviewStatus)}
                          </span>
                        </div>
                        <div className="mt-4 text-[13.5px] leading-7 text-slate-700 space-y-3 font-medium overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2.5 [&_th]:text-right [&_th]:font-bold [&_td]:border [&_td]:border-slate-200 [&_td]:p-2.5 [&_td]:text-right [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5 [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:mt-3">
                          <Markdown remarkPlugins={[remarkGfm]}>{section.content}</Markdown>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <h2 className="flex items-center gap-2 text-[18px] font-black"><UploadCloud className="h-5 w-5 text-emerald-700" /> المصادر</h2>
                  {sources.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-500">لا توجد مصادر.</p> : sources.map((source) => (
                    <article key={source.id ?? source.sourceName} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[13px]">
                      <p className="font-extrabold text-slate-900">{source.sourceName ?? major.sourceFileName ?? 'مصدر غير محدد'}</p>
                      <p className="mt-1 text-slate-500">النوع: {source.sourceType ?? major.sourceType ?? 'غير محدد'}</p>
                      {source.sourceHash && <p className="mt-1 break-all font-mono text-[11px] text-slate-400">البصمة: {source.sourceHash}</p>}
                    </article>
                  ))}
                </div>

                <div className="space-y-3">
                  <h2 className="flex items-center gap-2 text-[18px] font-black"><Database className="h-5 w-5 text-blue-700" /> النسخ والتغييرات</h2>
                  {versions.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-500">لا توجد نسخ.</p> : versions.map((version) => (
                    <article key={version.id ?? version.versionNumber} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[13px]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-extrabold text-slate-900">نسخة {version.versionNumber ?? 1}</p>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">{statusLabel(version.status)}</span>
                      </div>
                      <p className="mt-1 text-slate-500">{version.sourceFileName ?? major.sourceFileName ?? 'ملف غير محدد'}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-extrabold text-slate-800 hover:bg-slate-50">
            <Pencil className="h-4 w-4" />
            تعديل
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-[13px] font-extrabold text-white hover:bg-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            اعتماد للمراجعة
          </button>
          <a href={`/majors/${major.id}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[13px] font-extrabold text-white hover:bg-slate-800">
            <Globe className="h-4 w-4" />
            فتح الصفحة العامة
          </a>
        </div>
      </div>
    </main>
  );
}
