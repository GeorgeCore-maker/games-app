# Game Sale

Webapp para encontrar ofertas de juegos en Steam. Consulta los chokes de precio en
tiempo real, muestra cada oferta en una card con su precio anterior y actual, y
añade un toque de humor con un chiste de Chuck Norris traducido al español.

> Proyecto en desarrollo. La pantalla de **Inicio** está completa; la de
> **Juegos** lista las ofertas pero el buscador todavía no filtra.

---

## Características

- **Listado de ofertas** en una rejilla responsive (2 columnas en móvil, 3 en
  escritorio) con precio rebajado, porcentaje de ahorro, puntuación de Metacritic
  y valoración de Steam.
- **Descripción en español de cada juego**, obtenida de la ficha de Steam.
- **Chiste de Chuck Norris traducido al español** en la home, con skeleton
  mientras carga.
- **Navegación responsive** con menú hamburguesa en móvil, y layout anidado con
  `Outlet` de React Router.
- **Manejo de errores de ruta**: cualquier ruta o error de render muestra una
  pantalla de error dentro del mismo layout, sin perder la barra de navegación.
- **Tema claro/oscuro** en los componentes (vía `useColorModeValue` de Chakra).
  Nota: todavía no hay botón para alternarlo.

---

## Stack

| Tecnología | Versión | Uso |
| --- | --- | --- |
| React | 18.2 | UI |
| TypeScript | 5.9 | Tipado estricto (`strict: true`) |
| Vite | 5.4 | Bundler y servidor de desarrollo |
| Chakra UI | 2.8 | Componentes, tema y responsive |
| React Router | 6.23 | Enrutado con `createBrowserRouter` |
| TanStack Query | 5.104 | Fetch, caché y estados de carga |
| Axios | 1.6 | Cliente HTTP de CheapShark |

---

## Requisitos

- **Node.js 20 o superior** (recomendado). El proyecto funciona en 18, pero
  `npm install` muestra avisos `EBADENGINE` por dependencias que ya piden 20+.
- npm 10 o superior.

## Instalación

```bash
npm install
npm run dev
```

La app queda en http://localhost:5173.

## Scripts

```bash
npm run dev       # Servidor de desarrollo con HMR y proxy a Steam
npm run build     # Comprueba tipos con tsc y genera el build de producción
npm run preview   # Sirve el build de producción localmente
npm run lint      # ESLint sobre .ts y .tsx, falla con cualquier warning
```

---

## Estructura

```
src/
├── main.tsx                     # Entrada: QueryClientProvider > ChakraProvider > RouterProvider
├── pages/
│   ├── index.tsx                # Definición de rutas
│   ├── Layout.tsx               # Navbar + <Outlet />, compartido por todas las rutas
│   ├── NavBar.tsx               # Navegación responsive
│   ├── ErrorDetail.tsx          # Contenido de la ruta de error
│   ├── Home/
│   │   ├── index.tsx
│   │   ├── Hero.tsx             # Hero con fondo, skeleton y chiste
│   │   └── useChuck.ts          # Hook: chiste + traducción
│   └── Games/
│       ├── index.tsx            # Rejilla de ofertas
│       ├── GameCard.tsx         # Card de una oferta
│       ├── useGames.ts          # Hook: ofertas + tipo Game
│       └── useGameDescription.ts# Hook: descripción de Steam
└── vite-env.d.ts
```

---

## APIs externas

Ninguna requiere API key.

### CheapShark — ofertas

```
https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15
```

Devuelve 60 ofertas de Steam por debajo de 15 USD. El tipo `Game` de
`useGames.ts` refleja la respuesta real, y conviene recordar dos rarezas: casi
todos los campos llegan como **string** (`salePrice: "14.92"`,
`metacriticScore: "0"`, `isOnSale: "1"`), pero `releaseDate` y `lastChange` son
**número** (timestamp Unix en segundos). Para formatear precios hay que usar
`Number(game.salePrice)`, no `.toFixed()`.

> La API **rechaza las peticiones sin `User-Agent` descriptivo** y devuelve
> `400`. Desde el navegador no es problema (el navegador envía el suyo), pero
> desde Node, tests o SSR falla.

### Steam Store — descripciones

```
https://store.steampowered.com/api/appdetails?appids=<steamAppID>&l=spanish
```

Steam **no envía cabeceras CORS**, así que el navegador bloquearía un `fetch`
directo. Por eso `vite.config.ts` define un proxy que reescribe `/steam-api/*`
hacia `https://store.steampowered.com/api/*`:

```ts
server: {
  proxy: {
    '/steam-api': {
      target: 'https://store.steampowered.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/steam-api/, '/api'),
    },
  },
}
```

Con `l=spanish` la descripción llega ya traducida, sin consumir cuota de ningún
servicio de traducción.

### MyMemory — traducción del chiste

```
https://api.mymemory.translated.net/get?q=<texto>&langpair=en|es
```

Gratis y con CORS abierto. Límite anónimo de unos 5000 palabras al día por IP,
de sobra para un chiste por visita. La traducción ocurre **dentro** de
`queryFn`, así que el texto en inglés nunca llega a pintarse.

---

## Notas de implementación

- **Steam no acepta lotes.** `?appids=1,2,3` devuelve `400`: solo admite un App ID
  por petición. Por eso la descripción de los 60 juegos son 60 requests
  (uno por card), no uno. Se mitiga con `staleTime` de 24 h, que además evita
  repetir la petición al navegar dentro de la app.
- **El proxy solo existe en desarrollo.** `server.proxy` no forma parte del build
  de producción, así que en `npm run build` las descripciones no llegarán. Para
  desplegar hace falta una serverless function (Vercel, Netlify) o un backend
  propio que reenvíe a Steam.
- **El estado de carga se lee con `isPending`**, no con `isLoading`. En
  TanStack Query v5 `isLoading` significa `isPending && isFetching`, o sea
  incluye recargas; `isPending` es la bandera de "primera carga".
- **Un hook nunca se llama dentro de una rama condicional.** En `GameCard.tsx` el
  `useColorModeValue` de la descripción está subido al inicio del componente; si
  estuviera dentro del `isPending ? ... : ...` cambiaría el número de hooks
  entre renders y React lanzaría un error.
- **El componente `Text` de Chakra renderiza un `<p>`.** Meter un `Skeleton` (que
  es un `div`) dentro genera el warning `validateDOMNesting`, por eso el bloque de
  texto del Hero usa `as="div"`.

---

## Pendiente

- [ ] El botón "Empieza a buscar" no tiene manejador: falta el buscador por nombre.
- [ ] Alternador de tema claro/oscuro.
- [ ] `src/App.tsx` y `src/App.css` quedaron sin uso desde que el entry point es
      `main.tsx` + `pages/`. Se pueden borrar.
- [ ] No hay tests configurados.
- [ ] No hay `LICENSE`. El repo es público, así que conviene decidirla.
- [x] El `README` original de la plantilla de Vite fue sustituido por este.

## Créditos

- Datos de ofertas: [CheapShark](https://www.cheapshark.com/)
- Descripciones: [Steam Store](https://store.steampowered.com/)
- Chistes: [Chuck Norris Jokes API](https://api.chucknorris.io/)
- Traducción: [MyMemory](https://mymemory.translated.net/)
