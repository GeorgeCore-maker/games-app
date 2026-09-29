import axios from 'axios';

const OFFLINE =
  'No se pudo conectar con el servidor. Revisa tu conexion a internet e intentalo de nuevo.';
const UNKNOWN = 'Ha ocurrido un error inesperado. Intentalo de nuevo en un momento.';

/**
 * Devuelve el codigo HTTP si el error viene de axios con respuesta.
 * Si no hay respuesta (DNS, CORS, timeout, red caida) devuelve undefined, que
 * es justo el caso en el que conviene ofrecer "reintentar".
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

/** Un 404 solo merece pantalla de "no encontrado" si viene de una ruta. */
export function isNotFound(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

/**
 * Convierte cualquier error en un mensaje que se pueda enseñar al usuario.
 *
 * No devuelve `error.message` a proposito: en produccion eso filtra nombres
 * de hosts, rutas internas y textos de error ajenos. Para diagnostico, el
 * error original sigue en el log de la consola y en el estado de react-query.
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

  // response.json() sobre algo que no es JSON. Es el fallo tipico cuando el
  // proxy de Steam no existe en produccion y responde con el index.html.
  if (error instanceof SyntaxError) {
    return 'La respuesta del servidor no se pudo interpretar.';
  }

  // fetch() lanza TypeError cuando no hay red o CORS bloquea la respuesta.
  if (error instanceof TypeError) return OFFLINE;

  return fallback;
}
