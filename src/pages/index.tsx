import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import ErrorDetail from "./ErrorDetail";
import NotFound from "./NotFound";
import Home from "./Home";
import Games from "./Games";

// GitHub Pages sirve 404.html al pedir /games-app/games, y ese 404 deja la ruta
// real aqui. Se recupera con replaceState (no pide nada al servidor) para que
// /games?store=1 funcione con recarga y con enlace compartido.
const redirect = new URLSearchParams(window.location.search).get("redirect");
if (redirect?.startsWith("/")) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.history.replaceState(null, "", `${base}${redirect}`);
}

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Layout />,
            errorElement: <Layout>
                <ErrorDetail />
            </Layout>,
            children: [
                {
                    index: true,
                    element: <Home />,
                },
                {
                    path: '/games',
                    element: <Games />,
                },
                {
                    // Sin esto, una URL mal escrita no renderizaba nada: la ruta
                    // mas cercana se queda con un <Outlet/> vacio.
                    path: '*',
                    element: <NotFound />,
                },
            ],
        },
    ],
    // En GitHub Pages la app cuelga de /games-app/, no de la raiz: sin esto
    // ninguna ruta coincide y salta la pagina de 404.
    { basename: import.meta.env.BASE_URL.replace(/\/$/, '') }
);

export default router;
