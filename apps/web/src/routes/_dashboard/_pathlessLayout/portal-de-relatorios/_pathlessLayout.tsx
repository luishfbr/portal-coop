import { ForbiddenPage } from "@/components/customs-pages/errors-page"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { useActiveModules } from "@/hooks/use-active-modules"
import { useAuth } from "@/auth"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/portal-de-relatorios/_pathlessLayout",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { activeSlugs, isPending } = useActiveModules()
  const { user } = useAuth()

  if (isPending) return <LoadingComponent />
  if (user?.role !== "admin" && !activeSlugs?.includes("portal-de-relatorios"))
    return <ForbiddenPage />
  return <Outlet />
}
