'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontSize = 'normal' | 'large' | 'larger';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: 'normal',
  setFontSize: () => {},
});

const STORAGE_KEY = 'allatmento_font_size';

const applyFontSizeToDOM = (size: FontSize) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Set data-font-size attribute for CSS selectors
  root.setAttribute('data-font-size', size);

  // Set root font size:
  // normal = 100% (16px base)
  // large = 112.5% (18px base -> +12.5%)
  // larger = 125% (20px base -> +25%)
  if (size === 'larger') {
    root.style.fontSize = '125%';
  } else if (size === 'large') {
    root.style.fontSize = '112.5%';
  } else {
    root.style.fontSize = '100%';
  }
};

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as FontSize;
      if (saved === 'normal' || saved === 'large' || saved === 'larger') {
        setFontSizeState(saved);
        applyFontSizeToDOM(saved);
      } else {
        applyFontSizeToDOM('normal');
      }
    } catch {
      // LocalStorage might fail in restricted environments
      applyFontSizeToDOM('normal');
    }
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch {
      // Ignore localStorage errors
    }
    applyFontSizeToDOM(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);
