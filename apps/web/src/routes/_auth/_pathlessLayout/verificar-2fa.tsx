import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_pathlessLayout/verificar-2fa')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/_pathlessLayout/verificar-2fa"!</div>
}
