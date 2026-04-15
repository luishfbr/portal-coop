import { EnableTwoFactor } from "@/components/pages/two-factor/enable"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout/habilitar-2fa")({
  component: RouteComponent,
})

function RouteComponent() {
  return <EnableTwoFactor />
}
