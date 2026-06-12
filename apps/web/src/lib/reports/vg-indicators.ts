export type IndicatorCategory =
  | "planejamento-estrategico"
  | "pacto-sistemico"
  | "orcamento"
  | "metas-comerciais"

export const INDICATOR_CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  "planejamento-estrategico": "Planejamento Estratégico",
  "pacto-sistemico": "Pacto Sistêmico",
  orcamento: "Orçamento",
  "metas-comerciais": "Metas Comerciais",
}

export type ConsolidationMethod =
  | "ACUMULADO"
  | "MOVIMENTACAO_NO_PERIODO"
  | "MEDIA_ACUMULADA"
  | "MEDIA_MOVIMENTACAO_NO_PERIODO"

export interface VGIndicator {
  slug: string
  name: string
  description: string
  categories: IndicatorCategory[]
  periodicity: "MENSAL" | "BIMESTRAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL"
  calculationLag: number
  direction: "CRESCENTE" | "DECRESCENTE" | "FIXO"
  consolidationMethod: ConsolidationMethod
  unit: "MOEDA" | "PORCENTAGEM" | "INTEIRO"
  criticalThreshold: number
}

export const VG_INDICATORS: VGIndicator[] = [
  {
    slug: "capital-social",
    name: "Capital Social",
    description: "Valor final de saldo integralizado pelos cooperados.",
    categories: ["planejamento-estrategico", "orcamento"],
    periodicity: "MENSAL",
    calculationLag: 1,
    direction: "CRESCENTE",
    consolidationMethod: "MOVIMENTACAO_NO_PERIODO",
    unit: "MOEDA",
    criticalThreshold: 0.8,
  },
  {
    slug: "capital-integralizado",
    name: "Capital Integralizado",
    description: "Saldo de integralização de capital em determinado período de tempo.",
    categories: ["metas-comerciais"],
    periodicity: "MENSAL",
    calculationLag: 1,
    direction: "CRESCENTE",
    consolidationMethod: "ACUMULADO",
    unit: "MOEDA",
    criticalThreshold: 0.8,
  },
  {
    slug: "q2",
    name: "Q2",
    description:
      "Quadrante responsável por fornecer a porcentagem de diferença entre a quantidade de cooperados versus a quantidade de produtos que cada cooperado tem.",
    categories: ["planejamento-estrategico", "metas-comerciais"],
    periodicity: "MENSAL",
    calculationLag: 2,
    direction: "DECRESCENTE",
    consolidationMethod: "MEDIA_MOVIMENTACAO_NO_PERIODO",
    unit: "PORCENTAGEM",
    criticalThreshold: 0.95,
  },
  {
    slug: "inad-ajustado",
    name: "Inad Ajustado",
    description: "Não informada...",
    categories: ["planejamento-estrategico", "metas-comerciais"],
    periodicity: "MENSAL",
    calculationLag: 1,
    direction: "DECRESCENTE",
    consolidationMethod: "MEDIA_MOVIMENTACAO_NO_PERIODO",
    unit: "PORCENTAGEM",
    criticalThreshold: 0.95,
  },
  {
    slug: "inad-90",
    name: "Inad 90",
    description: "Não informada...",
    categories: ["planejamento-estrategico"],
    periodicity: "MENSAL",
    calculationLag: 1,
    direction: "DECRESCENTE",
    consolidationMethod: "MEDIA_MOVIMENTACAO_NO_PERIODO",
    unit: "PORCENTAGEM",
    criticalThreshold: 0.95,
  },
  {
    slug: "ihh-12",
    name: "IHH 12 Meses",
    description: "Não informada...",
    categories: ["planejamento-estrategico"],
    periodicity: "MENSAL",
    calculationLag: 1,
    direction: "DECRESCENTE",
    consolidationMethod: "MEDIA_MOVIMENTACAO_NO_PERIODO",
    unit: "PORCENTAGEM",
    criticalThreshold: 0.95,
  },
  {
    slug: "resultado-acumulado-exercicio",
    name: "Resultado Acumulado Exercício",
    description: "Resultado mensal da cooperativa após o rateio.",
    categories: ["planejamento-estrategico", "orcamento"],
    periodicity: "MENSAL",
    calculationLag: 1,
    direction: "CRESCENTE",
    consolidationMethod: "ACUMULADO",
    unit: "MOEDA",
    criticalThreshold: 0.8,
  },
]

export const VG_INDICATOR_SLUGS = new Set(VG_INDICATORS.map((i) => i.slug))

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]
