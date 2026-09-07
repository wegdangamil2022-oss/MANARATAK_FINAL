import React from 'react';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import type { Course } from '../types';

/** Owner-backed native/paid catalog. Imported provenance stays in CoursesSearchPage. */
export function CourseTrackPreview({track, courses, onBack, onSelectCourse}: {track: 'native' | 'paid'; courses: Course[]; onBack: () => void; onSelectCourse: (course: Course) => void}) {
  const title = track === 'native' ? 'دورات منارتك' : 'الدورات المدفوعة';
  return <div className="min-h-screen pb-24 bg-[var(--mn-page)]" dir="rtl">
    <div className="mn-search-hero mn-inverse p-4 text-white">
      <button onClick={onBack} aria-label="رجوع" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"><ArrowRight className="w-5 h-5" /></button>
      <h1 className="text-xl font-bold mt-3">{title}</h1>
      <p className="mt-1 text-xs opacity-80">مصنفة مباشرة من عقد Phase 13 حسب originType وaccessType.</p>
    </div>
    <section className="max-w-2xl mx-auto p-4 space-y-3">
      {courses.map(course => <button key={course.id} type="button" onClick={()=>onSelectCourse(course)} className="mn-panel w-full rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 text-right">
        <div className="flex items-start gap-3"><BookOpen className="w-7 h-7 shrink-0 text-[var(--mn-accent-text)]"/><div className="min-w-0"><h2 className="font-bold">{course.title}</h2><p className="mt-1 text-xs text-[var(--mn-text-muted)]">{course.provider}</p><div className="mt-2 flex items-center gap-1 text-xs"><Clock className="w-3.5 h-3.5"/>{course.duration || 'المدة غير متوفرة'}</div></div></div>
      </button>)}
      {!courses.length && <div className="mn-panel rounded-3xl border border-dashed border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-center"><BookOpen className="w-9 h-9 mx-auto text-[var(--mn-accent-text)]"/><h2 className="mt-3 font-bold">لا توجد دورات منشورة في هذا المسار حاليًا</h2><p className="mt-2 text-sm text-[var(--mn-text-muted)]">لن تُعرض دورة مستوردة هنا كبديل مصطنع.</p></div>}
    </section>
  </div>;
}
