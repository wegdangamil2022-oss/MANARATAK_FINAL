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
      icon: <GraduationCap className="w-4 h-4 text-[#005B9F] dark:text-[#E4B343]" />,
    },
    {
      id: 'tracker',
      label: 'نظام متابعة تقدم المتعلمين',
      icon: <ListChecks className="w-4 h-4 text-[#E4B343]" />,
    },
    {
      id: 'ai-tools',
      label: 'أدوات الذكاء الاصطناعي ⚡',
      icon: <Sparkles className="w-4 h-4 text-[#E4B343]" />,
    },
    {
      id: 'favorites',
      label: 'المنح المفضلة والمحفوظة',
      icon: <Heart className="w-4 h-4 text-red-500" />,
    },
    {
      id: 'countries',
      label: 'الدول والوجهات الدراسية',
      icon: <Globe className="w-4 h-4 text-[#E4B343]" />,
    },
    {
      id: 'universities',
      label: 'دليل الجامعات العالمية',
      icon: <Building2 className="w-4 h-4 text-[#005B9F] dark:text-[#E4B343]" />,
    },
    {
      id: 'courses',
      label: 'الدورات التأهيلية المجانية',
      icon: <BookOpen className="w-4 h-4 text-[#005B9F] dark:text-[#E4B343]" />,
    },
    {
      id: 'majors',
      label: 'دليل التخصصات والوظائف',
      icon: <Layers className="w-4 h-4 text-[#005B9F] dark:text-[#E4B343]" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white dark:bg-[#061B2E] max-w-xs w-full h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-right border-l border-slate-100 dark:border-[#14385a]">
        {/* Drawer Header */}
        <div className="bg-[#003B68] dark:bg-[#041627] p-5 text-white border-b border-[#E4B343]/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-7 h-7 rounded-full bg-[#002E52] dark:bg-[#0A2238] hover:bg-black/30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Profile Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#002E52] dark:bg-[#0A2238] border-2 border-[#E4B343] flex items-center justify-center text-[#E4B343] shadow-md">
              <User className="w-6 h-6" />
            </div>
            {userProfile ? (
              <div>
                <h3 className="text-sm font-black text-white">{userProfile.name}</h3>
                <p className="text-[11px] text-[#E4B343] font-bold">{userProfile.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#002E52] dark:bg-[#0A2238] text-[10px] text-slate-200 border border-[#E4B343]/40">
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
                  className="px-3 py-1 bg-[#E4B343] hover:bg-[#c99a32] text-[#041627] text-[11px] font-black rounded-lg transition-colors cursor-pointer"
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
              className="w-full text-right p-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#003B68]/10 dark:hover:bg-[#0A2238] hover:text-[#064D83] dark:hover:text-[#E4B343] flex items-center justify-between transition-colors active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">❯</span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-100 dark:border-[#14385a] my-2" />

          {/* Dark Mode Toggle in Drawer */}
          {onToggleDarkMode && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0A2238] border border-slate-200 dark:border-[#1B476E] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-[#E4B343]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#064D83]" />
                )}
                <span>المظهر / Theme</span>
              </div>
              <button
                onClick={onToggleDarkMode}
                className="px-2.5 py-1 bg-white dark:bg-[#061B2E] border border-slate-200 dark:border-[#1B476E] rounded-lg text-xs font-bold text-[#064D83] dark:text-[#E4B343] cursor-pointer flex items-center gap-1"
              >
                {isDarkMode ? '🌙 ليلي' : '☀️ نهاري'}
              </button>
            </div>
          )}

          {/* Language Toggle in Drawer */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0A2238] border border-slate-200 dark:border-[#1B476E] text-xs flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
              <Globe className="w-4 h-4 text-[#003B68] dark:text-[#E4B343]" />
              <span>اللغة / Language</span>
            </div>
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 bg-white dark:bg-[#061B2E] border border-slate-200 dark:border-[#1B476E] rounded-lg text-xs font-bold text-[#003B68] dark:text-slate-200 cursor-pointer"
            >
              {language === 'ar' ? 'العربية 🇸🇦' : 'English 🇬🇧'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#041627] border-t border-slate-200 dark:border-[#14385a] text-center text-[10px] text-slate-400 dark:text-slate-400">
          منصة منارتك للفرص التعليمية • تصميم الهاتف المحمول
        </div>
      </div>
    </div>
  );
};
