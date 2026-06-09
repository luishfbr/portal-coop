import { SectorsHome } from "@/components/pages/administracao/setores/sectors-home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/setores"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SectorsHome />
}
