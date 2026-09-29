import { buildSteamApiUrl } from '../src/pages/Games/steamApiUrl';

let fallos = 0;
let total = 0;
function check(nombre: string, condicion: boolean, extra = '') {
  total++;
  if (!condicion) fallos++;
  console.log(`${condicion ? 'PASA' : 'FALLA'}  ${nombre}${extra ? '  -> ' + extra : ''}`);
}

console.log('=== dev: sin variable, vite.config.ts hace de proxy ===\n');
check('sin variable', buildSteamApiUrl(undefined) === '/steam-api/appdetails');
check('variable vacia', buildSteamApiUrl('') === '/steam-api/appdetails');
check('solo espacios', buildSteamApiUrl('   ') === '/steam-api/appdetails');

console.log('\n=== produccion: la variable apunta al worker ===\n');
const base = 'https://games-app-steam-proxy.tu-usuario.workers.dev';
check('URL normal', buildSteamApiUrl(base) === `${base}/appdetails`, buildSteamApiUrl(base));
check('con barra final', buildSteamApiUrl(`${base}/`) === `${base}/appdetails`, buildSteamApiUrl(`${base}/`));
check('con varias barras', buildSteamApiUrl(`${base}///`) === `${base}/appdetails`, buildSteamApiUrl(`${base}///`));
check('con espacios alrededor', buildSteamApiUrl(`  ${base}  `) === `${base}/appdetails`);
check('no duplica /appdetails', !buildSteamApiUrl(`${base}/appdetails`).endsWith('/appdetails/appdetails'));

console.log('\n=== lo que espera el worker en la otra punta ===\n');
const conProxy = buildSteamApiUrl(base);
check('el worker solo sirve /appdetails', conProxy.endsWith('/appdetails'));
check('el worker rechaza paths distintos', !conProxy.includes('/api/appdetails'), conProxy);
check('host https', conProxy.startsWith('https://'));

console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'} (${fallos} de ${total} comprobaciones)`);
process.exit(fallos === 0 ? 0 : 1);
