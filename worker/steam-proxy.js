const STEAM_ORIGIN = "https://store.steampowered.com";

const TTL_OK = 60 * 60 * 24 * 7;
const TTL_NOT_FOUND = 60 * 60 * 24;

const ALLOWED_LANGS = new Set(["spanish", "english"]);

const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
};

// Steam responde 403 a clientes sin User-Agent reconocible.
const UPSTREAM_HEADERS = {
    "user-agent": "Mozilla/5.0 (compatible; games-app-proxy; +portfolio)",
    accept: "application/json",
};

// La Cache API no colapsa peticiones simultaneas del mismo recurso, asi que sin
// esto 20 visitantes en frio hacen 20 peticiones a Steam por el mismo juego.
const inFlight = new Map();

function json(body, status, extra = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json; charset=utf-8", ...CORS, ...extra },
    });
}

/** Steam manda ~38 KB por juego y solo nos interesan tres campos: recortado son
 *  0.37 KB. Cacheando crudo solo caben 13.700 juegos en el tope de 512 MB. */
function trim(payload, appid) {
    const entry = payload?.[appid];
    const ok = Boolean(entry?.success && entry?.data);

    return {
        [appid]: {
            success: ok,
            data: ok
                ? {
                      short_description: entry.data.short_description ?? null,
                      controller_support: entry.data.controller_support ?? null,
                      genres: Array.isArray(entry.data.genres)
                          ? entry.data.genres.map((genre) => ({
                                id: genre.id,
                                description: genre.description,
                            }))
                          : [],
                  }
                : null,
        },
    };
}

async function fromSteam(appid, lang) {
    const target = `${STEAM_ORIGIN}/api/appdetails?appids=${appid}&l=${lang}`;

    const response = await fetch(target, { headers: UPSTREAM_HEADERS });
    if (!response.ok) {
        throw new Error(`Steam devolvio ${response.status}`);
    }

    const payload = await response.json();
    const body = trim(payload, appid);
    const found = body[appid].success;

    const cacheKey = new Request(target);
    const ttl = found ? TTL_OK : TTL_NOT_FOUND;
    await caches.default.put(
        cacheKey,
        new Response(JSON.stringify(body), {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "cache-control": `public, max-age=${ttl}`,
                ...CORS,
            },
        })
    );

    return { body, found };
}

export default {
    async fetch(request) {
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS });
        }
        if (request.method !== "GET") {
            return json({ error: "method not allowed" }, 405);
        }

        const url = new URL(request.url);
        // Sin esto el worker seria un proxy abierto a todo Steam.
        if (url.pathname !== "/appdetails") {
            return json({ error: "not found" }, 404);
        }

        const appid = url.searchParams.get("appids") ?? "";
        if (!/^\d{1,10}$/.test(appid) || appid === "0") {
            return json({ error: "appid invalido" }, 400);
        }

        const requested = url.searchParams.get("l");
        const lang = ALLOWED_LANGS.has(requested) ? requested : "spanish";

        const cacheKey = new Request(
            `${STEAM_ORIGIN}/api/appdetails?appids=${appid}&l=${lang}`
        );

        const hit = await caches.default.match(cacheKey);
        if (hit) {
            const cached = new Response(hit.body, hit);
            cached.headers.set("x-proxy-cache", "HIT");
            return cached;
        }

        const key = `${appid}:${lang}`;
        let pending = inFlight.get(key);
        if (!pending) {
            pending = fromSteam(appid, lang).finally(() => inFlight.delete(key));
            inFlight.set(key, pending);
        }

        try {
            const { body } = await pending;
            return json(body, 200, { "x-proxy-cache": "MISS" });
        } catch (error) {
            return json(
                { error: "No se pudo contactar con Steam", detalle: String(error) },
                502
            );
        }
    },
};
