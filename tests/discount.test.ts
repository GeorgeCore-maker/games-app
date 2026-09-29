import { discountPercent, discountTier } from '../src/pages/Games/discount';

let fallos = 0;
let total = 0;
function check(n: string, c: boolean, d = '') {
  total++;
  if (!c) fallos++;
  console.log(`${c ? 'PASA' : 'FALLA'}  ${n}${d ? '  -> ' + d : ''}`);
}

console.log('=== discountPercent: savings es porcentaje, no fraccion ===\n');
// Datos leidos de la API real.
check('savings="10.001667" -> 10', discountPercent({ savings: '10.001667', normalPrice: '59.99', salePrice: '53.99' }) === 10);
check('savings="95.0" -> 95', discountPercent({ savings: '95.0', normalPrice: '24.99', salePrice: '1.25' }) === 95);
check('savings="3.286148" -> 3', discountPercent({ savings: '3.286148', normalPrice: '19.78', salePrice: '19.13' }) === 3);
check('savings="100" no pasa de 100', discountPercent({ savings: '100', normalPrice: '24.99', salePrice: '0' }) === 100);

console.log('\n=== savings a 0 pero los precios si difieren ===\n');
// Caso real medido: Dying Light 2 y RoadCraft, isOnSale=1 con savings=0.
const borroso = discountPercent({ savings: '0', normalPrice: '49.99', salePrice: '19.99' });
check('recalcula desde los precios', borroso === 60, `${borroso}%`);
check('precios iguales -> 0', discountPercent({ savings: '0', normalPrice: '14.99', salePrice: '14.99' }) === 0);
check('precio cero (gratis) -> 100', discountPercent({ savings: '0', normalPrice: '24.99', salePrice: '0' }) === 100);

console.log('\n=== casos límite ===\n');
check('normalPrice vacio -> 0', discountPercent({ savings: '', normalPrice: '', salePrice: '' }) === 0);
check('normalPrice 0 -> 0 (no se divide por cero)', discountPercent({ savings: '0', normalPrice: '0', salePrice: '5' }) === 0);
check('savings no numerico -> recalcula', discountPercent({ savings: 'abc', normalPrice: '10', salePrice: '5' }) === 50);
check('salePrice mayor que normal -> 0', discountPercent({ savings: '0', normalPrice: '5', salePrice: '10' }) === 0);
check('siempre entero', Number.isInteger(discountPercent({ savings: '33.333333', normalPrice: '30', salePrice: '20' })));
check('nunca negativo', discountPercent({ savings: '0', normalPrice: '10', salePrice: '12' }) === 0);

console.log('\n=== discountTier: umbrales calibrados con datos reales ===\n');
const casos: Array<[number, string]> = [
  [100, 'fuego'], [75, 'fuego'], [70, 'fuego'],
  [69, 'alta'], [50, 'alta'],
  [49, 'media'], [25, 'media'],
  [24, 'baja'], [10, 'baja'],
  [9, 'sin'], [1, 'sin'], [0, 'sin'],
];
for (const [pct, esperado] of casos) {
  check(`${pct}% -> ${esperado}`, discountTier(pct) === esperado, `real: ${discountTier(pct)}`);
}

console.log('\n=== ¿aparece alguna vez el nivel "fuego"? ===\n');
// Medido: hay descuentos de 100, 95, 93, 92... en 720 ofertas. Si el umbral
// fuera 70 y no hubiera ninguno, el badge seria decoracion muerta.
for (const p of [100, 95, 90, 85, 80, 75, 70]) {
  check(`${p}% activa el icono de fuego`, discountTier(p) === 'fuego');
}

console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'} (${fallos} de ${total} comprobaciones)`);
process.exit(fallos === 0 ? 0 : 1);
