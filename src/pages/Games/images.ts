const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

/**
 * CheapShark devuelve "0" o "" cuando el juego no esta en Steam, pero tambien
 * hay valores sueltos tipo "null". Solo se acepta un appid numerico.
 */
export function hasSteamAppId(steamAppID: string | null | undefined): steamAppID is string {
  return typeof steamAppID === 'string' && /^\d+$/.test(steamAppID) && steamAppID !== '0';
}

/**
 * header.jpg mide 460x215 (ratio 2.140), que encaja casi exacto con la caja de
 * 210px de alto de la tarjeta (ratio 2.119). Se eligio este y no
 * library_600x900.jpg porque ese ultimo mide 300x450 de verdad, no 600x900:
 * a 445px de ancho habria que reescalar 1.48x y se veria borroso.
 */
export function steamHeaderUrl(steamAppID: string): string {
  return `${STEAM_CDN}/${steamAppID}/header.jpg`;
}

type CoverSource = {
  steamAppID: string;
  thumb: string;
};

/**
 * Lista de portadas candidatas en orden de preferencia.
 *
 * El thumb de CheapShark es un capsule_231x87: se ve borroso al estirarlo, asi
 * que solo entra como reserva. Hace falta porque con el filtro "todas las
 * tiendas" solo el 8% de las ofertas tiene steamAppID, y aun teniendolo
 * header.jpg no siempre existe (comprobado con bundles de GOG).
 */
export function coverCandidates(game: CoverSource): string[] {
  const candidatos: string[] = [];

  if (hasSteamAppId(game.steamAppID)) {
    candidatos.push(steamHeaderUrl(game.steamAppID));
  }
  if (game.thumb) {
    candidatos.push(game.thumb);
  }

  return [...new Set(candidatos)];
}
