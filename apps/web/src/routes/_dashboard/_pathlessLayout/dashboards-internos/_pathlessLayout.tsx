import { ForbiddenPage } from "@/components/customs-pages/errors-page"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { useActiveModules } from "@/hooks/use-active-modules"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/dashboards-internos/_pathlessLayout"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { activeSlugs, isPending } = useActiveModules()

  if (isPending) return <LoadingComponent />
  if (!activeSlugs?.includes("dashboards-internos")) return <ForbiddenPage />
  return <Outlet />
}
