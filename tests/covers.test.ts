import { coverCandidates, hasSteamAppId, steamHeaderUrl } from '../src/pages/Games/images';

let fallos = 0;
let total = 0;
function check(nombre: string, condicion: boolean, detalle = '') {
  total++;
  if (!condicion) fallos++;
  console.log(`${condicion ? 'PASA' : 'FALLA'}  ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

const THUMB = 'https://shared.fastly.steamstatic.com/x/capsule_231x87.jpg';

console.log('=== hasSteamAppId ===\n');
check('220 es valido', hasSteamAppId('220'));
check('"0" NO es valido (asi lo manda CheapShark)', !hasSteamAppId('0'));
check('"" no es valido', !hasSteamAppId(''));
check('undefined no es valido', !hasSteamAppId(undefined));
check('null no es valido', !hasSteamAppId(null));
check('"null" (string) no es valido', !hasSteamAppId('null'));
check('"undefined" (string) no es valido', !hasSteamAppId('undefined'));
check('"abc" no es valido', !hasSteamAppId('abc'));
check('"-1" no es valido', !hasSteamAppId('-1'));
check('"22 0" no es valido', !hasSteamAppId('22 0'));
check('"220" con espacios no es valido', !hasSteamAppId(' 220'));

console.log('\n=== steamHeaderUrl ===\n');
check(
  'construye la ruta de Steam',
  steamHeaderUrl('220') === 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg',
  steamHeaderUrl('220')
);

console.log('\n=== coverCandidates: orden de preferencia ===\n');
const conAmbos = coverCandidates({ steamAppID: '1057090', thumb: THUMB });
check('con appid: Steam primero', conAmbos[0].includes('cdn.cloudflare.steamstatic.com'), conAmbos[0]);
check('con appid: el thumb va segundo', conAmbos[1] === THUMB, conAmbos[1]);
check('con appid: 2 candidatos', conAmbos.length === 2);

const sinAppid = coverCandidates({ steamAppID: '0', thumb: THUMB });
check('sin appid: solo el thumb', sinAppid.length === 1 && sinAppid[0] === THUMB, sinAppid.join(' | '));

const sinNada = coverCandidates({ steamAppID: '0', thumb: '' });
check('sin appid ni thumb: lista vacia (placeholder)', sinNada.length === 0);

console.log('\n=== coverCandidates: casos raros ===\n');
check('appid basura no genera URL de Steam', coverCandidates({ steamAppID: 'null', thumb: THUMB }).length === 1);
const duplicadas = coverCandidates({ steamAppID: '220', thumb: steamHeaderUrl('220') });
check('no repite la misma URL', duplicadas.length === 1, duplicadas.join(' | '));
check('sin thumb pero con appid: 1 candidato', coverCandidates({ steamAppID: '220', thumb: '' }).length === 1);

console.log('\n=== el caso que mas se repite: filtro "todas las tiendas" ===\n');
// Medido sobre una pagina real: solo el 8% de las ofertas tiene appid.
const todas = [
  { steamAppID: '0', thumb: THUMB },
  { steamAppID: '', thumb: THUMB },
  { steamAppID: '413150', thumb: THUMB },
  { steamAppID: '0', thumb: THUMB },
];
const conSteam = todas.filter((g) => hasSteamAppId(g.steamAppID)).length;
const conReserva = todas.filter((g) => coverCandidates(g).length > 0).length;
check('pocas tienen portada de Steam', conSteam === 1, `${conSteam}/4 con appid`);
check('pero TODAS tienen alguna imagen gracias al thumb', conReserva === 4, `${conReserva}/4 con portada`);

console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'} (${fallos} de ${total} comprobaciones)`);
process.exit(fallos === 0 ? 0 : 1);
