import { calculateDistanceKm, formatDistance } from './geoUtils';

// Magyarország kiemelt városainak és vármegyeszékhelyeinek koordinátái
export const CITY_COORDS: Record<string, { lat: number; lon: number; megye: string }> = {
  'Budapest': { lat: 47.4979, lon: 19.0402, megye: 'Budapest' },
  'Debrecen': { lat: 47.5316, lon: 21.6273, megye: 'Hajdú-Bihar' },
  'Szeged': { lat: 46.2530, lon: 20.1414, megye: 'Csongrád-Csanád' },
  'Miskolc': { lat: 48.1035, lon: 20.7784, megye: 'Borsod-Abaúj-Zemplén' },
  'Pécs': { lat: 46.0727, lon: 18.2323, megye: 'Baranya' },
  'Győr': { lat: 47.6875, lon: 17.6504, megye: 'Győr-Moson-Sopron' },
  'Nyíregyháza': { lat: 47.9554, lon: 21.7167, megye: 'Szabolcs-Szatmár-Bereg' },
  'Kecskemét': { lat: 46.9075, lon: 19.6917, megye: 'Bács-Kiskun' },
  'Székesfehérvár': { lat: 47.1899, lon: 18.4103, megye: 'Fejér' },
  'Szombathely': { lat: 47.2307, lon: 16.6218, megye: 'Vas' },
  'Szolnok': { lat: 47.1750, lon: 20.1770, megye: 'Jász-Nagykun-Szolnok' },
  'Tatabánya': { lat: 47.5850, lon: 18.3950, megye: 'Komárom-Esztergom' },
  'Kaposvár': { lat: 46.3594, lon: 17.7968, megye: 'Somogy' },
  'Békéscsaba': { lat: 46.6806, lon: 21.0894, megye: 'Békés' },
  'Veszprém': { lat: 47.0933, lon: 17.9133, megye: 'Veszprém' },
  'Zalaegerszeg': { lat: 46.8417, lon: 16.8439, megye: 'Zala' },
  'Eger': { lat: 47.9026, lon: 20.3772, megye: 'Heves' },
  'Nagykanizsa': { lat: 46.4535, lon: 16.9910, megye: 'Zala' },
  'Dunaújváros': { lat: 46.9619, lon: 18.9355, megye: 'Fejér' },
  'Hódmezővásárhely': { lat: 46.4304, lon: 20.3204, megye: 'Csongrád-Csanád' },
  'Salgótarján': { lat: 48.0935, lon: 19.8030, megye: 'Nógrád' },
  'Szekszárd': { lat: 46.3537, lon: 18.7061, megye: 'Tolna' },
  'Budaörs': { lat: 47.4621, lon: 18.9530, megye: 'Pest' },
  'Érd': { lat: 47.3800, lon: 18.9180, megye: 'Pest' },
  'Vác': { lat: 47.7760, lon: 19.1360, megye: 'Pest' },
  'Gödöllő': { lat: 47.5970, lon: 19.3550, megye: 'Pest' },
  'Szentendre': { lat: 47.6690, lon: 19.0750, megye: 'Pest' },
  'Dunakeszi': { lat: 47.6320, lon: 19.1410, megye: 'Pest' },
  'Esztergom': { lat: 47.7850, lon: 18.7420, megye: 'Komárom-Esztergom' },
  'Sopron': { lat: 47.6850, lon: 16.5900, megye: 'Győr-Moson-Sopron' },
  'Baja': { lat: 46.1810, lon: 18.9550, megye: 'Bács-Kiskun' },
  'Siófok': { lat: 46.9040, lon: 18.0580, megye: 'Somogy' },
  'Keszthely': { lat: 46.7690, lon: 17.2480, megye: 'Zala' },
  'Gyula': { lat: 46.6460, lon: 21.2770, megye: 'Békés' },
  'Orosháza': { lat: 46.5680, lon: 20.6650, megye: 'Békés' },
  'Szarvas': { lat: 46.8640, lon: 20.5510, megye: 'Békés' },
  'Jászberény': { lat: 47.5020, lon: 19.9140, megye: 'Jász-Nagykun-Szolnok' },
  'Kiskunhalas': { lat: 46.4320, lon: 19.4850, megye: 'Bács-Kiskun' },
  'Cegléd': { lat: 47.1750, lon: 19.7990, megye: 'Pest' }
};

// Vármegye központok koordinátái
export const COUNTY_COORDS: Record<string, { lat: number; lon: number }> = {
  'Budapest': { lat: 47.4979, lon: 19.0402 },
  'Pest': { lat: 47.5000, lon: 19.2000 },
  'Bács-Kiskun': { lat: 46.9075, lon: 19.6917 },
  'Baranya': { lat: 46.0727, lon: 18.2323 },
  'Békés': { lat: 46.6806, lon: 21.0894 },
  'Borsod-Abaúj-Zemplén': { lat: 48.1035, lon: 20.7784 },
  'Csongrád-Csanád': { lat: 46.2530, lon: 20.1414 },
  'Fejér': { lat: 47.1899, lon: 18.4103 },
  'Győr-Moson-Sopron': { lat: 47.6875, lon: 17.6504 },
  'Hajdú-Bihar': { lat: 47.5316, lon: 21.6273 },
  'Heves': { lat: 47.9026, lon: 20.3772 },
  'Jász-Nagykun-Szolnok': { lat: 47.1750, lon: 20.1770 },
  'Komárom-Esztergom': { lat: 47.5850, lon: 18.3950 },
  'Nógrád': { lat: 48.0935, lon: 19.8030 },
  'Somogy': { lat: 46.3594, lon: 17.7968 },
  'Szabolcs-Szatmár-Bereg': { lat: 47.9554, lon: 21.7167 },
  'Tolna': { lat: 46.3537, lon: 18.7061 },
  'Vas': { lat: 47.2307, lon: 16.6218 },
  'Veszprém': { lat: 47.0933, lon: 17.9133 },
  'Zala': { lat: 46.8417, lon: 16.8439 }
};

/**
 * Megpróbálja feloldani egy település vagy cím GPS koordinátáit és megyéjét
 */
export function resolveLocation(input: string, fallbackCounty?: string): { lat: number; lon: number; city: string; county: string } {
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // 1. Ismert városok keresése
  for (const [cityName, data] of Object.entries(CITY_COORDS)) {
    if (lower.includes(cityName.toLowerCase())) {
      return {
        lat: data.lat,
        lon: data.lon,
        city: cityName,
        county: data.megye
      };
    }
  }

  // 2. Vármegye név alapján
  if (fallbackCounty && COUNTY_COORDS[fallbackCounty]) {
    return {
      lat: COUNTY_COORDS[fallbackCounty].lat,
      lon: COUNTY_COORDS[fallbackCounty].lon,
      city: clean || fallbackCounty,
      county: fallbackCounty
    };
  }

  for (const [countyName, coords] of Object.entries(COUNTY_COORDS)) {
    if (lower.includes(countyName.toLowerCase())) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        city: clean,
        county: countyName
      };
    }
  }

  // 3. Budapest alapértelmezett fallback
  return {
    lat: 47.4979,
    lon: 19.0402,
    city: clean || 'Budapest',
    county: fallbackCounty || 'Budapest'
  };
}

export { calculateDistanceKm, formatDistance };
