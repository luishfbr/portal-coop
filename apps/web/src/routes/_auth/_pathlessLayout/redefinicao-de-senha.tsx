import { RequestResetPassForm } from "@/components/pages/reset-password/request"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_auth/_pathlessLayout/redefinicao-de-senha"
)({
  component: RouteComponent,
  beforeLoad(ctx) {
    if (ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/pagina-inicial",
      })
    }
  },
})

function RouteComponent() {
  return <RequestResetPassForm />
}
