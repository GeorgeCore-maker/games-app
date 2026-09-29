import { Badge, HStack, Text } from '@chakra-ui/react';
import { FaGamepad } from 'react-icons/fa6';

type Props = {
  size?: 'sm' | 'md';
};

/** El dato de Steam esta incompleto (a The Witcher 3 y CS2 les falta), asi que
 *  la ausencia del badge no significa que el juego no tenga mando. */
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
