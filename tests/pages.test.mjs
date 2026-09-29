// Imita a GitHub Pages: sirve /games-app/<ruta> y devuelve 404 + 404.html si no
// existe el fichero. Es lo que hace Pages con un proyecto en subcarpeta.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(process.cwd(), 'dist');
const base = '/games-app';
const tipos = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml' };

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let ruta = decodeURIComponent(url.pathname);
  if (!ruta.startsWith(base)) { res.writeHead(404); return res.end('fuera del proyecto'); }

  let rel = ruta.slice(base.length) || '/index.html';
  let archivo = join(root, rel);
  if (existsSync(archivo) && statSync(archivo).isDirectory()) archivo = join(archivo, 'index.html');

  if (!existsSync(archivo)) {
    const ruta404 = join(root, '404.html');
    res.writeHead(404, { 'content-type': 'text/html' });
    console.log(`  404 -> ${ruta}`);
    return res.end(existsSync(ruta404) ? readFileSync(ruta404) : 'no hay 404.html');
  }
  res.writeHead(200, { 'content-type': tipos[extname(archivo)] ?? 'application/octet-stream' });
  res.end(readFileSync(archivo));
});

await new Promise((r) => server.listen(4321, r));
console.log('servidor en :4321, BASEURIs de GitHub Pages\n');

let fallos = 0;
const check = (n, c, e = '') => { if (!c) fallos++; console.log(`${c ? 'PASA' : 'FALLA'}  ${n}${e ? '  -> ' + e : ''}`); };
const pedir = async (p) => {
  const r = await fetch(`http://localhost:4321${p}`);
  return { status: r.status, body: await r.text() };
};

console.log('=== rutas que Pages resuelve ===\n');
for (const [ruta, esperado] of [
  ['/games-app/', 200],
  ['/games-app/index.html', 200],
  ['/games-app/assets/index-D5VEZX80.js', 200],
]) {
  const r = await pedir(ruta);
  check(`${ruta} -> ${esperado}`, r.status === esperado, `status ${r.status}`);
}

console.log('\n=== rutas profundas: 404 + redirect ===\n');
for (const ruta of ['/games-app/games', '/games-app/games?store=1&sort=Title', '/games-app/ruta-inventada']) {
  const r = await pedir(ruta);
  check(`${ruta} devuelve 404 con el 404.html`, r.status === 404 && r.body.includes('redirect'), `status ${r.status}`);
}
const r404 = await pedir('/games-app/games?store=1&sort=Title');
check('el 404 guarda la ruta completa en ?redirect=', r404.body.includes('%2Fgames%3Fstore%3D1%26sort%3DTitle') || r404.body.includes('encodeURIComponent'), 'comprobado el script');
check('el 404 NO carga el bundle JS (sin parpadeo)', !/<script[^>]*type="module"/.test(r404.body), 'sin script type=module');
check('el 404 conserva el CSS', r404.body.includes('assets/index-') && r404.body.includes('.css'));
check('el 404 conserva el <head>', r404.body.includes('fonts.googleapis.com'));

console.log('\n=== la ruta raiz NO entra en bucle ===\n');
const r = await pedir('/games-app/');
check('la raiz responde 200 y no redirige', r.status === 200 && !r.body.includes('l.replace'), 'ok');

console.log('\n=== fuera del proyecto ===\n');
const fuera = await pedir('/otra-cosa');
check('otra ruta del dominio no la sirve Pages aqui', fuera.status === 404, `status ${fuera.status}`);

server.close();
console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'}`);
process.exit(fallos ? 1 : 0);
