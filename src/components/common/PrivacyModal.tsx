'use client';

import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe modal-glass-backdrop animate-backdropFade"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-modalCard"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {lang === 'hu' ? 'Adatkezelési Tájékoztató' : 'Privacy Policy'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'hu' ? 'GDPR és adatvédelmi irányelvek' : 'GDPR & Data Protection Guidelines'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed scrollbar-thin">
          {lang === 'hu' ? (
            <>
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-zinc-800 border border-blue-200/60 dark:border-zinc-700 text-blue-900 dark:text-zinc-200">
                <p className="font-semibold text-xs leading-relaxed">
                  Az Állatmentő Portál elkötelezett a bejelentők, megtalálók és állatmentő partnerek személyes adatainak védelme mellett az Európai Unió Általános Adatvédelmi Rendelete (GDPR) szerint.
                </p>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Milyen adatokat kezelünk bejelentéskor?
                </h3>
                <p>
                  A bajba jutott állat bejelentésekor megadott helyszínt (GPS koordináták, cím vagy körzet), a feltöltött fotót, az állat állapotára vonatkozó leírást, valamint a bejelentő által önkéntesen megadott telefonszámot.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Az adatkezelés célja és jogalapja
                </h3>
                <p>
                  Az adatkezelés célja kizárólag a sérült, bajba jutott vagy kóbor állatok szakszerű és gyors helyszíni felkutatása, mentése, valamint az illetékes állatmentő szervezetekkel való operatív koordináció.
                </p>
                <p>
                  <strong>Jogalap:</strong> A bejelentő kifejezett hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont), illetve az állatok életének, egészségének védelméhez fűződő közérdek.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Ki láthatja az adatokat?
                </h3>
                <p>
                  A bejelentés nyilvános adatai (állat fajtája, leírása, fotója, hozzávetőleges helyszíne) megjelennek az interaktív térképen és az ügyek listájában, hogy a környező önkéntesek és lakosok is segíthessenek.
                </p>
                <p>
                  A bejelentő közvetlen telefonszáma a visszaélések megelőzése és a személyes adatok védelme érdekében kizárólag a hitelesített, adminisztrátor által jóváhagyott állatmentő szervezetek számára érhető el az azonnali helyszíni kapcsolatfelvételhez.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Adattárolás időtartama és törlési jog
                </h3>
                <p>
                  Az adatokat a mentési ügy lezárásáig, vagy a bejelentő kifejezett törlési kérelméig tároljuk. A bejelentéskor kapott egyedi törlési kulccsal a bejelentő bármikor önállóan törölheti saját bejelentését a rendszerből.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  5. Érintetti jogok
                </h3>
                <p>
                  Ön bármikor jogosult kérelmezni a kezelt személyes adataihoz való hozzáférést, azok helyesbítését, törlését vagy az adatkezelés korlátozását.
                </p>
              </section>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-zinc-800 border border-blue-200/60 dark:border-zinc-700 text-blue-900 dark:text-zinc-200">
                <p className="font-semibold text-xs leading-relaxed">
                  The Animal Rescue Portal is committed to protecting personal data in accordance with the EU General Data Protection Regulation (GDPR).
                </p>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Data Collected
                </h3>
                <p>
                  Location (GPS coordinates, address or area), uploaded photos, animal description, and optional reporter phone number.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Purpose & Legal Basis
                </h3>
                <p>
                  Data is processed strictly for emergency animal rescue coordination and location dispatch under reporter consent (GDPR Art. 6(1)(a)).
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Access & Retention
                </h3>
                <p>
                  Phone numbers are only visible to verified rescue organizations. Reporters can delete their report at any time using their unique deletion key.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
          >
            {lang === 'hu' ? 'Megértettem, bezárás' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
