'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ClipboardList, Plus, Building2, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 sm:px-4 py-1 shadow-lg safe-bottom shrink-0">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        
        {/* Térkép */}
        <Link
          href="/terkep"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-w-0 transition-colors ${
            pathname === '/terkep'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">{t.navMap}</span>
        </Link>

        {/* Saját ügyek */}
        <Link
          href="/ugyek"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-w-0 transition-colors ${
            pathname === '/ugyek'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">{t.navMyCases}</span>
        </Link>

        {/* Central Raised Action Button (SOS Bejelentés) */}
        <div className="flex-1 flex justify-center -mt-6 shrink-0">
          <Link
            href="/bejelentes"
            aria-label={t.navNew}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/35 border-3 border-white dark:border-slate-900 active:scale-95 transition-transform"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>

        {/* Szervezetek */}
        <Link
          href="/szervezetek"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-w-0 transition-colors ${
            pathname === '/szervezetek'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">{t.navOrgs}</span>
        </Link>

        {/* Kisokos */}
        <Link
          href="/kisokos"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-w-0 transition-colors ${
            pathname === '/kisokos'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">{t.navGuide}</span>
        </Link>

      </div>
    </nav>
  );
};
