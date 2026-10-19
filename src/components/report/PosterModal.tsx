'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Scissors, 
  Check, 
  Loader2, 
  ExternalLink,
  Sparkles,
  Info,
  ImageIcon
} from 'lucide-react';
import { Report } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getReportDisplayAddress } from '@/lib/privacy';

export interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report | null;
  // Opcionális közvetlen adatok, ha a bejelentés beküldése után még nincs teljes Report objektum
  initialData?: {
    id: string;
    fajta: string;
    leiras?: string;
    cim?: string;
    megye?: string;
    telefon?: string;
    fotoUrl?: string;
    createdAt?: string;
    statusz?: string;
  };
}

export const PosterModal: React.FC<PosterModalProps> = ({
  isOpen,
  onClose,
  report,
  initialData,
}) => {
  const { t, lang } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);

  // Állapotok
  const [posterType, setPosterType] = useState<'lost' | 'found'>('lost');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customReward, setCustomReward] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Normalizált bejelentési adatok
  const activeReport = React.useMemo(() => {
    if (report) return report;
    if (initialData) {
      return {
        id: initialData.id,
        fajta: initialData.fajta || 'Ismeretlen állat',
        leiras: initialData.leiras || '',
        cim: initialData.cim || '',
        megye: initialData.megye || '',
        telefon: initialData.telefon || '',
        fotoUrl: initialData.fotoUrl,
        createdAt: initialData.createdAt || new Date().toISOString(),
        statusz: (initialData.statusz as any) || 'uj',
      } as Report;
    }
    return null;
  }, [report, initialData]);

  // Alapértelmezett típus és telefonszám beállítása a bejelentés adatai alapján
  useEffect(() => {
    if (activeReport) {
      const isFound = (activeReport.statusz === 'uj' && (activeReport.leiras || '').toLowerCase().includes('talált')) ||
                      (activeReport.fajta || '').toLowerCase().includes('talált');
      setPosterType(isFound ? 'found' : 'lost');
      setCustomPhone(activeReport.telefon || activeReport.bejelentoTelefon || '');
    }
  }, [activeReport]);

  // QR kód generálása a bejelentés online adatlapjára
  const onlineReportUrl = React.useMemo(() => {
    if (!activeReport?.id) return '';
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const basePath = process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : '';
      return `${origin}${basePath}/terkep?reportId=${encodeURIComponent(activeReport.id)}`;
    }
    return `https://allatmento-web.vercel.app/terkep?reportId=${encodeURIComponent(activeReport.id)}`;
  }, [activeReport?.id]);

  useEffect(() => {
    if (!onlineReportUrl) return;
    QRCode.toDataURL(onlineReportUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Hiba a QR-kód generálásakor:', err));
  }, [onlineReportUrl]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-modal-open');
      return () => {
        document.body.classList.remove('has-modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen || !activeReport) return null;

  const displayAddress = getReportDisplayAddress(activeReport, true) || activeReport.cim || activeReport.megye || 'Magyarország';
  const animalImage = activeReport.fotoUrl || activeReport.kepUrl;
  const effectivePhone = customPhone.trim() || activeReport.telefon || activeReport.bejelentoTelefon || '';
  const dateString = activeReport.createdAt 
    ? new Date(activeReport.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  // 1. Nyomtatás A4-ben (Böngésző natív nyomtatási dialógus)
  const handlePrint = () => {
    window.print();
  };

  // 2. Letöltés Képként (PNG)
  const handleDownloadImage = async () => {
    if (!posterRef.current) return;
    setIsGenerating(true);
    setDownloadError(null);
    setDownloadSuccess(null);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `eltunt-allat-plakat-${activeReport.id || 'bejelentes'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(t.posterSuccessDownload);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      console.error('Hiba a kép letöltésekor:', err);
      setDownloadError(t.posterErrorDownload);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Letöltés PDF-ként (A4 méretű dokumentum)
  const handleDownloadPdf = async () => {
    if (!posterRef.current) return;
    setIsGenerating(true);
    setDownloadError(null);
    setDownloadSuccess(null);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`eltunt-allat-plakat-${activeReport.id || 'bejelentes'}.pdf`);

      setDownloadSuccess(t.posterSuccessDownload);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      console.error('Hiba a PDF letöltésekor:', err);
      setDownloadError(t.posterErrorDownload);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] modal-glass-backdrop flex items-center justify-center p-2 sm:p-4 pt-safe pb-safe pl-safe pr-safe overflow-y-auto poster-modal-backdrop animate-backdropFade"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-modalCard"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Fejléc és Vezérlők (nyomtatáskor rejtve) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 no-print">
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t.posterModalTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.posterModalSubtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tartalom: Testreszabás & Előnézet */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 scrollbar-thin">
          
          {/* Testreszabó Eszköztár (no-print) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 no-print">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              
              {/* Plakát típusa (Eltűnt vs Talált) */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPosterType('lost')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    posterType === 'lost'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🚨 {t.posterTypeLost}
                </button>
                <button
                  type="button"
                  onClick={() => setPosterType('found')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    posterType === 'found'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🐾 {t.posterTypeFound}
                </button>
              </div>

              {/* Műveleti gombok (Nyomtatás, PDF, Kép) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.posterPrintBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{t.posterDownloadPdfBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.posterDownloadImageBtn}</span>
                  <span className="sm:hidden">PNG</span>
                </button>
              </div>

            </div>

            {/* Testreszabható mezők: Telefonszám & Jutalom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder={t.posterCustomPhonePlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customReward}
                  onChange={(e) => setCustomReward(e.target.value)}
                  placeholder={t.posterCustomRewardPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Visszajelzések */}
            {downloadSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}
            {downloadError && (
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* NYOMTATHATÓ ÉS MENTHETŐ A4 PLAKÁT FELÜLET                 */}
          {/* ======================================================== */}
          <div className="flex justify-center p-0 sm:p-2 bg-slate-200/50 dark:bg-slate-950/60 rounded-2xl overflow-x-auto">
            <div 
              ref={posterRef}
              id="printable-poster"
              style={{
                fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: '#000000',
                backgroundColor: '#ffffff',
              }}
              className="w-full max-w-[620px] bg-white border-2 border-slate-900 p-5 sm:p-6 flex flex-col justify-between shadow-xl rounded-none text-black select-text"
            >
              {/* 1. FEJLÉC BANNER */}
              <div 
                style={{
                  backgroundColor: posterType === 'lost' ? '#dc2626' : '#1d4ed8',
                  color: '#ffffff',
                }}
                className="py-3 px-4 rounded-xl text-center shadow-xs mb-3"
              >
                <h1 
                  style={{ fontWeight: 900 }}
                  className="poster-black text-2xl sm:text-3xl tracking-tight uppercase leading-tight text-white mb-0.5"
                >
                  {posterType === 'lost' ? t.posterHeadlineLost : t.posterHeadlineFound}
                </h1>
                <p 
                  style={{ fontWeight: 700 }}
                  className="poster-semibold text-xs sm:text-sm text-white/95 uppercase tracking-wider"
                >
                  {t.posterHeadlineHelp}
                </p>
              </div>

              {/* Opcionális Jutalom Kiemelés */}
              {customReward.trim() && (
                <div 
                  style={{ backgroundColor: '#fef08a', borderColor: '#eab308', color: '#854d0e', fontWeight: 900 }}
                  className="poster-black py-1.5 px-3 rounded-lg border-2 text-center text-xs sm:text-sm uppercase tracking-wider mb-3 shadow-2xs"
                >
                  ⭐ {t.posterRewardBadge} {customReward.trim()} ⭐
                </div>
              )}

              {/* 2. ÁLLAT KÉPE */}
              <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-100 flex items-center justify-center mb-3.5 relative">
                {animalImage ? (
                  <img
                    src={animalImage}
                    alt={activeReport.fajta}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                    <ImageIcon className="w-12 h-12 text-slate-400" />
                    <span style={{ fontWeight: 700 }} className="poster-semibold text-sm text-slate-600">
                      {activeReport.fajta}
                    </span>
                    <span className="text-xs text-slate-400">({t.noPhoto})</span>
                  </div>
                )}
                
                {/* Fajta címke a képen */}
                <div 
                  style={{ fontWeight: 900 }}
                  className="poster-black absolute bottom-2 left-2 bg-black/85 text-white text-xs sm:text-sm px-3 py-1 rounded-lg uppercase tracking-wide backdrop-blur-xs"
                >
                  {activeReport.fajta}
                </div>
              </div>

              {/* 3. FŐ ADATOK RÁCSBAN */}
              <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs sm:text-sm">
                
                {/* Helyszín */}
                <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span style={{ fontWeight: 700 }} className="poster-semibold block text-[11px] uppercase text-slate-600">
                      {t.posterLocationLabel}
                    </span>
                    <span style={{ fontWeight: 800 }} className="poster-bold block text-slate-900 leading-snug break-words">
                      {displayAddress}
                    </span>
                  </div>
                </div>

                {/* Dátum */}
                <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span style={{ fontWeight: 700 }} className="poster-semibold block text-[11px] uppercase text-slate-600">
                      {t.posterDateLabel}
                    </span>
                    <span style={{ fontWeight: 800 }} className="poster-bold block text-slate-900 leading-snug">
                      {dateString}
                    </span>
                  </div>
                </div>

              </div>

              {/* 4. LEÍRÁS ÉS KÜLÖNÖS ISMERTETŐJEGYEK */}
              {activeReport.leiras && (
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 mb-3 text-xs sm:text-sm">
                  <span style={{ fontWeight: 800 }} className="poster-bold block text-[11px] uppercase text-slate-700 mb-1">
                    {t.posterDescLabel}
                  </span>
                  <p className="text-slate-900 leading-relaxed font-normal whitespace-pre-wrap line-clamp-4">
                    {activeReport.leiras}
                  </p>
                </div>
              )}

              {/* 5. KIEMELT SÜRGŐSSÉGI TELEFONOS MEZŐ */}
              <div 
                style={{
                  backgroundColor: '#fef3c7',
                  borderColor: '#d97706',
                }}
                className="p-3.5 sm:p-4 rounded-xl border-3 text-center mb-3 shadow-2xs"
              >
                <span 
                  style={{ fontWeight: 900, color: '#92400e' }}
                  className="poster-black block text-xs sm:text-sm tracking-wider uppercase mb-1"
                >
                  📢 {t.posterCallPrompt}
                </span>

                {effectivePhone ? (
                  <div 
                    style={{ fontWeight: 900, color: '#000000' }}
                    className="poster-black text-2xl sm:text-3xl tracking-tight flex items-center justify-center gap-2"
                  >
                    <Phone className="w-6 h-6 text-emerald-600 shrink-0 inline" />
                    <span>{effectivePhone}</span>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-700 italic">
                    {t.posterNoPhone}
                  </div>
                )}
              </div>

              {/* 6. QR-KÓD ÉS ONLINE ADATLAP LÁBLÉC */}
              <div className="p-3 rounded-xl border-2 border-slate-300 bg-slate-50 flex items-center gap-3.5 mb-3.5">
                {qrCodeUrl ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1 rounded-lg border border-slate-400 shrink-0 flex items-center justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="Online Adatlap QR" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                    QR Kód
                  </div>
                )}

                <div className="flex-1 min-w-0 text-xs">
                  <div style={{ fontWeight: 800 }} className="poster-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] sm:text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{t.posterScanQrPrompt}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-tight my-1 truncate">
                    {onlineReportUrl}
                  </p>
                  <div className="text-[10px] text-slate-500 font-semibold tracking-wide">
                    🐾 Állatmentő Portál • Országos Vészhelyzeti Rendszer
                  </div>
                </div>
              </div>

              {/* 7. LETÉPHETŐ FÜLEK (TEAR-OFF TABS) */}
              <div className="border-t-2 border-dashed border-slate-900 pt-2">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-600 mb-2">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{t.posterTearOffNotice}</span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="border-r border-dashed border-slate-400 last:border-r-0 px-1 py-1 flex flex-col items-center justify-between text-center min-h-[75px]"
                    >
                      <span style={{ fontWeight: 800 }} className="poster-bold text-[9px] uppercase text-red-600 leading-tight block">
                        {posterType === 'lost' ? 'ELTŰNT' : 'TALÁLT'}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-700 block truncate max-w-full">
                        {activeReport.fajta}
                      </span>
                      <span style={{ fontWeight: 900 }} className="poster-black text-[9px] text-black tracking-tighter leading-tight block break-all my-0.5">
                        {effectivePhone || 'Adatlap'}
                      </span>
                      <span className="text-[7px] text-slate-400 block">
                        ✂️ tépd le
                      </span>
                    </div>
                  ))}
                  {[...Array(2)].map((_, i) => (
                    <div 
                      key={`extra-${i}`}
                      className="hidden sm:flex border-r border-dashed border-slate-400 last:border-r-0 px-1 py-1 flex-col items-center justify-between text-center min-h-[75px]"
                    >
                      <span style={{ fontWeight: 800 }} className="poster-bold text-[9px] uppercase text-red-600 leading-tight block">
                        {posterType === 'lost' ? 'ELTŰNT' : 'TALÁLT'}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-700 block truncate max-w-full">
                        {activeReport.fajta}
                      </span>
                      <span style={{ fontWeight: 900 }} className="poster-black text-[9px] text-black tracking-tighter leading-tight block break-all my-0.5">
                        {effectivePhone || 'Adatlap'}
                      </span>
                      <span className="text-[7px] text-slate-400 block">
                        ✂️ tépd le
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
