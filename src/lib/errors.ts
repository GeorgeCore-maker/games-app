import axios from 'axios';

const OFFLINE =
  'No se pudo conectar con el servidor. Revisa tu conexion a internet e intentalo de nuevo.';
const UNKNOWN = 'Ha ocurrido un error inesperado. Intentalo de nuevo en un momento.';

/** Sin respuesta (DNS, CORS, timeout, red caida) devuelve undefined. */
export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function isNotFound(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

/**
 * No devuelve `error.message` a proposito: en produccion filtra hosts y rutas
 * internas. Para diagnostico, el error original sigue en react-query.
 */
export function getErrorMessage(error: unknown, fallback: string = UNKNOWN): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Sin respuesta: la peticion ni siquiera llego al servidor.
    if (status === undefined) {
      if (error.code === 'ECONNABORTED') {
        return 'La peticion tardo demasiado. La conexion parece lenta.';
      }
      return OFFLINE;
    }

    if (status === 404) return 'No encontramos ese recurso en el servidor.';
    if (status === 429) {
      return 'Demasiadas peticiones seguidas. Espera unos segundos antes de reintentar.';
    }
    if (status >= 500) {
      return 'El servidor esta teniendo problemas. Intentalo de nuevo en un momento.';
    }
    if (status >= 400) return 'La peticion no es valida. Prueba a cambiar los filtros.';
    return OFFLINE;
  }

  // json() sobre HTML: tipico cuando el proxy de Steam no responde.
  if (error instanceof SyntaxError) {
    return 'La respuesta del servidor no se pudo interpretar.';
  }

  // fetch() lanza TypeError sin red o con CORS bloqueado.
  if (error instanceof TypeError) return OFFLINE;

  return fallback;
}
