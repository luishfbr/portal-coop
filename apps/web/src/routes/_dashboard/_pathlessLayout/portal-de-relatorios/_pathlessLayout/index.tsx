import { createFileRoute } from "@tanstack/react-router"
import { ReportsHub } from "@/components/pages/portal-de-relatorios/hub/ReportsHub"
import { activeDashboardsQueryOptions } from "@/hooks/use-reports"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/portal-de-relatorios/_pathlessLayout/",
)({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(activeDashboardsQueryOptions()),
  component: ReportsHubPage,
})

function ReportsHubPage() {
  return <ReportsHub />
}
