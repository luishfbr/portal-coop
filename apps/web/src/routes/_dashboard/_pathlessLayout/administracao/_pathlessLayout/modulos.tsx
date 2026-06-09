import { ModulesHome } from "@/components/pages/administracao/modulos/modules-home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/modulos"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ModulesHome />
}
