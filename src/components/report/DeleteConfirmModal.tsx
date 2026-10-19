'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Report } from '@/types';
import { deleteReport } from '@/lib/api';
import { getDeleteToken, removeDeleteToken } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface DeleteConfirmModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  report,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { idToken, isAdmin, anonymousUid } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-modal-open');
      return () => {
        document.body.classList.remove('has-modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getDeleteToken(report.id) || (report as any).deleteToken;
      await deleteReport(report.id, {
        deleteToken: token || undefined,
        idToken: idToken || undefined,
        anonymousUid: anonymousUid || undefined,
      });

      removeDeleteToken(report.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t.deleteFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe modal-glass-backdrop animate-backdropFade"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative text-center animate-modalCard"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          {t.deleteConfirmTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          {report.fajta} – {report.cim || report.megye}
          <br />
          {t.deleteConfirmDesc}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? t.processing : t.btnConfirmDelete}
          </button>
        </div>
      </div>
    </div>
  );
};
