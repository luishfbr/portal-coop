import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/dashboards-internos/_pathlessLayout/atualizar-relatorios"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_dashboard/_pathlessLayout/dashboards-internos/atualizar-relatorios"!
    </div>
  )
}
