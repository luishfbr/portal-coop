import { UnauthorizedPage } from "@/components/customs-pages/errors-page"
import { EnableTwoFactor } from "@/components/pages/two-factor/enable"
import { useRouter } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout/habilitar-2fa")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const user = router.options.context.auth.user

  if (!user) {
    return <UnauthorizedPage />
  }
  
  return <EnableTwoFactor />
}
