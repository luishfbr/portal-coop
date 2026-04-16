import { UserHome } from "@/components/pages/administracao/user/user-home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/usuarios"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserHome />
}
