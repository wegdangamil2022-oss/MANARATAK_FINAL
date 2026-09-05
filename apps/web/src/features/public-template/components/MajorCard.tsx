import React from 'react';
import {
  Heart,
  Clock,
  GraduationCap,
  School,
  Cpu,
  Microscope,
  BookOpen,
  Scale,
  Compass,
  Atom,
  Stethoscope,
  HeartPulse,
  Brain,
  Briefcase,
} from 'lucide-react';
import { Major } from '../types';

interface MajorCardProps {
  major: Major;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelectMajor?: (major: Major) => void;
}

export const MajorCard: React.FC<MajorCardProps> = ({
  major,
  isFavorited = false,
  onToggleFavorite,
  onSelectMajor,
}) => {
  // Select specialty icon in green outline style matching the design
  const renderSpecialtyIcon = () => {
    const iconClass = 'w-6 h-6 sm:w-7 sm:h-7 text-[var(--mn-heading)] stroke-[1.75]';
    const nameLower = (
      major.name +
      ' ' +
      (major.nameEn || '') +
      ' ' +
      (major.category || '')
    ).toLowerCase();

    if (
      nameLower.includes('طب') ||
      nameLower.includes('جراحة') ||
      nameLower.includes('medicine') ||
      nameLower.includes('surgery') ||
      nameLower.includes('طبي')
    ) {
      return <Stethoscope className={iconClass} />;
    }
    if (
      nameLower.includes('قلب') ||
      nameLower.includes('cardio') ||
      nameLower.includes('تمريض') ||
      nameLower.includes('nursing')
    ) {
      return <HeartPulse className={iconClass} />;
    }
    if (
      nameLower.includes('حاسوب') ||
      nameLower.includes('ذكاء') ||
      nameLower.includes('computer') ||
      nameLower.includes('ai') ||
      nameLower.includes('برمج') ||
      nameLower.includes('tech') ||
      nameLower.includes('cpu')
    ) {
      return <Cpu className={iconClass} />;
    }
    if (
      nameLower.includes('بيولوج') ||
      nameLower.includes('أحياء') ||
      nameLower.includes('جين') ||
      nameLower.includes('مختبر') ||
      nameLower.includes('microscope')
    ) {
      return <Microscope className={iconClass} />;
    }
    if (
      nameLower.includes('هندس') ||
      nameLower.includes('عمارة') ||
      nameLower.includes('engineering') ||
      nameLower.includes('civil')
    ) {
      return <Compass className={iconClass} />;
    }
    if (
      nameLower.includes('قانون') ||
      nameLower.includes('حقوق') ||
      nameLower.includes('شريعة') ||
      nameLower.includes('law')
    ) {
      return <Scale className={iconClass} />;
    }
    if (
      nameLower.includes('فيزياء') ||
      nameLower.includes('كيمياء') ||
      nameLower.includes('physics') ||
      nameLower.includes('chem') ||
      nameLower.includes('atom')
    ) {
      return <Atom className={iconClass} />;
    }
    if (
      nameLower.includes('نفس') ||
      nameLower.includes('عصب') ||
      nameLower.includes('psych') ||
      nameLower.includes('neuro')
    ) {
      return <Brain className={iconClass} />;
    }
    if (
      nameLower.includes('إدار') ||
      nameLower.includes('أعمال') ||
      nameLower.includes('مال') ||
      nameLower.includes('business') ||
      nameLower.includes('finance')
    ) {
      return <Briefcase className={iconClass} />;
    }
    return <BookOpen className={iconClass} />;
  };

  // Primary degree display: prefer canonical data, then infer from the catalog code.
  const code = (major.code || '').toUpperCase();
  const inferredDegree = code.startsWith('MAS-')
    ? 'ماجستير'
    : code.startsWith('DOC-')
      ? 'دكتوراه'
      : code.startsWith('FEL-')
        ? 'زمالة أبحاث'
        : code.startsWith('MJR-')
          ? 'بكالوريوس'
          : 'غير محدد';
  const primaryDegree =
    major.degreeLevels && major.degreeLevels.length > 0 ? major.degreeLevels[0] : inferredDegree;

  // Keep the duration badge compact without inventing a duration for postgraduate/fellowship records.
  const formatDurationYears = (dur?: string) => {
    if (!dur?.trim()) return 'حسب البرنامج';

    const normalized = dur.replace(/[–—]/g, '-');
    const numericRange = normalized.match(/(\d+)\s*(?:-|إلى|الى)\s*(\d+)\s*(?:سنوات|سنة)?/);
    if (numericRange) return `${numericRange[1]}-${numericRange[2]} سنوات`;

    if (/سنة\s*(?:-|إلى|الى)\s*سنتين/.test(normalized)) return '1-2 سنة';

    const singleYear = normalized.match(/(\d+)\s*(?:سنوات|سنة)/);
    if (singleYear) return `${singleYear[1]} ${singleYear[1] === '1' ? 'سنة' : 'سنوات'}`;

    return 'حسب البرنامج';
  };

  const durationText = formatDurationYears(major.duration);

  // Faculty/field display without fabricating a medical faculty for records that lack a category.
  const facultyCategory =
    major.category || major.academicField || major.professionalOrResearchField || 'غير مصنف';

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectMajor?.(major);
        }
      }}
      onClick={() => onSelectMajor && onSelectMajor(major)}
      className="group relative overflow-hidden bg-[var(--mn-surface)] rounded-[24px] sm:rounded-[28px] border border-[var(--mn-border-gold)] hover:border-[var(--mn-accent)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(214,164,59,0.14)] transition-all duration-300 p-3 sm:p-4 text-right cursor-pointer select-none mn-panel "
      dir="rtl"
    >
      {/* Top-Right Metallic Gold Corner Ribbon */}
      <div className="absolute top-0 right-0 w-12 sm:w-14 h-12 sm:h-14 pointer-events-none z-10">
        <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
          <path
            d="M0,0 L64,0 L64,64 C64,40 52,18 32,8 C16,2 0,0 0,0 Z"
            fill="url(#goldRibbonGrad)"
          />
          <defs>
            <linearGradient id="goldRibbonGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--mn-accent-soft)" />
              <stop offset="50%" stopColor="var(--mn-accent)" />
              <stop offset="100%" stopColor="var(--mn-accent)" />
            </linearGradient>
          </defs>
        </svg>
        {/* 4-petal flower icon in gold corner */}
        <div className="absolute top-1.5 right-1.5 text-white drop-shadow-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 6.5 8 10 3 12C8 14 12 17.5 12 22C12 17.5 16 14 21 12C16 10 12 6.5 12 2Z" />
            <circle cx="12" cy="12" r="1.5" fill="var(--mn-accent)" />
          </svg>
        </div>
      </div>

      {/* Main Card Content Layout */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-0">
        {/* Right Section: Circular Orbital Graphic + Specialty Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
          {/* Circular Graphic with Delicate Emerald Green Rings */}
          <div className="relative w-12 h-12 sm:w-15 sm:h-15 shrink-0 flex items-center justify-center">
            {/* Outer orbital track */}
            <div className="absolute inset-0 rounded-full border border-[var(--mn-border-brand)]/25 group-hover:border-[var(--mn-border-brand)]/45 transition-colors" />
            {/* Middle orbital dashed track */}
            <div className="absolute inset-1 sm:inset-1.5 rounded-full border border-dashed border-[var(--mn-border-brand)]/30 group-hover:rotate-45 transition-transform duration-700" />
            {/* Inner delicate track */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-[var(--mn-border-brand)]/20" />
            {/* Tiny green dot on orbit */}
            <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] shadow-[0_0_5px_rgba(20,43,95,0.6)] mn-inverse " />

            {/* Central Specialty Icon */}
            <div className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
              {renderSpecialtyIcon()}
            </div>
          </div>

          {/* Specialty Text & Details */}
          <div className="flex flex-col min-w-0 flex-1 space-y-1 sm:space-y-1.5">
            {/* Arabic Name & English Name */}
            <div>
              <h3 className="text-[12.5px] sm:text-[14px] font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif] group-hover:text-[var(--mn-accent-text)] transition-colors leading-snug truncate">
                {major.name}
              </h3>
              {major.nameEn && (
                <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--mn-text-muted)] font-['Cairo',sans-serif] tracking-wide truncate">
                  {major.nameEn}
                </p>
              )}
            </div>

            {/* Top Pill: Faculty / College (Golden text & Golden border/box) */}
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 bg-[var(--mn-surface)] text-[var(--mn-accent-text)] border border-[var(--mn-border-gold)] rounded-lg sm:rounded-xl px-2 py-0.5 text-[10px] font-bold font-['Cairo',sans-serif] leading-tight mn-panel ">
                <School className="w-3 h-3 text-[var(--mn-accent-text)] shrink-0" />
                <span className="truncate">{facultyCategory}</span>
              </span>
            </div>

            {/* Bottom Row Pills: Degree & Duration */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Blue Degree Pill */}
              <span className="inline-flex items-center gap-1 bg-[var(--mn-surface-muted)] text-[var(--mn-link)] border border-[var(--mn-border-brand)] rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold font-['Cairo',sans-serif] shrink-0 mn-panel ">
                <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--mn-link)] shrink-0" />
                <span>{primaryDegree}</span>
              </span>

              {/* Slate/Neutral Duration Pill */}
              <span className="inline-flex items-center gap-1 bg-[var(--mn-page)] text-[var(--mn-text)] border border-[var(--mn-border)] rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold font-['Cairo',sans-serif] shrink-0 mn-panel ">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--mn-text-muted)] shrink-0" />
                <span>{durationText}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Left Section: Favorite Top + Details Bottom */}
        <div className="flex flex-col items-center justify-between self-stretch shrink-0 py-0.5">
          {/* Favorite Heart Button (Top-Left) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(major.id);
            }}
            className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--mn-danger-soft)] text-[var(--mn-text-muted)] hover:text-[var(--mn-danger-text)] transition-all active:scale-90 cursor-pointer"
            title="أضف إلى المفضلة"
            aria-label="أضف إلى المفضلة"
          >
            <Heart
              className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-colors stroke-[2] ${
                isFavorited ? 'fill-red-500 text-[var(--mn-danger-text)]' : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-danger-text)]'
              }`}
            />
          </button>

          {/* Emerald "التفاصيل" Button (Bottom-Left) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectMajor) onSelectMajor(major);
            }}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 bg-[var(--mn-primary)] text-white border border-[var(--mn-border-brand)] hover:bg-[var(--mn-primary)] rounded-full text-[10px] font-bold shadow-[0_2px_8px_rgba(20,43,95,0.25)] hover:shadow-[0_4px_12px_rgba(20,43,95,0.35)] transition-all cursor-pointer font-['Cairo',sans-serif] active:scale-95 whitespace-nowrap mn-inverse hover:mn-inverse "
          >
            التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
};
