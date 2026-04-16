import { LoginForm } from "@/components/pages/authentication/login-form"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout/login")({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginForm />
}
