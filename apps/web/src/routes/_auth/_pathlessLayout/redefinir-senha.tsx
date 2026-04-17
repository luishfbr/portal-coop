import { ResetPasswordForm } from "@/components/pages/reset-password/reset-password"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

const tokenSearch = z.object({
  token: z.string().trim().min(1),
})

export const Route = createFileRoute("/_auth/_pathlessLayout/redefinir-senha")({
  component: RouteComponent,
  validateSearch: tokenSearch,
  beforeLoad(ctx) {
    if (!ctx.search.token) {
      throw redirect({
        to: "/redefinicao-de-senha",
      })
    } else if (ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/pagina-inicial",
      })
    }
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const token = search.token

  return <ResetPasswordForm token={token} />
}
