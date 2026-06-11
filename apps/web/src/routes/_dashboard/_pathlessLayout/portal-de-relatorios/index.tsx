import { DefaultHeader } from "@/components/ui/header-component"
import { createFileRoute } from "@tanstack/react-router"

const categoriasRelatorios = [
  {
    name: "Visão Geral",
    description: "Relatórios disponibilizados para todos os colaboradores",
  },
]

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/portal-de-relatorios/"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Portal de Relatórios"
        description="Todos os dashboards da cooperativa, centralizados em um só lugar."
      />
      <div className="grid grid-cols-4"></div>
    </div>
  )
}
