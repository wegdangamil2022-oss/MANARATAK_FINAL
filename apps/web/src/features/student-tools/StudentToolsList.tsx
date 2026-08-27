import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, GraduationCap, PenLine, Search, Sparkles } from 'lucide-react';
import { ApiClient, PublicStudentToolDto } from '../../api/client';
import { Seo } from '../../components/Seo';

const icons: Record<string, typeof Calculator> = {
  'gpa-calculator': Calculator,
  'university-comparison': GraduationCap,
  'motivation-letter-generator': PenLine,
  'scholarship-recommendation': Sparkles,
};
const statusLabel: Record<string, string> = {
  ACTIVE: 'متاحة الآن',
  COMING_SOON: 'قريبًا',
  UNDER_DEVELOPMENT: 'قيد التطوير',
};
export function StudentToolsList() {
  const [tools, setTools] = useState<PublicStudentToolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    let current = true;
    ApiClient.getStudentTools()
      .then((data) => {
        if (current) setTools(data);
      })
      .catch((reason: Error) => {
        if (current) setError(reason.message);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, []);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? tools.filter((tool) =>
          `${tool.nameAr} ${tool.nameEn} ${tool.category}`.toLowerCase().includes(q),
        )
      : tools;
  }, [tools, search]);
  const available = visible.filter(
    (tool) => tool.implementationStatus === 'IMPLEMENTED' && tool.visibility === 'ACTIVE',
  );
  const upcoming = visible.filter(
    (tool) => tool.implementationStatus !== 'IMPLEMENTED' || tool.visibility !== 'ACTIVE',
  );
  return (
    <main dir="rtl" className="space-y-10 pb-16">
      <Seo
        title="أدوات الطلاب | منارتك"
        description="أدوات أكاديمية موثوقة للتخطيط والمقارنة وإعداد الطلبات."
      />
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-[#071d3a] via-[#0b3763] to-[#123f6b] px-6 py-12 text-white shadow-xl sm:px-10">
        <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
        <p className="mb-3 text-sm font-bold text-emerald-200">منصة أدوات الطالب</p>
        <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
          قراراتك الدراسية أوضح، وخطواتك أسرع
        </h1>
        <p className="mt-4 max-w-2xl leading-8 text-emerald-50">
          أدوات حقيقية مرتبطة ببيانات منارتك المنشورة، مع حماية الخصوصية وإظهار صريح لما هو متاح وما
          يزال ضمن خارطة التطوير.
        </p>
        <label className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-lg">
          <Search className="h-5 w-5 text-emerald-700" />
          <span className="sr-only">ابحث في الأدوات</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="ابحث عن أداة..."
          />
        </label>
      </section>
      {error ? <Notice tone="error">تعذر تحميل الأدوات: {error}</Notice> : null}
      {loading ? (
        <div className="rounded-3xl border border-[#d6ae57]/30 bg-white p-16 text-center text-slate-500">
          جاري تحميل الأدوات...
        </div>
      ) : (
        <>
          <section>
            <Heading
              title="أدوات جاهزة للاستخدام"
              subtitle="أربع تجارب مكتملة تمر جميع عملياتها عبر الخادم الحقيقي."
            />
            <div className="grid gap-5 md:grid-cols-2">
              {available.map((tool) => (
                <ToolCard key={tool.toolKey} tool={tool} />
              ))}
            </div>
          </section>
          <section>
            <Heading
              title="خارطة الأدوات القادمة"
              subtitle="هذه الأدوات مسجلة للتخطيط فقط، ولا تعرض تنفيذًا وهميًا."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((tool) => (
                <ToolCard key={tool.toolKey} tool={tool} />
              ))}
            </div>
          </section>
        </>
      )}
      <section className="rounded-3xl border border-[#d6ae57]/35 bg-[#fbf5e6] p-6 text-sm leading-7 text-[#0b2a50]">
        <strong>الثقة والذكاء الاصطناعي:</strong> الأدوات الذكية تتصل بمنصة Phase 17 عبر صلاحية
        وظيفية محكومة فقط. لا تتصل بأي مزود مباشرة، وقد تظهر «غير مهيأة» إلى أن يكتمل إعداد التشغيل
        في Google Studio.
      </section>
    </main>
  );
}
function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-slate-600">{subtitle}</p>
    </div>
  );
}
function ToolCard({ tool }: { tool: PublicStudentToolDto }) {
  const active = tool.implementationStatus === 'IMPLEMENTED' && tool.visibility === 'ACTIVE';
  const Icon = icons[tool.toolKey] ?? Sparkles;
  return (
    <article className="flex min-h-56 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Icon className="h-6 w-6" />
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
        >
          {statusLabel[tool.visibility] ?? 'قيد التخطيط'}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-950">{tool.nameAr}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{tool.descriptionAr}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span>
          {tool.estimatedMinutes ? `${tool.estimatedMinutes} دقائق` : 'ضمن خارطة التطوير'}
        </span>
        {active ? (
          <Link
            className="rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white hover:bg-emerald-800"
            to={`/tools/${tool.toolKey}`}
          >
            فتح الأداة
          </Link>
        ) : (
          <span className="font-bold text-amber-700">لا يوجد تنفيذ بعد</span>
        )}
      </div>
    </article>
  );
}
function Notice({ children }: { children: React.ReactNode; tone?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
      {children}
    </div>
  );
}
