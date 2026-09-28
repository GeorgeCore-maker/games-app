import { useQuery } from "@tanstack/react-query";
import axios from 'axios';

export type Game = {
    internalName: string;
    title: string;
    metacriticLink: string;
    dealID: string;
    storeID: string;
    gameID: string;
    salePrice: string;
    normalPrice: string;
    isOnSale: string;
    savings: string;
    metacriticScore: string;
    steamRatingText: string;
    steamRatingPercent: string;
    steamRatingCount: string;
    steamAppID: string;
    releaseDate: number;
    lastChange: number;
    dealRating: string;
    thumb: string;
};

export default function useGames() {
    const GAMES_API = "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15";
    return useQuery({
        queryKey: ["games"],
        queryFn: async () => {
            const response = await axios.get<Game[]>(GAMES_API);
            return response.data;
        },
    });
}
