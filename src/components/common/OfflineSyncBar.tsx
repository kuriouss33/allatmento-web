'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, ShieldAlert, Sparkles } from 'lucide-react';
import { useOfflineSync } from '@/context/OfflineSyncContext';
import { useLanguage } from '@/context/LanguageContext';

export const OfflineSyncBar: React.FC = () => {
  const { t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, lastSyncResult, syncNow } = useOfflineSync();
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (lastSyncResult && lastSyncResult.syncedCount > 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncResult]);

  // Ha online van, nincs várakozó bejelentés és nincs friss siker, ne foglaljon helyet
  if (isOnline && pendingCount === 0 && !showSuccess) {
    return null;
  }

  return (
    <aside aria-label="Offline hálózati állapot" className="w-full bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2 z-[90] transition-all animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        {/* Bal oldal: Státusz ikon és szöveg */}
        <div className="flex items-center gap-2 min-w-0">
          {!isOnline ? (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-amber-300">
                {t.offlineBannerTitle}
              </span>
              <span className="hidden sm:inline text-slate-300 text-[11px] truncate">
                • {t.offlineBannerDesc}
              </span>
            </div>
          ) : showSuccess ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                {t.offlineSyncSuccess}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-300">
              <CloudUpload className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-semibold">
                {pendingCount} {t.offlinePendingBadge}
              </span>
            </div>
          )}
        </div>

        {/* Jobb oldal: Szinkronizálás gomb (ha van várakozó elem) */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
              {pendingCount}
            </span>
            <button
              type="button"
              onClick={() => syncNow()}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t.offlineSyncing : t.offlineSyncNowBtn}</span>
            </button>
          </div>
        )}

      </div>
    </aside>
  );
};
