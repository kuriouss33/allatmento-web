'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Upload, AlertCircle, ArrowRight } from 'lucide-react';
import { Report } from '@/types';
import { updateReportStatus, uploadImage } from '@/lib/api';
import { compressImage } from '@/lib/image';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ResolveModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  report,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { idToken } = useAuth();

  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !idToken) {
      setError(t.resolveDesc);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let photoUrl: string | undefined = undefined;

      if (photoFile) {
        try {
          const compressedBlob = await compressImage(photoFile);
          photoUrl = await uploadImage(compressedBlob, photoFile.name || 'resolve-photo.jpg');
        } catch {
          photoUrl = await uploadImage(photoFile, photoFile.name || 'resolve-photo.jpg');
        }
      }

      await updateReportStatus(report.id, 'megoldva', idToken, {
        megoldasLeiras: notes.trim(),
        megoldasFotoUrl: photoUrl,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nem sikerült lezárni a bejelentést.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
              {t.resolveTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {report.fajta} – {report.cim || report.megye}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.resolveDesc} *
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.resolveNotesPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.resolvePhotoLabel}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>{photoFile ? photoFile.name : 'Zárófotó kiválasztása'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                  <img src={photoPreview} alt="Előnézet" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !notes.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{loading ? t.processing : t.resolveSubmit}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
