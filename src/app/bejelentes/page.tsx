'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ExternalLink,
  Printer,
  WifiOff,
  CloudUpload,
  RefreshCw,
  Plus,
  Star,
  Images
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { MEGYEK } from '@/lib/constants';
import { detectCounty } from '@/lib/countyDetector';
import { createReport, uploadImage } from '@/lib/api';
import { compressImage, isNetworkError } from '@/lib/image';
import { saveDeleteToken, getAnonymousUserId } from '@/lib/storage';
import { saveOfflineReport } from '@/lib/offlineQueue';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useOfflineSync } from '@/context/OfflineSyncContext';
import { PrivacyModal } from '@/components/common/PrivacyModal';
import { PosterModal } from '@/components/report/PosterModal';

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
  const { isOnline, syncNow, isSyncing } = useOfflineSync();

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

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const photoPreview = photoPreviews[0] || null;

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
  const [posterModalOpen, setPosterModalOpen] = useState<boolean>(false);
  const [isOfflineSubmitted, setIsOfflineSubmitted] = useState<boolean>(false);

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
          const detectedCounty = detectCounty(data.address, data.display_name);
          if (detectedCounty) {
            setMegye(detectedCounty);
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

  // Fotók választása (akár több kép is, max. 5)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files).filter((file) => file.type.startsWith('image/'));
    if (incoming.length === 0) return;

    const remainingSlots = 5 - photoFiles.length;
    if (remainingSlots <= 0) {
      setError(t.maxPhotosReached || 'Legfeljebb 5 fotó tölthető fel.');
      e.target.value = '';
      return;
    }

    const toAdd = incoming.slice(0, remainingSlots);
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file));

    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setPhotoFiles((prev) => {
      const selected = prev[index];
      const others = prev.filter((_, i) => i !== index);
      return [selected, ...others];
    });
    setPhotoPreviews((prev) => {
      const selected = prev[index];
      const others = prev.filter((_, i) => i !== index);
      return [selected, ...others];
    });
  };

  // Beküldés
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leiras.trim()) {
      setError(t.descRequired || 'A részletes leírás kitöltése kötelező a helyszíni mentés megkönnyítéséhez!');
      return;
    }
    if (!privacyConsent) {
      setError('A beküldéshez el kell fogadnod az adatkezelési tájékoztatót!');
      return;
    }

    setSubmitting(true);
    setError(null);

    const createrId = firebaseUser?.uid || getAnonymousUserId();
    const finalCounty = megye || detectCounty(null, address) || 'Budapest';
    const compressedBlobs: Blob[] = [];

    // 1. Képek tömörítése terepen (egyessével, max 5 fotó)
    for (const file of photoFiles) {
      try {
        const blob = await compressImage(file);
        compressedBlobs.push(blob);
      } catch (uploadErr: any) {
        console.warn('Képtömörítési hiba, kísérlet az eredeti fájllal:', uploadErr);
        compressedBlobs.push(file);
      }
    }

    // 2. Ha nincs térerő / offline vagyunk: azonnali mentés az IndexedDB-be
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const offlineRecord = await saveOfflineReport({
          fajta,
          leiras: leiras.trim(),
          megye: finalCounty,
          cim: address.trim() || undefined,
          telefon: telefon.trim() || undefined,
          lat,
          lon,
          createrId,
          photoBlob: compressedBlobs[0] || null,
          photoFileName: photoFiles[0]?.name || 'field-report.jpg',
          photoBlobs: compressedBlobs,
          photoFileNames: photoFiles.map((f, i) => f.name || `field-report-${i}.jpg`),
        });

        setIsOfflineSubmitted(true);
        setCreatedReportId(offlineRecord.id);
        setStep(4);
        return;
      } catch (dbErr: any) {
        setError('Nem sikerült az offline mentés a készülékre: ' + (dbErr.message || 'Helyi tárolási hiba'));
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // 3. Online beküldés
    try {
      const uploadedPhotoUrls: string[] = [];

      for (let i = 0; i < compressedBlobs.length; i++) {
        const blob = compressedBlobs[i];
        const file = photoFiles[i];
        const url = await uploadImage(blob, file?.name || `report-photo-${i}.jpg`);
        uploadedPhotoUrls.push(url);
      }

      const primaryUrl = uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls[0] : undefined;

      const result = await createReport({
        fajta,
        leiras: leiras.trim(),
        megye: finalCounty,
        cim: address.trim() || undefined,
        telefon: telefon.trim() || undefined,
        lat,
        lon,
        fotoUrl: primaryUrl,
        kepek: uploadedPhotoUrls,
        createrId,
      });

      const repId = result.id || (result as any).data?.id;
      const delToken = result.deleteToken || (result as any).data?.deleteToken;

      if (repId && delToken) {
        saveDeleteToken(repId, delToken);
      }

      setIsOfflineSubmitted(false);
      setCreatedReportId(repId);
      setStep(4);
    } catch (err: any) {
      // 4. Ha a hálózat a beküldés közben szakadt meg (terepi hálózati ingadozás)
      if (isNetworkError(err) || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        console.warn('Hálózati hiba beküldés közben, automatikus mentés az IndexedDB-be:', err);
        try {
          const offlineRecord = await saveOfflineReport({
            fajta,
            leiras: leiras.trim(),
            megye: finalCounty,
            cim: address.trim() || undefined,
            telefon: telefon.trim() || undefined,
            lat,
            lon,
            createrId,
            photoBlob: compressedBlobs[0] || null,
            photoFileName: photoFiles[0]?.name || 'field-report.jpg',
            photoBlobs: compressedBlobs,
            photoFileNames: photoFiles.map((f, i) => f.name || `field-report-${i}.jpg`),
          });

          setIsOfflineSubmitted(true);
          setCreatedReportId(offlineRecord.id);
          setStep(4);
          return;
        } catch (dbErr: any) {
          setError('Hálózati hiba történt, és a helyi offline mentés is sikertelen: ' + (dbErr.message || ''));
        }
      } else {
        setError(err.message || 'Hiba történt a bejelentés beküldésekor.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      const basePath = process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : '';
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
                  {s === 1 ? t.step1Short : s === 2 ? t.step2Short : t.step3Short}
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

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-2 gap-3 sm:gap-4 content-center scrollbar-thin py-1 sm:py-2">
            {[
              { id: 'Kutya', label: t.typeDog, image: '/dog.png' },
              { id: 'Macska', label: t.typeCat, image: '/cat.png' },
              { id: 'Vadállat', label: t.typeWild, image: '/wild.png' },
              { id: 'Egyéb', label: t.typeOther, image: '/other.png' },
            ].map((item) => {
              const isSelected = fajta === item.id;
              const basePath = process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : '';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFajta(item.id)}
                  className={`group relative p-3 sm:p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all text-center cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-md ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-200'
                  }`}
                >
                  {/* Kijelölési pipa jelvény jobb felül */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}

                  {/* Kép container */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                    <Image
                      src={`${basePath}${item.image}`}
                      alt={item.label}
                      width={112}
                      height={112}
                      className={`w-full h-full object-contain transition-transform duration-200 dark-invert-white ${
                        isSelected
                          ? 'scale-105 drop-shadow-md icon-selected'
                          : 'group-hover:scale-105 opacity-90 group-hover:opacity-100'
                      }`}
                      priority
                    />
                  </div>

                  {/* Fajta neve */}
                  <span className="text-sm sm:text-base font-bold tracking-tight">
                    {item.label}
                  </span>
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
              {t.locationSub}
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
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-200 dark:border-zinc-700 bg-blue-50/80 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 text-blue-700 dark:text-zinc-200 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? t.fetchingGps : t.btnGps}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{showMapPicker ? t.hideMap : t.btnManualPin}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic">
              {locationStatus || t.locationDefaultPrompt}
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
                    setMegye(detectedCounty);
                  }
                }}
              />
            )}

            {/* Bejelentési cím vagy környék megadása / ellenőrzése */}
            <div className="pt-1 text-center">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                {t.addressLabel}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  const val = e.target.value;
                  setAddress(val);
                  const detected = detectCounty(null, val);
                  if (detected) setMegye(detected);
                }}
                placeholder={t.addressPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-light"
              />
              {megye && (
                <p className="text-[11px] font-light text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                  <span>{t.detectedCountyLabel}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-normal">{megye} {t.countySuffix}</span>
                </p>
              )}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3.5 text-center flex flex-col items-center">
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-center gap-1.5 text-center">
                <Camera className="w-4 h-4 text-blue-500" />
                <span>{t.photosMultiTitle || 'Fényképek csatolása (akár több fotó is)'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md mx-auto">
                {t.photosMultiSub || 'Tölts fel 1–5 fotót az állatról és a helyszínről! Az első fotó lesz a fő borítókép.'}
              </p>
            </div>

            {photoPreviews.length > 0 ? (
              <div className="w-full space-y-3">
                {/* Fotó számláló és gyors hozzáadás gomb */}
                <div className="flex items-center justify-between text-xs px-1 text-slate-600 dark:text-slate-300">
                  <span className="font-medium flex items-center gap-1">
                    <Images className="w-3.5 h-3.5 text-blue-500" />
                    <span>{photoPreviews.length} / 5 {t.photoCountUnit || 'kép'}</span>
                  </span>
                  {photoPreviews.length < 5 && (
                    <label className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addMorePhotos || 'További fotó hozzáadása'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Fotó rács */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {photoPreviews.map((previewUrl, index) => (
                    <div 
                      key={`${previewUrl}-${index}`}
                      className={`relative rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800 aspect-4/3 group/item shadow-xs ${
                        index === 0 
                          ? 'ring-2 ring-blue-500 border-blue-500/50' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <img 
                        src={previewUrl} 
                        alt={`${t.photoPreview} #${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />

                      {/* Fő kép jelvény vagy beállítás fő képként gomb */}
                      {index === 0 ? (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-blue-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>{t.coverPhotoBadge || 'Fő kép'}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverPhoto(index)}
                          className="absolute top-1.5 left-1.5 opacity-90 sm:opacity-0 group-hover/item:opacity-100 transition-opacity px-2 py-0.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs cursor-pointer"
                          title={t.setAsCover || 'Legyen ez a fő kép'}
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{t.setAsCover || 'Fő kép'}</span>
                        </button>
                      )}

                      {/* Törlés gomb */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
                        title={t.removePhoto}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Kép hozzáadása csempe (ha kevesebb mint 5 kép van) */}
                  {photoPreviews.length < 5 && (
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors aspect-4/3 text-center p-2 group/add">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover/add:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                        {t.addMorePhotos || 'További fotó'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        (max. {5 - photoPreviews.length} db)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <label className="w-full flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all text-center group/empty">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover/empty:scale-105 transition-transform shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                  {t.uploadBtn}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  {t.photoFormatHint || 'Több fotó is kiválasztható (JPG, PNG, max. 5 db)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
              {t.detailsSub}
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 sm:space-y-4 scrollbar-thin">
            <div className="space-y-3 sm:space-y-4">
            {megye && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 py-0.5 select-none">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-light">{t.detectedCountyLabel}</span>
                <span className="font-light px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-zinc-700">
                  {megye} {t.countySuffix}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                <span>{t.descLabel}</span> <span className="text-red-500 font-bold" title="Kötelező mező">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={leiras}
                onChange={(e) => {
                  setLeiras(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t.descPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-center"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1">
                {t.descRequiredHint || "A leírás kitöltése kötelező az állat állapotáról és a helyszínről."}
              </p>
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
                {t.privacyConsentTextStart}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPrivacyModalOpen(true);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 inline"
                >
                  {t.privacyConsentLink}
                </button>
                {t.privacyConsentTextEnd}
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

      {/* Step 4: Sikeroldal / Offline Mentés */}
      {step === 4 && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm text-center space-y-4 sm:space-y-6 scrollbar-thin">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
            isOfflineSubmitted 
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
          }`}>
            {isOfflineSubmitted ? (
              <WifiOff className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isOfflineSubmitted ? t.offlineSavedTitle : t.successTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {isOfflineSubmitted ? t.offlineSavedDesc : t.successSub}
            </p>
          </div>

          {/* Ha offline mentés történt: Várakozási sor és Szinkronizálás doboz */}
          {isOfflineSubmitted && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 max-w-md mx-auto space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                <CloudUpload className="w-4 h-4 text-amber-600" />
                <span>{t.offlineRetryNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t.offlineSyncing : t.offlineTrySyncBtn}</span>
              </button>
            </div>
          )}

          {/* Poster Generator Callout Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/5 to-amber-500/10 border-2 border-red-500/30 max-w-md mx-auto space-y-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {t.posterModalTitle}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  {t.posterModalSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPosterModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.posterBtnOpen} ({t.posterPrintBtn} / PDF)</span>
            </button>
          </div>

          {/* Share Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {t.shareIncidentPrompt}
            </span>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  typeof window !== 'undefined' ? `${window.location.origin}${process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : ''}/terkep?reportId=${createdReportId}` : ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareFacebook}</span>
              </a>

              <button
                type="button"
                onClick={copyShareLink}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/terkep"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all text-center"
            >
              {t.viewOnMap}
            </Link>
          </div>
        </div>
      )}

      <PrivacyModal 
        isOpen={privacyModalOpen} 
        onClose={() => setPrivacyModalOpen(false)} 
      />

      <PosterModal
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
        initialData={{
          id: createdReportId || '',
          fajta,
          leiras,
          cim: address,
          megye,
          telefon,
          fotoUrl: photoPreview || undefined,
          createdAt: new Date().toISOString(),
          statusz: 'uj',
        }}
      />
    </div>
  );
}
