/**
 * Segédfüggvények és ISO 11784/11785 mikrochip azonosító elemző
 * Állatmentő App - Chipszám Kereső
 */

export type ChipOriginType = 'hungarian' | 'manufacturer' | 'foreign' | 'unknown';

export interface ChipAnalysisResult {
  cleanNumber: string;
  isValidLength: boolean;
  prefix: string;
  originType: ChipOriginType;
  title: string;
  flag: string;
  description: string;
  recommendedDb: 'petvetdata' | 'europetnet' | 'petmaxx';
  countryOrManufacturerName?: string;
}

export interface ChipDatabaseItem {
  id: 'petvetdata' | 'europetnet' | 'petmaxx';
  name: string;
  badgeHu: string;
  badgeEn: string;
  badgeColor: 'emerald' | 'blue' | 'indigo';
  descHu: string;
  descEn: string;
  url: string;
}

export const EXTENDED_CHIP_DATABASES: ChipDatabaseItem[] = [
  {
    id: 'petvetdata',
    name: 'PetVetData',
    badgeHu: 'Magyarország (MÁOK)',
    badgeEn: 'Hungary (MÁOK)',
    badgeColor: 'emerald',
    descHu: 'A Magyar Állatorvosi Kamara hivatalos nyilvántartása',
    descEn: 'Official registry of the Hungarian Veterinary Chamber',
    url: 'https://www.petvetdata.hu/'
  },
  {
    id: 'europetnet',
    name: 'Europetnet',
    badgeHu: 'Európa (EPN)',
    badgeEn: 'Europe (EPN)',
    badgeColor: 'blue',
    descHu: 'Európai központi kereső (38 tagország adatbázisával)',
    descEn: 'Central European search network (38 member registries)',
    url: 'https://www.europetnet.org/'
  },
  {
    id: 'petmaxx',
    name: 'Petmaxx',
    badgeHu: 'Globális',
    badgeEn: 'Global',
    badgeColor: 'indigo',
    descHu: 'Nemzetközi mikrochip keresőrendszer világszerte',
    descEn: 'Global international microchip search engine',
    url: 'https://www.petmaxx.com/'
  }
];

// ISO 3166-1 numerikus országkódok (3 számjegy)
const COUNTRY_CODES: Record<string, { hu: string; en: string; flag: string; db: 'petvetdata' | 'europetnet' | 'petmaxx' }> = {
  '348': { hu: 'Magyarország', en: 'Hungary', flag: '🇭🇺', db: 'petvetdata' },
  '040': { hu: 'Ausztria', en: 'Austria', flag: '🇦🇹', db: 'europetnet' },
  '703': { hu: 'Szlovákia', en: 'Slovakia', flag: '🇸🇰', db: 'europetnet' },
  '642': { hu: 'Románia', en: 'Romania', flag: '🇷🇴', db: 'europetnet' },
  '804': { hu: 'Ukrajna', en: 'Ukraine', flag: '🇺🇦', db: 'europetnet' },
  '688': { hu: 'Szerbia', en: 'Serbia', flag: '🇷🇸', db: 'petmaxx' },
  '191': { hu: 'Horvátország', en: 'Croatia', flag: '🇭🇷', db: 'europetnet' },
  '705': { hu: 'Szlovénia', en: 'Slovenia', flag: '🇸🇮', db: 'europetnet' },
  '276': { hu: 'Németország', en: 'Germany', flag: '🇩🇪', db: 'europetnet' },
  '616': { hu: 'Lengyelország', en: 'Poland', flag: '🇵🇱', db: 'europetnet' },
  '203': { hu: 'Csehország', en: 'Czech Republic', flag: '🇨🇿', db: 'europetnet' },
  '380': { hu: 'Olaszország', en: 'Italy', flag: '🇮🇹', db: 'europetnet' },
  '250': { hu: 'Franciaország', en: 'France', flag: '🇫🇷', db: 'europetnet' },
  '724': { hu: 'Spanyolország', en: 'Spain', flag: '🇪🇸', db: 'europetnet' },
  '826': { hu: 'Egyesült Királyság', en: 'United Kingdom', flag: '🇬🇧', db: 'petmaxx' },
  '528': { hu: 'Hollandia', en: 'Netherlands', flag: '🇳🇱', db: 'europetnet' },
  '056': { hu: 'Belgium', en: 'Belgium', flag: '🇧🇪', db: 'europetnet' },
  '756': { hu: 'Svájc', en: 'Switzerland', flag: '🇨🇭', db: 'europetnet' },
  '752': { hu: 'Svédország', en: 'Sweden', flag: '🇸🇪', db: 'europetnet' },
  '578': { hu: 'Norvégia', en: 'Norway', flag: '🇳🇴', db: 'europetnet' },
  '246': { hu: 'Finnország', en: 'Finland', flag: '🇫🇮', db: 'europetnet' },
  '208': { hu: 'Dánia', en: 'Denmark', flag: '🇩🇰', db: 'europetnet' },
  '372': { hu: 'Írország', en: 'Ireland', flag: '🇮🇪', db: 'europetnet' },
  '620': { hu: 'Portugália', en: 'Portugal', flag: '🇵🇹', db: 'europetnet' },
  '300': { hu: 'Görögország', en: 'Greece', flag: '🇬🇷', db: 'europetnet' },
  '100': { hu: 'Bulgária', en: 'Bulgaria', flag: '🇧🇬', db: 'europetnet' },
  '840': { hu: 'Egyesült Államok', en: 'United States', flag: '🇺🇸', db: 'petmaxx' },
  '124': { hu: 'Kanada', en: 'Canada', flag: '🇨🇦', db: 'petmaxx' },
  '036': { hu: 'Ausztrália', en: 'Australia', flag: '🇦🇺', db: 'petmaxx' },
  '792': { hu: 'Törökország', en: 'Turkey', flag: '🇹🇷', db: 'petmaxx' },
  '498': { hu: 'Moldova', en: 'Moldova', flag: '🇲🇩', db: 'europetnet' },
  '070': { hu: 'Bosznia-Hercegovina', en: 'Bosnia and Herzegovina', flag: '🇧🇦', db: 'petmaxx' },
  '499': { hu: 'Montenegró', en: 'Montenegro', flag: '🇲🇪', db: 'petmaxx' },
  '807': { hu: 'Észak-Macedónia', en: 'North Macedonia', flag: '🇲🇰', db: 'petmaxx' },
  '008': { hu: 'Albánia', en: 'Albania', flag: '🇦🇱', db: 'petmaxx' },
  '440': { hu: 'Litvánia', en: 'Lithuania', flag: '🇱🇹', db: 'europetnet' },
  '428': { hu: 'Lettország', en: 'Latvia', flag: '🇱🇻', db: 'europetnet' },
  '233': { hu: 'Észtország', en: 'Estonia', flag: '🇪🇪', db: 'europetnet' }
};

// Gyakori ICAR gyártói kódok (900-tól 999-ig)
const MANUFACTURER_CODES: Record<string, string> = {
  '900': 'ICAR Megosztott kód',
  '941': 'Félixcan',
  '945': 'Leader Products',
  '953': 'HID Global',
  '956': 'Trovan Ltd',
  '968': 'Trovan',
  '977': 'AEG ID',
  '981': 'Datamars',
  '982': 'Allflex',
  '985': 'Destron Fearing / Digital Angel',
  '990': 'Virbac',
  '991': 'Microchip4Solutions'
};

/**
 * Elemzi a mikrochip számsort (ISO 11784/11785)
 */
export function analyzeChipNumber(rawNumber: string, lang: 'hu' | 'en' = 'hu'): ChipAnalysisResult | null {
  const cleanNumber = rawNumber.replace(/\D/g, '');
  if (cleanNumber.length < 3) {
    return null;
  }

  const prefix = cleanNumber.slice(0, 3);
  const isValidLength = cleanNumber.length === 15;

  // 1. Magyarország (348)
  if (prefix === '348') {
    return {
      cleanNumber,
      isValidLength,
      prefix,
      originType: 'hungarian',
      title: lang === 'hu' ? 'Magyarországi azonosító (ISO 348)' : 'Hungarian National Code (ISO 348)',
      flag: '🇭🇺',
      description:
        lang === 'hu'
          ? 'Magyar regisztráció. Az állat a hazai PetVetData adatbázisban van nyilvántartva.'
          : 'Hungarian registration. The animal is registered in the domestic PetVetData system.',
      recommendedDb: 'petvetdata',
      countryOrManufacturerName: lang === 'hu' ? 'Magyarország' : 'Hungary'
    };
  }

  // 2. Gyártói kódok (900-999)
  const prefixNum = parseInt(prefix, 10);
  if (prefixNum >= 900 && prefixNum <= 999) {
    const mfgName = MANUFACTURER_CODES[prefix] || (lang === 'hu' ? 'ICAR Nemzetközi gyártó' : 'ICAR Manufacturer');
    return {
      cleanNumber,
      isValidLength,
      prefix,
      originType: 'manufacturer',
      title: lang === 'hu' ? `Gyártói azonosító (${prefix} – ${mfgName})` : `Manufacturer Code (${prefix} – ${mfgName})`,
      flag: '🏭',
      description:
        lang === 'hu'
          ? `Nemzetközi gyártói chip (${mfgName}). Magyar beültetés esetén a PetVetData-ban szerepel, de külföldi eredet esetén az Europetnetben is érdemes ellenőrizni.`
          : `International manufacturer chip (${mfgName}). If implanted in Hungary, check PetVetData, or Europetnet if from abroad.`,
      recommendedDb: 'petvetdata',
      countryOrManufacturerName: mfgName
    };
  }

  // 3. Külföldi országkód (Ismert ISO ország)
  if (COUNTRY_CODES[prefix]) {
    const country = COUNTRY_CODES[prefix];
    const countryName = lang === 'hu' ? country.hu : country.en;
    return {
      cleanNumber,
      isValidLength,
      prefix,
      originType: 'foreign',
      title: `${country.flag} ${countryName} (ISO ${prefix})`,
      flag: country.flag,
      description:
        lang === 'hu'
          ? `Külföldi országkód: ${countryName}. Elsődlegesen a nemzetközi Europetnet és Petmaxx rendszerekben érdemes keresni!`
          : `Foreign country code: ${countryName}. Primarily search in Europetnet and Petmaxx international registries!`,
      recommendedDb: country.db,
      countryOrManufacturerName: countryName
    };
  }

  // 4. Egyéb ISO kód
  return {
    cleanNumber,
    isValidLength,
    prefix,
    originType: 'unknown',
    title: lang === 'hu' ? `Nemzetközi ISO ${prefix} kód` : `International ISO ${prefix} Code`,
    flag: '🌍',
    description:
      lang === 'hu'
        ? `Nemzetközi mikrochip azonosító. Ajánlott az Europetnet vagy a Petmaxx rendszerben keresni.`
        : `International microchip identifier. Europetnet or Petmaxx search recommended.`,
    recommendedDb: 'europetnet'
  };
}

/**
 * Vágólapra másolás megbízható fallback-kel
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back to execCommand', err);
  }

  try {
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('execCommand copy failed', err);
  }

  return false;
}

/**
 * Szöveg beolvasása a vágólapról (ha engedélyezett)
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (!text) return null;
      const clean = text.replace(/\D/g, '').slice(0, 15);
      return clean.length > 0 ? clean : null;
    }
  } catch (err) {
    console.warn('navigator.clipboard.readText unavailable or denied', err);
  }
  return null;
}
