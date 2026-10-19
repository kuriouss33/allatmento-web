'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Sun, 
  Moon, 
  Smartphone, 
  Check, 
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  ALargeSmall,
  Layers
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useFontSize, FontSize } from '@/context/FontSizeContext';
import { useAuth } from '@/context/AuthContext';

interface SettingOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  isActive: boolean;
  onClick: () => void;
}

export default function SettingsPage() {
  const { lang, setLang, resetToSystemLang, isSystemLang, t } = useLanguage();
  const { theme, themePreference, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { isAdmin } = useAuth();

  // 1. Nyelv beállítási opciók (egységes 3-as lista)
  const languageOptions: SettingOption[] = [
    {
      id: 'hu',
      icon: <span className="text-lg leading-none" role="img" aria-label="Magyarország">🇭🇺</span>,
      title: 'Magyar (HU)',
      desc: t.settingsLangHuDesc,
      isActive: lang === 'hu' && !isSystemLang,
      onClick: () => setLang('hu'),
    },
    {
      id: 'en',
      icon: <span className="text-lg leading-none" role="img" aria-label="English">🇬🇧</span>,
      title: 'English (EN)',
      desc: t.settingsLangEnDesc,
      isActive: lang === 'en' && !isSystemLang,
      onClick: () => setLang('en'),
    },
    {
      id: 'auto',
      icon: <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      title: t.settingsLangAuto,
      desc: t.settingsLangAutoDesc,
      isActive: isSystemLang,
      onClick: resetToSystemLang,
    },
  ];

  // 2. Megjelenés és téma opciók (egységes 3-as lista)
  const themeOptions: SettingOption[] = [
    {
      id: 'system',
      icon: <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      title: t.settingsThemeSystem,
      desc: t.settingsThemeSystemDesc,
      isActive: themePreference === 'system',
      onClick: () => setTheme('system'),
    },
    {
      id: 'light',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      title: t.settingsThemeLight,
      desc: t.settingsThemeLightDesc,
      isActive: themePreference === 'light',
      onClick: () => setTheme('light'),
    },
    {
      id: 'dark',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      title: t.settingsThemeDark,
      desc: t.settingsThemeDarkDesc,
      isActive: themePreference === 'dark',
      onClick: () => setTheme('dark'),
    },
  ];

  // 3. Betűméret skálázás opciók (egységes 3-as lista)
  const fontSizeOptions: SettingOption[] = [
    {
      id: 'normal',
      icon: (
        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300">
          100%
        </span>
      ),
      title: t.fontSizeNormal,
      desc: t.fontSizeNormalDesc,
      isActive: fontSize === 'normal',
      onClick: () => setFontSize('normal'),
    },
    {
      id: 'large',
      icon: (
        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300">
          +12%
        </span>
      ),
      title: t.fontSizeLarge,
      desc: t.fontSizeLargeDesc,
      isActive: fontSize === 'large',
      onClick: () => setFontSize('large'),
    },
    {
      id: 'larger',
      icon: (
        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
          +25%
        </span>
      ),
      title: t.fontSizeLarger,
      desc: t.fontSizeLargerDesc,
      badge: t.settingsAutoBadge,
      isActive: fontSize === 'larger',
      onClick: () => setFontSize('larger'),
    },
  ];

  // Aktuális állapot címkék a kártyák fejlécéhez
  const currentLangLabel = isSystemLang 
    ? `${t.activeBadge}: Auto (${lang.toUpperCase()})`
    : lang === 'hu' ? 'Magyar 🇭🇺' : 'English 🇬🇧';

  const currentThemeLabel = themePreference === 'system'
    ? `${t.activeBadge}: Auto (${theme === 'dark' ? 'Sötét' : 'Világos'})`
    : themePreference === 'dark' ? t.settingsThemeDark : t.settingsThemeLight;

  const currentFontSizeLabel = fontSize === 'normal' 
    ? '100% · Normál' 
    : fontSize === 'large' ? '+12% · Nagy' : '+25% · Nagyobb';

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 animate-fadeIn">
      
      {/* Oldal Fejléc */}
      <div className="pb-3 border-b border-slate-200 dark:border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t.settingsSub}
        </p>
      </div>

      {/* 1. Szekció: Nyelv beállítása */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t.settingsLangSection}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.settingsLangDesc}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {currentLangLabel}
          </span>
        </div>

        {/* 3 Egységes Választó Kapcsoló */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {languageOptions.map((opt) => renderSettingTile(opt))}
        </div>
      </div>

      {/* 2. Szekció: Megjelenés és téma */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t.settingsThemeSection}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.settingsThemeDesc}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {currentThemeLabel}
          </span>
        </div>

        {/* 3 Egységes Választó Kapcsoló */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {themeOptions.map((opt) => renderSettingTile(opt))}
        </div>
      </div>

      {/* 3. Szekció: Szöveg- és betűméret */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <ALargeSmall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t.settingsFontSizeSection}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.settingsFontSizeDesc}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            {currentFontSizeLabel}
          </span>
        </div>

        {/* 3 Egységes Választó Kapcsoló */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {fontSizeOptions.map((opt) => renderSettingTile(opt))}
        </div>

        {/* Élő előnézet minta */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
          <span className="font-semibold text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
            {t.fontSizePreviewTitle}:
          </span>
          <span className="font-medium text-xs sm:text-sm text-slate-700 dark:text-zinc-300 text-right truncate">
            {t.fontSizePreviewSample}
          </span>
        </div>
      </div>

      {/* Adminisztrációs Vezérlőpult - Kizárólag Adminisztrátoroknak */}
      {isAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-600/40 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.adminPanelTitle}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.adminPanelDesc}
                </p>
              </div>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-sm self-start sm:self-auto shrink-0"
            >
              <span>{t.openAdminPanel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Bemutató és Adatvédelem újramegtekintése */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.welcomeHowItWorksTitle} & {t.welcomeGdprTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.welcomeGdprSubtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('allatmento:open-welcome'))}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
        >
          {t.welcomeReopenLink}
        </button>
      </div>

      {/* Alkalmazás verzió információ */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <span>{t.appTitle} Web v1.0.0</span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-zinc-500">
          PWA & Standalone Ready
        </span>
      </div>

    </div>
  );
}

/**
 * Egységesített Választó Kapcsoló Kártya
 * Mind a 3 szekcióban (Nyelv, Megjelenés, Betűméret) pontosan ugyanolyan mérettel,
 * felépítéssel és kapcsoló-indikátorral rendelkezik.
 */
function renderSettingTile(opt: SettingOption) {
  return (
    <button
      key={opt.id}
      type="button"
      onClick={opt.onClick}
      className={`group relative p-3 sm:p-4 rounded-xl border text-left transition-all flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 ${
        opt.isActive
          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-zinc-800/90 shadow-sm ring-1 ring-blue-500/30 text-slate-900 dark:text-white'
          : 'border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
      }`}
    >
      {/* Mobilon bal oldal / Asztali gépen felső sáv */}
      <div className="flex items-center gap-3 sm:justify-between sm:w-full">
        <div className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          {opt.icon}
        </div>

        {/* Mobilos középső szövegblokk */}
        <div className="sm:hidden flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm block text-slate-900 dark:text-white truncate">
              {opt.title}
            </span>
            {opt.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
                {opt.badge}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
            {opt.desc}
          </span>
        </div>

        {/* Asztali gépes rádiógomb / kapcsoló indikátor */}
        <div
          className={`hidden sm:flex w-5 h-5 rounded-full items-center justify-center transition-all ${
            opt.isActive
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
              : 'border-2 border-slate-300 dark:border-zinc-700 group-hover:border-slate-400 dark:group-hover:border-zinc-600'
          }`}
        >
          {opt.isActive && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {/* Asztali gépes alsó szövegblokk */}
      <div className="hidden sm:block space-y-0.5 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm block text-slate-900 dark:text-white">
            {opt.title}
          </span>
          {opt.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
              {opt.badge}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-1">
          {opt.desc}
        </span>
      </div>

      {/* Mobilos jobb oldali kapcsoló indikátor */}
      <div
        className={`sm:hidden w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
          opt.isActive
            ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
            : 'border-2 border-slate-300 dark:border-zinc-700 group-hover:border-slate-400 dark:group-hover:border-zinc-600'
        }`}
      >
        {opt.isActive && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
    </button>
  );
}
