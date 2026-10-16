import { Report } from '@/types';
import { getDeleteToken } from './storage';

/**
 * Determinisztikus koordináta-elmosás (kb. 80-100 m eltolás)
 * Biztosítja, hogy az elmosott koordináta bejelentés-azonosítónként állandó maradjon,
 * így a térképen nem ugrál az állat pozíciója az újratöltések során.
 */
export function fuzzCoordinate(coord: number | undefined | null, seed: string, isLat: boolean): number | null {
  if (coord === undefined || coord === null || isNaN(coord)) return null;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const offsetMultiplier = isLat ? 0.0008 : 0.0011; // ~80-100 méter szélességben és hosszúságban
  const normalized = ((Math.abs(hash) % 1000) / 1000) - 0.5;
  return Number((coord + (normalized * offsetMultiplier)).toFixed(5));
}

/**
 * Házszám levágása publikus / nem regisztrált nézetben (város + utcanév megmarad)
 * Pl. "1052 Budapest, Kossuth Lajos utca 45/B." -> "1052 Budapest, Kossuth Lajos utca környéke"
 */
export function generalizeAddress(cim?: string, megye?: string): string {
  if (!cim || cim.trim() === '') {
    return megye ? `${megye} megye körzete` : 'Hozzávetőleges körzet';
  }

  if (cim.includes('környéke') || cim.includes('körzet')) {
    return cim;
  }

  const utcaHazszamNelkul = cim
    .replace(/\s+\d+[\s\S]*$/, '') // Levágja a házszámot és az utána lévő betűket/lépcsőházat
    .replace(/[,\.\s]+$/, '')        // Levágja a záró írásjeleket
    .trim();

  return utcaHazszamNelkul ? `${utcaHazszamNelkul} környéke` : (megye ? `${megye} megye` : 'Hozzávetőleges körzet');
}

/**
 * Ellenőrzi, hogy a felhasználó jogosult-e látni a pontos címet és koordinátát.
 * Pontos adatokat láthat:
 * 1. Hitelesített mentő (verified_rescuer) és adminisztrátor (super_admin)
 * 2. Bejelentkezett regisztrált felhasználó (isRegistered)
 * 3. A bejelentés saját létrehozója (createrId vagy helyi deleteToken)
 * 4. Ha a backend már pontosként adta át (isExactLocation === true)
 */
export function canUserSeeExactReport(
  report: Report,
  options?: {
    isRescuer?: boolean;
    isAdmin?: boolean;
    isRegistered?: boolean;
    currentUserId?: string | null;
  }
): boolean {
  if (!report) return false;

  // 1. Mentők és adminok mindig látják a pontos adatot
  if (options?.isRescuer || options?.isAdmin) return true;

  // 2. Bejelentkezett, regisztrált felhasználók látják a pontos adatot
  if (options?.isRegistered) return true;

  // 3. A bejelentés saját beküldője (regisztrált vagy vendég)
  if (options?.currentUserId && report.createrId && report.createrId === options.currentUserId) {
    return true;
  }

  // 4. Vendég bejelentő ellenőrzése a böngészőben tárolt törlési kulcs alapján
  if (typeof window !== 'undefined') {
    const localToken = getDeleteToken(report.id);
    if (localToken) return true;
  }

  // 5. Backend által hitelesített pontos jelölés
  if (report.isExactLocation === true) return true;

  return false;
}

/**
 * Megjelenítendő koordináták lekérése a jogosultság alapján.
 * Ha nem láthatja a pontos helyet, ~100 méteres eltolást alkalmazunk.
 */
export function getReportDisplayLocation(
  report: Report,
  canSeeExact: boolean
): { lat: number | null; lon: number | null; isExact: boolean } {
  if (!report.lat || !report.lon) {
    return { lat: null, lon: null, isExact: false };
  }

  if (canSeeExact) {
    return {
      lat: report.pontosLat ?? report.lat,
      lon: report.pontosLon ?? report.lon,
      isExact: true,
    };
  }

  // Ha a backend már elmosta a koordinátát:
  if (report.isExactLocation === false) {
    return { lat: report.lat, lon: report.lon, isExact: false };
  }

  // Ha nem volt elmosva, determinisztikusan eltoljuk ~100 méterrel
  const fuzzedLat = fuzzCoordinate(report.lat, report.id, true);
  const fuzzedLon = fuzzCoordinate(report.lon, report.id, false);

  return {
    lat: fuzzedLat,
    lon: fuzzedLon,
    isExact: false,
  };
}

/**
 * Megjelenítendő cím lekérése a jogosultság alapján.
 */
export function getReportDisplayAddress(report: Report, canSeeExact: boolean): string {
  if (canSeeExact) {
    return report.cim || (report.megye ? `${report.megye} megye` : 'Helyszín nincs megadva');
  }
  return generalizeAddress(report.cim, report.megye);
}
