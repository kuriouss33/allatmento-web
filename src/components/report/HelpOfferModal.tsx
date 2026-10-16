'use client';

import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Report } from '@/types';
import { sendHelpOffer } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

interface HelpOfferModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HelpOfferModal: React.FC<HelpOfferModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [nev, setNev] = useState('');
  const [telefon, setTelefon] = useState('');
  const [uzenet, setUzenet] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('A segítség felajánlásához el kell fogadnod a kapcsolattartási hozzájárulást.');
      return;
    }

    setLoading(true);
    try {
      await sendHelpOffer(report.id, {
        nev: nev.trim(),
        telefon: telefon.trim(),
        uzenet: uzenet.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Nem sikerült elküldeni a felajánlást.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
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
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
              {t.helpOfferTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {report.fajta} – {report.cim || report.megye}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">Köszönjük a felajánlást!</h4>
            <p className="text-xs text-slate-500">Az értesítést továbbítottuk a bejelentő és a mentők felé.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.helpName} *
              </label>
              <input
                type="text"
                required
                value={nev}
                onChange={(e) => setNev(e.target.value)}
                placeholder="Pl. Kovács Anna"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.helpPhone} *
              </label>
              <input
                type="tel"
                required
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="+36 30 123 4567"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.helpMessage} *
              </label>
              <textarea
                required
                rows={3}
                value={uzenet}
                onChange={(e) => setUzenet(e.target.value)}
                placeholder="Pl. a közelben vagyok autóval, tudok segíteni a szállításban..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>{t.helpConsent}</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{loading ? t.processing : t.helpSubmit}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
