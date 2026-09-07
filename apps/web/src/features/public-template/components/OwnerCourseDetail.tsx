import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock, ExternalLink, PlayCircle, ShieldCheck } from 'lucide-react';
import type { Course } from '../types';

export function OwnerCourseDetail({course, track, onBack}: {course: Course; track: 'native' | 'paid'; onBack: () => void}) {
  const isNative = track === 'native';
  const { locale = 'ar' } = useParams<{ locale?: string }>();
  return <main className="min-h-screen bg-[var(--mn-page)] pb-24" dir="rtl">
    <header className="mn-search-hero mn-inverse p-4 text-white">
      <button onClick={onBack} aria-label="رجوع" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"><ArrowRight className="w-5 h-5" /></button>
      <div className="mt-4 text-xs font-semibold opacity-80">{isNative ? 'دورة منارتك الأصلية' : 'دورة مدفوعة'}</div>
      <h1 className="mt-1 text-xl font-bold">{course.title}</h1>
      <p className="mt-2 text-sm opacity-85">{course.provider}</p>
    </header>
    <div className="mx-auto max-w-2xl p-4 space-y-4">
      <section className="mn-panel rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4"/><span>{course.duration || 'المدة غير متوفرة'}</span></div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/><span>{course.isFree ? 'مجانية' : 'مدفوعة'}</span></div>
        </div>
        {course.courseContent && <div className="mt-5"><h2 className="font-bold flex items-center gap-2"><BookOpen className="w-4 h-4"/>محتوى الدورة</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--mn-text-muted)]">{course.courseContent}</p></div>}
        {course.acquiredSkills?.length ? <div className="mt-5"><h2 className="font-bold">المهارات المكتسبة</h2><ul className="mt-2 space-y-2">{course.acquiredSkills.map((skill)=><li key={skill} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0"/>{skill}</li>)}</ul></div> : null}
        {isNative && course.ownerId ? <Link to={`/${locale}/student/courses/${encodeURIComponent(course.ownerId)}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--mn-primary)] px-4 py-3 text-sm font-bold text-white mn-inverse"><PlayCircle className="w-4 h-4"/>ابدأ أو تابع التعلم</Link> : null}
        {!isNative && course.directCourseUrl ? <a href={course.directCourseUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--mn-primary)] px-4 py-3 text-sm font-bold text-white mn-inverse"><ExternalLink className="w-4 h-4"/>الانتقال للدورة</a> : null}
      </section>
    </div>
  </main>;
}
