import { useLocation, useNavigate } from 'react-router-dom';
import ErrorState from '../components/ErrorState';

/**
 * Va aparte de ErrorDetail: un 404 es escribir mal una URL, no un fallo de la
 * app, y useRouteError() no devuelve error de ruta aqui.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <ErrorState
      full
      title="Pagina no encontrada"
      description={`La direccion "${pathname}" no corresponde a ninguna pagina de la web.`}
      onRetry={() => navigate('/')}
      actionLabel="Volver al inicio"
    />
  );
};

export default NotFound;
