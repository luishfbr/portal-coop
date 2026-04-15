import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_pathlessLayout/governanca-analitica/formatar-planilha',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_dashboard/_pathlessLayout/governanca-analitica/formatar-planilha"!
    </div>
  )
}
