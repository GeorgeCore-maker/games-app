import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import ErrorState from '../components/ErrorState';

const ErrorDetail = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const goHome = () => navigate('/');

  // react-router da un objeto de respuesta para errores de ruta (404, 500) y
  // una excepcion normal para cualquier otro fallo. Antes los dos casos
  // terminaban en "Unknown Error", sin decir nada ni al usuario ni en consola.
  if (isRouteErrorResponse(error)) {
    const isNotFound = error.status === 404;

    return (
      <ErrorState
        full
        title={isNotFound ? 'Pagina no encontrada' : `Error ${error.status}`}
        description={
          isNotFound
            ? 'La pagina que buscas no existe. Puede que el enlace este mal escrito o que ya no este disponible.'
            : 'No se ha podido cargar esta pagina. Vuelve al inicio e intentalo de nuevo.'
        }
        onRetry={goHome}
        actionLabel="Volver al inicio"
      />
    );
  }

  // El error real solo a consola: el texto puede filtrar rutas internas.
  console.error('[ErrorDetail] error de render no controlado:', error);

  return (
    <ErrorState
      full
      title="Algo no ha ido bien"
      description="Se ha producido un fallo inesperado al cargar esta pagina."
      onRetry={goHome}
      actionLabel="Volver al inicio"
    />
  );
};

export default ErrorDetail;
