'use client';

import React from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Box, 
  ArrowRight,
  ShieldCheck,
  Check,
  Trash2,
  RotateCcw,
  Info
} from 'lucide-react';
import { TransportJob, TransportStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface TransportCardProps {
  job: TransportJob;
  isSelected?: boolean;
  isAdmin?: boolean;
  isCreator?: boolean;
  onSelect?: () => void;
  onOpenDetails: (job: TransportJob) => void;
  onToggleSolved?: (job: TransportJob) => void;
  onDelete?: (job: TransportJob) => void;
  onTakeJob?: (job: TransportJob) => void;
  onAdvanceStatus?: (job: TransportJob, nextStatus: TransportStatus) => void;
}

export const TransportCard: React.FC<TransportCardProps> = ({
  job,
  isSelected,
  isAdmin,
  isCreator,
  onSelect,
  onOpenDetails,
  onToggleSolved,
  onDelete,
}) => {
  const { t, lang } = useLanguage();
  const { firebaseUser } = useAuth();

  const isMyJob = Boolean(
    firebaseUser && (job.driverId === firebaseUser.uid || job.feladoUserId === firebaseUser.uid)
  );

  // Sürgősségi jelvény
  const getUrgencyBadge = () => {
    switch (job.urgency) {
      case 'fix_idopont':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Fixed time' : 'Fix időpont'}</span>
          </span>
        );
      case 'surgos':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Urgent' : 'Sürgős'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {lang === 'en' ? 'Normal' : 'Normál'}
          </span>
        );
    }
  };

  const isSolved = job.statusz === 'megoldva' || job.statusz === 'teljesitve';

  // Státusz jelvény (Egyszerűsített: Keres fuvart vs Megoldódott)
  const getStatusBadge = () => {
    if (isSolved) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {lang === 'en' ? 'Solved' : 'Megoldódott'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {lang === 'en' ? 'Looking for ride' : 'Keres fuvart'}
      </span>
    );
  };

  // Doboz igény jelvény
  const getCrateBadge = () => {
    switch (job.crateRequirement) {
      case 'box_szukseges':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Box className="w-3 h-3" />
            {lang === 'en' ? 'Carrier required!' : 'Box szükséges!'}
          </span>
        );
      case 'sajat_box_van':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Box className="w-3 h-3" />
            {lang === 'en' ? 'Carrier provided' : 'Box biztosított'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group p-4 sm:p-5 rounded-2xl border transition-all text-left bg-white dark:bg-black relative shadow-xs flex flex-col justify-between gap-4 cursor-pointer ${
        isSelected
          ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm'
      }`}
    >
      {/* 1. Fejléc: Státusz és Sürgősség */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {getUrgencyBadge()}
        </div>

        <div className="flex items-center gap-1.5">
          {job.tavolsagKm && (
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80">
              ~{job.tavolsagKm} km
            </span>
          )}

          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const confirmed = window.confirm(
                  lang === 'en'
                    ? `Are you sure you want to delete transport "${job.honnanVaros} ➔ ${job.hovaVaros}"?`
                    : `Biztosan törölni szeretnéd a(z) "${job.honnanVaros} ➔ ${job.hovaVaros}" fuvart?`
                );
                if (confirmed) {
                  onDelete(job);
                }
              }}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors flex items-center justify-center shrink-0"
              title={lang === 'en' ? 'Delete transport (Super Admin)' : 'Fuvar törlése (Super Admin)'}
              aria-label={lang === 'en' ? 'Delete transport' : 'Fuvar törlése'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Útvonal: Honnan -> Hova vizualizáció */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
          <span className="text-emerald-600 dark:text-emerald-400">
            {job.honnanVaros}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-blue-600 dark:text-blue-400">
            {job.hovaVaros}
          </span>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
          {job.honnanCim && <span>📍 {lang === 'en' ? 'Pickup:' : 'Felvétel:'} {job.honnanCim}</span>}
          {job.hovaCim && <span>🎯 {lang === 'en' ? 'Destination:' : 'Célállomás:'} {job.hovaCim}</span>}
        </div>
      </div>

      {/* 3. Szállítmány & Dátum részletek */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            {job.cargoType === 'adomany_tap' ? (
              <Package className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Truck className="w-4 h-4 text-blue-500 shrink-0" />
            )}
            <span>{job.allatNev || job.allatFajta || (lang === 'en' ? 'Cargo' : 'Szállítmány')}</span>
          </div>
          {getCrateBadge()}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {job.leiras}
        </p>

        <div className="pt-1 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{job.datum}</span>
          </div>
          {job.idosav && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.idosav}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Sofőr / Vállaló adatai, ha már el van vállalva */}
      {job.driverName && (
        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-zinc-900 border border-blue-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              🚗
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                {lang === 'en' ? 'Volunteer driver:' : 'Vállaló sofőr:'}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {job.driverName}
              </span>
            </div>
          </div>

          {job.driverPhone && (
            <a
              href={`tel:${job.driverPhone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="min-h-[44px] px-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:bg-blue-50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Call' : 'Hívás'}</span>
            </a>
          )}
        </div>
      )}

      {/* 5. Terepi Akciógombok (Minimálisan 48px magas érintőfelülettel!) */}
      <div 
        className="flex items-center gap-2 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ha a feladó (vagy super_admin) nézi: Megoldottá tétel / Újra megnyitás gomb */}
        {(isCreator || isAdmin) && onToggleSolved ? (
          <button
            type="button"
            onClick={() => onToggleSolved(job)}
            className={`flex-1 min-h-[48px] px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
              isSolved
                ? 'border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
            title={
              isSolved
                ? (lang === 'en' ? 'Reopen transport request' : 'Fuvarigény újra megnyitása')
                : (lang === 'en' ? 'Mark transport as solved' : 'Fuvar megjelölése megoldottként')
            }
          >
            {isSolved ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'en' ? 'Reopen request' : 'Újra megnyitás'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{lang === 'en' ? 'Mark Solved' : 'Megoldódott'}</span>
              </>
            )}
          </button>
        ) : (
          /* Ha önkéntes fuvarozó / látogató nézi: Közvetlen egykattintásos hívás gomb! (Nem kell bejelentkezni!) */
          job.feladoTelefon ? (
            <a
              href={`tel:${job.feladoTelefon.replace(/\s+/g, '')}`}
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
              title={`${lang === 'en' ? 'Call sender directly' : 'Közvetlen hívás'}: ${job.feladoTelefon}`}
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span className="truncate">{lang === 'en' ? 'Call' : 'Hívás'}: {job.feladoTelefon}</span>
            </a>
          ) : null
        )}

        {/* Ha a feladó az és van telefonja, egy kis hívás gomb is elérhető */}
        {(isCreator || isAdmin) && job.feladoTelefon && (
          <a
            href={`tel:${job.feladoTelefon.replace(/\s+/g, '')}`}
            className="min-h-[48px] min-w-[48px] px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0 shadow-2xs"
            title={`${lang === 'en' ? 'Call' : 'Hívás'}: ${job.feladoTelefon}`}
            aria-label={lang === 'en' ? 'Call sender' : 'Feladó hívása'}
          >
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </a>
        )}

        {/* Részletek gomb (min. 48px magas) */}
        <button
          type="button"
          onClick={() => onOpenDetails(job)}
          className="min-h-[48px] px-3.5 sm:px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          title={lang === 'en' ? 'Details' : 'Részletek'}
          aria-label={lang === 'en' ? 'Details' : 'Részletek'}
        >
          <Info className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">{lang === 'en' ? 'Details' : 'Részletek'}</span>
        </button>
      </div>
    </div>
  );
};
