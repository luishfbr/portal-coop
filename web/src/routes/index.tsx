import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad(ctx) {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      })
    } else {
      throw redirect({
        to: "/pagina-inicial",
      })
    }
  },
})

function RouteComponent() {
  return null
}
