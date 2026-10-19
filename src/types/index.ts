export type ReportStatus = 'uj' | 'folyamatban' | 'megoldva';

export type UserRole = 'public' | 'verified_rescuer' | 'super_admin';

export type UserStatus = 'pending_approval' | 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportComment {
  id?: string;
  szoveg: string;
  szoveg_en?: string;
  szoveg_hu?: string;
  sourceLang?: string;
  idopont: any;
  szerzoUid: string;
  szerzoEmail?: string;
  szerep?: 'bejelento' | 'mento' | 'admin' | 'erdeklodo';
}

export interface Report {
  id: string;
  fajta: string;
  allatFajta?: string;
  leiras?: string;
  megjegyzes?: string;
  megjegyzes_en?: string;
  megjegyzes_hu?: string;
  sourceLang?: string;
  helyszinLeiras?: string;
  megye?: string;
  cim?: string;
  generalCim?: string;
  telefon?: string;
  bejelentoTelefon?: string;
  statusz: ReportStatus;
  status?: string;
  fotoUrl?: string;
  kepUrl?: string;
  kepek?: string[];
  kepekUrl?: string[];
  megoldasFotoUrl?: string;
  lezarasFotoUrl?: string;
  megoldasLeiras?: string;
  lezarasMegjegyzes?: string;
  lezaras_en?: string;
  lezaras_hu?: string;
  lezaras_sourceLang?: string;
  lat: number | null;
  lon: number | null;
  lng?: number | null;
  pontosLat?: number | null;
  pontosLon?: number | null;
  createrId?: string;
  rescuerId?: string;
  rescuerUid?: string;
  rescuerEmail?: string;
  idopont?: any;
  createdAt?: string;
  deleteToken?: string;
  isExactLocation?: boolean;
  hasPhone?: boolean;
  kommentek?: ReportComment[];
}

export type OrgCategory = 'menhely' | 'mentoszervezet' | 'orvos' | 'hatosag' | 'vad' | string;

export interface Organization {
  id: string;
  nev: string;
  kategoria: OrgCategory;
  megye: string;
  cim?: string;
  telefon?: string;
  email?: string;
  leiras?: string;
  weboldal?: string;
  lat?: number;
  lon?: number;
  distanceKm?: number;
}

export type GuideCategory = 'kutya' | 'macska' | 'madar' | 'kisemlos' | 'vad' | 'hullo' | 'altalanos' | string;

export interface FirstAidGuideItem {
  id: string;
  cim: string;
  cim_en?: string;
  kategoria: GuideCategory;
  leiras: string[];
  leiras_en?: string[];
  figyelmeztetes?: string;
  figyelmeztetes_en?: string;
  surgos?: boolean;
}

// --- FUVARBÖRZE / SZÁLLÍTÁSI TÍPUSOK ---
export type TransportStatus = 'nyitott' | 'megoldva' | 'elvallalva' | 'folyamatban' | 'teljesitve';
export type TransportUrgency = 'normal' | 'surgos' | 'fix_idopont';
export type TransportCargoType = 'kutya' | 'macska' | 'egyeb_allat' | 'adomany_tap';
export type TransportCargoSize = 'kicsi' | 'kozepes' | 'nagy' | 'tobb_allat' | 'csomag';
export type TransportCrateRequirement = 'box_szukseges' | 'sajat_box_van' | 'nem_szukseges';

export interface TransportMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isDriver?: boolean;
}

export interface TransportJob {
  id: string;
  honnanVaros: string;
  honnanCim?: string;
  honnanMegye: string;
  honnanLat: number;
  honnanLon: number;

  hovaVaros: string;
  hovaCim?: string;
  hovaMegye: string;
  hovaLat: number;
  hovaLon: number;

  tavolsagKm?: number;

  cargoType: TransportCargoType;
  cargoSize: TransportCargoSize;
  allatNev?: string;
  allatFajta?: string;
  leiras: string;
  crateRequirement: TransportCrateRequirement;

  datum: string;
  idosav?: string;
  urgency: TransportUrgency;

  statusz: TransportStatus;

  feladoNev: string;
  feladoTelefon?: string;
  feladoEmail?: string;
  feladoSzervezet?: string;
  feladoUserId?: string;
  consentGiven?: boolean;

  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  elvallalvaAt?: string;
  teljesitveAt?: string;
  megoldvaAt?: string;

  messages?: TransportMessage[];

  createdAt: string;
  updatedAt?: string;
}
