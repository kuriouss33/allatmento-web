'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Sun, 
  Moon, 
  Smartphone, 
  Check, 
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { lang, setLang, resetToSystemLang, isSystemLang, t } = useLanguage();
  const { theme, themePreference, setTheme } = useTheme();
  const { isAdmin } = useAuth();

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t.settingsSub}
        </p>
      </div>

      {/* 1. Kártya: Nyelv beállítása */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.settingsLangSection}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.settingsLangDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Magyar */}
          <button
            type="button"
            onClick={() => setLang('hu')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              lang === 'hu' && !isSystemLang
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-bold text-sm block">
                Magyar (HU) 🇭🇺
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Alkalmazás magyar nyelven
              </span>
            </div>
            {lang === 'hu' && !isSystemLang && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              lang === 'en' && !isSystemLang
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-bold text-sm block">
                English (EN) 🇬🇧
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                English language
              </span>
            </div>
            {lang === 'en' && !isSystemLang && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        </div>

        {/* Telefon / Rendszer nyelve szerinti automatikus gomb */}
        <button
          type="button"
          onClick={resetToSystemLang}
          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
            isSystemLang
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold block">
                Telefon nyelve alapján (Automatikus)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                A rendszer preferenciái szerint választ nyelvet
              </span>
            </div>
          </div>
          {isSystemLang && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
              Aktív
            </span>
          )}
        </button>
      </div>

      {/* 2. Kártya: Megjelenés és téma */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.settingsThemeSection}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.settingsThemeDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Telefon / Rendszer */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
              themePreference === 'system'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {themePreference === 'system' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm block">
                {t.settingsThemeSystem}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Követi a telefont
              </span>
            </div>
          </button>

          {/* Világos */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
              themePreference === 'light'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Sun className="w-5 h-5 text-amber-500" />
              {themePreference === 'light' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm block">
                {t.settingsThemeLight}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Tiszta, világos felület
              </span>
            </div>
          </button>

          {/* Sötét */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
              themePreference === 'dark'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Moon className="w-5 h-5 text-indigo-400" />
              {themePreference === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm block">
                {t.settingsThemeDark}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Kíméli a szemet éjjel
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Adminisztrációs Vezérlőpult - Kizárólag Adminisztrátoroknak */}
      {isAdmin && (
        <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-700/60 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Adminisztrációs Pult
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Felhasználók kezelése, mentői jogosultságok kiemelése és profilok adminisztrációja
                </p>
              </div>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-sm self-start sm:self-auto shrink-0"
            >
              <span>Vezérlőpult megnyitása</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Kártya: Információk */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Állatmentő Portál Web v1.0.0</span>
        </div>
      </div>

    </div>
  );
}
