/** Un juego encaja si tiene CUALQUIERA de los generos pedidos (OR, no AND):
 *  con AND un juego de Accion+RPG+Indie desaparece en cuanto eliges dos. */
export function matchesGenres(
    gameGenres: string[] | undefined,
    selected: string[]
): boolean {
    if (selected.length === 0) return true;
    if (!gameGenres?.length) return false;

    const wanted = new Set(selected.map(normalize));
    return gameGenres.some((genre) => wanted.has(normalize(genre)));
}

/** Sin tildes: en una URL escrita a mano "accion" tiene que encontrar "Acción",
 *  y en un teclado español es facil no pulsar la tilde. */
export function normalize(genre: string): string {
  return genre
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export type GenreCount = {
    genre: string;
    count: number;
};

/** Generos presentes en la pagina actual, de mas a menos frecuente. Los
 *  empates van por orden alfabetico para que la barra no baile entre recargas. */
export function collectGenres(games: Array<{ genres: string[] }>): GenreCount[] {
    const counts = new Map<string, GenreCount>();

    for (const game of games) {
        // Un juego con Action y RPG cuenta en los dos, no solo en el primero.
        for (const genre of new Set(game.genres.map(normalize))) {
            const original =
                game.genres.find((candidate) => normalize(candidate) === genre) ?? genre;
            const entry = counts.get(genre);
            if (entry) {
                entry.count += 1;
            } else {
                counts.set(genre, { genre: original, count: 1 });
            }
        }
    }

    return [...counts.values()].sort(
        (a, b) => b.count - a.count || a.genre.localeCompare(b.genre, 'es')
    );
}

/** Los seleccionados siempre se ofrecen, aunque no haya coincidencias en esta
 *  pagina: si desaparecieran del menu no habria forma de deseleccionarlos. */
export function mergeGenreOptions(
    available: GenreCount[],
    selected: string[]
): GenreCount[] {
    const present = new Set(available.map((entry) => normalize(entry.genre)));
    const missing = selected
        .filter((genre) => !present.has(normalize(genre)))
        .map((genre) => ({ genre, count: 0 }));

    return [...available, ...missing];
}

export function toggleGenre(selected: string[], genre: string): string[] {
    const key = normalize(genre);
    return selected.some((item) => normalize(item) === key)
        ? selected.filter((item) => normalize(item) !== key)
        : [...selected, genre];
}
