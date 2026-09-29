import {
  collectGenres,
  matchesGenres,
  mergeGenreOptions,
  normalize,
  toggleGenre,
} from '../src/pages/Games/genreFilter';

let fallos = 0;
let total = 0;
function check(nombre: string, condicion: boolean, extra = '') {
  total++;
  if (!condicion) fallos++;
  console.log(`${condicion ? 'PASA' : 'FALLA'}  ${nombre}${extra ? '  -> ' + extra : ''}`);
}

console.log('=== matchesGenres: sin filtro deja pasar todo ===\n');
check('juego sin generos pasa si no hay filtro', matchesGenres(undefined, []));
check('juego con generos pasa si no hay filtro', matchesGenres(['Acción'], []));

console.log('\n=== matchesGenres: OR, no AND ===\n');
check('coincide con uno de varios', matchesGenres(['Acción', 'Rol'], ['Rol']));
check('no coincide con ninguno', !matchesGenres(['Acción'], ['Deportes']));
check('sin datos y con filtro = fuera', !matchesGenres(undefined, ['Acción']));
check('lista vacia y con filtro = fuera', !matchesGenres([], ['Acción']));
// Si fuera AND, esto devolveria false y el usuario perderia los hybrids.
check('Acción+Rol con filtro [Acción, Indie] entra (OR)', matchesGenres(['Acción', 'Rol'], ['Acción', 'Indie']));
check('no exige todos los elegidos', matchesGenres(['Acción'], ['Acción', 'Deportes', 'Indie']));

console.log('\n=== acentos y mayusculas: la URL se puede escribir a mano ===\n');
check('"accion" minúscula encuentra "Acción"', matchesGenres(['Acción'], ['accion']));
check('"ACCIÓN" mayúscula encuentra "Acción"', matchesGenres(['Acción'], ['ACCIÓN']));
check('espacios alrededor', matchesGenres(['Acción'], ['  Acción  ']));
check('normalize es estable', normalize('  Indie ') === 'indie');
check('locale español: la Ñ y los acentos no se rompen', normalize('Aventura') === normalize('aventura'));

console.log('\n=== collectGenres: cuenta por juego, no por genero repetido ===\n');
const juegos = [
  { genres: ['Acción', 'Rol'] },
  { genres: ['Acción', 'Indie'] },
  { genres: ['Acción'] },
];
const contados = collectGenres(juegos);
check('Acción x3', contados[0].genre === 'Acción' && contados[0].count === 3, JSON.stringify(contados));
check('desempate alfabetico (Indie antes que Rol)', contados[1].genre === 'Indie');
check('nombre original conservado', contados.find((c) => c.genre === 'Rol')?.genre === 'Rol');

console.log('\n=== collectGenres: un juego con el mismo genero dos veces ===\n');
const duplicados = collectGenres([{ genres: ['Acción', 'acción'] }]);
check('cuenta 1, no 2', duplicados[0].count === 1, JSON.stringify(duplicados));

console.log('\n=== collectGenres: vacio ===\n');
check('sin juegos -> lista vacia', collectGenres([]).length === 0);
check('generos vacios no crean entradas', collectGenres([{ genres: [] }]).length === 0);

console.log('\n=== mergeGenreOptions: lo seleccionado nunca desaparece ===\n');
const disponibles = [{ genre: 'Acción', count: 3 }];
const conHuerfano = mergeGenreOptions(disponibles, ['Deportes']);
check('mantiene el seleccionado ausente', conHuerfano.some((o) => o.genre === 'Deportes'));
check('con count 0', conHuerfano.find((o) => o.genre === 'Deportes')?.count === 0);
check('no duplica si ya estaba', mergeGenreOptions(disponibles, ['Acción']).length === 1);
check('respeta mayusculas al comparar', mergeGenreOptions(disponibles, ['accion']).length === 1);

console.log('\n=== toggleGenre: alternar ===\n');
check('anade si no estaba', toggleGenre([], 'Acción').join() === 'Acción');
check('quita si estaba', toggleGenre(['Acción'], 'Acción').length === 0);
check('anade al final', toggleGenre(['Acción'], 'Indie').join() === 'Acción,Indie');
check('no duplica por acentos', toggleGenre(['Acción'], 'accion').length === 0);
// Alternar un equivalente lo deselecciona: la seleccion es un conjunto, y el
// chip que se pinte sera el de la pagina actual.
check('alternar "accion" sobre "Acción" la quita', toggleGenre(['accion'], 'Acción').length === 0);
check('guarda el nombre tal cual llega', toggleGenre([], 'Acción')[0] === 'Acción');

console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLOS'} (${fallos} de ${total} comprobaciones)`);
process.exit(fallos === 0 ? 0 : 1);
