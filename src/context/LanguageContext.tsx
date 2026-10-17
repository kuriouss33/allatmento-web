'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { hu } from '@/locales/hu';
import { en } from '@/locales/en';

export type Lang = 'hu' | 'en';
type Translations = typeof hu;

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  resetToSystemLang: () => void;
  isSystemLang: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hu',
  t: hu,
  setLang: () => {},
  toggleLang: () => {},
  resetToSystemLang: () => {},
  isSystemLang: false,
});

export const detectSystemLang = (): Lang => {
  if (typeof navigator === 'undefined') return 'hu';
  const langs = navigator.languages || [navigator.language];
  for (const l of langs) {
    if (l && l.toLowerCase().startsWith('hu')) return 'hu';
    if (l && l.toLowerCase().startsWith('en')) return 'en';
  }
  return 'hu';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('hu');
  const [isSystemLang, setIsSystemLang] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('allatmento_lang') as Lang;
    if (saved === 'hu' || saved === 'en') {
      setLangState(saved);
      setIsSystemLang(false);
    } else {
      // Alapértelmezett: a telefon / böngésző nyelve
      const systemLang = detectSystemLang();
      setLangState(systemLang);
      setIsSystemLang(true);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    setIsSystemLang(false);
    localStorage.setItem('allatmento_lang', newLang);
  };

  const resetToSystemLang = () => {
    localStorage.removeItem('allatmento_lang');
    const systemLang = detectSystemLang();
    setLangState(systemLang);
    setIsSystemLang(true);
  };

  const toggleLang = () => {
    setLang(lang === 'hu' ? 'en' : 'hu');
  };

  const t = lang === 'en' ? en : hu;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang, resetToSystemLang, isSystemLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
