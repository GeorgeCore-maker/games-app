import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ALL_STORES,
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  countActiveFilters,
  filtersToQuery,
  paramsToFilters,
  useStores,
  type GameFilters,
} from './filters';

export default function GameFiltersMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stores, isPending: storesPending, isError: storesError, refetch: refetchStores } =
    useStores();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [draft, setDraft] = useState<GameFilters>(DEFAULT_FILTERS);

  const activeStores = (stores ?? []).filter((store) => store.isActive);
  const applied = paramsToFilters(new URLSearchParams(location.search));
  const activeCount = countActiveFilters(applied);

  const handleOpen = () => {
    setDraft(applied);
    onOpen();
  };

  const apply = () => {
    navigate(`/games?${filtersToQuery(draft)}`);
    onClose();
  };

  return (
    <Popover
      placement={'bottom-end'}
      isOpen={isOpen}
      onOpen={handleOpen}
      onClose={onClose}
      isLazy>
      <PopoverTrigger>
        <Button
          size={'sm'}
          variant={'ghost'}
          rightIcon={<ChevronDownIcon />}
          fontWeight={'normal'}
          px={2}
          h={8}>
          Juegos
          {activeCount > 0 ? (
            <Box
              as={'span'}
              ml={2}
              px={1.5}
              rounded={'full'}
              bg={'green.400'}
              color={'gray.900'}
              fontSize={'xs'}
              fontWeight={700}>
              {activeCount}
            </Box>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent w={'min(92vw, 21rem)'}>
        <PopoverArrow />
        <PopoverBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel fontSize={'sm'} mb={1}>
                Tienda
              </FormLabel>
              {storesPending ? (
                <Skeleton height={'32px'} rounded={'md'} />
              ) : storesError ? (
                // Antes este caso caia en el Skeleton de arriba para siempre,
                // porque `!stores` era cierto y no habia ninguna salida.
                <Box>
                  <Select size={'sm'} isDisabled value={''}>
                    <option value={''}>Tiendas no disponibles</option>
                  </Select>
                  <Button
                    size={'xs'}
                    variant={'link'}
                    colorScheme={'red'}
                    mt={1}
                    onClick={() => refetchStores()}>
                    Reintentar
                  </Button>
                </Box>
              ) : (
                <Select
                  size={'sm'}
                  value={draft.storeID === null ? ALL_STORES : String(draft.storeID)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      storeID:
                        event.target.value === ALL_STORES
                          ? null
                          : Number(event.target.value),
                    }))
                  }>
                  <option value={ALL_STORES}>Todas las tiendas</option>
                  {activeStores.map((store) => (
                    <option key={store.storeID} value={store.storeID}>
                      {store.storeName}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>

            <FormControl>
              <FormLabel fontSize={'sm'} mb={1}>
                Ordenar por
              </FormLabel>
              <Select
                size={'sm'}
                value={draft.sortBy}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sortBy: event.target.value as GameFilters['sortBy'],
                  }))
                }>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Text fontSize={'sm'} fontWeight={600} mb={2}>
                Filtros
              </Text>
              <Stack spacing={2}>
                <Checkbox
                  size={'sm'}
                  isChecked={draft.onSale}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, onSale: event.target.checked }))
                  }>
                  Solo juegos en oferta
                </Checkbox>
                <Checkbox
                  size={'sm'}
                  isChecked={draft.aaa}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, aaa: event.target.checked }))
                  }>
                  Solo juegos AAA
                </Checkbox>
                <Checkbox
                  size={'sm'}
                  isChecked={draft.steamworks}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, steamworks: event.target.checked }))
                  }>
                  Solo juegos con Steam
                </Checkbox>
              </Stack>
            </Box>

            <Divider />

            <HStack justify={'flex-end'} spacing={2}>
              <Button
                size={'sm'}
                variant={'ghost'}
                onClick={() => setDraft(DEFAULT_FILTERS)}>
                Limpiar
              </Button>
              <Button size={'sm'} colorScheme={'green'} onClick={apply}>
                Aplicar
              </Button>
            </HStack>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
