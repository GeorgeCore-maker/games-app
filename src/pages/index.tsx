import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import ErrorDetail from "./ErrorDetail";
import Home from "./Home";

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
                element: <h1>Detalles del Juego</h1>,
            },
        ],
    },
]);

export default router;