import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { ar } from './ar';

type Language = 'ar' | 'en';
type Translations = typeof en;

interface I18nContextType {
  language: Language;
  t: (key: keyof Translations) => string;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries = {
  ar,
  en,
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('manaratak_admin_lang');
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    return 'ar'; // Default admin to Arabic
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('manaratak_admin_lang', lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = (key: keyof Translations): string => {
    return dictionaries[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    const savedLang = localStorage.getItem('manaratak_admin_lang') || localStorage.getItem('manaratak_lang');
    const language: Language = savedLang === 'en' ? 'en' : 'ar';
    const dict = dictionaries[language] || dictionaries.ar;
    return {
      language,
      t: (key: keyof Translations): string => dict[key] || dictionaries.en[key] || (key as string),
      setLanguage: () => {},
      dir: (language === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    };
  }
  return context;
};
