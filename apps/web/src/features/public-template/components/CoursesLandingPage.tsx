import React from 'react';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  ChevronLeft,
  CreditCard,
  ExternalLink,
  Globe2,
  GraduationCap,
  Layers3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react';

type CourseTrack = 'imported' | 'native' | 'paid';

type PathFeature = {
  label: string;
  icon: React.ElementType;
};

interface CoursesLandingPageProps {
  onBack?: () => void;
  onOpenTrack?: (track: CourseTrack) => void;
}

interface CoursePathCardProps {
  title: string;
  eyebrow: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  features: PathFeature[];
  footer: string;
  cta: string;
  onClick?: () => void;
}

function CoursePathCard({ title, eyebrow, badge, description, icon: Icon, features, footer, cta, onClick }: CoursePathCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-right bg-[var(--mn-surface)] rounded-[22px] border border-[var(--mn-border)] shadow-sm hover:shadow-md hover:border-[var(--mn-accent)]/45 transition-all active:scale-[0.99] overflow-hidden mn-panel "
    >
      <div className="h-1 bg-gradient-to-l from-[var(--mn-accent)] via-[var(--mn-accent-soft)] to-[var(--mn-primary)] mn-gold " />
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="w-[50px] h-[50px] rounded-2xl bg-[var(--mn-primary)]/10 border border-[var(--mn-primary)]/15 flex items-center justify-center shrink-0 shadow-inner">
            <Icon className="w-6 h-6 text-[var(--mn-heading)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[15px] sm:text-base font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif] leading-6">{title}</h3>
                <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--mn-heading)] mt-0.5">{eyebrow}</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/20 text-[9px] font-bold text-[var(--mn-accent-text)] whitespace-nowrap">{badge}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[var(--mn-text-muted)] font-semibold leading-5 mt-2">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-3">
          {features.map(({ label, icon: FeatureIcon }) => (
            <span key={label} className="min-h-8 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] px-1.5 flex items-center justify-center gap-1 text-[9px] font-semibold text-[var(--mn-text-muted)] mn-panel ">
              <FeatureIcon className="w-3.5 h-3.5 text-[var(--mn-heading)] shrink-0" />
              <span className="truncate">{label}</span>
            </span>
          ))}
        </div>

        <div className="mt-3 pt-2.5 border-t border-[var(--mn-border)] flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-[var(--mn-text-muted)] truncate">{footer}</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--mn-heading)] whitespace-nowrap">
            {cta}
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

export const CoursesLandingPage: React.FC<CoursesLandingPageProps> = ({ onBack, onOpenTrack }) => {
  return (
    <div
      className="min-h-screen bg-[var(--mn-page)] text-[var(--mn-heading)] pb-24 font-['Cairo',sans-serif] select-none mn-panel "
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* HERO SECTION - ELEGANT TRAINING COURSES THEME */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-xs border-b border-[var(--mn-accent)]/20 mn-inverse ">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Background Decorative Gold Waves & Dot Patterns */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 200"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M-50,50 Q100,-20 250,60 T550,40"
                stroke="var(--mn-accent)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M-20,120 Q150,40 300,140 T600,100"
                stroke="var(--mn-accent)"
                strokeWidth="1"
                fill="none"
              />
              <circle cx="30" cy="30" r="1" fill="var(--mn-accent)" />
              <circle cx="45" cy="30" r="1" fill="var(--mn-accent)" />
              <circle cx="60" cy="30" r="1" fill="var(--mn-accent)" />
              <circle cx="30" cy="45" r="1" fill="var(--mn-accent)" />
              <circle cx="45" cy="45" r="1" fill="var(--mn-accent)" />
              <circle cx="60" cy="45" r="1" fill="var(--mn-accent)" />
            </svg>
          </div>

          {/* Glowing Ambient Orbs */}
          <div className="absolute top-0 right-10 w-64 h-64 bg-[var(--mn-accent)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 mn-gold " />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[var(--mn-primary)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 mn-inverse " />

          {/* Subtle Floating Elements: Training Icons */}
          <style>{`
            @keyframes floatUp {
              0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
              20% { opacity: 0.15; }
              80% { opacity: 0.15; }
              100% { transform: translateY(-100px) rotate(15deg); opacity: 0; }
            }
            .course-float {
              position: absolute;
              animation: floatUp ease-in-out infinite;
              color: var(--mn-accent);
            }
          `}</style>

          <PlayCircle
            className="course-float w-16 h-16 left-[15%] top-[60%]"
            style={{ animationDuration: '10s', animationDelay: '0s' }}
          />
          <TrendingUp
            className="course-float w-12 h-12 left-[80%] top-[40%]"
            style={{ animationDuration: '12s', animationDelay: '-4s' }}
          />
          <Briefcase
            className="course-float w-10 h-10 left-[40%] top-[70%]"
            style={{ animationDuration: '14s', animationDelay: '-2s' }}
          />
          <Sparkles
            className="course-float w-8 h-8 left-[60%] top-[30%]"
            style={{ animationDuration: '9s', animationDelay: '-7s' }}
          />
        </div>

        {/* Top-Right Circular Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 bg-black/25 hover:bg-black/40 border border-white/15 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-30 cursor-pointer text-white shadow-md active:scale-95"
            title="العودة"
            aria-label="العودة"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="max-w-md sm:max-w-xl mx-auto text-center relative z-10 space-y-3 pt-6">
          {/* Main Title Container */}
          <div className="relative inline-block mb-2">
            <div className="absolute -inset-x-6 -inset-y-3 bg-[var(--mn-accent)]/10 blur-xl rounded-full" />
            <h1 className="relative text-2xl sm:text-3xl font-bold text-white font-['Cairo',sans-serif] tracking-tight leading-tight">
              دليل الدورات{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mn-accent-soft)] to-[var(--mn-accent-soft)] mn-gold ">
                التدريبية
              </span>
            </h1>
          </div>

          {/* Divider */}
          <div className="flex justify-center items-center gap-2 pt-1 pb-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[var(--mn-accent-soft)]/50" />
            <PlayCircle className="w-4 h-4 text-[var(--mn-accent-text)]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[var(--mn-accent-soft)]/50" />
          </div>

          {/* Subtitle / Beautiful Copywriting */}
          <p className="text-[13px] sm:text-sm text-[var(--mn-on-dark-muted)] font-medium font-['Cairo',sans-serif] leading-relaxed max-w-[90%] mx-auto drop-shadow-md">
            طور مهاراتك، ارتقِ بمسيرتك المهنية، واكتشف برامج تدريبية عالمية تضعك في صدارة المنافسة
            في سوق العمل المتجدد.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COURSE PATHS LANDING — NO COURSE LISTS OR FILTERS HERE                    */}
      {/* ========================================================================= */}
      <div className="max-w-md sm:max-w-xl mx-auto mn-inline-gutter -mt-5 relative z-20 pb-24">
        <div className="bg-[var(--mn-surface)] rounded-[22px] border border-[var(--mn-border)] shadow-lg px-3.5 py-3.5 mb-3.5 mn-panel ">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right min-w-0">
              <h2 className="text-[15px] sm:text-base font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif]">اختر نوع الدورات</h2>
              <p className="mt-0.5 text-[10.5px] sm:text-[11px] leading-5 text-[var(--mn-text-muted)] font-semibold font-['Cairo',sans-serif]">
                اختر المسار المناسب، ثم ستظهر أدوات البحث والتصفية داخل كل قسم.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[var(--mn-accent-text)]" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <CoursePathCard
            title="الدورات المستوردة"
            eyebrow="من جامعات ومنصات تعليمية خارجية"
            badge="خارجي"
            description="استكشف الدورات التي تجمعها منارتك من المصادر التعليمية، ثم انتقل إلى المصدر الرسمي للدراسة."
            icon={Globe2}
            features={[
              { label: 'منصات متعددة', icon: Layers3 },
              { label: 'شهادات', icon: BadgeCheck },
              { label: 'مصدر رسمي', icon: ExternalLink },
            ]}
            footer="بحث وفلاتر داخل القسم"
            cta="استكشف الدورات"
            onClick={() => onOpenTrack?.('imported')}
          />

          <CoursePathCard
            title="دورات منارتك"
            eyebrow="تعلم كامل داخل منصة MANARATAK"
            badge="داخل المنصة"
            description="دورات مبنية داخل منارتك بوحدات ودروس منظمة مع متابعة تقدم الطالب وتجربة تعلم متكاملة."
            icon={GraduationCap}
            features={[
              { label: 'وحدات ودروس', icon: BookOpenCheck },
              { label: 'تقدم محفوظ', icon: TrendingUp },
              { label: 'إنجاز', icon: Award },
            ]}
            footer="تعلم ومتابعة داخل منارتك"
            cta="استكشف دورات منارتك"
            onClick={() => onOpenTrack?.('native')}
          />

          <CoursePathCard
            title="الدورات المدفوعة"
            eyebrow="برامج احترافية ومحتوى متقدم"
            badge="مدفوع"
            description="قسم مستقل للدورات والبرامج المدفوعة مع عرض واضح للسعر والمزايا وتفاصيل الوصول قبل الشراء."
            icon={CreditCard}
            features={[
              { label: 'سعر واضح', icon: Tag },
              { label: 'محتوى متقدم', icon: Sparkles },
              { label: 'تفاصيل الوصول', icon: ShieldCheck },
            ]}
            footer="الأسعار والفلاتر داخل القسم"
            cta="استكشف الدورات"
            onClick={() => onOpenTrack?.('paid')}
          />
        </div>
      </div>
    </div>
  );
}

