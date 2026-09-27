import { isRouteErrorResponse,  useRouteError} from "react-router-dom"

const ErrorDetail = () => {
    const error= useRouteError()
  return (
    <div>{isRouteErrorResponse(error) ? error.statusText : "Unknown Error"}</div>
  )
}

export default ErrorDetail