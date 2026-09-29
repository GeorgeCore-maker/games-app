import { IconButton, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export default function ColorModeToggle() {
    const { colorMode, toggleColorMode } = useColorMode();
    const isLight = colorMode === 'light';
    const label = isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
    const Icon = isLight ? MoonIcon : SunIcon;

    return (
        <IconButton
            size={'md'}
            variant={'ghost'}
            onClick={toggleColorMode}
            aria-label={label}
            title={label}
            icon={<Icon boxSize={5} />}
        />
    );
}
