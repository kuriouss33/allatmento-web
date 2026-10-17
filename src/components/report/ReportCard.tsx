'use client';

import React from 'react';
import { 
  MapPin, 
  Check, 
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { Report } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { canUserSeeExactReport, getReportDisplayAddress } from '@/lib/privacy';

interface ReportCardProps {
  report: Report;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenDetails: (report: Report) => void;
  onImageClick?: (url: string) => void;
  // Legacy optional props to maintain compatibility with existing callers
  onOpenHelp?: (report: Report) => void;
  onTakeCase?: (report: Report) => void;
  onCancelTake?: (report: Report) => void;
  onResolve?: (report: Report) => void;
  onDelete?: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isSelected,
  onSelect,
  onOpenDetails,
}) => {
  const { firebaseUser, isRescuer, isAdmin } = useAuth();
  const { t } = useLanguage();

  const getCardStatusClasses = () => {
    switch (report.statusz) {
      case 'uj':
        return isSelected
          ? 'bg-red-50/90 dark:bg-red-950/35 border-red-500 dark:border-red-400 ring-2 ring-red-500/25 shadow-red-500/10'
          : 'bg-red-50/60 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/40 hover:bg-red-50/90 dark:hover:bg-red-950/35 hover:border-red-300 dark:hover:border-red-800/60';
      case 'folyamatban':
        return isSelected
          ? 'bg-orange-50/90 dark:bg-orange-950/35 border-orange-500 dark:border-orange-400 ring-2 ring-orange-500/25 shadow-orange-500/10'
          : 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/40 hover:bg-orange-50/90 dark:hover:bg-orange-950/35 hover:border-orange-300 dark:hover:border-orange-800/60';
      case 'megoldva':
        return isSelected
          ? 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/25 shadow-emerald-500/10'
          : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-50/90 dark:hover:bg-emerald-950/35 hover:border-emerald-300 dark:hover:border-emerald-800/60';
      default:
        return isSelected
          ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';
    }
  };

  const statusBadge = () => {
    switch (report.statusz) {
      case 'uj':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-light bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{t.statusNew}</span>
          </span>
        );
      case 'folyamatban':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-light bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/25 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>{t.statusInProg}</span>
          </span>
        );
      case 'megoldva':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-light bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 whitespace-nowrap">
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{t.statusSolved}</span>
          </span>
        );
    }
  };

  const canSeeExact = canUserSeeExactReport(report, {
    isRescuer,
    isAdmin,
    isRegistered: Boolean(firebaseUser),
    currentUserId: firebaseUser?.uid,
  });

  const displayAddress = getReportDisplayAddress(report, canSeeExact);
  const imageUrl = report.fotoUrl || report.kepUrl;

  return (
    <div
      onClick={onSelect}
      className={`group relative border rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex gap-2.5 sm:gap-3.5 items-stretch ${getCardStatusClasses()}`}
    >
      {/* Thumbnail on the left */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(report);
        }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 flex items-center justify-center group/img shadow-2xs"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={report.fajta}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-1.5 text-center bg-white/50 dark:bg-slate-800/80">
            <ImageIcon className="w-5 h-5 opacity-50" />
            <span className="text-[9px] font-light text-slate-400 leading-tight">Nincs fotó</span>
          </div>
        )}
      </div>

      {/* Info column on the right */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        
        {/* Top: Fajta + Státusz + Megye */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-light text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {report.fajta}
            </h3>
            {statusBadge()}
          </div>

          {report.megye && (
            <span className="inline-block text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-light border border-black/5 dark:border-white/10 backdrop-blur-xs">
              {report.megye} megye
            </span>
          )}
        </div>

        {/* Middle: Bejelentett környék */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 my-1 truncate font-light">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">
            {displayAddress}
          </span>
        </div>

        {/* Bottom: Részletek gomb */}
        <div className="pt-1 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(report);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl font-light text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xs active:scale-[0.98] transition-all"
          >
            <span>Részletek</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
