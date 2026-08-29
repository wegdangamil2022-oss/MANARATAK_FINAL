import React from 'react';
import { Menu, User, Globe, Moon, Sun } from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenMenu,
  onOpenProfile,
  onTabChange,
  onSelectCategory,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const isRtl = language === 'ar';

  return (
    <header
      id="manaratak-header"
      className="w-full bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] border-b border-slate-100 dark:border-[var(--mn-border)] shadow-2xs sticky top-0 z-40 transition-colors"
    >
      {/* Main Top Bar */}
      <div className="w-full h-16 sm:h-20 px-3 sm:px-6 flex items-center">
        <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
          {/* Brand Identity & Official Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Circular Logo Container */}
            <div
              onClick={() => {
                onTabChange?.('home');
                onSelectCategory?.('all');
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 shadow-xs border-2 border-[var(--mn-accent)] bg-[var(--mn-primary)] flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <ManaratakLogo size={64} className="w-full h-full object-cover" />
            </div>

            {/* Brand Typography */}
            <div className="flex flex-col justify-center text-start">
              {/* Platform Name: MANARATAK */}
              <span className="text-sm sm:text-base font-bold tracking-wider text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] uppercase leading-tight font-['Cairo',sans-serif]">
                MANARATAK
              </span>
              {/* Subtitle: منارتك للفرص التعليمية */}
              <span className="text-[10px] sm:text-[11px] font-medium text-[var(--mn-heading)]/80 dark:text-slate-300 leading-tight mt-0.5 whitespace-nowrap font-['Cairo',sans-serif]">
                {isRtl ? 'منارتك للفرص التعليمية' : 'Educational Opportunities'}
              </span>
            </div>
          </div>

          {/* Actions Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Dark Mode Switcher */}
            {onToggleDarkMode && (
              <button
                id="btn-dark-mode-toggle"
                onClick={onToggleDarkMode}
                className="h-8 sm:h-9 px-2 sm:px-2.5 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface-elevated)] hover:bg-slate-50 dark:hover:bg-[var(--mn-surface-muted)] text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] border border-slate-200 dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
                aria-label="تبديل الوضع الليلي"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
                    <span className="font-extrabold text-[10px] sm:text-xs text-[var(--mn-accent-text)] hidden xs:inline">
                      نهاري
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
                    <span className="font-extrabold text-[10px] sm:text-xs text-[var(--mn-heading)] hidden xs:inline">
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
              className="h-8 sm:h-9 px-2.5 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface-elevated)] hover:bg-slate-50 dark:hover:bg-[var(--mn-surface-muted)] text-[var(--mn-heading)] dark:text-slate-200 border border-slate-200 dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title={isRtl ? 'Switch to English' : 'التحويل للغة العربية'}
              aria-label="تبديل اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
              <span className="font-extrabold tracking-wide text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]">
                {isRtl ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Student Account Button with User Icon */}
            <button
              id="btn-student-account"
              onClick={onOpenProfile}
              className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3.5 rounded-xl bg-[var(--mn-primary)] hover:bg-[var(--mn-primary)] dark:bg-[var(--mn-primary)] dark:hover:bg-[var(--mn-primary)] border border-[var(--mn-accent)]/60 text-[var(--mn-accent-text)] hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
              aria-label="حساب الطالب"
              title="حساب الطالب وملف المتابعة"
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
              className="min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl bg-[var(--mn-surface)] dark:bg-[var(--mn-surface-elevated)] hover:bg-slate-50 dark:hover:bg-[var(--mn-surface-muted)] border border-slate-200 dark:border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 text-[var(--mn-heading)] dark:text-slate-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
              aria-label="القائمة الرئيسية"
              title="القائمة"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
