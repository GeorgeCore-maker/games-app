import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import { filtersToQuery, type GameFilters } from './filters';

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

export type GamesPage = {
    games: Game[];
    totalPages: number;
    pageSize: number;
    filterKey: string;
};

const GAMES_API = "https://www.cheapshark.com/api/1.0/deals";
const UPPER_PRICE = 15;

export const PAGE_SIZE_OPTIONS = [12, 24, 36, 60];

export const TOTAL_DEALS_LIMIT = 3000;

export function totalPagesFor(pageSize: number) {
    return Math.floor(TOTAL_DEALS_LIMIT / pageSize);
}

/**
 * CheapShark devuelve en `X-Total-Page-Count` el indice de la ultima pagina, no
 * el numero de paginas: para 26 resultados con pageSize 24 (2 paginas reales)
 * responde 1. Cuando el conjunto de resultados supera el tope de 3000, el
 * indice se satura en totalPagesFor() y ahi si coincide con el total.
 * Sumar 1 y volver a recortar con el tope corrige ambos casos.
 */
export function resolveTotalPages(header: unknown, pageSize: number) {
    const lastPageIndex = Number(header);
    if (!Number.isFinite(lastPageIndex) || lastPageIndex < 0) {
        return totalPagesFor(pageSize);
    }
    return Math.min(lastPageIndex + 1, totalPagesFor(pageSize));
}

export default function useGames(page: number, pageSize: number, filters: GameFilters) {
    const filterKey = filtersToQuery(filters);

    return useQuery({
        queryKey: ["games", page, pageSize, filterKey],
        queryFn: async (): Promise<GamesPage> => {
            const response = await axios.get<Game[]>(GAMES_API, {
                params: {
                    pageNumber: page,
                    pageSize,
                    upperPrice: UPPER_PRICE,
                    sortBy: filters.sortBy,
                    // Ojo: no se manda `desc`. Medido contra la API, sortBy ya
                    // devuelve el orden que quiere cada opcion (Savings de mayor
                    // a menor, Price de menor a mayor, Title de A a Z) y mandar
                    // desc=1 lo invierte: "Mayor descuento" salia con 0%, 0%,
                    // 0%... desc=0 es identico a no mandarlo.
                    ...(filters.title.trim() ? { title: filters.title.trim() } : {}),
                    ...(filters.storeID !== null ? { storeID: filters.storeID } : {}),
                    ...(filters.onSale ? { onSale: 1 } : {}),
                    ...(filters.aaa ? { AAA: 1 } : {}),
                    ...(filters.steamworks ? { steamworks: 1 } : {}),
                },
            });

            return {
                games: response.data,
                totalPages: resolveTotalPages(response.headers["x-total-page-count"], pageSize),
                pageSize,
                filterKey,
            };
        },
        placeholderData: (previous) =>
            previous?.pageSize === pageSize && previous?.filterKey === filterKey
                ? previous
                : undefined,
    });
}
