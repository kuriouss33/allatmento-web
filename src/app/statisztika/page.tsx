'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Dog, 
  Cat, 
  Bird, 
  HelpCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Flame,
  Award
} from 'lucide-react';
import { getReports } from '@/lib/api';
import { Report } from '@/types';
import { MEGYEK } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Nem sikerült betölteni a statisztikákat:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Számítások
  const totalCount = reports.length;
  const activeCount = reports.filter((r) => r.statusz === 'uj').length;
  const inProgressCount = reports.filter((r) => r.statusz === 'folyamatban').length;
  const resolvedCount = reports.filter((r) => r.statusz === 'megoldva').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Állatfajta statisztikák
  const speciesStats = useMemo(() => {
    const speciesMap: Record<string, { total: number; resolved: number; icon: any; label: string }> = {
      Kutya: { total: 0, resolved: 0, icon: Dog, label: t.typeDog || 'Kutya' },
      Macska: { total: 0, resolved: 0, icon: Cat, label: t.typeCat || 'Macska' },
      Vadállat: { total: 0, resolved: 0, icon: Bird, label: t.typeWild || 'Vadállat' },
      Egyéb: { total: 0, resolved: 0, icon: HelpCircle, label: t.typeOther || 'Egyéb' },
    };

    reports.forEach((r) => {
      const f = (r.fajta || 'Egyéb').trim();
      let key = 'Egyéb';
      if (/kutya|dog/i.test(f)) key = 'Kutya';
      else if (/macska|cica|cat/i.test(f)) key = 'Macska';
      else if (/vad|madár|őz|róka|wild/i.test(f)) key = 'Vadállat';
      else if (speciesMap[f]) key = f;

      if (!speciesMap[key]) {
        speciesMap[key] = { total: 0, resolved: 0, icon: HelpCircle, label: key };
      }

      speciesMap[key].total += 1;
      if (r.statusz === 'megoldva') {
        speciesMap[key].resolved += 1;
      }
    });

    return Object.entries(speciesMap).map(([id, data]) => ({
      id,
      ...data,
      percent: totalCount > 0 ? Math.round((data.total / totalCount) * 100) : 0,
    }));
  }, [reports, totalCount, t]);

  // Megye statisztikák
  const countyStats = useMemo(() => {
    const countyMap: Record<string, { total: number; active: number; resolved: number }> = {};
    MEGYEK.forEach((m) => {
      countyMap[m] = { total: 0, active: 0, resolved: 0 };
    });

    reports.forEach((r) => {
      let county = (r.megye || '').trim();
      // Ha nincs megadva megye, próbáljuk kitalálni a címből
      if (!county || !countyMap[county]) {
        const found = MEGYEK.find((m) => (r.cim || '').toLowerCase().includes(m.toLowerCase()));
        county = found || 'Budapest';
      }

      if (!countyMap[county]) {
        countyMap[county] = { total: 0, active: 0, resolved: 0 };
      }
      countyMap[county].total += 1;
      if (r.statusz === 'uj') countyMap[county].active += 1;
      if (r.statusz === 'megoldva') countyMap[county].resolved += 1;
    });

    return Object.entries(countyMap)
      .map(([county, counts]) => ({
        county,
        ...counts,
        percent: totalCount > 0 ? Math.round((counts.total / totalCount) * 100) : 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [reports, totalCount]);

  // Város / Település statisztikák (Toplistás gócpontok)
  const cityStats = useMemo(() => {
    const cityMap: Record<string, { total: number; resolved: number }> = {};

    reports.forEach((r) => {
      let city = 'Ismeretlen';
      if (r.megye === 'Budapest') {
        city = 'Budapest';
      } else if (r.cim) {
        // Cím darabolása
        const parts = r.cim.split(',').map((p) => p.trim()).filter(Boolean);
        const streetKeywords = ['utca', 'út', 'u.', 'tér', 'tere', 'körút', 'krt.', 'sor', 'dűlő', 'köz', 'fasor', 'rakpart', 'park'];
        const ignoreKeywords = ['magyarország', 'hungary'];

        for (const part of parts) {
          const lower = part.toLowerCase();
          if (/^\d{4}$/.test(part)) continue;
          if (ignoreKeywords.some((k) => lower.includes(k))) continue;
          if (streetKeywords.some((k) => lower.includes(k))) continue;
          if (/^\d+/.test(part)) continue;
          if (MEGYEK.some((m) => m.toLowerCase() === lower)) continue;
          city = part;
          break;
        }

        if (city === 'Ismeretlen' && parts[0]) {
          city = parts[0];
        }
      }

      if (city === 'Ismeretlen' && r.megye) {
        city = `${r.megye} (térség)`;
      }

      if (!cityMap[city]) {
        cityMap[city] = { total: 0, resolved: 0 };
      }
      cityMap[city].total += 1;
      if (r.statusz === 'megoldva') {
        cityMap[city].resolved += 1;
      }
    });

    return Object.entries(cityMap)
      .map(([city, counts]) => ({
        city,
        ...counts,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 város
  }, [reports]);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 animate-fadeIn">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>{t.realTimeData}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.statsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.statsSub}
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? t.refreshing : t.refreshBtn}</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Fő mérőszámok (4 nagy kártya a 3 domináns színben) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            
            {/* 1. Összes bejelentés (Kék) */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.statsTotalReports}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalCount}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.casesReceived}
                </span>
              </div>
            </div>

            {/* 2. Aktív ügyek (Piros) */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  {t.statsActiveReports}
                </span>
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-zinc-800 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <span className="text-2xl sm:text-4xl font-black text-red-600 dark:text-red-500">
                  {activeCount}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.animalsWaiting}
                </span>
              </div>
            </div>

            {/* 3. Folyamatban lévő mentések (Kék/Smaragdzöld) */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {t.statsInProgressReports}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <span className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                  {inProgressCount}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.rescuersEnRoute}
                </span>
              </div>
            </div>

            {/* 4. Megoldott esetek (Smaragdzöld) */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t.statsResolvedReports}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
                <span className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {resolvedCount}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400">
                  {resolutionRate}% {t.ratioLabel}
                </span>
              </div>
            </div>

          </div>

          {/* 1. Szekció: Mentett állatfajták (Kutya, Macska, Vadállat, Egyéb) */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{t.statsSpeciesBreakdown}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.speciesBreakdownSub}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {speciesStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.percent}% {t.ofTotal}
                          </span>
                        </div>
                      </div>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {item.total}
                      </span>
                    </div>

                    {/* Progress Bar & Sikerességi mutató */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (item.total / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>{t.solvedLabel}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.resolved} db ({item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. és 3. Szekció: Megyei Gócpontok és Top Városok Kétoszlopos bontásban */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Megyék szerinti toplista (Gócpontok) */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>{t.statsCountyBreakdown}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.countyHotspotsSub}
                  </p>
                </div>
              </div>

              {countyStats.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {t.noCountyData}
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {countyStats.map((item, idx) => {
                    const maxTotal = countyStats[0]?.total || 1;
                    const barPercent = Math.round((item.total / maxTotal) * 100);

                    return (
                      <div
                        key={item.county}
                        className="p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors bg-slate-50/40 dark:bg-slate-800/30 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              idx === 0 
                                ? 'bg-red-500 text-white shadow-sm shadow-red-500/30' 
                                : idx === 1 
                                ? 'bg-blue-600 text-white' 
                                : idx === 2 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {idx + 1}
                            </span>
                            <span>{item.county}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-black">
                            <span className="text-slate-900 dark:text-white">
                              {item.total} {t.reportsUnit}
                            </span>
                            {item.active > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                                {item.active} {t.activeUnit}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${barPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Városok & Települések */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t.statsCityBreakdown}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.topCitiesSub}
                  </p>
                </div>
              </div>

              {cityStats.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {t.noCityData}
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {cityStats.map((item, idx) => {
                    const maxCityTotal = cityStats[0]?.total || 1;
                    const barPercent = Math.round((item.total / maxCityTotal) * 100);

                    return (
                      <div
                        key={item.city}
                        className="p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors bg-slate-50/40 dark:bg-slate-800/30 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[180px] sm:max-w-xs">{item.city}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-black text-slate-900 dark:text-white">
                              {item.total} {t.casesUnit}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              {item.resolved} {t.solvedUnit}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                            style={{ width: `${barPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
