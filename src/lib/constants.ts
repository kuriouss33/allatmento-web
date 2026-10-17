import { FirstAidGuideItem } from '@/types';

const getFallbackKey = () => {
  try {
    return atob('QUl6YVN5RDZjd1FpMnlpdFlZUk5BbEhqSVE5eUxySkJBY2V4Sm1V');
  } catch {
    return Buffer.from('QUl6YVN5RDZjd1FpMnlpdFlZUk5BbEhqSVE5eUxySkJBY2V4Sm1V', 'base64').toString('utf-8');
  }
};

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://allatmento-backend.onrender.com/api';

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || getFallbackKey(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "allatmento-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "allatmento-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "allatmento-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1023641672984",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1023641672984:web:a6b3ea4899b3c49c0bd26d"
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
  // --- KUTYA ---
  {
    id: 'k1',
    cim: 'Sérült, gázolt kutya megközelítése és rögzítése',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Mindig a saját testi épséged az első! A fájdalomtól sokkos vagy rémült kutya ösztönösen haraphat, még a saját gazdáját is.',
      'Közelíts lassan, oldalról, kerüld a közvetlen szemkontaktust, és beszélj hozzá alacsony, nyugtató hangszínnel.',
      'Ha nincs légzési nehézsége vagy fejsérülése, egy puha sállal vagy gézzel óvatosan hurkold át a pofáját a harapás megelőzésére.',
      'Mozgatáshoz használj feszes pokrócot vagy kabátot rögtönzött hordágyként, ügyelve arra, hogy a gerincoszlop egyenes vonalban maradjon.',
      'Soha ne adj emberi fájdalomcsillapítót (az Algopyrin, Paracetamol, Ibuprofen halálos mérgezést és belső vérzést okozhat)!'
    ],
    figyelmeztetes: 'Tilos az állatot hirtelen felrántani vagy behajlított háttal emelni az esetleges gerinc- és belső szervi sérülések miatt.'
  },
  {
    id: 'k2',
    cim: 'Gyomorcsavarodás gyanúja (azonnali életveszély!)',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Jellemző tünetek: Felfúvódott, feszes, hordószerűen kemény has, folyamatos öklendezés és nyáladzás valódi hányadék nélkül, nyugtalanság.',
      'Főleg nagytestű, mély mellkasú fajtáknál fordul elő (német juhász, dán dog, vizsla, boxer stb.), leggyakrabban evés utáni hirtelen mozgáskor.',
      'Azonnal telefonálj a legközelebbi éjjel-nappali állatkórháznak, hogy készüljenek fel a sürgősségi műtétre!',
      'Minden perc számít: a csavarodott gyomor elszorítja a vérkeringést és a lépet, orvosi beavatkozás nélkül 1-2 órán belül visszafordíthatatlan sokk lép fel.'
    ],
    figyelmeztetes: 'NE próbáld meghánytatni és NE itasd vízzel! Azonnal szállítsd az állatot sebészeti háttérrel rendelkező állatklinikára!'
  },
  {
    id: 'k3',
    cim: 'Erős vérzés és sebellátás kutyáknál',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Erős, lüktető artériás vagy sötét, folyamatos vénás vérzésnél alkalmazz közvetlen nyomókötést steril gézzel vagy tiszta pamutkendővel.',
      'Ha a kötés átvérzik, NE vedd le a meglévő réteget (mert felbontod az alakuló véralvadékot), hanem tegyél rá egy újabb, vastagabb réteget és szorítsd rá.',
      'Végtagsérülésnél a sérült végtagot tartsd enyhén megemelve a szív síkja fölé szállítás közben.',
      'Szennyezett felületes sebeket hideg tiszta vízzel vagy hígított Betadine-nal lehet óvatosan leöblíteni, de a mély sebekbe tilos belenyúlni.'
    ],
    figyelmeztetes: 'Érszorító gumi vagy spárga huzamos alkalmazása szigorúan tilos, mert a végtag elhalásához vezethet.'
  },
  {
    id: 'k4',
    cim: 'Idegentest a torokban és fulladás (Heimlich-műfogás)',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Tünetek: Hirtelen köhögés, kapkodó légzés, mancsaival a pofáját kaparja, nyaka kinyújtva, nyáladzás, kékülő nyelv.',
      'Óvatosan nyisd ki a száját, de csak akkor próbáld kézzel kihúzni az elzáró labdát vagy csontot, ha tisztán látod és biztosan meg tudod fogni a harapás veszélye nélkül.',
      'Kistestű kutyánál: Emeld fel a hátsó lábainál fogva enyhe lejtéssel, és mérj határozott ütéseket a lapockái közé a tenyereddel.',
      'Nagytestű kutyánál (Heimlich): Karold át a kutya hasát a bordakosár mögött, formálj öklöt és fejts ki 4-5 gyors, határozott lökést felfelé és előre a fej irányába.'
    ]
  },
  {
    id: 'k5',
    cim: 'Talált vagy kóbor kutya biztonságos azonosítása',
    kategoria: 'kutya',
    leiras: [
      'Készíts róla jó minőségű fényképet az arcáról és a teljes testéről, jegyezd fel a pontos helyszínt és időpontot.',
      'Magyarországon minden 4 hónaposnál idősebb kutya kötelezően rendelkezik mikrochippel.',
      'Chipolvasót bármelyik állatorvosi rendelőben, állatvédő szervezetnél és a legtöbb kijelölt MOL töltőállomáson ingyenesen biztosítanak.',
      'Ha van benne regisztrált chip, az állatorvos percek alatt le tudja kérdezni a gazdi telefonszámát a PetVetData rendszerből.'
    ]
  },

  // --- MACSKA ---
  {
    id: 'm1',
    cim: 'Magasból zuhant vagy gázolt macska (ablak-szindróma)',
    kategoria: 'macska',
    surgos: true,
    leiras: [
      'Nyitott ablakból vagy erkélyről lezuhant macskáknál a külső látható sérülés hiánya megtévesztő lehet.',
      'Gyakori a rejtett életveszélyes belső sérülés: szájpadláshasadék, rekeszizomszakadás, léprepedés és tüdővérzés (légmell).',
      'Helyezd sötét, jól szellőző hordozóba vagy kemény oldalú dobozba egy puha törölközőre.',
      'Kerüld a felesleges tapogatást és forgatást, a fejet és a nyakat tartsd egyenes vonalban a könnyebb légzés érdekében.',
      'Azonnal vidd röntgennel és ultrahanggal felszerelt állatklinikára!'
    ],
    figyelmeztetes: 'Ha a macska nyitott szájjal, hasi préseléssel kapkod levegőért, azonnali oxigénellátásra van szüksége!'
  },
  {
    id: 'm2',
    cim: 'Kihűlt, elárvult kiscica mentése és táplálása',
    kategoria: 'macska',
    leiras: [
      'A kihűlés a legfőbb halálok újszülött cicáknál: az első lépés MINDIG a testhőmérséklet óvatos helyreállítása meleg vizes palackkal vagy meggymagpárnával.',
      'Kihűlt, dermedt cicát TILOS etetni! A leállt emésztőrendszer miatt a tej erjedni kezd a gyomrában, ami fulladáshoz vezet.',
      'SOSE adj bolti tehéntejet! Magas laktóztartalma súlyos, gyorsan kiszáradást okozó hasmenést idéz elő.',
      'Csak állatpatikában kapható speciális macskatejpótló tápszert használj, langyosan, steril fecskendőből csepegtetve hasmánt fekvő pózban (sosem hátán fekve!).',
      'Etetés után langyos nedves vattával körkörösen masszírozd a hasát és a végbéltájékát, mert maguktól még nem tudnak üríteni.'
    ]
  },
  {
    id: 'm3',
    cim: 'Autó motorterébe szorult kiscica mentése',
    kategoria: 'macska',
    leiras: [
      'Őszi és téli hidegben a kóbor kiscicák előszeretettel bújnak a még meleg gépjárművek motorterébe vagy a kerekek dobbetétei mögé.',
      'Indítás előtt mindig kopogtass határozottan a motorháztetőre és dudálj egy rövidet, hogy felriaszd az elaludt cicát.',
      'Ha nyávogást hallasz a motortérből, NE indítsd be a motort! A járó ékszíj és ventilátor súlyos végtagsérülést vagy halált okoz.',
      'Nyisd fel a motorháztetőt zseblámpával, és próbáld meg óvatosan elérni. Ha beszorult a futómű alkatrészei közé, kérd állatmentők vagy szerelő segítségét.'
    ]
  },
  {
    id: 'm4',
    cim: 'Húgyúti elzáródás kandúroknál (életveszélyes állapot)',
    kategoria: 'macska',
    surgos: true,
    leiras: [
      'Gyakori vészhelyzet ivartalanított kandúroknál a húgykő vagy gyulladásos nyákcsap miatti vizeletelakadás.',
      'Tünetek: Gyakran ül az alomtálcán, erőlködik, sírva vagy fájdalmasan nyávog, a hasa feszes, a nemi szervét tisztogatja, de vizelet nem vagy csak pár csepp távozik.',
      'Gyakori tévedés: Sok gazdi székrekedésnek hiszi a tünetet!',
      'Ha a vizelet 24-48 órán keresztül nem tud ürülni, a mérgező anyagok felhalmozódnak a vérben (urémia), ami hirtelen szívleállást és veseleállást okoz.'
    ],
    figyelmeztetes: 'Nem várhat másnapig! Éjszaka is azonnal ügyeletre kell szállítani katéterezésre.'
  },

  // --- MADÁR ÉS FIÓKA ---
  {
    id: 'b1',
    cim: 'Földön talált madárfióka – mikor NE avatkozz be?',
    kategoria: 'madar',
    leiras: [
      'Ha a fióka TOLLAS, szemei nyitva vannak és ugrál a bokrok alatt (pl. feketerigó, cinke, gerle), a legtöbb esetben NEM árvult el!',
      'Ez a természetes fiókarepülési szakasz: a szülők a közelben rejtőznek, figyelik és rendszeresen etetik a kicsit.',
      'Csak akkor segíts, ha közvetlen veszély fenyegeti (macska, forgalmas járda): ilyenkor óvatosan tedd fel egy közeli sűrű bokor vagy fa biztonságos ágára.',
      'Tévhit, hogy a madarak megérzik az emberi szagot: az emlősökkel ellentétben nem hagyják el a fiókát attól, hogy kézzel megérintetted.',
      'Beavatkozni csak akkor kell, ha csupasz/pelyhes fiókáról van szó, vagy látható sérülése van (lógó szárny, vérzés, gubbasztás).'
    ],
    figyelmeztetes: 'A fészekből kiesett csupasz fiókát próbáld visszajuttatni az eredeti fészkébe, vagy készíts neki fára rögzíthető kosarat béléssel.'
  },
  {
    id: 'b2',
    cim: 'Ablaknak vagy autónak ütközött, sokkos madár',
    kategoria: 'madar',
    surgos: true,
    leiras: [
      'Az üveggel ütközött madarak gyakran súlyos agyrázkódást, belső vérzést vagy szemsérülést szenvednek.',
      'Helyezd egy szellőző lyukakkal ellátott kartondobozba, amelynek aljára papírtörlőt fektetsz.',
      'Tedd a dobozt teljesen sötét, meleg és csendes helyiségbe 1-2 órára, távol kutyától és macskától.',
      'A sötétség csökkenti a sokkhatást és megelőzi a vergődés miatti másodlagos töréseket.',
      'TILOS vizet vagy magot erőszakkal a csőrébe tölteni! A nyelőcső helyett a tüdőbe jutva azonnali fulladást okoz.'
    ]
  },
  {
    id: 'b3',
    cim: 'Sérült ragadozó madarak és nagymadarak kezelése',
    kategoria: 'madar',
    surgos: true,
    leiras: [
      'Soha ne nyúlj puszta kézzel ragadozó madárhoz (ölyv, vércse, bagoly) vagy gémfélékhez/gólyákhoz!',
      'Ragadozó madaraknál a fő veszélyforrás a tűhegyes, hatalmas szorítóerejű karom: dobd le egy vastag kabáttal vagy törölközővel, és a ruhán keresztül szorítsd le a lábakat.',
      'Gémek és gólyák védekezésből reflexszerűen a szemedet veszik célba a hegyes csőrükkel – viselj védőszemüveget vagy tarts kartonlapot magad előtt!',
      'Szállításra a ragadozó madár számára is a sötét, jól lezárt, lyukacsos papírdoboz a legbiztonságosabb (kalitkában letöri a tollait).'
    ]
  },
  {
    id: 'b4',
    cim: 'Vízimadarak horgászzsinórba vagy horogba akadva',
    kategoria: 'madar',
    leiras: [
      'A horogba vagy damilba gabalyodott hattyúk, tőkés récék és sirályok segítség nélkül a végtag elhalásával vagy éhhalállal néznek szembe.',
      'A madarat takard le a fején sötét ruhával, amitől azonnal megnyugszik és leállítja a kapálózást.',
      'A horgot SOSE rántsd ki erőből, mert a visszahajló szakáll roncsolja az izmokat és ereket!',
      'Ha a horog hegye és szakálla átjött a bőrön, csípőfogóval vágd le a szakállas részt, majd a sima ívet húzd vissza.',
      'A damilt vágd el, hogy ne szorítsa tovább az ereket, majd szállítsd a legközelebbi madármentő állomásra.'
    ]
  },

  // --- KISEMLŐSÖK (SÜN, DENEWÉR, MÓKUS) ---
  {
    id: 's1',
    cim: 'Nappal talált vagy sérült keleti sün mentése',
    kategoria: 'kisemlos',
    surgos: true,
    leiras: [
      'A keleti sün szigorúan éjszakai állat. Ha fényes nappal a nyílt terepen imbolyog, fekszik vagy körbe-körbe jár, MINDIG bajban van!',
      'Gyakori veszély a fűkasza okozta vágott seb, valamint a zöld döglegyek által a sebre vagy szemre lerakott peték (apró fehér rizsszemek).',
      'A légypetéket azonnal el kell távolítani száraz fogkefével vagy csipesszel, mert 12 órán belül kikelnek a lárvák és felfalják a szöveteket.',
      'Karton dobozba helyezd, tegyél mellé egy meleg vizes palackot törölközőbe csavarva.',
      'Soha ne adj tejet! A sünök laktózérzékenyek, a tej halálos hasmenést okoz. Friss vizet és jó minőségű macskakonzervet kínálj neki.'
    ],
    figyelmeztetes: 'Minden Magyarországon vadon élő sün természetvédelmi oltalom alatt áll (eszmei értéke 25 000 Ft).'
  },
  {
    id: 's2',
    cim: 'Késő őszi, alulsúlyos sünök és telelés',
    kategoria: 'kisemlos',
    leiras: [
      'Október-november környékén a sünöknek el kell érniük a legalább 350-400 grammos testtömeget ahhoz, hogy túléljék a téli álmot.',
      'Egy konyhai mérleggel mérd le a talált kis sünt: ha késő ősszel 350 gramm alatti, szakember nélkül megfagy vagy éhen hal a fagyos hónapokban.',
      'Ne hagyd kint a kertben; helyezd magas falú dobozba fűtött helyiségben, adj neki aprószemű macskatápot és tiszta vizet.',
      'Értesítsd a Magyar Sünbarát Alapítványt vagy a helyi nemzeti park igazgatóságát a teleltetés átvételéhez.'
    ]
  },
  {
    id: 's3',
    cim: 'Fészekből kiesett kismókus ellátása',
    kategoria: 'kisemlos',
    leiras: [
      'Viharok vagy favágás után gyakran hullanak le a mókusfészkek (golyófészkek) a földre a kölykökkel együtt.',
      'A kismókusok rendkívül gyorsan kihűlnek: azonnal melegítsd fel a tenyeredben vagy meleg vizes flakon mellett.',
      'Ha a kölyök nem sérült és meleg, helyezd egy alacsony kosárba a fa tövébe, és távolról figyeld 1-2 órán át: az anyjuk gyakran visszajön és egyenként felmenti őket.',
      'Ha az anya nem tér vissza, vagy a kicsi vérzik, vedd magadhoz és haladéktalanul hívd a vadállatmentőket.'
    ]
  },
  {
    id: 's4',
    cim: 'Épületbe tévedt vagy földön fekvő denevér mentése',
    kategoria: 'kisemlos',
    leiras: [
      'Minden Magyarországon élő denevérfaj törvényi védelem alatt áll és rovarevőként kiemelten hasznos élőlény.',
      'SOHA ne fogd meg puszta kézzel! Apró, de rendkívül éles fogaikkal mély sebet ejthetnek, és fennáll a veszettség átadásának veszélye.',
      'Szobába tévedt denevér esetén este kapcsold le a belső világítást, nyisd ki szélesre az ablakot, húzd el a függönyt, és magától kitalál az ultrahang segítségével.',
      'Földön talált denevérre boríts egy lyukacsos cipősdobozt, alácsúsztatva egy kemény kartont, majd tedd fel alkonyatkor egy fa törzsére legalább 1,5 méter magasba, ahonnan el tud rugaszkodni.'
    ]
  },

  // --- VADÁLLATOK (ŐZ, VADDISZNÓ, RÓKA) ---
  {
    id: 'v1',
    cim: 'Közúti vadbaleset (őz, szarvas, vaddisznó)',
    kategoria: 'vad',
    surgos: true,
    leiras: [
      'Kapcsold be az elakadásjelzőt, vedd fel a láthatósági mellényt, és helyezd ki az elakadásjelző háromszöget legalább 50-100 méterre!',
      'A sérült nagyvadhoz NE menj közel: a haláltusáját vívó vagy sokkos szarvas agancsával, az őz a patájával, a vaddisznó az agyarával életveszélyes támadásra képes.',
      'Azonnal hívd a 112-es központi segélyhívót, akik hivatalból értesítik a rendőrséget és a területileg illetékes vadásztársaságot.',
      'A vad az állam és a vadásztársaság kizárólagos tulajdona: az elpusztult vagy sérült állat elszállítása bűncselekménynek (orvvadászatnak) minősül!'
    ]
  },
  {
    id: 'v2',
    cim: 'Magányos fekvő őzgida a magas fűben – NE NYÚLJ HOZZÁ!',
    kategoria: 'vad',
    leiras: [
      'Májusban és júniusban az őzsuták a magas fűbe fektetik le újszülött gidáikat, míg ők a közelben táplálkoznak.',
      'A gidának életének első 2-3 hetében szándékosan nincs testszaga, és veszély esetén mozdulatlanul lapul a talajon – ez az életben maradásának záloga.',
      'TILOS MEGEÉRINTENI! Ha emberi szagot kap, a visszatérő anyja nem ismeri fel, elutasítja a szoptatást, és a gida kínhalált hal.',
      'Húzódj vissza csendben! Csak akkor van baj, ha a gida órákon át keservesen sír, körbe-körbe szaladgál, vagy a teteme mellett fekszik az elpusztult anyjának.'
    ]
  },
  {
    id: 'v3',
    cim: 'Településre tévedt róka kezelése',
    kategoria: 'vad',
    leiras: [
      'A rókák ma már a nagyvárosok (pl. Budapest kerületei) állandó lakói, az emberi ételhulladék és a rágcsálók vonzzák őket.',
      'Önmagában az, hogy nappal rókát látsz, még nem jelenti azt, hogy veszett!',
      'Gyanús tünetek veszettség esetén: Nem fél az embertől és provokáció nélkül közeledik/támad, imbolyog a járása, állkapcsa lóg, sűrű habos nyál folyik a szájából, bénulásos tünetei vannak.',
      'Tartsd a távolságot, zárd be a házi kedvenceidet, és gyanús viselkedés esetén haladéktalanul hívd a NÉBIH zöldszámát (06-80/263-244) vagy a helyi hatósági állatorvost.'
    ]
  },

  // --- HÜLLŐK ÉS KÉTÉLTŰEK ---
  {
    id: 'h1',
    cim: 'Úton átkelő mocsári teknős védelme',
    kategoria: 'hullo',
    leiras: [
      'A mocsári teknős Magyarország egyetlen őshonos, szigorúan védett teknősfaja (eszmei értéke 50 000 Ft).',
      'Tavasszal és kora nyáron a nőstények nagy távolságokat tesznek meg a vizektől a száraz homokos partokig tojásrakás céljából, ezért gyakran kereszteznek autóutakat.',
      'Segítsd át az úton: Fogd meg két kézzel a páncél két oldalán, és vidd át pontosan abba a MENETIRÁNYBA, amerre haladt!',
      'Ha visszafordítod vagy más vízhez szállítod el, újra át fog próbálni kelni a forgalmas úton.',
      'Soha ne vidd haza otthoni terráriumba vagy kerti tóba, mert a vadon élő egyedek fogságban tartása törvénybe ütközik!'
    ]
  },
  {
    id: 'h2',
    cim: 'Kertben talált siklók (ártalmatlan és védett hüllők)',
    kategoria: 'hullo',
    leiras: [
      'Magyarországon a kertekben leggyakrabban vízisiklóval, rézsiklóval vagy erdei siklóval találkozhatunk.',
      'MINDEN hazai kétéltű és hüllő törvényes védelem alatt áll! Elpusztításuk vagy bántalmazásuk büntetendő cselekmény.',
      'Hazánkban a lakott területeken előforduló siklók teljesen ártalmatlanok, nem rendelkeznek méregmiriggyel vagy méregfoggal.',
      'Veszély esetén a vízisikló felveszi a halottnak tettetés pózát, bűzös mirigyváladékot bocsát ki, vagy sziszegéssel védekezik.',
      'Hagyd békén őket: a kert leghasznosabb lakói, mivel természetes úton irtják a rágcsálókat (egereket, pockokat) és csigákat.'
    ]
  },
  {
    id: 'h3',
    cim: 'Vízelvezető aknába vagy medencébe szorult kétéltűek',
    kategoria: 'hullo',
    leiras: [
      'A függőleges falú kerti aknák, mérőóra-üregek és meredek falú medencék halálos csapdát jelentenek a békák, gőték és varangyok számára.',
      'A sima falfelületen nem tudnak kimászni, így a vízben elfáradva megfulladnak vagy a száraz aknában éhen halnak.',
      'Merítőhálóval vagy vödörrel óvatosan emeld ki őket és engedd el a kert egy nyirkos, árnyékos növényes sarkában.',
      'Megelőzés: Helyezz a kerti tóba vagy medence szélére egy ferdén bedöntött durva deszkát vagy ágat, amin a kétéltűek és kisemlősök önállóan ki tudnak mászni.'
    ]
  },

  // --- ÁLTALÁNOS VÉSZHELYZETEK ---
  {
    id: 'a1',
    cim: 'Hőguta tünetei és azonnali szakszerű ellátása',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Tünetek: Eszeveszett zihálás, sűrű nyáladzás, élénkvörös vagy lilás íny, üveges tekintet, mozgáskoordinációs zavar, ájulás.',
      'Azonnal vidd az állatot hűvös, árnyékos, jól szellőző vagy légkondicionált helyre!',
      'HŰTSD LANGYOS VÍZZEL: Nedvesíts be törölközőt langyos (kb. 20-25°C-os) vízzel, és borogasd a mancsait, ágyékhajlatát, hasát és nyakát.',
      'JÉGHIDEG VÍZ ÉS JÉG TILOS: A túl hideg víz perifériás érszűkületet okoz, ami bezárja a hőt a létfontosságú szervekbe, és azonnali sokkos szívleállást válthat ki!',
      'Kínálj fel ivóvizet kis adagokban, de eszméletvesztés vagy hányinger esetén ne önts folyadékot a torkába.',
      'A látszólagos jobbulás után is kötelező az állatorvosi vizsgálat, mert a vese és agyszöveti károsodás órákkal később is beállhat!'
    ],
    figyelmeztetes: 'Tűző napon álló gépkocsiban a belső hőmérséklet 10 perc alatt elérheti a halálos 50-60°C-ot még leengedett ablak mellett is!'
  },
  {
    id: 'a2',
    cim: 'Mérgezés gyanúja (patkányméreg, fagyálló, élelmiszerek)',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Gyakori méreganyagok: Véralvadásgátló patkányméreg (napokkal később jelentkező orrvérzés, sápadt íny), fagyálló (édeskés íz, veseleállás), csokoládé/teobromin, xilit/nyírfacukor (súlyos vércukoresés), liliomfélék (macskáknál halálos veseleállás).',
      'Tünetek: Hirtelen hányás, véres hasmenés, remegés, izomgörcsök, nyáladzás, pupillatágulat, levertség.',
      'NE próbáld otthon sóval vagy egyébbel meghánytatni orvosi utasítás nélkül! Maró vegyszernél a visszajövő anyag szétmarja a nyelőcsövet.',
      'Ha friss a mérgezés (1-2 órán belül), orvosi egyeztetés után aktív orvosi szén tabletta beadása megkötheti a méreg egy részét.',
      'Azonnal indulj orvoshoz, és vidd magaddal a feltételezett méreg dobozát, hatóanyagát vagy a növény levelét!'
    ]
  },
  {
    id: 'a3',
    cim: 'Életmentő újraélesztés (CPR) kutyáknak és macskáknak',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Ellenőrizd az életjeleket: Nincs légzés (figyeld a mellkas emelkedését) és nincs pulzus (a comb belső oldalán tapintható combartérián).',
      'Légutak szabaddá tétele: Húzd előre óvatosan a nyelvet, tisztítsd meg a szájüreget a nyáltól, vértől vagy hányadéktól.',
      'Fektesd az állatot a jobb oldalára kemény, sík felületre.',
      'Mellkaskompresszió: Helyezd a kezed a bal könyök mögé a bordák legszélesebb pontjára. Végezz percenként 100-120 határozott nyomást (a mellkas mélységének 1/3-áig benyomva).',
      'Befúvásos lélegeztetés: Zárva tartva a kutya/macska pofáját, fogd körbe a száddal az orrlyukait, és fújj be annyi levegőt, hogy a mellkas láthatóan megemelkedjen (arány: 30 nyomás után 2 befújás).'
    ],
    figyelmeztetes: 'Újraélesztést kizárólag eszméletlen, pulzus és spontán légzés nélküli állaton szabad végezni!'
  },
  {
    id: 'a4',
    cim: 'Égési sérülések és áramütés ellátása',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Áramütés (gyakori kábelt rágcsáló kölyökkutyáknál és macskáknál): Először azonnal ÁRAMTALANÍTS, mielőtt hozzáérnél az állathoz!',
      'Az áramütés tüdőödémát és szívritmuszavart okozhat még órákkal a baleset után is, orvosi ellenőrzés szükséges.',
      'Forrázás vagy tűz okozta égés esetén hűtsd a sérült területet tiszta, hideg vagy langyos folyóvízzel legalább 10-15 percen át.',
      'NE kenj a sebre tejfölt, zsírt, olajat vagy emberi kenőcsöket, mert elzárják a hőt és súlyos fertőzést okoznak!',
      'Takard le a sebet nedves steril gézlappal a fertőzés megakadályozására a szállítás idejére.'
    ]
  }
];
