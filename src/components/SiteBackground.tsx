import { Box, useColorModeValue } from '@chakra-ui/react';

const HERO_IMAGE =
    'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';

/**
 * Fondo de todo el sitio. Son dos capas fijas: la foto y un velo encima que
 * depende del tema. El velo no es decorativo, sin el el texto de la pagina se
 * queda ilegible sobre la foto.
 */
export default function SiteBackground() {
    const scrim = useColorModeValue('whiteAlpha.700', 'blackAlpha.700');

    return (
        <>
            <Box
                position={'fixed'}
                top={0}
                right={0}
                bottom={0}
                left={0}
                zIndex={0}
                backgroundImage={HERO_IMAGE}
                backgroundSize={'cover'}
                backgroundPosition={'center'}
                aria-hidden={true}
            />
            <Box
                className={'site-background-scrim'}
                position={'fixed'}
                top={0}
                right={0}
                bottom={0}
                left={0}
                zIndex={0}
                bg={scrim}
                aria-hidden={true}
            />
        </>
    );
}
