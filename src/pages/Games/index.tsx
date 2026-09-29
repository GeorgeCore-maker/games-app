import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import ErrorState from "../../components/ErrorState";
import GameCard from "./GameCard";
import GenreFilterBar from "./GenreFilterBar";
import usePageDetails from "./usePageDetails";
import { collectGenres, matchesGenres, mergeGenreOptions, toggleGenre } from "./genreFilter";
import useGames, { PAGE_SIZE_OPTIONS, totalPagesFor } from "./useGames";
import {
  DEFAULT_FILTERS,
  filtersToQuery,
  isDefaultFilters,
  paramsToFilters,
} from "./filters";

function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = paramsToFilters(searchParams);
  const filterKey = searchParams.toString();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(0);
  }

  const { data, isPending, isError, error, isFetching, refetch } = useGames(
    page,
    pageSize,
    filters
  );

  const totalPages = data?.totalPages ?? totalPagesFor(pageSize);
  // Sin esta lista, un fallo de red dejaba la rejilla vacia y sin texto: se
  // confundia con "no hay resultados".
  const games = data?.games ?? [];
  const pageDetails = usePageDetails(games);
  const isGenrePending = games.length > 0 && pageDetails.size < games.length;

  // Los generos vienen de Steam, no de CheapShark: el filtro se aplica sobre la
  // pagina ya cargada, asi que la paginacion sigue siendo la de la API.
  const genreOptions = mergeGenreOptions(
    collectGenres(
      games
        .map((game) => pageDetails.get(game.steamAppID))
        .filter((details): details is NonNullable<typeof details> => Boolean(details))
    ),
    filters.genres
  );
  const visibleGames = games.filter((game) =>
    matchesGenres(pageDetails.get(game.steamAppID)?.genres, filters.genres)
  );
  const isFilteringGenres = filters.genres.length > 0;
  const hasGenreFilterWithoutMatch =
    isFilteringGenres && visibleGames.length === 0 && games.length > 0;

  const setGenres = (genres: string[]) => {
    const next = new URLSearchParams(searchParams);
    if (genres.length) {
      next.set("genres", genres.join(","));
    } else {
      next.delete("genres");
    }
    setSearchParams(next);
  };

  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= totalPages;
  const isFiltered = !isDefaultFilters(filters);
  const skeletonCount = Math.min(pageSize, 6);
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const strongColor = useColorModeValue("gray.700", "gray.100");

  const gridContent = isError ? (
    <Box gridColumn={{ base: "span 2", md: "span 3" }}>
      <ErrorState
        title="No pudimos cargar los juegos"
        error={error}
        hint={
          isFiltered
            ? "Puedes reintentar o quitar los filtros para buscar sin restricciones."
            : undefined
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    </Box>
  ) : isPending ? (
    Array.from({ length: skeletonCount }, (_, index) => (
      <Skeleton key={index} height={"420px"} rounded={"md"} />
    ))
  ) : games.length === 0 ? (
    <Box
      gridColumn={{ base: "span 2", md: "span 3" }}
      textAlign={"center"}
      py={16}>
      <Text fontSize={"lg"} fontWeight={600}>
        No se encontraron juegos
      </Text>
      <Text fontSize={"sm"} color={mutedColor} mt={1}>
        {filters.title
          ? `Ningun resultado para "${filters.title}". Prueba con otro nombre o quita los filtros.`
          : "Prueba a cambiar los filtros del menu superior."}
      </Text>
    </Box>
  ) : hasGenreFilterWithoutMatch ? (
    <Box
      gridColumn={{ base: "span 2", md: "span 3" }}
      textAlign={"center"}
      py={16}>
      <Text fontSize={"lg"} fontWeight={600}>
        Ninguna oferta de esta pagina es de{" "}
        <Text as={"span"} color={"green.500"}>
          {filters.genres.join(" / ")}
        </Text>
      </Text>
      <Text fontSize={"sm"} color={mutedColor} mt={1}>
        CheapShark no permite filtrar por genero en el servidor, asi que el
        filtro se aplica a la pagina {page + 1}. Prueba con otra pagina o quita
        el filtro.
      </Text>
    </Box>
  ) : isFilteringGenres ? (
    visibleGames.map((game) => (
      <GameCard
        key={game.dealID}
        game={game}
        selectedGenres={filters.genres}
        onGenreToggle={(genre) => setGenres(toggleGenre(filters.genres, genre))}
      />
    ))
  ) : (
    games.map((game) => <GameCard key={game.dealID} game={game} />)
  );

  return (
    <Box>
      <Flex justify={"flex-end"} p={"20px 20px 0"} gap={3} align={"center"}>
        {isFiltered ? (
          <Button
            size={"sm"}
            variant={"link"}
            colorScheme={"green"}
            onClick={() => setSearchParams(filtersToQuery(DEFAULT_FILTERS))}
          >
            Limpiar filtros
          </Button>
        ) : null}
        <Text fontSize={"sm"} mr={2} alignSelf={"center"}>
          Por pagina
        </Text>
        <Select
          size={"sm"}
          w={"auto"}
          value={pageSize}
          isDisabled={isPending}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Flex>

      {filters.title ? (
        <Text px={"20px"} pt={"10px"} fontSize={"sm"} color={mutedColor}>
          Resultados para{" "}
          <Text as={"span"} fontWeight={700} color={strongColor}>
            &quot;{filters.title}&quot;
          </Text>
        </Text>
      ) : null}

      <GenreFilterBar
        options={genreOptions}
        selected={filters.genres}
        isPending={isGenrePending}
        onToggle={(genre) => setGenres(toggleGenre(filters.genres, genre))}
        onClear={() => setGenres([])}
      />

      {isFilteringGenres && visibleGames.length > 0 ? (
        <Text px={"20px"} pt={"2px"} fontSize={"sm"} color={mutedColor}>
          {visibleGames.length} de {games.length} ofertas de esta pagina
        </Text>
      ) : null}

      <SimpleGrid
        p={"20px"}
        columns={[2, null, 3]}
        spacing={"40px"}
        opacity={isFetching ? 0.5 : 1}
        transition={"opacity 0.2s"}
      >
        {gridContent}
      </SimpleGrid>

      <Flex justify={"center"} align={"center"} gap={4} pb={10}>
        <Button
          size={"sm"}
          isDisabled={isFirstPage || isPending || isError}
          onClick={() => setPage((current) => Math.max(0, current - 1))}
        >
          Anterior
        </Button>
        <Text fontSize={"sm"}>
          Pagina {page + 1} de {totalPages}
        </Text>
        <Button
          size={"sm"}
          isDisabled={isLastPage || isPending || isError}
          onClick={() => setPage((current) => current + 1)}
        >
          Siguiente
        </Button>
      </Flex>
    </Box>
  );
}

export default Games;
