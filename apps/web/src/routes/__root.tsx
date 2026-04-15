import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import type { AuthContext } from "../auth"

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
