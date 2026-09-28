import { useQuery } from "@tanstack/react-query";

const STEAM_API = "/steam-api/appdetails";

type SteamAppDetails = {
    success: boolean;
    data?: {
        name: string;
        short_description: string;
    };
};

export default function useGameDescription(steamAppID: string) {
    return useQuery({
        queryKey: ["steam-description", steamAppID],
        queryFn: async () => {
            const response = await fetch(`${STEAM_API}?appids=${steamAppID}&l=spanish`);
            const details = (await response.json())[steamAppID] as SteamAppDetails | undefined;
            return details?.data?.short_description ?? null;
        },
        enabled: Boolean(steamAppID) && steamAppID !== "0",
        staleTime: 1000 * 60 * 60 * 24,
    });
}
