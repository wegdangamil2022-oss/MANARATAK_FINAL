import React from 'react';
import {
  X,
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  Sparkles,
  Heart,
  ListChecks,
  Globe,
  Moon,
  Sun,
} from 'lucide-react';
import { Language, UserProfile } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  language: Language;
  onToggleLanguage: () => void;
  onNavigate: (tab: any) => void;
  isPhoneFrame?: boolean;
  onTogglePhoneFrame?: () => void;
  unreadCount: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  language,
  onToggleLanguage,
  onNavigate,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: (
        <GraduationCap className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
      ),
    },
    {
      id: 'tracker',
      label: 'نظام متابعة تقدم المتعلمين',
      icon: <ListChecks className="w-4 h-4 text-[var(--mn-accent-text)]" />,
    },
    {
      id: 'ai-tools',
      label: 'أدوات الذكاء الاصطناعي ⚡',
      icon: <Sparkles className="w-4 h-4 text-[var(--mn-accent-text)]" />,
    },
    {
      id: 'favorites',
      label: 'المنح المفضلة والمحفوظة',
      icon: <Heart className="w-4 h-4 text-red-500" />,
    },
    {
      id: 'countries',
      label: 'الدول والوجهات الدراسية',
      icon: <Globe className="w-4 h-4 text-[var(--mn-accent-text)]" />,
    },
    {
      id: 'universities',
      label: 'دليل الجامعات العالمية',
      icon: (
        <Building2 className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
      ),
    },
    {
      id: 'courses',
      label: 'الدورات التأهيلية المجانية',
      icon: (
        <BookOpen className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
      ),
    },
    {
      id: 'majors',
      label: 'دليل التخصصات والوظائف',
      icon: (
        <Layers className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] max-w-xs w-full h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-right border-l border-slate-100 dark:border-[var(--mn-border)]">
        {/* Drawer Header */}
        <div className="bg-[var(--mn-primary)] dark:bg-[var(--mn-surface)] p-5 text-white border-b border-[var(--mn-accent)]/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-7 h-7 rounded-full bg-[#002E52] dark:bg-[var(--mn-surface-elevated)] hover:bg-black/30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Profile Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#002E52] dark:bg-[var(--mn-surface-elevated)] border-2 border-[var(--mn-accent)] flex items-center justify-center text-[var(--mn-accent-text)] shadow-md">
              <User className="w-6 h-6" />
            </div>
            {userProfile ? (
              <div>
                <h3 className="text-sm font-black text-white">{userProfile.name}</h3>
                <p className="text-[11px] text-[var(--mn-accent-text)] font-bold">
                  {userProfile.email}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#002E52] dark:bg-[var(--mn-surface-elevated)] text-[10px] text-slate-200 border border-[var(--mn-accent)]/40">
                  <span>المعدل: {userProfile.gpa}</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-black text-white mb-1">زائر جديد</h3>
                <button
                  onClick={() => {
                    onNavigate('auth');
                    onClose();
                  }}
                  className="px-3 py-1 bg-[var(--mn-accent)] hover:bg-[#c99a32] text-[#041627] text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                >
                  تسجيل الدخول / حساب جديد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className="w-full text-right p-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[var(--mn-primary)]/10 dark:hover:bg-[var(--mn-surface-muted)] hover:text-[var(--mn-heading)] dark:hover:text-[var(--mn-accent-text)] flex items-center justify-between transition-colors active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">❯</span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-100 dark:border-[var(--mn-border)] my-2" />

          {/* Dark Mode Toggle in Drawer */}
          {onToggleDarkMode && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[var(--mn-surface-elevated)] border border-slate-200 dark:border-[var(--mn-border)] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-[var(--mn-accent-text)]" />
                ) : (
                  <Moon className="w-4 h-4 text-[var(--mn-heading)]" />
                )}
                <span>المظهر / Theme</span>
              </div>
              <button
                onClick={onToggleDarkMode}
                className="px-2.5 py-1 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] border border-slate-200 dark:border-[var(--mn-border)] rounded-lg text-xs font-bold text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] cursor-pointer flex items-center gap-1"
              >
                {isDarkMode ? '🌙 ليلي' : '☀️ نهاري'}
              </button>
            </div>
          )}

          {/* Language Toggle in Drawer */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[var(--mn-surface-elevated)] border border-slate-200 dark:border-[var(--mn-border)] text-xs flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
              <Globe className="w-4 h-4 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
              <span>اللغة / Language</span>
            </div>
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] border border-slate-200 dark:border-[var(--mn-border)] rounded-lg text-xs font-bold text-[var(--mn-heading)] dark:text-slate-200 cursor-pointer"
            >
              {language === 'ar' ? 'العربية 🇸🇦' : 'English 🇬🇧'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[var(--mn-surface)] border-t border-slate-200 dark:border-[var(--mn-border)] text-center text-[10px] text-slate-400 dark:text-slate-400">
          منصة منارتك للفرص التعليمية • تصميم الهاتف المحمول
        </div>
      </div>
    </div>
  );
};
