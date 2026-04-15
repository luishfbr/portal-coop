import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_pathlessLayout/pagina-inicial',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/_pathlessLayout/pagina-inicial"!</div>
}
