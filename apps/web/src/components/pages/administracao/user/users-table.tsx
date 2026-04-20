import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import type { UserWithRole } from "better-auth/client/plugins"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreHorizontalIcon,
  Pencil,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { User } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardFrame, CardFrameFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNavigate } from "@tanstack/react-router"
import { DeleteAlert } from "@/components/ui/delete-alert"
import { BanUser } from "./ban-user"

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    loggedUser: User
    deleteUser: (userId: string) => Promise<unknown>
  }
}

const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    size: 180,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 220,
  },
  {
    accessorKey: "role",
    cell: ({ row }) => (
      <Badge>
        {row.original.role === "admin" ? "Administrador" : "Usuário"}
      </Badge>
    ),
    enableSorting: false,
    header: "Perfil",
    size: 120,
  },
  {
    accessorKey: "banned",
    cell: ({ row }) => {
      const banned = row.original.banned
      return (
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              banned ? "bg-red-500" : "bg-emerald-500"
            )}
          />
          {banned ? "Inativo" : "Ativo"}
        </Badge>
      )
    },
    header: "Status",
    size: 100,
  },
  {
    accessorKey: "banReason",
    cell: ({ row }) => row.original.banReason ?? "--",
    enableSorting: false,
    header: "Descrição Status",
    size: 160,
  },
  {
    accessorKey: "banExpires",
    cell: ({ row }) =>
      row.original.banExpires
        ? new Date(row.original.banExpires).toLocaleDateString("pt-BR")
        : "--",
    enableSorting: false,
    header: "Termina em",
    size: 120,
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
      const { loggedUser, deleteUser } = table.options.meta!
      return (
        <ActionsCell
          user={row.original}
          loggedUser={loggedUser}
          deleteUser={deleteUser}
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
  user,
  loggedUser,
  deleteUser,
}: {
  user: UserWithRole
  loggedUser: User
  deleteUser: (userId: string) => Promise<unknown>
}) {
  const navigate = useNavigate()
  return (
    <div className="text-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontalIcon />
              <span className="sr-only">Abrir Menu</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <Button
            variant="ghost"
            className="flex w-full flex-row items-center justify-start gap-4"
            onClick={() =>
              navigate({
                to: "/administracao/usuario/$userId",
                params: { userId: user.id },
              })
            }
          >
            <Pencil />
            Editar Usuário
          </Button>
          <BanUser />
          <DropdownMenuSeparator />
          <DeleteAlert
            variant="destructive-outline"
            disabled={user.id === loggedUser.id}
            onAccept={() => deleteUser(user.id)}
            label="Excluir Usuário"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const UsersTable = ({
  totalUsers,
  users,
  loggedUser,
  deleteUser,
}: {
  totalUsers: number
  users: UserWithRole[] | undefined
  loggedUser: User
  deleteUser: (userId: string) => Promise<unknown>
}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { desc: false, id: "name" },
  ])

  const table = useReactTable({
    columns,
    data: users ?? [],
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { loggedUser, deleteUser },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: totalUsers,
    state: { pagination, sorting },
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
                    style={
                      columnSize ? { width: `${columnSize}px` } : undefined
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronUpIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
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
              <TableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
                key={row.id}
              >
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
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CardFrameFooter className="p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <p className="text-sm text-muted-foreground">Visualizando</p>
            <Select
              items={Array.from({ length: table.getPageCount() }, (_, i) => {
                const start = i * table.getState().pagination.pageSize + 1
                const end = Math.min(
                  (i + 1) * table.getState().pagination.pageSize,
                  table.getRowCount()
                )
                return { label: `${start}-${end}`, value: i + 1 }
              })}
              onValueChange={(value) => {
                table.setPageIndex((value as number) - 1)
              }}
              value={table.getState().pagination.pageIndex + 1}
            >
              <SelectTrigger
                aria-label="Selecionar intervalo de resultados"
                className="min-w-none w-fit"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {Array.from({ length: table.getPageCount() }, (_, i) => {
                  const start = i * table.getState().pagination.pageSize + 1
                  const end = Math.min(
                    (i + 1) * table.getState().pagination.pageSize,
                    table.getRowCount()
                  )
                  const pageNum = i + 1
                  return (
                    <SelectItem key={pageNum} value={pageNum}>
                      {`${start}-${end}`}
                    </SelectItem>
                  )
                })}
              </SelectPopup>
            </Select>
            <p className="text-sm text-muted-foreground">
              de{" "}
              <strong className="font-medium text-foreground">
                {table.getRowCount()}
              </strong>{" "}
              resultados
            </p>
          </div>

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="sm:*:[svg]:hidden"
                  render={
                    <Button
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="sm:*:[svg]:hidden"
                  render={
                    <Button
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardFrameFooter>
    </CardFrame>
  )
}
