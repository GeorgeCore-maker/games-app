import { extendTheme } from '@chakra-ui/react';

const config = {
    initialColorMode: 'system',
    useSystemColorMode: true,
    // Chakra inyecta `* { transition: none !important }` en cada cambio de tema
    // para que no se vea un salto de color. Hay que desactivarlo, o la
    // transicion que define index.css no se llegaria a ver.
    disableTransitionOnChange: false,
};

const theme = extendTheme({
    config,
    // Se pasan los pesos exactos que se piden en index.html. Si declaras aqui
    // un peso que no se ha descargado, el navegador lo sintetiza (normalmente
    // a negrita falsa) y se nota.
    fonts: {
        heading: `'Chakra Petch', system-ui, sans-serif`,
        body: `'Inter', system-ui, -apple-system, sans-serif`,
    },
    styles: {
        global: {
            // Chakra pone body opaco (white en claro, gray.800 en oscuro), y eso
            // taparia las capas fijas de SiteBackground.
            body: {
                bg: 'transparent',
            },
        },
    },
});

export default theme;
