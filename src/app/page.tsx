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
  ShieldAlert,
  Truck
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ChipLookupModal } from '@/components/common/ChipLookupModal';

export default function HomePage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [chipModalOpen, setChipModalOpen] = useState(false);

  // A menüpontok egységesen a jóváhagyott 3. domináns színt (Smaragdzöld / Emerald) használják
  const secondaryCards = [
    {
      href: '/ugyek',
      title: t.navMyCases,
      description: t.myCasesCardDesc,
      icon: ClipboardList,
      actionText: t.myCasesCardAction,
    },
    {
      href: '/fuvar',
      title: t.transportCardTitle || t.navTransport,
      description: t.transportCardDesc,
      icon: Truck,
      actionText: t.transportCardAction,
    },
    {
      href: '/szervezetek',
      title: t.navOrgs,
      description: t.orgsCardDesc,
      icon: Building2,
      actionText: t.orgsCardAction,
    },
    {
      href: '/kisokos',
      title: t.navGuide,
      description: t.guideCardDesc,
      icon: BookOpen,
      actionText: t.guideCardAction,
    },
    {
      href: '/statisztika',
      title: t.statsCardTitle,
      description: t.statsCardDesc,
      icon: BarChart3,
      actionText: t.statsCardAction,
    },
    {
      onClick: () => setChipModalOpen(true),
      title: t.chipCardTitle,
      description: t.chipCardDesc,
      icon: Search,
      actionText: t.chipCardAction,
    },
    ...(isAdmin ? [{
      href: '/admin',
      title: t.adminCardTitle,
      description: t.adminCardDesc,
      icon: ShieldAlert,
      actionText: t.adminCardAction,
      isAdminCard: true,
    }] : []),
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-7 animate-fadeIn">
      
      {/* Hero Header - Letisztult, felesleges marketing szövegek nélkül */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t.appTitle}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          {t.heroSub}
        </p>

        {/* 1. Szín: Piros (Új bejelentés) és 2. Szín: Kék (Bejelentések & Térkép) */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2 w-full">
          <Link
            href="/bejelentes"
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[58px] sm:min-h-[52px] rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all pulse-emergency"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="tracking-wide uppercase">{t.btnReportEmergency}</span>
          </Link>

          <Link
            href="/terkep"
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[58px] sm:min-h-[52px] rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
          >
            <MapPin className="w-6 h-6 shrink-0" />
            <span className="tracking-wide uppercase">{t.btnViewMap}</span>
          </Link>
        </div>
      </div>

      {/* 3. Szín: Smaragdzöld (Emerald) - További menüpontok */}
      {/* Mobilon 1 oszlopos, ujjbarát, kényelmes kártyák a nem tech-savvy felhasználóknak */}
      <div className="pt-1 sm:pt-3">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.moreFeaturesHelp}
          </h2>
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {secondaryCards.map((card, idx) => {
            const Icon = card.icon;
            const isAdminCard = (card as any).isAdminCard;

            const CardContent = (
              <>
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                    isAdminCard
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-0.5 text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug truncate transition-colors ${
                        isAdminCard
                          ? 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                          : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}>
                        {card.title}
                      </h3>
                      {isAdminCard && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center text-xs font-bold pl-2 shrink-0 group-hover:translate-x-0.5 transition-transform ${
                  isAdminCard
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </>
            );

            const containerClasses = `group p-3.5 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${
              isAdminCard
                ? 'bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-700/60 hover:border-amber-500'
                : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80'
            }`;

            if (card.onClick) {
              return (
                <div
                  key={idx}
                  onClick={card.onClick}
                  className={containerClasses}
                >
                  {CardContent}
                </div>
              );
            }

            return (
              <Link
                key={idx}
                href={card.href!}
                className={containerClasses}
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
