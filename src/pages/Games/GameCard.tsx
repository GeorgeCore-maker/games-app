import {
    Box,
    Heading,
    Text,
    Stack,
    useColorModeValue,
    Image,
    Skeleton
} from '@chakra-ui/react';
import { Game } from './useGames';
import useGameDescription from './useGameDescription';

type Props = {
    game: Game;
};

export default function GameCard({ game }: Props) {
    const { data: description, isPending: isDescriptionPending } = useGameDescription(game.steamAppID);
    const descriptionColor = useColorModeValue('gray.600', 'gray.400');
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
                overflow={'hidden'}>
                <Box
                    h={'210px'}
                    bg={'gray.100'}
                    mt={-6}
                    mx={-6}
                    mb={6}
                    pos={'relative'}>
                    <Image
                        h={'210px'}
                        src={
                            game.thumb
                        }
                    />
                </Box>
                <Stack>
                    <Text
                        color={'green.500'}
                        textTransform={'uppercase'}
                        fontWeight={800}
                        fontSize={'sm'}
                        letterSpacing={1.1}>
                        {game.isOnSale == "1" ? "Oferta" : "Venta normal"}
                    </Text>
                    <Heading
                        color={useColorModeValue('gray.700', 'white')}
                        fontSize={'2xl'}
                        fontFamily={'body'}>
                        {game.title}
                    </Heading>
                    {isDescriptionPending ? (
                        <Skeleton height={'4rem'} rounded={'md'} />
                    ) : description ? (
                        <Text
                            color={descriptionColor}
                            fontSize={'sm'}
                            lineHeight={'150%'}
                            noOfLines={3}>
                            {description}
                        </Text>
                    ) : null}
                    <Text color={'gray.500'}>
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