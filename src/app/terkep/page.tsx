'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  ListFilter, 
  Search, 
  Map as MapIcon, 
  List as ListIcon, 
  RotateCw,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getReports, updateReportStatus, normalizeReport } from '@/lib/api';
import { MEGYEK } from '@/lib/constants';
import { Report, ReportStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ReportCard } from '@/components/report/ReportCard';
import { ReportDetailsModal } from '@/components/report/ReportDetailsModal';
import { HelpOfferModal } from '@/components/report/HelpOfferModal';
import { ResolveModal } from '@/components/report/ResolveModal';
import { DeleteConfirmModal } from '@/components/report/DeleteConfirmModal';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import { useAutoHideOnScroll } from '@/hooks';

// SSR-safe dinamikus Leaflet betöltés
const DispatchMap = dynamic(
  () => import('@/components/map/DispatchMap').then((mod) => mod.DispatchMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[250px] lg:min-h-[400px] rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Térkép betöltése...</span>
        </div>
      </div>
    ),
  }
);

export default function DispatchPage() {
  const { t } = useLanguage();
  const { idToken, isRescuer, isAdmin, firebaseUser } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Szűrők
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobil nézet váltó: 'split' | 'map' | 'list'
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Auto-hide hook a lista nézet státusz-megye-kereső konténeréhez
  const {
    isVisible: isFilterVisible,
    setIsVisible: setIsFilterVisible,
    scrollRef,
    handleScroll,
  } = useAutoHideOnScroll<HTMLDivElement>({
    threshold: 12,
    topOffset: 25,
  });

  // Modál állapotok
  const [activeDetailsReport, setActiveDetailsReport] = useState<Report | null>(null);
  const [activeHelpReport, setActiveHelpReport] = useState<Report | null>(null);
  const [activeResolveReport, setActiveResolveReport] = useState<Report | null>(null);
  const [activeDeleteReport, setActiveDeleteReport] = useState<Report | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Valós idejű szinkronizáció (mentőknek Firestore, vendégeknek biztonságos REST API)
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let pollInterval: NodeJS.Timeout | null = null;

    if (isRescuer && db) {
      try {
        const q = query(collection(db, 'bejelentesek'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs: Report[] = [];
            snapshot.forEach((doc) => {
              docs.push(normalizeReport({ id: doc.id, ...doc.data() }));
            });
            docs.sort((a, b) => {
              const timeA = a.idopont?.seconds ? a.idopont.seconds * 1000 : new Date(a.idopont || a.createdAt || 0).getTime();
              const timeB = b.idopont?.seconds ? b.idopont.seconds * 1000 : new Date(b.idopont || b.createdAt || 0).getTime();
              return timeB - timeA;
            });
            setReports(docs);
            setLoading(false);
          },
          (err) => {
            getReports(undefined, idToken || undefined)
              .then((data) => setReports(data))
              .finally(() => setLoading(false));
          }
        );
      } catch (e) {
        getReports(undefined, idToken || undefined)
          .then((data) => setReports(data))
          .finally(() => setLoading(false));
      }
    } else {
      const fetchPublicReports = () => {
        getReports(undefined, undefined)
          .then((data) => setReports(data))
          .catch((err) => console.error('Nem sikerült a bejelentések lekérése:', err))
          .finally(() => setLoading(false));
      };

      fetchPublicReports();
      pollInterval = setInterval(fetchPublicReports, 30000);
    }

    return () => {
      unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isRescuer, idToken]);

  // Szűrt bejelentések
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Státusz szűrés
      if (statusFilter !== 'all' && r.statusz !== statusFilter) {
        return false;
      }
      // Megye szűrés
      if (countyFilter !== 'all' && r.megye !== countyFilter) {
        return false;
      }
      // Szöveges keresés
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inSpecies = (r.fajta || '').toLowerCase().includes(query);
        const inDesc = (r.leiras || '').toLowerCase().includes(query);
        const inCity = (r.cim || '').toLowerCase().includes(query);
        const inPhone = (r.telefon || '').includes(query);
        if (!inSpecies && !inDesc && !inCity && !inPhone) {
          return false;
        }
      }
      return true;
    });
  }, [reports, statusFilter, countyFilter, searchQuery]);

  // Aktív esetek száma: dinamikusan kiszűrve a megoldott ügyeket
  const activeReportsCount = useMemo(() => {
    if (statusFilter === 'megoldva') {
      return reports.filter((r) => {
        if (r.statusz === 'megoldva') return false;
        if (countyFilter !== 'all' && r.megye !== countyFilter) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const inSpecies = (r.fajta || '').toLowerCase().includes(query);
          const inDesc = (r.leiras || '').toLowerCase().includes(query);
          const inCity = (r.cim || '').toLowerCase().includes(query);
          const inPhone = (r.telefon || '').includes(query);
          if (!inSpecies && !inDesc && !inCity && !inPhone) return false;
        }
        return true;
      }).length;
    }
    return filteredReports.filter((r) => r.statusz !== 'megoldva').length;
  }, [filteredReports, reports, statusFilter, countyFilter, searchQuery]);

  // Gyors akciók
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
    <div className="flex-1 min-h-0 flex flex-col max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 lg:h-[calc(100dvh-4.25rem)] lg:max-h-[calc(100dvh-4.25rem)] lg:overflow-hidden animate-fadeIn">
      
      {/* Top Header & Mobile View Toggle */}
      <div className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 shrink-0">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-lg sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <span>{t.dispatchTitle}</span>
            <span className="text-xs font-light px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {activeReportsCount} aktív eset
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center font-light">
            {t.dispatchSub}
          </p>
        </div>

        {/* Mobile View Toggle Buttons (Map vs List) */}
        <div className="flex lg:hidden items-center justify-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 mx-auto">
          <button
            onClick={() => setMobileView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
              mobileView === 'map'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t.toggleMap}</span>
          </button>
          <button
            onClick={() => {
              setMobileView('list');
              setIsFilterVisible(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
              mobileView === 'list'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>{t.toggleList}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-stretch lg:h-full lg:overflow-hidden">
        
        {/* Left Column: Filter Bar & Reports List (440px / 5 cols on lg) */}
        <div className={`lg:col-span-5 flex-col gap-2 sm:gap-3 min-h-0 lg:h-full lg:overflow-hidden ${mobileView === 'list' ? 'flex flex-1' : 'hidden lg:flex'}`}>
          
          {/* Filters Bar Card with Auto-Hide on scroll */}
          <div
            className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
              isFilterVisible
                ? 'max-h-[600px] opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none !m-0 !p-0'
            }`}
          >
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 sm:space-y-3">
              
              {/* Status Pills */}
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-light transition-all whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.filterAll}
                </button>

                <button
                  onClick={() => setStatusFilter('uj')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-light transition-all whitespace-nowrap ${
                    statusFilter === 'uj'
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/25'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{t.filterNew}</span>
                </button>

                <button
                  onClick={() => setStatusFilter('folyamatban')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-light transition-all whitespace-nowrap ${
                    statusFilter === 'folyamatban'
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                      : 'bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>{t.filterInProgress}</span>
                </button>

                <button
                  onClick={() => setStatusFilter('megoldva')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-light transition-all whitespace-nowrap ${
                    statusFilter === 'megoldva'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{t.filterResolved}</span>
                </button>
              </div>

              {/* County Select & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={countyFilter}
                  onChange={(e) => setCountyFilter(e.target.value)}
                  onFocus={() => setIsFilterVisible(true)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-light text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t.allCounties}</option>
                  {MEGYEK.map((m) => (
                    <option key={m} value={m}>
                      {m} megye
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFilterVisible(true)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-light text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reports Scrollable List */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin"
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-light space-y-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>{t.loading}</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-12 text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-light text-slate-600 dark:text-slate-300">
                  {t.noReportsFound}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isSelected={report.id === selectedReportId}
                  onSelect={() => {
                    setSelectedReportId(report.id);
                    if (window.innerWidth < 1024) {
                      setMobileView('map');
                    }
                  }}
                  onOpenDetails={(r) => setActiveDetailsReport(r)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Full Interactive Leaflet Map (7 cols on lg) - Fixed on Desktop */}
        <div className={`lg:col-span-7 w-full min-h-0 flex-1 lg:h-full lg:sticky lg:top-0 lg:self-start lg:overflow-hidden ${mobileView === 'map' ? 'flex flex-col h-full' : 'hidden lg:flex flex-col'}`}>
          <DispatchMap
            reports={filteredReports}
            selectedReportId={selectedReportId}
            onSelectReport={(id) => setSelectedReportId(id)}
            onOpenDetails={(r) => setActiveDetailsReport(r)}
            onOpenHelp={(r) => setActiveHelpReport(r)}
            isRescuer={isRescuer}
            isAdmin={isAdmin}
            isRegistered={Boolean(firebaseUser)}
            currentUserId={firebaseUser?.uid}
          />
        </div>

      </div>

      {/* Modals */}
      <ReportDetailsModal
        report={activeDetailsReport}
        isOpen={Boolean(activeDetailsReport)}
        onClose={() => setActiveDetailsReport(null)}
        onTakeCase={handleTakeCase}
        onCancelTake={handleCancelTake}
        onResolve={(r) => {
          setActiveDetailsReport(null);
          setActiveResolveReport(r);
        }}
        onOpenHelp={(r) => {
          setActiveDetailsReport(null);
          setActiveHelpReport(r);
        }}
        onDelete={(r) => {
          setActiveDetailsReport(null);
          setActiveDeleteReport(r);
        }}
        onImageClick={(url) => setLightboxImage(url)}
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
            if (selectedReportId === activeDeleteReport.id) {
              setSelectedReportId(null);
            }
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
