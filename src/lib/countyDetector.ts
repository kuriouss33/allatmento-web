import { MEGYEK } from './constants';

export interface AddressDetails {
  county?: string;
  state?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  borough?: string;
  postcode?: string;
  country?: string;
}

/**
 * Irányítószám alapján megye beazonosítása Magyarországon
 */
export function getCountyFromPostalCode(postalCodeStr: string): string | null {
  const code = parseInt(postalCodeStr, 10);
  if (isNaN(code) || code < 1000 || code > 9999) return null;

  // 1xxx - Budapest
  if (code >= 1011 && code <= 1239) return 'Budapest';

  // 2xxx
  if (code >= 2000 && code <= 2399) return 'Pest';
  if (code >= 2400 && code <= 2499) return 'Fejér';
  if (code >= 2500 && code <= 2599) return 'Komárom-Esztergom';
  if (code >= 2600 && code <= 2799) return 'Pest';
  if (code >= 2800 && code <= 2999) return 'Komárom-Esztergom';

  // 3xxx
  if (code >= 3000 && code <= 3199) return 'Nógrád';
  if (code >= 3200 && code <= 3399) return 'Heves';
  if (code >= 3400 && code <= 3999) return 'Borsod-Abaúj-Zemplén';

  // 4xxx
  if (code >= 4000 && code <= 4299) return 'Hajdú-Bihar';
  if (code >= 4300 && code <= 4999) return 'Szabolcs-Szatmár-Bereg';

  // 5xxx
  if (code >= 5000 && code <= 5499) return 'Jász-Nagykun-Szolnok';
  if (code >= 5500 && code <= 5999) return 'Békés';

  // 6xxx
  if (code >= 6000 && code <= 6599) return 'Bács-Kiskun';
  if (code >= 6600 && code <= 6999) return 'Csongrád-Csanád';

  // 7xxx
  if (code >= 7000 && code <= 7299) return 'Tolna';
  if (code >= 7300 && code <= 7999) return 'Baranya';

  // 8xxx
  if (code >= 8000 && code <= 8159) return 'Fejér';
  if (code >= 8160 && code <= 8599) return 'Veszprém';
  if (code >= 8600 && code <= 8739) return 'Somogy';
  if (code === 8740) return 'Zala';
  if (code >= 8741 && code <= 8799) return 'Somogy';
  if (code >= 8800 && code <= 8999) return 'Zala';

  // 9xxx
  if (code >= 9000 && code <= 9499) return 'Győr-Moson-Sopron';
  if (code >= 9500 && code <= 9999) return 'Vas';

  return null;
}

/**
 * Gyakori magyar települések megye párosítása (ha a Nominatim vagy cím csak a település nevét adja meg)
 */
const CITY_TO_COUNTY: Record<string, string> = {
  // Budapest
  budapest: 'Budapest',

  // Pest megye városai
  erd: 'Pest', érd: 'Pest',
  dunakeszi: 'Pest',
  budaors: 'Pest', budaörs: 'Pest',
  szentendre: 'Pest',
  godollo: 'Pest', gödöllő: 'Pest',
  vac: 'Pest', vác: 'Pest',
  cegled: 'Pest', cegléd: 'Pest',
  szigetszentmiklos: 'Pest', szigetszentmiklós: 'Pest',
  dunaharaszti: 'Pest',
  vecses: 'Pest', vecsés: 'Pest',
  fot: 'Pest', fót: 'Pest',
  gyal: 'Pest', gyál: 'Pest',
  monor: 'Pest',
  nagykata: 'Pest', nagykáta: 'Pest',
  pilisvorosvar: 'Pest', pilisvörösvár: 'Pest',
  szob: 'Pest',

  // Megyeszékhelyek és nagyobb városok
  debrecen: 'Hajdú-Bihar',
  szeged: 'Csongrád-Csanád',
  miskolc: 'Borsod-Abaúj-Zemplén',
  pecs: 'Baranya', pécs: 'Baranya',
  gyor: 'Győr-Moson-Sopron', győr: 'Győr-Moson-Sopron',
  nyiregyhaza: 'Szabolcs-Szatmár-Bereg', nyíregyháza: 'Szabolcs-Szatmár-Bereg',
  kecskemet: 'Bács-Kiskun', kecskemét: 'Bács-Kiskun',
  szekesfehervar: 'Fejér', székesfehérvár: 'Fejér',
  szombathely: 'Vas',
  szolnok: 'Jász-Nagykun-Szolnok',
  tatabanya: 'Komárom-Esztergom', tatabánya: 'Komárom-Esztergom',
  kaposvar: 'Somogy', kaposvár: 'Somogy',
  bekescsaba: 'Békés', békéscsaba: 'Békés',
  zalaegerszeg: 'Zala',
  veszprem: 'Veszprém', veszprém: 'Veszprém',
  eger: 'Heves',
  salgotarjan: 'Nógrád', salgótarján: 'Nógrád',
  szekszard: 'Tolna', szekszárd: 'Tolna',

  // Egyéb nagyobb városok
  sopron: 'Győr-Moson-Sopron',
  nagykanizsa: 'Zala',
  dunaujvaros: 'Fejér', dunaújváros: 'Fejér',
  hodmezovasarhely: 'Csongrád-Csanád', hódmezővásárhely: 'Csongrád-Csanád',
  baja: 'Bács-Kiskun',
  ozd: 'Borsod-Abaúj-Zemplén', ózd: 'Borsod-Abaúj-Zemplén',
  siofok: 'Somogy', siófok: 'Somogy',
  gyula: 'Békés',
  esztergom: 'Komárom-Esztergom',
  papa: 'Veszprém', pápa: 'Veszprém',
  gyongyos: 'Heves', gyöngyös: 'Heves',
  kazincbarcika: 'Borsod-Abaúj-Zemplén',
  oroshaza: 'Békés', orosháza: 'Békés',
  jaszbereny: 'Jász-Nagykun-Szolnok', jászberény: 'Jász-Nagykun-Szolnok',
  szentes: 'Csongrád-Csanád',
  kiskunfelegyhaza: 'Bács-Kiskun', kiskunfélegyháza: 'Bács-Kiskun',
  hajduboszormeny: 'Hajdú-Bihar', hajdúböszörmény: 'Hajdú-Bihar',
  hajduszoboszlo: 'Hajdú-Bihar', hajdúszoboszló: 'Hajdú-Bihar',
  mor: 'Fejér', mór: 'Fejér',
  keszthely: 'Zala',
  balatonfured: 'Veszprém', balatonfüred: 'Veszprém',
  balatonlelle: 'Somogy',
  balatonboglar: 'Somogy', balatonboglár: 'Somogy',
};

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Automatikusan beazonosítja a megyét az elérhető cím és Nominatim adatok alapján.
 */
export function detectCounty(
  addressDetails?: AddressDetails | null,
  fullAddress?: string | null
): string {
  // 1. Nominatim county vagy state mező vizsgálata
  const rawCounty = addressDetails?.county || addressDetails?.state || '';
  if (rawCounty) {
    const normRaw = normalizeStr(rawCounty);
    for (const m of MEGYEK) {
      const normM = normalizeStr(m);
      if (normRaw.includes(normM)) {
        return m;
      }
    }
  }

  // 2. Ha Budapest város/kerület szerepel benne
  const city = addressDetails?.city || addressDetails?.town || addressDetails?.village || addressDetails?.suburb || '';
  if (normalizeStr(city).includes('budapest')) {
    return 'Budapest';
  }

  // 3. Irányítószám vizsgálata (címrészletből vagy addressDetails-ből)
  const postcode = addressDetails?.postcode;
  if (postcode) {
    const fromPostcode = getCountyFromPostalCode(postcode);
    if (fromPostcode) return fromPostcode;
  }

  if (fullAddress) {
    const postcodeMatch = fullAddress.match(/\b([1-9]\d{3})\b/);
    if (postcodeMatch && postcodeMatch[1]) {
      const fromPostcode = getCountyFromPostalCode(postcodeMatch[1]);
      if (fromPostcode) return fromPostcode;
    }
  }

  // 4. Településnév alapján történő egyezés
  if (city) {
    const normCity = normalizeStr(city);
    if (CITY_TO_COUNTY[normCity]) {
      return CITY_TO_COUNTY[normCity];
    }
  }

  // 5. Teljes cím szöveges keresése a megyék és városok alapján
  if (fullAddress) {
    const normAddress = normalizeStr(fullAddress);

    // Kifejezett Budapest keresés
    if (normAddress.includes('budapest')) {
      return 'Budapest';
    }

    // Megyenevek keresése a szövegben
    for (const m of MEGYEK) {
      if (m === 'Budapest') continue;
      const normM = normalizeStr(m);
      // Szóhatárral vagy "megye" / "varmegye" előtt
      const regex = new RegExp(`\\b${normM}\\b`, 'i');
      if (regex.test(normAddress)) {
        return m;
      }
    }

    // Településnevek keresése a cím szövegében
    for (const [cityName, countyName] of Object.entries(CITY_TO_COUNTY)) {
      const regex = new RegExp(`\\b${cityName}\\b`, 'i');
      if (regex.test(normAddress)) {
        return countyName;
      }
    }
  }

  // 6. Alapértelmezett, ha nem sikerült azonosítani
  return 'Budapest';
}
