import React, { useState, useRef } from 'react';
import { Search, Sparkles, X, ArrowUpRight } from 'lucide-react';

interface SmartSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag: (tag: string) => void;
  onOpenAiTools: (initialTab?: 'search' | 'letter' | 'cv' | 'chat') => void;
  selectedCountry?: string;
  onSelectCountry?: (country: string) => void;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAiTools,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const smartSuggestions = [
    'منحة إيراسموس بلس للماجستير في أوروبا',
    'منح الحكومة الصينية CSC بدون متطلب لغة',
    'منح دراسية مجانية لدراسة الطب في ألمانيا',
    'منح علوم الحاسوب والذكاء الاصطناعي براتب شهري',
    'دورات مجانية لكتابة خطاب الدافع وتحضير الآيلتس',
  ];

  return (
    <div id="smart-search-wrapper" className="w-full px-4 sm:px-5 pt-3 sm:pt-4 relative z-20">
      {/* Search Input Box */}
      <div className="relative">
        <div
          className={`flex items-center bg-[var(--mn-surface)] rounded-2xl border transition-all shadow-sm overflow-hidden ${
            isFocused
              ? 'border-[var(--mn-border-brand)] ring-2 ring-[var(--mn-primary)]/20 shadow-md'
              : 'border-slate-200 hover:border-[var(--mn-accent)]'
          }`}
        >
          {/* AI Quick Search Trigger Floating Helper */}
          <button
            onClick={() => onOpenAiTools('search')}
            className="flex items-center gap-1 px-2.5 py-1.5 mr-2 bg-[var(--mn-accent)]/15 hover:bg-[var(--mn-accent)]/25 text-[var(--mn-heading)] border border-[var(--mn-accent)]/40 rounded-xl text-[10px] font-bold shadow-2xs transition-transform active:scale-95 z-10 shrink-0 cursor-pointer"
            title="استخدم البحث بالذكاء الاصطناعي"
          >
            <Sparkles className="w-3 h-3 text-[var(--mn-accent-text)] fill-[var(--mn-accent)] animate-pulse" />
            <span>بحث AI</span>
          </button>

          {/* Input field */}
          <input
            id="input-main-search"
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            placeholder="ابحث عن منح، دورات، جامعات..."
            className="w-full py-3 px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden font-medium text-right font-['Cairo',sans-serif]"
            dir="rtl"
          />

          {/* Clear button if has text */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1.5 text-slate-400 hover:text-slate-700 ml-1 rounded-full cursor-pointer"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Icon */}
          <div className="p-3 text-slate-400 flex items-center justify-center">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Live Search Suggestions Dropdown */}
        {isFocused && (
          <div className="absolute top-full right-0 left-0 mt-1.5 bg-[var(--mn-surface)] border border-[var(--mn-accent)]/30 rounded-2xl shadow-xl z-40 overflow-hidden text-right divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-2.5 bg-[var(--mn-primary)] text-[var(--mn-accent-text)] text-[11px] font-bold flex items-center justify-between font-['Cairo',sans-serif]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                مقترحات بحث شائعة وذكية
              </span>
              <span className="text-[10px] text-white/80 font-normal">منارتك AI</span>
            </div>

            <div className="p-1 max-h-48 overflow-y-auto">
              {smartSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSearchChange(item);
                    setIsFocused(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[var(--mn-heading)] rounded-xl flex items-center justify-between transition-colors group cursor-pointer font-['Cairo',sans-serif]"
                >
                  <span className="truncate">{item}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--mn-heading)] opacity-70" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
