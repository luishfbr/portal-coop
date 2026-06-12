import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { VisaoGeral } from "@/components/pages/portal-de-relatorios/visao-geral/VisaoGeral"
import { vgDataQueryOptions } from "@/hooks/use-reports"

const searchSchema = z.object({
  year: z
    .number()
    .int()
    .min(2020)
    .max(2040)
    .catch(new Date().getFullYear()),
  month: z.number().int().min(1).max(12).optional(),
  category: z.string().optional(),
})

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/portal-de-relatorios/_pathlessLayout/visao-geral/",
)({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { year, month } }) => ({ year, month }),
  loader: ({ context: { queryClient }, deps: { year, month } }) =>
    queryClient.ensureQueryData(vgDataQueryOptions(year, month)),
  component: VisaoGeralPage,
})

function VisaoGeralPage() {
  return <VisaoGeral />
}
