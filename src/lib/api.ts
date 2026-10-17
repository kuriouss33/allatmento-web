import { BACKEND_URL } from './constants';
import { Report, ReportStatus, UserProfile } from '@/types';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Hiba történt a szerver hívásakor (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Segédfüggvény: Bejelentés adatainak normalizálása (adatbázis és backend kompatibilitás)
export function normalizeReport(raw: any): Report {
  if (!raw) return raw;
  const data = raw.adat ? { ...raw.adat, ...raw } : raw;

  const id = raw.id || data.id || '';
  const fajta = data.fajta || data.allatFajta || 'Ismeretlen állat';
  const leiras = data.leiras || data.helyszinLeiras || data.megjegyzes || '';
  const telefon = data.telefon || data.bejelentoTelefon || '';
  const fotoUrl = data.fotoUrl || data.kepUrl || undefined;
  const megoldasFotoUrl = data.megoldasFotoUrl || data.lezarasFotoUrl || undefined;
  const megoldasLeiras = data.megoldasLeiras || data.lezarasMegjegyzes || undefined;
  const rescuerId = data.rescuerId || data.rescuerUid || data.vallaloId || undefined;
  const rawStatus = (data.statusz || data.status || 'uj').toString().toLowerCase();
  const statusz: ReportStatus = rawStatus === 'folyamatban' ? 'folyamatban' : (rawStatus === 'megoldva' ? 'megoldva' : 'uj');

  const lat = data.lat !== undefined && data.lat !== null && !isNaN(Number(data.lat)) ? Number(data.lat) : null;
  const lon = data.lon !== undefined && data.lon !== null && !isNaN(Number(data.lon))
    ? Number(data.lon)
    : (data.lng !== undefined && data.lng !== null && !isNaN(Number(data.lng)) ? Number(data.lng) : null);

  return {
    ...data,
    id,
    fajta,
    allatFajta: fajta,
    leiras,
    megjegyzes: leiras,
    helyszinLeiras: leiras,
    telefon,
    bejelentoTelefon: telefon,
    statusz,
    status: statusz,
    fotoUrl,
    kepUrl: fotoUrl,
    megoldasFotoUrl,
    lezarasFotoUrl: megoldasFotoUrl,
    megoldasLeiras,
    lezarasMegjegyzes: megoldasLeiras,
    rescuerId,
    rescuerUid: rescuerId,
    lat,
    lon,
    lng: lon,
    isExactLocation: data.isExactLocation !== undefined ? Boolean(data.isExactLocation) : undefined,
    hasPhone: Boolean(data.hasPhone || telefon),
  };
}

// 1. Bejelentések lekérése
export async function getReports(status?: string, idToken?: string): Promise<Report[]> {
  const params = status ? `?status=${encodeURIComponent(status)}` : '';
  const headers: Record<string, string> = {};
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const res = await apiFetch<{ success: boolean; reports: any[] }>(`/reports${params}`, {
    method: 'GET',
    headers,
  });

  return (res.reports || []).map(normalizeReport);
}

// 2. Új bejelentés létrehozása
export async function createReport(data: {
  fajta: string;
  leiras?: string;
  megye?: string;
  cim?: string;
  telefon?: string;
  lat: number | null;
  lon: number | null;
  fotoUrl?: string;
  createrId?: string;
}): Promise<{ success: boolean; id: string; deleteToken: string; data?: any }> {
  const payload = {
    ...data,
    allatFajta: data.fajta,
    helyszinLeiras: data.leiras || '',
    megjegyzes: data.leiras || '',
    bejelentoTelefon: data.telefon || '',
    kepUrl: data.fotoUrl || null,
    lng: data.lon,
  };

  const res = await apiFetch<any>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const reportId = res?.id || res?.data?.id || '';
  const token = res?.deleteToken || res?.data?.deleteToken || '';

  return {
    success: true,
    id: reportId,
    deleteToken: token,
    data: res?.data || res,
  };
}

// 3. Képfeltöltés FormData-val (Multer 'image' mezőnévvel)
export async function uploadImage(fileOrBlob: Blob | File, filename: string = 'photo.jpg'): Promise<string> {
  const formData = new FormData();
  // A backend upload.single('image') kifejezetten 'image' nevű mezőt vár
  formData.append('image', fileOrBlob, filename);

  const res = await fetch(`${BACKEND_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  let errorMessage = 'A kép feltöltése sikertelen volt.';
  let data: any = null;

  try {
    const text = await res.text();
    try {
      data = JSON.parse(text);
      if (data?.error) errorMessage = data.error;
      else if (data?.message) errorMessage = data.message;
    } catch {
      if (text && text.length < 250) errorMessage = text;
    }
  } catch {}

  if (!res.ok) {
    if (res.status === 413) {
      errorMessage = 'A feltöltött kép mérete meghaladja a szerver nélküli limitet (max. 4.5 MB). Kérlek, próbáld kisebb méretű fotóval vagy engedd a tömörítést!';
    }
    throw new Error(errorMessage);
  }

  const url = data?.url || data?.data?.url || data?.display_url;
  if (!url) {
    throw new Error('A szerver nem küldött vissza kép URL-t.');
  }

  return url;
}

// 4. Státusz frissítése (Felvétel, visszalépés, megoldás)
export async function updateReportStatus(
  reportId: string,
  statusz: ReportStatus,
  idToken: string,
  extra?: { megoldasLeiras?: string; megoldasFotoUrl?: string }
): Promise<any> {
  return await apiFetch(`/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      status: statusz,
      statusz: statusz,
      lezarasMegjegyzes: extra?.megoldasLeiras,
      lezarasFotoUrl: extra?.megoldasFotoUrl,
      megoldasLeiras: extra?.megoldasLeiras,
      megoldasFotoUrl: extra?.megoldasFotoUrl,
    }),
  });
}

// 5. Bejelentés törlése
export async function deleteReport(
  reportId: string,
  options: { deleteToken?: string; idToken?: string; anonymousUid?: string } = {}
): Promise<any> {
  const headers: Record<string, string> = {};
  if (options.deleteToken) {
    headers['x-delete-token'] = options.deleteToken;
  }
  if (options.idToken) {
    headers['Authorization'] = `Bearer ${options.idToken}`;
  }
  if (options.anonymousUid) {
    headers['x-anonymous-uid'] = options.anonymousUid;
  }

  return await apiFetch(`/reports/${reportId}`, {
    method: 'DELETE',
    headers,
  });
}

// 6. Komment küldése
export async function addComment(reportId: string, text: string, idToken: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  return await apiFetch(`/reports/${reportId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ szoveg: text }),
  });
}

// 7. Segítségnyújtási ajánlat küldése
export async function sendHelpOffer(
  reportId: string,
  offer: { nev: string; telefon: string; uzenet: string }
): Promise<any> {
  return await apiFetch(`/reports/${reportId}/help-offer`, {
    method: 'POST',
    body: JSON.stringify(offer),
  });
}

// 8. Saját profil és szerepkör lekérése
export async function getMe(idToken: string): Promise<UserProfile> {
  const res = await apiFetch<{ success: boolean; user: UserProfile }>('/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return res.user;
}

// 9. Regisztrációs profil rögzítése
export async function registerProfile(uid: string, email: string): Promise<any> {
  return await apiFetch('/auth/register-profile', {
    method: 'POST',
    body: JSON.stringify({ uid, email }),
  });
}

// 10. E-mail megerősítés küldése
export async function sendVerificationEmail(email: string): Promise<any> {
  return await apiFetch('/auth/send-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// 11. Admin: Felhasználók listázása
export async function adminListUsers(idToken: string): Promise<UserProfile[]> {
  const res = await apiFetch<{ success: boolean; users: UserProfile[] }>('/users', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return res.users || [];
}

// 12. Admin: Szerepkör módosítása
export async function adminSetUserRole(targetUid: string, role: string, idToken: string): Promise<any> {
  return await apiFetch(`/users/${targetUid}/role`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ role }),
  });
}

// 13. Admin: Felhasználó törlése
export async function adminDeleteUser(targetUid: string, idToken: string): Promise<any> {
  return await apiFetch(`/users/${targetUid}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export interface TranslateResult {
  translated: string;
  isTranslated: boolean;
  detectedSourceLang?: string;
}

// 14. Szöveg automatikus fordítása (magyar <-> angol)
export async function translateTextDetailed(
  text: string,
  targetLang: 'en' | 'hu'
): Promise<TranslateResult> {
  if (!text || !text.trim()) return { translated: text, isTranslated: false };
  try {
    const res = await apiFetch<{
      success: boolean;
      translated: string;
      detectedSourceLang?: string;
      isTranslated?: boolean;
    }>('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLang }),
    });
    return {
      translated: res.translated || text,
      isTranslated: Boolean(res.isTranslated),
      detectedSourceLang: res.detectedSourceLang,
    };
  } catch (err) {
    console.error('Translation failed:', err);
    return { translated: text, isTranslated: false };
  }
}

export async function translateText(text: string, targetLang: 'en' | 'hu'): Promise<string> {
  const res = await translateTextDetailed(text, targetLang);
  return res.translated;
}

