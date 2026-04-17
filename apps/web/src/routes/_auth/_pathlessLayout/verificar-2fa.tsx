import { VerifyTotpForm } from "@/components/pages/two-factor/verify"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout/verificar-2fa")({
  component: RouteComponent,
})

function RouteComponent() {
  return <VerifyTotpForm />
}
