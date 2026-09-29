const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

/** CheapShark devuelve "0", "" o valores sueltos tipo "null" si no hay appid. */
export function hasSteamAppId(steamAppID: string | null | undefined): steamAppID is string {
  return typeof steamAppID === 'string' && /^\d+$/.test(steamAppID) && steamAppID !== '0';
}

/** header.jpg mide 460x215 y encaja con la caja de la tarjeta. */
export function steamHeaderUrl(steamAppID: string): string {
  return `${STEAM_CDN}/${steamAppID}/header.jpg`;
}

type CoverSource = {
  steamAppID: string;
  thumb: string;
};

/**
 * El thumb de CheapShark es un capsule_231x87 borroso al estirarlo, asi que va
 * de reserva. Hace falta porque solo el 8% de las ofertas tiene appid, y aun
 * con appid header.jpg no siempre existe (bundles de GOG).
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
