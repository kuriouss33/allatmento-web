'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TransportJob } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface TransportMapProps {
  jobs: TransportJob[];
  selectedJobId?: string | null;
  onSelectJob?: (jobId: string) => void;
  onOpenDetails?: (job: TransportJob) => void;
  className?: string;
}

export const TransportMap: React.FC<TransportMapProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onOpenDetails,
  className = 'w-full h-full min-h-[350px] sm:min-h-[480px]',
}) => {
  const { t, lang } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayersGroupRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // References to callbacks
  const onSelectJobRef = useRef(onSelectJob);
  onSelectJobRef.current = onSelectJob;

  const onOpenDetailsRef = useRef(onOpenDetails);
  onOpenDetailsRef.current = onOpenDetails;

  // 1. Térkép inicializálása
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const leafletModule = await import('leaflet');
        if (!isMounted || !mapContainerRef.current) return;
        const L = (leafletModule as any).default || leafletModule;
        (window as any).L = L;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapInstanceRef.current && mapContainerRef.current) {
          if ((mapContainerRef.current as any)._leaflet_id) {
            (mapContainerRef.current as any)._leaflet_id = null;
          }

          const map = L.map(mapContainerRef.current, {
            center: [47.1625, 19.5033],
            zoom: 7,
            zoomControl: false,
          });

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap közreműködők',
          }).addTo(map);

          const routeLayers = L.layerGroup();
          map.addLayer(routeLayers);

          mapInstanceRef.current = map;
          routeLayersGroupRef.current = routeLayers;
          setIsMapReady(true);
        }
      } catch (err) {
        console.error('Error loading leaflet map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Útvonalak és pontok kirajzolása
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayersGroupRef.current;
    const L = typeof window !== 'undefined' ? (window as any).L : null;

    if (!map || !routeGroup || !L || !isMapReady) return;

    routeGroup.clearLayers();

    const allPoints: [number, number][] = [];

    jobs.forEach((job) => {
      const isSelected = job.id === selectedJobId;
      const fromCoord: [number, number] = [job.honnanLat, job.honnanLon];
      const toCoord: [number, number] = [job.hovaLat, job.hovaLon];

      allPoints.push(fromCoord, toCoord);

      // Útvonal színe a státusz és sürgősség szerint
      let routeColor = '#3b82f6'; // default blue
      if (job.statusz === 'teljesitve') {
        routeColor = '#64748b'; // slate
      } else if (job.statusz === 'folyamatban') {
        routeColor = '#f59e0b'; // amber
      } else if (job.urgency === 'surgos' || job.urgency === 'fix_idopont') {
        routeColor = '#ef4444'; // red
      } else if (job.statusz === 'nyitott') {
        routeColor = '#10b981'; // emerald
      }

      if (isSelected) {
        routeColor = '#2563eb'; // kiemelt kék
      }

      // 1. Honnan (A pont) Ikon
      const fromIcon = L.divIcon({
        className: 'custom-transport-pin',
        html: `
          <div style="background-color: #10b981; color: white; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
            A
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      // 2. Hova (B pont) Ikon
      const toIcon = L.divIcon({
        className: 'custom-transport-pin',
        html: `
          <div style="background-color: ${isSelected ? '#2563eb' : '#ef4444'}; color: white; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
            B
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const markerFrom = L.marker(fromCoord, { icon: fromIcon });
      const markerTo = L.marker(toCoord, { icon: toIcon });

      // 3. Útvonal nyomvonal (Polyline)
      const polyline = L.polyline([fromCoord, toCoord], {
        color: routeColor,
        weight: isSelected ? 5 : 3.5,
        opacity: isSelected ? 1 : 0.75,
        dashArray: isSelected ? '8, 8' : '5, 8',
      });

      // 4. Felezőpont irány-jelző (Középpont nyíllal)
      const midLat = (job.honnanLat + job.hovaLat) / 2;
      const midLon = (job.honnanLon + job.hovaLon) / 2;
      const midIcon = L.divIcon({
        className: 'custom-transport-midpoint',
        html: `
          <div style="background: white; border: 1.5px solid ${routeColor}; border-radius: 12px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 3px; white-space: nowrap;">
            <span>➔</span>
            <span>${job.tavolsagKm ? `${job.tavolsagKm} km` : ''}</span>
          </div>
        `,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });

      const midMarker = L.marker([midLat, midLon], { icon: midIcon });

      // Popup tartalom
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; background: ${
              job.statusz === 'nyitott' ? '#dcfce7; color: #15803d;' :
              job.statusz === 'elvallalva' ? '#dbeafe; color: #1d4ed8;' :
              job.statusz === 'folyamatban' ? '#fef3c7; color: #b45309;' : '#f1f5f9; color: #475569;'
            }">
              ${job.statusz === 'nyitott' ? (lang === 'en' ? 'Open ride' : 'Nyitott fuvar') :
                job.statusz === 'elvallalva' ? (lang === 'en' ? 'Accepted' : 'Elvállalva') :
                job.statusz === 'folyamatban' ? (lang === 'en' ? 'In transit' : 'Úton') : (lang === 'en' ? 'Completed' : 'Teljesítve')}
            </span>
            ${job.urgency === 'surgos' || job.urgency === 'fix_idopont' ? `
              <span style="font-size: 10px; font-weight: 800; color: #e11d48; background: #ffe4e6; padding: 2px 6px; border-radius: 6px;">
                ⚡ ${lang === 'en' ? 'Urgent' : 'Sürgős'}
              </span>
            ` : ''}
          </div>

          <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
            ${job.honnanVaros} ➔ ${job.hovaVaros}
          </div>

          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${job.allatNev || job.allatFajta || (lang === 'en' ? 'Cargo' : 'Szállítmány')} · ${job.datum}
          </div>

          <p style="font-size: 11px; color: #334155; line-height: 1.35; margin-bottom: 8px;">
            ${job.leiras}
          </p>

          <button
            id="btn-details-${job.id}"
            style="width: 100%; min-height: 42px; background: #059669; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            ${lang === 'en' ? 'Details & Contact ↗' : 'Részletek & Kapcsolat ↗'}
          </button>
        </div>
      `;

      const bindEvents = (layer: any) => {
        layer.bindPopup(popupHtml, { autoPan: true, autoPanPadding: [40, 40] });
        layer.on('popupopen', () => {
          const btn = document.getElementById(`btn-details-${job.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onOpenDetailsRef.current) {
                onOpenDetailsRef.current(job);
              }
            };
          }
        });
        layer.on('click', () => {
          if (onSelectJobRef.current) {
            onSelectJobRef.current(job.id);
          }
        });
      };

      bindEvents(polyline);
      bindEvents(markerFrom);
      bindEvents(markerTo);
      bindEvents(midMarker);

      routeGroup.addLayer(polyline);
      routeGroup.addLayer(markerFrom);
      routeGroup.addLayer(markerTo);
      routeGroup.addLayer(midMarker);
    });

    // Ha van kiválasztott fuvar, arra zoomolunk
    if (selectedJobId) {
      const selected = jobs.find((j) => j.id === selectedJobId);
      if (selected) {
        const bounds = L.latLngBounds([
          [selected.honnanLat, selected.honnanLon],
          [selected.hovaLat, selected.hovaLon],
        ]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
        return;
      }
    }

    // Egyébként az összes magyarországi pontra zoomolunk ha vannak pontok
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [jobs, selectedJobId, isMapReady]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
