'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  Truck, 
  Plus, 
  Map as MapIcon, 
  List as ListIcon, 
  Search, 
  Filter, 
  X, 
  AlertCircle,
  Calendar,
  Box,
  Dog,
  Cat,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  TransportJob, 
  TransportStatus, 
  TransportCargoType, 
  TransportUrgency, 
  TransportCrateRequirement 
} from '@/types';
import { 
  subscribeTransports, 
  updateTransportStatus, 
  deleteTransport,
  getLocalTransports 
} from '@/lib/transportApi';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TransportCard } from '@/components/transport/TransportCard';
import { TransportDetailsModal } from '@/components/transport/TransportDetailsModal';
import { NewTransportModal } from '@/components/transport/NewTransportModal';

// SSR-biztos dinamikus Leaflet térkép
const DynamicTransportMap = dynamic(
  () => import('@/components/transport/TransportMap').then((mod) => mod.TransportMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] lg:min-h-[500px] rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-sm font-semibold">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Térkép betöltése...</span>
        </div>
      </div>
    ),
  }
);

type StatusFilterTab = 'mind' | 'nyitott' | 'elvallalva' | 'folyamatban' | 'teljesitve' | 'sajat';
type ViewMode = 'list' | 'map' | 'split';

export default function TransportBoardPage() {
  const { t, lang } = useLanguage();
  const { firebaseUser, profile, isRescuer, isAdmin } = useAuth();

  const [jobs, setJobs] = useState<TransportJob[]>(() => getLocalTransports());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeDetailsJob, setActiveDetailsJob] = useState<TransportJob | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Nézet és szűrő állapotok
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusTab, setStatusTab] = useState<StatusFilterTab>('mind');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedCrate, setSelectedCrate] = useState<string>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // 1. Valós idejű feliratkozás
  useEffect(() => {
    const unsubscribe = subscribeTransports((updated) => {
      setJobs(updated);
      // Ha a megnyitott részletek modalban lévő fuvar frissült, tartsuk szinkronban
      setActiveDetailsJob((prev) => {
        if (!prev) return null;
        const found = updated.find((j) => j.id === prev.id);
        return found || prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Szűrt fuvarok listája
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Státusz fül szűrés
      if (statusTab === 'sajat') {
        const isMy = Boolean(
          firebaseUser && (job.driverId === firebaseUser.uid || job.feladoUserId === firebaseUser.uid)
        );
        if (!isMy) return false;
      } else if (statusTab !== 'mind') {
        if (job.statusz !== statusTab) return false;
      }

      // Keresőszó (Honnan, Hova, Állat név, Szervezet, Leírás)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = [
          job.honnanVaros,
          job.honnanCim,
          job.honnanMegye,
          job.hovaVaros,
          job.hovaCim,
          job.hovaMegye,
          job.allatNev,
          job.allatFajta,
          job.feladoNev,
          job.feladoSzervezet,
          job.leiras
        ].filter(Boolean).join(' ').toLowerCase();

        if (!text.includes(q)) return false;
      }

      // Rakomány típus
      if (selectedCargo !== 'all' && job.cargoType !== selectedCargo) {
        return false;
      }

      // Sürgősségi szint
      if (selectedUrgency !== 'all' && job.urgency !== selectedUrgency) {
        return false;
      }

      // Box igény
      if (selectedCrate !== 'all' && job.crateRequirement !== selectedCrate) {
        return false;
      }

      return true;
    });
  }, [jobs, statusTab, searchQuery, selectedCargo, selectedUrgency, selectedCrate, firebaseUser]);

  // Számlálók a fülekhez
  const counts = useMemo(() => {
    return {
      mind: jobs.length,
      nyitott: jobs.filter((j) => j.statusz === 'nyitott').length,
      elvallalva: jobs.filter((j) => j.statusz === 'elvallalva').length,
      folyamatban: jobs.filter((j) => j.statusz === 'folyamatban').length,
      teljesitve: jobs.filter((j) => j.statusz === 'teljesitve').length,
      sajat: firebaseUser 
        ? jobs.filter((j) => j.driverId === firebaseUser.uid || j.feladoUserId === firebaseUser.uid).length 
        : 0,
    };
  }, [jobs, firebaseUser]);

  // Fuvar vállalása
  const handleTakeJob = async (job: TransportJob) => {
    const driverName = firebaseUser?.displayName || profile?.email?.split('@')[0] || (lang === 'en' ? 'Volunteer Rescuer' : 'Önkéntes mentő');
    const driverId = firebaseUser?.uid || `anon-rescuer-${Date.now()}`;
    const driverPhone = firebaseUser?.phoneNumber || '';

    const updated: TransportJob = {
      ...job,
      statusz: 'elvallalva',
      driverId,
      driverName,
      driverPhone,
      elvallalvaAt: new Date().toISOString()
    };

    // Optimista helyi frissítés azonnal a reaktív felülethez
    setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    setActiveDetailsJob(updated);

    try {
      await updateTransportStatus(job.id, 'elvallalva', {
        driverId,
        driverName,
        driverPhone,
      });
    } catch (err) {
      console.error('Hiba a fuvar felvételénél:', err);
    }
  };

  // Státusz léptetése (pl. Útra keltem -> Teljesítve)
  const handleAdvanceStatus = async (job: TransportJob, nextStatus: TransportStatus) => {
    const updated: TransportJob = {
      ...job,
      statusz: nextStatus,
      updatedAt: new Date().toISOString(),
      ...(nextStatus === 'teljesitve' ? { teljesitveAt: new Date().toISOString() } : {})
    };

    // Optimista helyi frissítés azonnal a reaktív felülethez
    setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    setActiveDetailsJob((prev) => (prev?.id === job.id ? updated : prev));

    try {
      await updateTransportStatus(job.id, nextStatus);
    } catch (err) {
      console.error('Hiba a státusz léptetésénél:', err);
    }
  };

  // Fuvar törlése (kizárólag super_admin)
  const handleDeleteJob = async (job: TransportJob) => {
    // Optimista helyi törlés azonnal
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    if (activeDetailsJob?.id === job.id) {
      setActiveDetailsJob(null);
    }
    if (selectedJobId === job.id) {
      setSelectedJobId(null);
    }

    try {
      await deleteTransport(job.id);
    } catch (err) {
      console.error('Hiba a fuvar törlésénél:', err);
    }
  };

  const handleOpenDetails = (job: TransportJob) => {
    setActiveDetailsJob(job);
  };

  const hasActiveFilters = Boolean(
    selectedCargo !== 'all' || selectedUrgency !== 'all' || selectedCrate !== 'all' || searchQuery.trim()
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCargo('all');
    setSelectedUrgency('all');
    setSelectedCrate('all');
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 animate-fadeIn pb-16">
      
      {/* 1. FEJLÉC & ÚJ FUVAR GOMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/20">
            <Truck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'en' ? 'Animal Transport Board' : 'Fuvarbörze'}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                {lang === 'en' ? 'Planned Logistics' : 'Tervezett logisztika'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {lang === 'en'
                ? 'Coordinated rides between shelters, foster homes, clinics and supply runs'
                : 'Menhelyek, befogadók, kontrollvizsgálatok és adományok szállításának koordinációja'}
            </p>
          </div>
        </div>

        {/* Új fuvarigény feladása gomb (min-h 48px) */}
        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="w-full sm:w-auto min-h-[48px] px-5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{lang === 'en' ? 'Post Transport Request' : 'Keresek fuvart / Új igény'}</span>
        </button>
      </div>

      {/* 2. VEZÉRLŐPULT: NÉZETVÁLTÓ, KERESŐ & SZŰRŐ GOMB */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Keresőmező */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search by city, animal or description...' : 'Keresés város, állat vagy leírás alapján...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[48px] pl-10 pr-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Szűrő gomb (drawer lenyitás) */}
          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`min-h-[48px] px-3.5 sm:px-4 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
              hasActiveFilters || showFilterDrawer
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{lang === 'en' ? 'Filters' : 'Szűrők'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Nézetváltó gombok (Lista vs Térkép) */}
          <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`min-h-[40px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={lang === 'en' ? 'List View' : 'Lista nézet'}
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'List' : 'Lista'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`min-h-[40px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={lang === 'en' ? 'Route Map' : 'Útvonaltérkép'}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Map' : 'Térkép'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LENYITHATÓ RÉSZLETES SZŰRŐK */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Detailed Filters' : 'Részletes szűrés'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Clear filters' : 'Szűrők törlése'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Állat / Rakomány típus */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {lang === 'en' ? 'Cargo Type' : 'Rakomány / Állatfaj'}
              </label>
              <select
                value={selectedCargo}
                onChange={(e) => setSelectedCargo(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{lang === 'en' ? 'All Types' : 'Minden típus'}</option>
                <option value="kutya">{lang === 'en' ? 'Dog' : 'Kutya'}</option>
                <option value="macska">{lang === 'en' ? 'Cat' : 'Macska'}</option>
                <option value="egyeb_allat">{lang === 'en' ? 'Other animal' : 'Egyéb állat'}</option>
                <option value="adomany_tap">{lang === 'en' ? 'Food / Donation' : 'Táp / Adomány'}</option>
              </select>
            </div>

            {/* Szállítóbox szükségessége */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {lang === 'en' ? 'Crate Requirement' : 'Szállítóbox igény'}
              </label>
              <select
                value={selectedCrate}
                onChange={(e) => setSelectedCrate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{lang === 'en' ? 'All Requirements' : 'Mindegy'}</option>
                <option value="box_szukseges">{lang === 'en' ? 'Carrier required' : 'Box szükséges'}</option>
                <option value="sajat_box_van">{lang === 'en' ? 'Has own carrier' : 'Saját box van'}</option>
                <option value="nem_szukseges">{lang === 'en' ? 'Not required' : 'Nem szükséges'}</option>
              </select>
            </div>

            {/* Sürgősség */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {lang === 'en' ? 'Urgency' : 'Sürgősségi szint'}
              </label>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{lang === 'en' ? 'All Levels' : 'Minden szint'}</option>
                <option value="normal">{lang === 'en' ? 'Normal' : 'Normál'}</option>
                <option value="surgos">{lang === 'en' ? 'Urgent' : 'Sürgős'}</option>
                <option value="fix_idopont">{lang === 'en' ? 'Fixed time' : 'Fix időpont'}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 4. STÁTUSZ GOMBOK / SZÁMLÁLÓK (Görgethető fülek) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'mind' as const, label: lang === 'en' ? 'All' : 'Mind', count: counts.mind },
          { id: 'nyitott' as const, label: lang === 'en' ? 'Open' : 'Nyitott', count: counts.nyitott, color: 'text-emerald-600 dark:text-emerald-400' },
          { id: 'elvallalva' as const, label: lang === 'en' ? 'Accepted' : 'Elvállalva', count: counts.elvallalva, color: 'text-blue-600 dark:text-blue-400' },
          { id: 'folyamatban' as const, label: lang === 'en' ? 'In Transit' : 'Úton', count: counts.folyamatban, color: 'text-amber-600 dark:text-amber-400' },
          { id: 'teljesitve' as const, label: lang === 'en' ? 'Completed' : 'Teljesítve', count: counts.teljesitve, color: 'text-slate-500' },
          ...(firebaseUser ? [
            { id: 'sajat' as const, label: lang === 'en' ? 'My Rides' : 'Saját fuvarjaim', count: counts.sajat }
          ] : [])
        ].map((tab) => {
          const active = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusTab(tab.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border shrink-0 ${
                active
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                active 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. TARTALOM: LISTA VAGY TÉRKÉP NÉZET */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="h-[480px] sm:h-[620px] rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-md">
            <DynamicTransportMap
              jobs={filteredJobs}
              selectedJobId={selectedJobId}
              onSelectJob={(id) => setSelectedJobId(id)}
              onOpenDetails={handleOpenDetails}
            />
          </div>

          {/* Ha van kiválasztott fuvar a térképről, alatta kiemeljük */}
          {selectedJobId && (
            <div className="pt-2">
              {(() => {
                const target = filteredJobs.find((j) => j.id === selectedJobId);
                if (!target) return null;
                return (
                  <div className="p-1 rounded-2xl ring-2 ring-emerald-500 shadow-lg">
                    <TransportCard
                      job={target}
                      isSelected={true}
                      isAdmin={isAdmin}
                      onSelect={() => setSelectedJobId(target.id)}
                      onOpenDetails={handleOpenDetails}
                      onTakeJob={handleTakeJob}
                      onAdvanceStatus={handleAdvanceStatus}
                      onDelete={handleDeleteJob}
                    />
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* LISTA NÉZET */
        <div>
          {filteredJobs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-zinc-200">
                {lang === 'en' ? 'No transports found' : 'Nincs a feltételeknek megfelelő fuvar'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                {hasActiveFilters
                  ? (lang === 'en' ? 'Try changing or clearing your search filters.' : 'Próbáld módosítani vagy törölni a szűrőfeltételeket.')
                  : (lang === 'en' ? 'Be the first to post a transport request!' : 'Légy te az első, aki fuvarigényt ad fel!')}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-[44px] px-4 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {lang === 'en' ? 'Clear all filters' : 'Szűrők törlése'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {filteredJobs.map((job) => (
                <TransportCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJobId === job.id}
                  isAdmin={isAdmin}
                  onSelect={() => setSelectedJobId(job.id)}
                  onOpenDetails={handleOpenDetails}
                  onTakeJob={handleTakeJob}
                  onAdvanceStatus={handleAdvanceStatus}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. MODALOK */}
      <TransportDetailsModal
        job={activeDetailsJob}
        isOpen={Boolean(activeDetailsJob)}
        onClose={() => setActiveDetailsJob(null)}
        onJobUpdated={(updated) => {
          setActiveDetailsJob(updated);
          setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
        }}
        onDelete={handleDeleteJob}
      />

      <NewTransportModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(newJobId) => {
          setSelectedJobId(newJobId);
        }}
      />

    </div>
  );
}
