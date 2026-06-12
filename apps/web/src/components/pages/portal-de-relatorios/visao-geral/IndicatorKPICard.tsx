import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { INDICATOR_CATEGORY_LABELS, type IndicatorCategory } from "@/lib/reports/vg-indicators"
import type { VGIndicatorData } from "@/hooks/use-reports"

type KPIStatus = "achieved" | "in-progress" | "critical" | "no-data"

function getStatus(rate: number | null, isCritical: boolean | null): KPIStatus {
  if (rate === null) return "no-data"
  if (isCritical === true) return "critical"
  if (rate >= 1.0) return "achieved"
  return "in-progress"
}

const STATUS_CONFIG: Record<
  KPIStatus,
  { label: string; borderClass: string; badgeClass: string }
> = {
  achieved: {
    label: "Atingido",
    borderClass: "border-l-green-500",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  "in-progress": {
    label: "Em andamento",
    borderClass: "border-l-yellow-500",
    badgeClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  critical: {
    label: "Crítico",
    borderClass: "border-l-red-500",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  "no-data": {
    label: "Sem dados",
    borderClass: "border-l-border",
    badgeClass: "bg-muted text-muted-foreground",
  },
}

function formatValue(
  value: number | null,
  unit: VGIndicatorData["unit"],
): string {
  if (value === null) return "—"
  if (unit === "MOEDA") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }
  if (unit === "PORCENTAGEM") {
    return (
      new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + "%"
    )
  }
  return new Intl.NumberFormat("pt-BR").format(value)
}

function formatRate(rate: number | null): string {
  if (rate === null) return "—"
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate)
}

interface IndicatorKPICardProps {
  indicator: VGIndicatorData
}

export function IndicatorKPICard({ indicator }: IndicatorKPICardProps) {
  const status = getStatus(indicator.achievementRate, indicator.isCritical)
  const { label, borderClass, badgeClass } = STATUS_CONFIG[status]

  return (
    <Card
      className={cn(
        "relative border-l-4 transition-shadow hover:shadow-md",
        borderClass,
      )}
    >
      <CardContent className="pt-4">
        {/* Badge de status */}
        <span
          className={cn(
            "absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium",
            badgeClass,
          )}
        >
          {label}
        </span>

        {/* Nome do indicador */}
        <p className="pr-24 text-sm font-semibold leading-snug text-foreground">
          {indicator.name}
        </p>

        {/* Categoria(s) */}
        {indicator.categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {indicator.categories.map((cat: IndicatorCategory) => (
              <span
                key={cat}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {INDICATOR_CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>
        )}

        {/* Realizado em destaque */}
        <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight">
          {formatValue(indicator.consolidatedRealized, indicator.unit)}
        </p>

        {/* Meta e taxa */}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Meta:{" "}
            <span className="font-medium text-foreground">
              {formatValue(indicator.consolidatedTarget, indicator.unit)}
            </span>
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span>
            Atingimento:{" "}
            <span
              className={cn(
                "font-medium",
                status === "achieved" && "text-green-600 dark:text-green-400",
                status === "critical" && "text-red-600 dark:text-red-400",
                status === "in-progress" && "text-yellow-600 dark:text-yellow-400",
              )}
            >
              {formatRate(indicator.achievementRate)}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
