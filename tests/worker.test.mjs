// Simula el runtime de Cloudflare: caches.default + Request/Response nativos.
const store = new Map();
globalThis.caches = {
  default: {
    async match(req) {
      const hit = store.get(req.url);
      if (!hit) return undefined;
      return new Response(hit.body, { headers: hit.headers });
    },
    async put(req, res) {
      store.set(req.url, { body: await res.text(), headers: Object.fromEntries(res.headers) });
    },
  },
};

const { default: worker } = await import('../worker/steam-proxy.js');
const call = (url, init) => worker.fetch(new Request(url, init));

let fallos = 0;
const check = (n, c, e = '') => { if (!c) fallos++; console.log(`${c ? 'PASA' : 'FALLA'}  ${n}${e ? '  -> ' + e : ''}`); };
const URL_BASE = 'https://proxy.workers.dev';

console.log('=== validacion: no puede usarse como proxy abierto ===\n');
for (const ruta of ['/', '/api/appdetails', '/appdetails/../store', '/deals?appids=1']) {
  const r = await call(`${URL_BASE}${ruta}`);
  check(`404 en ${ruta}`, r.status === 404, `status ${r.status}`);
}
for (const appid of ['', 'abc', '0', '-1', '1 OR 1=1', '../admin', '99999999999', '1e5']) {
  const r = await call(`${URL_BASE}/appdetails?appids=${encodeURIComponent(appid)}`);
  check(`400 con appid "${appid}"`, r.status === 400, `status ${r.status}`);
}
const post = await call(`${URL_BASE}/appdetails?appids=292030`, { method: 'POST' });
check('405 en POST', post.status === 405, `status ${post.status}`);

console.log('\n=== CORS: el navegador tiene que poder llamarlo ===\n');
const preflight = await call(`${URL_BASE}/appdetails?appids=292030`, { method: 'OPTIONS' });
check('preflight 204', preflight.status === 204);
check('allow-origin: *', preflight.headers.get('access-control-allow-origin') === '*');
const real = await call(`${URL_BASE}/appdetails?appids=292030`);
check('CORS tambien en la respuesta real', real.headers.get('access-control-allow-origin') === '*');
check('content-type json', real.headers.get('content-type').includes('application/json'));

console.log('\n=== respuesta real de Steam ===\n');
const r1 = await call(`${URL_BASE}/appdetails?appids=1245620`);
const j1 = await r1.json();
check('status 200', r1.status === 200);
check('mantiene la forma { appid: { success, data } }', j1['1245620'] !== undefined);
check('success true para Elden Ring', j1['1245620'].success === true);
check('trae descripcion', typeof j1['1245620'].data.short_description === 'string');
check('trae generos en español', Array.isArray(j1['1245620'].data.genres) && j1['1245620'].data.genres.length > 0, JSON.stringify(j1['1245620'].data.genres));
check('no se filtra el resto de campos de Steam', !('price_overview' in j1['1245620'].data) && !('screenshots' in j1['1245620'].data), 'campos: ' + Object.keys(j1['1245620'].data).join(','));
check('primer fetch = MISS', r1.headers.get('x-proxy-cache') === 'MISS');

console.log('\n=== cache: el segundo fetch no vuelve a Steam ===\n');
const antes = store.size;
const r2 = await call(`${URL_BASE}/appdetails?appids=1245620`);
check('segundo fetch = HIT', r2.headers.get('x-proxy-cache') === 'HIT');
check('mismo cuerpo', JSON.stringify(await r2.json()) === JSON.stringify(j1));
check('no se Adds una entrada nueva', store.size === antes, `antes ${antes}, ahora ${store.size}`);

console.log('\n=== appid inexistente ===\n');
const r3 = await call(`${URL_BASE}/appdetails?appids=999999999`);
const j3 = await r3.json();
check('200 con success false (no 404)', r3.status === 200);
check('success false', j3['999999999'].success === false);
check('data null', j3['999999999'].data === null);
const r4 = await call(`${URL_BASE}/appdetails?appids=999999999`);
check('el fallo tambien se cachea (no repreguntar)', r4.headers.get('x-proxy-cache') === 'HIT');

console.log('\n=== idiomas ===\n');
const antesLangs = store.size;
await call(`${URL_BASE}/appdetails?appids=1091500&l=spanish`);
check('spanish anade entrada', store.size === antesLangs + 1);
await call(`${URL_BASE}/appdetails?appids=1091500&l=english`);
check('english anade entrada aparte', store.size === antesLangs + 2);
const sinL = await call(`${URL_BASE}/appdetails?appids=1091500`);
check('sin l usa spanish (y no anade)', sinL.headers.get('x-proxy-cache') === 'HIT' && store.size === antesLangs + 2);
const raro = await call(`${URL_BASE}/appdetails?appids=1091500&l=../../evil`);
check('l se ignora si no esta en la lista blanca', raro.headers.get('x-proxy-cache') === 'HIT' && store.size === antesLangs + 2);

console.log('\n=== ráfaga: 15 visitantes en frío por el mismo juego ===\n');
let origenes = 0;
const fetchReal = globalThis.fetch;
globalThis.fetch = (...args) => { origenes++; return fetchReal(...args); };
const appidRayo = 413150;
const rafaga = await Promise.all(
  Array.from({ length: 15 }, () => call(`${URL_BASE}/appdetails?appids=${appidRayo}`))
);
globalThis.fetch = fetchReal;
check('los 15 responden bien', rafaga.every((r) => r.status === 200));
check('todos con el mismo cuerpo', new Set(rafaga.map((r) => r.headers.get('x-proxy-cache'))).size === 1);
check('Steam contactado UNA sola vez', origenes === 1, `veces: ${origenes}`);

console.log('\n=== peso de lo cacheado ===\n');
const totales = [...store.entries()];
for (const [k, v] of totales) console.log(`  ${k.split('?')[1].padEnd(28)} ${(v.body.length / 1024).toFixed(2)} KB`);
console.log(`media: ${(totales.reduce((a, [, v]) => a + v.body.length, 0) / totales.length / 1024).toFixed(2)} KB`);

console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'}`);
process.exit(fallos ? 1 : 0);
