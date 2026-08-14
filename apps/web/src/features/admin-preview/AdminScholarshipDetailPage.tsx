import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Archive, ArrowLeft, Award, Building2, CalendarDays, CheckCircle2, ClipboardCheck,
  Coins, Edit3, ExternalLink, FileCheck2, FileText, GraduationCap, Globe2, Languages,
  Loader2, Plus, Send, ShieldCheck, Sparkles, Target, UsersRound,
} from 'lucide-react';
import { ApiClient } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';
import { localScholarshipPreviewEnabled, PREVIEW_SCHOLARSHIP_ID, previewScholarshipFixture } from './previewScholarshipFixture';

type Scholarship = typeof previewScholarshipFixture & Record<string, any>;
type DegreeKey = keyof typeof previewScholarshipFixture.eligibleMajorsByDegree;

const statusLabel: Record<string, string> = {
  READY_TO_REVIEW: 'جاهزة للمراجعة', READY_TO_PUBLISH: 'جاهزة للنشر',
  PUBLISHED: 'منشورة', ARCHIVED: 'مؤرشفة', DRAFT: 'مسودة',
};

export function AdminScholarshipDetailPage() {
  const { dir } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const previewMode = localScholarshipPreviewEnabled();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token')) || previewMode;
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<DegreeKey>('Bachelor');

  useEffect(() => { void loadScholarship(); }, [id]);

  async function loadScholarship() {
    setLoading(true);
    if (previewMode && id === PREVIEW_SCHOLARSHIP_ID) {
      setScholarship(previewScholarshipFixture as Scholarship);
      setLoading(false);
      return;
    }
    try {
      const found = await ApiClient.getAdminScholarshipById(String(id));
      setScholarship(found);
    } catch {
      setScholarship(null);
    } finally {
      setLoading(false);
    }
  }

  function runPreviewAction(action: string, nextStatus?: string) {
    setBusyAction(action);
    window.setTimeout(() => {
      if (nextStatus) setScholarship(current => current ? { ...current, status: nextStatus } : current);
      setNotice(previewMode
        ? `تمت معاينة إجراء «${action}» محليًا فقط، ولم تُكتب أي بيانات.`
        : `تم تنفيذ إجراء «${action}».`);
      setBusyAction(null);
    }, 350);
  }

  if (!adminSessionPresent) return <div className="p-12 text-center font-bold text-rose-700">يلزم تسجيل الدخول بصلاحية إدارية.</div>;
  if (loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#173F5F]" /></div>;
  if (!scholarship) return (
    <div className="mx-auto max-w-xl p-12 text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-400" />
      <h1 className="mt-4 text-xl font-black">لم يتم العثور على المنحة</h1>
      <Link to="/admin/scholarships" className="mt-5 inline-flex rounded-md bg-[#173F5F] px-4 py-2 text-sm font-bold text-white">العودة إلى المنح</Link>
    </div>
  );

  const majors = list(scholarship.eligibleMajorsByDegree?.[selectedDegree] ?? (selectedDegree === 'Bachelor' ? scholarship.eligibleMajorsOrFields : []));
  const documents = list(scholarship.requiredDocuments);
  const languageTests = list(scholarship.requiredLanguageTests ?? ['IELTS عند اشتراط البرنامج أو الجامعة', 'TOEFL عند قبوله من البرنامج']);
  const benefits = list(scholarship.benefits ?? ['الإعفاء من الرسوم الدراسية', 'السكن الجامعي', 'تذكرة سفر سنوية', 'مخصصات مالية وفق اللائحة']);

  return (
    <main dir={dir} className="min-h-screen bg-[#f5f7fa] px-4 py-7 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/admin/scholarships" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#173F5F]">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> العودة إلى المنح الدراسية
          </Link>
          {previewMode && <span className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">سجل مؤقت لمراجعة التصميم فقط</span>}
        </div>

        <section className="overflow-hidden rounded-lg border border-[#0B5D49]/20 bg-[#0B5D49] text-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-white/10 px-2.5 py-1 font-mono text-xs">{scholarship.publicId ?? scholarship.id}</span>
                <span className="rounded bg-[#F4C95D] px-2.5 py-1 text-xs font-black text-[#102A43]">{statusLabel[scholarship.status] ?? scholarship.status}</span>
              </div>
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">{scholarship.displayName}</h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-100">
                <Building2 className="h-4 w-4" />
                <span dir="ltr" className="font-bold">{scholarship.sponsorNameEn ?? 'Qatar University'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[450px]">
              <Fact icon={Globe2} label="دولة الدراسة" value={scholarship.studyCountry} />
              <Fact icon={GraduationCap} label="الدرجات التعليمية" value="4 درجات" />
              <Fact icon={CalendarDays} label="الموعد النهائي" value={scholarship.applicationDeadline} />
              <Fact icon={Coins} label="نوع التمويل" value={scholarship.fundingCoverage === 'Fully Funded' ? 'تمويل كامل' : 'تمويل جزئي'} />
              <Fact icon={Languages} label="لغة الدراسة" value={scholarship.studyLanguage} />
              <Fact icon={ShieldCheck} label="اكتمال السجل" value={scholarship.completenessStatus === 'complete' ? 'مكتمل' : 'يحتاج مراجعة'} />
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <Action icon={Sparkles} label="جلب النواقص" onClick={() => runPreviewAction('جلب النواقص')} busy={busyAction === 'جلب النواقص'} />
          <Action icon={Edit3} label="تعديل" onClick={() => runPreviewAction('تعديل')} busy={busyAction === 'تعديل'} />
          <Action icon={ClipboardCheck} label="اعتماد" onClick={() => runPreviewAction('اعتماد', 'READY_TO_PUBLISH')} busy={busyAction === 'اعتماد'} />
          <Action icon={Send} label="نشر" onClick={() => runPreviewAction('نشر', 'PUBLISHED')} busy={busyAction === 'نشر'} primary />
          <Action icon={Archive} label="أرشفة" onClick={() => runPreviewAction('أرشفة', 'ARCHIVED')} busy={busyAction === 'أرشفة'} danger />
        </section>

        {notice && <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900"><span>{notice}</span><button onClick={() => setNotice(null)}>×</button></div>}

        <div className="grid gap-5 lg:grid-cols-2">
          <DetailSection icon={Award} title="التمويل والمزايا" subtitle="كل ما يحصل عليه الطالب عند قبول المنحة">
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map(item => <ListItem key={item} text={item} />)}
            </div>
          </DetailSection>

          <DetailSection icon={Target} title="التخصصات والدرجات المستهدفة" subtitle="ترتبط لاحقًا بالتخصصات والدرجات المرجعية">
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([['Bachelor', 'بكالوريوس'], ['Master', 'ماجستير'], ['PhD', 'دكتوراه'], ['Fellowship', 'زمالات']] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setSelectedDegree(value)} className={`min-h-10 rounded-md border px-3 text-sm font-bold transition ${selectedDegree === value ? 'border-[#0B5D49] bg-[#0B5D49] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-[#0B5D49]'}`}>{label}</button>
              ))}
            </div>
            <TagList items={majors} />
          </DetailSection>

          <DetailSection icon={UsersRound} title="شروط الأهلية" subtitle="الشروط الأكاديمية والعامة للمتقدم">
            <p className="text-sm leading-7 text-slate-700">{scholarship.eligibilityCriteria}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ListItem text="استيفاء متطلبات القبول في البرنامج" />
              <ListItem text="سجل أكاديمي متميز" />
              <ListItem text="الالتزام بشروط الاستمرار والتجديد" />
              <ListItem text="تقديم الطلب خلال الدورة المحددة" />
            </div>
          </DetailSection>

          <DetailSection icon={FileCheck2} title="المستندات والاختبارات المطلوبة" subtitle="المستندات العامة ومتطلبات اللغة عند انطباقها">
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map(item => <ListItem key={item} text={item} />)}
              {languageTests.map(item => <ListItem key={item} text={item} accent />)}
            </div>
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs leading-6 text-amber-900">اختبار IELTS أو TOEFL لا يُعرض كشرط مؤكد إلا إذا نص عليه المصدر الرسمي للبرنامج أو الجامعة.</p>
          </DetailSection>
        </div>

        <DetailSection icon={ExternalLink} title="رابط التقديم والمصدر الرسمي" subtitle="الوجهة الرسمية التي يستخدمها الطالب للتقديم والتحقق">
          <div className="grid gap-3 lg:grid-cols-2">
            <OfficialLink label="رابط التقديم المباشر" href={scholarship.applicationLink} />
            <OfficialLink label="المصدر الرسمي للمنحة" href={scholarship.officialSourceUrl} />
          </div>
        </DetailSection>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-slate-500" /><h2 className="font-black">معلومات المراجعة الداخلية</h2></div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <ReviewFact label="نوع المصدر" value={scholarship.sourceType} />
            <ReviewFact label="حالة التحقق" value={scholarship.verificationStatus} />
            <ReviewFact label="درجة الثقة" value={`${scholarship.trustScore ?? 0}%`} />
            <ReviewFact label="آخر تحديث" value={formatDate(scholarship.updatedAt)} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  return <div className="min-h-[82px] rounded-md border border-white/15 bg-white/10 p-3"><Icon className="mb-2 h-4 w-4 text-[#F4C95D]" /><span className="block text-[11px] text-blue-100">{label}</span><strong className="mt-1 block text-sm">{value || 'غير محدد'}</strong></div>;
}
function Action({ icon: Icon, label, onClick, busy, primary, danger }: { icon: React.ElementType; label: string; onClick: () => void; busy: boolean; primary?: boolean; danger?: boolean }) {
  const color = primary ? 'bg-[#0B5D49] text-white hover:bg-[#084838]' : danger ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
  return <button onClick={onClick} disabled={busy} className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-4 text-sm font-bold transition ${color}`}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{label}</button>;
}
function DetailSection({ icon: Icon, title, subtitle, children }: React.PropsWithChildren<{ icon: React.ElementType; title: string; subtitle: string }>) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#E7F2EE] text-[#0B5D49]"><Icon className="h-5 w-5" /></div><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div></div><button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#0B5D49]/30 bg-[#F2F8F5] px-3 text-xs font-bold text-[#0B5D49] hover:bg-[#E7F2EE]" title={`إضافة بند إلى ${title}`}><Plus className="h-4 w-4" />إضافة بند</button></div>{children}</section>;
}
function ListItem({ text, accent }: { text: string; accent?: boolean }) { return <div className={`flex min-h-11 items-center gap-2 rounded-md border p-3 text-sm ${accent ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}><CheckCircle2 className={`h-4 w-4 shrink-0 ${accent ? 'text-blue-600' : 'text-emerald-600'}`} />{text}</div>; }
function TagList({ items }: { items: string[] }) { return <div className="flex flex-wrap gap-2">{items.length ? items.map(item => <span key={item} className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-[#0B5D49]">{item}</span>) : <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">لا توجد تخصصات مضافة لهذه الدرجة بعد.</p>}</div>; }
function KeyValues({ rows }: { rows: Array<[string, string | undefined]> }) { return <dl className="mt-5 divide-y divide-slate-100 rounded-md border border-slate-200">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-bold text-slate-900">{value || 'غير محدد'}</dd></div>)}</dl>; }
function OfficialLink({ label, href }: { label: string; href?: string }) { return <a href={href || '#'} target="_blank" rel="noreferrer" className="flex min-h-16 items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50"><div><span className="block text-xs text-slate-500">{label}</span><span dir="ltr" className="mt-1 block max-w-[430px] truncate text-sm font-bold text-blue-700">{href || 'غير متوفر'}</span></div><ExternalLink className="h-5 w-5 shrink-0 text-blue-600" /></a>; }
function ReviewFact({ label, value }: { label: string; value?: string }) { return <div className="rounded-md bg-slate-50 p-3"><span className="block text-xs text-slate-500">{label}</span><strong className="mt-1 block text-sm">{value || 'غير محدد'}</strong></div>; }
function list(value: unknown): string[] { if (Array.isArray(value)) return value.map(String); return String(value ?? '').split(/[,،|]/).map(item => item.trim()).filter(Boolean); }
function degreeLabel(value?: string) { return value === 'Bachelor' ? 'البكالوريوس' : value === 'Master' ? 'الماجستير' : value === 'PhD' ? 'الدكتوراه' : value || 'غير محدد'; }
function formatDate(value?: string) { if (!value) return 'غير محدد'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString('ar'); }
