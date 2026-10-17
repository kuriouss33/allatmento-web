'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Dog, 
  Cat, 
  Bird, 
  Sparkles,
  Shield,
  Activity,
  Search,
  X,
  ShieldAlert
} from 'lucide-react';
import { FIRST_AID_GUIDES } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { useAutoHideOnScroll } from '@/hooks';

export default function GuidePage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => [
    { id: 'all', label: t.filterAll, icon: BookOpen },
    { id: 'kutya', label: t.typeDog, icon: Dog },
    { id: 'macska', label: t.typeCat, icon: Cat },
    { id: 'madar', label: t.typeBirdFull, icon: Bird },
    { id: 'kisemlos', label: t.typeSmallMammal, icon: Sparkles },
    { id: 'vad', label: t.typeBigGame, icon: Shield },
    { id: 'hullo', label: t.typeReptile, icon: Activity },
    { id: 'altalanos', label: t.typeGeneralEmergency, icon: AlertTriangle },
  ], [t]);

  const categoryMeta: Record<string, { label: string; badgeClass: string; icon: any }> = useMemo(() => ({
    kutya: {
      label: t.typeDog,
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      icon: Dog,
    },
    macska: {
      label: t.typeCat,
      badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
      icon: Cat,
    },
    madar: {
      label: t.typeBirdFull,
      badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
      icon: Bird,
    },
    kisemlos: {
      label: t.typeSmallMammal,
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      icon: Sparkles,
    },
    vad: {
      label: t.typeBigGame,
      badgeClass: 'bg-lime-500/10 text-lime-800 dark:text-lime-300 border-lime-500/20',
      icon: Shield,
    },
    hullo: {
      label: t.typeReptile,
      badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
      icon: Activity,
    },
    altalanos: {
      label: t.typeGeneralEmergency,
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      icon: AlertTriangle,
    },
  }), [t]);

  const {
    isVisible: isFilterVisible,
    setIsVisible: setIsFilterVisible,
    scrollRef,
    handleScroll,
  } = useAutoHideOnScroll<HTMLDivElement>({
    threshold: 12,
    topOffset: 25,
  });

  const filteredGuides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return FIRST_AID_GUIDES.filter((guide) => {
      // Kategória szűrés
      const matchesCategory = selectedCategory === 'all' || guide.kategoria === selectedCategory;
      if (!matchesCategory) return false;

      // Szabadszavas keresés
      if (!q) return true;

      const titleMatch = guide.cim.toLowerCase().includes(q);
      const pointsMatch = guide.leiras.some((p) => p.toLowerCase().includes(q));
      const alertMatch = guide.figyelmeztetes ? guide.figyelmeztetes.toLowerCase().includes(q) : false;

      return titleMatch || pointsMatch || alertMatch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-4xl min-w-0 mx-auto px-3 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-4 overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="shrink-0 text-center flex flex-col items-center justify-center">
        <h1 className="text-lg sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <span>{t.guideTitle}</span>
        </h1>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 text-center font-light">
          {t.guideSub}
        </p>
      </div>

      {/* Filter and Search Container with Auto-Hide on scroll */}
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isFilterVisible
            ? 'max-h-[600px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none !m-0 !p-0'
        }`}
      >
        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFilterVisible(true)}
              placeholder={t.searchGuidePlaceholder}
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-light"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={t.clearSearch}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full">
            {categories.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light transition-all ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-light pt-0.5">
            <span>
              {filteredGuides.length} {t.guideResultsCount}
              {selectedCategory !== 'all' && ` (${categories.find(c => c.id === selectedCategory)?.label})`}
            </span>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto space-y-2.5 sm:space-y-4 pr-1 scrollbar-thin"
      >
        {filteredGuides.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
            <h3 className="text-sm sm:text-base font-light text-slate-700 dark:text-slate-300">
              {t.noGuidesFound}
            </h3>
            <p className="text-xs text-slate-400 font-light">
              {t.noGuidesFoundDesc}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-light"
            >
              {t.showAllGuides}
            </button>
          </div>
        ) : (
          filteredGuides.map((guide) => {
            const meta = categoryMeta[guide.kategoria] || {
              label: guide.kategoria,
              badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
              icon: BookOpen,
            };
            const MetaIcon = meta.icon;

            return (
              <div
                key={guide.id}
                className="p-3.5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4 transition-colors"
              >
                {/* Badges + Title Header */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category pill */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-light border ${meta.badgeClass}`}>
                      <MetaIcon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </span>

                    {/* Sürgős eset badge */}
                    {guide.surgos && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-light bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{t.urgentAction}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-light text-slate-900 dark:text-white tracking-tight">
                    {guide.cim}
                  </h3>
                </div>

                {/* Instruction points */}
                <div className="space-y-2 sm:space-y-2.5">
                  {guide.leiras.map((pont, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{pont}</span>
                    </div>
                  ))}
                </div>

                {/* Warning note if available */}
                {guide.figyelmeztetes && (
                  <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 font-light">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>{guide.figyelmeztetes}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
