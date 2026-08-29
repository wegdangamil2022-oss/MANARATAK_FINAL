import React from 'react';
import { Home, Search, Heart, Sparkles, Menu } from 'lucide-react';

export type TabType = 'home' | 'search' | 'favorites' | 'ai-tools' | 'tracker' | 'auth' | 'more';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  favoritesCount: number;
  activeTrackerCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  activeTrackerCount,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'الرئيسية',
      icon: (isActive: boolean) => (
        <Home
          className={`w-5 h-5 transition-transform duration-200 ${
            isActive
              ? 'stroke-[2.5] text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] scale-110'
              : 'stroke-[1.8] text-slate-500 dark:text-slate-400'
          }`}
        />
      ),
    },
    {
      id: 'search' as TabType,
      label: 'بحث',
      icon: (isActive: boolean) => (
        <Search
          className={`w-5 h-5 transition-transform duration-200 ${
            isActive
              ? 'stroke-[2.5] text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] scale-110'
              : 'stroke-[1.8] text-slate-500 dark:text-slate-400'
          }`}
        />
      ),
    },
    {
      id: 'favorites' as TabType,
      label: 'المفضلة',
      icon: (isActive: boolean) => (
        <div className="relative">
          <Heart
            className={`w-5 h-5 transition-transform duration-200 ${
              isActive
                ? 'stroke-[2.5] fill-[var(--mn-accent)] text-[var(--mn-accent-text)] scale-110'
                : 'stroke-[1.8] text-slate-500 dark:text-slate-400'
            }`}
          />
          {favoritesCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 bg-[var(--mn-accent)] text-slate-950 font-black text-[8px] rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {favoritesCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'ai-tools' as TabType,
      label: 'أدوات ذكية',
      icon: (isActive: boolean) => (
        <div className="relative flex items-center justify-center">
          <Sparkles
            className={`w-5 h-5 transition-transform duration-200 ${
              isActive
                ? 'stroke-[2.5] text-[var(--mn-accent-text)] fill-[var(--mn-accent)] scale-115'
                : 'stroke-[1.8] text-amber-500 fill-amber-500/20'
            }`}
          />
          {/* Glowing Blinking Light Effect */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-xs" />
          </span>
        </div>
      ),
    },
    {
      id: 'tracker' as TabType,
      label: 'المزيد',
      icon: (isActive: boolean) => (
        <div className="relative">
          <Menu
            className={`w-5 h-5 transition-transform duration-200 ${
              isActive
                ? 'stroke-[2.5] text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] scale-110'
                : 'stroke-[1.8] text-slate-500 dark:text-slate-400'
            }`}
          />
          {activeTrackerCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] rounded-full ring-2 ring-white dark:ring-[#041627]" />
          )}
        </div>
      ),
    },
  ];

  return (
    <nav
      id="manaratak-bottom-nav"
      className="w-full select-none fixed bottom-0 left-0 right-0 z-[99999] bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] border-t-2 border-slate-200 dark:border-[var(--mn-border)] shadow-[0_-6px_25px_rgba(0,0,0,0.15)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.5)] pt-1.5 pb-[max(8px,env(safe-area-inset-bottom,8px))] transition-colors"
    >
      <div className="max-w-md mx-auto flex items-center justify-around w-full px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 active:scale-90 relative cursor-pointer ${
                isActive
                  ? 'text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Icon */}
              <div className="relative mb-0.5 flex items-center justify-center">
                {tab.icon(isActive)}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] leading-tight font-medium ${
                  isActive
                    ? 'text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] !font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Tab Dot Indicator */}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[var(--mn-accent)] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
