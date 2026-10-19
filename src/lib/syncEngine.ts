/**
 * Állatmentő Portál - Háttér Szinkronizációs Motor (Sync Engine)
 * 
 * Automatikusan figyeli a hálózati kapcsolat visszatérését,
 * feldolgozza az IndexedDB-ben várakozó bejelentéseket, feltölti a tömörített fotókat,
 * létrehozza a bejelentéseket az API-n keresztül, és értesíti a felhasználói felületet.
 */

import { getOfflineReports, removeOfflineReport, updateOfflineReportStatus, getOfflineReportsCount, QueuedOfflineReport } from './offlineQueue';
import { uploadImage, createReport } from './api';
import { saveDeleteToken } from './storage';
import { isNetworkError } from './image';

let isSyncing = false;
let autoSyncInitialized = false;

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  remainingCount: number;
  errors: string[];
}

/**
 * Várakozó offline bejelentések azonnali szinkronizálása
 */
export async function syncOfflineReports(): Promise<SyncResult> {
  if (typeof window === 'undefined') {
    return { syncedCount: 0, failedCount: 0, remainingCount: 0, errors: [] };
  }

  // Ha már fut a szinkronizáció vagy nincs internet, ne induljon el újra
  if (isSyncing) {
    const count = await getOfflineReportsCount();
    return { syncedCount: 0, failedCount: 0, remainingCount: count, errors: ['A szinkronizáció már folyamatban van.'] };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const count = await getOfflineReportsCount();
    return { syncedCount: 0, failedCount: 0, remainingCount: count, errors: ['Nincs internetkapcsolat.'] };
  }

  isSyncing = true;
  window.dispatchEvent(new CustomEvent('allatmento_sync_started'));

  let syncedCount = 0;
  const errors: string[] = [];

  try {
    const reports = await getOfflineReports();
    if (reports.length === 0) {
      isSyncing = false;
      window.dispatchEvent(new CustomEvent('allatmento_sync_finished', { detail: { syncedCount: 0 } }));
      return { syncedCount: 0, failedCount: 0, remainingCount: 0, errors: [] };
    }

    for (const item of reports) {
      try {
        await updateOfflineReportStatus(item.id, 'syncing');

        const uploadedPhotoUrls: string[] = [];

        // 1. Képek feltöltése (több kép támogatása)
        if (item.photoBlobs && item.photoBlobs.length > 0) {
          for (let i = 0; i < item.photoBlobs.length; i++) {
            const blob = item.photoBlobs[i];
            const fname = (item.photoFileNames && item.photoFileNames[i]) || `field-report-${item.id}-${i}.jpg`;
            try {
              const url = await uploadImage(blob, fname);
              uploadedPhotoUrls.push(url);
            } catch (uploadErr: any) {
              if (isNetworkError(uploadErr)) {
                await updateOfflineReportStatus(item.id, 'pending');
                errors.push(`Képfeltöltés hálózati megszakadása: ${uploadErr.message}`);
                break;
              }
              console.warn('[Sync] Képfeltöltési hiba részleges képnél:', uploadErr);
            }
          }
        } else if (item.photoBlob) {
          try {
            const url = await uploadImage(
              item.photoBlob, 
              item.photoFileName || `field-report-${item.id}.jpg`
            );
            uploadedPhotoUrls.push(url);
          } catch (uploadErr: any) {
            if (isNetworkError(uploadErr)) {
              // Hálózat ismét megszakadt, leállítjuk a további próbálkozást
              await updateOfflineReportStatus(item.id, 'pending');
              errors.push(`Képfeltöltés hálózati megszakadása: ${uploadErr.message}`);
              break;
            }
            console.warn('[Sync] Képfeltöltési hiba, bejelentés beküldése fotó nélkül:', uploadErr);
          }
        }

        const primaryPhotoUrl = uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls[0] : undefined;

        // 2. Bejelentés létrehozása az API-n
        const createResult = await createReport({
          fajta: item.fajta,
          leiras: item.leiras,
          megye: item.megye,
          cim: item.cim,
          telefon: item.telefon,
          lat: item.lat,
          lon: item.lon,
          fotoUrl: primaryPhotoUrl,
          kepek: uploadedPhotoUrls,
          createrId: item.createrId,
        });

        const newReportId = createResult.id || (createResult as any).data?.id;
        const deleteToken = createResult.deleteToken || (createResult as any).data?.deleteToken;

        if (newReportId && deleteToken) {
          saveDeleteToken(newReportId, deleteToken);
        }

        // 3. Sikeres beküldés után törlés a várakozási sorból
        await removeOfflineReport(item.id);
        syncedCount++;
      } catch (itemErr: any) {
        if (isNetworkError(itemErr)) {
          // Ha megszakadt a hálózat a folyamat közben, visszaállítjuk pending-re és kilépünk
          await updateOfflineReportStatus(item.id, 'pending');
          errors.push(`Hálózat megszakadt a beküldés közben: ${itemErr.message}`);
          break;
        } else {
          // Nem hálózati hiba (pl. validációs hiba)
          await updateOfflineReportStatus(item.id, 'failed', itemErr.message);
          errors.push(itemErr.message || 'Ismeretlen hiba a bejelentés beküldésekor');
        }
      }
    }
  } catch (err: any) {
    errors.push(err.message || 'Általános szinkronizációs hiba');
  } finally {
    isSyncing = false;
    const remainingCount = await getOfflineReportsCount();

    window.dispatchEvent(
      new CustomEvent('allatmento_sync_finished', {
        detail: {
          syncedCount,
          remainingCount,
          errors,
        },
      })
    );
  }

  const finalRemaining = await getOfflineReportsCount();
  return {
    syncedCount,
    failedCount: errors.length,
    remainingCount: finalRemaining,
    errors,
  };
}

/**
 * Automatikus szinkronizáció inicializálása (egyszer fut le a kliensen)
 */
export function initAutoSync(): () => void {
  if (typeof window === 'undefined' || autoSyncInitialized) {
    return () => {};
  }

  autoSyncInitialized = true;

  const handleOnline = () => {
    // Kis késleltetés a hálózati kapcsolat stabilizálódásához
    setTimeout(() => {
      getOfflineReportsCount().then((count) => {
        if (count > 0) {
          syncOfflineReports().catch((e) => console.error('[AutoSync] Hiba:', e));
        }
      });
    }, 1500);
  };

  const handleSwMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
      handleOnline();
    }
  };

  window.addEventListener('online', handleOnline);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleSwMessage);
  }

  // Időszakos ellenőrzés (ha van net és van várakozó elem)
  const intervalId = setInterval(() => {
    if (navigator.onLine && !isSyncing) {
      getOfflineReportsCount().then((count) => {
        if (count > 0) {
          syncOfflineReports().catch(() => {});
        }
      });
    }
  }, 45000);

  // Induláskor is ellenőrizzük
  if (navigator.onLine) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
    clearInterval(intervalId);
    autoSyncInitialized = false;
  };
}
