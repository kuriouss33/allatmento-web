'use client';

import React, { useEffect, useRef, useState } from 'react';
import { detectCounty } from '@/lib/countyDetector';
import { useLanguage } from '@/context/LanguageContext';

interface LocationPickerMapProps {
  initialLat?: number | null;
  initialLon?: number | null;
  onLocationSelect: (lat: number, lon: number, address?: string, county?: string) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLat,
  initialLon,
  onLocationSelect,
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Cím lekérése Nominatim segítségével
  const reverseGeocode = async (lat: number, lon: number) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'hu' } }
      );
      const data = await res.json();
      const address = data.display_name || '';
      const county = detectCounty(data.address, address);
      onLocationSelect(lat, lon, address, county);
    } catch {
      onLocationSelect(lat, lon);
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((leafletModule) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = (leafletModule as any).default || leafletModule;

      const defaultLat = initialLat || 47.4979;
      const defaultLon = initialLon || 19.0402;
      const defaultZoom = initialLat && initialLon ? 15 : 11;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLon],
          zoom: defaultZoom,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        // Kattintás esemény a térképen
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng, L);
          reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
      }

      if (initialLat && initialLon) {
        updateMarker(initialLat, initialLon, L);
        mapInstanceRef.current.setView([initialLat, initialLon], 15);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateMarker = (lat: number, lon: number, L: any) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      const customIcon = L.divIcon({
        className: '',
        html: `<div class="custom-map-pin pin-uj"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([lat, lon], {
        icon: customIcon,
        draggable: true,
      });

      marker.on('dragend', (event: any) => {
        const position = event.target.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });

      marker.addTo(mapInstanceRef.current);
      markerRef.current = marker;
    }
  };

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mt-3">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {loadingAddress && (
        <div className="absolute top-2 right-2 z-20 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-full shadow border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{t.detectingAddress}</span>
        </div>
      )}
    </div>
  );
};
