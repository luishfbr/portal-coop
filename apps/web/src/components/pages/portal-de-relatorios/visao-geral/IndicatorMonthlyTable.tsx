import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MONTH_NAMES } from "@/lib/reports/vg-indicators"
import type { VGIndicatorData } from "@/hooks/use-reports"

type MonthRow = {
  month: number
  monthLabel: string
  target: number | null
  realized: number | null
  rate: number | null
  delta: number | null
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

function buildRows(
  monthlyData: VGIndicatorData["monthlyData"],
  direction: VGIndicatorData["direction"],
): MonthRow[] {
  return monthlyData.map((m) => {
    const rate =
      m.target !== null && m.realized !== null && m.target !== 0
        ? direction === "DECRESCENTE"
          ? m.target / m.realized
          : m.realized / m.target
        : null
    const delta =
      m.target !== null && m.realized !== null ? m.realized - m.target : null
    return {
      month: m.month,
      monthLabel: MONTH_NAMES[m.month - 1],
      target: m.target,
      realized: m.realized,
      rate,
      delta,
    }
  })
}

function makeColumns(
  unit: VGIndicatorData["unit"],
  currentMonth: number,
): ColumnDef<MonthRow>[] {
  return [
    {
      accessorKey: "monthLabel",
      header: "Mês",
      size: 100,
      cell: ({ row }) => {
        const isCurrentMonth = row.original.month === currentMonth
        return (
          <span className={cn("text-sm", isCurrentMonth && "font-semibold text-primary")}>
            {row.original.monthLabel}
            {isCurrentMonth && (
              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                atual
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: "target",
      header: "Meta",
      size: 130,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatValue(row.original.target, unit)}
        </span>
      ),
    },
    {
      accessorKey: "realized",
      header: "Realizado",
      size: 130,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatValue(row.original.realized, unit)}
        </span>
      ),
    },
    {
      accessorKey: "rate",
      header: "%",
      size: 90,
      cell: ({ row }) => {
        const rate = row.original.rate
        return (
          <span
            className={cn(
              "tabular-nums font-medium",
              rate !== null && rate >= 1 && "text-green-600 dark:text-green-400",
              rate !== null && rate < 1 && "text-red-600 dark:text-red-400",
            )}
          >
            {formatRate(rate)}
          </span>
        )
      },
    },
    {
      accessorKey: "delta",
      header: "Δ",
      size: 120,
      cell: ({ row }) => {
        const delta = row.original.delta
        if (delta === null) return <span className="tabular-nums text-muted-foreground">—</span>
        const positive = delta >= 0
        return (
          <span
            className={cn(
              "tabular-nums font-medium",
              positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
            )}
          >
            {positive ? "+" : ""}
            {formatValue(delta, unit)}
          </span>
        )
      },
    },
  ]
}

interface IndicatorMonthlyTableProps {
  unit: VGIndicatorData["unit"]
  direction: VGIndicatorData["direction"]
  monthlyData: VGIndicatorData["monthlyData"]
  currentMonth?: number
}

export function IndicatorMonthlyTable({
  unit,
  direction,
  monthlyData,
  currentMonth,
}: IndicatorMonthlyTableProps) {
  const effectiveMonth = currentMonth ?? new Date().getMonth() + 1
  const data = useMemo(
    () => buildRows(monthlyData, direction),
    [monthlyData, direction],
  )
  const columns = useMemo(
    () => makeColumns(unit, effectiveMonth),
    [unit, effectiveMonth],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  style={h.column.getSize() ? { width: `${h.column.getSize()}px` } : undefined}
                  className="text-xs font-medium"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const isCurrentMonth = row.original.month === effectiveMonth
            return (
              <TableRow
                key={row.id}
                className={cn(
                  "text-sm",
                  isCurrentMonth && "bg-primary/5",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
