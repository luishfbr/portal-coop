import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ModuleItem } from "@/hooks/use-modules-admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardFrame } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    toggleModule: (id: string) => Promise<unknown>
    togglingModule: boolean
  }
}

const columns: ColumnDef<ModuleItem>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    size: 180,
  },
  {
    accessorKey: "description",
    enableSorting: false,
    header: "Descrição",
    size: 280,
  },
  {
    accessorKey: "slug",
    enableSorting: false,
    header: "Slug",
    size: 200,
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: "isActive",
    cell: ({ row }) => {
      const active = row.original.isActive
      return (
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              active ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          {active ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    enableSorting: false,
    header: "Status",
    size: 100,
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
    header: "Criado em",
    size: 120,
  },
  {
    cell: ({ row, table }) => {
      const { toggleModule, togglingModule } = table.options.meta!
      const active = row.original.isActive
      return (
        <div className="text-end">
          <Button
            variant="outline"
            size="sm"
            disabled={togglingModule}
            onClick={() => toggleModule(row.original.id)}
          >
            {active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      )
    },
    enableSorting: false,
    header: "",
    id: "actions",
    size: 100,
  },
]

export function ModulesTable({
  modules,
  toggleModule,
  togglingModule,
}: {
  modules: ModuleItem[] | undefined
  toggleModule: (id: string) => Promise<unknown>
  togglingModule: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { desc: false, id: "name" },
  ])

  const table = useReactTable({
    columns,
    data: modules ?? [],
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { toggleModule, togglingModule },
    onSortingChange: setSorting,
    state: { sorting },
  })

  return (
    <CardFrame className="w-full">
      <Table variant="card">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize()
                return (
                  <TableHead
                    key={header.id}
                    style={columnSize ? { width: `${columnSize}px` } : undefined}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUpIcon aria-hidden="true" className="size-4 shrink-0 opacity-80" />,
                          desc: <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 opacity-80" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                Nenhum módulo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardFrame>
  )
}
