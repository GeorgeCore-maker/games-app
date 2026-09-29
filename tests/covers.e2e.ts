import { coverCandidates } from '../src/pages/Games/images';

const UA = 'games-app/1.0 (jorge@example.com)';
const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

async function existe(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return r.status;
  } catch {
    return 0;
  }
}

async function pagina(params: string) {
  const r = await fetch(`https://www.cheapshark.com/api/1.0/deals?${params}`, {
    headers: { 'User-Agent': UA },
  });
  return (await r.json()) as Array<{ steamAppID: string; thumb: string }>;
}

let fallos = 0;
let total = 0;
function check(n: string, c: boolean, d = '') {
  total++;
  if (!c) fallos++;
  console.log(`${c ? 'PASA' : 'FALLA'}  ${n}${d ? '  -> ' + d : ''}`);
}

async function main() {
  console.log('=== Solo Steam (filtro por defecto) ===\n');
  const steam = (await pagina('storeID=1&pageNumber=0&pageSize=60&upperPrice=15&sortBy=Savings&desc=1')).slice(0, 30);
  let okPrimero = 0, okAlguna = 0, placeholders = 0;

  for (const g of steam) {
    const cands = coverCandidates(g);
    if (cands.length === 0) { placeholders++; continue; }
    const s0 = await existe(cands[0]);
    if (s0 >= 200 && s0 < 300) { okPrimero++; continue; }
    // Caso real: existe appid pero no hay header.jpg (lo vimos en bundles).
    const s1 = await existe(cands[1]);
    if (s1 >= 200 && s1 < 300) okAlguna++;
  }
  console.log(`Con portada de Steam (header.jpg):  ${okPrimero}/${steam.length}`);
  console.log(`Reservadas al thumb de CheapShark: ${okAlguna}`);
  console.log(`Sin ninguna imagen:                ${placeholders}`);
  check('casi todas las de Steam usan header.jpg', okPrimero >= steam.length - 2, `${okPrimero}/${steam.length}`);
  check('ninguna de Steam se queda sin imagen', okPrimero + okAlguna + placeholders === steam.length);

  console.log('\n=== Todas las tiendas, sin ordenar por Savings ===\n');
// Sin sortBy la mayoria son de otras tiendas, que es lo que ejercita la
// reserva. Con sortBy=Savings manda Steam y casi todas tienen header.jpg.
  const todas = (await pagina('pageNumber=0&pageSize=60&upperPrice=15')).slice(0, 30);
  let conSteam = 0, soloThumb = 0, sinNada = 0;
  for (const g of todas) {
    const cands = coverCandidates(g);
    if (cands.length === 0) { sinNada++; continue; }
    if (cands[0].startsWith(CDN) && (await existe(cands[0])) < 300) conSteam++;
    else soloThumb++;
  }
  console.log(`Portada de Steam:  ${conSteam}/${todas.length}`);
  console.log(`Solo thumb:        ${soloThumb}/${todas.length}`);
  console.log(`Sin imagen:        ${sinNada}`);
  check('la reserva al thumb se usa de verdad', soloThumb > 0, `${soloThumb} juegos fuera de Steam`);
  check('el filtro "todas las tiendas" no deja huecos', sinNada === 0, `${sinNada} sin imagen`);

  console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'} (${fallos} de ${total})`);
  process.exit(fallos === 0 ? 0 : 1);
}

main();
