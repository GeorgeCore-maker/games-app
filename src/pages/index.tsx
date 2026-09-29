import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import ErrorDetail from "./ErrorDetail";
import NotFound from "./NotFound";
import Home from "./Home";
import Games from "./Games";

const router = createBrowserRouter([
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
]);

export default router;
