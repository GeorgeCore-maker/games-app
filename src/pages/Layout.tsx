import { Box } from '@chakra-ui/react';
import { Outlet } from "react-router-dom"
import Navbar from "./NavBar"
import { ReactNode } from "react"
import useEnableColorModeTransition from "../hooks/useEnableColorModeTransition"
import SiteBackground from "../components/SiteBackground"

type Props = {
  children?: ReactNode
}

const Layout = ({ children }: Props) => {
  useEnableColorModeTransition();
  return (
    <Box minH={'100dvh'}>
      <SiteBackground />
      {/* El contenido necesita zIndex propio: las capas de fondo son fixed con
          zIndex 0, y en el orden de pintado de CSS los elementos fijos se
          dibujan por encima del contenido estatico. */}
      <Box position={'relative'} zIndex={1}>
        <Navbar>
          {children ?? <Outlet />}
        </Navbar>
      </Box>
    </Box>
  )
}

export default Layout
