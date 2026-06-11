import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon, MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"
import type { Agency } from "@/hooks/use-agencies"
import type { CatalogType } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { CardFrame } from "@/components/ui/card"
import { DeleteAlert } from "@/components/ui/delete-alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AgencyEditButton } from "./agency-form"

declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    updateAgency: (args: { id: string; data: CatalogType }) => Promise<unknown>
    updatingAgency: boolean
    removeAgency: (id: string) => Promise<unknown>
    removingAgency: boolean
  }
}

const columns: ColumnDef<Agency>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    size: 260,
  },
  {
    accessorKey: "userCount",
    enableSorting: false,
    header: "Usuários",
    size: 100,
    cell: ({ row }) => row.original.userCount,
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
      const { updateAgency, updatingAgency, removeAgency, removingAgency } =
        table.options.meta!
      const agency = row.original
      return (
        <div className="text-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <AgencyEditButton
                defaultValues={{ name: agency.name }}
                onSubmit={(data) => updateAgency({ id: agency.id, data })}
                loading={updatingAgency}
              />
              <DropdownMenuSeparator />
              <DeleteAlert
                variant="destructive-outline"
                disabled={removingAgency}
                onAccept={() => removeAgency(agency.id)}
                label="Excluir agência"
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    header: "",
    id: "actions",
    size: 60,
  },
]

export function AgenciesTable({
  agencies,
  updateAgency,
  updatingAgency,
  removeAgency,
  removingAgency,
}: {
  agencies: Agency[] | undefined
  updateAgency: (args: { id: string; data: CatalogType }) => Promise<unknown>
  updatingAgency: boolean
  removeAgency: (id: string) => Promise<unknown>
  removingAgency: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { desc: false, id: "name" },
  ])

  const table = useReactTable({
    columns,
    data: agencies ?? [],
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { updateAgency, updatingAgency, removeAgency, removingAgency },
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
                    aria-sort={
                      header.column.getCanSort()
                        ? header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
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
                Nenhuma agência encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardFrame>
  )
}
