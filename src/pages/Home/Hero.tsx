import {
    Box,
    Heading,
    Container,
    Text,
    Button,
    Stack,
    Flex,
    Skeleton,
} from '@chakra-ui/react';
import useChuck from './useChuck';

export default function Hero() {
    const { data: joke, isPending } = useChuck();
    return (
        <Flex
            background='url(https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
            w='full'
            backgroundSize={'cover'}
            backgroundPosition='center'
            align='center'
            justify='center'
            py={{ base: 60, md: 60 }}
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
                        textShadow={'0 2px 12px rgba(0, 0, 0, 0.9)'}>
                        Una web para encontrar ofertas en juegos... Ademas contamos chistes: <br />
                        {isPending ? (
                            <Skeleton
                                width={{ base: '70%', md: '80%' }}
                                height={'1.4em'}
                                mt={3}
                                rounded={'md'}
                                startColor={'whiteAlpha.300'}
                                endColor={'whiteAlpha.700'} />
                        ) : (
                            <Text as={'span'} color={'green.300'} fontWeight={600}>
                                {joke}
                            </Text>
                        )}
                    </Text>
                    <Stack
                        direction={'column'}
                        spacing={3}
                        align={'center'}
                        alignSelf={'center'}
                        position={'relative'}>
                        <Button
                            colorScheme={'green'}
                            bg={'green.400'}
                            rounded={'full'}
                            px={6}
                            _hover={{
                                bg: 'green.500',
                            }}>
                            Empieza a buscar
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Flex>
    );
}