import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileCheck2,
  FileText,
  Link2,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { ApiClient } from '../../api/client';
import {
  deriveCourseSpecialty,
  deriveCourseType,
  formatDateTime,
  formatYesNo,
  getArabicCourseTitle,
  getCertificateTypeArabic,
  getCourseDuration,
  getCourseLanguageRaw,
  getCourseLevelRaw,
  getCourseProvider,
  getCourseStatus,
  getCourseTopics,
  getDirectCourseUrl,
  getFreeCertificateState,
  getLinkHealthArabic,
  getLinkedMajors,
  getLinkedSkills,
  getMissingFields,
  getMissingFieldsCount,
  getOfficialSourceUrl,
  getOriginalCourseTitle,
  getStatusArabic,
  getStatusStyle,
  getStudyFreeState,
  isSourceVerified,
  translateLanguage,
  translateLevel,
  type ImportedCourseRecord,
} from './importedCourseUi';

type ModalName = 'EDIT' | 'FETCH_MISSING' | 'UNPUBLISH' | 'REJECT' | 'ARCHIVE' | null;

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

function DetailField({ label, value, className = '' }: DetailFieldProps) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50 p-4 ${className}`}>
      <span className="mb-1 block text-[11px] font-black text-slate-400">{label}</span>
      <div className="break-words text-sm font-black leading-6 text-slate-800">{value || 'غير متوفر'}</div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 border-b border-slate-100 pb-4">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-xs font-medium leading-6 text-slate-500">{description}</p>}
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  danger = false,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  danger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{description}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-200">إلغاء</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white disabled:opacity-60 ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0F4B3A] hover:bg-[#0a382b]'}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminImportedCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<ImportedCourseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalName>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getAdminImportedCourseById(id);
      setCourse(data);
    } catch {
      setCourse(null);
      setError('تعذر تحميل تفاصيل الدورة المستوردة من الخادم حاليًا.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = course ? getCourseStatus(course) : '';
  const freeStudy = course ? getStudyFreeState(course) : null;
  const freeCertificate = course ? getFreeCertificateState(course) : null;
  const directUrl = course ? getDirectCourseUrl(course) : '';
  const officialSourceUrl = course ? getOfficialSourceUrl(course) : '';
  const topics = course ? getCourseTopics(course) : [];
  const skills = course ? getLinkedSkills(course) : [];
  const majors = course ? getLinkedMajors(course) : [];
  const missingFields = course ? getMissingFields(course) : [];

  const importHistory = useMemo(() => {
    if (!course || !Array.isArray(course.importHistory)) return [];
    return course.importHistory;
  }, [course]);

  const auditHistory = useMemo(() => {
    if (!course || !Array.isArray(course.auditHistory)) return [];
    return course.auditHistory;
  }, [course]);

  const actionMessages: Record<string, string> = {
    VERIFY_SOURCE: 'تم تنفيذ التحقق من المصدر.',
    CHECK_LINK: 'تم فحص رابط الدورة.',
    FETCH_MISSING_FIELDS: 'تم طلب استكمال الحقول الناقصة من المصدر.',
    MARK_READY_TO_PUBLISH: 'تم وضع الدورة في حالة جاهزة للنشر.',
    PUBLISH: 'تم نشر الدورة.',
    UNPUBLISH: 'تم إلغاء نشر الدورة.',
    REJECT: 'تم رفض الدورة.',
    ARCHIVE: 'تمت أرشفة الدورة.',
    EDIT: 'تم حفظ تعديلات الدورة.',
  };

  const executeAction = async (action: string, payload?: any) => {
    if (!course) return;
    setActionLoading(action);
    setError(null);
    setSuccess(null);
    try {
      await ApiClient.executeAdminImportedCourseAction(String(course.id || course.publicId || id), action, payload);
      setSuccess(actionMessages[action] || 'تم تنفيذ الإجراء بنجاح.');
      setModal(null);
      await loadData();
    } catch {
      setError('تعذر تنفيذ الإجراء. تحقق من اتصال الخادم ومسار الإجراء ثم أعد المحاولة.');
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = () => {
    if (!course) return;
    setEditForm({
      titleAr: course.titleAr || course.localizedNames?.ar || '',
      description: course.description || course.courseContent || '',
      provider: getCourseProvider(course),
      directUrl,
      officialSourceUrl,
      studyFree: freeStudy === true ? 'Yes' : freeStudy === false ? 'No' : '',
      freeCertificate: freeCertificate === true ? 'Yes' : freeCertificate === false ? 'No' : '',
      certificateType: course.certificateType || '',
      language: getCourseLanguageRaw(course),
      level: getCourseLevelRaw(course),
      duration: getCourseDuration(course) === 'غير محددة' ? '' : getCourseDuration(course),
      category: course.category || '',
      shortCourseTopics: topics.join(' • '),
    });
    setModal('EDIT');
  };

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0F4B3A]" />
          <span className="text-sm font-black">جاري تحميل تفاصيل الدورة...</span>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
          <h1 className="text-xl font-black text-slate-950">تعذر عرض الدورة</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{error || 'لم يتم العثور على سجل الدورة المستوردة.'}</p>
          <Link to="/admin/courses/imported" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F4B3A] px-4 py-3 text-sm font-black text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة إلى الدورات المستوردة</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link to="/admin/courses" className="hover:text-[#0F4B3A]">إدارة الدورات</Link>
          <span>/</span>
          <Link to="/admin/courses/imported" className="hover:text-[#0F4B3A]">الدورات المستوردة</Link>
          <span>/</span>
          <span className="max-w-md truncate text-slate-900">تفاصيل الدورة</span>
        </div>

        <header className="rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black text-emerald-100">دورة خارجية مستوردة</span>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-950/20 px-3 py-1 text-[11px] font-black text-emerald-100">{deriveCourseSpecialty(course)}</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black text-white">{deriveCourseType(course)}</span>
              </div>
              <h1 className="text-2xl font-black leading-relaxed sm:text-4xl">{getArabicCourseTitle(course)}</h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-emerald-100/90">
                مراجعة بيانات الدورة المستوردة والتحقق من حقول ملف الاستيراد والمصدر والرابط قبل اعتمادها للنشر.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
                <span className="block text-[11px] font-bold text-emerald-100">الحالة</span>
                <span className="mt-1 block text-base font-black text-amber-300">{getStatusArabic(status)}</span>
              </div>
              <button onClick={() => void loadData()} className="flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-black text-white hover:bg-white/20">
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </button>
            </div>
          </div>
        </header>

        {success && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><span>{success}</span></div>
            <button onClick={() => setSuccess(null)}><X className="h-4 w-4" /></button>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-900">
            <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-rose-600" /><span>{error}</span></div>
            <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
          </div>
        )}

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <SectionHeader title="إجراءات الدورة" description="الإجراءات الإدارية الأساسية للتحقق والمراجعة ودورة النشر." />
          <div className="flex flex-wrap gap-2">
            <button onClick={openEdit} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-black text-slate-800 hover:bg-slate-200"><Edit3 className="h-4 w-4" />تعديل</button>
            <button onClick={() => void executeAction('VERIFY_SOURCE')} disabled={Boolean(actionLoading)} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-black text-blue-800 hover:bg-blue-100 disabled:opacity-50"><ShieldCheck className="h-4 w-4" />تحقق من المصدر</button>
            <button onClick={() => void executeAction('CHECK_LINK')} disabled={Boolean(actionLoading)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"><Link2 className="h-4 w-4" />فحص رابط الدورة</button>
            <button onClick={() => setModal('FETCH_MISSING')} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs font-black text-violet-800 hover:bg-violet-100"><Sparkles className="h-4 w-4" />جلب الحقول الناقصة</button>
            <button onClick={() => void executeAction('MARK_READY_TO_PUBLISH')} disabled={Boolean(actionLoading)} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-black text-indigo-800 hover:bg-indigo-100 disabled:opacity-50"><FileCheck2 className="h-4 w-4" />جاهزة للنشر</button>
            <button onClick={() => void executeAction('PUBLISH')} disabled={status === 'PUBLISHED' || Boolean(actionLoading)} className="inline-flex items-center gap-2 rounded-xl bg-[#0F4B3A] px-3.5 py-2.5 text-xs font-black text-white hover:bg-[#0a382b] disabled:opacity-40"><CheckCircle2 className="h-4 w-4" />نشر</button>
            <button onClick={() => setModal('UNPUBLISH')} disabled={status !== 'PUBLISHED'} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-black text-amber-800 hover:bg-amber-100 disabled:opacity-40"><Lock className="h-4 w-4" />إلغاء النشر</button>
            <button onClick={() => setModal('REJECT')} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-black text-rose-800 hover:bg-rose-100"><XCircle className="h-4 w-4" />رفض</button>
            <button onClick={() => setModal('ARCHIVE')} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200"><Archive className="h-4 w-4" />أرشفة</button>
            {directUrl && (
              <a href={directUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50"><ExternalLink className="h-4 w-4" />فتح الدورة الخارجية</a>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <SectionHeader title="المعلومات الأساسية" description="ملخص منظم للدورة كما تظهر في كتالوج منارتك الإداري." />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <DetailField label="عنوان الدورة بالعربية" value={getArabicCourseTitle(course)} className="md:col-span-2" />
            <DetailField label="المزود أو المنصة" value={getCourseProvider(course)} />
            <DetailField label="حالة الدورة" value={<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(status)}`}>{getStatusArabic(status)}</span>} />
            <DetailField label="التخصص أو المجال" value={deriveCourseSpecialty(course)} />
            <DetailField label="نوع الدورة" value={deriveCourseType(course)} />
            <DetailField label="اللغة" value={translateLanguage(getCourseLanguageRaw(course))} />
            <DetailField label="المستوى" value={translateLevel(getCourseLevelRaw(course))} />
            <DetailField label="مدة الدراسة" value={getCourseDuration(course)} />
            <DetailField label="آخر تحديث" value={formatDateTime(course.updatedAt)} />
            <DetailField label="معرف السجل" value={String(course.publicId || course.id || id || 'غير متوفر')} />
            <DetailField label="الاسم الأصلي كما ورد في المصدر" value={getOriginalCourseTitle(course)} className="md:col-span-2" />
          </div>

          {(course.description || course.courseContent) && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
              <span className="mb-2 block text-xs font-black text-slate-500">وصف الدورة</span>
              <p className="whitespace-pre-wrap text-sm font-medium leading-8 text-slate-700">{course.description || course.courseContent}</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <SectionHeader
            title="بيانات ملف الاستيراد"
            description="هذه المجموعة تعكس الحقول الأساسية المستخدمة في ملف الدورات: المنصة، الرابط المباشر، مجانية الدراسة، مجانية الشهادة، نوع الشهادة، اللغة، المستوى، المدة، وموضوعات الدورة."
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <DetailField label="المنصة / الجامعة" value={getCourseProvider(course)} />
            <DetailField label="الدراسة مجانية" value={formatYesNo(freeStudy)} />
            <DetailField label="الشهادة مجانية" value={formatYesNo(freeCertificate)} />
            <DetailField label="نوع الشهادة" value={getCertificateTypeArabic(course)} />
            <DetailField label="لغة الدراسة" value={translateLanguage(getCourseLanguageRaw(course))} />
            <DetailField label="مستوى الدراسة" value={translateLevel(getCourseLevelRaw(course))} />
            <DetailField label="مدة الدورة" value={getCourseDuration(course)} />
            <DetailField label="الرابط المباشر للدورة" value={directUrl ? <a href={directUrl} target="_blank" rel="noreferrer" className="text-[#0F4B3A] underline decoration-emerald-300 underline-offset-4">فتح الرابط المباشر</a> : 'غير متوفر'} className="md:col-span-2" />
          </div>

          <div className="mt-4">
            <span className="mb-2 block text-xs font-black text-slate-500">موضوعات الدورة المختصرة</span>
            {topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => <span key={`${topic}-${index}`} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-900">{topic}</span>)}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">لا توجد موضوعات مختصرة مسجلة لهذه الدورة.</div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <SectionHeader title="التحقق من المصدر والرابط" description="سلامة المصدر والرابط المباشر قبل السماح بالنشر." />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailField label="حالة التحقق من المصدر" value={isSourceVerified(course) ? 'المصدر متحقق منه' : 'المصدر يحتاج تحققًا'} />
              <DetailField label="حالة الرابط" value={getLinkHealthArabic(course)} />
              <DetailField label="عدد الحقول الناقصة" value={String(getMissingFieldsCount(course))} />
              <DetailField label="مستوى الثقة بالمصدر" value={course.sourceTrustLevel || course.trustLevel || course.trustScore || 'غير محدد'} />
              <DetailField label="آخر تحقق" value={formatDateTime(course.lastVerifiedAt || course.verifiedAt)} />
              <DetailField label="رابط المصدر الرسمي" value={officialSourceUrl ? <a href={officialSourceUrl} target="_blank" rel="noreferrer" className="text-[#0F4B3A] underline decoration-emerald-300 underline-offset-4">فتح المصدر الرسمي</a> : 'غير متوفر'} />
            </div>

            {missingFields.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span className="text-xs font-black text-amber-900">الحقول الناقصة</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missingFields.map((field, index) => <span key={`${field}-${index}`} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm">{field}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <SectionHeader title="التصنيف والمهارات" description="روابط مساعدة للعرض والبحث دون تغيير بيانات المصدر الأصلية." />
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-xs font-black text-slate-500">التخصص المستنتج للفلترة</span>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-900">{deriveCourseSpecialty(course)}</span>
              </div>
              <div>
                <span className="mb-2 block text-xs font-black text-slate-500">التخصصات المرتبطة</span>
                {majors.length ? <div className="flex flex-wrap gap-2">{majors.map((major, index) => <span key={`${major}-${index}`} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{major}</span>)}</div> : <span className="text-sm font-medium text-slate-400">لا توجد تخصصات مرتبطة.</span>}
              </div>
              <div>
                <span className="mb-2 block text-xs font-black text-slate-500">المهارات المكتسبة</span>
                {skills.length ? <div className="flex flex-wrap gap-2">{skills.map((skill, index) => <span key={`${skill}-${index}`} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">{skill}</span>)}</div> : <span className="text-sm font-medium text-slate-400">لا توجد مهارات مرتبطة.</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <SectionHeader title="سجل الاستيراد" description="الأحداث المرتبطة بوصول السجل واستكماله والتحقق منه." />
            {importHistory.length ? (
              <div className="space-y-3">
                {importHistory.map((entry: any, index: number) => (
                  <div key={entry.id || index} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <FileText className="mt-1 h-4 w-4 shrink-0 text-[#0F4B3A]" />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-800">{entry.labelAr || entry.eventAr || entry.event || 'حدث استيراد'}</div>
                      <div className="mt-1 text-xs font-medium text-slate-500">{entry.source || 'المصدر غير محدد'} • {formatDateTime(entry.timestamp || entry.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">لا يوجد سجل استيراد متاح لهذه الدورة.</div>}
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <SectionHeader title="سجل المراجعة والتدقيق" description="توثيق الإجراءات الإدارية المنفذة على السجل." />
            {auditHistory.length ? (
              <div className="space-y-3">
                {auditHistory.map((entry: any, index: number) => (
                  <div key={entry.id || index} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-800">{entry.actionAr || entry.action || 'إجراء إداري'}</div>
                      <div className="mt-1 text-xs font-medium text-slate-500">{entry.actor || entry.changedBy || 'المستخدم غير محدد'} • {formatDateTime(entry.timestamp || entry.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">لا يوجد سجل تدقيق متاح لهذه الدورة.</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-xs font-bold leading-7 text-emerald-950">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
            <p>
              عند جلب الحقول الناقصة أو إعادة التحقق من المصدر يجب ملء الحقول الفارغة فقط، ولا يجوز الكتابة فوق قيمة سبق أن راجعها المسؤول دون قرار صريح. كما لا يتم نشر أي دورة تلقائيًا بعد الاستيراد أو الاستكمال.
            </p>
          </div>
        </section>
      </div>

      {modal === 'EDIT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" dir="rtl">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">تعديل بيانات الدورة المستوردة</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">عدّل الحقول الإدارية دون تغيير بيانات المصدر الأصلية بصمت.</p>
              </div>
              <button onClick={() => setModal(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ['titleAr', 'عنوان الدورة بالعربية'],
                ['provider', 'المنصة أو المزود'],
                ['language', 'لغة الدراسة'],
                ['level', 'مستوى الدراسة'],
                ['duration', 'مدة الدورة'],
                ['certificateType', 'نوع الشهادة'],
                ['category', 'التصنيف'],
                ['directUrl', 'الرابط المباشر للدورة'],
                ['officialSourceUrl', 'رابط المصدر الرسمي'],
                ['shortCourseTopics', 'موضوعات الدورة المختصرة'],
              ].map(([key, label]) => (
                <label key={key} className={key === 'directUrl' || key === 'officialSourceUrl' || key === 'shortCourseTopics' ? 'md:col-span-2' : ''}>
                  <span className="mb-2 block text-xs font-black text-slate-600">{label}</span>
                  <input value={editForm[key] || ''} onChange={event => setEditForm(current => ({ ...current, [key]: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]" />
                </label>
              ))}

              <label>
                <span className="mb-2 block text-xs font-black text-slate-600">الدراسة مجانية</span>
                <select value={editForm.studyFree || ''} onChange={event => setEditForm(current => ({ ...current, studyFree: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-[#0F4B3A]">
                  <option value="">غير محدد</option><option value="Yes">نعم</option><option value="No">لا</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-black text-slate-600">الشهادة مجانية</span>
                <select value={editForm.freeCertificate || ''} onChange={event => setEditForm(current => ({ ...current, freeCertificate: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-[#0F4B3A]">
                  <option value="">غير محدد</option><option value="Yes">نعم</option><option value="No">لا</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-xs font-black text-slate-600">وصف الدورة</span>
                <textarea rows={5} value={editForm.description || ''} onChange={event => setEditForm(current => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium leading-7 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700">إلغاء</button>
              <button onClick={() => void executeAction('EDIT', editForm)} disabled={actionLoading === 'EDIT'} className="inline-flex items-center gap-2 rounded-xl bg-[#0F4B3A] px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
                {actionLoading === 'EDIT' && <Loader2 className="h-4 w-4 animate-spin" />}
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal === 'FETCH_MISSING'}
        title="جلب الحقول الناقصة من المصدر"
        description="سيتم طلب استكمال الحقول الفارغة من المصدر المسجل. يجب ألا تُستبدل أي قيمة سبق أن تمت مراجعتها واعتمادها دون قرار إداري صريح."
        confirmText="جلب الحقول الناقصة"
        loading={actionLoading === 'FETCH_MISSING_FIELDS'}
        onClose={() => setModal(null)}
        onConfirm={() => void executeAction('FETCH_MISSING_FIELDS')}
      />
      <ConfirmModal
        open={modal === 'UNPUBLISH'}
        title="إلغاء نشر الدورة"
        description="ستُزال الدورة من حالة النشر وتعود إلى مساحة المراجعة دون حذف سجلها أو تاريخها."
        confirmText="إلغاء النشر"
        loading={actionLoading === 'UNPUBLISH'}
        onClose={() => setModal(null)}
        onConfirm={() => void executeAction('UNPUBLISH')}
      />
      <ConfirmModal
        open={modal === 'REJECT'}
        title="رفض الدورة"
        description="سيتم تغيير حالة الدورة إلى مرفوضة. استخدم هذا الإجراء عندما لا تستوفي الدورة قواعد الاستيراد أو جودة المصدر."
        confirmText="رفض الدورة"
        danger
        loading={actionLoading === 'REJECT'}
        onClose={() => setModal(null)}
        onConfirm={() => void executeAction('REJECT')}
      />
      <ConfirmModal
        open={modal === 'ARCHIVE'}
        title="أرشفة الدورة"
        description="سيتم نقل الدورة إلى الأرشيف مع الاحتفاظ بسجل الاستيراد والتدقيق الإداري."
        confirmText="أرشفة الدورة"
        danger
        loading={actionLoading === 'ARCHIVE'}
        onClose={() => setModal(null)}
        onConfirm={() => void executeAction('ARCHIVE')}
      />
    </main>
  );
}
