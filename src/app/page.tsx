'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertCircle, 
  MapPin, 
  PlusCircle, 
  ClipboardList, 
  Building2, 
  BookOpen, 
  Search,
  ShieldCheck, 
  ArrowRight,
  PhoneCall,
  Activity
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getReports } from '@/lib/api';
import { Report } from '@/types';
import { ChipLookupModal } from '@/components/common/ChipLookupModal';

export default function HomePage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [chipModalOpen, setChipModalOpen] = useState(false);

  useEffect(() => {
    getReports().then((data) => setReports(data)).catch(() => {});
  }, []);

  const newCount = reports.filter((r) => r.statusz === 'uj').length;
  const inProgressCount = reports.filter((r) => r.statusz === 'folyamatban').length;
  const resolvedCount = reports.filter((r) => r.statusz === 'megoldva').length;

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-10 space-y-2.5 sm:space-y-8 overflow-y-auto xl:overflow-visible animate-fadeIn">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-4 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>Országos Éjjel-Nappali Hálózat</span>
        </div>

        <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Gyors segítség a bajba jutott állatoknak
        </h1>

        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
          Közvetlen kapcsolat a megtalálók, a lakosság és a hivatalos állatmentő szervezetek között. Jelents be esetet másodpercek alatt!
        </p>

        {/* Kiemelt Fő Menüpontok: "Új bejelentést teszek" és "Bejelentések" */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-1.5 sm:pt-2 w-full max-w-xl mx-auto">
          <Link
            href="/bejelentes"
            className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-3.5 min-h-[56px] sm:min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all pulse-emergency"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="tracking-wide">ÚJ BEJELENTÉST TESZEK</span>
          </Link>

          <Link
            href="/terkep"
            className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-3.5 min-h-[56px] sm:min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
          >
            <MapPin className="w-5 h-5 shrink-0" />
            <span className="tracking-wide">BEJELENTÉSEK</span>
          </Link>
        </div>
      </div>

      {/* Live Status Stats Bar (Aktív, Folyamatban, Megoldott ügy counterek) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl mx-auto w-full shrink-0">
        <Link
          href="/terkep"
          className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center hover:border-red-400 dark:hover:border-red-600 hover:shadow-md transition-all group"
        >
          <span className="block text-xl sm:text-3xl font-black text-red-600 dark:text-red-500">
            {newCount}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            Aktív ügyek
          </span>
        </Link>

        <Link
          href="/terkep"
          className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
        >
          <span className="block text-xl sm:text-3xl font-black text-amber-500">
            {inProgressCount}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
            Folyamatban
          </span>
        </Link>

        <Link
          href="/terkep"
          className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group"
        >
          <span className="block text-xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Megoldott
          </span>
        </Link>
      </div>

      {/* További Menük (Action Cards Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 shrink-0">
        
        {/* Szervezetek */}
        <Link
          href="/szervezetek"
          className="group p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center"
        >
          <div className="space-y-1.5 sm:space-y-3 flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white leading-tight text-center">
              {t.navOrgs}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              Állatorvosok, ügyeletek, menhelyek és hatóságok elérhetősége közvetlen hívással.
            </p>
          </div>
          <div className="pt-1.5 sm:pt-4 flex items-center justify-center text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Keresés</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </div>
        </Link>

        {/* Elsősegély */}
        <Link
          href="/kisokos"
          className="group p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center"
        >
          <div className="space-y-1.5 sm:space-y-3 flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white leading-tight text-center">
              {t.navGuide}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              Gyakorlati tanácsok gázolt kutyák, fiókák, sérült vadak szakszerű mentéséhez.
            </p>
          </div>
          <div className="pt-1.5 sm:pt-4 flex items-center justify-center text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Útmutatók</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </div>
        </Link>

        {/* Saját ügyeim */}
        <Link
          href="/ugyek"
          className="group p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center"
        >
          <div className="space-y-1.5 sm:space-y-3 flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white leading-tight text-center">
              {t.navMyCases}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              Az általad beküldött és mentőként elvállalt bejelentések áttekintése.
            </p>
          </div>
          <div className="pt-1.5 sm:pt-4 flex items-center justify-center text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Megnyitás</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </div>
        </Link>

        {/* Chipszám kereső */}
        <div
          onClick={() => setChipModalOpen(true)}
          className="group p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center cursor-pointer"
        >
          <div className="space-y-1.5 sm:space-y-3 flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white leading-tight text-center">
              Chipszám Kereső
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              15 jegyű ISO mikrochip azonnali ellenőrzése a hivatalos nyilvántartásokban.
            </p>
          </div>
          <div className="pt-1.5 sm:pt-4 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Keresés</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </div>
        </div>

      </div>

      <ChipLookupModal isOpen={chipModalOpen} onClose={() => setChipModalOpen(false)} />
    </div>
  );
}
