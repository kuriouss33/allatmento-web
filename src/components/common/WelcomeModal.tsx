'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  Phone, 
  Database, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const WELCOME_SEEN_KEY = 'allatmento_welcome_seen';

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();

  const basePath = process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : '';
  const logoSrc = `${basePath}/logo.png`;

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(WELCOME_SEEN_KEY);
      if (!hasSeen) {
        setIsOpen(true);
      }
    } catch {
      // Ha a localStorage nem elérhető, alapértelmezésben nyitva tartjuk
      setIsOpen(true);
    }
  }, []);

  // Lehetővé tesszük a manuális újranyitást (pl. a Beállítások menüből)
  useEffect(() => {
    const handleManualOpen = () => setIsOpen(true);
    window.addEventListener('allatmento:open-welcome', handleManualOpen);
    return () => window.removeEventListener('allatmento:open-welcome', handleManualOpen);
  }, []);

  // Háttér görgetés letiltása megnyitott állapotban
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleEnter = () => {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    } catch {
      // Ignoráljuk a tárolási hibákat
    }
    setIsOpen(false);
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pt-safe pb-safe pl-safe pr-safe modal-glass-backdrop animate-backdropFade overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden my-auto animate-modalCard"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Finoman elmosódott logó a háttérben ambient glow hatásként */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0 flex items-center justify-center">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 opacity-10 dark:opacity-15 blur-2xl transform scale-125 select-none">
            <Image
              src={logoSrc}
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Felső információs sáv & Nyelvváltó */}
        <div className="relative z-10 px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.appTitle}</span>
          </div>

          {/* Gyors nyelvválasztó (HU / EN) */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setLang('hu')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                lang === 'hu'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HU 🇭🇺
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN 🇬🇧
            </button>
          </div>
        </div>

        {/* Gördíthető tartalomterület */}
        <div className="relative z-10 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
          
          {/* Fő logó nagyobb méretben a bemutatkozó szöveg felett */}
          <div className="text-center pt-2">
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-500/25 dark:border-blue-400/25 shadow-xl bg-white dark:bg-slate-900 p-1 mb-4 flex items-center justify-center">
              <Image
                src={logoSrc}
                alt={t.appTitle}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                priority
              />
            </div>

            <h1 
              id="welcome-modal-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {t.welcomeTitle}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 max-w-lg mx-auto">
              {t.welcomeSubtitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 max-w-xl mx-auto">
              {t.welcomeIntro}
            </p>
          </div>

          {/* 1. Szekció: Hogyan működik a portál? */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                {t.welcomeHowItWorksTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Lépés 1: Gyors bejelentés */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-zinc-800 border border-blue-200/60 dark:border-zinc-700 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  1. {t.welcomeStep1Title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.welcomeStep1Desc}
                </p>
              </div>

              {/* Lépés 2: Valós idejű térkép */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-zinc-800 border border-emerald-200/60 dark:border-zinc-700 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  2. {t.welcomeStep2Title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.welcomeStep2Desc}
                </p>
              </div>

              {/* Lépés 3: Szervezett mentés */}
              <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-zinc-800 border border-violet-200/60 dark:border-zinc-700 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  3. {t.welcomeStep3Title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.welcomeStep3Desc}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Szekció: Adatvédelmi szabályzat és GDPR tájékoztató */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                {t.welcomeGdprTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.welcomeGdprSubtitle}
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              
              {/* GPS helymeghatározás */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.welcomeGdprLocationTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.welcomeGdprLocationDesc}
                  </p>
                </div>
              </div>

              {/* Kapcsolattartás */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.welcomeGdprContactTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.welcomeGdprContactDesc}
                  </p>
                </div>
              </div>

              {/* Helyi adattárolás */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.welcomeGdprStorageTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.welcomeGdprStorageDesc}
                  </p>
                </div>
              </div>

              {/* Biztonság és Jogok */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.welcomeGdprThirdPartyTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.welcomeGdprThirdPartyDesc}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Rögzített lábléc: "Belépek az oldalra" gomb */}
        <div className="relative z-10 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={handleEnter}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>{t.welcomeEnterBtn}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
};
