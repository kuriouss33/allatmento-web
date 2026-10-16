'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Dog, 
  Cat, 
  Bird, 
  Flame 
} from 'lucide-react';
import { FIRST_AID_GUIDES } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

export default function GuidePage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGuides = selectedCategory === 'all'
    ? FIRST_AID_GUIDES
    : FIRST_AID_GUIDES.filter((g) => g.kategoria === selectedCategory || selectedCategory === 'all');

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-4xl min-w-0 mx-auto px-3 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-4 overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="shrink-0 text-center flex flex-col items-center justify-center">
        <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <span>{t.guideTitle}</span>
        </h1>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 text-center">
          {t.guideSub}
        </p>
      </div>

      {/* Category Pills */}
      <div className="w-full min-w-0 overflow-hidden shrink-0">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
          {[
            { id: 'all', label: 'Összes témakör' },
            { id: 'kutya', label: 'Kutya & Macska' },
            { id: 'vad', label: 'Vadállatok' },
            { id: 'madar', label: 'Madarak & Fiókák' },
            { id: 'altalanos', label: 'Mérgezés & Hőguta' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === item.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 sm:space-y-4 pr-1 scrollbar-thin">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="p-3.5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 sm:space-y-4"
          >
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>{guide.cim}</span>
            </h3>

            <div className="space-y-1.5 sm:space-y-2">
              {guide.leiras.map((pont, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{pont}</span>
                </div>
              ))}
            </div>

            {guide.figyelmeztetes && (
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span className="font-semibold">{guide.figyelmeztetes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
