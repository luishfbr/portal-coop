import { JobFunctionsHome } from "@/components/pages/administracao/funcoes/job-functions-home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/funcoes"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <JobFunctionsHome />
}
