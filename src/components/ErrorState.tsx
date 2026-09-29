import type { ReactNode } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { getErrorMessage } from '../lib/errors';

type Props = {
  title?: string;
  /** Si no se pasa, se deriva del error. */
  description?: string;
  error?: unknown;
  hint?: ReactNode;
  onRetry?: () => void;
  isRetrying?: boolean;
  actionLabel?: string;
  /** Ocupa toda la altura de la pantalla en vez de ser una caja compacta. */
  full?: boolean;
};

/** Fondo semitransparente porque el body es transparente y se ve la foto. */
export default function ErrorState({
  title = 'Algo no ha ido bien',
  description,
  error,
  hint,
  onRetry,
  isRetrying = false,
  actionLabel = 'Reintentar',
  full = false,
}: Props) {
  const bg = useColorModeValue('whiteAlpha.800', 'blackAlpha.700');
  const borderColor = useColorModeValue('red.200', 'red.900');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const body = (
    <Alert
      status="error"
      variant="solid"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      bg={bg}
      backdropFilter="blur(6px)"
      borderWidth="1px"
      borderColor={borderColor}
      rounded="xl"
      px={{ base: 5, md: 8 }}
      py={{ base: 6, md: 8 }}
      w="full">
      <AlertIcon boxSize="40px" mr={0} mb={3} />
      <AlertTitle fontSize={{ base: 'md', md: 'lg' }} mb={2}>
        {title}
      </AlertTitle>
      {description || error !== undefined ? (
        <AlertDescription fontSize="sm" maxW="34rem" color={mutedColor}>
          {description ?? getErrorMessage(error)}
        </AlertDescription>
      ) : null}
      {hint ? (
        <Text fontSize="sm" color={mutedColor} mt={3} maxW="34rem">
          {hint}
        </Text>
      ) : null}
      {onRetry ? (
        <Button
          mt={5}
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={onRetry}
          isLoading={isRetrying}
          loadingText="Reintentando">
          {actionLabel}
        </Button>
      ) : null}
    </Alert>
  );

  if (!full) return body;

  return (
    <Box
      minH="calc(100dvh - 96px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}>
      <Stack maxW="2xl" w="full" spacing={4}>
        {body}
      </Stack>
    </Box>
  );
}
