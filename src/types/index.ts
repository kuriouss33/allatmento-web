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
  megoldasFotoUrl?: string;
  lezarasFotoUrl?: string;
  megoldasLeiras?: string;
  lezarasMegjegyzes?: string;
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
  telefon: string;
  leiras?: string;
  weboldal?: string;
}

export interface FirstAidGuideItem {
  id: string;
  cim: string;
  kategoria: 'kutya' | 'macska' | 'vad' | 'madar' | 'altalanos';
  leiras: string[];
  figyelmeztetes?: string;
}
