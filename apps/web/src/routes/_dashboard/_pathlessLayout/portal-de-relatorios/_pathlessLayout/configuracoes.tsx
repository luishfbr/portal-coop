import { createFileRoute } from "@tanstack/react-router"
import { ForbiddenPage } from "@/components/customs-pages/errors-page"
import { useAuth } from "@/auth"
import { DashboardsConfigPage } from "@/components/pages/portal-de-relatorios/admin/DashboardsConfigPage"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/portal-de-relatorios/_pathlessLayout/configuracoes",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  if (user?.role !== "admin") return <ForbiddenPage />
  return <DashboardsConfigPage />
}
