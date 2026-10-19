/**
 * Állatmentő Portál - IndexedDB Offline Queue
 * 
 * Terepi mentésekhez, amikor erdőszélen vagy külterületen nincs térerő (offline).
 * A bejelentéseket és a fotókat a telefon helyi IndexedDB adatbázisában tárolja,
 * és hálózat visszatérésekor automatikusan felszinkronizálja.
 */

export interface QueuedOfflineReport {
  id: string;
  fajta: string;
  leiras: string;
  megye: string;
  cim?: string;
  telefon?: string;
  lat: number | null;
  lon: number | null;
  createrId?: string;
  createdAt: string;
  photoBlob?: Blob | null;
  photoFileName?: string;
  photoBlobs?: Blob[];
  photoFileNames?: string[];
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastError?: string;
}

const DB_NAME = 'allatmento_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_reports';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

/**
 * IndexedDB adatbázis kapcsolat inicializálása
 */
export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error('IndexedDB csak böngésző környezetben érhető el.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Nem sikerült megnyitni a helyi adatbázist: ${request.error?.message}`));
    };
  });
}

function notifyQueueChange(count?: number) {
  if (typeof window !== 'undefined') {
    if (count !== undefined) {
      window.dispatchEvent(new CustomEvent('allatmento_offline_queue_changed', { detail: { count } }));
    } else {
      getOfflineReportsCount().then((c) => {
        window.dispatchEvent(new CustomEvent('allatmento_offline_queue_changed', { detail: { count: c } }));
      }).catch(() => {});
    }
  }
}

/**
 * Új bejelentés mentése a helyi IndexedDB várakozási sorba (offline)
 */
export async function saveOfflineReport(
  data: Omit<QueuedOfflineReport, 'id' | 'createdAt' | 'status' | 'retryCount'>
): Promise<QueuedOfflineReport> {
  const db = await openOfflineDb();

  const id = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const record: QueuedOfflineReport = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(record);

      req.onsuccess = () => {
        notifyQueueChange();
        resolve(record);
      };

      req.onerror = () => {
        reject(new Error(`Hiba az offline bejelentés mentésekor: ${req.error?.message}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Összes várakozó offline bejelentés lekérése
 */
export async function getOfflineReports(): Promise<QueuedOfflineReport[]> {
  if (!isBrowser()) return [];
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = (req.result || []) as QueuedOfflineReport[];
        // Rendezés időrend szerint
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(results);
      };

      req.onerror = () => {
        reject(new Error(`Hiba a várakozó bejelentések lekérésekor: ${req.error?.message}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Várakozó bejelentések száma
 */
export async function getOfflineReportsCount(): Promise<number> {
  if (!isBrowser()) return 0;
  try {
    const db = await openOfflineDb();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count();

        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  } catch {
    return 0;
  }
}

/**
 * Egy konkrét offline bejelentés lekérése ID alapján
 */
export async function getOfflineReport(id: string): Promise<QueuedOfflineReport | null> {
  if (!isBrowser()) return null;
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Szinkronizált bejelentés törlése a helyi várakozási sorból
 */
export async function removeOfflineReport(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        notifyQueueChange();
        resolve();
      };
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Offline bejelentés státuszának és hibájának frissítése
 */
export async function updateOfflineReportStatus(
  id: string,
  status: QueuedOfflineReport['status'],
  error?: string
): Promise<void> {
  if (!isBrowser()) return;
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as QueuedOfflineReport | undefined;
        if (!item) {
          resolve();
          return;
        }

        item.status = status;
        if (status === 'failed') {
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = error;
        }

        const putReq = store.put(item);
        putReq.onsuccess = () => {
          notifyQueueChange();
          resolve();
        };
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Összes offline bejelentés ürítése (pl. teszteléshez vagy manuális törléshez)
 */
export async function clearAllOfflineReports(): Promise<void> {
  if (!isBrowser()) return;
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => {
        notifyQueueChange(0);
        resolve();
      };
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}
