import { Box, Button, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { normalize, type GenreCount } from './genreFilter';

type Props = {
  options: GenreCount[];
  selected: string[];
  onToggle: (genre: string) => void;
  onClear: () => void;
  isPending: boolean;
};

export default function GenreFilterBar({
  options,
  selected,
  onToggle,
  onClear,
  isPending,
}: Props) {
  const chipBg = useColorModeValue('white', 'whiteAlpha.200');
  const activeBg = useColorModeValue('green.500', 'green.300');
  const activeColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  if (options.length === 0) {
    return isPending ? (
      <Text px={'20px'} fontSize={'sm'} color={mutedColor}>
        Leyendo generos...
      </Text>
    ) : null;
  }

  return (
    <Box px={'20px'} pt={'4px'}>
      <HStack spacing={2} mb={2} align={'center'}>
        <Text fontSize={'sm'} fontWeight={600} color={mutedColor}>
          Genero
        </Text>
        {selected.length > 0 ? (
          <Button size={'xs'} variant={'link'} colorScheme={'green'} onClick={onClear}>
            Quitar
          </Button>
        ) : null}
      </HStack>

      <HStack spacing={2} flexWrap={'wrap'}>
        {options.map((option) => {
          const active = selected.some((genre) => normalize(genre) === normalize(option.genre));
          return (
            <Button
              key={option.genre}
              size={'xs'}
              onClick={() => onToggle(option.genre)}
              bg={active ? activeBg : chipBg}
              color={active ? activeColor : undefined}
              borderWidth={'1px'}
              borderColor={active ? 'transparent' : borderColor}
              fontWeight={active ? 700 : 500}
              _hover={{ bg: active ? activeBg : undefined }}
              title={
                option.count === 0
                  ? 'Ninguna oferta de esta pagina es de este genero'
                  : `${option.count} de esta pagina`
              }>
              {option.genre}
              {option.count > 0 ? (
                <Text as={'span'} ml={1.5} opacity={0.65} fontSize={'xs'}>
                  {option.count}
                </Text>
              ) : null}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}
