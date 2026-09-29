import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import ErrorState from './ErrorState';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/** Si un componente revienta al renderizar, React desmonta el arbol y sin esto
 *  el usuario se queda con pantalla en blanco. react-query cubre la red. */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Aqui si se deja el error real: va a la consola, no a la pantalla.
    console.error('[AppErrorBoundary] fallo al renderizar:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Box minH="100dvh" display="flex" alignItems="center" justifyContent="center">
        <ErrorState
          full
          title="La aplicacion se ha roto"
          description={
            'Ha ocurrido un fallo inesperado al mostrar la pagina. Puedes reintentarlo sin recargarla por completo.'
          }
          onRetry={this.handleReset}
        />
      </Box>
    );
  }
}
