import { Outlet } from "react-router-dom"
import Navbar from "./NavBar"
import { ReactNode } from "react"

type Props = {
  children?: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div>
      <Navbar>
        {children ?? <Outlet />}
      </Navbar>
    </div>
  )
}

export default Layout