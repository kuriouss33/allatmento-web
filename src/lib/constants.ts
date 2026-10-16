import { FirstAidGuideItem } from '@/types';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://allatmento-backend.onrender.com/api';

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "allatmento-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "allatmento-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "allatmento-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

export const MEGYEK = [
  "Budapest",
  "Pest",
  "Bács-Kiskun",
  "Baranya",
  "Békés",
  "Borsod-Abaúj-Zemplén",
  "Csongrád-Csanád",
  "Fejér",
  "Győr-Moson-Sopron",
  "Hajdú-Bihar",
  "Heves",
  "Jász-Nagykun-Szolnok",
  "Komárom-Esztergom",
  "Nógrád",
  "Somogy",
  "Szabolcs-Szatmár-Bereg",
  "Tolna",
  "Vas",
  "Veszprém",
  "Zala"
];

export const CHIP_DATABASES = [
  { name: 'PetVetData (Magyar Állatorvosi Kamara)', url: 'https://www.petvetdata.hu/' },
  { name: 'Europetnet (Európai Központi Adatbázis)', url: 'https://www.europetnet.org/' },
  { name: 'Petmaxx (Nemzetközi Keresőrendszer)', url: 'https://www.petmaxx.com/' }
];

export const FIRST_AID_GUIDES: FirstAidGuideItem[] = [
  {
    id: 'g1',
    cim: 'Sérült, gázolt kutya vagy macska',
    kategoria: 'kutya',
    leiras: [
      'Mindig a saját biztonságod az első! A fájdalomtól sokkos állat még a gazdáját is megmarhatja.',
      'Óvatosan közelítsd meg, beszélj hozzá nyugodt, mély hangon.',
      'Soha ne adj emberi fájdalomcsillapítót (pl. Algopyrin, Paracetamol, Ibuprofen halálos méreg a kutyáknak és cicáknak)!',
      'Pokróccal vagy kabáttal emeld meg óvatosan, a gerinc mozdulatlanul tartásával, és azonnal szállítsd ügyeletes orvoshoz.'
    ],
    figyelmeztetes: 'Erős vérzés esetén alkalmazz nyomókötést tiszta ruhával a seb közvetlen felületén.'
  },
  {
    id: 'g2',
    cim: 'Sérült vadállat (őz, szarvas, vaddisznó)',
    kategoria: 'vad',
    leiras: [
      'Vadállathoz soha ne nyúlj puszta kézzel! A sarokba szorított vagy sérült vad súlyos sérülést okozhat.',
      'Tartsd a biztonságos távolságot (legalább 15-20 méter), és akadályozd meg, hogy a forgalomba szaladjon.',
      'Közúti gázolás esetén azonnal hívd a 112-es segélyhívót, akik értesítik az illetékes vadásztársaságot és a rendőrséget.'
    ]
  },
  {
    id: 'g3',
    cim: 'Fióka vagy sérült madár mentése',
    kategoria: 'madar',
    leiras: [
      'Ha a fióka tollas és ugrál a földön, a legtöbb esetben NEM árvult el! A szülei a közelben figyelik és etetik.',
      'Csak akkor avatkozz be, ha csupasz/pelyhes a fióka, közvetlen macska/kutya veszélynek van kitéve, vagy láthatóan vérzik, lóg a szárnya.',
      'Karton dobozba helyezd, lyukakkal ellátva, sötét, csendes helyre, majd értesíts madármentő szervezetet.'
    ]
  },
  {
    id: 'g4',
    cim: 'Hőguta tünetei és azonnali teendők',
    kategoria: 'altalanos',
    leiras: [
      'Tünetek: Zihálás, sűrű nyáladzás, vörös íny, üveges tekintet, tántorgás, ájulás.',
      'Azonnal vidd árnyékba vagy hűvös, szellős helyre!',
      'Hűtsd LANGYOS (nem jéghideg!) vízzel a mancsait, hasát és nyakát. A jéghideg víz érszűkületet és sokkot okoz!',
      'Kínálj fel friss vizet, de ne erőltesd a lenyelését, és azonnal irány a legközelebbi állatorvos.'
    ]
  },
  {
    id: 'g5',
    cim: 'Mérgezés gyanúja',
    kategoria: 'altalanos',
    leiras: [
      'Tünetek: Hirtelen hányás, hasmenés, görcsök, habzó száj, vérzés az orrból vagy székletből, levertség.',
      'NE próbáld otthon meghánytatni orvosi utasítás nélkül (maró anyag esetén szétégeti a nyelőcsövet)!',
      'Ha tudod, mit evett meg, vidd magaddal a csomagolást vagy a minta fotóját az állatorvoshoz.',
      'Azonnal indulj a legközelebbi nyitva tartó állatkórházba – minden perc számít!'
    ]
  }
];
