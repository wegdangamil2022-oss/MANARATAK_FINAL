import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { ar } from './ar';

type Language = 'ar' | 'en';
type Translations = typeof en;

interface I18nContextType {
  language: Language;
  t: (key: keyof Translations | (string & {})) => string;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries = {
  ar,
  en,
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('manaratak_lang');
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    return 'ar'; // Default to Arabic
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('manaratak_lang', lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = (key: string): string => {
    return (dictionaries[language] as Record<string, string>)[key] || key;
  };

  const isRTL = dir === 'rtl';

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, dir, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
