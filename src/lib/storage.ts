export function getAnonymousUserId(): string {
  if (typeof window === 'undefined') return '';
  let uid = localStorage.getItem('allatmento_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('allatmento_user_id', uid);
  }
  return uid;
}

export function getSavedDeleteTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const tokens: Record<string, string> = {};
  
  // 1. Olvassuk be a 'sajat_bejelentesek' JSON szótárat
  try {
    const raw = localStorage.getItem('sajat_bejelentesek');
    if (raw) {
      Object.assign(tokens, JSON.parse(raw));
    }
  } catch {}

  // 2. Olvassuk be az összes 'allatmento_del_' kulcsot is (legacy és egyedi tárolás)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('allatmento_del_')) {
        const reportId = key.replace('allatmento_del_', '');
        const token = localStorage.getItem(key);
        if (reportId && token) {
          tokens[reportId] = token;
        }
      }
    }
  } catch {}

  return tokens;
}

export function saveDeleteToken(reportId: string, deleteToken: string): void {
  if (typeof window === 'undefined' || !reportId || !deleteToken) return;
  try {
    // Mentés az egyedi allatmento_del_ kulcsba (klasszikus app kompatibilitás)
    localStorage.setItem('allatmento_del_' + reportId, deleteToken);

    // Mentés a gyűjtő sajat_bejelentesek JSON-ba is
    const tokens = getSavedDeleteTokens();
    tokens[reportId] = deleteToken;
    localStorage.setItem('sajat_bejelentesek', JSON.stringify(tokens));
  } catch (err) {
    console.error('Hiba a deleteToken mentésekor:', err);
  }
}

export function getDeleteToken(reportId: string): string | null {
  if (typeof window === 'undefined' || !reportId) return null;
  const directToken = localStorage.getItem('allatmento_del_' + reportId);
  if (directToken) return directToken;

  const tokens = getSavedDeleteTokens();
  return tokens[reportId] || null;
}

export function removeDeleteToken(reportId: string): void {
  if (typeof window === 'undefined' || !reportId) return;
  try {
    localStorage.removeItem('allatmento_del_' + reportId);

    const tokens = getSavedDeleteTokens();
    delete tokens[reportId];
    localStorage.setItem('sajat_bejelentesek', JSON.stringify(tokens));
  } catch (err) {
    console.error('Hiba a deleteToken törlésekor:', err);
  }
}

// --- Saját feladott fuvarok azonosítása (bejelentkezés nélkül is) ---
export function saveMyTransportId(transportId: string): void {
  if (typeof window === 'undefined' || !transportId) return;
  try {
    const raw = localStorage.getItem('sajat_fuvarok') || '[]';
    const list: string[] = JSON.parse(raw);
    if (!list.includes(transportId)) {
      list.push(transportId);
      localStorage.setItem('sajat_fuvarok', JSON.stringify(list));
    }
  } catch (err) {
    console.error('Hiba a saját fuvar mentésekor:', err);
  }
}

export function getMyTransportIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sajat_fuvarok') || '[]';
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isMyTransport(transportId: string, feladoUserId?: string, currentUid?: string): boolean {
  if (currentUid && feladoUserId && currentUid === feladoUserId) return true;
  if (typeof window === 'undefined' || !transportId) return false;
  try {
    const ids = getMyTransportIds();
    return ids.includes(transportId);
  } catch {
    return false;
  }
}

