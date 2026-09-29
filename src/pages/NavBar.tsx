import { ReactNode } from 'react';
import {
    Box,
    Flex,
    HStack,
    Link,
    IconButton,
    useDisclosure,
    useColorModeValue,
    Stack,
    Text
} from '@chakra-ui/react';
import { NavLink as RouterLink } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import GameFiltersMenu from './Games/GameFiltersMenu';
import ColorModeToggle from '../components/ColorModeToggle';

type Link = {
    uri: string;
    label: string;
};

const Links: Link[] = [{
    uri: "/",
    label: "Inicio"
}];

const NavLink = ({ children, to }: { children: ReactNode, to: string }) => (
    <Text
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('gray.200', 'gray.700'),
        }}
    >
        <RouterLink to={to}>
            {children}
        </RouterLink>
    </Text>
);

export default function Navbar({ children }: { children?: ReactNode }) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Box
                bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.700')}
                backdropFilter={'blur(6px)'}
                px={4}
                position={'sticky'}
                top={0}
                zIndex={'banner'}
                transition={'background-color 0.3s ease-in-out'}
                boxShadow={'sm'}>
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                    <IconButton
                        size={'md'}
                        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                        aria-label={'Open Menu'}
                        display={{ md: 'none' }}
                        onClick={isOpen ? onClose : onOpen}
                    />
                    <HStack spacing={8} alignItems={'center'}>
                        <Box>Game Sale</Box>
                        <HStack
                            as={'nav'}
                            spacing={4}
                            display={{ base: 'none', md: 'flex' }}>
                            {Links.map((link) => (
                                <NavLink to={link.uri} key={link.uri}>{link.label}</NavLink>
                            ))}
                            <GameFiltersMenu />
                        </HStack>
                    </HStack>
                    <ColorModeToggle />
                </Flex>

                {isOpen ? (
                    <Box pb={4} display={{ md: 'none' }}>
                        <Stack as={'nav'} spacing={4}>
                            {Links.map((link) => (
                                <NavLink to={link.uri} key={link.uri}>{link.label}</NavLink>
                            ))}
                            <GameFiltersMenu />
                        </Stack>
                    </Box>
                ) : null}
            </Box>

            <Box p={4}>{children}</Box>
        </>
    );
}