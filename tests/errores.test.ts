import http from 'node:http';
import axios from 'axios';
import { getErrorMessage, getErrorStatus, isNotFound } from '../src/lib/errors';

let fallos = 0;
let total = 0;
function check(nombre: string, condicion: boolean, detalle = '') {
  total++;
  if (!condicion) fallos++;
  console.log(`${condicion ? 'PASA' : 'FALLA'}  ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

async function main() {
  const servidor = http.createServer((req, res) => {
    switch (req.url) {
      case '/500':
        res.writeHead(500).end('boom');
        return;
      case '/429':
        res.writeHead(429).end('demasiadas');
        return;
      case '/400':
        res.writeHead(400).end('mal');
        return;
      case '/html':
        // Esto es lo que devuelve /steam-api/... en produccion: el index.html
        res.writeHead(200, { 'Content-Type': 'text/html' }).end('<!doctype html><html></html>');
        return;
      default:
        res.writeHead(404).end();
    }
  });

  await new Promise<void>((r) => servidor.listen(0, '127.0.0.1', () => r()));
  const address = servidor.address();
  const puerto = typeof address === 'object' && address ? address.port : 0;
  const base = `http://127.0.0.1:${puerto}`;

  async function axiosFalla(ruta: string) {
    try {
      await axios.get(`${base}${ruta}`);
      throw new Error(`se esperaba fallo en ${ruta}`);
    } catch (e) {
      return e;
    }
  }

  console.log('=== getErrorMessage contra errores HTTP reales ===\n');

  const e500 = await axiosFalla('/500');
  check('500 => problema del servidor', getErrorMessage(e500).includes('servidor esta teniendo problemas'), getErrorMessage(e500));
  check('500 no culpa a la red', !getErrorMessage(e500).includes('internet'));

  const e429 = await axiosFalla('/429');
  check('429 => avisar de esperar', getErrorMessage(e429).includes('Espera unos segundos'), getErrorMessage(e429));

  const e400 = await axiosFalla('/400');
  check('400 => cambiar filtros', getErrorMessage(e400).includes('filtros'), getErrorMessage(e400));

  console.log('\n=== red caida (sin respuesta) ===\n');
  const sinRed = new axios.AxiosError('Network Error', axios.AxiosError.ERR_NETWORK);
  check('sin respuesta => conexion', getErrorMessage(sinRed).includes('conexion a internet'), getErrorMessage(sinRed));
  check('sin respuesta => status undefined', getErrorStatus(sinRed) === undefined);

  console.log('\n=== respuesta no-JSON (lo queARIA un despliegue estatico) ===\n');
  const resHtml = await fetch(`${base}/html`);
  const esJson = resHtml.headers.get('content-type')?.includes('application/json');
  check('sin proxy, la ruta cae en el index.html del SPA', esJson === false, `content-type: ${resHtml.headers.get('content-type')}`);
  try {
    await resHtml.json();
    check('json() lanza sobre HTML (el guard es necesario)', false, 'no lanzo');
  } catch (e) {
    check('json() lanza SyntaxError sobre HTML', e instanceof SyntaxError, (e as Error).name);
    check('SyntaxError => "no se pudo interpretar"', getErrorMessage(e).includes('no se pudo interpretar'), getErrorMessage(e));
  }

  console.log('\n=== errores no-HTTP ===\n');
  check('TypeError (fetch sin red) => conexion', getErrorMessage(new TypeError('Failed to fetch')).includes('conexion a internet'));
  check('string suelta => fallback', getErrorMessage('algo raro').includes('error inesperado'), getErrorMessage('algo raro'));
  check('undefined => fallback', getErrorMessage(undefined).includes('error inesperado'));
  check('fallback custom se sustituye', getErrorMessage(undefined, 'texto propio') === 'texto propio');
  check('fallback custom tambien aplica a errores', getErrorMessage(e500, 'texto propio') !== 'texto propio', 'usa el mensaje del status, no el custom');

  console.log('\n=== isNotFound ===\n');
  const e404 = await axiosFalla('/404');
  check('404 se detecta', isNotFound(e404));
  check('500 no se detecta como 404', !isNotFound(e500));
  check('sin red no se detecta como 404', !isNotFound(sinRed));

  servidor.close();
  console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'} (${fallos} de ${total} comprobaciones)`);
  process.exit(fallos === 0 ? 0 : 1);
}

main();
