import {
    Box,
    Heading,
    Container,
    Text,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    Flex,
    Skeleton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useChuck from './useChuck';
import { filtersToQuery, paramsToFilters } from '../Games/filters';

export default function Hero() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: joke, isPending, isError: isJokeError } = useChuck();
    const [search, setSearch] = useState('');

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const current = paramsToFilters(new URLSearchParams(location.search));
        navigate(`/games?${filtersToQuery({ ...current, title: search.trim() })}`);
    };

    return (
        <Flex
            w='full'
            align='center'
            justify='center'
            minH={'calc(100dvh - 96px)'}
        >

            <Container maxW={'3xl'}>
                <Stack
                    as={Box}
                    textAlign={'center'}
                    spacing={{ base: 8, md: 12 }}
                    bg={'blackAlpha.600'}
                    backdropFilter={'blur(6px)'}
                    boxShadow={'dark-lg'}
                    rounded={'2xl'}
                    px={{ base: 6, md: 12 }}
                    py={{ base: 10, md: 14 }}>
                    <Heading
                        fontWeight={600}
                        fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
                        color={'white'}
                        textShadow={'0 2px 16px rgba(0, 0, 0, 0.95)'}
                        lineHeight={'110%'}>
                        Bienvenidos a <br />
                        <Text as={'span'} color={'green.400'}>
                            Game Sale
                        </Text>
                    </Heading>
                    <Text
                        as={'div'}
                        color={'gray.100'}
                        fontSize={{ base: 'md', md: 'lg' }}
                        lineHeight={'160%'}
                        noOfLines={4}
                        textShadow={'0 2px 12px rgba(0, 0, 0, 0.9)'}>
                        Una web para encontrar ofertas en juegos... Ademas contamos chistes: <br />
                        {isPending ? (
                            <Skeleton
                                width={{ base: '70%', md: '80%' }}
                                height={'1.4em'}
                                mx={'auto'}
                                mt={3}
                                rounded={'md'}
                                startColor={'whiteAlpha.300'}
                                endColor={'whiteAlpha.700'} />
                        ) : isJokeError ? (
                            // Sin esto el texto se corta en "...cuentamos chistes:"
                            // y la frase queda a medias sin dar ninguna pista.
                            <Text
                                as={'span'}
                                color={'whiteAlpha.700'}
                                fontStyle={'italic'}
                                fontSize={'sm'}>
                                hoy no hay chiste, pero si ofertas
                            </Text>
                        ) : (
                            <Text as={'span'} color={'green.300'} fontWeight={600}>
                                {joke}
                            </Text>
                        )}
                    </Text>
                    <form onSubmit={handleSearch}>
                        <Stack
                            direction={'column'}
                            spacing={3}
                            align={'center'}
                            alignSelf={'center'}
                            position={'relative'}
                            w={'full'}>
                            <InputGroup>
                                <InputLeftElement pointerEvents={'none'}>
                                    <SearchIcon color={'gray.500'} />
                                </InputLeftElement>
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={'Busca un juego por nombre'}
                                    aria-label={'Buscar juego por nombre'}
                                    bg={'whiteAlpha.900'}
                                    color={'gray.800'}
                                    _placeholder={{ color: 'gray.500' }}
                                    rounded={'full'}
                                    focusBorderColor={'green.400'}
                                />
                            </InputGroup>
                            <Button
                                type={'submit'}
                                colorScheme={'green'}
                                bg={'green.400'}
                                rounded={'full'}
                                px={6}
                                _hover={{
                                    bg: 'green.500',
                                }}
                            >
                                Empieza a buscar
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Container>
        </Flex>
    );
}