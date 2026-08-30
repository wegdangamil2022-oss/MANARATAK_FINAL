import React from 'react';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Code2,
  Compass,
  ExternalLink,
  Globe2,
  GraduationCap,
  Layers3,
  ShieldCheck,
} from 'lucide-react';
import { ImportedCourse } from '../types';
import { FavoriteButton } from './FavoriteButton';

interface ImportedCourseDetailProps {
  course: ImportedCourse;
  onBack?: () => void;
  onOpenMajor?: (majorId: string) => void;
  onOpenUniversity?: (universityId: string) => void;
  onOpenScholarship?: (scholarshipId: string) => void;
  onOpenCountry?: (countryName: string) => void;
  onOpenExam?: (examId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const Fact = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="min-h-[70px] rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)]/90 px-3 py-2.5 mn-panel ">
    <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-extrabold text-[var(--mn-text-muted)]">
      <Icon className="h-3.5 w-3.5 text-[var(--mn-heading)]" />
      <span>{label}</span>
    </div>
    <div className="text-[11px] font-black leading-5 text-[var(--mn-heading)]">{value}</div>
  </div>
);

export const ImportedCourseDetail: React.FC<ImportedCourseDetailProps> = ({
  course,
  onBack,
  onOpenMajor,
  onOpenUniversity,
  onOpenScholarship,
  onOpenCountry,
  onOpenExam,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div className="min-h-screen bg-[var(--mn-page)] pb-24 text-[var(--mn-heading)] mn-panel " dir="rtl">
      <div className="relative overflow-hidden border-b border-[var(--mn-accent)]/20 bg-gradient-to-br from-[var(--mn-primary)] via-[var(--mn-primary)] to-[var(--mn-primary)] px-4 pb-8 pt-4 text-white shadow-sm mn-inverse ">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[var(--mn-accent)]/50" />
          <div className="absolute -left-14 bottom-0 h-40 w-40 rounded-full bg-[var(--mn-accent)]/20 blur-3xl" />
        </div>

        {onToggleFavorite && (
          <FavoriteButton
            active={isFavorite}
            onToggle={(event) => {
              event.stopPropagation();
              onToggleFavorite(course.id);
            }}
            className="absolute top-4 left-4 z-20 bg-[var(--mn-surface)]/95 mn-panel "
          />
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="relative z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white shadow-md backdrop-blur-md active:scale-95"
            title="العودة إلى الدورات المستوردة"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        )}

        <div className="relative z-10 mx-auto mt-4 max-w-lg">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner backdrop-blur-sm">
              <Code2 className="h-6 w-6 text-[var(--mn-accent-soft)]" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black text-[var(--mn-accent-soft)]">{course.provider}</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[8px] font-black text-white">دورة مستوردة</span>
              </div>
              <h1 className="text-[19px] font-black leading-7 text-white sm:text-[22px]">{course.title}</h1>
            </div>
          </div>

          <p className="text-[11px] font-bold leading-5 text-[var(--mn-on-dark-muted)]">{course.field}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {course.studyFree && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--mn-success-border)] bg-[var(--mn-success-solid)]/10 px-2.5 py-1 text-[9px] font-black text-[var(--mn-success-text)]">
                <CheckCircle2 className="h-3 w-3" /> الدراسة مجانية
              </span>
            )}
            {course.freeCertificate && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--mn-border-gold)] bg-[var(--mn-accent)]/10 px-2.5 py-1 text-[9px] font-black text-[var(--mn-accent-soft)]">
                <BadgeCheck className="h-3 w-3" /> شهادة مجانية
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto -mt-4 max-w-lg space-y-3 px-3.5 sm:px-4">
        <section className="relative z-20 rounded-[22px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 shadow-[0_10px_28px_rgba(20,43,95,0.09)] mn-panel ">
          <div className="grid grid-cols-2 gap-2">
            <Fact icon={Globe2} label="اللغة" value={course.language} />
            <Fact icon={GraduationCap} label="المستوى" value={course.level} />
            <Fact icon={Clock3} label="مدة الدورة" value={course.duration} />
            <Fact icon={Award} label="نوع الشهادة" value={course.certificateType} />
          </div>
        </section>

        <section className="rounded-[20px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 shadow-sm mn-panel ">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--mn-primary)]/10">
              <Layers3 className="h-4 w-4 text-[var(--mn-heading)]" />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-[var(--mn-heading)]">معلومات الدورة</h2>
              <p className="text-[9px] font-bold text-[var(--mn-text-muted)]">البيانات المستوردة من المصدر الرسمي</p>
            </div>
          </div>

          <div className="divide-y divide-[var(--mn-border)] rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)]/60 px-3">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[10px] font-bold text-[var(--mn-text-muted)]">المنصة / الجامعة</span>
              <span className="text-left text-[10.5px] font-black text-[var(--mn-heading)]">{course.provider}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[10px] font-bold text-[var(--mn-text-muted)]">مجانية الدراسة</span>
              <span className="text-[10.5px] font-black text-[var(--mn-success-text)]">{course.studyFree ? 'نعم — مجانية' : 'لا'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[10px] font-bold text-[var(--mn-text-muted)]">الشهادة المجانية</span>
              <span className="text-[10.5px] font-black text-[var(--mn-success-text)]">{course.freeCertificate ? 'نعم — مجانية' : 'غير متوفرة'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[10px] font-bold text-[var(--mn-text-muted)]">نوع الشهادة</span>
              <span className="text-left text-[10.5px] font-black text-[var(--mn-heading)]">{course.certificateType}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 shadow-sm mn-panel ">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--mn-primary)]/10">
              <BookOpen className="h-4 w-4 text-[var(--mn-heading)]" />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-[var(--mn-heading)]">موضوعات الدورة</h2>
              <p className="text-[9px] font-bold text-[var(--mn-text-muted)]">أبرز الموضوعات المسجلة في ملف الدورة</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {course.topics.map((topic) => (
              <div key={topic} className="flex min-h-[48px] items-center gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)]/80 px-2.5 py-2 mn-panel ">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--mn-accent-text)]" />
                <span className="text-[10px] font-extrabold leading-4 text-[var(--mn-text)]">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        {(course.relatedMajors?.length ||
          course.relatedUniversities?.length ||
          course.relatedScholarships?.length ||
          course.relatedCountries?.length ||
          course.relatedExams?.length) ? (
          <section className="rounded-[20px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 shadow-sm mn-panel ">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--mn-primary)]/10">
                <Compass className="h-4 w-4 text-[var(--mn-heading)]" />
              </div>
              <div>
                <h2 className="text-[13px] font-black text-[var(--mn-heading)]">روابط تعليمية مرتبطة</h2>
                <p className="text-[9px] font-bold text-[var(--mn-text-muted)]">انتقل إلى الكيانات المرتبطة داخل منارتك</p>
              </div>
            </div>

            <div className="space-y-3">
              {course.relatedMajors?.length ? (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-black text-[var(--mn-text-muted)]">
                    <GraduationCap className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" />
                    <span>تخصصات مرتبطة</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {course.relatedMajors.map((item) => (
                      <button
                        key={`${item.id ?? item.name}-major`}
                        type="button"
                        disabled={!item.id || !onOpenMajor}
                        onClick={() => item.id && onOpenMajor?.(item.id)}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)]/75 px-3 py-2.5 text-right transition-all enabled:hover:border-[var(--mn-border-gold)] enabled:hover:bg-[var(--mn-surface)] disabled:cursor-default enabled:hover:mn-panel "
                      >
                        <div className="min-w-0">
                          <div className="text-[10.5px] font-black text-[var(--mn-heading)]">{item.name}</div>
                          {item.meta && <div className="mt-0.5 text-[8.5px] font-bold leading-4 text-[var(--mn-text-muted)]">{item.meta}</div>}
                        </div>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[var(--mn-accent-text)] transition-transform group-enabled:group-hover:-translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {course.relatedUniversities?.length ? (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-black text-[var(--mn-text-muted)]">
                    <Building2 className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" />
                    <span>جامعات مرتبطة</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {course.relatedUniversities.map((item) => (
                      <button key={`${item.id ?? item.name}-university`} type="button" disabled={!item.id || !onOpenUniversity} onClick={() => item.id && onOpenUniversity?.(item.id)} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)]/75 px-3 py-2.5 text-right transition-all enabled:hover:border-[var(--mn-border-gold)] enabled:hover:bg-[var(--mn-surface)] disabled:cursor-default enabled:hover:mn-panel ">
                        <div className="min-w-0"><div className="text-[10.5px] font-black text-[var(--mn-heading)]">{item.name}</div>{item.meta && <div className="mt-0.5 text-[8.5px] font-bold leading-4 text-[var(--mn-text-muted)]">{item.meta}</div>}</div>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[var(--mn-accent-text)]" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {course.relatedScholarships?.length ? (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-black text-[var(--mn-text-muted)]"><Award className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" /><span>منح مرتبطة</span></div>
                  <div className="grid grid-cols-1 gap-2">
                    {course.relatedScholarships.map((item) => (
                      <button key={`${item.id ?? item.name}-scholarship`} type="button" disabled={!item.id || !onOpenScholarship} onClick={() => item.id && onOpenScholarship?.(item.id)} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)]/75 px-3 py-2.5 text-right transition-all enabled:hover:border-[var(--mn-border-gold)] enabled:hover:bg-[var(--mn-surface)] disabled:cursor-default enabled:hover:mn-panel ">
                        <div className="min-w-0"><div className="text-[10.5px] font-black text-[var(--mn-heading)]">{item.name}</div>{item.meta && <div className="mt-0.5 text-[8.5px] font-bold leading-4 text-[var(--mn-text-muted)]">{item.meta}</div>}</div>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[var(--mn-accent-text)]" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {course.relatedCountries?.length ? (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-black text-[var(--mn-text-muted)]"><Globe2 className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" /><span>دول مرتبطة</span></div>
                  <div className="grid grid-cols-1 gap-2">
                    {course.relatedCountries.map((item) => (
                      <button key={`${item.id ?? item.name}-country`} type="button" disabled={!onOpenCountry} onClick={() => onOpenCountry?.(item.name)} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)]/75 px-3 py-2.5 text-right transition-all enabled:hover:border-[var(--mn-border-gold)] enabled:hover:bg-[var(--mn-surface)] disabled:cursor-default enabled:hover:mn-panel ">
                        <div className="min-w-0"><div className="text-[10.5px] font-black text-[var(--mn-heading)]">{item.name}</div>{item.meta && <div className="mt-0.5 text-[8.5px] font-bold leading-4 text-[var(--mn-text-muted)]">{item.meta}</div>}</div>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[var(--mn-accent-text)]" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {course.relatedExams?.length ? (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-black text-[var(--mn-text-muted)]"><ShieldCheck className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" /><span>اختبارات مرتبطة</span></div>
                  <div className="grid grid-cols-1 gap-2">
                    {course.relatedExams.map((item) => (
                      <button key={`${item.id ?? item.name}-exam`} type="button" disabled={!item.id || !onOpenExam} onClick={() => item.id && onOpenExam?.(item.id)} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)]/75 px-3 py-2.5 text-right transition-all enabled:hover:border-[var(--mn-border-gold)] enabled:hover:bg-[var(--mn-surface)] disabled:cursor-default enabled:hover:mn-panel ">
                        <div className="min-w-0"><div className="text-[10.5px] font-black text-[var(--mn-heading)]">{item.name}</div>{item.meta && <div className="mt-0.5 text-[8.5px] font-bold leading-4 text-[var(--mn-text-muted)]">{item.meta}</div>}</div>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[var(--mn-accent-text)]" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-[20px] border border-[var(--mn-border-gold)] bg-gradient-to-br from-[var(--mn-gold-surface)]/70 to-[var(--mn-surface)] p-3.5 shadow-sm">
          <div className="mb-3 flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--mn-primary)] shadow-sm mn-inverse ">
              <ShieldCheck className="h-4.5 w-4.5 text-[var(--mn-accent-text)]" />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-[var(--mn-heading)]">المصدر الرسمي للدورة</h2>
              <p className="mt-0.5 text-[9.5px] font-semibold leading-4 text-[var(--mn-text-muted)]">
                {course.freeCertificate
                  ? `ستنتقل إلى صفحة الدورة المباشرة على ${course.provider} للدراسة وإكمال متطلبات الشهادة.`
                  : `ستنتقل إلى صفحة الدورة المباشرة على ${course.provider} للدراسة من المصدر الرسمي.`}
              </p>
            </div>
          </div>

          <a
            href={course.directCourseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between rounded-2xl bg-[var(--mn-primary)] px-4 py-3 text-white shadow-[0_8px_18px_rgba(20,43,95,0.22)] transition-transform active:scale-[0.99] mn-inverse "
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-[var(--mn-accent-text)]" />
              <span className="text-[12px] font-black">ابدأ الدورة</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-[var(--mn-accent-text)]" />
          </a>

          <p className="mt-2 text-center text-[8.5px] font-bold text-[var(--mn-text-muted)]">رابط مباشر إلى صفحة الدورة الرسمية — يفتح في نافذة جديدة</p>
        </section>
      </main>
    </div>
  );
};

