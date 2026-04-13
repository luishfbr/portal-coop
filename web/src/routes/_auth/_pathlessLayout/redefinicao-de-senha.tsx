import { RequestResetPassForm } from "@/components/pages/reset-password/request"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_auth/_pathlessLayout/redefinicao-de-senha"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <RequestResetPassForm />
}
