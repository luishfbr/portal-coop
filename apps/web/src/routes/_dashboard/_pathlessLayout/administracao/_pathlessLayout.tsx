import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout"
)({
  component: RouteComponent,
  beforeLoad(ctx) {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      })
    } else if (ctx.context.auth.user?.role !== "admin") {
      throw redirect({
        to: "/pagina-inicial",
      })
    }
  },
})

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  )
}
