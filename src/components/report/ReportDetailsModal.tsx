'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addComment, normalizeReport } from '@/lib/api';
import { Report, ReportComment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getDeleteToken } from '@/lib/storage';
import { canUserSeeExactReport, getReportDisplayLocation, getReportDisplayAddress } from '@/lib/privacy';
import { 
  X, 
  Send, 
  Lock, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  HeartHandshake, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react';

interface ReportDetailsModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
  onTakeCase?: (report: Report) => void;
  onCancelTake?: (report: Report) => void;
  onResolve?: (report: Report) => void;
  onOpenHelp?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  onImageClick?: (url: string) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenAuth,
  onTakeCase,
  onCancelTake,
  onResolve,
  onOpenHelp,
  onDelete,
  onImageClick,
}) => {
  const { t } = useLanguage();
  const { firebaseUser, idToken, isRescuer, isAdmin, anonymousUid } = useAuth();
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [liveReport, setLiveReport] = useState<Report | null>(report ? normalizeReport(report) : null);

  useEffect(() => {
    setLiveReport(report ? normalizeReport(report) : null);
    if (report) {
      setComments(report.kommentek || []);
    }
    if (!report || !isOpen || !isRescuer || !db) return;

    // Real-time Firestore figyelő a bejelentésre és kommentjeire
    const unsubscribe = onSnapshot(
      doc(db, 'bejelentesek', report.id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLiveReport(normalizeReport({ id: snap.id, ...data }));
          setComments(data.kommentek || []);
        }
      },
      () => {
        // Csendes fallback
      }
    );

    return () => unsubscribe();
  }, [report, isOpen, isRescuer]);

  if (!isOpen || !liveReport) return null;

  const isTakenByMe = Boolean(
    liveReport.statusz === 'folyamatban' &&
    firebaseUser &&
    liveReport.rescuerId === firebaseUser.uid
  );

  const isTakenByOther = Boolean(
    liveReport.statusz === 'folyamatban' &&
    liveReport.rescuerId &&
    (!firebaseUser || liveReport.rescuerId !== firebaseUser.uid)
  );

  const localDeleteToken = getDeleteToken(liveReport.id);
  const canDelete = Boolean(
    isAdmin ||
    localDeleteToken ||
    (firebaseUser && liveReport.createrId === firebaseUser.uid) ||
    (anonymousUid && liveReport.createrId === anonymousUid)
  );

  const canSeeExact = canUserSeeExactReport(liveReport, {
    isRescuer,
    isAdmin,
    isRegistered: Boolean(firebaseUser),
    currentUserId: firebaseUser?.uid,
  });

  const displayLocation = getReportDisplayLocation(liveReport, canSeeExact);
  const displayAddress = getReportDisplayAddress(liveReport, canSeeExact);

  const navUrl = displayLocation.lat && displayLocation.lon
    ? `https://www.google.com/maps/dir/?api=1&destination=${displayLocation.lat},${displayLocation.lon}`
    : null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;
    const token = idToken ?? anonymousUid;
    setSending(true);
    try {
      await addComment(liveReport.id, newComment.trim(), token);
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Nem sikerült elküldeni az üzenetet.');
    } finally {
      setSending(false);
    }
  };

  const statusBadge = () => {
    switch (liveReport.statusz) {
      case 'uj':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-light bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{t.statusNew}</span>
          </span>
        );
      case 'folyamatban':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-light bg-amber-500/10 text-amber-600 border border-amber-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.statusInProg}</span>
          </span>
        );
      case 'megoldva':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-light bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
            <Check className="w-3.5 h-3.5" />
            <span>{t.statusSolved}</span>
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="font-light text-lg sm:text-xl text-slate-900 dark:text-white">
              {liveReport.fajta}
            </span>

            {liveReport.megye && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-light border border-slate-200/60 dark:border-slate-700/60">
                {liveReport.megye} megye
              </span>
            )}

            {statusBadge()}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scrollbar-thin">
          
          {/* Uploaded Photo */}
          {(liveReport.fotoUrl || liveReport.kepUrl) && (
            <div 
              onClick={() => {
                if (onImageClick) {
                  onImageClick((liveReport.fotoUrl || liveReport.kepUrl)!);
                }
              }}
              className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group/img cursor-pointer"
            >
              <img 
                src={liveReport.fotoUrl || liveReport.kepUrl} 
                alt={liveReport.fajta} 
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-light backdrop-blur-[2px]">
                Nagyítás teljes méretben 🔍
              </div>
            </div>
          )}

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 font-light text-xs sm:text-sm">
            
            {/* Location & Navigation */}
            <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-light text-slate-900 dark:text-white">
                    {displayAddress}
                  </span>
                  {!canSeeExact ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-light">
                      ~100m védett körzet
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-light">
                      🎯 Pontos cím (Mentő hozzáférés)
                    </span>
                  )}
                </div>

                {navUrl && (
                  <div>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                    >
                      <span>{canSeeExact ? t.openNav : 'Útvonal a körzethez'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {!canSeeExact && (
                  <p className="text-[11px] text-slate-400 leading-snug pt-0.5">
                    🛡️ Az állatok védelmében a pontos házszám csak regisztrált mentők számára látható.
                  </p>
                )}
              </div>
            </div>

            {/* Phone contact */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              {canSeeExact && liveReport.telefon ? (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-500">Telefonszám:</span>
                    <a href={`tel:${liveReport.telefon}`} className="font-light text-emerald-600 dark:text-emerald-400 hover:underline">
                      {liveReport.telefon}
                    </a>
                  </div>
                  <a
                    href={`tel:${liveReport.telefon}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-light shadow-xs transition-all"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Hívás most</span>
                  </a>
                </div>
              ) : (liveReport.telefon || liveReport.hasPhone) ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Telefonszám: <em className="text-slate-400">Csak hitelesített mentőknek</em></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Telefonszám nincs megadva</span>
                </div>
              )}
            </div>

            {/* Description / Notes */}
            {liveReport.leiras && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-xs text-slate-400">Bejelentő leírása:</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {liveReport.leiras}
                </p>
              </div>
            )}

            {/* Timestamp */}
            {liveReport.createdAt && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Bejelentve: {new Date(liveReport.createdAt).toLocaleString('hu-HU')}</span>
              </div>
            )}
          </div>

          {/* Solution info if resolved */}
          {liveReport.statusz === 'megoldva' && (liveReport.megoldasLeiras || liveReport.lezarasMegjegyzes) && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 space-y-2 font-light">
              <span className="font-light text-emerald-900 dark:text-emerald-100 block">Mentés eredménye / lezárás:</span>
              <p>{liveReport.megoldasLeiras || liveReport.lezarasMegjegyzes}</p>
              {(liveReport.megoldasFotoUrl || liveReport.lezarasFotoUrl) && (
                <div 
                  onClick={() => {
                    if (onImageClick) {
                      onImageClick((liveReport.megoldasFotoUrl || liveReport.lezarasFotoUrl)!);
                    }
                  }}
                  className="w-44 h-32 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 mt-2 cursor-pointer"
                >
                  <img 
                    src={liveReport.megoldasFotoUrl || liveReport.lezarasFotoUrl} 
                    alt="Zárófotó" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Rescuer / Volunteer Action Buttons Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-light text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Műveletek & Koordináció
            </h4>

            {/* Take Case (If New & Rescuer) */}
            {liveReport.statusz === 'uj' && isRescuer && onTakeCase && (
              <button
                onClick={() => onTakeCase(liveReport)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-light text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm shadow-amber-500/20 active:scale-[0.98] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.btnTake}</span>
              </button>
            )}

            {/* If Taken By Me: Resolve or Cancel */}
            {isTakenByMe && (
              <div className="flex flex-col gap-2">
                {onResolve && (
                  <button
                    onClick={() => onResolve(liveReport)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-light text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98] transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.btnSolved}</span>
                  </button>
                )}
                {onCancelTake && (
                  <button
                    onClick={() => onCancelTake(liveReport)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-light text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t.btnCancelTake}</span>
                  </button>
                )}
              </div>
            )}

            {/* If Taken By Someone Else */}
            {isTakenByOther && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-light text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{t.statusTakenByOther}</span>
              </div>
            )}

            {/* Secondary Actions Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Help Offer (Volunteer) */}
              {liveReport.statusz !== 'megoldva' && onOpenHelp && (
                <button
                  onClick={() => onOpenHelp(liveReport)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-light transition-colors"
                >
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  <span>{t.btnHelpVolunteer}</span>
                </button>
              )}

              {/* Delete action */}
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(liveReport)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-light transition-colors ml-auto"
                  title="Bejelentés törlése"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Törlés</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time Comments Section */}
          <div className="relative pt-2 space-y-3">
            <h4 className="font-light text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>{t.commentsTitle}</span>
              <span className="text-xs text-slate-400 font-light">
                {comments.length} üzenet
              </span>
            </h4>

            {/* Lock Overlay for guests */}
            {!firebaseUser && (
              <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h5 className="font-light text-base mb-1">{t.chatLockedTitle}</h5>
                <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed font-light">
                  {t.chatLockedDesc}
                </p>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-light text-xs shadow-md transition-all"
                  >
                    Mentői Bejelentkezés
                  </button>
                )}
              </div>
            )}

            {/* Comments List */}
            <div className={`space-y-2.5 min-h-[120px] max-h-64 overflow-y-auto p-1 scrollbar-thin ${!firebaseUser ? 'filter blur-sm select-none' : ''}`}>
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 font-light">
                  {t.noCommentsYet}
                </p>
              ) : (
                comments.map((komment, idx) => {
                  const isMe = firebaseUser && komment.szerzoUid === firebaseUser.uid;
                  return (
                    <div
                      key={komment.id || idx}
                      className={`p-3 rounded-2xl border text-xs max-w-[85%] font-light ${
                        isMe
                          ? 'ml-auto bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-100'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 text-[11px]">
                        <span className={isMe ? 'text-blue-600 dark:text-blue-400 font-light' : 'text-slate-600 dark:text-slate-300 font-light'}>
                          {komment.szerep === 'bejelento'
                            ? 'Bejelentő'
                            : komment.szerep === 'mento'
                            ? 'Mentő'
                            : komment.szerep === 'admin'
                            ? 'Admin'
                            : 'Érdeklődő'}
                          {isMe && ' (Én)'}
                        </span>
                        {komment.idopont && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(komment.idopont.seconds ? komment.idopont.seconds * 1000 : komment.idopont).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{komment.szoveg}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input */}
            {firebaseUser && (
              <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-light"
                />
                <button
                  type="submit"
                  disabled={sending || !newComment.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-light text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
