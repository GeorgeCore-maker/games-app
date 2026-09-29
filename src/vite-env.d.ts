/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del worker de Cloudflare, sin barra final. Sin esta variable el sitio
   *  funciona en dev pero descripciones, generos y mando salen vacios en
   *  produccion. Ejemplo: https://games-app-steam-proxy.<tu-usuario>.workers.dev */
  readonly VITE_STEAM_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
