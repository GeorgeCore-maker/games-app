import { Badge, HStack, Text } from '@chakra-ui/react';
import { FaGamepad } from 'react-icons/fa6';

type Props = {
  size?: 'sm' | 'md';
};

/**
 * Mando compatible segun Steam. Ojo: Steam solo lo declara en parte de los
 * juegos (a The Witcher 3 y a CS2 les falta el dato), asi que la ausencia del
 * badge no significa que el juego no tenga soporte de mando.
 */
export default function ControllerBadge({ size = 'sm' }: Props) {
  return (
    <Badge
      bg={'blackAlpha.600'}
      color={'white'}
      fontSize={size === 'md' ? 'sm' : '2xs'}
      fontFamily={'body'}
      fontWeight={600}
      px={2}
      py={0.5}
      rounded={'full'}
      display={'inline-flex'}
      alignItems={'center'}>
      <HStack spacing={1}>
        <FaGamepad aria-hidden />
        <Text as={'span'} lineHeight={1}>
          Mando
        </Text>
      </HStack>
    </Badge>
  );
}
