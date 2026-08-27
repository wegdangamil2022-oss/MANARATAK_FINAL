import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Building2, FileText, GraduationCap, Landmark, Search, Sparkles, Stethoscope, Wrench } from 'lucide-react';
import { Seo } from '../../components';
import { ApiClient } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

type PreviewItem = { id: string; slug: string; title: string; eyebrow?: string; description?: string };
type HomePreview = Record<'scholarships' | 'universities' | 'majors' | 'courses' | 'articles', PreviewItem[]>;
const emptyPreview: HomePreview = { scholarships: [], universities: [], majors: [], courses: [], articles: [] };

function localizedName(displayName: string, names: Record<string, string> | undefined, locale: 'ar' | 'en') {
  return names?.[locale] || displayName;
}

export function NewPublicHome() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<HomePreview>(emptyPreview);
  const [loading, setLoading] = useState(true);
  const ar = language === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      ApiClient.getScholarships({ page: 1, pageSize: 4 }),
      ApiClient.getUniversities({ page: 1, pageSize: 4 }),
      ApiClient.getMajors({ page: 1, pageSize: 4 }),
      ApiClient.getCourses({ page: 1, pageSize: 4 }),
      ApiClient.getCmsContent({ page: 1, pageSize: 4, locale: language, contentType: 'ARTICLE' }),
    ]).then(([scholarships, universities, majors, courses, articles]) => {
      if (!active) return;
      setPreview({
        scholarships: scholarships.status === 'fulfilled' ? scholarships.value.data.map((x) => ({ id: x.publicId, slug: x.slug, title: localizedName(x.displayName, x.localizedNames, language), eyebrow: x.studyCountry || x.degreeLevel, description: x.fundingCoverage })) : [],
        universities: universities.status === 'fulfilled' ? universities.value.data.map((x) => ({ id: x.publicId, slug: x.slug, title: localizedName(x.displayName, x.localizedNames, language), eyebrow: x.country, description: x.city || x.institutionType })) : [],
        majors: majors.status === 'fulfilled' ? majors.value.data.map((x) => ({ id: x.publicId, slug: x.slug, title: localizedName(x.displayName, x.localizedNames, language), eyebrow: x.degreeLevel, description: x.studentFriendlySummary || x.academicFieldOrDiscipline || undefined })) : [],
        courses: courses.status === 'fulfilled' ? courses.value.data.map((x) => ({ id: x.publicId, slug: x.slug, title: localizedName(x.displayName, x.localizedNames, language), eyebrow: x.providerName || x.platformName || undefined, description: x.category || x.difficultyLevel || undefined })) : [],
        articles: articles.status === 'fulfilled' ? articles.value.data.map((x) => ({ id: x.publicId, slug: x.slug, title: x.title, eyebrow: x.categorySlug || (ar ? 'دليل منارتك' : 'Manaratak guide'), description: x.summary || undefined })) : [],
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [ar, language]);

  const categories = useMemo(() => [
    ['/scholarships', ar ? 'المنح الدراسية' : 'Scholarships', GraduationCap],
    ['/universities', ar ? 'الجامعات' : 'Universities', Landmark],
    ['/majors', ar ? 'التخصصات' : 'Majors', Stethoscope],
    ['/courses', ar ? 'الدورات' : 'Courses', BookOpen],
    ['/international-tests', ar ? 'الاختبارات' : 'Tests', FileText],
    ['/tools', ar ? 'أدوات الطلاب' : 'Student tools', Wrench],
    ['/services', ar ? 'الخدمات' : 'Services', Building2],
    ['/articles', ar ? 'الأدلة والمقالات' : 'Guides', BriefcaseBusiness],
  ] as const, [ar]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    navigate(`${localizePathname('/search', language)}${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  return (
    <div className="bg-[#f7f9fc]">
      <Seo title={ar ? 'منارتك للمنح والفرص التعليمية' : 'Manaratak study opportunities'} description={ar ? 'اكتشف المنح والجامعات والتخصصات والدورات من مصادر موثوقة.' : 'Discover trusted scholarships, universities, majors and courses.'} />
      <section className="relative overflow-hidden bg-[#071d3a] px-4 pb-16 pt-12 text-white sm:px-8 sm:pb-24 sm:pt-20">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_15%_20%,#d6ae57_0,transparent_28%),radial-gradient(circle_at_85%_75%,#1e5f9d_0,transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d6ae57]/35 bg-[#d6ae57]/10 px-4 py-2 text-xs font-extrabold text-[#f0cf83]"><Sparkles className="h-4 w-4" />{ar ? 'بوابتك الذكية لمستقبل أكاديمي أفضل' : 'Your smart academic opportunity portal'}</div>
            <h1 className="text-4xl font-black leading-[1.18] sm:text-5xl lg:text-6xl">{ar ? 'ابدأ رحلتك التعليمية' : 'Start your learning journey'} <span className="text-[#e1bb64]">{ar ? 'من المكان الصحيح' : 'from the right place'}</span></h1>
            <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-blue-100/85 sm:text-lg">{ar ? 'منصة عربية تجمع الفرص الدراسية الموثوقة، وتساعدك على البحث والمقارنة والاستعداد للتقديم بخطوات واضحة.' : 'An Arabic-first platform for trusted study opportunities, discovery, comparison and application readiness.'}</p>
            <form onSubmit={submitSearch} className="mt-8 max-w-2xl rounded-2xl bg-white p-2 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2"><Search className="mx-2 h-5 w-5 shrink-0 text-[#173f68]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ar ? 'ابحث عن منحة، جامعة، تخصص أو دورة...' : 'Search scholarships, universities, majors or courses...'} className="min-h-12 w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" /><button type="submit" className="min-h-12 shrink-0 rounded-xl bg-[#d6ae57] px-5 text-sm font-black text-[#071d3a] hover:bg-[#eccd87]">{ar ? 'ابحث' : 'Search'}</button></div>
            </form>
          </div>
          <div className="relative hidden min-h-[340px] lg:block" aria-hidden="true"><div className="absolute inset-4 rotate-3 rounded-[2.5rem] border border-[#d6ae57]/35 bg-gradient-to-br from-[#123d6c] to-[#081a33] shadow-2xl" /><div className="absolute inset-10 -rotate-2 rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="h-3 w-28 rounded-full bg-[#d6ae57]" /><GraduationCap className="h-10 w-10 text-[#e8c878]" /></div><div className="mt-7 space-y-4">{[72, 92, 60, 82].map((w) => <div key={w} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="h-2.5 rounded-full bg-blue-100/20" style={{ width: `${w}%` }} /><div className="mt-3 h-2 w-2/5 rounded-full bg-[#d6ae57]/45" /></div>)}</div></div></div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-8"><div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:grid-cols-4 lg:grid-cols-8">{categories.map(([path, label, Icon]) => <Link key={path} to={localizePathname(path, language)} className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl px-2 text-center hover:bg-[#f3f7fb]"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1f8] text-[#123f6b] group-hover:bg-[#123f6b] group-hover:text-[#f1cf80]"><Icon className="h-6 w-6" /></span><span className="text-xs font-black text-slate-700">{label}</span></Link>)}</div></section>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-8 sm:py-20">
        <PreviewSection title={ar ? 'منح دراسية مختارة' : 'Featured scholarships'} description={ar ? 'أحدث الفرص المنشورة والمعتمدة في منصة منارتك.' : 'Recently published opportunities on Manaratak.'} path="/scholarships" items={preview.scholarships} loading={loading} language={language} Arrow={Arrow} />
        <PreviewSection title={ar ? 'جامعات تستحق الاستكشاف' : 'Explore universities'} description={ar ? 'بيانات جامعية مرتبطة بالمصادر الرسمية.' : 'University profiles linked to official sources.'} path="/universities" items={preview.universities} loading={loading} language={language} Arrow={Arrow} />
        <div className="grid gap-12 lg:grid-cols-2"><PreviewSection title={ar ? 'التخصصات الأكاديمية' : 'Academic majors'} description={ar ? 'تعرّف على مجالات الدراسة والمسارات المهنية.' : 'Discover study fields and career paths.'} path="/majors" items={preview.majors} loading={loading} language={language} Arrow={Arrow} compact /><PreviewSection title={ar ? 'دورات لتنمية مهاراتك' : 'Courses for your skills'} description={ar ? 'دورات منارتك والفرص التعليمية الخارجية.' : 'Manaratak and external learning opportunities.'} path="/courses" items={preview.courses} loading={loading} language={language} Arrow={Arrow} compact /></div>
        <PreviewSection title={ar ? 'أدلة ومقالات للطالب' : 'Student guides and articles'} description={ar ? 'محتوى تحريري منشور من نظام إدارة المحتوى.' : 'Published editorial content from the CMS.'} path="/articles" items={preview.articles} loading={loading} language={language} Arrow={Arrow} />
        <section className="overflow-hidden rounded-[2rem] bg-[#0b2a50] px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between"><div><div className="mb-3 text-sm font-black text-[#e1bb64]">{ar ? 'منصة الطالب' : 'Student workspace'}</div><h2 className="text-2xl font-black sm:text-3xl">{ar ? 'احتفظ بفرصك وخطط لخطوتك القادمة' : 'Save opportunities and plan your next step'}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/80">{ar ? 'ادخل إلى مساحة الطالب لمتابعة تقدمك وأدواتك وملفك التعليمي.' : 'Open your workspace to manage progress, tools and your student profile.'}</p></div><Link to={localizePathname('/student', language)} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#d6ae57] px-6 text-sm font-black text-[#071d3a] hover:bg-[#eccd87] lg:mt-0">{ar ? 'فتح منصة الطالب' : 'Open student workspace'}</Link></section>
      </main>
    </div>
  );
}

function PreviewSection({ title, description, path, items, loading, compact = false, language, Arrow }: { title: string; description: string; path: string; items: PreviewItem[]; loading: boolean; compact?: boolean; language: 'ar' | 'en'; Arrow: React.ComponentType<{ className?: string }> }) {
  const ar = language === 'ar';
  return <section><div className="mb-6 flex items-end justify-between gap-4"><div><div className="mb-2 h-1 w-12 rounded-full bg-[#d6ae57]" /><h2 className="text-2xl font-black text-[#0b2a50] sm:text-3xl">{title}</h2><p className="mt-2 text-sm font-medium text-slate-500">{description}</p></div><Link to={localizePathname(path, language)} className="hidden shrink-0 items-center gap-2 text-sm font-black text-[#123f6b] hover:text-[#9a7427] sm:flex">{ar ? 'عرض الكل' : 'View all'} <Arrow className="h-4 w-4" /></Link></div>{loading ? <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>{[0, 1, 2, 3].slice(0, compact ? 2 : 4).map((x) => <div key={x} className="h-44 animate-pulse rounded-2xl bg-slate-100" />)}</div> : items.length ? <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>{items.slice(0, compact ? 2 : 4).map((item) => <Link key={item.id} to={localizePathname(`${path}/${item.slug}`, language)} className="group flex min-h-44 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#d6ae57]/60 hover:shadow-xl"><div className="text-[11px] font-black text-[#9a7427]">{item.eyebrow || (ar ? 'منارتك' : 'Manaratak')}</div><h3 className="mt-3 line-clamp-2 text-base font-black leading-7 text-[#0b2a50]">{item.title}</h3>{item.description && <p className="mt-2 line-clamp-2 text-xs font-medium leading-6 text-slate-500">{item.description}</p>}<span className="mt-auto flex items-center gap-2 pt-4 text-xs font-black text-[#123f6b]">{ar ? 'عرض التفاصيل' : 'View details'} <Arrow className="h-3.5 w-3.5" /></span></Link>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"><p className="text-sm font-bold text-slate-500">{ar ? 'سيظهر المحتوى المنشور هنا عند تشغيل بيانات المنصة.' : 'Published platform content will appear here when runtime data is available.'}</p><Link to={localizePathname(path, language)} className="mt-4 inline-flex text-sm font-black text-[#123f6b] underline decoration-[#d6ae57] decoration-2 underline-offset-4">{ar ? 'فتح القسم' : 'Open section'}</Link></div>}</section>;
}
