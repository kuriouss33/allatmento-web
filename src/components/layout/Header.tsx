'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  LogOut,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AuthModal } from '@/components/auth/AuthModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { firebaseUser, logout, isAdmin, isRescuer } = useAuth();
  const { t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isHome = pathname === '/';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-black/90 backdrop-blur-md transition-colors shrink-0">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Bal oldal: Főoldalon a logó (kitöltve a containert), aloldalakon vissza nyíl */}
          <div className="flex items-center">
            {isHome ? (
              <Link 
                href="/" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-blue-500/25 dark:border-zinc-700 shadow-sm flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform bg-white dark:bg-zinc-900"
                title={t.navHome || 'Főoldal'}
              >
                <Image 
                  src={`${process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : ''}/logo.png`} 
                  alt={t.appTitle || 'Állatmentő Portál'} 
                  width={44} 
                  height={44} 
                  className="w-full h-full object-cover" 
                  priority 
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm active:scale-95 transition-all shrink-0"
                title={t.backToHome || 'Vissza a főoldalra'}
                aria-label={t.backToHome || 'Vissza a főoldalra'}
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </Link>
            )}
          </div>

          {/* Jobb oldal: Admin (ha be van lépve), Beállítások és Bejelentkezés/Kijelentkezés */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Adminisztráció gomb (kizárólag adminoknak) */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-10 sm:h-11 rounded-xl border transition-all active:scale-95 text-xs font-semibold ${
                  pathname === '/admin'
                    ? 'border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                    : 'border-amber-400/60 dark:border-amber-700/60 bg-amber-50/80 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-zinc-700 shadow-sm'
                }`}
                title={t.badgeAdminTooltip}
                aria-label={t.roleAdminBadge}
              >
                <ShieldAlert className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                <span className="hidden sm:inline font-bold">{t.roleAdminBadge}</span>
              </Link>
            )}

            {/* Jóváhagyott mentő jelvény (kizárólag jóváhagyott mentőknek) */}
            {isRescuer && !isAdmin && (
              <Link
                href="/ugyek"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-10 sm:h-11 rounded-xl border transition-all active:scale-95 text-xs font-semibold ${
                  pathname === '/ugyek'
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'border-emerald-400/60 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-zinc-700 shadow-sm'
                }`}
                title={t.badgeRescuerTooltip}
                aria-label={t.badgeRescuer}
              >
                <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                <span className="hidden sm:inline font-bold">{t.badgeRescuer}</span>
              </Link>
            )}

            {/* Beállítások gomb */}
            <Link
              href="/beallitasok"
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                pathname === '/beallitasok'
                  ? 'border-blue-500 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/30'
                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-sm'
              }`}
              title={t.navSettings}
              aria-label={t.navSettings}
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Bejelentkezés / Fiók gomb */}
            {firebaseUser ? (
              <button
                type="button"
                onClick={() => logout()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-900 text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title={t.logout}
                aria-label={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-blue-500/30 dark:border-zinc-700 bg-blue-50/80 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 text-blue-700 dark:text-zinc-200 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title={t.login}
                aria-label={t.login}
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Rescuer Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
