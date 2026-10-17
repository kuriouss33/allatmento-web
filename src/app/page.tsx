'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  MapPin, 
  Building2, 
  BookOpen, 
  Search, 
  ClipboardList, 
  BarChart3, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ChipLookupModal } from '@/components/common/ChipLookupModal';

export default function HomePage() {
  const { t } = useLanguage();
  const [chipModalOpen, setChipModalOpen] = useState(false);

  // A menüpontok egységesen a jóváhagyott 3. domináns színt (Smaragdzöld / Emerald) használják
  const secondaryCards = [
    {
      href: '/szervezetek',
      title: t.navOrgs || 'Szervezetek & Menhelyek',
      description: 'Állatorvosok, ügyeletek, menhelyek és hatóságok közvetlen hívással.',
      icon: Building2,
      actionText: 'Keresés',
    },
    {
      href: '/kisokos',
      title: t.navGuide || 'Elsősegély Kisokos',
      description: 'Gyakorlati teendők sérült, gázolt állatok szakszerű elsősegélyéhez.',
      icon: BookOpen,
      actionText: 'Útmutatók',
    },
    {
      onClick: () => setChipModalOpen(true),
      title: 'Chipszám Kereső',
      description: '15 jegyű ISO mikrochip ellenőrzése a hivatalos nyilvántartásokban.',
      icon: Search,
      actionText: 'Keresés',
    },
    {
      href: '/statisztika',
      title: 'Statisztikák & Gócpontok',
      description: 'Valós idejű országos adatok, gócpontok és mentett állatfajták toplistája.',
      icon: BarChart3,
      actionText: 'Megtekintés',
    },
    {
      href: '/ugyek',
      title: t.navMyCases || 'Saját ügyeim',
      description: 'Az általad beküldött és elvállalt bejelentések követése.',
      icon: ClipboardList,
      actionText: 'Megnyitás',
    },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-7 animate-fadeIn">
      
      {/* Hero Header - Letisztult, felesleges marketing szövegek nélkül */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Állatmentő Portál
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          Országos sürgősségi segítség bajba jutott állatoknak
        </p>

        {/* 1. Szín: Piros (Új bejelentés) és 2. Szín: Kék (Bejelentések & Térkép) */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2 w-full">
          <Link
            href="/bejelentes"
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[58px] sm:min-h-[52px] rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all pulse-emergency"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="tracking-wide uppercase">ÚJ BEJELENTÉST TESZEK</span>
          </Link>

          <Link
            href="/terkep"
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[58px] sm:min-h-[52px] rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
          >
            <MapPin className="w-6 h-6 shrink-0" />
            <span className="tracking-wide uppercase">BEJELENTÉSEK TÉRKÉPEN</span>
          </Link>
        </div>
      </div>

      {/* 3. Szín: Smaragdzöld (Emerald) - További menüpontok */}
      {/* Mobilon 1 oszlopos, ujjbarát, kényelmes kártyák a nem tech-savvy felhasználóknak */}
      <div className="pt-1 sm:pt-3">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            További funkciók és segítség
          </h2>
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {secondaryCards.map((card, idx) => {
            const Icon = card.icon;
            const CardContent = (
              <>
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-0.5 text-left flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 pl-2 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </>
            );

            if (card.onClick) {
              return (
                <div
                  key={idx}
                  onClick={card.onClick}
                  className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
                >
                  {CardContent}
                </div>
              );
            }

            return (
              <Link
                key={idx}
                href={card.href!}
                className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between active:scale-[0.99]"
              >
                {CardContent}
              </Link>
            );
          })}
        </div>
      </div>

      <ChipLookupModal isOpen={chipModalOpen} onClose={() => setChipModalOpen(false)} />
    </div>
  );
}
