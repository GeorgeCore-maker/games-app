import { Badge, HStack, Text } from '@chakra-ui/react';
import { FaFire } from 'react-icons/fa6';
import { discountTier, type DiscountTier } from '../pages/Games/discount';

type Props = {
  porcentaje: number;
  size?: 'sm' | 'md';
};

// Un color por escalon: el descuento grande tiene que saltar a la vista de
// un vistazo, que es justo para lo que sirve una etiqueta de oferta.
const ESTILOS: Record<DiscountTier, { bg: string; color: string }> = {
  fuego: { bg: 'red.500', color: 'white' },
  alta: { bg: 'orange.400', color: 'gray.900' },
  media: { bg: 'yellow.300', color: 'gray.900' },
  baja: { bg: 'green.400', color: 'gray.900' },
  sin: { bg: 'gray.500', color: 'white' },
};

export default function DiscountBadge({ porcentaje, size = 'md' }: Props) {
  if (porcentaje <= 0) return null;

  const tier = discountTier(porcentaje);
  const estilo = ESTILOS[tier];

  return (
    <Badge
      bg={estilo.bg}
      color={estilo.color}
      fontSize={size === 'md' ? 'sm' : 'xs'}
      fontFamily={'heading'}
      fontWeight={700}
      letterSpacing={0.5}
      px={2.5}
      py={1}
      rounded={'md'}
      textShadow={tier === 'fuego' ? '0 1px 2px rgba(0,0,0,0.35)' : 'none'}
      boxShadow={'sm'}>
      <HStack spacing={1}>
        {tier === 'fuego' ? <FaFire aria-hidden /> : null}
        <Text as={'span'} lineHeight={1}>
          -{porcentaje}%
        </Text>
      </HStack>
    </Badge>
  );
}
