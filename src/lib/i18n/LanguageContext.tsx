'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, type Dictionary } from './dictionaries';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  t: Dictionary;
  toggleLang: () => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  // On mount, check local storage or default to 'en'
  useEffect(() => {
    const storedLang = localStorage.getItem('appLang') as Language;
    if (storedLang && (storedLang === 'en' || storedLang === 'ar')) {
      setLang(storedLang);
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = storedLang;
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('appLang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const t = dictionaries[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, dir }}>
      <div dir={dir} className="min-h-screen">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
