import { GruposHome } from "@/components/pages/administracao/grupos/grupos-home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/grupos"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <GruposHome />
}
