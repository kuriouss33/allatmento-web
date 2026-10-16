'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Dog, 
  Cat, 
  Bird, 
  HelpCircle, 
  MapPin, 
  Navigation, 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Copy, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { MEGYEK } from '@/lib/constants';
import { createReport, uploadImage } from '@/lib/api';
import { compressImage } from '@/lib/image';
import { saveDeleteToken, getAnonymousUserId } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { PrivacyModal } from '@/components/common/PrivacyModal';

const LocationPickerMap = dynamic(
  () => import('@/components/map/LocationPickerMap').then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500">
        Térkép betöltése...
      </div>
    ),
  }
);

export default function ReportWizardPage() {
  const { t } = useLanguage();
  const { firebaseUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Fajta
  const [fajta, setFajta] = useState<string>('Kutya');

  // Step 2: Helyszín & Fotó
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [megye, setMegye] = useState<string>('Budapest');
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Válassz a fenti lehetőségek közül!');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Step 3: Leírás, Telefon, GDPR
  const [leiras, setLeiras] = useState<string>('');
  const [telefon, setTelefon] = useState<string>('');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);

  // Állapotok
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);

  // GPS lekérés
  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('A böngésződ nem támogatja a helymeghatározást.');
      return;
    }

    setGpsLoading(true);
    setLocationStatus('Helymeghatározás folyamatban...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        setLat(userLat);
        setLon(userLon);
        setShowMapPicker(true);
        setGpsLoading(false);
        setLocationStatus('Pozíció sikeresen rögzítve!');

        // Nominatim címlekérés
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLon}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'hu' } }
          );
          const data = await res.json();
          if (data.display_name) {
            setAddress(data.display_name);
            setLocationStatus(`📍 ${data.display_name}`);
          }
          if (data.address?.county) {
            const detectedCounty = MEGYEK.find((m) =>
              data.address.county.toLowerCase().includes(m.toLowerCase())
            );
            if (detectedCounty) setMegye(detectedCounty);
          }
        } catch {
          // Sikeres GPS, címlekérés nem kötelező
        }
      },
      (err) => {
        setGpsLoading(false);
        setLocationStatus('Nem sikerült lekérni a pozíciót. Használd a kézi kijelölést!');
        setShowMapPicker(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fotó választás
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Beküldés
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent) {
      setError('A beküldéshez el kell fogadnod az adatkezelési tájékoztatót!');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let uploadedPhotoUrl: string | undefined = undefined;

      // Kép tömörítése és feltöltése a szerverre
      if (photoFile) {
        try {
          const compressedBlob = await compressImage(photoFile);
          uploadedPhotoUrl = await uploadImage(compressedBlob, photoFile.name || 'report-photo.jpg');
        } catch (uploadErr: any) {
          console.warn('Tömörített képfeltöltési kísérlet sikertelen, próbálkozás az eredetivel:', uploadErr);
          try {
            uploadedPhotoUrl = await uploadImage(photoFile, photoFile.name || 'report-photo.jpg');
          } catch (origErr: any) {
            throw new Error(`Képfeltöltési hiba: ${origErr.message || 'A szerver visszautasította a fotót.'}`);
          }
        }
      }

      const createrId = firebaseUser?.uid || getAnonymousUserId();

      const result = await createReport({
        fajta,
        leiras: leiras.trim(),
        megye,
        cim: address.trim() || undefined,
        telefon: telefon.trim() || undefined,
        lat,
        lon,
        fotoUrl: uploadedPhotoUrl,
        createrId,
      });

      if (result.deleteToken) {
        saveDeleteToken(result.id, result.deleteToken);
      }

      setCreatedReportId(result.id);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Hiba történt a bejelentés beküldésekor.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      const basePath = process.env.NODE_ENV === 'production' ? '/allatmento-web' : '';
      const link = `${window.location.origin}${basePath}/terkep?reportId=${createdReportId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-2xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-6 overflow-hidden animate-fadeIn">
      
      {/* Stepper Progress Bar */}
      {step < 4 && (
        <div className="mb-2 sm:mb-6 shrink-0">
          <div className="flex items-center justify-between relative mb-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center z-10">
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === s
                      ? 'bg-blue-600 text-white ring-3 sm:ring-4 ring-blue-500/20 shadow-md'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">
                  {s === 1 ? '1. Fajta' : s === 2 ? '2. Hely & Fotó' : '3. Adatok'}
                </span>
              </div>
            ))}
            <div className="absolute top-3.5 sm:top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Fajta választás */}
      {step === 1 && (
        <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-sm overflow-hidden">
          <div className="text-center space-y-0.5 sm:space-y-1 mb-2 sm:mb-4 shrink-0">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {t.speciesTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              {t.speciesSub}
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-2 gap-2 sm:gap-3 content-center scrollbar-thin">
            {[
              { id: 'Kutya', label: t.typeDog, icon: Dog },
              { id: 'Macska', label: t.typeCat, icon: Cat },
              { id: 'Vadállat', label: t.typeWild, icon: Bird },
              { id: 'Egyéb', label: t.typeOther, icon: HelpCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = fajta === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFajta(item.id)}
                  className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 transition-all text-center ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-center shrink-0 mt-auto">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-2 px-6 py-2 sm:px-8 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <span>{t.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Helyszín & Fotó */}
      {step === 2 && (
        <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-sm overflow-hidden">
          <div className="text-center space-y-0.5 sm:space-y-1 mb-2 sm:mb-4 shrink-0">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white text-center">
              {t.locationTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
              Adj meg pontos koordinátát vagy címet a gyors mentéshez
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 sm:space-y-4 scrollbar-thin">
            {/* Location Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleGpsLocation}
                disabled={gpsLoading}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Pozíció lekérése...' : t.btnGps}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{showMapPicker ? 'Térkép elrejtése' : t.btnManualPin}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic">
              {locationStatus}
            </p>

            {/* Interactive Location Picker Map */}
            {showMapPicker && (
              <LocationPickerMap
                initialLat={lat}
                initialLon={lon}
                onLocationSelect={(selectedLat, selectedLon, detectedAddress, detectedCounty) => {
                  setLat(selectedLat);
                  setLon(selectedLon);
                  if (detectedAddress) {
                    setAddress(detectedAddress);
                    setLocationStatus(`📍 ${detectedAddress}`);
                  }
                  if (detectedCounty) {
                    const found = MEGYEK.find((m) =>
                      detectedCounty.toLowerCase().includes(m.toLowerCase())
                    );
                    if (found) setMegye(found);
                  }
                }}
              />
            )}
          </div>

          {/* Photo Upload Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-center flex flex-col items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-center gap-1.5 text-center">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>{t.photoTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {t.photoSub}
            </p>

            {photoPreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                <img src={photoPreview} alt="Előnézet" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition-colors"
                  title={t.removePhoto}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-center">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {t.uploadBtn}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  JPG vagy PNG kép automatikusan tömörítve
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          </div>

          {/* Buttons */}
          <div className="pt-2.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center justify-center gap-2 px-6 py-2 sm:px-8 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <span>{t.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Leírás, Adatok, GDPR */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-sm overflow-hidden">
          <div className="text-center space-y-0.5 sm:space-y-1 mb-2 sm:mb-4 shrink-0">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white text-center">
              {t.detailsTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
              Adj meg minden fontos részletet, ami segíti a helyszíni mentőket
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 sm:space-y-4 scrollbar-thin">
            <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                {t.countyLabel} *
              </label>
              <select
                required
                value={megye}
                onChange={(e) => setMegye(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                {MEGYEK.map((m) => (
                  <option key={m} value={m}>
                    {m} megye
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                {t.descLabel}
              </label>
              <textarea
                rows={3}
                value={leiras}
                onChange={(e) => setLeiras(e.target.value)}
                placeholder={t.descPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>

            <div className="flex items-center justify-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 select-none pt-2 text-center">
              <input
                type="checkbox"
                id="privacy-consent-checkbox"
                required
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="privacy-consent-checkbox" className="leading-snug cursor-pointer">
                Elfogadom az{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPrivacyModalOpen(true);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 inline"
                >
                  adatkezelési tájékoztatót
                </button>
                {' '}és hozzájárulok a megadott adatok mentés célú kezeléséhez.
              </label>
            </div>
          </div>
        </div>

          {/* Buttons */}
          <div className="pt-2.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2 sm:px-8 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{submitting ? t.processing : t.submitReport}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Sikeroldal */}
      {step === 4 && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm text-center space-y-4 sm:space-y-6 scrollbar-thin">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.successTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {t.successSub}
            </p>
          </div>

          {/* Share Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Oszd meg a bejelentést a gyorsabb segítségért:
            </span>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  typeof window !== 'undefined' ? `${window.location.origin}${process.env.NODE_ENV === 'production' ? '/allatmento-web' : ''}/terkep?reportId=${createdReportId}` : ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareFacebook}</span>
              </a>

              <button
                type="button"
                onClick={copyShareLink}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/terkep"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Megtekintés a térképen
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Vissza a főoldalra
            </Link>
          </div>
        </div>
      )}

      <PrivacyModal 
        isOpen={privacyModalOpen} 
        onClose={() => setPrivacyModalOpen(false)} 
      />
    </div>
  );
}
