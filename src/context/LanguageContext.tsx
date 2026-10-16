'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { hu } from '@/locales/hu';
import { en } from '@/locales/en';

type Lang = 'hu' | 'en';
type Translations = typeof hu;

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hu',
  t: hu,
  setLang: () => {},
  toggleLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('hu');

  useEffect(() => {
    const saved = localStorage.getItem('allatmento_lang') as Lang;
    if (saved === 'hu' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('allatmento_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'hu' ? 'en' : 'hu');
  };

  const t = lang === 'en' ? en : hu;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
