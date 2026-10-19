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
  AlertCircle, 
  Box, 
  User, 
  Building2, 
  Dog, 
  Cat, 
  Package, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  TransportCargoType, 
  TransportCargoSize, 
  TransportCrateRequirement, 
  TransportUrgency 
} from '@/types';
import { createTransport } from '@/lib/transportApi';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface NewTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newJobId: string) => void;
}

const COMMON_CITIES = [
  'Budapest',
  'Debrecen',
  'Szeged',
  'Miskolc',
  'Pécs',
  'Győr',
  'Székesfehérvár',
  'Kecskemét',
  'Nyíregyháza',
  'Veszprém'
];

export const NewTransportModal: React.FC<NewTransportModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { firebaseUser } = useAuth();
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [honnanVaros, setHonnanVaros] = useState('');
  const [honnanCim, setHonnanCim] = useState('');
  const [hovaVaros, setHovaVaros] = useState('');
  const [hovaCim, setHovaCim] = useState('');

  const [cargoType, setCargoType] = useState<TransportCargoType>('kutya');
  const [cargoSize, setCargoSize] = useState<TransportCargoSize>('kozepes');
  const [allatNev, setAllatNev] = useState('');
  const [allatFajta, setAllatFajta] = useState('');
  const [crateRequirement, setCrateRequirement] = useState<TransportCrateRequirement>('box_szukseges');
  const [leiras, setLeiras] = useState('');

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [datum, setDatum] = useState(tomorrowStr);
  const [idosav, setIdosav] = useState('Délelőtt (09:00 - 12:00)');
  const [urgency, setUrgency] = useState<TransportUrgency>('normal');

  const [feladoNev, setFeladoNev] = useState('');
  const [feladoTelefon, setFeladoTelefon] = useState('+36 ');
  const [feladoSzervezet, setFeladoSzervezet] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefill contact if user is logged in
  useEffect(() => {
    if (firebaseUser) {
      if (firebaseUser.displayName && !feladoNev) {
        setFeladoNev(firebaseUser.displayName);
      }
      if (firebaseUser.phoneNumber && feladoTelefon === '+36 ') {
        setFeladoTelefon(firebaseUser.phoneNumber);
      }
    }
  }, [firebaseUser]);

  // Modal open effects: freeze body scroll and hide header
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-modal-open');
      setErrorMsg(null);

      return () => {
        document.body.style.overflow = orig;
        document.body.classList.remove('has-modal-open');
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!honnanVaros.trim()) {
      setErrorMsg(lang === 'en' ? 'Please enter departure city!' : 'Kérlek add meg az indulási települést!');
      return;
    }
    if (!hovaVaros.trim()) {
      setErrorMsg(lang === 'en' ? 'Please enter destination city!' : 'Kérlek add meg az érkezési települést!');
      return;
    }
    if (!leiras.trim()) {
      setErrorMsg(lang === 'en' ? 'Please provide a short description!' : 'Kérlek adj meg egy rövid leírást a szállításról!');
      return;
    }
    if (!feladoNev.trim()) {
      setErrorMsg(lang === 'en' ? 'Please provide contact person name!' : 'Kérlek add meg a kapcsolattartó nevét!');
      return;
    }
    if (!feladoTelefon.trim() || feladoTelefon.trim().length < 8) {
      setErrorMsg(lang === 'en' ? 'Please provide a valid phone number!' : 'Kérlek adj meg egy érvényes telefonszámot!');
      return;
    }

    try {
      setIsSubmitting(true);
      const newId = await createTransport({
        honnanVaros: honnanVaros.trim(),
        honnanCim: honnanCim.trim() || undefined,
        hovaVaros: hovaVaros.trim(),
        hovaCim: hovaCim.trim() || undefined,
        cargoType,
        cargoSize,
        allatNev: allatNev.trim() || undefined,
        allatFajta: allatFajta.trim() || undefined,
        crateRequirement,
        leiras: leiras.trim(),
        datum,
        idosav: idosav.trim() || undefined,
        urgency,
        feladoNev: feladoNev.trim(),
        feladoTelefon: feladoTelefon.trim(),
        feladoSzervezet: feladoSzervezet.trim() || undefined,
        feladoUserId: firebaseUser?.uid,
      });

      onCreated?.(newId);
      onClose();
    } catch (err: any) {
      console.error('Error creating transport request:', err);
      setErrorMsg(lang === 'en' ? 'Failed to submit transport request.' : 'Nem sikerült elmenteni a fuvarigényt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-colors">
          
          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {lang === 'en' ? 'Request Animal Transport' : 'Új fuvarozási igény feladása'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'Planned transport between shelters, fosters or vets' : 'Tervezett szállítás menhelyek, befogadók és orvosok között'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
              aria-label={lang === 'en' ? 'Close' : 'Bezárás'}
            >
              <X className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. ÚTVONAL SZEKCIÓ */}
            <div className="space-y-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'en' ? 'Route (From -> To)' : 'Útvonal (Honnan -> Hova)'}</span>
              </div>

              {/* Honnan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {lang === 'en' ? 'Departure City *' : 'Indulási település *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'e.g. Debrecen' : 'pl. Debrecen'}
                  value={honnanVaros}
                  onChange={(e) => setHonnanVaros(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                
                {/* Város gyorsválasztó chipek */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_CITIES.slice(0, 6).map((city) => (
                    <button
                      key={`from-${city}`}
                      type="button"
                      onClick={() => setHonnanVaros(city)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                        honnanVaros === city
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-emerald-500/50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Exact address or shelter name (optional)' : 'Pontos cím vagy menhely neve (opcionális)'}
                  value={honnanCim}
                  onChange={(e) => setHonnanCim(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Hova */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {lang === 'en' ? 'Destination City *' : 'Érkezési település *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'e.g. Budapest' : 'pl. Budapest'}
                  value={hovaVaros}
                  onChange={(e) => setHovaVaros(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                
                {/* Város gyorsválasztó chipek */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_CITIES.slice(0, 6).map((city) => (
                    <button
                      key={`to-${city}`}
                      type="button"
                      onClick={() => setHovaVaros(city)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                        hovaVaros === city
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-emerald-500/50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Exact address, vet clinic, or foster home (optional)' : 'Pontos cím, klinika vagy befogadó helyszíne (opcionális)'}
                  value={hovaCim}
                  onChange={(e) => setHovaCim(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* 2. RAKOMÁNY & ÁLLAT ADATOK */}
            <div className="space-y-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'en' ? 'Cargo & Animal Details' : 'Szállítandó állat / rakomány'}
              </div>

              {/* Típus választó gombok (min-h 48px) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'kutya' as const, label: lang === 'en' ? 'Dog' : 'Kutya', icon: Dog },
                  { id: 'macska' as const, label: lang === 'en' ? 'Cat' : 'Macska', icon: Cat },
                  { id: 'egyeb_allat' as const, label: lang === 'en' ? 'Other animal' : 'Egyéb állat', icon: Sparkles },
                  { id: 'adomany_tap' as const, label: lang === 'en' ? 'Donation / Food' : 'Táp / Adomány', icon: Package },
                ].map((type) => {
                  const Icon = type.icon;
                  const active = cargoType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setCargoType(type.id)}
                      className={`min-h-[48px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                        active
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Méret választó gombok */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {lang === 'en' ? 'Size / Quantity' : 'Méret / Mennyiség'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'kicsi' as const, label: lang === 'en' ? 'Small' : 'Kicsi' },
                    { id: 'kozepes' as const, label: lang === 'en' ? 'Medium' : 'Közepes' },
                    { id: 'nagy' as const, label: lang === 'en' ? 'Large' : 'Nagy' },
                    { id: 'tobb_allat' as const, label: lang === 'en' ? 'Multiple' : 'Több állat' },
                    { id: 'csomag' as const, label: lang === 'en' ? 'Parcel' : 'Csomag' },
                  ].map((size) => {
                    const active = cargoSize === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setCargoSize(size.id)}
                        className={`min-h-[44px] px-2 py-1.5 rounded-xl font-semibold text-xs flex items-center justify-center border transition-all ${
                          active
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Állat neve & Fajtája */}
              {cargoType !== 'adomany_tap' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                      {lang === 'en' ? 'Animal name (optional)' : 'Állat neve (opcionális)'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'e.g. Barni' : 'pl. Barni'}
                      value={allatNev}
                      onChange={(e) => setAllatNev(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                      {lang === 'en' ? 'Breed (optional)' : 'Fajta (opcionális)'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'e.g. Mixed breed' : 'pl. Keverék'}
                      value={allatFajta}
                      onChange={(e) => setAllatFajta(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Szállítóbox szükségessége */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {lang === 'en' ? 'Crate / Carrier Requirement' : 'Szállítóbox szükségessége'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'box_szukseges' as const, label: lang === 'en' ? 'Carrier required' : 'Box szükséges' },
                    { id: 'sajat_box_van' as const, label: lang === 'en' ? 'Has own carrier' : 'Saját boxot adunk' },
                    { id: 'nem_szukseges' as const, label: lang === 'en' ? 'Not required' : 'Nem szükséges' },
                  ].map((crate) => {
                    const active = crateRequirement === crate.id;
                    return (
                      <button
                        key={crate.id}
                        type="button"
                        onClick={() => setCrateRequirement(crate.id)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                          active
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <Box className="w-3.5 h-3.5" />
                        <span>{crate.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leírás */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {lang === 'en' ? 'Details & Description *' : 'Részletes leírás *'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={lang === 'en' ? 'Reason for transport, temperament, medical details...' : 'Mi a szállítás célja, viselkedése autóban, szükséges-e segítség a bepakolásnál...'}
                  value={leiras}
                  onChange={(e) => setLeiras(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            {/* 3. DÁTUM & SÜRGŐSSÉG */}
            <div className="space-y-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'en' ? 'Schedule & Urgency' : 'Időzítés és Sürgősség'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{lang === 'en' ? 'Target Date *' : 'Tervezett dátum *'}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{lang === 'en' ? 'Preferred Timeslot' : 'Kívánt idősáv'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'e.g. Morning (09:00 - 12:00)' : 'pl. Délelőtt (09:00 - 12:00)'}
                    value={idosav}
                    onChange={(e) => setIdosav(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Sürgősségi szint */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {lang === 'en' ? 'Urgency Level' : 'Sürgősségi szint'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal' as const, label: lang === 'en' ? 'Normal' : 'Normál', desc: 'Rugalmas' },
                    { id: 'surgos' as const, label: lang === 'en' ? 'Urgent' : 'Sürgős', desc: '1-2 napon belül' },
                    { id: 'fix_idopont' as const, label: lang === 'en' ? 'Fixed time' : 'Fix időpont', desc: 'Orvosi időpont' },
                  ].map((lvl) => {
                    const active = urgency === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setUrgency(lvl.id)}
                        className={`min-h-[48px] px-2 py-1.5 rounded-xl flex flex-col items-center justify-center border transition-all text-center ${
                          active
                            ? lvl.id === 'fix_idopont'
                              ? 'border-rose-500 bg-rose-500 text-white'
                              : lvl.id === 'surgos'
                              ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold'
                              : 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{lvl.label}</span>
                        <span className="text-[10px] opacity-80">{lvl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. KAPCSOLATTARTÓ ADATAI */}
            <div className="space-y-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'en' ? 'Contact Details' : 'Kapcsolattartó adatai'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {lang === 'en' ? 'Contact Person Name *' : 'Kapcsolattartó neve *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'en' ? 'e.g. John Doe' : 'pl. Kovács Andrea'}
                    value={feladoNev}
                    onChange={(e) => setFeladoNev(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{lang === 'en' ? 'Phone Number *' : 'Telefonszám *'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+36 30 123 4567"
                    value={feladoTelefon}
                    onChange={(e) => setFeladoTelefon(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Organization / Shelter (optional)' : 'Szervezet / Menhely neve (opcionális)'}</span>
                </label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'e.g. Animal Rescue Foundation' : 'pl. Állatmentő Liget Debrecen'}
                  value={feladoSzervezet}
                  onChange={(e) => setFeladoSzervezet(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[48px] px-5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-sm font-bold transition-colors"
              >
                {lang === 'en' ? 'Cancel' : 'Mégse'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[52px] px-7 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Truck className="w-5 h-5 shrink-0" />
                <span>
                  {isSubmitting
                    ? (lang === 'en' ? 'Submitting...' : 'Közzététel...')
                    : (lang === 'en' ? 'Post Transport Request' : 'Fuvarigény közzététele')}
                </span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>,
    document.body
  );
};
