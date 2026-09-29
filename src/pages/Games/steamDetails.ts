import { buildSteamApiUrl } from "./steamApiUrl";

const STALE_TIME = 1000 * 60 * 60 * 24;

const STEAM_API = buildSteamApiUrl(import.meta.env.VITE_STEAM_PROXY_URL);

type SteamAppDetails = {
    success: boolean;
    data?: {
        short_description?: string;
        controller_support?: string;
        genres?: Array<{ id: number; description: string }>;
    };
};

export type GameDetails = {
    description: string | null;
    hasController: boolean;
    genres: string[];
};

export const EMPTY_DETAILS: GameDetails = {
    description: null,
    hasController: false,
    genres: [],
};

export function steamDetailsKey(steamAppID: string) {
    return ["steam-details", steamAppID] as const;
}

export async function fetchSteamDetails(steamAppID: string): Promise<GameDetails> {
    const response = await fetch(`${STEAM_API}?appids=${steamAppID}&l=spanish`);

    // Un 5xx es transitorio: que react-query lo reintente tiene sentido.
    if (response.status >= 500) {
        throw new Error(`Steam respondio ${response.status}`);
    }

    // El proxy de dev devuelve el index.html ante un despliegue estatico sin
    // VITE_STEAM_PROXY_URL, y el worker devuelve 502. En ambos casos no vale la
    // pena reintentar: 60 tarjetas x 3 intentos contra el mismo fallo.
    const isJson = response.headers.get("content-type")?.includes("application/json");

    if (!response.ok || !isJson) return EMPTY_DETAILS;

    const details = (await response.json())[steamAppID] as SteamAppDetails | undefined;

    // Steam contesta { success: false } cuando no conoce el appid.
    if (!details?.success || !details.data) return EMPTY_DETAILS;

    const { short_description, controller_support, genres } = details.data;

    return {
        description: short_description?.trim() || null,
        // El dato de Steam esta incompleto (The Witcher 3, CS2 y Dota 2 lo
        // tienen vacio pese a admitir mando): esto dice "Steam afirma que
        // tiene mando", nunca que el juego no lo tenga.
        hasController: controller_support === "full",
        genres: genres?.map((genre) => genre.description) ?? [],
    };
}

export const steamDetailsOptions = (steamAppID: string) => ({
    queryKey: steamDetailsKey(steamAppID),
    queryFn: () => fetchSteamDetails(steamAppID),
    enabled: Boolean(steamAppID) && steamAppID !== "0",
    staleTime: STALE_TIME,
    // 60 tarjetas piden datos a la vez: un fallo no debe dar 60 x 3 reintentos.
    retry: 1,
});
