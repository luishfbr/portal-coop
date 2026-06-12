import { ChartColumnBig } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface DashboardConfig {
  slug: string
  name: string
  description: string
  icon: LucideIcon
  url: string
  category: string
}

export const REPORTS_DASHBOARDS: DashboardConfig[] = [
  {
    slug: "visao-geral",
    name: "Visão Geral Indicadores",
    description: "Acompanhe os indicadores estratégicos com realizado vs meta mensal.",
    icon: ChartColumnBig,
    url: "/portal-de-relatorios/visao-geral",
    category: "Geral",
  },
]
