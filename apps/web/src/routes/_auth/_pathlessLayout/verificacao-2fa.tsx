import { TwoFactorVerificationForm } from "@/components/pages/two-factor/verification"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout/verificacao-2fa")({
  component: RouteComponent,
})

function RouteComponent() {
  return <TwoFactorVerificationForm />
}
