// scripts/devtools-test.mjs
import http from 'http';

function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers: { Host: 'localhost' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  const version = await getJson('http://localhost:9222/json/version');
  console.log('Chrome connected:', version.Browser);

  const targets = await getJson('http://localhost:9222/json/list');
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found!');
    process.exit(1);
  }

  // Adjust ws url to include port 9222
  const wsUrl = pageTarget.webSocketDebuggerUrl.replace('ws://localhost/', 'ws://localhost:9222/');
  console.log('Connecting to page ws:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const consoleLogs = [];
  const networkErrors = [];
  const networkRequests = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      consoleLogs.push({ type: msg.params.type, text: args });
      if (msg.params.type === 'error' || msg.params.type === 'warning') {
        console.log(`[CONSOLE ${msg.params.type.toUpperCase()}] ${args}`);
      }
    }

    if (msg.method === 'Runtime.exceptionThrown') {
      const text = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
      consoleLogs.push({ type: 'uncaughtException', text });
      console.log(`[UNCAUGHT EXCEPTION] ${text}`);
    }

    if (msg.method === 'Network.requestWillBeSent') {
      networkRequests.set(msg.params.requestId, msg.params.request.url);
    }

    if (msg.method === 'Network.responseReceived') {
      const status = msg.params.response.status;
      const url = msg.params.response.url;
      if (status >= 400 && !url.includes('/favicon.ico')) {
        networkErrors.push({ url, status, statusText: msg.params.response.statusText });
        console.log(`[HTTP ${status}] ${url}`);
      }
    }

    if (msg.method === 'Network.loadingFailed') {
      const url = networkRequests.get(msg.params.requestId) || 'unknown';
      if (!url.includes('/favicon.ico') && msg.params.errorText !== 'net::ERR_ABORTED') {
        networkErrors.push({ url, error: msg.params.errorText });
        console.log(`[NET FAILED] ${url} - ${msg.params.errorText}`);
      }
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('Enabling CDP domains...');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + ': ' + res.exceptionDetails.exception?.description);
    }
    return res.result?.value;
  }

  async function navigate(url, waitMs = 2000) {
    console.log(`\n========================================\nNavigating to: ${url}\n========================================`);
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  // 1. Főoldal tesztelése
  await navigate('http://localhost:3000/');
  const title = await evaluate('document.title');
  console.log('Page title:', title);

  // Kereső modal megnyitása (Chipszám kereső)
  console.log('Testing Chipszám Kereső modal...');
  const chipButtonFound = await evaluate(`(() => {
    const el = Array.from(document.querySelectorAll('div, button, a')).find(el => el.textContent && el.textContent.includes('Chipszám Kereső'));
    if (el) { el.click(); return true; }
    return false;
  })()`);
  console.log('Clicked Chipszám Kereső button:', chipButtonFound);
  await new Promise(r => setTimeout(r, 600));

  const modalVisible = await evaluate(`Boolean(document.querySelector('input[placeholder*="900"]') || document.querySelector('.fixed input'))`);
  console.log('Chip input visible:', modalVisible);

  // Chipszám teszt keresés
  console.log('Testing chip search with sample ISO number...');
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder*="900"]') || document.querySelector('.fixed input');
    if (input) {
      input.value = '900123456789012';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`);
  await new Promise(r => setTimeout(r, 800));

  // Modal bezárása
  await evaluate(`(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Téma váltás tesztelése
  console.log('Testing Theme Toggle...');
  const themeBefore = await evaluate(`document.documentElement.classList.contains('dark') ? 'dark' : 'light'`);
  console.log('Theme before toggle:', themeBefore);
  await evaluate(`(() => {
    const toggleBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-moon') || b.querySelector('svg.lucide-sun'));
    if (toggleBtn) toggleBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));
  const themeAfter = await evaluate(`document.documentElement.classList.contains('dark') ? 'dark' : 'light'`);
  console.log('Theme after toggle:', themeAfter);

  // Visszaállítás
  await evaluate(`(() => {
    const toggleBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-moon') || b.querySelector('svg.lucide-sun'));
    if (toggleBtn) toggleBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 300));

  // Nyelv váltás tesztelése
  console.log('Testing Language Toggle...');
  await evaluate(`(() => {
    const langBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('HU') || b.textContent.includes('EN')));
    if (langBtn) langBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));
  const currentLangText = await evaluate(`document.body.innerText.includes('Emergency') || document.body.innerText.includes('Report') ? 'EN' : 'HU'`);
  console.log('Detected language state:', currentLangText);

  // Visszaállítás magyarra ha átváltott
  await evaluate(`(() => {
    const langBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('HU') || b.textContent.includes('EN')));
    if (langBtn) langBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 300));

  // 2. Új bejelentés oldal tesztelése
  await navigate('http://localhost:3000/bejelentes');
  console.log('Testing Bejelentés Wizard Step 1...');
  // Kattintás Kutya kártyára
  await evaluate(`(() => {
    const kutyaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Kutya'));
    if (kutyaBtn) kutyaBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  // Tovább Step 2-re
  await evaluate(`(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Tovább'));
    if (nextBtn) nextBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 800));

  // Step 2 teszt: Térképes pontkijelölés vagy GPS
  console.log('Testing Bejelentés Wizard Step 2 (Location map)...');
  const step2Heading = await evaluate(`document.querySelector('h2')?.textContent || ''`);
  console.log('Step 2 heading:', step2Heading);

  // Tovább Step 3-ra
  await evaluate(`(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Tovább'));
    if (nextBtn) nextBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 800));

  // Step 3 teszt: Adatkezelési tájékoztató modal megnyitása
  console.log('Testing Privacy Policy modal open on Step 3...');
  const privacyLinkFound = await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('adatkezelési tájékoztatót'));
    if (btn) { btn.click(); return true; }
    return false;
  })()`);
  console.log('Clicked privacy policy link:', privacyLinkFound);
  await new Promise(r => setTimeout(r, 600));

  const privacyModalHeader = await evaluate(`document.querySelector('.fixed h2')?.textContent || ''`);
  console.log('Privacy modal header:', privacyModalHeader);

  // Bezárás
  await evaluate(`(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  // 3. Térkép / Diszpécser nézet tesztelése
  await navigate('http://localhost:3000/terkep', 3000);
  console.log('Testing Diszpécser Műszerfal & Map...');

  const clustersCount = await evaluate(`document.querySelectorAll('.marker-cluster').length`);
  const pinsCount = await evaluate(`document.querySelectorAll('.custom-map-pin').length`);
  const fuzzyBadgesCount = await evaluate(`document.querySelectorAll('.fuzzy-center-badge').length`);
  const circlesCount = await evaluate(`document.querySelectorAll('path.leaflet-interactive').length`);
  console.log(`Map loaded. Clusters: ${clustersCount}, Pins: ${pinsCount}, Fuzzy Paw Badges: ${fuzzyBadgesCount}, 100m Circles: ${circlesCount}`);

  if (clustersCount > 0) {
    console.log('Testing cluster click...');
    await evaluate(`document.querySelector('.marker-cluster').click()`);
    await new Promise(r => setTimeout(r, 1000));
    const pinsAfterCluster = await evaluate(`document.querySelectorAll('.custom-map-pin, .fuzzy-center-badge').length`);
    const circlesAfterCluster = await evaluate(`document.querySelectorAll('path.leaflet-interactive').length`);
    console.log(`Markers after cluster click: ${pinsAfterCluster}, 100m Circles: ${circlesAfterCluster}`);
  }

  // Pin kattintás és popup teszt
  console.log('Testing marker or 100m circle click...');
  const pinClicked = await evaluate(`(() => {
    const marker = document.querySelector('.custom-map-pin, .fuzzy-center-badge') || document.querySelector('path.leaflet-interactive');
    if (marker) { marker.click(); return true; }
    return false;
  })()`);
  console.log('Marker/Circle clicked:', pinClicked);
  await new Promise(r => setTimeout(r, 800));

  const popupVisible = await evaluate(`Boolean(document.querySelector('.leaflet-popup'))`);
  const popupHasProtectedNotice = await evaluate(`document.querySelector('.leaflet-popup')?.textContent?.includes('100m') || false`);
  console.log('Leaflet popup visible:', popupVisible, 'Has 100m protection notice:', popupHasProtectedNotice);

  if (popupVisible) {
    // Popup gombon lévő "Részletek & Koordináció" teszt
    console.log('Testing Details button inside Leaflet popup...');
    await evaluate(`(() => {
      const detailsBtn = document.querySelector('.leaflet-popup button');
      if (detailsBtn) detailsBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));
    const detailsModalTitle = await evaluate(`document.querySelector('.fixed.inset-0 span.font-extrabold')?.textContent || ''`);
    console.log('Details modal opened with title:', detailsModalTitle);

    // Modal bezárása háttérre kattintással (backdrop)
    console.log('Testing backdrop click to close modal...');
    await evaluate(`(() => {
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) backdrop.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));
    const modalClosed = await evaluate(`!document.querySelector('.fixed.inset-0')`);
    console.log('Modal successfully closed via backdrop:', modalClosed);
  }

  // Szűrők tesztelése a térképen
  console.log('Testing status filters on map...');
  await evaluate(`(() => {
    const filterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Folyamatban'));
    if (filterBtn) filterBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Megye szűrő
  await evaluate(`(() => {
    const select = document.querySelector('select');
    if (select && select.options.length > 1) {
      select.value = select.options[1].value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Visszaállítás mindegyikre
  await evaluate(`(() => {
    const filterAll = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Mindegyik') || b.textContent.includes('Összes'));
    if (filterAll) filterAll.click();
    const select = document.querySelector('select');
    if (select) {
      select.value = 'all';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // 4. Szervezetek oldal tesztelése
  await navigate('http://localhost:3000/szervezetek');
  console.log('Testing Szervezetek & Menhelyek page...');
  const orgCardsCount = await evaluate(`document.querySelectorAll('.rounded-2xl').length`);
  console.log('Organization cards rendered count:', orgCardsCount);

  // Kategória fül váltás
  await evaluate(`(() => {
    const vetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Állatorvos'));
    if (vetBtn) vetBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Ügyeletes szűrő
  await evaluate(`(() => {
    const dutyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('0-24') || b.textContent.includes('Ügyelet'));
    if (dutyBtn) dutyBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // 5. Elsősegély Kisokos tesztelése
  await navigate('http://localhost:3000/kisokos');
  console.log('Testing Elsősegély Kisokos page...');
  const guideSections = await evaluate(`document.querySelectorAll('.rounded-2xl').length`);
  console.log('Guide items rendered count:', guideSections);

  // Accordion / Részletek lenyitása
  console.log('Testing expanding guide card...');
  await evaluate(`(() => {
    const firstGuideCard = document.querySelector('div[class*="cursor-pointer"]');
    if (firstGuideCard) firstGuideCard.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // 6. Saját ügyeim oldal tesztelése
  await navigate('http://localhost:3000/ugyek');
  console.log('Testing Saját Ügyeim page...');
  const myReportsHeading = await evaluate(`document.querySelector('h1')?.textContent || ''`);
  console.log('My cases heading:', myReportsHeading);

  // 7. Admin oldal tesztelése nem bejelentkezettként
  await navigate('http://localhost:3000/admin');
  console.log('Testing Admin page access...');
  const adminPageContent = await evaluate(`document.body.innerText.slice(0, 200)`);
  console.log('Admin page response preview:', adminPageContent.replace(/\\n/g, ' '));

  console.log('\n========================================');
  console.log('TEST SUMMARY:');
  console.log('Total Console Messages:', consoleLogs.length);
  const errors = consoleLogs.filter(l => l.type === 'error' || l.type === 'uncaughtException');
  console.log('Console Errors:', errors.length);
  if (errors.length > 0) {
    console.log('Error details:', errors);
  }

  console.log('Total Network Errors (>= 400 or failed):', networkErrors.length);
  if (networkErrors.length > 0) {
    console.log('Network error details:', networkErrors);
  }
  console.log('========================================\n');

  ws.close();
  process.exit(errors.length > 0 || networkErrors.length > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test script runner error:', err);
  process.exit(1);
});
