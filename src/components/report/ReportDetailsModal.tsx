'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addComment, normalizeReport } from '@/lib/api';
import { Report, ReportComment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { canUserSeeExactReport, getReportDisplayAddress } from '@/lib/privacy';
import { X, Send, Lock, MapPin, Phone, Clock, ShieldCheck, User } from 'lucide-react';

interface ReportDetailsModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenAuth,
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

    // Real-time Firestore figyelő a bejelentésre és kommentjeire (kizárólag hitelesített mentőknek)
    const unsubscribe = onSnapshot(
      doc(db, 'bejelentesek', report.id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLiveReport(normalizeReport({ id: snap.id, ...data }));
          setComments(data.kommentek || []);
        }
      },
      (err) => {
        // Csendes fallback, nem generálunk hibát a konzolra
      }
    );

    return () => unsubscribe();
  }, [report, isOpen, isRescuer]);

  if (!isOpen || !liveReport) return null;

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">
              {liveReport.fajta}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              liveReport.statusz === 'uj'
                ? 'bg-red-500/10 text-red-600 border-red-500/20'
                : liveReport.statusz === 'folyamatban'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            }`}>
              {liveReport.statusz === 'uj' ? t.statusNew : liveReport.statusz === 'folyamatban' ? t.statusInProg : t.statusSolved}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Photos */}
          {(liveReport.fotoUrl || liveReport.kepUrl) && (
            <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              <img 
                src={liveReport.fotoUrl || liveReport.kepUrl} 
                alt={liveReport.fajta} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {/* Details Box */}
          {(() => {
            const canSeeExact = liveReport ? canUserSeeExactReport(liveReport, {
              isRescuer,
              isAdmin,
              isRegistered: Boolean(firebaseUser),
              currentUserId: firebaseUser?.uid,
            }) : false;

            const displayAddress = liveReport ? getReportDisplayAddress(liveReport, canSeeExact) : '';

            return (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {displayAddress}
                      </span>
                      {!canSeeExact ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          ~100m védett körzet
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          🎯 Pontos cím (Mentő hozzáférés)
                        </span>
                      )}
                    </div>
                    {!canSeeExact && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        🛡️ Az állatok védelmében a pontos házszám és cím csak regisztrált mentők számára látható.
                      </p>
                    )}
                  </div>
                </div>

                {canSeeExact && liveReport.telefon ? (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <a href={`tel:${liveReport.telefon}`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      {liveReport.telefon}
                    </a>
                  </div>
                ) : (liveReport.telefon || liveReport.hasPhone) ? (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Telefonszám: <em className="text-slate-400">Csak hitelesített mentőknek</em></span>
                  </div>
                ) : null}

                {liveReport.leiras && (
                  <p className="text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60 leading-relaxed">
                    {liveReport.leiras}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Solution Info if resolved */}
          {liveReport.statusz === 'megoldva' && (liveReport.megoldasLeiras || liveReport.lezarasMegjegyzes) && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-sm text-emerald-800 dark:text-emerald-200 space-y-2">
              <span className="font-bold block">Megoldás eredménye:</span>
              <p>{liveReport.megoldasLeiras || liveReport.lezarasMegjegyzes}</p>
              {(liveReport.megoldasFotoUrl || liveReport.lezarasFotoUrl) && (
                <div className="w-40 h-28 rounded-lg overflow-hidden border border-emerald-300 mt-2">
                  <img src={liveReport.megoldasFotoUrl || liveReport.lezarasFotoUrl} alt="Zárófotó" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Real-time Comments Section */}
          <div className="relative pt-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>{t.commentsTitle}</span>
              <span className="text-xs font-normal text-slate-500">
                {comments.length} üzenet
              </span>
            </h4>

            {/* Lock Overlay for non-authenticated guests */}
            {!firebaseUser && (
              <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h5 className="font-bold text-base mb-1">{t.chatLockedTitle}</h5>
                <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                  {t.chatLockedDesc}
                </p>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Mentői Bejelentkezés
                  </button>
                )}
              </div>
            )}

            {/* Comments List */}
            <div className={`space-y-3 min-h-[140px] max-h-72 overflow-y-auto p-1 ${!firebaseUser ? 'filter blur-sm select-none' : ''}`}>
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-6">
                  {t.noCommentsYet}
                </p>
              ) : (
                comments.map((komment, idx) => {
                  const isMe = firebaseUser && komment.szerzoUid === firebaseUser.uid;
                  return (
                    <div
                      key={komment.id || idx}
                      className={`p-3 rounded-xl border text-xs max-w-[85%] ${
                        isMe
                          ? 'ml-auto bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-100'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 text-[11px] font-bold">
                        <span className={isMe ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}>
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
                          <span className="text-[10px] font-normal text-slate-400">
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
              <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newComment.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
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
