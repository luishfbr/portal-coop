import { AgenciesHome } from "@/components/pages/administracao/agencias/agencies-home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/agencias"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgenciesHome />
}
