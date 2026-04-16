import { createFileRoute } from "@tanstack/react-router"
import { AdminHome } from "@/components/pages/administracao/admin-home"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminHome />
}
