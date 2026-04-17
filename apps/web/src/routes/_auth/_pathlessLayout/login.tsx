import { LoginForm } from "@/components/pages/authentication/login-form"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout/login")({
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
  return <LoginForm />
}
