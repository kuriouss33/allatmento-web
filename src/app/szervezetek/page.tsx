'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Phone, 
  MapPin, 
  Filter, 
  Stethoscope, 
  ShieldAlert, 
  Bird, 
  Home 
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MEGYEK } from '@/lib/constants';
import { Organization, OrgCategory } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAutoHideOnScroll } from '@/hooks';
import { ORGANIZATIONS } from '@/data/organizationsData';

export default function OrganizationsPage() {
  const { t } = useLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(ORGANIZATIONS);
  const [loading, setLoading] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<'all' | OrgCategory>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isVisible: isFilterVisible,
    setIsVisible: setIsFilterVisible,
    scrollRef,
    handleScroll,
  } = useAutoHideOnScroll<HTMLDivElement>({
    threshold: 12,
    topOffset: 25,
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        if (!db) return;
        const snap = await getDocs(collection(db, 'szervezetek'));
        if (!snap.empty) {
          const list: Organization[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Organization));
          
          // Merge: keep all baseline ORGANIZATIONS and add/override any custom Firestore items
          const map = new Map<string, Organization>();
          ORGANIZATIONS.forEach((o) => map.set(o.id, o));
          list.forEach((o) => map.set(o.id, o));
          setOrgs(Array.from(map.values()));
        }
      } catch (err) {
        console.warn('Alapértelmezett szervezeti lista használata:', err);
      }
    };
    fetchOrgs();
  }, []);

  const filteredOrgs = useMemo(() => {
    return orgs.filter((org) => {
      const kat = (org.kategoria || 'menhely').toLowerCase().trim();

      // Kategória szűrés
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'menhely') {
          const isMenhely =
            kat === 'menhely' ||
            kat === 'mentoszervezet' ||
            kat.includes('menhely') ||
            kat.includes('mento') ||
            kat.includes('egyesulet') ||
            kat.includes('alapitvany') ||
            (!kat.includes('orvos') && !kat.includes('hatosag') && !kat.includes('vad'));
          if (!isMenhely) return false;
        } else if (categoryFilter === 'orvos') {
          const isOrvos = kat === 'orvos' || kat.includes('orvos') || kat.includes('korhaz') || kat.includes('rendelo');
          if (!isOrvos) return false;
        } else if (categoryFilter === 'hatosag') {
          const isHatosag = kat === 'hatosag' || kat.includes('hatosag') || kat.includes('ebrendeszet') || kat.includes('gyepmester');
          if (!isHatosag) return false;
        } else if (categoryFilter === 'vad') {
          const isVad = kat === 'vad' || kat.includes('vad') || kat.includes('madar');
          if (!isVad) return false;
        } else if (kat !== categoryFilter) {
          return false;
        }
      }

      // Megye szűrés (rugalmas kisbetűs összehasonlítás)
      if (countyFilter !== 'all') {
        const orgMegye = (org.megye || '').toLowerCase().trim();
        const selMegye = countyFilter.toLowerCase().trim();
        if (orgMegye !== selMegye) {
          return false;
        }
      }

      // Szabadszavas kereső (név, cím, megye, leírás)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = (org.nev || '').toLowerCase().includes(q);
        const inCity = (org.cim || '').toLowerCase().includes(q);
        const inCounty = (org.megye || '').toLowerCase().includes(q);
        const inDesc = (org.leiras || '').toLowerCase().includes(q);
        if (!inName && !inCity && !inCounty && !inDesc) return false;
      }
      return true;
    });
  }, [orgs, categoryFilter, countyFilter, searchQuery]);

  const getCategoryBadge = (kat?: string) => {
    const normalized = (kat || 'menhely').toLowerCase().trim();
    if (normalized.includes('orvos') || normalized.includes('korhaz') || normalized.includes('rendelo')) {
      return { label: t.catVet || 'Állatorvos / Ügyelet', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    }
    if (normalized.includes('hatosag') || normalized.includes('ebrendeszet') || normalized.includes('gyepmester')) {
      return { label: t.catAuth || 'Hatóság / Gyepmester', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    }
    if (normalized.includes('vad') || normalized.includes('madar')) {
      return { label: t.catWild || 'Vadmentés', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    }
    return { label: t.catShelter || 'Menhely / Mentőszervezet', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-7xl min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6 space-y-2 sm:space-y-4 overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="shrink-0 text-center flex flex-col items-center justify-center">
        <h1 className="text-lg sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          <span>{t.orgsTitle}</span>
        </h1>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 text-center font-light">
          {t.orgsSub}
        </p>
      </div>

      {/* Filters Bar with Auto-Hide on scroll */}
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isFilterVisible
            ? 'max-h-[600px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none !m-0 !p-0'
        }`}
      >
        <div className="p-2.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 sm:space-y-3.5">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'menhely', label: t.catShelter },
              { id: 'orvos', label: t.catVet },
              { id: 'hatosag', label: t.catAuth },
              { id: 'vad', label: t.catWild },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-light transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* County & Search Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              onFocus={() => setIsFilterVisible(true)}
              className="w-full px-3 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-light text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.allCounties}</option>
              {MEGYEK.map((m) => (
                <option key={m} value={m}>
                  {m} {t.countySuffix}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFilterVisible(true)}
                placeholder={t.searchOrgPlaceholder}
                className="w-full pl-8 sm:pl-9 pr-3.5 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-light text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Cards Grid */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin pb-2"
      >
        {filteredOrgs.length === 0 ? (
          <div className="py-16 text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs font-light text-slate-500">{t.noOrgsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 content-start">
            {filteredOrgs.map((org) => {
              const badge = getCategoryBadge(org.kategoria);
              return (
                <div
                  key={org.id}
                  className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2.5 sm:space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-light border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {org.megye && (
                        <span className="text-[10px] font-light text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-2 py-0.5 rounded-md">
                          {org.megye}
                        </span>
                      )}
                    </div>

                    <h3 className="font-medium sm:font-light text-base text-slate-900 dark:text-white leading-snug">
                      {org.nev}
                    </h3>

                    {org.cim && (
                      <p className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-light">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{org.cim}</span>
                      </p>
                    )}

                    {org.leiras && (
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed pt-1">
                        {org.leiras}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {org.telefon ? (
                      <a
                        href={`tel:${org.telefon}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-light text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98] transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t.callNow.toUpperCase()} ({org.telefon})</span>
                      </a>
                    ) : (
                      <div className="text-center py-2 text-xs text-slate-400 font-light">
                        {t.noPhoneProvided}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
