import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { normalize } from './genreFilter';

const STORES_API = 'https://www.cheapshark.com/api/1.0/stores';

export const SORT_OPTIONS = [
  { value: 'Savings', label: 'Mayor descuento' },
  { value: 'Price', label: 'Precio mas bajo' },
  { value: 'Metacritic', label: 'Mejor Metacritic' },
  { value: 'DealRating', label: 'Mejor valoracion CheapShark' },
  { value: 'Reviews', label: 'Mejor nota de usuarios' },
  { value: 'ReviewCount', label: 'Mas valorados' },
  { value: 'Recent', label: 'Anadidas recientemente' },
  { value: 'Release', label: 'Lanzamiento mas reciente' },
  { value: 'Title', label: 'Titulo (A-Z)' },
  { value: 'Store', label: 'Tienda' },
] as const;

export type SortBy = (typeof SORT_OPTIONS)[number]['value'];

export type GameFilters = {
  title: string;
  storeID: number | null;
  sortBy: SortBy;
  onSale: boolean;
  aaa: boolean;
  steamworks: boolean;
  genres: string[];
};

export const DEFAULT_FILTERS: GameFilters = {
  title: '',
  storeID: 1,
  sortBy: 'Savings',
  onSale: false,
  aaa: false,
  steamworks: false,
  genres: [],
};

const SORT_VALUES: readonly string[] = SORT_OPTIONS.map((option) => option.value);

export const ALL_STORES = 'all';

export function filtersToParams(filters: GameFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.title.trim()) params.set('title', filters.title.trim());
  params.set('store', filters.storeID === null ? ALL_STORES : String(filters.storeID));
  params.set('sort', filters.sortBy);
  if (filters.onSale) params.set('onSale', '1');
  if (filters.aaa) params.set('aaa', '1');
  if (filters.steamworks) params.set('steamworks', '1');
  if (filters.genres.length) params.set('genres', filters.genres.join(','));
  return params;
}

export function paramsToFilters(params: URLSearchParams): GameFilters {
  const rawStore = params.get('store');
  let storeID = DEFAULT_FILTERS.storeID;
  if (rawStore === ALL_STORES) {
    storeID = null;
  } else if (rawStore !== null) {
    const parsed = Number(rawStore);
    if (Number.isFinite(parsed)) storeID = parsed;
  }

  const rawSort = params.get('sort');
  const sortBy = SORT_VALUES.includes(rawSort as string)
    ? (rawSort as SortBy)
    : DEFAULT_FILTERS.sortBy;

  return {
    title: (params.get('title') ?? '').trim(),
    storeID,
    sortBy,
    onSale: params.get('onSale') === '1',
    aaa: params.get('aaa') === '1',
    steamworks: params.get('steamworks') === '1',
    genres: parseGenres(params.get('genres')),
  };
}

/** Los generos de Steam traen tildes ("Acción"), asi que separarlos por coma y
 *  decodificarlos es obligatorio: sin esto la URL rompe los acentos. Se
 *  deduplica por forma normalizada para que "accion" y "Acción" no se acumulen. */
function parseGenres(raw: string | null): string[] {
  if (!raw) return [];
  const genres = raw
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  return genres.filter((genre) => {
    const key = normalize(genre);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filtersToQuery(filters: GameFilters): string {
  return filtersToParams(filters).toString();
}

export function isDefaultFilters(filters: GameFilters): boolean {
  return filtersToQuery(filters) === filtersToQuery(DEFAULT_FILTERS);
}

export function countActiveFilters(filters: GameFilters): number {
  let count = 0;
  if (filters.title.trim()) count += 1;
  if (filters.storeID !== DEFAULT_FILTERS.storeID) count += 1;
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) count += 1;
  if (filters.onSale) count += 1;
  if (filters.aaa) count += 1;
  if (filters.steamworks) count += 1;
  if (filters.genres.length) count += 1;
  return count;
}

type StoreResponse = {
  storeID: string;
  storeName: string;
  isActive: number;
};

export type Store = {
  storeID: number;
  storeName: string;
  isActive: boolean;
};

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async (): Promise<Store[]> => {
      const { data } = await axios.get<StoreResponse[]>(STORES_API);
      return data
        .map((store) => ({
          storeID: Number(store.storeID),
          storeName: store.storeName,
          isActive: store.isActive === 1,
        }))
        .sort((a, b) => a.storeName.localeCompare(b.storeName, 'es'));
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useStoreName() {
  const { data } = useStores();
  const names = new Map((data ?? []).map((store) => [String(store.storeID), store.storeName]));
  return (storeID: string) => names.get(storeID) ?? `Tienda ${storeID}`;
}
