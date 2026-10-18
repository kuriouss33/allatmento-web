import { Organization } from '@/types';

/**
 * Távolság számítása két GPS koordináta között (Haversine formula, km-ben)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Föld sugara km-ben
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 tizedesjegy pontosság
}

/**
 * Távolság formázása felhasználóbarát módon (pl. "850 m" vagy "3.2 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Budapest kerületi központok koordinátái (I - XXIII)
const BUDAPEST_DISTRICT_COORDS: Record<number, { lat: number; lon: number }> = {
  1: { lat: 47.498, lon: 19.034 },
  2: { lat: 47.525, lon: 19.012 },
  3: { lat: 47.545, lon: 19.035 },
  4: { lat: 47.562, lon: 19.091 },
  5: { lat: 47.498, lon: 19.053 },
  6: { lat: 47.506, lon: 19.062 },
  7: { lat: 47.502, lon: 19.068 },
  8: { lat: 47.491, lon: 19.076 },
  9: { lat: 47.476, lon: 19.078 },
  10: { lat: 47.485, lon: 19.148 },
  11: { lat: 47.474, lon: 19.037 },
  12: { lat: 47.501, lon: 18.998 },
  13: { lat: 47.531, lon: 19.075 },
  14: { lat: 47.518, lon: 19.117 },
  15: { lat: 47.555, lon: 19.125 },
  16: { lat: 47.516, lon: 19.192 },
  17: { lat: 47.481, lon: 19.245 },
  18: { lat: 47.442, lon: 19.183 },
  19: { lat: 47.453, lon: 19.145 },
  20: { lat: 47.436, lon: 19.118 },
  21: { lat: 47.424, lon: 19.071 },
  22: { lat: 47.421, lon: 19.031 },
  23: { lat: 47.404, lon: 19.123 },
};

// Magyarországi irányítószámok és települések koordináta térképe
const HUNGARY_ZIP_COORDS: Record<string, { lat: number; lon: number }> = {
  // Pest vármegye és környéke
  '2000': { lat: 47.669, lon: 19.075 }, // Szentendre
  '2013': { lat: 47.649, lon: 19.027 }, // Pomáz
  '2027': { lat: 47.768, lon: 18.913 }, // Dömös
  '2030': { lat: 47.380, lon: 18.918 }, // Érd
  '2040': { lat: 47.462, lon: 18.953 }, // Budaörs
  '2060': { lat: 47.492, lon: 18.636 }, // Bicske
  '2100': { lat: 47.597, lon: 19.355 }, // Gödöllő
  '2120': { lat: 47.632, lon: 19.141 }, // Dunakeszi
  '2330': { lat: 47.354, lon: 19.088 }, // Dunaharaszti
  '2364': { lat: 47.294, lon: 19.227 }, // Ócsa
  '2400': { lat: 46.962, lon: 18.935 }, // Dunaújváros
  '2463': { lat: 47.346, lon: 18.750 }, // Tordas
  '2500': { lat: 47.785, lon: 18.742 }, // Esztergom
  '2600': { lat: 47.776, lon: 19.136 }, // Vác
  '2660': { lat: 48.077, lon: 19.293 }, // Balassagyarmat
  '2700': { lat: 47.175, lon: 19.799 }, // Cegléd
  '2800': { lat: 47.585, lon: 18.395 }, // Tatabánya
  '2900': { lat: 47.743, lon: 18.118 }, // Komárom

  // Észak-Magyarország
  '3100': { lat: 48.093, lon: 19.803 }, // Salgótarján
  '3104': { lat: 48.093, lon: 19.803 }, // Salgótarján
  '3200': { lat: 47.784, lon: 19.927 }, // Gyöngyös
  '3212': { lat: 47.744, lon: 19.923 }, // Gyöngyöshalász
  '3300': { lat: 47.902, lon: 20.377 }, // Eger
  '3388': { lat: 47.646, lon: 20.655 }, // Poroszló
  '3390': { lat: 47.747, lon: 20.419 }, // Füzesabony
  '3434': { lat: 48.016, lon: 20.825 }, // Mályi
  '3525': { lat: 48.103, lon: 20.778 }, // Miskolc
  '3527': { lat: 48.103, lon: 20.778 }, // Miskolc
  '3528': { lat: 48.103, lon: 20.778 }, // Miskolc
  '3600': { lat: 48.219, lon: 20.287 }, // Ózd
  '3758': { lat: 48.061, lon: 20.631 }, // Bükkszentkereszt
  '3980': { lat: 48.397, lon: 21.658 }, // Sátoraljaújhely

  // Észak- és Kelet-Alföld
  '4002': { lat: 47.531, lon: 21.627 }, // Debrecen
  '4024': { lat: 47.531, lon: 21.627 }, // Debrecen
  '4031': { lat: 47.531, lon: 21.627 }, // Debrecen
  '4032': { lat: 47.531, lon: 21.627 }, // Debrecen
  '4071': { lat: 47.582, lon: 21.149 }, // Hortobágy
  '4220': { lat: 47.671, lon: 21.514 }, // Hajdúböszörmény
  '4225': { lat: 47.604, lon: 21.579 }, // Debrecen-Józsa
  '4400': { lat: 47.955, lon: 21.716 }, // Nyíregyháza
  '4484': { lat: 48.131, lon: 21.714 }, // Ibrány
  '4551': { lat: 47.948, lon: 21.791 }, // Nyíregyháza-Oros
  '4700': { lat: 47.956, lon: 22.324 }, // Mátészalka
  '5000': { lat: 47.175, lon: 20.177 }, // Szolnok
  '5100': { lat: 47.502, lon: 19.914 }, // Jászberény
  '5200': { lat: 47.181, lon: 20.418 }, // Törökszentmiklós
  '5400': { lat: 47.004, lon: 20.619 }, // Mezőtúr
  '5540': { lat: 46.864, lon: 20.551 }, // Szarvas
  '5600': { lat: 46.680, lon: 21.089 }, // Békéscsaba
  '5700': { lat: 46.646, lon: 21.277 }, // Gyula
  '5900': { lat: 46.568, lon: 20.665 }, // Orosháza

  // Dél-Alföld
  '6000': { lat: 46.907, lon: 19.692 }, // Kecskemét
  '6400': { lat: 46.432, lon: 19.485 }, // Kiskunhalas
  '6500': { lat: 46.181, lon: 18.955 }, // Baja
  '6600': { lat: 46.654, lon: 20.258 }, // Szentes
  '6724': { lat: 46.253, lon: 20.141 }, // Szeged
  '6728': { lat: 46.253, lon: 20.141 }, // Szeged
  '6791': { lat: 46.284, lon: 20.082 }, // Szeged-Kiskundorozsma
  '6800': { lat: 46.430, lon: 20.320 }, // Hódmezővásárhely

  // Dél-Dunántúl
  '7030': { lat: 46.623, lon: 18.858 }, // Paks
  '7100': { lat: 46.353, lon: 18.706 }, // Szekszárd
  '7142': { lat: 46.411, lon: 18.571 }, // Zomba
  '7150': { lat: 46.299, lon: 18.530 }, // Bonyhád
  '7400': { lat: 46.359, lon: 17.796 }, // Kaposvár
  '7475': { lat: 46.241, lon: 17.842 }, // Bőszénfa
  '7570': { lat: 45.960, lon: 17.460 }, // Barcs
  '7600': { lat: 46.072, lon: 18.232 }, // Pécs
  '7622': { lat: 46.072, lon: 18.232 }, // Pécs
  '7625': { lat: 46.072, lon: 18.232 }, // Pécs
  '7632': { lat: 46.072, lon: 18.232 }, // Pécs
  '7634': { lat: 46.072, lon: 18.232 }, // Pécs
  '7700': { lat: 45.992, lon: 18.683 }, // Mohács

  // Közép- és Nyugat-Dunántúl
  '8000': { lat: 47.189, lon: 18.410 }, // Székesfehérvár
  '8096': { lat: 47.242, lon: 18.601 }, // Sukoró (Velencei-tó)
  '8200': { lat: 47.093, lon: 17.913 }, // Veszprém
  '8229': { lat: 46.978, lon: 17.925 }, // Csopak
  '8248': { lat: 47.058, lon: 17.887 }, // Nemesvámos
  '8300': { lat: 46.882, lon: 17.441 }, // Tapolca
  '8360': { lat: 46.768, lon: 17.244 }, // Keszthely
  '8371': { lat: 46.797, lon: 17.228 }, // Cserszegtomaj
  '8500': { lat: 47.330, lon: 17.466 }, // Pápa
  '8600': { lat: 46.904, lon: 18.058 }, // Siófok
  '8651': { lat: 46.938, lon: 18.125 }, // Balatonszabadisóstó
  '8709': { lat: 46.584, lon: 17.411 }, // Marcali
  '8800': { lat: 46.453, lon: 16.991 }, // Nagykanizsa
  '8900': { lat: 46.841, lon: 16.843 }, // Zalaegerszeg
  '9024': { lat: 47.687, lon: 17.650 }, // Győr
  '9028': { lat: 47.687, lon: 17.650 }, // Győr
  '9200': { lat: 47.868, lon: 17.269 }, // Mosonmagyaróvár
  '9400': { lat: 47.685, lon: 16.583 }, // Sopron
  '9435': { lat: 47.662, lon: 16.858 }, // Sarród
  '9600': { lat: 47.253, lon: 16.937 }, // Sárvár
  '9700': { lat: 47.230, lon: 16.621 }, // Szombathely
  '9941': { lat: 46.840, lon: 16.417 }, // Őriszentpéter
};

// Vármegyei központok koordinátái végső tartaléknak
const COUNTY_CENTER_COORDS: Record<string, { lat: number; lon: number }> = {
  'Budapest': { lat: 47.498, lon: 19.040 },
  'Pest': { lat: 47.550, lon: 19.150 },
  'Bács-Kiskun': { lat: 46.907, lon: 19.692 },
  'Baranya': { lat: 46.072, lon: 18.232 },
  'Békés': { lat: 46.680, lon: 21.089 },
  'Borsod-Abaúj-Zemplén': { lat: 48.103, lon: 20.778 },
  'Csongrád-Csanád': { lat: 46.253, lon: 20.141 },
  'Fejér': { lat: 47.189, lon: 18.410 },
  'Győr-Moson-Sopron': { lat: 47.687, lon: 17.650 },
  'Hajdú-Bihar': { lat: 47.531, lon: 21.627 },
  'Heves': { lat: 47.902, lon: 20.377 },
  'Jász-Nagykun-Szolnok': { lat: 47.175, lon: 20.177 },
  'Komárom-Esztergom': { lat: 47.585, lon: 18.395 },
  'Nógrád': { lat: 48.093, lon: 19.803 },
  'Somogy': { lat: 46.359, lon: 17.796 },
  'Szabolcs-Szatmár-Bereg': { lat: 47.955, lon: 21.716 },
  'Tolna': { lat: 46.353, lon: 18.706 },
  'Vas': { lat: 47.230, lon: 16.621 },
  'Veszprém': { lat: 47.093, lon: 17.913 },
  'Zala': { lat: 46.841, lon: 16.843 },
};

/**
 * Meghatározza egy szervezet GPS koordinátáit az adatai alapján
 */
export function getOrgCoordinates(org: Organization): { lat: number; lon: number } | null {
  // 1. Ha már van beállított koordináta
  if (typeof org.lat === 'number' && typeof org.lon === 'number') {
    return { lat: org.lat, lon: org.lon };
  }

  const address = (org.cim || '').trim();

  // 2. Irányítószám keresése a címben (pl. "1024", "6724")
  const zipMatch = address.match(/\b([1-9][0-9]{3})\b/);
  if (zipMatch) {
    const zip = zipMatch[1];

    // Budapest esetén a 2. és 3. számjegy a kerület (101x - 123x)
    if (zip.startsWith('1')) {
      const districtNum = parseInt(zip.substring(1, 3), 10);
      if (districtNum >= 1 && districtNum <= 23 && BUDAPEST_DISTRICT_COORDS[districtNum]) {
        return BUDAPEST_DISTRICT_COORDS[districtNum];
      }
      return BUDAPEST_DISTRICT_COORDS[5]; // Belváros alapértelmezett
    }

    // Vidéki irányítószám
    if (HUNGARY_ZIP_COORDS[zip]) {
      return HUNGARY_ZIP_COORDS[zip];
    }
  }

  // 3. Település név keresése a cím elején
  for (const [zip, coords] of Object.entries(HUNGARY_ZIP_COORDS)) {
    // Ha a cím tartalmazza a várost
    const zipCode = zip;
    if (address.includes(zipCode)) {
      return coords;
    }
  }

  // 4. Vármegye központ fallback
  if (org.megye && COUNTY_CENTER_COORDS[org.megye]) {
    return COUNTY_CENTER_COORDS[org.megye];
  }

  if (address.toLowerCase().includes('budapest')) {
    return BUDAPEST_DISTRICT_COORDS[5];
  }

  return null;
}
