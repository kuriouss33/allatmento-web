'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getOfflineReportsCount } from '@/lib/offlineQueue';
import { syncOfflineReports, initAutoSync, SyncResult } from '@/lib/syncEngine';

interface OfflineSyncContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: { syncedCount: number; timestamp: number } | null;
  syncNow: () => Promise<SyncResult>;
  refreshPendingCount: () => Promise<number>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType>({
  isOnline: true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncResult: null,
  syncNow: async () => ({ syncedCount: 0, failedCount: 0, remainingCount: 0, errors: [] }),
  refreshPendingCount: async () => 0,
});

export const useOfflineSync = () => useContext(OfflineSyncContext);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ syncedCount: number; timestamp: number } | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getOfflineReportsCount();
      setPendingCount(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncOfflineReports();
      await refreshPendingCount();
      if (result.syncedCount > 0) {
        setLastSyncResult({
          syncedCount: result.syncedCount,
          timestamp: Date.now(),
        });
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Kezdeti állapot
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    // Hálózati státusz események
    const handleOnline = () => {
      setIsOnline(true);
      refreshPendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Queue és Sync események
    const handleQueueChanged = (e: any) => {
      const count = e?.detail?.count;
      if (typeof count === 'number') {
        setPendingCount(count);
      } else {
        refreshPendingCount();
      }
    };

    const handleSyncStarted = () => {
      setIsSyncing(true);
    };

    const handleSyncFinished = (e: any) => {
      setIsSyncing(false);
      refreshPendingCount();
      const synced = e?.detail?.syncedCount;
      if (synced && synced > 0) {
        setLastSyncResult({
          syncedCount: synced,
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener('allatmento_offline_queue_changed', handleQueueChanged);
    window.addEventListener('allatmento_sync_started', handleSyncStarted);
    window.addEventListener('allatmento_sync_finished', handleSyncFinished);

    // Automatikus háttér szinkronizáció bekapcsolása
    const cleanupAutoSync = initAutoSync();

    // Service Worker regisztráció
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Ha támogatott a Background Sync API
          if ('sync' in reg) {
            (reg as any).sync.register('sync-reports').catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker regisztrációs hiba:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('allatmento_offline_queue_changed', handleQueueChanged);
      window.removeEventListener('allatmento_sync_started', handleSyncStarted);
      window.removeEventListener('allatmento_sync_finished', handleSyncFinished);
      cleanupAutoSync();
    };
  }, [refreshPendingCount]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        lastSyncResult,
        syncNow,
        refreshPendingCount,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};
