import { extendTheme } from '@chakra-ui/react';

const config = {
    initialColorMode: 'system',
    useSystemColorMode: true,
  // Chakra inyecta `* { transition: none !important }` en cada cambio de tema;
  // hay que desactivarlo para que se vea la transicion de index.css.
    disableTransitionOnChange: false,
};

const theme = extendTheme({
    config,
  // Solo los pesos pedidos en index.html: un peso no descargado lo sintetiza el
  // navegador como negrita falsa.
    fonts: {
        heading: `'Chakra Petch', system-ui, sans-serif`,
        body: `'Inter', system-ui, -apple-system, sans-serif`,
    },
    styles: {
        global: {
  // Chakra pone body opaco, que taparia las capas fijas de SiteBackground.
            body: {
                bg: 'transparent',
            },
        },
    },
});

export default theme;
