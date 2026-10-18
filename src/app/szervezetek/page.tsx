'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Phone, 
  MapPin, 
  Filter, 
  Stethoscope, 
  ShieldAlert, 
  Bird, 
  Home,
  Mail,
  Navigation,
  Loader2,
  Compass,
  ExternalLink,
  X
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MEGYEK } from '@/lib/constants';
import { Organization, OrgCategory } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAutoHideOnScroll } from '@/hooks';
import { ORGANIZATIONS } from '@/data/organizationsData';
import { calculateDistanceKm, formatDistance, getOrgCoordinates } from '@/lib/geoUtils';

export default function OrganizationsPage() {
  const { t } = useLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(ORGANIZATIONS);
  const [loading, setLoading] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<'all' | OrgCategory>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // "Közelemben" szűrő állapotok
  const [nearMeActive, setNearMeActive] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(20);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const toggleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      return;
    }

    if (userCoords) {
      setNearMeActive(true);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError(t.geoPermissionDenied);
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setNearMeActive(true);
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Helymeghatározási hiba:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(t.geoPermissionDenied);
        } else {
          setGeoError(t.geoError || 'Nem sikerült lekérni a pozíciót.');
        }
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const {
    isVisible: isFilterVisible,
    setIsVisible: setIsFilterVisible,
    scrollRef,
    handleScroll,
  } = useAutoHideOnScroll<HTMLDivElement>({
    threshold: 12,
    topOffset: 25,
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        if (!db) return;
        const snap = await getDocs(collection(db, 'szervezetek'));
        if (!snap.empty) {
          const list: Organization[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Organization));
          
          // Merge: keep all baseline ORGANIZATIONS and add/override any custom Firestore items
          const map = new Map<string, Organization>();
          ORGANIZATIONS.forEach((o) => map.set(o.id, o));
          list.forEach((o) => map.set(o.id, o));
          setOrgs(Array.from(map.values()));
        }
      } catch (err) {
        console.warn('Alapértelmezett szervezeti lista használata:', err);
      }
    };
    fetchOrgs();
  }, []);

  const filteredOrgs = useMemo(() => {
    // 1. Koordináták és távolság hozzárendelése minden szervezethez
    const orgsWithDistance = orgs.map((org) => {
      const coords = getOrgCoordinates(org);
      let distanceKm: number | undefined = undefined;

      if (userCoords && coords) {
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
      }

      return {
        ...org,
        lat: org.lat || coords?.lat,
        lon: org.lon || coords?.lon,
        distanceKm,
      };
    });

    // 2. Szűrés
    const result = orgsWithDistance.filter((org) => {
      // Közelemben rádiusz szűrés (10-20-30-50 km-es kör)
      if (nearMeActive) {
        if (org.distanceKm === undefined || org.distanceKm > radiusKm) {
          return false;
        }
      }

      const kat = (org.kategoria || 'menhely').toLowerCase().trim();

      // Kategória szűrés
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'menhely') {
          const isMenhely =
            kat === 'menhely' ||
            kat === 'mentoszervezet' ||
            kat.includes('menhely') ||
            kat.includes('mento') ||
            kat.includes('egyesulet') ||
            kat.includes('alapitvany') ||
            (!kat.includes('orvos') && !kat.includes('hatosag') && !kat.includes('vad'));
          if (!isMenhely) return false;
        } else if (categoryFilter === 'orvos') {
          const isOrvos = kat === 'orvos' || kat.includes('orvos') || kat.includes('korhaz') || kat.includes('rendelo');
          if (!isOrvos) return false;
        } else if (categoryFilter === 'hatosag') {
          const isHatosag = kat === 'hatosag' || kat.includes('hatosag') || kat.includes('ebrendeszet') || kat.includes('gyepmester');
          if (!isHatosag) return false;
        } else if (categoryFilter === 'vad') {
          const isVad = kat === 'vad' || kat.includes('vad') || kat.includes('madar');
          if (!isVad) return false;
        } else if (kat !== categoryFilter) {
          return false;
        }
      }

      // Megye szűrés (csak ha nem a Közelemben van bekapcsolva)
      if (!nearMeActive && countyFilter !== 'all') {
        const orgMegye = (org.megye || '').toLowerCase().trim();
        const selMegye = countyFilter.toLowerCase().trim();
        if (orgMegye !== selMegye) {
          return false;
        }
      }

      // Szabadszavas kereső (név, cím, megye, leírás, email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = (org.nev || '').toLowerCase().includes(q);
        const inCity = (org.cim || '').toLowerCase().includes(q);
        const inCounty = (org.megye || '').toLowerCase().includes(q);
        const inDesc = (org.leiras || '').toLowerCase().includes(q);
        const inEmail = (org.email || '').toLowerCase().includes(q);
        if (!inName && !inCity && !inCounty && !inDesc && !inEmail) return false;
      }
      return true;
    });

    // 3. Rendezés: ha Közelemben aktív, legközelebbi legelöl
    if (nearMeActive && userCoords) {
      result.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return result;
  }, [orgs, nearMeActive, userCoords, radiusKm, categoryFilter, countyFilter, searchQuery]);

  const getCategoryBadge = (kat?: string) => {
    const normalized = (kat || 'menhely').toLowerCase().trim();
    if (normalized.includes('orvos') || normalized.includes('korhaz') || normalized.includes('rendelo')) {
      return { label: t.catVet || 'Állatorvos / Ügyelet', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    }
    if (normalized.includes('hatosag') || normalized.includes('ebrendeszet') || normalized.includes('gyepmester')) {
      return { label: t.catAuth || 'Hatóság / Gyepmester', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    }
    if (normalized.includes('vad') || normalized.includes('madar')) {
      return { label: t.catWild || 'Vadmentés', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    }
    return { label: t.catShelter || 'Menhely / Mentőszervezet', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-7xl min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6 space-y-2 sm:space-y-4 overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="shrink-0 text-center flex flex-col items-center justify-center">
        <h1 className="text-lg sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2 flex-wrap">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          <span>{t.orgsTitle}</span>
          <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {filteredOrgs.length}
          </span>
        </h1>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 text-center font-light">
          {t.orgsSub}
        </p>
      </div>

      {/* Filters Bar with Auto-Hide on scroll */}
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isFilterVisible
            ? 'max-h-[600px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none !m-0 !p-0'
        }`}
      >
        <div className="p-2.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 sm:space-y-3.5">
          
          {/* Category & Near Me Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full">
            {/* "Közelemben" GPS filter button */}
            <button
              type="button"
              onClick={toggleNearMe}
              disabled={geoLoading}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-light flex items-center gap-1.5 transition-all cursor-pointer ${
                nearMeActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/25'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title={t.nearMeTooltip}
            >
              {geoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>{nearMeActive ? t.filterNearMeActive.replace('{radius}', radiusKm.toString()) : t.filterNearMe}</span>
            </button>

            {[
              { id: 'all', label: t.filterAll },
              { id: 'menhely', label: t.catShelter },
              { id: 'orvos', label: t.catVet },
              { id: 'hatosag', label: t.catAuth },
              { id: 'vad', label: t.catWild },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-light transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Radius selector (10-20km kör) when Near Me is active */}
          {nearMeActive && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs animate-fadeIn">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-light">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.nearMeLocationActive}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  • {t.sortByDistance}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mr-1 hidden xs:inline">{t.radiusLabel}</span>
                {[10, 15, 20, 30, 50].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusKm(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-light transition-all cursor-pointer ${
                      radiusKm === r
                        ? 'bg-emerald-600 text-white shadow-xs font-normal'
                        : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Geo error message if denied or unavailable */}
          {geoError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2 animate-fadeIn">
              <span>{geoError}</span>
              <button
                type="button"
                onClick={() => setGeoError(null)}
                className="p-1 hover:bg-red-500/20 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* County & Search Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              onFocus={() => setIsFilterVisible(true)}
              disabled={nearMeActive}
              className={`w-full px-3 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-light text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                nearMeActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="all">{nearMeActive ? `📍 ${t.nearMeLocationActive}` : t.allCounties}</option>
              {MEGYEK.map((m) => (
                <option key={m} value={m}>
                  {m} {t.countySuffix}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFilterVisible(true)}
                placeholder={t.searchOrgPlaceholder}
                className="w-full pl-8 sm:pl-9 pr-3.5 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-light text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Cards Grid */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin pb-2"
      >
        {filteredOrgs.length === 0 ? (
          <div className="py-12 sm:py-16 text-center p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-light text-slate-800 dark:text-slate-200">
              {nearMeActive ? t.noNearOrgsFound.replace('{radius}', radiusKm.toString()) : t.noOrgsFound}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto font-light">
              {nearMeActive ? t.expandRadiusPrompt : t.noOrgsFoundSub}
            </p>
            {nearMeActive && radiusKm < 50 && (
              <button
                type="button"
                onClick={() => setRadiusKm(50)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-light text-xs shadow-sm transition-all cursor-pointer"
              >
                {t.expandRadiusBtn}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 content-start">
            {filteredOrgs.map((org) => {
              const badge = getCategoryBadge(org.kategoria);
              return (
                <div
                  key={org.id}
                  className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2.5 sm:space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-light border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {typeof org.distanceKm === 'number' && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{formatDistance(org.distanceKm)}</span>
                          </span>
                        )}
                        {org.megye && (
                          <span className="text-[10px] font-light text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-2 py-0.5 rounded-md">
                            {org.megye}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-medium sm:font-light text-base text-slate-900 dark:text-white leading-snug">
                      {org.nev}
                    </h3>

                    {org.cim && (
                      <p className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-light">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{org.cim}</span>
                      </p>
                    )}

                    {org.leiras && (
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed pt-1">
                        {org.leiras}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    {org.telefon && !org.telefon.includes('@') ? (
                      <a
                        href={`tel:${org.telefon}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-light text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98] transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t.callNow.toUpperCase()} ({org.telefon})</span>
                      </a>
                    ) : (org.email || (org.telefon && org.telefon.includes('@'))) ? (
                      <a
                        href={`mailto:${org.email || org.telefon}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-light text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>EMAIL ({org.email || org.telefon})</span>
                      </a>
                    ) : (
                      <div className="text-center py-2 text-xs text-slate-400 font-light">
                        {t.noPhoneProvided}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                      {org.telefon && !org.telefon.includes('@') && org.email ? (
                        <a
                          href={`mailto:${org.email}`}
                          className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{org.email}</span>
                        </a>
                      ) : <span />}

                      {org.cim && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(org.cim)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-light ml-auto"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t.navToOrg}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
