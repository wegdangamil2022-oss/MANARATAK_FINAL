import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronDown, GraduationCap, Layers, RotateCcw, Search, Sparkles } from 'lucide-react';
import { type PaginatedResult, type PublicMajorDto } from '../../api/client';
import { getLocalizedMajors } from '../../api/localizedEntities';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

export function MajorList() {
  const { t, language } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicMajorDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(params.get('q') || '');
  const [degree, setDegree] = useState(params.get('degreeLevel') || '');
  const [field, setField] = useState(params.get('academicFieldOrDiscipline') || '');
  const [faculty, setFaculty] = useState(params.get('collegeOrFaculty') || '');
  const page = Number(params.get('page') || 1);
  const ar = language === 'ar';

  useEffect(() => {
    let active = true; setLoading(true);
    getLocalizedMajors({ degreeLevel: params.get('degreeLevel') || undefined, academicFieldOrDiscipline: params.get('academicFieldOrDiscipline') || undefined, collegeOrFaculty: params.get('collegeOrFaculty') || undefined, page, pageSize: 12 }, language)
      .then((result) => active && setData(result))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : t('not_available')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [language, page, params, t]);

  const apply = () => { const next = new URLSearchParams(); if (query.trim()) next.set('q', query.trim()); if (degree) next.set('degreeLevel', degree); if (field.trim()) next.set('academicFieldOrDiscipline', field.trim()); if (faculty.trim()) next.set('collegeOrFaculty', faculty.trim()); next.set('page', '1'); setParams(next); };
  const reset = () => { setQuery(''); setDegree(''); setField(''); setFaculty(''); setParams({ page: '1' }); };
  const changePage = (value: number) => { const next = new URLSearchParams(params); next.set('page', String(value)); setParams(next); };
  const q = params.get('q')?.trim().toLocaleLowerCase(language) || '';
  const items = data?.data.filter((x) => !q || [x.displayName, x.canonicalName, x.description, x.studentFriendlySummary, x.academicFieldOrDiscipline, x.collegeOrFaculty].filter(Boolean).some((value) => String(value).toLocaleLowerCase(language).includes(q))) || [];

  return <div className="-mx-4 -my-6 min-h-screen bg-[#f7f9fc] pb-20 sm:-my-10">
    <Seo title={t('majors')} description={t('explore_majors_by_degree_level_academic_field_facu')} />
    <section className="relative overflow-hidden bg-gradient-to-b from-[#071d3a] via-[#0b3763] to-[#0b2a50] px-4 pb-16 pt-10 text-center text-white">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#d6ae57_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="relative mx-auto max-w-2xl"><Sparkles className="mx-auto mb-2 h-5 w-5 text-[#e3bd67]" /><h1 className="text-3xl font-black sm:text-4xl">{ar ? <>ابحث عن <span className="relative text-[#e3bd67]">تخصصك الأكاديمي</span></> : <>Find your <span className="text-[#e3bd67]">academic major</span></>}</h1><p className="mt-3 text-sm font-medium text-blue-100/85">{ar ? 'تعرّف على التخصصات والدرجات والمهارات والمسارات المهنية.' : 'Explore majors, degrees, skills and career pathways.'}</p><div className="relative mx-auto mt-6 max-w-xl"><Search className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[#d6ae57] ltr:left-4 rtl:right-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder={ar ? 'اسم التخصص، الكلية أو الوظيفة...' : 'Major, faculty or career...'} className="min-h-13 w-full rounded-full border border-[#d6ae57]/50 bg-[#06182f]/75 px-12 text-sm font-bold text-white outline-none placeholder:text-blue-100/70 focus:border-[#d6ae57]" /></div></div>
    </section>
    <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-4"><div className="grid gap-3 rounded-3xl border border-[#d6ae57]/45 bg-white p-3 shadow-xl sm:grid-cols-4">
      <Input icon={Layers} label={ar ? 'المجال' : 'Field'} value={field} onChange={setField} placeholder={ar ? 'كل المجالات' : 'All fields'} />
      <Input icon={BookOpen} label={ar ? 'الكلية' : 'Faculty'} value={faculty} onChange={setFaculty} placeholder={ar ? 'كل الكليات' : 'All faculties'} />
      <Select icon={GraduationCap} label={ar ? 'الدرجة' : 'Degree'} value={degree} onChange={setDegree} options={[['', ar ? 'كل الدرجات' : 'All degrees'], ['BACHELORS', t('bachelors')], ['MASTERS', t('masters')], ['PHD', t('phd')]]} />
      <button onClick={apply} className="min-h-14 rounded-2xl bg-[#0b3763] px-4 text-sm font-black text-white hover:bg-[#071d3a]">{ar ? 'عرض التخصصات' : 'Show majors'}</button>
    </div></section>
    <main className="mx-auto max-w-5xl px-4 pt-10"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black text-[#0b2a50]">{ar ? `التخصصات المتاحة${data ? ` (${data.total})` : ''}` : `Available majors${data ? ` (${data.total})` : ''}`}</h2><button onClick={reset} className="flex items-center gap-2 text-xs font-black text-[#9a7427]"><RotateCcw className="h-4 w-4" />{ar ? 'إعادة الضبط' : 'Reset'}</button></div>
      {loading ? <div className="space-y-4">{[0,1,2,3].map((x) => <div key={x} className="h-52 animate-pulse rounded-3xl bg-slate-100" />)}</div> : error ? <State text={error} error /> : !items.length ? <State text={t('no_majors_found_matching_your_criteria')} /> : <div className="space-y-4">{items.map((item) => <MajorCard key={item.publicId} item={item} language={language} />)}</div>}
      {data && data.totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button><span className="text-sm font-black text-[#0b2a50]">{page} / {data.totalPages}</span><button disabled={page >= data.totalPages} onClick={() => changePage(page + 1)} className="rounded-xl bg-[#0b3763] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button></div>}
    </main>
  </div>;
}

function MajorCard({ item, language }: { item: PublicMajorDto; language: 'ar' | 'en' }) { const ar = language === 'ar'; return <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-[#d6ae57]/60 hover:shadow-xl"><div className="grid sm:grid-cols-[120px_1fr_auto]"><div className="flex min-h-28 items-center justify-center bg-gradient-to-br from-[#0b3763] to-[#071d3a]"><BookOpen className="h-10 w-10 text-[#e3bd67]" /></div><div className="p-5"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-[#fbf5e6] px-3 py-1 text-[11px] font-black text-[#8b6721]">{item.degreeLevel}</span>{item.collegeOrFaculty && <span className="rounded-full bg-[#eaf1f8] px-3 py-1 text-[11px] font-black text-[#0b3763]">{item.collegeOrFaculty}</span>}</div><h3 className="text-xl font-black text-[#0b2a50]">{item.displayName}</h3><p className="mt-2 line-clamp-2 text-sm font-medium leading-7 text-slate-500">{item.studentFriendlySummary || item.description}</p>{item.acquiredSkills?.length ? <div className="mt-3 flex flex-wrap gap-2">{item.acquiredSkills.slice(0,3).map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{skill}</span>)}</div> : null}</div><Link to={localizePathname(`/majors/${item.slug}`, language)} className="flex min-h-14 items-center justify-center bg-[#f8fafc] px-6 text-sm font-black text-[#0b3763] transition group-hover:bg-[#d6ae57] group-hover:text-[#071d3a] sm:min-h-full">{ar ? 'التفاصيل' : 'Details'}</Link></div></article>; }
function Input({ icon: Icon, label, value, onChange, placeholder }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; onChange: (v: string) => void; placeholder: string }) { return <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3"><Icon className="h-5 w-5 text-[#b68b34]" /><span className="sr-only">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border-0 bg-transparent text-xs font-bold outline-none" /></label>; }
function Select({ icon: Icon, label, value, onChange, options }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; onChange: (v: string) => void; options: string[][] }) { return <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3"><Icon className="h-5 w-5 text-[#b68b34]" /><span className="sr-only">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-transparent text-xs font-bold outline-none">{options.map(([v,x]) => <option key={v} value={v}>{x}</option>)}</select><ChevronDown className="h-4 w-4 text-slate-400" /></label>; }
function State({ text, error = false }: { text: string; error?: boolean }) { return <div className={`rounded-3xl border border-dashed px-6 py-16 text-center text-sm font-bold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-500'}`}>{text}</div>; }
