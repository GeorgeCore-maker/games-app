import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import {  RouterProvider } from 'react-router-dom'
import router from './pages/index.tsx'
import theme from './theme.ts'
import AppErrorBoundary from './components/AppErrorBoundary.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
  // Solo se reintenta si el error es transitorio (5xx o red caida): ante un 400
  // insistir no lo arregla.
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
  // Evita volver a pedir 60 juegos en cada cambio de filtro.
      staleTime: 1000 * 60 * 5,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <RouterProvider router={router} />
        </ChakraProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
)
