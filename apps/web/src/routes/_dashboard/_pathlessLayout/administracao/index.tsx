import { createFileRoute } from "@tanstack/react-router"
import { AdminHome } from "@/components/pages/administracao/AdminHome"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/",
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminHome />
}
