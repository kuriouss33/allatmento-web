'use client';

import React, { useState } from 'react';
import { X, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { CHIP_DATABASES } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

interface ChipLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChipLookupModal: React.FC<ChipLookupModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [chipNumber, setChipNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const clean = chipNumber.trim();
    if (!clean) {
      setError(t.chipEnterPrompt);
      return false;
    }
    if (!/^\d{15}$/.test(clean)) {
      setError(t.chipLengthError);
      return false;
    }
    setError(null);
    return true;
  };

  const handleOpen = (url: string) => {
    if (!validate()) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
              {t.chipLookupBtn}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.chipSub}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.chipInputLabel}
            </label>
            <input
              type="text"
              maxLength={15}
              value={chipNumber}
              onChange={(e) => {
                setChipNumber(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Pl. 900182000123456"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
              {t.chipSearchInDb}
            </span>
            {CHIP_DATABASES.map((db) => (
              <button
                key={db.name}
                type="button"
                onClick={() => handleOpen(db.url)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors text-left"
              >
                <span>{db.name}</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
