import { createFileRoute } from "@tanstack/react-router"
import { ForbiddenPage } from "@/components/customs-pages/errors-page"
import { useAuth } from "@/auth"
import { MonthlyDataPage } from "@/components/pages/portal-de-relatorios/admin/MonthlyDataPage"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/portal-de-relatorios/_pathlessLayout/dados",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  if (user?.role !== "admin") return <ForbiddenPage />
  return <MonthlyDataPage />
}
