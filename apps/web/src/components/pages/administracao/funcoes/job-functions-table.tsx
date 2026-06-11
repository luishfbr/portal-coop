import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon, MoreHorizontalIcon, Pencil } from "lucide-react"
import { useState } from "react"
import type { JobFunction } from "@/hooks/use-job-functions"
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
import { JobFunctionEditDialog } from "./job-function-form"
import { JobFunctionUsersDialog } from "./job-function-users-dialog"

declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    updateJobFunction: (args: { id: string; data: CatalogType }) => Promise<unknown>
    updatingJobFunction: boolean
    removeJobFunction: (id: string) => Promise<unknown>
    removingJobFunction: boolean
  }
}

const columns: ColumnDef<JobFunction>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    size: 260,
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
    header: "Criado em",
    size: 120,
  },
  {
    id: "userCount",
    header: "Usuários",
    size: 130,
    enableSorting: false,
    cell: ({ row }) => <JobFunctionUsersDialog jobFunction={row.original} />,
  },
  {
    cell: ({ row, table }) => {
      const {
        updateJobFunction,
        updatingJobFunction,
        removeJobFunction,
        removingJobFunction,
      } = table.options.meta!
      return (
        <ActionsCell
          fn={row.original}
          updateJobFunction={updateJobFunction}
          updatingJobFunction={updatingJobFunction}
          removeJobFunction={removeJobFunction}
          removingJobFunction={removingJobFunction}
        />
      )
    },
    enableSorting: false,
    header: "",
    id: "actions",
    size: 60,
  },
]

function ActionsCell({
  fn,
  updateJobFunction,
  updatingJobFunction,
  removeJobFunction,
  removingJobFunction,
}: {
  fn: JobFunction
  updateJobFunction: (args: { id: string; data: CatalogType }) => Promise<unknown>
  updatingJobFunction: boolean
  removeJobFunction: (id: string) => Promise<unknown>
  removingJobFunction: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="text-end">
      <JobFunctionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={{ name: fn.name }}
        onSubmit={(data) => updateJobFunction({ id: fn.id, data })}
        loading={updatingJobFunction}
      />
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
          <Button
            variant="ghost"
            className="flex w-full flex-row items-center justify-start gap-4"
            onClick={() => setEditOpen(true)}
          >
            <Pencil />
            Editar
          </Button>
          <DropdownMenuSeparator />
          <DeleteAlert
            variant="destructive-outline"
            disabled={removingJobFunction}
            onAccept={() => removeJobFunction(fn.id)}
            label="Excluir função"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function JobFunctionsTable({
  jobFunctions,
  updateJobFunction,
  updatingJobFunction,
  removeJobFunction,
  removingJobFunction,
}: {
  jobFunctions: JobFunction[] | undefined
  updateJobFunction: (args: { id: string; data: CatalogType }) => Promise<unknown>
  updatingJobFunction: boolean
  removeJobFunction: (id: string) => Promise<unknown>
  removingJobFunction: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { desc: false, id: "name" },
  ])

  const table = useReactTable({
    columns,
    data: jobFunctions ?? [],
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { updateJobFunction, updatingJobFunction, removeJobFunction, removingJobFunction },
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
                Nenhuma função encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardFrame>
  )
}
