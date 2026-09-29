import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    HStack,
    Text,
    Stack,
    useColorModeValue,
    Image,
    Skeleton
} from '@chakra-ui/react';
import { Game } from './useGames';
import useGameDetails from './useGameDetails';
import { useStoreName } from './filters';
import { coverCandidates } from './images';
import { discountPercent } from './discount';
import { normalize } from './genreFilter';
import DiscountBadge from '../../components/DiscountBadge';
import ControllerBadge from '../../components/ControllerBadge';

type Props = {
    game: Game;
    /** Si se pasan, los chips de genero filtran en vez de ser solo texto. */
    selectedGenres?: string[];
    onGenreToggle?: (genre: string) => void;
};

export default function GameCard({ game, selectedGenres, onGenreToggle }: Props) {
    const { data: details, isPending: areDetailsPending } = useGameDetails(game.steamAppID);
    const storeName = useStoreName();
    const descriptionColor = useColorModeValue('gray.600', 'gray.400');
    const genreBg = useColorModeValue('gray.100', 'whiteAlpha.200');
    const mutedGenreColor = useColorModeValue('gray.600', 'gray.300');
    const description = details?.description ?? null;
    const discount = discountPercent(game);

// Se resuelve en el cliente: no se puede saber de antemano si header.jpg existe.
    const { steamAppID, thumb } = game;
    const candidates = useMemo(
        () => coverCandidates({ steamAppID, thumb }),
        [steamAppID, thumb]
    );
    const [coverIndex, setCoverIndex] = useState(0);
    const coverSrc = candidates[coverIndex];
    const placeholderBg = useColorModeValue('gray.100', 'gray.700');

    // Si el juego cambia, la lista de candidatos tambien: hay que volver a
    // empezar, o el indice se queda apuntando a una posicion que no existe.
    useEffect(() => {
        setCoverIndex(0);
    }, [steamAppID, thumb]);

    return (
        <div
            onClick={() => {
                window.open(`https://www.cheapshark.com/redirect?dealID=${game.dealID}`, '_blank');
            }}
            style={{cursor: 'pointer'}}>
            <Box
                maxW={'445px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'2xl'}
                rounded={'md'}
                p={6}
                overflow={'hidden'}
                transition={'background-color 0.3s ease-in-out'}>
                <Box
                    h={{ base: '150px', md: '210px' }}
                    bg={placeholderBg}
                    mt={-6}
                    mx={-6}
                    mb={6}
                    pos={'relative'}>
                    {coverSrc ? (
                        <Image
                            h={'100%'}
                            w={'full'}
                            objectFit={'cover'}
                            src={coverSrc}
                            alt={game.title}
                            loading={'lazy'}
                            decoding={'async'}
                            onError={() =>
                                setCoverIndex((indice) => indice + 1)
                            }
                        />
                    ) : (
                        <Flex
                            h={'100%'}
                            w={'full'}
                            align={'center'}
                            justify={'center'}
                            bg={placeholderBg}>
                            <Text fontSize={'xs'} color={'gray.500'}>
                                Sin imagen
                            </Text>
                        </Flex>
                    )}
                    {/* El descuento va sobre la portada: es el dato que hace
                        escanear una rejilla de ofertas, y arriba a la izquierda
                        es donde se mira sin leer. */}
                    <Box position={'absolute'} top={3} left={3} zIndex={1}>
                        <DiscountBadge porcentaje={discount} />
                    </Box>
                </Box>
                <Stack>
                    <HStack justify={'space-between'} align={'center'}>
                        <Text
                            color={'green.500'}
                            textTransform={'uppercase'}
                            fontWeight={800}
                            fontSize={'sm'}
                            letterSpacing={1.1}
                            fontFamily={'heading'}>
                            {game.isOnSale == "1" ? "Oferta" : "Venta normal"}
                        </Text>
                        {details?.hasController ? <ControllerBadge /> : null}
                    </HStack>
                    <Text
                        color={'gray.500'}
                        textTransform={'uppercase'}
                        fontWeight={700}
                        fontSize={'xs'}
                        letterSpacing={1}>
                        {storeName(game.storeID)}
                    </Text>
                    <Heading
                        color={useColorModeValue('gray.700', 'white')}
                        fontSize={'2xl'}
                        fontFamily={'heading'}>
                        {game.title}
                    </Heading>
                    {areDetailsPending ? (
                        <Skeleton height={'4rem'} rounded={'md'} />
                    ) : description ? (
                        <Text
                            color={descriptionColor}
                            fontSize={'sm'}
                            lineHeight={'150%'}
                            noOfLines={3}>
                            {description}
                        </Text>
                    ) : (
                        <Text color={descriptionColor} fontSize={'sm'}>
                            Sin descripcion disponible.
                        </Text>
                    )}
                    {details?.genres.length ? (
                        <HStack spacing={2} flexWrap={'wrap'}>
                            {details.genres.slice(0, 3).map((genero) => {
                                const genreKey = normalize(genero);
                                const isActive =
                                    selectedGenres?.some(
                                        (genre) => normalize(genre) === genreKey
                                    ) ?? false;

                                return (
                                    <Text
                                        as={onGenreToggle ? 'button' : 'span'}
                                        key={genero}
                                        onClick={
                                            onGenreToggle
                                                ? (event) => {
                                                      event.stopPropagation();
                                                      onGenreToggle(genero);
                                                  }
                                                : undefined
                                        }
                                        cursor={onGenreToggle ? 'pointer' : 'default'}
                                        fontSize={'xs'}
                                        fontWeight={isActive ? 700 : 500}
                                        color={
                                            isActive ? 'green.600' : mutedGenreColor
                                        }
                                        bg={isActive ? 'green.100' : genreBg}
                                        _hover={onGenreToggle ? { opacity: 0.8 } : undefined}
                                        px={2}
                                        py={0.5}
                                        rounded={'full'}>
                                        {genero}
                                    </Text>
                                );
                            })}
                        </HStack>
                    ) : null}
                    <Text color={'gray.500'} fontSize={'sm'}>
                        {game.steamRatingText} - {game.steamRatingPercent}% - {game.steamRatingCount} valoraciones
                    </Text>
                </Stack>
                <Stack mt={6} direction={'row'} spacing={4} align={'center'}>
                    <Stack direction={'column'} spacing={0} fontSize={'sm'}>
                        <Text fontWeight={600}>Puntaje: {game.metacriticScore}</Text>
                        <Text color={'gray.500'}>Antes: Usd ${game.normalPrice} - Ahora: Usd ${game.salePrice}</Text>
                    </Stack>
                </Stack>
            </Box>
        </div>
    );
}
