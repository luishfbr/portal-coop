import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import type { AuthContext } from "../auth"
// import { ThemeProvider } from "@/components/theme-provider"

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

// <ThemeProvider
//   attribute="class"
//   defaultTheme="system"
//   enableSystem
//   disableTransitionOnChange
// >
//   <Outlet />
// </ThemeProvider>
