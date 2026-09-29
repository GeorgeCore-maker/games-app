import { useQuery } from "@tanstack/react-query";

const STEAM_API = "/steam-api/appdetails";

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

export default function useGameDetails(steamAppID: string) {
    return useQuery<GameDetails>({
        queryKey: ["steam-details", steamAppID],
        queryFn: async (): Promise<GameDetails> => {
            const response = await fetch(`${STEAM_API}?appids=${steamAppID}&l=spanish`);

            // Un 5xx es transitorio: que react-query lo reintente tiene sentido.
            if (response.status >= 500) {
                throw new Error(`Steam respondio ${response.status}`);
            }

            // El proxy de Vite solo existe en `npm run dev`. En un despliegue
            // estatico esta ruta devuelve el index.html y response.json()
            // lanzaria SyntaxError, 60 veces seguidas. No es transitorio.
            const isJson = response.headers
                .get("content-type")
                ?.includes("application/json");

            if (!response.ok || !isJson) return EMPTY_DETAILS;

            const details = (await response.json())[steamAppID] as
                | SteamAppDetails
                | undefined;

            // Steam contesta { success: false } cuando no conoce el appid.
            if (!details?.success || !details.data) return EMPTY_DETAILS;

            const { short_description, controller_support, genres } = details.data;

            return {
                description: short_description?.trim() || null,
                // Ojo: el dato de Steam esta incompleto. The Witcher 3, CS2 y
                // Dota 2 devuelven el campo vacio pese a admitir mando. Asi que
                // esto solo dice "Steam afirma que tiene mando", nunca
                // "este juego no tiene mando".
                hasController: controller_support === "full",
                genres: genres?.map((g) => g.description) ?? [],
            };
        },
        enabled: Boolean(steamAppID) && steamAppID !== "0",
        staleTime: 1000 * 60 * 60 * 24,
        // 60 tarjetas piden datos a la vez: un fallo transitorio de Steam no
        // debe provocar 60 x 3 reintentos seguidos.
        retry: 1,
    });
}
