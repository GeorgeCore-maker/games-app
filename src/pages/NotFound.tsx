import { useLocation, useNavigate } from 'react-router-dom';
import ErrorState from '../components/ErrorState';

/**
 * Ruta 404. Va aparte de ErrorDetail a proposito: un 404 es el resultado
 * normal de escribir mal una URL, no un fallo de la aplicacion. Si se
 * reutilizara ErrorDetail aqui, useRouteError() devolveria undefined (no hay
 * error de ruta) y se mostraria el mensaje equivocado.
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
