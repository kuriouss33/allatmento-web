'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ActiveTheme;
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemePreference) => void;
  resetToSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themePreference: 'system',
  toggleTheme: () => {},
  setTheme: () => {},
  resetToSystemTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>('light');

  const applyTheme = (t: ActiveTheme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    setActiveTheme(t);
  };

  useEffect(() => {
    const saved = localStorage.getItem('allatmento_theme_pref') as ThemePreference;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = (pref: ThemePreference): ActiveTheme => {
      if (pref === 'dark') return 'dark';
      if (pref === 'light') return 'light';
      return mediaQuery.matches ? 'dark' : 'light';
    };

    if (saved === 'light' || saved === 'dark') {
      setThemePreference(saved);
      applyTheme(saved);
    } else {
      // Alapértelmezett: telefon/rendszer témája
      setThemePreference('system');
      applyTheme(resolveTheme('system'));
    }

    // Rendszer téma változásának automatikus követése (pl. este a telefon sötét módra vált)
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const currentPref = (localStorage.getItem('allatmento_theme_pref') as ThemePreference) || 'system';
      if (currentPref === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const setTheme = (newPref: ThemePreference) => {
    setThemePreference(newPref);
    if (newPref === 'system') {
      localStorage.removeItem('allatmento_theme_pref');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isDark ? 'dark' : 'light');
    } else {
      localStorage.setItem('allatmento_theme_pref', newPref);
      applyTheme(newPref);
    }
  };

  const resetToSystemTheme = () => {
    setTheme('system');
  };

  const toggleTheme = () => {
    const next = activeTheme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: activeTheme, 
      themePreference, 
      toggleTheme, 
      setTheme, 
      resetToSystemTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
