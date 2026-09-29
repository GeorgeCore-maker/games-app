import { useQueries } from "@tanstack/react-query";
import { hasSteamAppId } from "./images";
import { steamDetailsOptions, type GameDetails } from "./steamDetails";
import type { Game } from "./useGames";

/**
 * Precarga los detalles de la pagina actual para poder filtrar por genero.
 * Usa las mismas queryKey que useGameDetails, asi que las tarjetas de abajo
 * leen de la cache y no se duplica ninguna peticion a Steam.
 */
export default function usePageDetails(games: Game[]): Map<string, GameDetails> {
    const results = useQueries({
        queries: games.map((game) => steamDetailsOptions(game.steamAppID)),
    });

    const details = new Map<string, GameDetails>();
    games.forEach((game, index) => {
        if (hasSteamAppId(game.steamAppID) && results[index]?.data) {
            details.set(game.steamAppID, results[index].data as GameDetails);
        }
    });

    return details;
}
