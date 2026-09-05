import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

/** Explicit empty state until Phase 13 supplies native/paid courses; never mix imported data into these tracks. */
export function CourseTrackPreview({track, onBack, onImported}: {track: 'native' | 'paid'; onBack: () => void; onImported: () => void}) {
  const title = track === 'native' ? 'دورات منارتك' : 'الدورات المدفوعة';
  return <div className="min-h-screen pb-24 bg-[var(--mn-page)]" dir="rtl">
    <div className="mn-search-hero mn-inverse p-4 text-white">
      <button onClick={onBack} aria-label="رجوع" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"><ArrowRight className="w-5 h-5" /></button>
      <h1 className="text-xl font-bold mt-3">{title}</h1>
    </div>
    <section className="mn-panel max-w-xl mx-auto m-4 rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 text-center">
      <BookOpen className="w-9 h-9 mx-auto text-[var(--mn-accent-text)]" />
      <h2 className="font-bold text-base mt-3">لا توجد دورات منشورة في هذا المسار بعد</h2>
      <p className="text-sm leading-7 mt-2 text-[var(--mn-text-muted)]">هذا مسار مستقل بانتظار ربط بياناته. يمكنك الآن تجربة استكشاف الدورات المستوردة من المصادر التعليمية.</p>
      <button onClick={onImported} className="mt-4 rounded-xl px-4 py-3 bg-[var(--mn-primary)] text-white font-bold text-sm mn-inverse">استكشف الدورات المستوردة</button>
    </section>
  </div>;
}

