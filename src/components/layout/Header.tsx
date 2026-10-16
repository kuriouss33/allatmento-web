'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  MapPin, 
  PlusCircle, 
  ClipboardList, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  LogIn,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { AuthModal } from '@/components/auth/AuthModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { firebaseUser, profile, logout, isRescuer, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { href: '/terkep', label: t.navMap, icon: MapPin },
    { href: '/ugyek', label: t.navMyCases, icon: ClipboardList },
    { href: '/bejelentes', label: t.navNew, icon: PlusCircle, isAction: true },
    { href: '/szervezetek', label: t.navOrgs, icon: Building2 },
    { href: '/kisokos', label: t.navGuide, icon: BookOpen },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: t.navAdmin, icon: ShieldAlert, isAction: false });
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-blue-500/30 dark:border-blue-400/20 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform" style={{ position: 'relative' }}>
              <Image src="/logo.png" alt="Állatmentő Portál" width={36} height={36} className="w-full h-full object-cover" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden xl:inline-block">
                {t.appSub}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 flex-nowrap shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              if (link.isAction) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap ml-1"
                  >
                    <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 opacity-80" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Controls & Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              title="Váltás nyelvet / Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              title="Téma váltása"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Status / Role Badge */}
            {profile && (
              <span
                className={`hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  isAdmin
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : isRescuer
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isAdmin
                    ? t.roleSuperAdmin
                    : isRescuer
                    ? t.roleVerifiedRescuer
                    : t.rolePending}
                </span>
              </span>
            )}

            {/* Auth Buttons */}
            {firebaseUser ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-900 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 dark:border-blue-400/30 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t.login}</span>
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
