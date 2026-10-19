'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Box, 
  ArrowRight,
  ShieldCheck,
  User,
  Building2,
  Check,
  MessageSquare
} from 'lucide-react';
import { TransportJob, TransportStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { addTransportMessage, updateTransportStatus } from '@/lib/transportApi';

interface TransportDetailsModalProps {
  job: TransportJob | null;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated?: (updatedJob: TransportJob) => void;
}

export const TransportDetailsModal: React.FC<TransportDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdated,
}) => {
  const { t, lang } = useLanguage();
  const { firebaseUser, isRescuer } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentJob, setCurrentJob] = useState<TransportJob | null>(job);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentJob(job);
  }, [job]);

  // Modal nyitva tartásakor a fejléc elrejtése és háttérgörgetés tiltása
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-modal-open');
      return () => {
        document.body.style.overflow = orig;
        document.body.classList.remove('has-modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen || !currentJob || !mounted) return null;

  const isDriver = Boolean(
    firebaseUser && currentJob.driverId === firebaseUser.uid
  );

  const handleTakeJob = async () => {
    const driverName = firebaseUser?.displayName || (isRescuer ? 'Hitelesített Mentő' : 'Önkéntes Fuvarozó');
    const driverId = firebaseUser?.uid || `guest-${Date.now()}`;
    const driverPhone = firebaseUser?.phoneNumber || '';

    await updateTransportStatus(currentJob.id, 'elvallalva', {
      driverId,
      driverName,
      driverPhone
    });

    const updated = {
      ...currentJob,
      statusz: 'elvallalva' as TransportStatus,
      driverId,
      driverName,
      driverPhone,
      elvallalvaAt: new Date().toISOString()
    };
    setCurrentJob(updated);
    if (onJobUpdated) onJobUpdated(updated);
  };

  const handleStatusChange = async (nextStatus: TransportStatus) => {
    await updateTransportStatus(currentJob.id, nextStatus);
    const updated = {
      ...currentJob,
      statusz: nextStatus,
      updatedAt: new Date().toISOString()
    };
    setCurrentJob(updated);
    if (onJobUpdated) onJobUpdated(updated);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || isSending) return;

    setIsSending(true);
    const senderName = firebaseUser?.displayName || (isDriver ? 'Vállaló Sofőr' : 'Érdeklődő');
    const senderId = firebaseUser?.uid || 'guest-user';

    try {
      await addTransportMessage(currentJob.id, {
        senderId,
        senderName,
        text: newMsgText.trim(),
        isDriver
      });

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId,
        senderName,
        text: newMsgText.trim(),
        createdAt: new Date().toISOString(),
        isDriver
      };

      const updated = {
        ...currentJob,
        messages: [...(currentJob.messages || []), newMsg]
      };
      setCurrentJob(updated);
      setNewMsgText('');
      if (onJobUpdated) onJobUpdated(updated);
    } catch (err) {
      console.error('Failed to send transport message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe pl-safe pr-safe modal-glass-backdrop animate-backdropFade"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-modalCard text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fejléc sáv jobb felső bezárás gombbal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                {currentJob.honnanVaros} ➔ {currentJob.hovaVaros}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentJob.tavolsagKm ? `~${currentJob.tavolsagKm} km távolság · ` : ''}{currentJob.datum}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title={lang === 'en' ? 'Close' : 'Bezárás'}
            aria-label={lang === 'en' ? 'Close' : 'Bezárás'}
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Görgethető tartalom */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
          
          {/* 1. Státusz & Terepi Akciósáv */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {lang === 'en' ? 'Current status:' : 'Jelenlegi állapot:'}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                  {currentJob.statusz === 'nyitott' ? (lang === 'en' ? 'Open ride request' : 'Nyitott fuvarozási igény') :
                   currentJob.statusz === 'elvallalva' ? (lang === 'en' ? 'Accepted (Driver assigned)' : 'Elvállalva (Sofőr kijelölve)') :
                   currentJob.statusz === 'folyamatban' ? (lang === 'en' ? 'In transit / En route' : 'Folyamatban / Úton van') : (lang === 'en' ? 'Completed' : 'Teljesítve')}
                </span>
              </div>

              {currentJob.urgency !== 'normal' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {currentJob.urgency === 'fix_idopont' 
                    ? (lang === 'en' ? 'Fixed time' : 'Fix időpont') 
                    : (lang === 'en' ? 'Urgent' : 'Sürgős')}
                </span>
              )}
            </div>

            {/* 1-kattintásos terepi akciógombok (min. 48px magas!) */}
            <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
              {currentJob.statusz === 'nyitott' && (
                <button
                  type="button"
                  onClick={handleTakeJob}
                  className="w-full min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'en' ? 'Accept ride now' : 'Fuvar elvállalása most'}</span>
                </button>
              )}

              {currentJob.statusz === 'elvallalva' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('folyamatban')}
                    className="flex-1 min-h-[48px] px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Started transit (En route)' : 'Útnak indultam (Folyamatban)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('nyitott')}
                    className="min-h-[48px] px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {lang === 'en' ? 'Withdraw' : 'Visszalépés'}
                  </button>
                </>
              )}

              {currentJob.statusz === 'folyamatban' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('teljesitve')}
                  className="w-full min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Arrived / Ride complete' : 'Megérkeztem / Fuvar teljesítve'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Útvonal és Részletek */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Honnan */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                {lang === 'en' ? 'Departure (From)' : 'Indulási pont (Honnan)'}
              </span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {currentJob.honnanVaros} ({currentJob.honnanMegye})
              </p>
              {currentJob.honnanCim && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  📍 {currentJob.honnanCim}
                </p>
              )}
            </div>

            {/* Hova */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                {lang === 'en' ? 'Destination (To)' : 'Célállomás (Hova)'}
              </span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {currentJob.hovaVaros} ({currentJob.hovaMegye})
              </p>
              {currentJob.hovaCim && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  🎯 {currentJob.hovaCim}
                </p>
              )}
            </div>
          </div>

          {/* 3. Szállítmány & Követelmények */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Cargo Details' : 'Szállítmány adatai'}
            </h4>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                {currentJob.allatNev || currentJob.allatFajta || (lang === 'en' ? 'Cargo' : 'Szállítmány')}
              </span>
              {currentJob.crateRequirement === 'box_szukseges' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {lang === 'en' ? '⚠️ Carrier required' : '⚠️ Szállítóbox szükséges'}
                </span>
              )}
              {currentJob.crateRequirement === 'sajat_box_van' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {lang === 'en' ? '✓ Carrier provided' : '✓ Box biztosított'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentJob.leiras}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
              <div>
                📅 <strong>{lang === 'en' ? 'Date:' : 'Dátum:'}</strong> {currentJob.datum} {currentJob.idosav ? `(${currentJob.idosav})` : ''}
              </div>
              <div>
                📏 <strong>{lang === 'en' ? 'Size:' : 'Méret:'}</strong> {currentJob.cargoSize}
              </div>
            </div>
          </div>

          {/* 4. Kapcsolattartás (Közvetlen Hívás Gomb) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Contacts' : 'Kapcsolattartók'}
            </h4>

            {/* Feladó adatai */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                    {lang === 'en' ? 'Sender / Shelter:' : 'Feladó / Menhely:'}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {currentJob.feladoNev}
                  </span>
                  {currentJob.feladoSzervezet && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {currentJob.feladoSzervezet}
                    </span>
                  )}
                </div>
              </div>

              {currentJob.feladoTelefon && (
                <a
                  href={`tel:${currentJob.feladoTelefon.replace(/\s+/g, '')}`}
                  className="min-h-[48px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  aria-label={lang === 'en' ? 'Call sender' : 'Feladó hívása'}
                >
                  <Phone className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Call now' : 'Hívás most'} ({currentJob.feladoTelefon})</span>
                </a>
              )}
            </div>

            {/* Sofőr adatai ha van */}
            {currentJob.driverName && (
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    🚗
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                      {lang === 'en' ? 'Volunteer Driver:' : 'Vállaló Sofőr:'}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {currentJob.driverName}
                    </span>
                  </div>
                </div>

                {currentJob.driverPhone && (
                  <a
                    href={`tel:${currentJob.driverPhone.replace(/\s+/g, '')}`}
                    className="min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    aria-label={lang === 'en' ? 'Call driver' : 'Sofőr hívása'}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Call driver' : 'Sofőr hívása'}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 5. Belső Koordinációs Chat / Üzenőfal */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {lang === 'en' ? 'Coordination Messages' : 'Belső koordinációs üzenetek'} ({currentJob.messages?.length || 0})
              </h4>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3 max-h-56 overflow-y-auto">
              {currentJob.messages && currentJob.messages.length > 0 ? (
                currentJob.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      m.isDriver
                        ? 'bg-blue-100/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 ml-3'
                        : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200 mr-3'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>{m.senderName} {m.isDriver ? (lang === 'en' ? '(Driver)' : '(Sofőr)') : ''}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  {lang === 'en' ? 'No messages yet. Send a message below to coordinate!' : 'Még nem érkezett koordinációs üzenet. Írj az alábbi mezőbe az egyeztetéshez!'}
                </div>
              )}
            </div>

            {/* Üzenetküldő sáv */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. When can I pick up the dog? What time should I arrive?' : 'Pl. Mikor vehetem fel a kutyust? Hány órára érkezzek?'}
                className="flex-1 min-h-[48px] px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMsgText.trim() || isSending}
                className="min-h-[48px] min-w-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                title={lang === 'en' ? 'Send message' : 'Üzenet küldése'}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Send' : 'Küldés'}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
