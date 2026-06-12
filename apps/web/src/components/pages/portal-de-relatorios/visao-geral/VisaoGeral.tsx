import { useNavigate } from "@tanstack/react-router"
import { BarChart2 } from "lucide-react"
import { DefaultHeader } from "@/components/ui/header-component"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { INDICATOR_CATEGORY_LABELS, MONTH_NAMES, type IndicatorCategory } from "@/lib/reports/vg-indicators"
import { useVGData } from "@/hooks/use-reports"
import { IndicatorKPICard } from "./IndicatorKPICard"
import { IndicatorMonthlyTable } from "./IndicatorMonthlyTable"
import { Route } from "@/routes/_dashboard/_pathlessLayout/portal-de-relatorios/_pathlessLayout/visao-geral/"

const INDICATOR_CATEGORIES = Object.keys(
  INDICATOR_CATEGORY_LABELS,
) as IndicatorCategory[]

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  )
}

export function VisaoGeral() {
  const { year, month, category } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data, isPending } = useVGData(year, month)

  const filteredData = category
    ? data?.filter((ind) =>
        ind.categories.includes(category as IndicatorCategory),
      )
    : data

  function setYear(y: number) {
    void navigate({ search: (prev) => ({ ...prev, year: y }) })
  }

  function setMonth(m: number | undefined) {
    void navigate({ search: (prev) => ({ ...prev, month: m }) })
  }

  function toggleCategory(cat: IndicatorCategory) {
    void navigate({
      search: (prev) => ({
        ...prev,
        category: prev.category === cat ? undefined : cat,
      }),
    })
  }

  const currentMonth = month ?? new Date().getMonth() + 1

  return (
    <div className="flex h-full w-full flex-col gap-5">
      <DefaultHeader
        title="Visão Geral Indicadores"
        description="Acompanhe os indicadores estratégicos com realizado vs meta mensal."
      />

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Seletor de ano */}
        <div className="flex items-center gap-2">
          <label htmlFor="vg-year" className="text-sm font-medium">
            Ano:
          </label>
          <Input
            id="vg-year"
            type="number"
            min={2020}
            max={2040}
            value={year}
            onChange={(e) => {
              const y = parseInt(e.target.value)
              if (!isNaN(y) && y >= 2020 && y <= 2040) setYear(y)
            }}
            className="w-24"
          />
        </div>

        {/* Seletor de mês */}
        <div className="flex items-center gap-2">
          <label htmlFor="vg-month" className="text-sm font-medium">
            Mês:
          </label>
          <select
            id="vg-month"
            value={month ?? ""}
            onChange={(e) =>
              setMonth(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Atual (automático)</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Separador */}
        <div className="h-5 w-px bg-border" />

        {/* Pills de categoria */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() =>
              void navigate({ search: (prev) => ({ ...prev, category: undefined }) })
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            Todos
          </button>
          {INDICATOR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {INDICATOR_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      {isPending ? (
        <SkeletonGrid />
      ) : !filteredData || filteredData.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
          <BarChart2 className="size-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">Nenhum indicador disponível</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {category
                ? "Nenhum indicador encontrado para esta categoria."
                : "Nenhum indicador configurado para o Visão Geral."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Grid de KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((indicator) => (
              <IndicatorKPICard key={indicator.slug} indicator={indicator} />
            ))}
          </div>

          {/* Detalhes mensais por indicador */}
          <div className="flex flex-col gap-6">
            {filteredData.map((indicator) => (
              <section key={indicator.slug}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {indicator.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    — Detalhes mensais
                  </span>
                </div>
                <IndicatorMonthlyTable
                  unit={indicator.unit}
                  direction={indicator.direction}
                  monthlyData={indicator.monthlyData}
                  currentMonth={currentMonth}
                />
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
