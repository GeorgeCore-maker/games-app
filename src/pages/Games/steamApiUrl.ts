/** Sin variable, en dev el proxy de vite.config.ts hace de intermediario. En
 *  produccion hay que apuntar al worker: si no, la ruta devuelve el index.html
 *  del sitio y json() revienta en las 60 tarjetas de la pagina. */
export function buildSteamApiUrl(proxyUrl?: string): string {
    const base = proxyUrl?.trim().replace(/\/+$/, "");
    if (!base) return "/steam-api/appdetails";

    // Lo normal es pegar solo el dominio del worker, pero la URL que se ve en
    // las devtools ya trae /appdetails. Sin esto salia /appdetails/appdetails y
    // el worker respondia 404, dejando las tarjetas sin descripcion sin avisar.
    const sinRuta = base.replace(/\/appdetails$/, "");

    return `${sinRuta}/appdetails`;
}
