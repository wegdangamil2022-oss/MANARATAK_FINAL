import React from 'react';
import { Menu, User, Globe, Moon, Sun, Search, Sparkles, X, Bell } from 'lucide-react';
import { Language } from '../types';
import { ManaratakLogo } from './ManaratakLogo';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenMenu: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: any) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  globalSearchQuery?: string;
  onGlobalSearchChange?: (query: string) => void;
  onGlobalSearchSubmit?: (query: string) => void;
  onOpenSmartSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
  onTabChange,
  onSelectCategory,
  isDarkMode = false,
  onToggleDarkMode,
  globalSearchQuery = '',
  onGlobalSearchChange,
  onGlobalSearchSubmit,
  onOpenSmartSearch,
  unreadCount = 0,
}) => {
  const isRtl = language === 'ar';

  return (
    <header
      id="manaratak-header"
      className="w-full bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface)] border-b border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] shadow-2xs sticky top-0 z-40 transition-colors mn-panel mn-dark:mn-panel "
    >
      {/* Main Top Bar */}
      <div className="w-full h-16 sm:h-20 px-3 sm:px-6 flex items-center">
        <div className="mn-header-row flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
          {/* Brand Identity & Official Logo */}
          <div className="mn-header-brand flex items-center gap-2 sm:gap-2.5">
            {/* Circular Logo Container */}
            <button
              type="button"
              aria-label="منارتك — الرئيسية"
              onClick={() => {
                onTabChange?.('home');
                onSelectCategory?.('all');
              }}
              className="w-[42px] h-[42px] sm:w-[54px] sm:h-[54px] rounded-full overflow-hidden shrink-0 shadow-xs border-2 border-[var(--mn-accent)] bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] flex items-center justify-center cursor-pointer transition-transform active:scale-95 p-1"
            >
              <ManaratakLogo size={54} className="w-full h-full" />
            </button>

            {/* Brand Typography */}
            <div className="flex flex-col justify-center text-start">
              {/* Platform Name: MANARATAK */}
              <span className="text-sm sm:text-base font-bold tracking-wider text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)] uppercase leading-tight font-['Cairo',sans-serif]">
                MANARATAK
              </span>
              {/* Subtitle: منارتك للفرص التعليمية */}
              <span className="text-[10px] sm:text-[11px] font-medium text-[var(--mn-heading)] mn-dark:text-[var(--mn-text-muted)] leading-tight mt-0.5 whitespace-nowrap font-['Cairo',sans-serif]">
                {isRtl ? 'منارتك للفرص التعليمية' : 'Educational Opportunities'}
              </span>
            </div>
          </div>

          {/* Actions Controls */}
          <div className="mn-header-actions flex items-center gap-1.5 sm:gap-2">
            {/* Dark Mode Switcher */}
            {onToggleDarkMode && (
              <button
                id="btn-dark-mode-toggle"
                onClick={onToggleDarkMode}
                className="h-8 sm:h-9 px-2 sm:px-2.5 bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] hover:bg-[var(--mn-page)] mn-dark:hover:bg-[var(--mn-surface-muted)] text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer mn-panel mn-dark:mn-panel hover:mn-panel mn-dark:hover:mn-panel "
                title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
                aria-label="تبديل الوضع الليلي"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                    <span className="font-semibold text-[10px] sm:text-xs text-[var(--mn-accent-text)] hidden xs:inline">
                      نهاري
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
                    <span className="font-semibold text-[10px] sm:text-xs text-[var(--mn-heading)] hidden xs:inline">
                      ليلي
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Single Compact Language Switcher (AR / EN) */}
            <button
              id="btn-single-language"
              onClick={onToggleLanguage}
              className="h-8 sm:h-9 px-2.5 bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] hover:bg-[var(--mn-page)] mn-dark:hover:bg-[var(--mn-surface-muted)] text-[var(--mn-heading)] mn-dark:text-[var(--mn-text)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer mn-panel mn-dark:mn-panel hover:mn-panel mn-dark:hover:mn-panel "
              title="لغة الواجهة: العربية؛ الإنجليزية قيد التجهيز"
              aria-label="لغة الواجهة"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
              <span className="font-semibold tracking-wide text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)]">
                AR
              </span>
            </button>

            {/* Student notifications */}
            {onOpenNotifications && (
              <button
                id="btn-student-notifications"
                onClick={onOpenNotifications}
                className="relative min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] hover:bg-[var(--mn-page)] mn-dark:hover:bg-[var(--mn-surface-muted)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] text-[var(--mn-heading)] mn-dark:text-[var(--mn-text)] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs mn-panel mn-dark:mn-panel hover:mn-panel mn-dark:hover:mn-panel "
                aria-label="تنبيهات الطالب"
                title="التنبيهات"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--mn-accent)] text-[var(--mn-on-accent)] text-[8px] font-semibold flex items-center justify-center ring-2 ring-[var(--mn-surface)] mn-dark:ring-[var(--mn-surface)] mn-gold ">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Student Account Button with User Icon */}
            <button
              id="btn-student-account"
              onClick={onOpenProfile}
              className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3.5 rounded-xl bg-[var(--mn-primary)] hover:bg-[var(--mn-primary)] mn-dark:bg-[var(--mn-primary)] mn-dark:hover:bg-[var(--mn-primary)] border border-[var(--mn-accent)]/60 text-[var(--mn-accent-text)] hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer shadow-xs mn-inverse hover:mn-inverse mn-dark:mn-inverse mn-dark:hover:mn-inverse "
              aria-label="حساب الطالب"
              title="حسابي ومساحة الطالب"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--mn-accent-text)]" />
              <span className="hidden sm:inline font-bold">
                {isRtl ? 'حساب الطالب' : 'Student Account'}
              </span>
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              id="btn-header-menu"
              onClick={onOpenMenu}
              className="min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] hover:bg-[var(--mn-page)] mn-dark:hover:bg-[var(--mn-surface-muted)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 text-[var(--mn-heading)] mn-dark:text-[var(--mn-text)] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs mn-panel mn-dark:mn-panel hover:mn-panel mn-dark:hover:mn-panel "
              aria-label="القائمة الرئيسية"
              title="القائمة"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {(onGlobalSearchChange || onGlobalSearchSubmit || onOpenSmartSearch) && (
        <div className="w-full px-3 sm:px-6 pb-2.5 sm:pb-3">
          <div className="max-w-5xl mx-auto flex items-stretch gap-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onGlobalSearchSubmit?.(globalSearchQuery.trim());
              }}
              className="mn-search-control min-w-0 h-10 flex-1 flex items-center border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] shadow-2xs overflow-hidden focus-within:border-[var(--mn-accent)]/70 focus-within:ring-2 focus-within:ring-[var(--mn-primary)]/10 transition-all mn-panel mn-dark:mn-panel "
            >
              <button
                type="submit"
                className="w-10 self-stretch flex items-center justify-center text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)] cursor-pointer"
                aria-label="تنفيذ البحث العام"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                id="header-global-search"
                value={globalSearchQuery}
                onChange={(event) => onGlobalSearchChange?.(event.target.value)}
                placeholder={isRtl ? 'ابحث في منارتك...' : 'Search MANARATAK...'}
                className="min-w-0 flex-1 bg-transparent py-2.5 px-1 text-[11px] sm:text-xs font-bold text-[var(--mn-text)] placeholder:text-[var(--mn-text-muted)] outline-none font-['Cairo',sans-serif]"
                dir={isRtl ? 'rtl' : 'ltr'}
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => onGlobalSearchChange?.('')}
                  className="w-8 self-stretch flex items-center justify-center text-[var(--mn-text-muted)] hover:text-[var(--mn-text-muted)] cursor-pointer"
                  aria-label="مسح البحث العام"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => onOpenSmartSearch?.(globalSearchQuery.trim())}
              className="shrink-0 h-10 min-w-[76px] sm:min-w-[104px] rounded-xl bg-[var(--mn-primary)] border border-[var(--mn-accent)]/45 px-2.5 sm:px-3 text-white flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer mn-inverse "
              title={isRtl ? 'افتح البحث الذكي' : 'Open smart search'}
            >
              <Sparkles className="w-4 h-4 text-[var(--mn-accent)]" />
              <span className="text-[9px] sm:text-[10px] font-semibold whitespace-nowrap">{isRtl ? 'بحث ذكي' : 'Smart'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
