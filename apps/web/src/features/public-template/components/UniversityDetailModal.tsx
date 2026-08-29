import React from 'react';
import {
  ExternalLink,
  Heart,
  MapPin,
  Landmark,
  Calendar,
  Building2,
  ChevronRight,
  ArrowRight,
  Layers,
  Trophy,
  GraduationCap,
  Languages,
  Clock,
  Sparkles,
  BookOpen,
  Star,
  Globe,
  FileText,
  HeartPulse,
  Settings,
  Scale,
  Users,
  Monitor,
  Award,
  PenLine,
  CheckCircle2,
  ArrowUpRight,
  Send,
  UserCheck,
  Coins,
  Stethoscope,
  Wrench,
  Banknote,
  Info,
  Phone,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { University } from '../types';

interface UniversityDetailModalProps {
  university: University;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

export const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({
  university,
  onClose,
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <div
      className="w-full bg-slate-50 dark:bg-[var(--mn-page)] animate-fade-in font-['Cairo',sans-serif] min-h-screen"
      dir="rtl"
    >
      {/* 1. القسم الأول: رأس الصفحة الملتصق بالهيدر والجوانب */}
      <div className="w-full bg-gradient-to-b from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] dark:from-[#02101c] dark:via-[#041d34] dark:to-[#02101c] pt-3 pb-4 border-b-[3px] border-[var(--mn-accent)]/70 relative z-10 shadow-md overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-left dot grid */}
          <div className="absolute top-2 left-4 grid grid-cols-5 gap-1.5 opacity-20">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[var(--mn-accent)]" />
            ))}
          </div>

          {/* Thin gold curved orbital line on left */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border border-[var(--mn-accent)]/25 pointer-events-none" />
          <div className="absolute -top-4 -left-4 w-60 h-60 rounded-full border border-[var(--mn-accent)]/15 pointer-events-none" />

          {/* University / Academic Building silhouette on right in transparent shade */}
          <svg
            className="absolute -right-6 bottom-0 h-44 w-44 text-[#001C33]/40 pointer-events-none"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            {/* Columns and Pediment (Academic building) */}
            <polygon points="100,30 40,80 160,80" />
            <rect x="50" y="80" width="15" height="120" />
            <rect x="85" y="80" width="15" height="120" />
            <rect x="120" y="80" width="15" height="120" />
            <rect x="40" y="180" width="130" height="20" />
          </svg>

          {/* Lower Curved Gold Swirl */}
          <svg
            className="absolute bottom-0 inset-x-0 w-full h-10 opacity-30"
            viewBox="0 0 500 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-20,70 Q250,-20 520,70"
              stroke="var(--mn-accent)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-3 relative z-10">
          {/* البيانات العلوية: الشعار، الاسم، زر المفضلة */}
          <div className="flex justify-between items-start mt-1">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* المربع حق العلم مع خط ذهبي */}
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/10 rounded-xl flex items-center justify-center text-2xl sm:text-3xl border border-[var(--mn-accent)] shrink-0 shadow-sm backdrop-blur-sm">
                {university.countryFlag}
              </div>
              <div className="flex flex-col pt-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm flex items-baseline gap-2 flex-wrap">
                  <span>{university.name}</span>
                  <span className="text-sm sm:text-base text-[var(--mn-accent-text)] font-bold opacity-90">
                    ({university.nameEn.replace('University of ', '').replace(' University', '')})
                  </span>
                </h1>
              </div>
            </div>
            <button
              onClick={onToggleSave}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border shrink-0 ${
                isSaved
                  ? 'bg-red-500/20 border-red-500/40'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 backdrop-blur-sm'
              }`}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </button>
          </div>

          {/* 4 عناصر بيانات - تم تحويلها لعرض طولي/شبكي (2x2) لمنع اختفاء النص */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 border-t border-white/10 pt-3 mt-1">
            <div className="bg-[var(--mn-surface-elevated)]/95 backdrop-blur-sm w-full rounded-lg py-1.5 px-2.5 flex flex-col sm:flex-row items-center text-center sm:text-right gap-1.5 shadow-sm border border-slate-200">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--mn-accent-text)] shrink-0" />
              <span className="text-[10px] sm:text-[11.5px] text-[var(--mn-heading)] font-bold leading-snug">
                {university.country}
                {university.city ? `، ${university.city}` : ''}
              </span>
            </div>

            <div className="bg-[var(--mn-surface-elevated)]/95 backdrop-blur-sm w-full rounded-lg py-1.5 px-2.5 flex flex-col sm:flex-row items-center text-center sm:text-right gap-1.5 shadow-sm border border-slate-200">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--mn-accent-text)] shrink-0" />
              <span className="text-[10px] sm:text-[11.5px] text-[var(--mn-heading)] font-bold leading-snug">
                {university.ownership || 'حكومية'}
              </span>
            </div>

            <div className="bg-[var(--mn-surface-elevated)]/95 backdrop-blur-sm w-full rounded-lg py-1.5 px-2.5 flex flex-col sm:flex-row items-center text-center sm:text-right gap-1.5 shadow-sm border border-slate-200">
              <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--mn-accent-text)] shrink-0" />
              <span className="text-[10px] sm:text-[11.5px] text-[var(--mn-heading)] font-bold leading-snug">
                {university.type || 'جامعة'}
              </span>
            </div>

            <div className="bg-[var(--mn-surface-elevated)]/95 backdrop-blur-sm w-full rounded-lg py-1.5 px-2.5 flex flex-col sm:flex-row items-center text-center sm:text-right gap-1.5 shadow-sm border border-slate-200">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--mn-accent-text)] shrink-0" />
              <span className="text-[10px] sm:text-[11.5px] text-[var(--mn-heading)] font-bold leading-snug">
                {university.foundationYear || '1096'}
              </span>
            </div>
          </div>

          {/* زر الموقع الرسمي - لون أبيض وخط أخضر وحجم أصغر */}
          {university.websiteUrl ? (
            <div className="w-full flex justify-center mt-1">
              <a
                href={university.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-2/3 bg-[var(--mn-surface-muted)] hover:bg-slate-50 text-[var(--mn-heading)] rounded-lg py-2 flex items-center justify-center gap-2 font-black text-[11px] sm:text-xs transition-colors shadow-sm border border-[var(--mn-border-brand)]/20"
              >
                <span>الموقع الرسمي للجامعة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="w-full flex justify-center mt-1">
              <div className="w-full sm:w-2/3 bg-white/10 text-white/60 rounded-lg py-2 flex items-center justify-center gap-2 font-bold text-[11px] sm:text-xs border border-white/10">
                <span>الموقع الرسمي غير متوفر</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. استكمال باقي الصفحة (الأقسام الـ 11) */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 flex flex-col gap-6">
        {/* القسم الأول: نبذة عن الجامعة */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 sm:h-5 bg-[var(--mn-accent)] rounded-full"></div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight font-['Cairo',sans-serif]">
              نبذة عن الجامعة
            </h2>
          </div>

          <div className="bg-[var(--mn-surface-muted)] rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden">
            {/* زخرفة خلفية ناعمة */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-slate-100/50 rounded-bl-full -z-10 opacity-70"></div>

            <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-700 leading-[2] text-justify font-['Cairo',sans-serif] whitespace-pre-line">
              {university.description}
            </p>
          </div>
        </section>

        {/* القسم الثاني: التصنيفات العالمية — تصميم احترافي فاخر ملتصق بالجوانب ومتناسق مع باقي الأقسام */}
        {university.rankings && university.rankings.length > 0 && (
          <div
            className="relative -mx-4 sm:-mx-6 bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)] border-y border-[var(--mn-border-brand)]/30 dark:border-[var(--mn-border)] shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden"
            dir="rtl"
          >
            {/* خط التزيين العلوي المتدرج */}
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] dark:via-[var(--mn-accent-soft)] to-transparent z-10" />

            {/* الترويسة الفاخرة للقسم */}
            <div className="flex flex-col items-center justify-center pt-4 pb-3 px-4 bg-gradient-to-b from-slate-50/90 dark:from-[#062038] to-[var(--mn-surface)] dark:to-[#041628] border-b border-[#F2E8D5] dark:border-[var(--mn-border)]">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/15 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                  <Trophy className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                </div>
                <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                  التصنيفات والاعتمادات الأكاديمية العالمية
                </h2>
              </div>
              {/* الخط الذهبي المشع في المنتصف */}
              <div className="w-[160px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
            </div>

            {/* المحتوى الداخلي لقائمة التصنيفات */}
            <div className="p-4 sm:p-5 space-y-2.5 font-['Cairo',sans-serif]">
              {university.rankings.map((ranking, idx) => {
                const rankNum = ranking.rank.replace('#', '').replace('عالميًا', '').trim();
                return (
                  <div
                    key={idx}
                    className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] rounded-2xl border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] p-3 sm:p-3.5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 relative overflow-hidden group"
                  >
                    {/* Right / Start: Accent bar + Rank Pill */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Left vertical emerald/gold accent curve */}
                      <div className="w-1.5 h-9 bg-gradient-to-b from-[var(--mn-primary)] to-[var(--mn-accent-soft)] rounded-full shrink-0" />

                      {/* Rank Pill with Trophy */}
                      <div className="bg-[var(--mn-page)] dark:bg-[var(--mn-surface)] border border-[#E9DCBF] dark:border-[var(--mn-accent)]/30 rounded-full py-1 px-3 flex items-center gap-2 shadow-2xs">
                        <div className="w-6 h-6 rounded-full bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)]/20 flex items-center justify-center text-[#E6CA65] dark:text-[var(--mn-accent-text)] shrink-0">
                          <Trophy className="w-3.5 h-3.5 text-[#E6CA65] dark:text-[var(--mn-accent-text)]" />
                        </div>
                        <span className="text-xs sm:text-[12.5px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
                          {rankNum} عالميًا
                        </span>
                      </div>
                    </div>

                    {/* Middle: Ranking Name & Edition Year */}
                    <div className="flex flex-col items-start text-right flex-1 min-w-0 px-2">
                      {ranking.link ? (
                        <a
                          href={ranking.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-[12.5px] font-bold text-slate-800 dark:text-slate-100 hover:text-[var(--mn-heading)] dark:hover:text-[var(--mn-accent-text)] transition-colors font-['Cairo',sans-serif] leading-snug line-clamp-1"
                        >
                          {ranking.name}
                        </a>
                      ) : (
                        <h3 className="text-xs sm:text-[12.5px] font-bold text-slate-800 dark:text-slate-100 font-['Cairo',sans-serif] leading-snug line-clamp-1">
                          {ranking.name}
                        </h3>
                      )}
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium font-['Cairo',sans-serif] mt-0.5">
                        إصدار {ranking.year}
                      </span>
                    </div>

                    {/* Left / End: External Link Icon */}
                    <div className="shrink-0">
                      {ranking.link ? (
                        <a
                          href={ranking.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[var(--mn-heading)] dark:hover:text-[var(--mn-accent-text)] hover:bg-slate-50 dark:hover:bg-[var(--mn-surface-muted)] transition-colors"
                          title="زيارة صفحة التصنيف"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* القسم الثالث: الدراسة والتخصصات — تصميم احترافي فاخر ملتصق بالجوانب ومتنوع الأنماط */}
        {university.studyPrograms && (
          <div
            className="relative -mx-4 sm:-mx-6 bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)] border-y border-[var(--mn-border-brand)]/30 dark:border-[var(--mn-border)] shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden"
            dir="rtl"
          >
            {/* خط التزيين العلوي المتدرج */}
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] dark:via-[var(--mn-accent-soft)] to-transparent z-10" />

            {/* الترويسة الفاخرة للقسم */}
            <div className="flex flex-col items-center justify-center pt-4 pb-3 px-4 bg-gradient-to-b from-slate-50/90 dark:from-[#062038] to-[var(--mn-surface)] dark:to-[#041628] border-b border-[#F2E8D5] dark:border-[var(--mn-border)]">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/15 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                </div>
                <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                  الدراسة والتخصصات والبرامج الأكاديمية
                </h2>
              </div>
              {/* الخط الذهبي المشع في المنتصف */}
              <div className="w-[160px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
            </div>

            {/* المحتوى الداخلي المتنوع الأنماط والتفاصيل */}
            <div className="p-4 sm:p-5 space-y-4 font-['Cairo',sans-serif]">
              {/* 1. الدرجات التعليمية المتاحة */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50/90 dark:from-[#072440] via-white dark:via-[#082848] to-amber-50/20 dark:to-[var(--mn-surface-muted)] border border-[#F2E8D5] dark:border-[var(--mn-border)] space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/20 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
                    الدرجات التعليمية المتاحة للقبول والدراسة
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-accent)]/40 dark:border-[var(--mn-accent)]/30 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-xl text-[11px] sm:text-[11.5px] font-bold flex items-center gap-2 shadow-2xs hover:border-[var(--mn-border-brand)] transition-all font-['Cairo',sans-serif]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] shrink-0" />
                    <span>بكالوريوس</span>
                  </div>
                  <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-accent)]/40 dark:border-[var(--mn-accent)]/30 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-xl text-[11px] sm:text-[11.5px] font-bold flex items-center gap-2 shadow-2xs hover:border-[var(--mn-border-brand)] transition-all font-['Cairo',sans-serif]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] shrink-0" />
                    <span>ماجستير</span>
                  </div>
                  <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-accent)]/40 dark:border-[var(--mn-accent)]/30 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-xl text-[11px] sm:text-[11.5px] font-bold flex items-center gap-2 shadow-2xs hover:border-[var(--mn-border-brand)] transition-all font-['Cairo',sans-serif]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] shrink-0" />
                    <span>دكتوراه</span>
                  </div>
                  <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-accent)]/40 dark:border-[var(--mn-accent)]/30 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-xl text-[11px] sm:text-[11.5px] font-bold flex items-center gap-2 shadow-2xs hover:border-[var(--mn-border-brand)] transition-all font-['Cairo',sans-serif]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] shrink-0" />
                    <span>دبلومات وشهادات دراسات عليا</span>
                  </div>
                </div>
              </div>

              {/* 2. الكليات والأقسام الأكاديمية — مطابقة لتصميم مجالات العمل بعد الدكتوراه */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pr-1">
                  <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 dark:bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                    الكليات والأقسام الأكاديمية الرئيسية
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-right pt-0.5">
                  {[
                    'الطب والعلوم الطبية',
                    'الهندسة والعلوم والرياضيات',
                    'القانون والدراسات القانونية',
                    'العلوم الإنسانية واللغات',
                    'العلوم الاجتماعية والإدارة',
                    'علوم الحاسب والذكاء الاصطناعي',
                  ].map((faculty, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[#F2E8D5]/80 dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)] hover:bg-slate-50/40 dark:hover:bg-[var(--mn-surface-muted)] hover:shadow-2xs transition-all duration-200 group text-right"
                    >
                      <div className="w-2 h-[2.5px] bg-[var(--mn-primary)]/80 dark:bg-[var(--mn-accent)] group-hover:bg-[var(--mn-primary)] dark:group-hover:bg-[var(--mn-accent)] group-hover:w-3.5 transition-all duration-300 shrink-0 mt-1.5 rounded-full" />
                      <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors font-['Cairo',sans-serif]">
                        {faculty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. أهم التخصصات الرائدة */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 pr-1">
                  <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 dark:bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
                    أبرز التخصصات الأكاديمية الرائدة بالجامعة
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'الطب البشري والسريري',
                    'علوم الحاسب والبرمجة',
                    'الهندسة والتكنولوجيا',
                    'القانون والتشريع',
                    'الاقتصاد والإدارة والمالية',
                    'الرياضيات والإحصاء',
                    'الفيزياء والعلوم الدقيقة',
                    'الفلسفة والسياسة والاقتصاد (PPE)',
                  ].map((name, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gradient-to-b from-[var(--mn-surface)] dark:from-[var(--mn-surface-elevated)] to-slate-50/60 dark:to-[var(--mn-surface-muted)] border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)] text-right flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] group-hover:scale-125 transition-transform shrink-0" />
                      <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors leading-snug font-['Cairo',sans-serif]">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. أنماط الدراسة والحضور */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 pr-1">
                  <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 dark:bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                    أنماط الدراسة والحضور
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-right pt-0.5">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[#F2E8D5]/80 dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)] transition-all group">
                    <div className="w-2 h-[2.5px] bg-[var(--mn-primary)]/80 dark:bg-[var(--mn-accent)] group-hover:bg-[var(--mn-primary)] dark:group-hover:bg-[var(--mn-accent)] group-hover:w-3.5 transition-all duration-300 shrink-0 rounded-full" />
                    <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors font-['Cairo',sans-serif]">
                      حضوري بالحرم الجامعي (دوام كامل)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[#F2E8D5]/80 dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)] transition-all group">
                    <div className="w-2 h-[2.5px] bg-[var(--mn-primary)]/80 dark:bg-[var(--mn-accent)] group-hover:bg-[var(--mn-primary)] dark:group-hover:bg-[var(--mn-accent)] group-hover:w-3.5 transition-all duration-300 shrink-0 rounded-full" />
                    <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors font-['Cairo',sans-serif]">
                      دوام جزئي (لبعض برامج الدراسات العليا)
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. لغة التدريس */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 pr-1">
                  <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 dark:bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <Globe className="w-3.5 h-3.5 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                    لغات التدريس المعتمدة
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] border border-[#F2E8D5]/80 dark:border-[var(--mn-border)] flex items-center gap-3 text-right">
                  <div className="w-2 h-[2.5px] bg-[var(--mn-primary)]/80 dark:bg-[var(--mn-accent)] shrink-0 rounded-full" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
                      اللغة الإنجليزية:
                    </span>
                    <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-600 dark:text-slate-300 font-['Cairo',sans-serif]">
                      جميع البرامج والمحاضرات والأبحاث تُقدّم باللغة الإنجليزية بالكامل.
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. زر الدليل الرسمي المباشر */}
              <div className="pt-1">
                <a
                  href={
                    university.studyPrograms.undergradDirectoryUrl ||
                    'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] hover:from-[var(--mn-primary)] hover:to-[var(--mn-primary-hover)] text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-2 shadow-sm shadow-[var(--mn-primary)]/20 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer font-['Cairo',sans-serif]"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                  <span>استكشف دليل البرامج والتخصصات الرسمي للجامعة ↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* القسم الرابع: القبول للطلاب الدوليين — تصميم مطابق تماماً لتصميم قسم الدراسة والتخصصات */}
        <div
          className="relative -mx-4 sm:-mx-6 bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)] border-y border-[var(--mn-border-brand)]/30 dark:border-[var(--mn-border)] shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden"
          dir="rtl"
        >
          {/* خط التزيين الأزرق العلوي المتدرج */}
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] dark:via-[var(--mn-accent-soft)] to-transparent z-10" />

          {/* الترويسة الفاخرة للقسم */}
          <div className="flex flex-col items-center justify-center pt-4 pb-3 px-4 bg-gradient-to-b from-slate-50/90 dark:from-[#062038] to-[var(--mn-surface)] dark:to-[#041628] border-b border-[#F2E8D5] dark:border-[var(--mn-border)]">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/15 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Globe className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
              </div>
              <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                القبول والتسجيل للطلاب الدوليين
              </h2>
            </div>
            {/* الخط الذهبي المشع في المنتصف */}
            <div className="w-[160px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          {/* المحتوى الداخلي لقسم القبول والتسجيل */}
          <div className="p-4 sm:p-5 space-y-4 font-['Cairo',sans-serif]">
            {/* 1. هل تقبل الجامعة طلابًا دوليين؟ */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50/90 dark:from-[#072440] via-white dark:via-[#082848] to-blue-50/30 dark:to-[var(--mn-surface-muted)] border border-[#F2E8D5] dark:border-[var(--mn-border)] space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/20 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
                  هل تقبل الجامعة طلابًا دوليين؟
                </span>
              </div>

              <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed pr-8 font-['Cairo',sans-serif]">
                {university.internationalAdmissions?.acceptsDescription ||
                  `نعم، ترحب ${university.name} بالطلاب والباحثين الدوليين من مختلف دول العالم، وتوفر لهم بيئة أكاديمية متكاملة وإرشادات خاصة بالتأشيرات والإقامة والمنح.`}
              </p>
            </div>

            {/* 2. بوابات وروابط التقديم الرسمية */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 pr-1">
                <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 dark:bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                </div>
                <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                  روابط وبوابات التقديم الرسمية المعتمدة
                </span>
              </div>

              {/* شبكة روابط القبول المعتمدة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-0.5">
                {/* 1. قبول البكالوريوس */}
                <a
                  href={
                    university.internationalAdmissions?.undergradAdmissionUrl ||
                    university.studyPrograms?.undergradDirectoryUrl ||
                    university.websiteUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] hover:bg-slate-50/80 dark:hover:bg-[var(--mn-surface-muted)] rounded-2xl p-3 border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] shadow-2xs hover:shadow-xs transition-all flex sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-2.5 text-right"
                >
                  <div className="flex items-center sm:w-full justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50/80 dark:bg-blue-900/30 group-hover:bg-[var(--mn-primary)] dark:group-hover:bg-[var(--mn-accent)] text-[var(--mn-heading)] dark:text-blue-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="hidden sm:flex w-6 h-6 rounded-lg bg-slate-100 dark:bg-[var(--mn-surface)] group-hover:bg-[var(--mn-primary)]/10 dark:group-hover:bg-[var(--mn-accent)]/20 text-slate-400 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] items-center justify-center shrink-0 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 sm:flex-initial sm:w-full">
                    <span className="text-[11.5px] sm:text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors leading-tight truncate">
                      قبول البكالوريوس
                    </span>
                    <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      متطلبات المرحلة الجامعية
                    </span>
                  </div>
                  <div className="sm:hidden w-7 h-7 rounded-lg bg-slate-100 dark:bg-[var(--mn-surface)] group-hover:bg-[var(--mn-primary)]/10 dark:group-hover:bg-[var(--mn-accent)]/20 text-slate-400 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] flex items-center justify-center shrink-0 transition-colors">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </a>

                {/* 2. قبول الدراسات العليا */}
                <a
                  href={
                    university.internationalAdmissions?.postgradAdmissionUrl ||
                    university.studyPrograms?.postgradDirectoryUrl ||
                    university.websiteUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] hover:bg-slate-50/80 dark:hover:bg-[var(--mn-surface-muted)] rounded-2xl p-3 border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] shadow-2xs hover:shadow-xs transition-all flex sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-2.5 text-right"
                >
                  <div className="flex items-center sm:w-full justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50/80 dark:bg-amber-900/30 group-hover:bg-[var(--mn-accent)] text-[var(--mn-accent-text)] group-hover:text-white dark:group-hover:text-slate-900 transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="hidden sm:flex w-6 h-6 rounded-lg bg-slate-100 dark:bg-[var(--mn-surface)] group-hover:bg-[var(--mn-primary)]/10 dark:group-hover:bg-[var(--mn-accent)]/20 text-slate-400 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] items-center justify-center shrink-0 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 sm:flex-initial sm:w-full">
                    <span className="text-[11.5px] sm:text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors leading-tight truncate">
                      قبول الدراسات العليا
                    </span>
                    <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      الماجستير والدكتوراه والأبحاث
                    </span>
                  </div>
                  <div className="sm:hidden w-7 h-7 rounded-lg bg-slate-100 dark:bg-[var(--mn-surface)] group-hover:bg-[var(--mn-primary)]/10 dark:group-hover:bg-[var(--mn-accent)]/20 text-slate-400 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] flex items-center justify-center shrink-0 transition-colors">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </a>

                {/* 3. صفحة قبول الطلاب الدوليين */}
                <a
                  href={
                    university.internationalAdmissions?.internationalStudentsUrl ||
                    university.websiteUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] hover:bg-slate-50/80 dark:hover:bg-[var(--mn-surface-muted)] rounded-2xl p-3 border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] shadow-2xs hover:shadow-xs transition-all flex sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-2.5 text-right"
                >
                  <div className="flex items-center sm:w-full justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/30 group-hover:bg-emerald-600 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="hidden sm:flex w-6 h-6 rounded-lg bg-slate-100 dark:bg-[var(--mn-surface)] group-hover:bg-[var(--mn-primary)]/10 dark:group-hover:bg-[var(--mn-accent)]/20 text-slate-400 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] items-center justify-center shrink-0 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 sm:flex-initial sm:w-full">
                    <span className="text-[11.5px] sm:text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] transition-colors leading-tight truncate">
                      صفحة الطلاب الدوليين
                    </span>
                    <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      دليل الوافدين والتأشيرة
                    </span>
                  </div>
                  <div className="sm:hidden w-7 h-7 rounded-lg bg-slate-100 dark:bg-[var(--mn-surface)] group-hover:bg-[var(--mn-primary)]/10 dark:group-hover:bg-[var(--mn-accent)]/20 text-slate-400 group-hover:text-[var(--mn-heading)] dark:group-hover:text-[var(--mn-accent-text)] flex items-center justify-center shrink-0 transition-colors">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </a>
              </div>
            </div>

            {/* زر بوابة التقديم الرسمية المباشر الممتد (مطابق تماماً لزر استكشف دليل...) */}
            <div className="pt-1">
              <a
                href={
                  university.internationalAdmissions?.applicationPortalUrl || university.websiteUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] hover:from-[var(--mn-primary)] hover:to-[var(--mn-primary-hover)] text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-2 shadow-sm shadow-[var(--mn-primary)]/20 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer font-['Cairo',sans-serif]"
              >
                <Globe className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                <span>بوابة التقديم والتسجيل الرسمية للجامعة ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* القسم الأخير: الرسوم الدراسية وتكاليف الدراسة */}
        {university.tuitionFees && (
          <div
            className="relative -mx-4 sm:-mx-6 bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)] border-y border-[var(--mn-border-brand)]/30 dark:border-[var(--mn-border)] shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden"
            dir="rtl"
          >
            {/* خط التزيين العلوي المتدرج */}
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] dark:via-[var(--mn-accent-soft)] to-transparent z-10" />

            {/* الترويسة الفاخرة للقسم */}
            <div className="flex flex-col items-center justify-center pt-4 pb-3 px-4 bg-gradient-to-b from-slate-50/90 dark:from-[#062038] to-[var(--mn-surface)] dark:to-[#041628] border-b border-[#F2E8D5] dark:border-[var(--mn-border)]">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/15 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                  <Landmark className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                </div>
                <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                  الرسوم الدراسية وتكاليف الدراسة
                </h2>
              </div>
              {/* الخط الذهبي المشع في المنتصف */}
              <div className="w-[160px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
            </div>

            {/* المحتوى الداخلي لقسم الرسوم */}
            <div className="p-4 sm:p-5 space-y-4 font-['Cairo',sans-serif]">
              {/* بطاقة الرسوم السنوية العامة والعملة */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 dark:from-[#072440] via-white dark:via-[#082848] to-amber-50/40 dark:to-[var(--mn-surface-muted)] border border-[#F2E8D5] dark:border-[var(--mn-border)] space-y-3 shadow-2xs relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[var(--mn-primary)]/10 dark:bg-[var(--mn-accent)]/20 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] flex items-center justify-center shrink-0">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
                      متوسط الرسوم السنوية العامة
                    </span>
                  </div>

                  {/* شارة العملة المعتمدة */}
                  <div className="bg-[var(--mn-page)] dark:bg-[var(--mn-surface)] border border-[#E9DCBF] dark:border-[var(--mn-accent)]/30 rounded-full py-0.5 px-2.5 flex items-center gap-1.5 shadow-2xs">
                    <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]">
                      العملة: {university.tuitionFees.currency}
                    </span>
                  </div>
                </div>

                {/* القيمة البارزة للرسوم */}
                {university.tuitionFees.annualAverageTuition && (
                  <div className="bg-[var(--mn-surface-elevated)]/80 dark:bg-[var(--mn-surface)]/80 rounded-xl p-3 border border-[var(--mn-border-brand)]/10 dark:border-[var(--mn-border)] flex items-center justify-between gap-3">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                      النطاق السنوي التقديري للطلاب الدوليين:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-['Cairo',sans-serif] tracking-tight">
                      {university.tuitionFees.annualAverageTuition}
                    </span>
                  </div>
                )}

                {university.tuitionFees.generalDescription && (
                  <p className="text-[10.5px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed font-['Cairo',sans-serif]">
                    {university.tuitionFees.generalDescription}
                  </p>
                )}
              </div>

              {/* شبكة رسوم التخصصات والمراحل الأكاديمية */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 pr-1">
                  <div className="w-6 h-6 rounded-full bg-[var(--mn-primary)]/5 dark:bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-3 h-3 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
                  </div>
                  <span className="text-[11.5px] sm:text-xs font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] leading-tight font-['Cairo',sans-serif]">
                    تفصيل الرسوم حسب الكلية والمرحلة
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                  {/* 1. رسوم البكالوريوس (المرحلة الجامعية) */}
                  {university.tuitionFees.undergradTuition && (
                    <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] rounded-xl border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-row items-center justify-between gap-3 relative overflow-hidden group">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--mn-primary)] to-[var(--mn-accent-soft)] rounded-full shrink-0" />
                        <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100">
                          رسوم البكالوريوس
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[var(--mn-surface)] border border-slate-200 dark:border-[var(--mn-border)] rounded-lg py-1.5 px-3 flex items-center justify-center text-center shadow-2xs shrink-0 max-w-[55%] group-hover:border-[var(--mn-border-brand)]/30 dark:group-hover:border-[var(--mn-accent)]/50 transition-colors">
                        <span className="text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] dark:text-white">
                          {university.tuitionFees.undergradTuition}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. رسوم البكالوريوس في الطب */}
                  {university.tuitionFees.medicineTuition && (
                    <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] rounded-xl border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-row items-center justify-between gap-3 relative overflow-hidden group">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--mn-primary)] to-[var(--mn-accent-soft)] rounded-full shrink-0" />
                        <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100">
                          رسوم كلية الطب
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[var(--mn-surface)] border border-slate-200 dark:border-[var(--mn-border)] rounded-lg py-1.5 px-3 flex items-center justify-center text-center shadow-2xs shrink-0 max-w-[55%] group-hover:border-[var(--mn-border-brand)]/30 dark:group-hover:border-[var(--mn-accent)]/50 transition-colors">
                        <span className="text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] dark:text-white">
                          {university.tuitionFees.medicineTuition}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3. رسوم الكليات الهندسية */}
                  {university.tuitionFees.engineeringTuition && (
                    <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] rounded-xl border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-row items-center justify-between gap-3 relative overflow-hidden group">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--mn-primary)] to-[var(--mn-accent-soft)] rounded-full shrink-0" />
                        <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100">
                          رسوم الكليات الهندسية
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[var(--mn-surface)] border border-slate-200 dark:border-[var(--mn-border)] rounded-lg py-1.5 px-3 flex items-center justify-center text-center shadow-2xs shrink-0 max-w-[55%] group-hover:border-[var(--mn-border-brand)]/30 dark:group-hover:border-[var(--mn-accent)]/50 transition-colors">
                        <span className="text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] dark:text-white">
                          {university.tuitionFees.engineeringTuition}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 4. رسوم الدراسات العليا */}
                  {university.tuitionFees.postgradTuition && (
                    <div className="bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface-elevated)] rounded-xl border border-[#F2E8D5] dark:border-[var(--mn-border)] hover:border-[var(--mn-border-brand)] dark:hover:border-[var(--mn-accent)] p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-row items-center justify-between gap-3 relative overflow-hidden group">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--mn-primary)] to-[var(--mn-accent-soft)] rounded-full shrink-0" />
                        <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 dark:text-slate-100">
                          رسوم الدراسات العليا
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[var(--mn-surface)] border border-slate-200 dark:border-[var(--mn-border)] rounded-lg py-1.5 px-3 flex items-center justify-center text-center shadow-2xs shrink-0 max-w-[55%] group-hover:border-[var(--mn-border-brand)]/30 dark:group-hover:border-[var(--mn-accent)]/50 transition-colors">
                        <span className="text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] dark:text-white">
                          {university.tuitionFees.postgradTuition}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* زر رابط الرسوم الرسمي الممتد */}
              {university.tuitionFees.officialTuitionUrl && (
                <div className="pt-1">
                  <a
                    href={university.tuitionFees.officialTuitionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] hover:from-[var(--mn-primary)] hover:to-[var(--mn-primary-hover)] text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-2 shadow-sm shadow-[var(--mn-primary)]/20 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer font-['Cairo',sans-serif]"
                  >
                    <Landmark className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                    <span>رابط جدول الرسوم والمصروفات الدراسية الرسمي للجامعة ↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* المنح الدراسية تأتي مباشرة بعد الرسوم لمساعدة الطالب على تقييم خيارات التمويل */}
        {university.scholarships && university.scholarships.length > 0 && (
          <section
            className="relative -mx-4 sm:-mx-6 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] border-b border-[var(--mn-border-brand)]/30 dark:border-[var(--mn-border)] shadow-md shadow-slate-200/40 dark:shadow-none overflow-hidden"
            dir="rtl"
            aria-labelledby="university-scholarships-title"
          >
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

            <header className="px-4 sm:px-5 pt-5 pb-3 text-center bg-gradient-to-b from-[#FAF5EA]/70 dark:from-[#082848] to-[var(--mn-surface)] dark:to-[#041628] border-b border-[#F2E8D5] dark:border-[var(--mn-border)]">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mn-accent)]/60 bg-[var(--mn-primary)] shadow-sm ring-4 ring-[var(--mn-focus)]/10">
                <Award className="h-4.5 w-4.5 text-[var(--mn-accent-text)]" />
              </div>
              <h2
                id="university-scholarships-title"
                className="text-sm sm:text-base font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]"
              >
                المنح الدراسية
              </h2>
              <p className="mx-auto mt-1.5 max-w-xl text-[10.5px] sm:text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                هل توجد منح للطلاب الدوليين؟ نعم، توفر الجامعة فرص تمويل تنافسية، وتظهر هنا منحتان
                لبناء شكل القسم والقالب.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
              {university.scholarships.slice(0, 2).map((scholarship, index) => (
                <article
                  key={scholarship.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#E9DCBF] dark:border-[var(--mn-border)] bg-gradient-to-br from-[var(--mn-surface)] via-[#FAFAFA] to-[#FAF5EA]/60 dark:from-[var(--mn-surface-elevated)] dark:via-[var(--mn-surface-elevated)] dark:to-[var(--mn-surface-muted)] p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--mn-accent)] hover:shadow-md"
                >
                  <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-[var(--mn-primary)] via-[var(--mn-accent-soft)] to-[var(--mn-secondary)]" />
                  <div className="flex items-start gap-3 pr-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--mn-accent)]/40 bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-sm">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[var(--mn-accent)]/15 px-2 py-0.5 text-[9.5px] font-black text-[var(--mn-accent-text)] dark:text-[var(--mn-accent-soft)]">
                          منحة {index + 1}
                        </span>
                        {scholarship.type && (
                          <span className="rounded-full border border-[var(--mn-border-brand)]/15 bg-blue-50 dark:bg-[var(--mn-surface)] px-2 py-0.5 text-[9.5px] font-black text-[var(--mn-heading)] dark:text-slate-100">
                            {scholarship.type}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[12px] sm:text-[13px] font-black leading-5 text-[var(--mn-heading)] dark:text-white">
                        {scholarship.name}
                      </h3>
                      {scholarship.nameEn && (
                        <p
                          className="mt-0.5 truncate text-[9.5px] font-bold text-slate-400"
                          dir="ltr"
                        >
                          {scholarship.nameEn}
                        </p>
                      )}
                    </div>
                  </div>

                  {scholarship.audience && (
                    <div className="mt-3 rounded-xl border border-slate-100 dark:border-[var(--mn-border)] bg-[var(--mn-surface-elevated)]/80 dark:bg-[var(--mn-surface)]/80 px-3 py-2">
                      <span className="block text-[9px] font-black text-[#9A7427] dark:text-[var(--mn-accent-text)]">
                        الفئة المستهدفة
                      </span>
                      <p className="mt-0.5 text-[10px] sm:text-[10.5px] font-semibold leading-5 text-slate-600 dark:text-slate-300">
                        {scholarship.audience}
                      </p>
                    </div>
                  )}

                  <a
                    href={scholarship.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] px-3 text-[10.5px] font-black text-white shadow-sm transition-all hover:from-[var(--mn-primary)] hover:to-[var(--mn-primary-hover)] active:scale-[0.99]"
                  >
                    <span>زيارة صفحة المنحة الرسمية</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        <UniversityDecisionSections university={university} />
      </div>
    </div>
  );
};

function UniversityDecisionSections({ university }: { university: University }) {
  const language = university.languageRequirements;
  const documents = university.documentRequirements;
  const housing = university.housing;
  const livingCosts = university.livingCosts;
  const contacts = university.officialContacts;
  const dataTrust = university.dataTrust;

  return (
    <div className="-mx-4 sm:-mx-6" dir="rtl">
      {language && (
        <section
          className="border-b border-[#E9DCBF] dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)]"
          aria-labelledby="language-requirements-title"
        >
          <CompactSectionHeader
            id="language-requirements-title"
            title="متطلبات اللغة"
            icon={<Languages className="h-4 w-4" />}
          />
          <div className="space-y-3 px-4 pb-4 sm:px-5">
            <div className="grid grid-cols-2 gap-2">
              <CompactFact label="هل توجد متطلبات لغة؟" value={language.required ? 'نعم' : 'لا'} />
              <CompactFact label="اللغة المطلوبة" value={language.languages.join('، ')} />
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-[var(--mn-border)] bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] p-3">
              <p className="mb-2 text-[10px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]">
                الاختبارات المقبولة
              </p>
              <div className="flex flex-wrap gap-1.5">
                {language.acceptedTests.map((test) => (
                  <span
                    key={test}
                    className="rounded-lg border border-[var(--mn-accent)]/30 bg-[var(--mn-page)] dark:bg-[var(--mn-surface)] px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200"
                  >
                    {test}
                  </span>
                ))}
              </div>
            </div>
            <OfficialInfoLink href={language.officialUrl} label="متطلبات اللغة الرسمية" />
          </div>
        </section>
      )}

      {documents && (
        <section
          className="border-b border-[#E9DCBF] dark:border-[var(--mn-border)] bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)]"
          aria-labelledby="required-documents-title"
        >
          <CompactSectionHeader
            id="required-documents-title"
            title="الوثائق المطلوبة"
            icon={<FileText className="h-4 w-4" />}
          />
          <div className="grid gap-2.5 px-4 pb-4 sm:grid-cols-2 sm:px-5">
            <DocumentList title="الوثائق العامة المطلوبة" items={documents.generalDocuments} />
            <DocumentList
              title="متطلبات إضافية للدراسات العليا"
              items={documents.graduateAdditionalDocuments}
            />
            <div className="sm:col-span-2">
              <OfficialInfoLink href={documents.officialUrl} label="دليل الوثائق الرسمي" />
            </div>
          </div>
        </section>
      )}

      {housing && (
        <section
          className="border-b border-[var(--mn-border-brand)]/30 dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)]"
          aria-labelledby="university-housing-title"
        >
          <CompactSectionHeader
            id="university-housing-title"
            title="السكن الجامعي"
            icon={<Building2 className="h-4 w-4" />}
          />
          <div className="space-y-3 px-4 pb-4 sm:px-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CompactFact label="هل يتوفر سكن؟" value={housing.available ? 'نعم' : 'لا'} />
              <CompactFact
                label="الطلاب الدوليون"
                value={housing.internationalStudentsEligible ? 'مؤهلون' : 'غير مؤهلين'}
              />
              <CompactFact label="التكلفة النموذجية" value={housing.typicalCost} />
              <CompactFact label="العملة" value={housing.currency} />
            </div>
            {housing.officialUrl && (
              <OfficialInfoLink href={housing.officialUrl} label="معلومات السكن الرسمية" />
            )}
          </div>
        </section>
      )}

      {livingCosts && (
        <section
          className="border-b border-[#E9DCBF] dark:border-[var(--mn-border)] bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)]"
          aria-labelledby="university-living-costs-title"
        >
          <CompactSectionHeader
            id="university-living-costs-title"
            title="تكاليف المعيشة"
            icon={<Banknote className="h-4 w-4" />}
          />
          <div className="space-y-2.5 px-4 pb-4 sm:px-5">
            <div className="grid grid-cols-2 gap-2">
              <CompactFact label="التكلفة الشهرية التقديرية" value={livingCosts.monthlyEstimate} />
              <CompactFact label="العملة" value={livingCosts.currency} />
            </div>
            <p className="rounded-xl border border-[#E9DCBF] bg-[var(--mn-page)] px-3 py-2 text-[9.5px] font-semibold leading-4 text-slate-600 dark:border-[var(--mn-border)] dark:bg-[var(--mn-surface)] dark:text-slate-300">
              {livingCosts.variationNote}
            </p>
            {livingCosts.officialUrl && (
              <OfficialInfoLink
                href={livingCosts.officialUrl}
                label="تفاصيل تكاليف المعيشة الرسمية"
              />
            )}
          </div>
        </section>
      )}

      {contacts && (
        <section
          className="border-b border-[#E9DCBF] bg-[var(--mn-surface-muted)] dark:border-[var(--mn-border)] dark:bg-[var(--mn-surface)]"
          aria-labelledby="university-official-contacts-title"
        >
          <CompactSectionHeader
            id="university-official-contacts-title"
            title="التواصل والروابط الرسمية"
            icon={<Phone className="h-4 w-4" />}
          />
          <div className="grid grid-cols-1 gap-1.5 px-4 pb-4 sm:grid-cols-2 sm:px-5">
            {contacts.phone && (
              <ReferenceLink
                href={`tel:${contacts.phone.replace(/\s/g, '')}`}
                label="الهاتف الرسمي"
                value={contacts.phone}
              />
            )}
            <ReferenceLink href={contacts.officialWebsite} label="الموقع الرسمي" value="ox.ac.uk" />
            {contacts.mainSocial && (
              <ReferenceLink
                href={contacts.mainSocial.url}
                label="التواصل الاجتماعي"
                value={contacts.mainSocial.label}
                icon={<Share2 className="h-3.5 w-3.5" />}
              />
            )}
            {contacts.governmentRegister && (
              <ReferenceLink
                href={contacts.governmentRegister.url}
                label="الجهة الرسمية"
                value={contacts.governmentRegister.label}
              />
            )}
            {contacts.usefulLinks?.map((link) => (
              <ReferenceLink
                key={link.url}
                href={link.url}
                label="رابط رسمي مفيد"
                value={link.label}
              />
            ))}
          </div>
        </section>
      )}

      {dataTrust && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#002E52] px-4 py-2.5 text-[9px] font-bold text-slate-200">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--mn-accent-text)]" />
            آخر تحقق من البيانات: {dataTrust.lastVerified}
          </span>
          <span className="hidden h-3 w-px bg-white/25 sm:block" />
          <a
            href={dataTrust.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F2CC72] underline-offset-2 hover:underline"
          >
            المصدر: {dataTrust.sourceLabel}
          </a>
        </div>
      )}
    </div>
  );
}

function ReferenceLink({
  href,
  label,
  value,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('tel:') ? undefined : '_blank'}
      rel={href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
      className="group flex min-h-12 items-center gap-2 rounded-xl border border-[#E9DCBF] bg-[var(--mn-surface)] px-3 py-2 transition-colors hover:border-[var(--mn-accent)] dark:border-[var(--mn-border)] dark:bg-[var(--mn-surface)]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--mn-primary)]/10 text-[var(--mn-heading)] dark:bg-[var(--mn-accent)]/10 dark:text-[var(--mn-accent-text)]">
        {icon ?? <ExternalLink className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[8.5px] font-black text-[#9A7427] dark:text-[var(--mn-accent-text)]">
          {label}
        </span>
        <span className="block text-[9.5px] font-bold leading-4 text-slate-700 group-hover:text-[var(--mn-heading)] dark:text-slate-200">
          {value}
        </span>
      </span>
    </a>
  );
}

function CompactSectionHeader({
  id,
  title,
  icon,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-center gap-2 px-4 pb-3 pt-4">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--mn-accent)]/50 bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-sm">
        {icon}
      </span>
      <h2
        id={id}
        className="text-xs sm:text-sm font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]"
      >
        {title}
      </h2>
      <span className="h-px w-10 bg-gradient-to-l from-[var(--mn-accent)] to-transparent" />
    </header>
  );
}

function CompactFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E9DCBF] dark:border-[var(--mn-border)] bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] px-2.5 py-2.5 shadow-2xs">
      <span className="block text-[9px] font-black text-[#9A7427] dark:text-[var(--mn-accent-text)]">
        {label}
      </span>
      <span className="mt-1 block text-[10px] sm:text-[10.5px] font-bold leading-4 text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

function DocumentList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#E9DCBF] dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] dark:bg-[var(--mn-surface)] p-3">
      <h3 className="mb-2 text-[10px] font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-1.5 text-[9.5px] sm:text-[10px] font-semibold leading-4 text-slate-600 dark:text-slate-300"
          >
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--mn-accent-text)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfficialInfoLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] px-3 text-[10px] font-black text-white shadow-sm transition-all hover:from-[var(--mn-primary)] hover:to-[var(--mn-primary-hover)] active:scale-[0.99]"
    >
      <span>{label}</span>
      <ExternalLink className="h-3 w-3 text-[var(--mn-accent-text)]" />
    </a>
  );
}
