'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  PlusCircle, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getReports, updateReportStatus, normalizeReport } from '@/lib/api';
import { getSavedDeleteTokens } from '@/lib/storage';
import { Report } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ReportCard } from '@/components/report/ReportCard';
import { ReportDetailsModal } from '@/components/report/ReportDetailsModal';
import { HelpOfferModal } from '@/components/report/HelpOfferModal';
import { ResolveModal } from '@/components/report/ResolveModal';
import { DeleteConfirmModal } from '@/components/report/DeleteConfirmModal';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';

export default function MyCasesPage() {
  const { t } = useLanguage();
  const { firebaseUser, idToken, isRescuer, anonymousUid } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'created' | 'taken'>('created');

  // Modals
  const [activeDetailsReport, setActiveDetailsReport] = useState<Report | null>(null);
  const [activeHelpReport, setActiveHelpReport] = useState<Report | null>(null);
  const [activeResolveReport, setActiveResolveReport] = useState<Report | null>(null);
  const [activeDeleteReport, setActiveDeleteReport] = useState<Report | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let pollInterval: NodeJS.Timeout | null = null;

    if (isRescuer) {
      try {
        const q = query(collection(db, 'bejelentesek'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs: Report[] = [];
            snapshot.forEach((doc) => {
              docs.push(normalizeReport({ id: doc.id, ...doc.data() }));
            });
            setReports(docs);
            setLoading(false);
          },
          () => {
            getReports(undefined, idToken || undefined)
              .then((data) => setReports(data))
              .finally(() => setLoading(false));
          }
        );
      } catch {
        getReports(undefined, idToken || undefined)
          .then((data) => setReports(data))
          .finally(() => setLoading(false));
      }
    } else {
      const fetchMyReports = () => {
        getReports(undefined, idToken || undefined)
          .then((data) => setReports(data))
          .catch((err) => console.error('Nem sikerült az ügyek lekérése:', err))
          .finally(() => setLoading(false));
      };

      fetchMyReports();
      pollInterval = setInterval(fetchMyReports, 30000);
    }

    return () => {
      unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isRescuer, idToken]);

  // Szűrés a felhasználó saját ügyeire
  const myCreatedReports = useMemo(() => {
    const savedTokens = getSavedDeleteTokens();
    return reports.filter((r) => {
      if (firebaseUser && r.createrId === firebaseUser.uid) return true;
      if (anonymousUid && r.createrId === anonymousUid) return true;
      if (savedTokens[r.id]) return true;
      return false;
    });
  }, [reports, firebaseUser, anonymousUid]);

  const myTakenReports = useMemo(() => {
    if (!firebaseUser) return [];
    return reports.filter((r) => r.rescuerId === firebaseUser.uid);
  }, [reports, firebaseUser]);

  const displayedReports = tab === 'created' ? myCreatedReports : myTakenReports;

  // Akciók
  const handleTakeCase = async (report: Report) => {
    if (!idToken) return;
    try {
      await updateReportStatus(report.id, 'folyamatban', idToken);
    } catch (err: any) {
      alert(err.message || 'Nem sikerült elvállalni az ügyet.');
    }
  };

  const handleCancelTake = async (report: Report) => {
    if (!idToken) return;
    try {
      await updateReportStatus(report.id, 'uj', idToken);
    } catch (err: any) {
      alert(err.message || 'Nem sikerült visszavonni a vállalást.');
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-4xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-4 overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-3 shrink-0">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.navMyCases}</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
            Az általad beküldött és a mentőként elvállalt bejelentések áttekintése
          </p>
        </div>

        <Link
          href="/bejelentes"
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Új bejelentés</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 sm:pb-2 shrink-0">
        <button
          onClick={() => setTab('created')}
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'created'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Általam bejelentve</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            tab === 'created' ? 'bg-white/20 text-slate-900 dark:text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {myCreatedReports.length}
          </span>
        </button>

        {isRescuer && (
          <button
            onClick={() => setTab('taken')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'taken'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Általam elvállalva</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              tab === 'taken' ? 'bg-white/20 text-slate-900 dark:text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {myTakenReports.length}
            </span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>{t.loading}</p>
          </div>
        ) : displayedReports.length === 0 ? (
          <div className="py-12 text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Nincs megjeleníthető ügy ebben a kategóriában
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {tab === 'created'
                ? 'Még nem küldtél be állatmentési bejelentést erről a készülékről.'
                : 'Jelenleg nincs nálad aktív mentési küldetés.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 pb-2">
            {displayedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onOpenDetails={(r) => setActiveDetailsReport(r)}
                onOpenHelp={(r) => setActiveHelpReport(r)}
                onTakeCase={handleTakeCase}
                onCancelTake={handleCancelTake}
                onResolve={(r) => setActiveResolveReport(r)}
                onDelete={(r) => setActiveDeleteReport(r)}
                onImageClick={(url) => setLightboxImage(url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReportDetailsModal
        report={activeDetailsReport}
        isOpen={Boolean(activeDetailsReport)}
        onClose={() => setActiveDetailsReport(null)}
      />

      <HelpOfferModal
        report={activeHelpReport}
        isOpen={Boolean(activeHelpReport)}
        onClose={() => setActiveHelpReport(null)}
      />

      <ResolveModal
        report={activeResolveReport}
        isOpen={Boolean(activeResolveReport)}
        onClose={() => setActiveResolveReport(null)}
        onSuccess={() => {}}
      />

      <DeleteConfirmModal
        report={activeDeleteReport}
        isOpen={Boolean(activeDeleteReport)}
        onClose={() => setActiveDeleteReport(null)}
        onSuccess={() => {
          if (activeDeleteReport) {
            setReports((prev) => prev.filter((r) => r.id !== activeDeleteReport.id));
          }
        }}
      />

      <ImageLightboxModal
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
