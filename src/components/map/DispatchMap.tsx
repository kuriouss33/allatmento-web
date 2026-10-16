'use client';

import React, { useEffect, useRef } from 'react';
import { Report } from '@/types';
import { canUserSeeExactReport, getReportDisplayLocation, getReportDisplayAddress } from '@/lib/privacy';

interface DispatchMapProps {
  reports: Report[];
  selectedReportId?: string | null;
  onSelectReport?: (reportId: string) => void;
  onOpenDetails?: (report: Report) => void;
  onOpenHelp?: (report: Report) => void;
  isRescuer?: boolean;
  isAdmin?: boolean;
  isRegistered?: boolean;
  currentUserId?: string | null;
}

export const DispatchMap: React.FC<DispatchMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onOpenDetails,
  onOpenHelp,
  isRescuer,
  isAdmin,
  isRegistered,
  currentUserId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const circlesGroupRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const isUserClickRef = useRef<boolean>(false);

  // Callbacks ref tárolása, hogy ne váltsanak ki felesleges re-render / layer rebuildet
  const onSelectReportRef = useRef(onSelectReport);
  onSelectReportRef.current = onSelectReport;

  const onOpenDetailsRef = useRef(onOpenDetails);
  onOpenDetailsRef.current = onOpenDetails;

  const onOpenHelpRef = useRef(onOpenHelp);
  onOpenHelpRef.current = onOpenHelp;

  // 1. Térkép és MarkerCluster inicializálása egyszer a betöltéskor
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const leafletModule = await import('leaflet');
        if (!isMounted || !mapContainerRef.current) return;
        const L = (leafletModule as any).default || leafletModule;
        (window as any).L = L;

        await import('leaflet.markercluster');

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

          // Magyarország központja
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

          // Clusterezés beállítása
          const cluster = (L as any).markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 45,
            disableClusteringAtZoom: 17,
          });
          map.addLayer(cluster);

          // Védett 100m-es körök rétegcsoportja
          const circlesGroup = L.layerGroup();
          map.addLayer(circlesGroup);

          mapInstanceRef.current = map;
          clusterGroupRef.current = cluster;
          circlesGroupRef.current = circlesGroup;
        }
      } catch (err) {
        console.error('Hiba a térkép inicializálásakor:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        clusterGroupRef.current = null;
        circlesGroupRef.current = null;
      }
    };
  }, []);

  // 2. Markerek és 100m-es védett körzetek frissítése
  useEffect(() => {
    const map = mapInstanceRef.current;
    const cluster = clusterGroupRef.current;
    const circlesGroup = circlesGroupRef.current;
    const L = typeof window !== 'undefined' ? (window as any).L : null;

    if (!map || !cluster || !L) return;

    cluster.clearLayers();
    if (circlesGroup) {
      circlesGroup.clearLayers();
    }
    markersMapRef.current.clear();

    const validReports = reports.filter((r) => r.lat && r.lon);

    validReports.forEach((report) => {
      const canSeeExact = canUserSeeExactReport(report, {
        isRescuer,
        isAdmin,
        isRegistered,
        currentUserId,
      });

      const location = getReportDisplayLocation(report, canSeeExact);
      if (!location.lat || !location.lon) return;

      const displayLat = location.lat;
      const displayLon = location.lon;
      const displayAddress = getReportDisplayAddress(report, canSeeExact);

      let badgeBg = 'bg-red-500/10 text-red-600 border-red-500/30';
      let statusText = 'Új bejelentés';
      let circleColor = '#ef4444';
      let pinClass = 'pin-uj';

      if (report.statusz === 'folyamatban') {
        badgeBg = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
        statusText = 'Folyamatban';
        circleColor = '#f59e0b';
        pinClass = 'pin-folyamatban';
      } else if (report.statusz === 'megoldva') {
        badgeBg = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
        statusText = 'Megoldva';
        circleColor = '#10b981';
        pinClass = 'pin-megoldva';
      }

      // Popup HTML felépítése
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 min-w-[210px] max-w-[270px] text-slate-800 dark:text-slate-100';

      const exactBadgeHtml = canSeeExact
        ? `<span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">🎯 Pontos cím</span>`
        : `<span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">🛡️ ~100m körzet</span>`;

      const noticeHtml = !canSeeExact
        ? `<div class="mb-2 p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-[10px] text-blue-800 dark:text-blue-300 leading-snug">
            🛡️ <strong>Védett körzet:</strong> A pontos címet az állat védelmében csak regisztrált mentők láthatják.
           </div>`
        : '';

      const navLabel = canSeeExact ? 'Útvonaltervezés a pontos címre ↗' : 'Útvonaltervezés a körzethez ↗';

      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-1.5 mb-1.5">
          <span class="font-bold text-sm text-slate-900">${report.fajta}</span>
          <div class="flex items-center gap-1">
            ${exactBadgeHtml}
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeBg}">
              ${statusText}
            </span>
          </div>
        </div>
        ${noticeHtml}
        ${
          (report.fotoUrl || report.kepUrl)
            ? `<div class="relative w-full h-28 mb-2 rounded-lg overflow-hidden border border-slate-200">
                <img src="${report.fotoUrl || report.kepUrl}" class="w-full h-full object-cover" alt="Fotó" />
               </div>`
            : ''
        }
        <p class="text-xs text-slate-600 mb-1 leading-snug">
          📍 ${displayAddress}
        </p>
        <div class="mt-2.5 pt-2 border-t border-slate-200 flex flex-col gap-1.5">
          <button id="popup-btn-details-${report.id}" class="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Részletek & Koordináció
          </button>
          ${
            !canSeeExact && report.statusz !== 'megoldva' && onOpenHelpRef.current
              ? `<button id="popup-btn-help-${report.id}" class="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                  🤝 Segítség felajánlása
                </button>`
              : ''
          }
          <a href="https://www.google.com/maps?q=${displayLat},${displayLon}" target="_blank" rel="noopener noreferrer" class="w-full py-1 px-3 text-center rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            ${navLabel}
          </a>
        </div>
      `;

      // Event listener a popup gombjaira
      const detailsBtn = popupContent.querySelector(`#popup-btn-details-${report.id}`);
      if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onOpenDetailsRef.current) {
            onOpenDetailsRef.current(report);
          }
        });
      }

      const helpBtn = popupContent.querySelector(`#popup-btn-help-${report.id}`);
      if (helpBtn) {
        helpBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onOpenHelpRef.current) {
            onOpenHelpRef.current(report);
          }
        });
      }

      let marker: any;

      if (canSeeExact) {
        // Pontos nézet hitelesített mentőknek: hegyes tűs marker
        const customIcon = L.divIcon({
          className: '',
          html: `<div class="custom-map-pin ${pinClass}"></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
          popupAnchor: [0, -28],
        });

        marker = L.marker([displayLat, displayLon], { icon: customIcon });
      } else {
        // Nem regisztrált / publikus nézet: 100 méteres védett körzet + központi mancs jelölő
        const zoneCircle = L.circle([displayLat, displayLon], {
          radius: 100, // 100 méteres védett zóna
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '5, 5',
          interactive: true,
        });

        const fuzzyIcon = L.divIcon({
          className: 'fuzzy-center-badge-container',
          html: `<div class="fuzzy-center-badge" style="border: 2px solid ${circleColor};">🐾</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

        marker = L.marker([displayLat, displayLon], { icon: fuzzyIcon });

        // Hover & kattintás események a 100m-es körön
        zoneCircle.on('mouseover', () => {
          zoneCircle.setStyle({ fillOpacity: 0.32, weight: 2.5 });
        });
        zoneCircle.on('mouseout', () => {
          zoneCircle.setStyle({ fillOpacity: 0.18, weight: 2 });
        });
        zoneCircle.on('click', () => {
          isUserClickRef.current = true;
          if (onSelectReportRef.current) {
            onSelectReportRef.current(report.id);
          }
          marker.openPopup();
        });

        zoneCircle.bindPopup(popupContent, {
          autoPan: true,
          autoPanPadding: [50, 50],
          closeButton: true,
        });

        if (circlesGroup) {
          circlesGroup.addLayer(zoneCircle);
        }
      }

      marker.bindPopup(popupContent, {
        autoPan: true,
        autoPanPadding: [50, 50],
        closeButton: true,
      });

      marker.on('click', () => {
        isUserClickRef.current = true;
        if (onSelectReportRef.current) {
          onSelectReportRef.current(report.id);
        }
      });

      cluster.addLayer(marker);
      markersMapRef.current.set(report.id, marker);
    });
  }, [reports, isRescuer, isAdmin, isRegistered, currentUserId]);

  // 3. Fókuszálás kívülről érkező kiválasztáskor (pl. lista kártyára kattintva)
  useEffect(() => {
    if (!selectedReportId) return;

    if (isUserClickRef.current) {
      isUserClickRef.current = false;
      return;
    }

    const map = mapInstanceRef.current;
    const cluster = clusterGroupRef.current;
    const marker = markersMapRef.current.get(selectedReportId);

    if (map && cluster && marker) {
      if (typeof cluster.zoomToShowLayer === 'function') {
        cluster.zoomToShowLayer(marker, () => {
          marker.openPopup();
        });
      } else {
        const latLng = marker.getLatLng();
        const targetZoom = Math.max(map.getZoom(), 15);
        map.setView(latLng, targetZoom, { animate: true });
        marker.openPopup();
      }
    }
  }, [selectedReportId]);

  return (
    <div className="relative w-full h-full min-h-[220px] lg:min-h-[350px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
