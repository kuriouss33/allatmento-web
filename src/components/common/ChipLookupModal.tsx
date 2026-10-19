'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
  ClipboardPaste,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  EXTENDED_CHIP_DATABASES,
  analyzeChipNumber,
  copyToClipboard,
  readFromClipboard
} from '@/lib/chipUtils';

interface ChipLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChipLookupModal: React.FC<ChipLookupModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLanguage();
  const [chipNumber, setChipNumber] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Háttér görgetés letiltása és navigációs fejléc elrejtése a modal nyitva tartása alatt
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-modal-open');
      return () => {
        document.body.style.overflow = orig;
        document.body.classList.remove('has-modal-open');
      };
    }
  }, [isOpen]);

  const cleanNumber = chipNumber.replace(/\D/g, '');
  const chipAnalysis = analyzeChipNumber(cleanNumber, lang);
  const is15Digits = cleanNumber.length === 15;

  if (!isOpen || !mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
    setChipNumber(digitsOnly);
    if (error) setError(null);
    if (copiedSuccess) setCopiedSuccess(false);
    if (copiedShort) setCopiedShort(false);
  };

  const handleManualCopy = async () => {
    if (!cleanNumber) return;
    const ok = await copyToClipboard(cleanNumber);
    if (ok) {
      setCopiedShort(true);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedShort(false), 2500);
    }
  };

  const handlePaste = async () => {
    const text = await readFromClipboard();
    if (text) {
      setChipNumber(text);
      if (error) setError(null);
      if (text.length === 15) {
        setCopiedShort(false);
      }
    }
  };

  const handleClear = () => {
    setChipNumber('');
    setError(null);
    setCopiedSuccess(false);
    setCopiedShort(false);
  };

  const handleOpenDatabase = async (url: string) => {
    if (cleanNumber.length > 0) {
      await copyToClipboard(cleanNumber);
      setCopiedSuccess(true);
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2500);
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe pl-safe pr-safe modal-glass-backdrop animate-backdropFade"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-modalCard text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fejléc sáv a jobb felső bezárás gombbal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                {t.chipLookupBtn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.chipSub}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Bezárás"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Görgethető tartalom */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scrollbar-thin">
          {/* Sikeres másolás értesítő banner */}
          {copiedSuccess && cleanNumber.length > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">{t.chipCopiedNotice}</span>
                <span className="text-[11px] opacity-80 mt-0.5 block font-mono">
                  {cleanNumber}
                </span>
              </div>
              <button
                onClick={() => setCopiedSuccess(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hibaüzenet banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Input szekció */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.chipInputLabel}
              </label>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  is15Digits
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                    : cleanNumber.length > 0
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {cleanNumber.length} / 15 {t.chipDigitsCount}
                {is15Digits && ' ✓'}
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                value={chipNumber}
                onChange={handleInputChange}
                placeholder="Pl. 348098100123456 vagy 9810100..."
                className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono tracking-wider text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
              />

              {/* Input jobb oldali akciógombok */}
              <div className="absolute right-1.5 flex items-center gap-1">
                {cleanNumber.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleManualCopy}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                      title={t.chipCopyBtn}
                    >
                      {copiedShort ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                            {t.chipCopiedShort}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span className="text-[11px]">{t.chipCopyBtn}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                      title={t.chipClearBtn}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors"
                    title={t.chipPasteBtn}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">{t.chipPasteBtn}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Intelligens ISO Elemző Kártya */}
          {chipAnalysis && (
            <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-zinc-900 dark:border-zinc-800 transition-all">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none" role="img" aria-label="flag or type">
                    {chipAnalysis.flag}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {chipAnalysis.title}
                  </span>
                </div>
                {is15Digits ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3" />
                    ISO 11784/85 OK
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">
                    {15 - cleanNumber.length} {lang === 'hu' ? 'számjegy hiányzik' : 'digits remaining'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {chipAnalysis.description}
              </p>
            </div>
          )}

          {/* Adatbázisok listája */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-baseline justify-between flex-wrap gap-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {t.chipSearchInDb}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.chipDirectHint}
              </span>
            </div>

            <div className="space-y-2">
              {EXTENDED_CHIP_DATABASES.map((db) => {
                const isRecommended = chipAnalysis?.recommendedDb === db.id;

                return (
                  <button
                    key={db.id}
                    type="button"
                    onClick={() => handleOpenDatabase(db.url)}
                    className={`group w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all text-left relative ${
                      isRecommended
                        ? 'border-emerald-500/80 dark:border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {db.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            db.badgeColor === 'emerald'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                              : db.badgeColor === 'blue'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                              : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300'
                          }`}
                        >
                          {lang === 'hu' ? db.badgeHu : db.badgeEn}
                        </span>

                        {isRecommended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" />
                            {t.chipRecommendedBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lang === 'hu' ? db.descHu : db.descEn}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
                      <span className="text-xs font-medium hidden sm:inline">Megnyitás</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipp / Segítség lábléc */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
            <p>{t.chipTipDomestic}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
