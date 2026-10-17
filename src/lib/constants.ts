import { FirstAidGuideItem } from '@/types';

const getFallbackKey = () => {
  try {
    return atob('QUl6YVN5RDZjd1FpMnlpdFlZUk5BbEhqSVE5eUxySkJBY2V4Sm1V');
  } catch {
    return Buffer.from('QUl6YVN5RDZjd1FpMnlpdFlZUk5BbEhqSVE5eUxySkJBY2V4Sm1V', 'base64').toString('utf-8');
  }
};

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://allatmento-backend.vercel.app/api';

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
    cim_en: 'Approaching and Securing an Injured or Hit-by-Car Dog',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Mindig a saját testi épséged az első! A fájdalomtól sokkos vagy rémült kutya ösztönösen haraphat, még a saját gazdáját is.',
      'Közelíts lassan, oldalról, kerüld a közvetlen szemkontaktust, és beszélj hozzá alacsony, nyugtató hangszínnel.',
      'Ha nincs légzési nehézsége vagy fejsérülése, egy puha sállal vagy gézzel óvatosan hurkold át a pofáját a harapás megelőzésére.',
      'Mozgatáshoz használj feszes pokrócot vagy kabátot rögtönzött hordágyként, ügyelve arra, hogy a gerincoszlop egyenes vonalban maradjon.',
      'Soha ne adj emberi fájdalomcsillapítót (az Algopyrin, Paracetamol, Ibuprofen halálos mérgezést és belső vérzést okozhat)!'
    ],
    leiras_en: [
      'Your personal safety always comes first! A dog in shock or acute pain may bite reflexively, even its own owner.',
      'Approach slowly from the side, avoid direct eye contact, and speak in a low, soothing tone.',
      'If there is no breathing difficulty or head injury, gently muzzle the snout with a soft scarf or gauze roll to prevent biting.',
      'For transport, use a taut blanket or coat as a makeshift stretcher, keeping the spine aligned straight.',
      'Never administer human pain medication (Algopyrin, Paracetamol, Ibuprofen can cause fatal poisoning and internal bleeding)!'
    ],
    figyelmeztetes: 'Tilos az állatot hirtelen felrántani vagy behajlított háttal emelni az esetleges gerinc- és belső szervi sérülések miatt.',
    figyelmeztetes_en: 'Do not jerk the dog or lift with a curved back due to potential spinal and internal organ injuries.'
  },
  {
    id: 'k2',
    cim: 'Gyomorcsavarodás gyanúja (azonnali életveszély!)',
    cim_en: 'Suspected Gastric Dilatation-Volvulus / Bloat (Immediate Life Threat!)',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Jellemző tünetek: Felfúvódott, feszes, hordószerűen kemény has, folyamatos öklendezés és nyáladzás valódi hányadék nélkül, nyugtalanság.',
      'Főleg nagytestű, mély mellkasú fajtáknál fordul elő (német juhász, dán dog, vizsla, boxer stb.), leggyakrabban evés utáni hirtelen mozgáskor.',
      'Azonnal telefonálj a legközelebbi éjjel-nappali állatkórháznak, hogy készüljenek fel a sürgősségi műtétre!',
      'Minden perc számít: a csavarodott gyomor elszorítja a vérkeringést és a lépet, orvosi beavatkozás nélkül 1-2 órán belül visszafordíthatatlan sokk lép fel.'
    ],
    leiras_en: [
      'Typical symptoms: Swollen, drum-tight, hardened abdomen, non-productive retching and continuous drooling, severe restlessness.',
      'Mainly affects deep-chested large breeds (German Shepherd, Great Dane, Vizsla, Boxer, etc.), often triggered by vigorous activity after feeding.',
      'Call the nearest 24/7 emergency veterinary hospital immediately so the surgical team can prepare!',
      'Every minute matters: the twisted stomach cuts off blood flow and compresses the spleen; irreversible shock sets in within 1-2 hours without surgery.'
    ],
    figyelmeztetes: 'NE próbáld meghánytatni és NE itasd vízzel! Azonnal szállítsd az állatot sebészeti háttérrel rendelkező állatklinikára!',
    figyelmeztetes_en: 'DO NOT induce vomiting and DO NOT force water! Transport the dog immediately to an emergency surgical clinic!'
  },
  {
    id: 'k3',
    cim: 'Erős vérzés és sebellátás kutyáknál',
    cim_en: 'Severe Bleeding and Wound Management in Dogs',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Erős, lüktető artériás vagy sötét, folyamatos vénás vérzésnél alkalmazz közvetlen nyomókötést steril gézzel vagy tiszta pamutkendővel.',
      'Ha a kötés átvérzik, NE vedd le a meglévő réteget (mert felbontod az alakuló véralvadékot), hanem tegyél rá egy újabb, vastagabb réteget és szorítsd rá.',
      'Végtagsérülésnél a sérült végtagot tartsd enyhén megemelve a szív síkja fölé szállítás közben.',
      'Szennyezett felületes sebeket hideg tiszta vízzel vagy hígított Betadine-nal lehet óvatosan leöblíteni, de a mély sebekbe tilos belenyúlni.'
    ],
    leiras_en: [
      'For pulsatile arterial or continuous dark venous bleeding, apply direct pressure using sterile gauze or a clean cotton cloth.',
      'If the bandage bleeds through, DO NOT remove the existing layer (which would disrupt clot formation); apply a thicker layer on top and press firmly.',
      'For limb injuries, keep the affected leg slightly elevated above the heart level during transport.',
      'Superficial dirty wounds may be gently flushed with clean cold water or diluted Betadine, but never probe deep wounds.'
    ],
    figyelmeztetes: 'Érszorító gumi vagy spárga huzamos alkalmazása szigorúan tilos, mert a végtag elhalásához vezethet.',
    figyelmeztetes_en: 'Tourniquets or tight cords must never be applied for prolonged periods as they cause irreversible limb necrosis.'
  },
  {
    id: 'k4',
    cim: 'Idegentest a torokban és fulladás (Heimlich-műfogás)',
    cim_en: 'Foreign Body Obstruction and Choking (Heimlich Maneuver)',
    kategoria: 'kutya',
    surgos: true,
    leiras: [
      'Tünetek: Hirtelen köhögés, kapkodó légzés, mancsaival a pofáját kaparja, nyaka kinyújtva, nyáladzás, kékülő nyelv.',
      'Óvatosan nyisd ki a száját, de csak akkor próbáld kézzel kihúzni az elzáró labdát vagy csontot, ha tisztán látod és biztosan meg tudod fogni a harapás veszélye nélkül.',
      'Kistestű kutyánál: Emeld fel a hátsó lábainál fogva enyhe lejtéssel, és mérj határozott ütéseket a lapockái közé a tenyereddel.',
      'Nagytestű kutyánál (Heimlich): Karold át a kutya hasát a bordakosár mögött, formálj öklöt és fejts ki 4-5 gyors, határozott lökést felfelé és előre a fej irányába.'
    ],
    leiras_en: [
      'Symptoms: Sudden violent coughing, gasping for air, pawing frantically at the mouth, extended neck, salivation, cyanotic/blue tongue.',
      'Carefully inspect the mouth, but only attempt manual removal if the obstructing object is clearly visible and can be grasped without bite risk.',
      'Small dogs: Hold the dog by its hind legs with head angled slightly downward, and deliver firm palm strikes between the shoulder blades.',
      'Large dogs (Heimlich): Wrap your arms around the abdomen behind the ribcage, form a fist, and apply 4-5 quick, upward-forward thrusts toward the head.'
    ]
  },
  {
    id: 'k5',
    cim: 'Talált vagy kóbor kutya biztonságos azonosítása',
    cim_en: 'Safe Identification of Found or Stray Dogs',
    kategoria: 'kutya',
    leiras: [
      'Készíts róla jó minőségű fényképet az arcáról és a teljes testéről, jegyezd fel a pontos helyszínt és időpontot.',
      'Magyarországon minden 4 hónaposnál idősebb kutya kötelezően rendelkezik mikrochippel.',
      'Chipolvasót bármelyik állatorvosi rendelőben, állatvédő szervezetnél és a legtöbb kijelölt MOL töltőállomáson ingyenesen biztosítanak.',
      'Ha van benne regisztrált chip, az állatorvos percek alatt le tudja kérdezni a gazdi telefonszámát a PetVetData rendszerből.'
    ],
    leiras_en: [
      'Take high-quality photos of the dog\'s face and full body, and record the exact location and time found.',
      'In Hungary, microchipping is legally mandatory for all dogs over 4 months of age.',
      'Microchip scanners are provided free of charge at any veterinary clinic, animal rescue shelter, and most designated MOL petrol stations.',
      'If a registered chip is detected, a veterinarian can look up the owner\'s phone number in minutes via the PetVetData registry.'
    ]
  },

  // --- MACSKA ---
  {
    id: 'm1',
    cim: 'Magasból zuhant vagy gázolt macska (ablak-szindróma)',
    cim_en: 'High-Rise Syndrome or Hit-by-Car Cat (Fall from Height)',
    kategoria: 'macska',
    surgos: true,
    leiras: [
      'Nyitott ablakból vagy erkélyről lezuhant macskáknál a külső látható sérülés hiánya megtévesztő lehet.',
      'Gyakori a rejtett életveszélyes belső sérülés: szájpadláshasadék, rekeszizomszakadás, léprepedés és tüdővérzés (légmell).',
      'Helyezd sötét, jól szellőző hordozóba vagy kemény oldalú dobozba egy puha törölközőre.',
      'Kerüld a felesleges tapogatást és forgatást, a fejet és a nyakat tartsd egyenes vonalban a könnyebb légzés érdekében.',
      'Azonnal vidd röntgennel és ultrahanggal felszerelt állatklinikára!'
    ],
    leiras_en: [
      'In cats falling from open windows or balconies, the lack of visible external injuries is often deceiving.',
      'Hidden life-threatening internal trauma is common: cleft palate, diaphragmatic rupture, ruptured spleen, and pneumothorax / lung hemorrhage.',
      'Place the cat into a dark, well-ventilated carrier or sturdy box lined with a soft towel.',
      'Minimize handling and turning; maintain the head and neck in a neutral straight line for unobstructed breathing.',
      'Rush immediately to an emergency clinic equipped with X-ray and ultrasound!'
    ],
    figyelmeztetes: 'Ha a macska nyitott szájjal, hasi préseléssel kapkod levegőért, azonnali oxigénellátásra van szüksége!',
    figyelmeztetes_en: 'If the cat breathes with an open mouth and abdominal effort, it requires immediate oxygen therapy!'
  },
  {
    id: 'm2',
    cim: 'Kihűlt, elárvult kiscica mentése és táplálása',
    cim_en: 'Rescuing and Feeding Hypothermic, Orphaned Kittens',
    kategoria: 'macska',
    leiras: [
      'A kihűlés a legfőbb halálok újszülött cicáknál: az első lépés MINDIG a testhőmérséklet óvatos helyreállítása meleg vizes palackkal vagy meggymagpárnával.',
      'Kihűlt, dermedt cicát TILOS etetni! A leállt emésztőrendszer miatt a tej erjedni kezd a gyomrában, ami fulladáshoz vezet.',
      'SOSE adj bolti tehéntejet! Magas laktóztartalma súlyos, gyorsan kiszáradást okozó hasmenést idéz elő.',
      'Csak állatpatikában kapható speciális macskatejpótló tápszert használj, langyosan, steril fecskendőből csepegtetve hasmánt fekvő pózban (sosem hátán fekve!).',
      'Etetés után langyos nedves vattával körkörösen masszírozd a hasát és a végbéltájékát, mert maguktól még nem tudnak üríteni.'
    ],
    leiras_en: [
      'Hypothermia is the leading cause of death in neonatal kittens: step ONE is ALWAYS gentle warming with a warm water bottle or heating pad.',
      'NEVER feed a cold, torpid kitten! With digestive motility arrested, milk ferments in the stomach, leading to fatal aspiration.',
      'NEVER give store-bought cow milk! High lactose content causes severe, dehydrating diarrhea within hours.',
      'Only use specialized kitten milk replacer (KMR) from a vet pharmacy, fed lukewarm via syringe with the kitten lying on its belly (never on its back!).',
      'After feeding, gently stimulate the belly and genital area with a warm, damp cotton ball, as newborns cannot eliminate on their own.'
    ]
  },
  {
    id: 'm3',
    cim: 'Autó motorterébe szorult kiscica mentése',
    cim_en: 'Kitten Trapped in a Car Engine Compartment',
    kategoria: 'macska',
    leiras: [
      'Őszi és téli hidegben a kóbor kiscicák előszeretettel bújnak a még meleg gépjárművek motorterébe vagy a kerekek dobbetétei mögé.',
      'Indítás előtt mindig kopogtass határozottan a motorháztetőre és dudálj egy rövidet, hogy felriaszd az elaludt cicát.',
      'Ha nyávogást hallasz a motortérből, NE indítsd be a motort! A járó ékszíj és ventilátor súlyos végtagsérülést vagy halált okoz.',
      'Nyisd fel a motorháztetőt zseblámpával, és próbáld meg óvatosan elérni. Ha beszorult a futómű alkatrészei közé, kérd állatmentők vagy szerelő segítségét.'
    ],
    leiras_en: [
      'In cold weather, stray kittens frequently seek warmth inside vehicle engine bays or wheel arches.',
      'Always knock firmly on the hood and tap the horn briefly before starting the vehicle to awaken any sleeping animal.',
      'If you hear meowing, DO NOT start the engine! Moving fan belts and pulleys cause severe amputation or fatal injury.',
      'Open the hood with a flashlight and attempt gentle retrieval. If wedged in suspension parts, contact animal rescuers or a mechanic.'
    ]
  },
  {
    id: 'm4',
    cim: 'Húgyúti elzáródás kandúroknál (életveszélyes állapot)',
    cim_en: 'Urinary Obstruction in Male Cats (FLUTD / Life-Threatening Crisis)',
    kategoria: 'macska',
    surgos: true,
    leiras: [
      'Gyakori vészhelyzet ivartalanított kandúroknál a húgykő vagy gyulladásos nyákcsap miatti vizeletelakadás.',
      'Tünetek: Gyakran ül az alomtálcán, erőlködik, sírva vagy fájdalmasan nyávog, a hasa feszes, a nemi szervét tisztogatja, de vizelet nem vagy csak pár csepp távozik.',
      'Gyakori tévedés: Sok gazdi székrekedésnek hiszi a tünetet!',
      'Ha a vizelet 24-48 órán keresztül nem tud ürülni, a mérgező anyagok felhalmozódnak a vérben (urémia), ami hirtelen szívleállást és veseleállást okoz.'
    ],
    leiras_en: [
      'Common life-threatening emergency in neutered male cats caused by urinary crystals or urethral mucous plugs.',
      'Symptoms: Frequent visits to the litter box, unproductive straining, painful crying/howling, tense abdomen, excessive genital licking with zero or few drops of urine produced.',
      'Common dangerous misconception: Many owners mistake this for constipation!',
      'Without urinary output for 24-48 hours, toxic metabolites accumulate in the blood (uremia), causing fatal cardiac arrest and kidney failure.'
    ],
    figyelmeztetes: 'Nem várhat másnapig! Éjszaka is azonnal ügyeletre kell szállítani katéterezésre.',
    figyelmeztetes_en: 'Cannot wait until morning! Requires immediate emergency catheterization, even in the middle of the night.'
  },

  // --- MADÁR ÉS FIÓKA ---
  {
    id: 'b1',
    cim: 'Földön talált madárfióka – mikor NE avatkozz be?',
    cim_en: 'Fledgling Bird on the Ground – When NOT to Intervene',
    kategoria: 'madar',
    leiras: [
      'Ha a fióka TOLLAS, szemei nyitva vannak és ugrál a bokrok alatt (pl. feketerigó, cinke, gerle), a legtöbb esetben NEM árvult el!',
      'Ez a természetes fiókarepülési szakasz: a szülők a közelben rejtőznek, figyelik és rendszeresen etetik a kicsit.',
      'Csak akkor segíts, ha közvetlen veszély fenyegeti (macska, forgalmas járda): ilyenkor óvatosan tedd fel egy közeli sűrű bokor vagy fa biztonságos ágára.',
      'Tévhit, hogy a madarak megérzik az emberi szagot: az emlősökkel ellentétben nem hagyják el a fiókát attól, hogy kézzel megérintetted.',
      'Beavatkozni csak akkor kell, ha csupasz/pelyhes fiókáról van szó, vagy látható sérülése van (lógó szárny, vérzés, gubbasztás).'
    ],
    leiras_en: [
      'If the fledgling has feathers, open eyes, and hops among ground shrubs (e.g. blackbirds, tits, doves), in most cases it is NOT orphaned!',
      'This is the natural fledging stage: the parents stay hidden nearby, watching and feeding the chick regularly.',
      'Only intervene if immediate danger is present (cats, traffic): gently place it onto a high, dense bush or tree branch nearby.',
      'Birds do not reject chicks handled by humans; contrary to mammal myths, birds have a poor sense of smell.',
      'Intervene only if the chick is naked/downy, or shows clear signs of injury (drooping wing, blood, listlessness).'
    ],
    figyelmeztetes: 'A fészekből kiesett csupasz fiókát próbáld visszajuttatni az eredeti fészkébe, vagy készíts neki fára rögzíthető kosarat béléssel.',
    figyelmeztetes_en: 'If a naked chick fell from a nest, try returning it to the original nest, or hang a lined basket high in the same tree.'
  },
  {
    id: 'b2',
    cim: 'Ablaknak vagy autónak ütközött, sokkos madár',
    cim_en: 'Bird in Shock After Window or Vehicle Collision',
    kategoria: 'madar',
    surgos: true,
    leiras: [
      'Az üveggel ütközött madarak gyakran súlyos agyrázkódást, belső vérzést vagy szemsérülést szenvednek.',
      'Helyezd egy szellőző lyukakkal ellátott kartondobozba, amelynek aljára papírtörlőt fektetsz.',
      'Tedd a dobozt teljesen sötét, meleg és csendes helyiségbe 1-2 órára, távol kutyától és macskától.',
      'A sötétség csökkenti a sokkhatást és megelőzi a vergődés miatti másodlagos töréseket.',
      'TILOS vizet vagy magot erőszakkal a csőrébe tölteni! A nyelőcső helyett a tüdőbe jutva azonnali fulladást okoz.'
    ],
    leiras_en: [
      'Birds colliding with glass panes or cars often suffer severe concussion, internal bleeding, or optical trauma.',
      'Place the bird into a cardboard box with ventilation holes, lined on the bottom with paper towels.',
      'Move the box to a completely dark, warm, quiet room for 1-2 hours, safely away from pets.',
      'Darkness significantly reduces stress and shock, preventing secondary fractures from frantic thrashing.',
      'NEVER force water or seeds down the beak! Liquid entering the trachea causes rapid asphyxiation.'
    ]
  },
  {
    id: 'b3',
    cim: 'Sérült ragadozó madarak és nagymadarak kezelése',
    cim_en: 'Handling Injured Birds of Prey and Large Waders',
    kategoria: 'madar',
    surgos: true,
    leiras: [
      'Soha ne nyúlj puszta kézzel ragadozó madárhoz (ölyv, vércse, bagoly) vagy gémfélékhez/gólyákhoz!',
      'Ragadozó madaraknál a fő veszélyforrás a tűhegyes, hatalmas szorítóerejű karom: dobd le egy vastag kabáttal vagy törölközővel, és a ruhán keresztül szorítsd le a lábakat.',
      'Gémek és gólyák védekezésből reflexszerűen a szemedet veszik célba a hegyes csőrükkel – viselj védőszemüveget vagy tarts kartonlapot magad előtt!',
      'Szállításra a ragadozó madár számára is a sötét, jól lezárt, lyukacsos papírdoboz a legbiztonságosabb (kalitkában letöri a tollait).'
    ],
    leiras_en: [
      'Never touch a bird of prey (buzzard, kestrel, owl) or storks/herons with bare hands!',
      'Raptor danger stems from razor-sharp talons with immense gripping power: drop a heavy coat or towel over the bird and restrain the legs through the fabric.',
      'Herons and storks reflexively stab toward eyes with dagger-like beaks – always wear eye protection or hold a cardboard shield in front of you!',
      'For transport, a dark, well-ventilated cardboard box is safest (wire cages break feathers permanently).'
    ]
  },
  {
    id: 'b4',
    cim: 'Vízimadarak horgászzsinórba vagy horogba akadva',
    cim_en: 'Waterfowl Entangled in Fishing Line or Hooks',
    kategoria: 'madar',
    leiras: [
      'A horogba vagy damilba gabalyodott hattyúk, tőkés récék és sirályok segítség nélkül a végtag elhalásával vagy éhhalállal néznek szembe.',
      'A madarat takard le a fején sötét ruhával, amitől azonnal megnyugszik és leállítja a kapálózást.',
      'A horgot SOSE rántsd ki erőből, mert a visszahajló szakáll roncsolja az izmokat és ereket!',
      'Ha a horog hegye és szakálla átjött a bőrön, csípőfogóval vágd le a szakállas részt, majd a sima ívet húzd vissza.',
      'A damilt vágd el, hogy ne szorítsa tovább az ereket, majd szállítsd a legközelebbi madármentő állomásra.'
    ],
    leiras_en: [
      'Swans, mallards, and gulls snagged on fishhooks or monofilament line face limb loss or starvation without help.',
      'Cover the bird\'s head with a dark cloth; darkness immediately calms the animal and stops struggling.',
      'NEVER rip a hook out backwards: the barbed point will tear through muscle and vessels!',
      'If the hook tip and barb protrude through skin, cut off the barb with wire cutters and slide the smooth shank backwards.',
      'Snip the fishing line to relieve pressure on blood vessels, then transport to the nearest wildlife rescue station.'
    ]
  },

  // --- KISEMLŐSÖK (SÜN, DENEWÉR, MÓKUS) ---
  {
    id: 's1',
    cim: 'Nappal talált vagy sérült keleti sün mentése',
    cim_en: 'Rescuing Daytime-Active or Injured Northern White-Breasted Hedgehogs',
    kategoria: 'kisemlos',
    surgos: true,
    leiras: [
      'A keleti sün szigorúan éjszakai állat. Ha fényes nappal a nyílt terepen imbolyog, fekszik vagy körbe-körbe jár, MINDIG bajban van!',
      'Gyakori veszély a fűkasza okozta vágott seb, valamint a zöld döglegyek által a sebre vagy szemre lerakott peték (apró fehér rizsszemek).',
      'A légypetéket azonnal el kell távolítani száraz fogkefével vagy csipesszel, mert 12 órán belül kikelnek a lárvák és felfalják a szöveteket.',
      'Karton dobozba helyezd, tegyél mellé egy meleg vizes palackot törölközőbe csavarva.',
      'Soha ne adj tejet! A sünök laktózérzékenyek, a tej halálos hasmenést okoz. Friss vizet és jó minőségű macskakonzervet kínálj neki.'
    ],
    leiras_en: [
      'The northern white-breasted hedgehog is strictly nocturnal. If one is wobbling, lying, or circling in broad daylight on open ground, it is ALWAYS in distress!',
      'Common hazards include lawnmower/strimmer lacerations and flystrike (blowflies laying white, rice-grain-like egg clusters on wounds or eyes).',
      'Fly eggs must be removed immediately with a dry toothbrush or tweezers; larvae hatch within 12 hours and devour healthy tissue.',
      'Place the hedgehog in a cardboard box with a warm water bottle wrapped in a towel.',
      'NEVER offer cow milk! Hedgehogs are severely lactose intolerant; milk triggers fatal diarrhea. Provide clean water and high-grade canned cat food.'
    ],
    figyelmeztetes: 'Minden Magyarországon vadon élő sün természetvédelmi oltalom alatt áll (eszmei értéke 25 000 Ft).',
    figyelmeztetes_en: 'All wild hedgehogs in Hungary are protected by conservation law (nominal conservation value 25,000 HUF).'
  },
  {
    id: 's2',
    cim: 'Késő őszi, alulsúlyos sünök és telelés',
    cim_en: 'Late Autumn Underweight Hedgehogs and Hibernation',
    kategoria: 'kisemlos',
    leiras: [
      'Október-november környékén a sünöknek el kell érniük a legalább 350-400 grammos testtömeget ahhoz, hogy túléljék a téli álmot.',
      'Egy konyhai mérleggel mérd le a talált kis sünt: ha késő ősszel 350 gramm alatti, szakember nélkül megfagy vagy éhen hal a fagyos hónapokban.',
      'Ne hagyd kint a kertben; helyezd magas falú dobozba fűtött helyiségben, adj neki aprószemű macskatápot és tiszta vizet.',
      'Értesítsd a Magyar Sünbarát Alapítványt vagy a helyi nemzeti park igazgatóságát a teleltetés átvételéhez.'
    ],
    leiras_en: [
      'Around October–November, hedgehogs must reach a minimum weight of 350–400 grams to survive winter hibernation.',
      'Weigh the found juvenile on a kitchen scale: if under 350 grams in late autumn, it will freeze or starve during winter without human intervention.',
      'Do not leave it in the garden; place it in a high-walled box in a heated room, offering small-kibble cat food and fresh water.',
      'Contact the Hungarian Hedgehog Protection Foundation (Magyar Sünbarát Alapítvány) or the local national park directorate for winter shelter handoff.'
    ]
  },
  {
    id: 's3',
    cim: 'Fészekből kiesett kismókus ellátása',
    cim_en: 'Caring for Fallen Baby Squirrels (Drey Fall)',
    kategoria: 'kisemlos',
    leiras: [
      'Viharok vagy favágás után gyakran hullanak le a mókusfészkek (golyófészkek) a földre a kölykökkel együtt.',
      'A kismókusok rendkívül gyorsan kihűlnek: azonnal melegítsd fel a tenyeredben vagy meleg vizes flakon mellett.',
      'Ha a kölyök nem sérült és meleg, helyezd egy alacsony kosárba a fa tövébe, és távolról figyeld 1-2 órán át: az anyjuk gyakran visszajön és egyenként felmenti őket.',
      'Ha az anya nem tér vissza, vagy a kicsi vérzik, vedd magadhoz és haladéktalanul hívd a vadállatmentőket.'
    ],
    leiras_en: [
      'Squirrel dreys frequently get dislodged with litters inside after heavy storms or tree trimming.',
      'Baby squirrels lose body heat rapidly: warm immediately in your hands or against a warm water bottle.',
      'If the baby is uninjured and warm, place it in a shallow basket at the base of the tree and watch from a distance for 1–2 hours; mothers often return to retrieve them one by one.',
      'If the mother fails to return, or the baby is bleeding or cold, secure it and contact wildlife rescuers immediately.'
    ]
  },
  {
    id: 's4',
    cim: 'Épületbe tévedt vagy földön fekvő denevér mentése',
    cim_en: 'Rescuing Grounded Bats or Bats Trapped Indoors',
    kategoria: 'kisemlos',
    leiras: [
      'Minden Magyarországon élő denevérfaj törvényi védelem alatt áll és rovarevőként kiemelten hasznos élőlény.',
      'SOHA ne fogd meg puszta kézzel! Apró, de rendkívül éles fogaikkal mély sebet ejthetnek, és fennáll a veszettség átadásának veszélye.',
      'Szobába tévedt denevér esetén este kapcsold le a belső világítást, nyisd ki szélesre az ablakot, húzd el a függönyt, és magától kitalál az ultrahang segítségével.',
      'Földön talált denevérre boríts egy lyukacsos cipősdobozt, alácsúsztatva egy kemény kartont, majd tedd fel alkonyatkor egy fa törzsére legalább 1,5 méter magasba, ahonnan el tud rugaszkodni.'
    ],
    leiras_en: [
      'All bat species in Hungary are strictly protected by law and play a vital role as insectivores.',
      'NEVER touch a bat with bare hands! Their needle-sharp teeth can puncture deeply, carrying a risk of rabies transmission.',
      'For a bat trapped in a room at night: turn off interior lights, open windows wide, pull back curtains, and let it navigate out using echolocation.',
      'For a bat grounded outside: place an aerated shoe box over it, slide sturdy cardboard underneath, and at dusk position it against a tree trunk at least 1.5 meters high so it can drop into flight.'
    ]
  },

  // --- VADÁLLATOK (ŐZ, VADDISZNÓ, RÓKA) ---
  {
    id: 'v1',
    cim: 'Közúti vadbaleset (őz, szarvas, vaddisznó)',
    cim_en: 'Wildlife Road Collision (Roe Deer, Red Deer, Wild Boar)',
    kategoria: 'vad',
    surgos: true,
    leiras: [
      'Kapcsold be az elakadásjelzőt, vedd fel a láthatósági mellényt, és helyezd ki az elakadásjelző háromszöget legalább 50-100 méterre!',
      'A sérült nagyvadhoz NE menj közel: a haláltusáját vívó vagy sokkos szarvas agancsával, az őz a patájával, a vaddisznó az agyarával életveszélyes támadásra képes.',
      'Azonnal hívd a 112-es központi segélyhívót, akik hivatalból értesítik a rendőrséget és a területileg illetékes vadásztársaságot.',
      'A vad az állam és a vadásztársaság kizárólagos tulajdona: az elpusztult vagy sérült állat elszállítása bűncselekménynek (orvvadászatnak) minősül!'
    ],
    leiras_en: [
      'Switch on hazard lights, put on a high-visibility vest, and set out the warning triangle at least 50–100 meters behind your vehicle!',
      'NEVER approach an injured large animal: a thrashing or shocked deer can inflict lethal strikes with hooves/antlers, and a wild boar with tusks.',
      'Immediately dial emergency number 112; the dispatchers officially notify police and the local hunting authority.',
      'Game is the exclusive legal property of the state and hunting association: taking a deceased or injured animal constitutes poaching (a criminal offense)!'
    ]
  },
  {
    id: 'v2',
    cim: 'Magányos fekvő őzgida a magas fűben – NE NYÚLJ HOZZÁ!',
    cim_en: 'Solitary Fawn Lying in High Grass – DO NOT TOUCH!',
    kategoria: 'vad',
    leiras: [
      'Májusban és júniusban az őzsuták a magas fűbe fektetik le újszülött gidáikat, míg ők a közelben táplálkoznak.',
      'A gidának életének első 2-3 hetében szándékosan nincs testszaga, és veszély esetén mozdulatlanul lapul a talajon – ez az életben maradásának záloga.',
      'TILOS MEGEÉRINTENI! Ha emberi szagot kap, a visszatérő anyja nem ismeri fel, elutasítja a szoptatást, és a gida kínhalált hal.',
      'Húzódj vissza csendben! Csak akkor van baj, ha a gida órákon át keservesen sír, körbe-körbe szaladgál, vagy a teteme mellett fekszik az elpusztult anyjának.'
    ],
    leiras_en: [
      'In May and June, roe deer does leave their newborn fawns bedded down in tall grass while foraging nearby.',
      'During the first 2–3 weeks of life, fawns naturally produce zero body scent and remain motionless when approached – this is their primary defense.',
      'DO NOT TOUCH THEM! Any human scent left on the fawn will cause the doe to reject it, leading to abandonment and agonizing starvation.',
      'Quietly back away! Help is only needed if the fawn has been bleating continuously for hours, pacing frantically, or is found next to a dead doe.'
    ]
  },
  {
    id: 'v3',
    cim: 'Településre tévedt róka kezelése',
    cim_en: 'Handling Urban Foxes Encountered in Built-Up Areas',
    kategoria: 'vad',
    leiras: [
      'A rókák ma már a nagyvárosok (pl. Budapest kerületei) állandó lakói, az emberi ételhulladék és a rágcsálók vonzzák őket.',
      'Önmagában az, hogy nappal rókát látsz, még nem jelenti azt, hogy veszett!',
      'Gyanús tünetek veszettség esetén: Nem fél az embertől és provokáció nélkül közeledik/támad, imbolyog a járása, állkapcsa lóg, sűrű habos nyál folyik a szájából, bénulásos tünetei vannak.',
      'Tartsd a távolságot, zárd be a házi kedvenceidet, és gyanús viselkedés esetén haladéktalanul hívd a NÉBIH zöldszámát (06-80/263-244) vagy a helyi hatósági állatorvost.'
    ],
    leiras_en: [
      'Foxes are now permanent urban dwellers across cities (e.g. Budapest districts), attracted by food waste and rodent populations.',
      'Merely sighting a fox during daylight hours does not mean it has rabies!',
      'Suspicious rabies symptoms: Complete lack of fear, unprovoked approach or aggression, staggering gait, dropped jaw, heavy foaming salivation, or paresis.',
      'Keep your distance, secure pets indoors, and report suspect behavior immediately to NÉBIH green line (06-80/263-244) or the municipal official veterinarian.'
    ]
  },

  // --- HÜLLŐK ÉS KÉTÉLTŰEK ---
  {
    id: 'h1',
    cim: 'Úton átkelő mocsári teknős védelme',
    cim_en: 'Protecting Road-Crossing European Pond Turtles',
    kategoria: 'hullo',
    leiras: [
      'A mocsári teknős Magyarország egyetlen őshonos, szigorúan védett teknősfaja (eszmei értéke 50 000 Ft).',
      'Tavasszal és kora nyáron a nőstények nagy távolságokat tesznek meg a vizektől a száraz homokos partokig tojásrakás céljából, ezért gyakran kereszteznek autóutakat.',
      'Segítsd át az úton: Fogd meg két kézzel a páncél két oldalán, és vidd át pontosan abba a MENETIRÁNYBA, amerre haladt!',
      'Ha visszafordítod vagy más vízhez szállítod el, újra át fog próbálni kelni a forgalmas úton.',
      'Soha ne vidd haza otthoni terráriumba vagy kerti tóba, mert a vadon élő egyedek fogságban tartása törvénybe ütközik!'
    ],
    leiras_en: [
      'The European pond turtle is Hungary\'s only native, strictly protected turtle species (nominal conservation value 50,000 HUF).',
      'In spring and early summer, females travel long overland distances from water bodies to dry sandy soils for nesting, frequently crossing roads.',
      'Help them cross safely: Hold the shell firmly with both hands on each side and carry the turtle in the EXACT DIRECTION it was already heading!',
      'If you turn it back or move it to a different lake, it will inevitably attempt to cross the busy road again.',
      'Never take wild turtles home for garden ponds or terrariums; capturing wild specimens is strictly illegal!'
    ]
  },
  {
    id: 'h2',
    cim: 'Kertben talált siklók (ártalmatlan és védett hüllők)',
    cim_en: 'Garden Snakes (Harmless and Protected Colubrids)',
    kategoria: 'hullo',
    leiras: [
      'Magyarországon a kertekben leggyakrabban vízisiklóval, rézsiklóval vagy erdei siklóval találkozhatunk.',
      'MINDEN hazai kétéltű és hüllő törvényes védelem alatt áll! Elpusztításuk vagy bántalmazásuk büntetendő cselekmény.',
      'Hazánkban a lakott területeken előforduló siklók teljesen ártalmatlanok, nem rendelkeznek méregmiriggyel vagy méregfoggal.',
      'Veszély esetén a vízisikló felveszi a halottnak tettetés pózát, bűzös mirigyváladékot bocsát ki, vagy sziszegéssel védekezik.',
      'Hagyd békén őket: a kert leghasznosabb lakói, mivel természetes úton irtják a rágcsálókat (egereket, pockokat) és csigákat.'
    ],
    leiras_en: [
      'In Hungarian residential gardens, you will most commonly encounter grass snakes (natrix), smooth snakes, or Aesculapian snakes.',
      'ALL domestic amphibians and reptiles are protected by law! Killing or harming them is a prosecutable offense.',
      'All colubrid snakes found around residential zones in Hungary are completely non-venomous and pose no danger to humans or domestic pets.',
      'When threatened, grass snakes may play dead (thanatosis), release a foul-smelling musk gland secretion, or hiss defensively.',
      'Leave them in peace: they are among the most beneficial garden predators, naturally controlling rodent (mice, voles) and slug populations.'
    ]
  },
  {
    id: 'h3',
    cim: 'Vízelvezető aknába vagy medencébe szorult kétéltűek',
    cim_en: 'Amphibians Trapped in Drainage Pits or Swimming Pools',
    kategoria: 'hullo',
    leiras: [
      'A függőleges falú kerti aknák, mérőóra-üregek és meredek falú medencék halálos csapdát jelentenek a békák, gőték és varangyok számára.',
      'A sima falfelületen nem tudnak kimászni, így a vízben elfáradva megfulladnak vagy a száraz aknában éhen halnak.',
      'Merítőhálóval vagy vödörrel óvatosan emeld ki őket és engedd el a kert egy nyirkos, árnyékos növényes sarkában.',
      'Megelőzés: Helyezz a kerti tóba vagy medence szélére egy ferdén bedöntött durva deszkát vagy ágat, amin a kétéltűek és kisemlősök önállóan ki tudnak mászni.'
    ],
    leiras_en: [
      'Vertical-walled garden pits, water meter shafts, and steep-sided swimming pools act as deadly pitfall traps for frogs, toads, and newts.',
      'Unable to climb sheer surfaces, they either drown from exhaustion in water or dehydrate and starve in dry pits.',
      'Gently lift them out using a pool net or bucket and release them into a moist, shaded, vegetated corner of your garden.',
      'Prevention: Place an angled, rough wooden ramp or branch on pool edges and garden pits so amphibians and small mammals can climb out unassisted.'
    ]
  },

  // --- ÁLTALÁNOS VÉSZHELYZETEK ---
  {
    id: 'a1',
    cim: 'Hőguta tünetei és azonnali szakszerű ellátása',
    cim_en: 'Heatstroke Symptoms and Immediate First Aid',
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
    leiras_en: [
      'Symptoms: Frenzied panting, thick drooling, bright red or purple gums, glassy unseeing gaze, loss of motor coordination, collapse.',
      'Immediately move the animal into a cool, shaded, well-ventilated, or air-conditioned area!',
      'COOL WITH LUKEWARM WATER: Soak towels in lukewarm (approx. 20–25°C) water and compress paws, groin, abdomen, and neck.',
      'ICE WATER AND ICE PACKS ARE DANGEROUS: Freezing temperatures cause sudden peripheral vasoconstriction, trapping lethal heat in core organs and triggering cardiac shock!',
      'Offer small sips of water, but do not force liquids down the throat if unconscious or nauseous.',
      'Veterinary evaluation is mandatory even after apparent recovery, as acute kidney and brain damage can manifest hours later!'
    ],
    figyelmeztetes: 'Tűző napon álló gépkocsiban a belső hőmérséklet 10 perc alatt elérheti a halálos 50-60°C-ot még leengedett ablak mellett is!',
    figyelmeztetes_en: 'Inside a car parked in sunlight, interior temperatures can spike to a fatal 50–60°C within 10 minutes, even with cracked windows!'
  },
  {
    id: 'a2',
    cim: 'Mérgezés gyanúja (patkányméreg, fagyálló, élelmiszerek)',
    cim_en: 'Suspected Poisoning (Rodenticides, Antifreeze, Toxic Foods)',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Gyakori méreganyagok: Véralvadásgátló patkányméreg (napokkal később jelentkező orrvérzés, sápadt íny), fagyálló (édeskés íz, veseleállás), csokoládé/teobromin, xilit/nyírfacukor (súlyos vércukoresés), liliomfélék (macskáknál halálos veseleállás).',
      'Tünetek: Hirtelen hányás, véres hasmenés, remegés, izomgörcsök, nyáladzás, pupillatágulat, levertség.',
      'NE próbáld otthon sóval vagy egyébbel meghánytatni orvosi utasítás nélkül! Maró vegyszernél a visszajövő anyag szétmarja a nyelőcsövet.',
      'Ha friss a mérgezés (1-2 órán belül), orvosi egyeztetés után aktív orvosi szén tabletta beadása megkötheti a méreg egy részét.',
      'Azonnal indulj orvoshoz, és vidd magaddal a feltételezett méreg dobozát, hatóanyagát vagy a növény levelét!'
    ],
    leiras_en: [
      'Common toxins: Anticoagulant rodenticides (internal bleeding days later, pale gums), ethylene glycol antifreeze (sweet taste, acute kidney failure), chocolate/theobromine, xylitol/birch sugar (severe hypoglycemia), lilies (fatal feline renal necrosis).',
      'Symptoms: Sudden vomiting, bloody diarrhea, tremors, muscle convulsions, hypersalivation, dilated pupils, lethargy.',
      'DO NOT attempt home remedies or induce vomiting with salt without veterinary direction! Corrosive agents will burn the esophagus on the way back up.',
      'If ingestion was recent (within 1–2 hours), administering activated medical charcoal tablets following veterinary phone consultation can bind toxins.',
      'Head to an emergency clinic immediately, bringing the suspected toxin packaging, safety sheet, or plant specimen with you!'
    ]
  },
  {
    id: 'a3',
    cim: 'Életmentő újraélesztés (CPR) kutyáknak és macskáknak',
    cim_en: 'Life-Saving Cardiopulmonary Resuscitation (CPR) for Dogs and Cats',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Ellenőrizd az életjeleket: Nincs légzés (figyeld a mellkas emelkedését) és nincs pulzus (a comb belső oldalán tapintható combartérián).',
      'Légutak szabaddá tétele: Húzd előre óvatosan a nyelvet, tisztítsd meg a szájüreget a nyáltól, vértől vagy hányadéktól.',
      'Fektesd az állatot a jobb oldalára kemény, sík felületre.',
      'Mellkaskompresszió: Helyezd a kezed a bal könyök mögé a bordák legszélesebb pontjára. Végezz percenként 100-120 határozott nyomást (a mellkas mélységének 1/3-áig benyomva).',
      'Befúvásos lélegeztetés: Zárva tartva a kutya/macska pofáját, fogd körbe a száddal az orrlyukait, és fújj be annyi levegőt, hogy a mellkas láthatóan megemelkedjen (arány: 30 nyomás után 2 befújás).'
    ],
    leiras_en: [
      'Verify vital signs: No spontaneous breathing (observe chest wall movement) and no femoral pulse (palpable on the inner upper thigh artery).',
      'Clear airways: Gently pull the tongue forward; clear blood, saliva, or vomitus from the oral cavity.',
      'Position the animal on its right side onto a firm, flat surface.',
      'Chest compressions: Place hands directly behind the left elbow over the widest point of the ribcage. Compress at 100–120 beats per minute (depressing 1/3 to 1/2 of chest depth).',
      'Rescue breathing: Keeping the muzzle firmly closed, seal your mouth over the nostrils and deliver gentle breaths until the chest visibly rises (ratio: 30 compressions to 2 breaths).'
    ],
    figyelmeztetes: 'Újraélesztést kizárólag eszméletlen, pulzus és spontán légzés nélküli állaton szabad végezni!',
    figyelmeztetes_en: 'Perform CPR ONLY on unresponsive animals confirmed to lack both a heartbeat and spontaneous breathing!'
  },
  {
    id: 'a4',
    cim: 'Égési sérülések és áramütés ellátása',
    cim_en: 'Treating Burns, Scalds, and Electrical Shock',
    kategoria: 'altalanos',
    surgos: true,
    leiras: [
      'Áramütés (gyakori kábelt rágcsáló kölyökkutyáknál és macskáknál): Először azonnal ÁRAMTALANÍTS, mielőtt hozzáérnél az állathoz!',
      'Az áramütés tüdőödémát és szívritmuszavart okozhat még órákkal a baleset után is, orvosi ellenőrzés szükséges.',
      'Forrázás vagy tűz okozta égés esetén hűtsd a sérült területet tiszta, hideg vagy langyos folyóvízzel legalább 10-15 percen át.',
      'NE kenj a sebre tejfölt, zsírt, olajat vagy emberi kenőcsöket, mert elzárják a hőt és súlyos fertőzést okoznak!',
      'Takard le a sebet nedves steril gézlappal a fertőzés megakadályozására a szállítás idejére.'
    ],
    leiras_en: [
      'Electrical shock (frequent in puppies and kittens chewing power cords): First, IMMEDIATELY DISCONNECT MAINS POWER before touching the animal!',
      'Electrocution can trigger pulmonary edema and life-threatening arrhythmias hours after the shock; urgent veterinary check is critical.',
      'For thermal burns or scalds, cool the affected skin under clean, cool running water for at least 10–15 minutes.',
      'DO NOT apply sour cream, butter, oils, or human burn ointments, as they trap heat and invite severe bacterial contamination!',
      'Cover the wound with a moist sterile gauze pad to prevent infection during transport.'
    ]
  }
];
