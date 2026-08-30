import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Database,
  Filter,
  Layers3,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CategoryType,
  StudentToolAvailability,
  StudentToolCategory,
  StudentToolExecutionLabel,
  StudentToolPreview,
} from '../types';
import { STUDENT_TOOL_CATEGORIES, STUDENT_TOOLS_PREVIEW } from '../data/studentToolsData';
import { FavoriteButton } from './FavoriteButton';

interface AIToolsPageProps {
  detailId?: string;
  onDetailChange?: (id: string) => void;
  onBack?: () => void;
  onNavigateCategory?: (category: CategoryType) => void;
  onOpenService?: (serviceId: string) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
  initialSelectedId?: string;
}

const TOOL_TYPES: Array<'الكل' | StudentToolExecutionLabel> = [
  'الكل',
  'أداة ذكية',
  'حسابية',
  'بيانات ومقارنة',
  'هجينة',
];

const AVAILABILITY_OPTIONS: Array<'الكل' | StudentToolAvailability> = [
  'الكل',
  'متاحة الآن',
  'قريبًا',
];

const toolIcon = (tool: StudentToolPreview) => {
  if (tool.executionLabel === 'أداة ذكية') return <Sparkles className="w-5 h-5" />;
  if (tool.executionLabel === 'بيانات ومقارنة') return <Database className="w-5 h-5" />;
  return <BookOpenCheck className="w-5 h-5" />;
};

const StudentToolCard: React.FC<{
  tool: StudentToolPreview;
  onOpen: (tool: StudentToolPreview) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}> = ({ tool, onOpen, isFavorite = false, onToggleFavorite }) => (
  <article
    className="relative group bg-[var(--mn-surface)] border border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 rounded-3xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all active:scale-[0.99] mn-panel "
  >
    {onToggleFavorite && (
      <FavoriteButton
        active={isFavorite}
        onToggle={(event) => {
          event.stopPropagation();
          onToggleFavorite(tool.id);
        }}
        className="absolute left-3 top-3 z-10"
      />
    )}
    <button onClick={() => onOpen(tool)} className="w-full text-right cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[var(--mn-primary)] text-white flex items-center justify-center shrink-0 border border-[var(--mn-accent)]/25 shadow-sm mn-inverse ">
          {toolIcon(tool)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-[var(--mn-accent-text)] font-black font-['Cairo',sans-serif]">
                {tool.category}
              </span>
              <h2 className="mt-0.5 text-[14px] sm:text-[15px] leading-snug font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">
                {tool.title}
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--mn-success-soft)] border border-[var(--mn-success-border)] px-2 py-1 text-[9px] font-black text-[var(--mn-success-text)] font-['Cairo',sans-serif]">
              {tool.availability}
            </span>
          </div>

          <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-[var(--mn-text-muted)] font-medium font-['Cairo',sans-serif] line-clamp-2">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--mn-border)] flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mn-page)] border border-[var(--mn-border)] px-2 py-1 text-[9px] sm:text-[10px] font-bold text-[var(--mn-text-muted)] font-['Cairo',sans-serif] mn-panel ">
            {tool.executionLabel === 'أداة ذكية' ? <Sparkles className="w-3 h-3" /> : <Database className="w-3 h-3" />}
            {tool.executionLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mn-page)] border border-[var(--mn-border)] px-2 py-1 text-[9px] sm:text-[10px] font-bold text-[var(--mn-text-muted)] font-['Cairo',sans-serif] mn-panel ">
            <Clock3 className="w-3 h-3" />
            {tool.estimatedTime}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-[var(--mn-heading)] font-['Cairo',sans-serif] group-hover:text-[var(--mn-accent-text)] transition-colors shrink-0">
          التفاصيل
          <ChevronLeft className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  </article>
);

const ToolDetailView: React.FC<{
  tool: StudentToolPreview;
  onBack: () => void;
  onNavigateCategory?: (category: CategoryType) => void;
  onOpenService?: (serviceId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}> = ({ tool, onBack, onNavigateCategory, onOpenService, isFavorite = false, onToggleFavorite }) => (
  <div className="min-h-screen bg-[var(--mn-page)] pb-24 mn-panel " dir="rtl">
    <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-10 overflow-hidden shadow-sm mn-inverse ">
      <button
        onClick={onBack}
        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full transition-all z-20 cursor-pointer text-white"
        title="العودة إلى الأدوات"
      >
        <ChevronLeft className="w-5 h-5 rotate-180" />
      </button>

      {onToggleFavorite && (
        <FavoriteButton
          active={isFavorite}
          onToggle={(event) => {
            event.stopPropagation();
            onToggleFavorite(tool.id);
          }}
          className="absolute top-4 left-4 z-20 bg-[var(--mn-surface)]/95 mn-panel "
        />
      )}

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 190" fill="none" preserveAspectRatio="none">
          <path d="M-40,52 Q110,-10 250,58 T520,42" stroke="var(--mn-accent)" strokeWidth="1.5" />
          <path d="M-10,125 Q145,50 315,138 T620,105" stroke="var(--mn-accent)" strokeWidth="1" />
        </svg>
      </div>

      <div className="max-w-xl mx-auto text-center relative z-10 pt-2">
        <div className="w-12 h-12 mx-auto rounded-2xl border border-[var(--mn-accent)]/35 bg-white/10 backdrop-blur flex items-center justify-center text-[var(--mn-accent-text)] mb-3">
          {toolIcon(tool)}
        </div>
        <span className="text-[10px] font-black text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">
          {tool.category}
        </span>
        <h1 className="mt-1 text-xl sm:text-2xl font-black text-white font-['Cairo',sans-serif]">
          {tool.title}
        </h1>
        <p className="mt-2 text-[11px] sm:text-xs text-[var(--mn-on-dark-muted)] leading-relaxed max-w-sm mx-auto font-medium font-['Cairo',sans-serif]">
          {tool.shortDescription}
        </p>
      </div>
    </div>

    <div className="max-w-xl mx-auto px-3 sm:px-4 -mt-4 relative z-20 space-y-3">
      <div className="bg-[var(--mn-surface)] border border-[var(--mn-accent)]/45 rounded-3xl p-2 shadow-sm grid grid-cols-3 gap-1.5 mn-panel ">
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)]/80 p-2 text-center mn-panel ">
          <div className="text-[9px] text-[var(--mn-text-muted)] font-bold">النوع</div>
          <div className="mt-1 text-[10px] font-black text-[var(--mn-heading)]">{tool.executionLabel}</div>
        </div>
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)]/80 p-2 text-center mn-panel ">
          <div className="text-[9px] text-[var(--mn-text-muted)] font-bold">التوفر</div>
          <div className="mt-1 text-[10px] font-black text-[var(--mn-success-text)]">{tool.availability}</div>
        </div>
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)]/80 p-2 text-center mn-panel ">
          <div className="text-[9px] text-[var(--mn-text-muted)] font-bold">الوقت</div>
          <div className="mt-1 text-[10px] font-black text-[var(--mn-heading)]">{tool.estimatedTime}</div>
        </div>
      </div>

      <section className="bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-3xl p-4 shadow-2xs mn-panel ">
        <h2 className="text-sm font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">ماذا تفعل هذه الأداة؟</h2>
        <p className="mt-2 text-[11px] sm:text-xs leading-7 text-[var(--mn-text-muted)] font-medium font-['Cairo',sans-serif]">{tool.purpose}</p>
      </section>

      <section className="bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-3xl p-4 shadow-2xs mn-panel ">
        <h2 className="text-sm font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">كيف تعمل؟</h2>
        <div className="mt-3 space-y-2">
          {tool.howItWorks.map((step, index) => (
            <div key={step} className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[var(--mn-primary)] text-white text-[10px] font-black flex items-center justify-center shrink-0 mn-inverse ">{index + 1}</span>
              <p className="pt-0.5 text-[11px] sm:text-xs leading-6 text-[var(--mn-text-muted)] font-medium font-['Cairo',sans-serif]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <section className="bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-3xl p-4 shadow-2xs mn-panel ">
          <h2 className="text-xs font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">ما الذي تحتاجه منك؟</h2>
          <ul className="mt-2 space-y-1.5">
            {tool.inputs.map((item) => (
              <li key={item} className="text-[10px] sm:text-[11px] leading-5 text-[var(--mn-text-muted)] flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--mn-accent)] shrink-0 mn-gold " />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-3xl p-4 shadow-2xs mn-panel ">
          <h2 className="text-xs font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">ماذا تحصل عليه؟</h2>
          <ul className="mt-2 space-y-1.5">
            {tool.outputs.map((item) => (
              <li key={item} className="text-[10px] sm:text-[11px] leading-5 text-[var(--mn-text-muted)] flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--mn-success-solid)] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {tool.notes && tool.notes.length > 0 && (
        <section className="bg-[var(--mn-gold-surface)]/70 border border-[var(--mn-border-gold)] rounded-3xl p-4">
          <h2 className="text-xs font-black text-[var(--mn-accent-text)] font-['Cairo',sans-serif]">تنبيه مهم</h2>
          <ul className="mt-2 space-y-1.5">
            {tool.notes.map((note) => (
              <li key={note} className="text-[10px] sm:text-[11px] leading-5 text-[var(--mn-accent-text)]">• {note}</li>
            ))}
          </ul>
        </section>
      )}

      {tool.contextualLinks && tool.contextualLinks.length > 0 && (
        <section className="bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-3xl p-4 shadow-2xs mn-panel ">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">استكشف في منارتك</h2>
            <span className="text-[9px] text-[var(--mn-text-muted)] font-bold">ظهور سياقي</span>
          </div>
          <div className="mt-3 space-y-2">
            {tool.contextualLinks.map((link) => (
              <button
                key={`${tool.id}-${link.category}`}
                onClick={() => onNavigateCategory?.(link.category)}
                className="w-full flex items-center justify-between gap-3 rounded-2xl border border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 bg-[var(--mn-page)]/70 hover:bg-[var(--mn-accent)]/5 p-3 text-right transition-all cursor-pointer"
              >
                <div>
                  <div className="text-[11px] font-black text-[var(--mn-heading)]">{link.label}</div>
                  <div className="mt-0.5 text-[9px] sm:text-[10px] leading-5 text-[var(--mn-text-muted)]">{link.description}</div>
                </div>
                <ArrowLeft className="w-4 h-4 text-[var(--mn-accent-text)] shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      {tool.serviceSuggestions && tool.serviceSuggestions.length > 0 && (
        <section className="bg-[var(--mn-surface)] border border-[var(--mn-accent)]/35 rounded-3xl p-4 shadow-2xs mn-panel ">
          <h2 className="text-sm font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">خدمات قد تساعدك</h2>
          <p className="mt-1 text-[9px] sm:text-[10px] text-[var(--mn-text-muted)] leading-5">اقتراح سياقي فقط؛ الأداة والخدمة كيانان مستقلان.</p>
          <div className="mt-3 space-y-2">
            {tool.serviceSuggestions.map((service) => (
              <button
                key={service.serviceId}
                onClick={() => onOpenService?.(service.serviceId)}
                className="w-full flex items-center justify-between gap-3 rounded-2xl border border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 bg-[var(--mn-surface)] p-3 text-right transition-all cursor-pointer mn-panel "
              >
                <div>
                  <div className="text-[11px] font-black text-[var(--mn-heading)]">{service.label}</div>
                  <div className="mt-0.5 text-[9px] sm:text-[10px] leading-5 text-[var(--mn-text-muted)]">{service.note}</div>
                </div>
                <ArrowLeft className="w-4 h-4 text-[var(--mn-accent-text)] shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)]/80 p-3 text-center mn-panel ">
        <div className="text-xs font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">تشغيل الأداة</div>
        <p className="mt-1 text-[9px] sm:text-[10px] leading-5 text-[var(--mn-text-muted)] font-medium">
          واجهة التشغيل الفعلية ستتصل لاحقًا بسجل Phase 18 والـ API؛ هذه النسخة تختبر العرض والتفاصيل والترابط فقط.
        </p>
      </div>
    </div>
  </div>
);

export const AIToolsPage: React.FC<AIToolsPageProps> = ({
  detailId, onDetailChange,
  onBack,
  onNavigateCategory,
  onOpenService,
  favoriteIds = [],
  onToggleFavorite,
  initialSelectedId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'الكل' | StudentToolCategory>('الكل');
  const [selectedAvailability, setSelectedAvailability] = useState<'الكل' | StudentToolAvailability>('الكل');
  const [selectedType, setSelectedType] = useState<'الكل' | StudentToolExecutionLabel>('الكل');
  const [localDetail, setLocalDetail] = useState<StudentToolPreview | null>(() =>
    initialSelectedId ? STUDENT_TOOLS_PREVIEW.find((item) => item.id === initialSelectedId) || null : null,
  );
  const selectedTool = detailId !== undefined ? (STUDENT_TOOLS_PREVIEW.find(item => item.id === detailId) || (STUDENT_TOOLS_PREVIEW.find(item => item.id === initialSelectedId)) || null) : localDetail;
  const setSelectedTool = (value: StudentToolPreview | null) => onDetailChange ? onDetailChange(value?.id || '') : setLocalDetail(value);


  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return STUDENT_TOOLS_PREVIEW.filter((tool) => {
      const searchable = [
        tool.title,
        tool.titleEn,
        tool.shortDescription,
        tool.category,
        tool.executionLabel,
        tool.purpose,
        ...tool.inputs,
        ...tool.outputs,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!q || searchable.includes(q)) &&
        (selectedCategory === 'الكل' || tool.category === selectedCategory) &&
        (selectedAvailability === 'الكل' || tool.availability === selectedAvailability) &&
        (selectedType === 'الكل' || tool.executionLabel === selectedType)
      );
    });
  }, [searchQuery, selectedCategory, selectedAvailability, selectedType]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('الكل');
    setSelectedAvailability('الكل');
    setSelectedType('الكل');
  };

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (selectedCategory !== 'الكل' ? 1 : 0) +
    (selectedAvailability !== 'الكل' ? 1 : 0) +
    (selectedType !== 'الكل' ? 1 : 0);

  if (selectedTool) {
    return (
      <ToolDetailView
        tool={selectedTool}
        onBack={() => {
          if (onDetailChange && onBack) {onBack(); return;}
          if (initialSelectedId && selectedTool.id === initialSelectedId && onBack) {
            onBack();
          } else {
            setSelectedTool(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateCategory={onNavigateCategory}
        onOpenService={onOpenService}
        isFavorite={favoriteIds.includes(selectedTool.id)}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mn-page)] text-[var(--mn-heading)] pb-24 font-sans select-none mn-panel " dir="rtl">
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-sm mn-inverse ">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full transition-all z-20 cursor-pointer text-white"
            title="العودة"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        )}

        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
            <path d="M-50,50 Q100,-20 250,60 T550,40" stroke="var(--mn-accent)" strokeWidth="1.5" />
            <path d="M-20,120 Q150,40 300,140 T600,100" stroke="var(--mn-accent)" strokeWidth="1" />
            <circle cx="30" cy="30" r="1" fill="var(--mn-accent)" />
            <circle cx="45" cy="30" r="1" fill="var(--mn-accent)" />
            <circle cx="60" cy="30" r="1" fill="var(--mn-accent)" />
          </svg>
        </div>

        <div className="max-w-xl mx-auto text-center relative z-10 space-y-2.5">
          <div className="flex justify-center -mb-1">
            <span className="text-[var(--mn-accent-text)] text-sm">✦</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cairo',sans-serif] tracking-tight">
              <span>استكشف </span>
              <span className="relative inline-block text-white">
                أدوات منارتك
                <svg className="absolute -bottom-1.5 inset-x-0 w-full h-2" viewBox="0 0 100 12" fill="none" preserveAspectRatio="none">
                  <path d="M2,9 Q50,2 98,6" stroke="var(--mn-accent)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-[var(--mn-on-dark-muted)] font-medium font-['Cairo',sans-serif] mt-1.5 leading-relaxed max-w-sm mx-auto">
              أدوات ذكية وحاسبات أكاديمية للمقارنة والتخطيط والتقديم واتخاذ القرار.
            </p>
          </div>

          <div className="pt-1 max-w-md mx-auto px-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الأداة أو الغرض..."
                className="w-full py-2.5 pl-4 pr-10 bg-[var(--mn-primary)]/85 hover:bg-[var(--mn-primary-hover)] focus:bg-[var(--mn-primary)] border border-[var(--mn-accent)]/40 focus:border-[var(--mn-accent)] rounded-full text-xs sm:text-[13px] font-bold text-white placeholder-white focus:outline-none shadow-inner transition-all text-center font-['Cairo',sans-serif] mn-inverse hover:mn-inverse focus:mn-inverse "
              />
              <Search className="w-4 h-4 text-[var(--mn-accent-text)] absolute right-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--mn-on-dark-muted)] hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={resetFilters}
              className="text-[10px] sm:text-[11px] font-bold text-[var(--mn-danger-text)] hover:text-[var(--mn-danger-text)] bg-[var(--mn-danger-soft)] hover:bg-[var(--mn-danger-soft)] px-3 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer font-['Cairo',sans-serif]"
            >
              <RotateCcw className="w-3 h-3" />
              إعادة ضبط الفلاتر ({activeFiltersCount})
            </button>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-3 sm:px-4 -mt-7 sm:-mt-8 relative z-20">
        <div className="bg-[var(--mn-surface)] border border-[var(--mn-accent)]/50 rounded-3xl p-2 sm:p-2.5 shadow-md mn-panel ">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="relative bg-[var(--mn-surface)] hover:bg-[var(--mn-page)]/80 border border-[var(--mn-border)] rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-2xs transition-colors min-w-0 mn-panel hover:mn-panel ">
              <div className="flex items-center gap-1 text-[var(--mn-heading)] font-bold text-[9px] sm:text-[11px] font-['Cairo',sans-serif] leading-tight min-w-0">
                <Layers3 className="w-3 h-3 text-[var(--mn-accent-text)] shrink-0" />
                <span className="truncate">{selectedCategory === 'الكل' ? 'المجال' : selectedCategory}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--mn-text-muted)] mt-1" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as 'الكل' | StudentToolCategory)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" title="اختر مجال الأداة">
                <option value="الكل">كل المجالات</option>
                {STUDENT_TOOL_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div className="relative bg-[var(--mn-surface)] hover:bg-[var(--mn-page)]/80 border border-[var(--mn-border)] rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-2xs transition-colors min-w-0 mn-panel hover:mn-panel ">
              <div className="flex items-center gap-1 text-[var(--mn-heading)] font-bold text-[9px] sm:text-[11px] font-['Cairo',sans-serif] leading-tight min-w-0">
                <BookOpenCheck className="w-3 h-3 text-[var(--mn-accent-text)] shrink-0" />
                <span className="truncate">{selectedAvailability === 'الكل' ? 'التوفر' : selectedAvailability}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--mn-text-muted)] mt-1" />
              <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value as 'الكل' | StudentToolAvailability)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" title="اختر حالة التوفر">
                {AVAILABILITY_OPTIONS.map((status) => <option key={status} value={status}>{status === 'الكل' ? 'كل الحالات' : status}</option>)}
              </select>
            </div>

            <div className="relative bg-[var(--mn-surface)] hover:bg-[var(--mn-page)]/80 border border-[var(--mn-border)] rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-2xs transition-colors min-w-0 mn-panel hover:mn-panel ">
              <div className="flex items-center gap-1 text-[var(--mn-heading)] font-bold text-[9px] sm:text-[11px] font-['Cairo',sans-serif] leading-tight min-w-0">
                <Filter className="w-3 h-3 text-[var(--mn-accent-text)] shrink-0" />
                <span className="truncate">{selectedType === 'الكل' ? 'نوع الأداة' : selectedType}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--mn-text-muted)] mt-1" />
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as 'الكل' | StudentToolExecutionLabel)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" title="اختر نوع الأداة">
                {TOOL_TYPES.map((type) => <option key={type} value={type}>{type === 'الكل' ? 'كل الأنواع' : type}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-3 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-xs sm:text-sm font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">الأدوات المتاحة ({filteredTools.length})</span>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-[var(--mn-text-muted)] font-medium">نسخة تجريبية: بطاقتان فقط لاختبار الشكل والربط.</p>
          </div>
          <span className="text-[9px] sm:text-[10px] text-[var(--mn-accent-text)] font-bold font-['Cairo',sans-serif]">Phase 18</span>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          {filteredTools.length === 0 ? (
            <div className="bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 shadow-2xs mn-panel ">
              <div className="w-12 h-12 rounded-full bg-[var(--mn-surface-muted)] flex items-center justify-center text-[var(--mn-text-muted)] mn-panel "><Search className="w-6 h-6" /></div>
              <h3 className="text-sm font-black text-[var(--mn-heading)] font-['Cairo',sans-serif]">لا توجد أداة مطابقة في النموذج التجريبي</h3>
              <p className="text-xs text-[var(--mn-text-muted)] max-w-xs font-['Cairo',sans-serif]">الفلاتر مبنية على كتالوج Phase 18 الكامل، بينما هذه النسخة تعرض بطاقتين فقط للتجربة.</p>
              <button onClick={resetFilters} className="mt-2 px-4 py-1.5 bg-[var(--mn-primary)] text-white rounded-xl text-xs font-bold cursor-pointer font-['Cairo',sans-serif] mn-inverse ">إلغاء التصفية وعرض النموذج</button>
            </div>
          ) : (
            filteredTools.map((tool) => (
              <StudentToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favoriteIds.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
                onOpen={(selected) => {
                  setSelectedTool(selected);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
