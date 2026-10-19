import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { BACKEND_URL } from './constants';
import { TransportJob, TransportStatus, TransportMessage } from '@/types';
import { resolveLocation, calculateDistanceKm } from './transportGeo';

const STORAGE_KEY = 'allatmento_transports_cache';
const DELETED_TRANSPORTS_KEY = 'allatmento_deleted_transports';

export function getDeletedTransportIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_TRANSPORTS_KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

export function addDeletedTransportId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const deleted = getDeletedTransportIds();
    deleted.add(id);
    localStorage.setItem(DELETED_TRANSPORTS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

// Kezdeti valósághű szállítási minták (amennyiben az adatbázis még üres)
export const INITIAL_TRANSPORTS: TransportJob[] = [
  {
    id: 'fuvar-1',
    honnanVaros: 'Debrecen',
    honnanCim: 'Állatmentő Liget Menhely',
    honnanMegye: 'Hajdú-Bihar',
    honnanLat: 47.5316,
    honnanLon: 21.6273,
    hovaVaros: 'Budapest',
    hovaCim: 'Állatorvostudományi Egyetem Klinika',
    hovaMegye: 'Budapest',
    hovaLat: 47.4979,
    hovaLon: 19.0402,
    tavolsagKm: 231,
    cargoType: 'kutya',
    cargoSize: 'kozepes',
    allatNev: 'Barni',
    allatFajta: 'Keverék kutya',
    leiras: 'Csípőműtét utáni kontrollvizsgálatra kell feljuttatni Budapestre. Szelíd, autóban nyugodt kutya.',
    crateRequirement: 'box_szukseges',
    datum: '2026-10-21',
    idosav: 'Délelőtt (09:00 - 11:30)',
    urgency: 'surgos',
    statusz: 'nyitott',
    feladoNev: 'Kovács Andrea (Liget Alapítvány)',
    feladoTelefon: '+36 30 456 7891',
    feladoSzervezet: 'Állatmentő Liget Debrecen',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    messages: [
      {
        id: 'm1',
        senderId: 'felado-1',
        senderName: 'Kovács Andrea',
        text: 'A kutya kísérőpapírjai és oltási könyve a nyakörvére lesz készítve. Hordozóboxra szükség van!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      }
    ]
  },
  {
    id: 'fuvar-2',
    honnanVaros: 'Szeged',
    honnanCim: 'Tappancs Tanya',
    honnanMegye: 'Csongrád-Csanád',
    honnanLat: 46.2530,
    honnanLon: 20.1414,
    hovaVaros: 'Pécs',
    hovaCim: 'Misina Természetvédő Egyesület',
    hovaMegye: 'Baranya',
    hovaLat: 46.0727,
    hovaLon: 18.2323,
    tavolsagKm: 189,
    cargoType: 'macska',
    cargoSize: 'kicsi',
    allatNev: 'Mici és Samu (2 cica)',
    allatFajta: 'Házimacska (kölykök)',
    leiras: 'Ideiglenes befogadóhoz szállítás Pécsre. Saját műanyag boxban utaznak, teljesen szobatiszták.',
    crateRequirement: 'sajat_box_van',
    datum: '2026-10-22',
    idosav: 'Délután (14:00 - 18:00)',
    urgency: 'normal',
    statusz: 'nyitott',
    feladoNev: 'Molnár Gábor',
    feladoTelefon: '+36 20 892 1123',
    feladoSzervezet: 'Tappancs Alapítvány',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'fuvar-3',
    honnanVaros: 'Miskolc',
    honnanCim: 'Miskolci Állategészségügyi Telep',
    honnanMegye: 'Borsod-Abaúj-Zemplén',
    honnanLat: 48.1035,
    honnanLon: 20.7784,
    hovaVaros: 'Eger',
    hovaCim: 'Egri Macska- és Kutyamentők',
    hovaMegye: 'Heves',
    hovaLat: 47.9026,
    hovaLon: 20.3772,
    tavolsagKm: 58,
    cargoType: 'adomany_tap',
    cargoSize: 'csomag',
    allatNev: '8 zsák prémium száraztáp + kötszerek',
    leiras: 'Németországi adománycsomag továbbítása az egri menhely számára. Egy kombi vagy ferdehátú autó csomagtartójában elfér.',
    crateRequirement: 'nem_szukseges',
    datum: '2026-10-23',
    idosav: 'Rugalmas (egész nap)',
    urgency: 'normal',
    statusz: 'nyitott',
    feladoNev: 'Varga Zsolt',
    feladoTelefon: '+36 70 334 5566',
    feladoSzervezet: 'Miskolci Mentőcsapat',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'fuvar-4',
    honnanVaros: 'Győr',
    honnanCim: 'Győri Állatmenhely',
    honnanMegye: 'Győr-Moson-Sopron',
    honnanLat: 47.6875,
    honnanLon: 17.6504,
    hovaVaros: 'Budapest',
    hovaCim: 'Noé Állatotthon Alapítvány (XVII. kerület)',
    hovaMegye: 'Budapest',
    hovaLat: 47.4810,
    hovaLon: 19.2450,
    tavolsagKm: 135,
    cargoType: 'kutya',
    cargoSize: 'nagy',
    allatNev: 'Max (idős labrador)',
    allatFajta: 'Labrador retriever',
    leiras: 'Látássérült idős labrador rehabilitációra és fizioterápiára szállítása a Noé Állatotthonba.',
    crateRequirement: 'nem_szukseges',
    datum: '2026-10-21',
    idosav: 'Pontosan 10:00 órára',
    urgency: 'fix_idopont',
    statusz: 'nyitott',
    feladoNev: 'Szabó Péter',
    feladoTelefon: '+36 30 111 2233',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'fuvar-5',
    honnanVaros: 'Székesfehérvár',
    honnanCim: 'Herosz Állatotthon',
    honnanMegye: 'Fejér',
    honnanLat: 47.1899,
    honnanLon: 18.4103,
    hovaVaros: 'Veszprém',
    hovaCim: 'Veszprémi Állatvédő Egyesület',
    hovaMegye: 'Veszprém',
    hovaLat: 47.0933,
    hovaLon: 17.9133,
    tavolsagKm: 44,
    cargoType: 'macska',
    cargoSize: 'kicsi',
    allatNev: 'Cirmi (kiscica)',
    allatFajta: 'Európai rövidszőrű',
    leiras: 'Sérült kiscica átadása specialistának Veszprémben. Sikeresen megérkezett a fogadó orvoshoz.',
    crateRequirement: 'sajat_box_van',
    datum: '2026-10-20',
    idosav: '13:00 - 15:00',
    urgency: 'surgos',
    statusz: 'megoldva',
    megoldvaAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    feladoNev: 'Tóth Ildikó',
    feladoTelefon: '+36 30 888 9900',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  }
];

// Helyi gyorsítótár kezelése
export function getLocalTransports(): TransportJob[] {
  if (typeof window === 'undefined') return INITIAL_TRANSPORTS;
  const deletedIds = getDeletedTransportIds();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const initial = INITIAL_TRANSPORTS.filter(j => !deletedIds.has(j.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(j => !deletedIds.has(j.id));
    }
    return [];
  } catch {
    return INITIAL_TRANSPORTS.filter(j => !deletedIds.has(j.id));
  }
}

export function saveLocalTransports(jobs: TransportJob[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {}
}

const activeListeners = new Set<(jobs: TransportJob[]) => void>();

export function notifyTransportSubscribers(jobs: TransportJob[]) {
  saveLocalTransports(jobs);
  activeListeners.forEach((listener) => {
    try {
      listener(jobs);
    } catch (e) {
      console.error('Error notifying transport subscriber:', e);
    }
  });
}

/**
 * Valós idejű szállítási feladat feliratkozás (Backend API + Firestore + Local fallback)
 */
export function subscribeTransports(callback: (jobs: TransportJob[]) => void): () => void {
  activeListeners.add(callback);

  // 1. Helyi gyorsítótár azonnali betöltése (0 ms)
  const cached = getLocalTransports();
  callback(cached);

  // 2. Adatbázis szinkronizáció a Backend REST API-n keresztül (garantáltan működik Firestore admin jogokkal)
  fetch(`${BACKEND_URL}/transports`)
    .then((res) => res.json())
    .then((resData) => {
      if (resData?.success && Array.isArray(resData.transports)) {
        const deletedIds = getDeletedTransportIds();
        const valid = resData.transports.filter((j: any) => !deletedIds.has(j.id));
        notifyTransportSubscribers(valid);
      }
    })
    .catch((err) => {
      console.warn('Backend GET /transports figyelmeztetés:', err);
    });

  // 3. Valós idejű Firestore onSnapshot figyelő
  let unsubscribeFirestore = () => {};

  if (db) {
    try {
      const colRef = collection(db, 'transports');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const deletedIds = getDeletedTransportIds();
          if (!snapshot.empty) {
            const list: TransportJob[] = [];
            snapshot.forEach((docSnap) => {
              if (deletedIds.has(docSnap.id)) return;
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
              } as TransportJob);
            });
            notifyTransportSubscribers(list);
          }
        },
        (err) => {
          console.warn('Firestore transports subscription fallback to local cache:', err);
          notifyTransportSubscribers(getLocalTransports());
        }
      );
    } catch (err) {
      console.warn('Error setting up Firestore transport listener:', err);
    }
  }

  return () => {
    activeListeners.delete(callback);
    unsubscribeFirestore();
  };
}

/**
 * Új fuvarozási igény feladása
 */
export async function createTransport(data: {
  honnanVaros: string;
  honnanCim?: string;
  honnanMegye?: string;
  hovaVaros: string;
  hovaCim?: string;
  hovaMegye?: string;
  cargoType: TransportJob['cargoType'];
  cargoSize: TransportJob['cargoSize'];
  allatNev?: string;
  allatFajta?: string;
  leiras: string;
  crateRequirement: TransportJob['crateRequirement'];
  datum: string;
  idosav?: string;
  urgency: TransportJob['urgency'];
  feladoNev: string;
  feladoTelefon?: string;
  feladoEmail?: string;
  feladoSzervezet?: string;
  feladoUserId?: string;
  consentGiven?: boolean;
}): Promise<string> {
  const fromGeo = resolveLocation(data.honnanVaros, data.honnanMegye);
  const toGeo = resolveLocation(data.hovaVaros, data.hovaMegye);
  const tavolsagKm = calculateDistanceKm(fromGeo.lat, fromGeo.lon, toGeo.lat, toGeo.lon);

  const newId = `fuvar-${Date.now()}`;
  const newJob: TransportJob = {
    id: newId,
    honnanVaros: data.honnanVaros,
    honnanCim: data.honnanCim,
    honnanMegye: fromGeo.county,
    honnanLat: fromGeo.lat,
    honnanLon: fromGeo.lon,
    hovaVaros: data.hovaVaros,
    hovaCim: data.hovaCim,
    hovaMegye: toGeo.county,
    hovaLat: toGeo.lat,
    hovaLon: toGeo.lon,
    tavolsagKm,
    cargoType: data.cargoType,
    cargoSize: data.cargoSize,
    allatNev: data.allatNev,
    allatFajta: data.allatFajta,
    leiras: data.leiras,
    crateRequirement: data.crateRequirement,
    datum: data.datum,
    idosav: data.idosav,
    urgency: data.urgency,
    statusz: 'nyitott',
    feladoNev: data.feladoNev,
    feladoTelefon: data.feladoTelefon || undefined,
    feladoEmail: data.feladoEmail || undefined,
    feladoSzervezet: data.feladoSzervezet,
    feladoUserId: data.feladoUserId,
    consentGiven: Boolean(data.consentGiven),
    createdAt: new Date().toISOString(),
    messages: []
  };

  // Frissítjük a helyi tárat azonnal és értesítjük a feliratkozókat
  const current = getLocalTransports();
  const updated = [newJob, ...current];
  notifyTransportSubscribers(updated);

  // 1. Mentés Backend API-n keresztül (garantált Firebase Admin SDK perzisztencia az adatbázisban)
  try {
    await fetch(`${BACKEND_URL}/transports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });
  } catch (err) {
    console.warn('Backend POST /transports hiba:', err);
  }

  // 2. Felhőbe mentés Firestore kliensen
  if (db) {
    try {
      const docRef = doc(db, 'transports', newId);
      const cleanData = Object.fromEntries(
        Object.entries(newJob).filter(([_, v]) => v !== undefined)
      );
      await setDoc(docRef, {
        ...cleanData,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore create transport failed, kept locally:', err);
    }
  }

  return newId;
}

/**
 * Fuvar státusz frissítése (pl. Nyitott <-> Megoldva)
 */
export async function updateTransportStatus(
  id: string,
  newStatus: TransportStatus,
  driverInfo?: {
    driverId: string;
    driverName: string;
    driverPhone?: string;
  }
): Promise<void> {
  const current = getLocalTransports();
  const index = current.findIndex((j) => j.id === id);

  if (index !== -1) {
    const isSolved = newStatus === 'megoldva' || newStatus === 'teljesitve';
    const updatedJob: TransportJob = {
      ...current[index],
      statusz: newStatus,
      updatedAt: new Date().toISOString(),
      ...(isSolved ? { megoldvaAt: new Date().toISOString() } : { megoldvaAt: undefined }),
      ...(driverInfo ? {
        driverId: driverInfo.driverId,
        driverName: driverInfo.driverName,
        driverPhone: driverInfo.driverPhone || current[index].driverPhone,
        elvallalvaAt: current[index].elvallalvaAt || new Date().toISOString()
      } : {})
    };

    current[index] = updatedJob;
    notifyTransportSubscribers([...current]);
  }

  // 1. Backend REST API hívás (garantált Admin SDK frissítés)
  try {
    await fetch(`${BACKEND_URL}/transports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusz: newStatus })
    });
  } catch (err) {
    console.warn('Backend PATCH /transports/:id/status hiba:', err);
  }

  // 2. Firestore kliens frissítés
  if (db) {
    try {
      const docRef = doc(db, 'transports', id);
      const isSolved = newStatus === 'megoldva' || newStatus === 'teljesitve';
      const updateData: any = {
        statusz: newStatus,
        updatedAt: serverTimestamp(),
        megoldvaAt: isSolved ? serverTimestamp() : null
      };
      if (driverInfo) {
        updateData.driverId = driverInfo.driverId;
        updateData.driverName = driverInfo.driverName;
        if (driverInfo.driverPhone) updateData.driverPhone = driverInfo.driverPhone;
        updateData.elvallalvaAt = serverTimestamp();
      }
      await setDoc(docRef, updateData, { merge: true });
    } catch (err) {
      console.warn('Firestore updateTransportStatus error, kept locally:', err);
    }
  }
}

/**
 * Belső egyeztető üzenet hozzáadása
 */
export async function addTransportMessage(
  id: string,
  message: {
    senderId: string;
    senderName: string;
    text: string;
    isDriver?: boolean;
  }
): Promise<void> {
  const newMsg: TransportMessage = {
    id: `msg-${Date.now()}`,
    senderId: message.senderId,
    senderName: message.senderName,
    text: message.text,
    createdAt: new Date().toISOString(),
    isDriver: message.isDriver
  };

  const current = getLocalTransports();
  const index = current.findIndex((j) => j.id === id);
  if (index !== -1) {
    const msgs = current[index].messages || [];
    current[index] = {
      ...current[index],
      messages: [...msgs, newMsg],
      updatedAt: new Date().toISOString()
    };
    notifyTransportSubscribers([...current]);
  }

  if (db) {
    try {
      const docRef = doc(db, 'transports', id);
      await setDoc(docRef, {
        messages: arrayUnion(newMsg),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore addTransportMessage error:', err);
    }
  }
}

/**
 * Fuvar törlése (kizárólag super_admin vagy a hirdetés feladója számára)
 */
export async function deleteTransport(id: string, idToken?: string | null): Promise<void> {
  // 1. Megjegyezzük a törölt azonosítót, hogy se helyi tároló, se mock lista ne élessze újra
  addDeletedTransportId(id);

  // 2. Azonnali helyi optimista törlés
  const current = getLocalTransports();
  const updated = current.filter((j) => j.id !== id);
  notifyTransportSubscribers(updated);

  // 3. Token beszerzése a jogosult törléshez
  let token = idToken;
  if (!token && auth?.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch {}
  }

  // 4. Elsődleges végleges törlés a Backend REST API-n keresztül (Firebase Admin SDK)
  if (token) {
    try {
      const res = await fetch(`${BACKEND_URL}/transports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Backend DELETE /transports/:id hiba:', errJson);
      }
    } catch (err) {
      console.warn('Backend DELETE /transports/:id hálózati hiba:', err);
    }
  }

  // 5. Másodlagos közvetlen törlés Firestore Client SDK-n keresztül
  if (db) {
    try {
      const docRef = doc(db, 'transports', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteTransport error:', err);
    }
  }
}
