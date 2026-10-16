'use client';

import React from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  HeartHandshake, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Check, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Report } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getDeleteToken } from '@/lib/storage';
import { canUserSeeExactReport, getReportDisplayLocation, getReportDisplayAddress } from '@/lib/privacy';

interface ReportCardProps {
  report: Report;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenDetails: (report: Report) => void;
  onOpenHelp: (report: Report) => void;
  onTakeCase: (report: Report) => void;
  onCancelTake: (report: Report) => void;
  onResolve: (report: Report) => void;
  onDelete: (report: Report) => void;
  onImageClick?: (url: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isSelected,
  onSelect,
  onOpenDetails,
  onOpenHelp,
  onTakeCase,
  onCancelTake,
  onResolve,
  onDelete,
  onImageClick,
}) => {
  const { firebaseUser, profile, isRescuer, isAdmin, anonymousUid } = useAuth();
  const { t } = useLanguage();

  const isTakenByMe = Boolean(
    report.statusz === 'folyamatban' &&
    firebaseUser &&
    report.rescuerId === firebaseUser.uid
  );

  const isTakenByOther = Boolean(
    report.statusz === 'folyamatban' &&
    report.rescuerId &&
    (!firebaseUser || report.rescuerId !== firebaseUser.uid)
  );

  const localDeleteToken = getDeleteToken(report.id);
  const canDelete = Boolean(
    isAdmin ||
    localDeleteToken ||
    (firebaseUser && report.createrId === firebaseUser.uid) ||
    (anonymousUid && report.createrId === anonymousUid)
  );

  const statusBadge = () => {
    switch (report.statusz) {
      case 'uj':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {t.statusNew}
          </span>
        );
      case 'folyamatban':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t.statusInProg}
          </span>
        );
      case 'megoldva':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
            {t.statusSolved}
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

  const displayLocation = getReportDisplayLocation(report, canSeeExact);
  const displayAddress = getReportDisplayAddress(report, canSeeExact);

  const navUrl = displayLocation.lat && displayLocation.lon
    ? `https://www.google.com/maps/dir/?api=1&destination=${displayLocation.lat},${displayLocation.lon}`
    : null;

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base text-slate-900 dark:text-white">
            {report.fajta}
          </span>
          {report.megye && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {report.megye}
            </span>
          )}
        </div>
        {statusBadge()}
      </div>

      {/* Photo */}
      {(report.fotoUrl || report.kepUrl) && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onImageClick) onImageClick((report.fotoUrl || report.kepUrl)!);
          }}
          className="relative w-full h-44 mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group/img"
        >
          <img
            src={report.fotoUrl || report.kepUrl}
            alt={report.fajta}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
            Nagyítás 🔍
          </div>
        </div>
      )}

      {/* Location */}
      <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-2">
        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-900 dark:text-white">
            {displayAddress}
          </span>
          {!canSeeExact && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              ~100m körzet
            </span>
          )}
          {navUrl && (
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              <span>{canSeeExact ? t.openNav : 'Körzet ↗'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Description / Notes */}
      {report.leiras && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-3 leading-relaxed">
          {report.leiras}
        </p>
      )}

      {/* Phone (if available or masked) */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <Phone className="w-3.5 h-3.5" />
        {report.telefon ? (
          <a
            href={`tel:${report.telefon}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {report.telefon}
          </a>
        ) : (
          <span className="italic text-[11px] text-slate-400">
            {isRescuer ? 'Telefonszám nincs megadva' : '🔒 Telefonszám csak mentőknek'}
          </span>
        )}
      </div>

      {/* Resolution info if resolved */}
      {report.statusz === 'megoldva' && report.megoldasLeiras && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200">
          <span className="font-bold block mb-1">Megoldás:</span>
          <p>{report.megoldasLeiras}</p>
        </div>
      )}

      {/* Rescuer Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
        {/* If New & Rescuer: Take Case */}
        {report.statusz === 'uj' && isRescuer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTakeCase(report);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm shadow-amber-500/20 active:scale-[0.98] transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.btnTake}</span>
          </button>
        )}

        {/* If Taken By Me: Resolve or Cancel */}
        {isTakenByMe && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve(report);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.btnSolved}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelTake(report);
              }}
              className="w-full py-1.5 px-3 rounded-xl font-semibold text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              {t.btnCancelTake}
            </button>
          </div>
        )}

        {/* If Taken By Someone Else */}
        {isTakenByOther && (
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{t.statusTakenByOther}</span>
          </div>
        )}

        {/* Secondary Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {/* Help Offer */}
            {report.statusz !== 'megoldva' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenHelp(report);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                <span>{t.btnHelpVolunteer}</span>
              </button>
            )}

            {/* Comments / Details */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(report);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Üzenetek</span>
            </button>
          </div>

          {/* Delete Action (if creator or admin) */}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(report);
              }}
              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Bejelentés törlése"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
