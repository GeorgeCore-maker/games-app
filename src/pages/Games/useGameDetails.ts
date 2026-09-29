import { useQuery } from "@tanstack/react-query";
import { steamDetailsOptions, type GameDetails } from "./steamDetails";

export type { GameDetails };

export default function useGameDetails(steamAppID: string) {
    return useQuery<GameDetails>(steamDetailsOptions(steamAppID));
}
