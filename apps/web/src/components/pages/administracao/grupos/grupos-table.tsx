import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon, LayoutDashboard, MoreHorizontalIcon, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { type Group, useGroupModules, useGroupUsers } from "@/hooks/use-groups"
import { useModulesAdmin } from "@/hooks/use-modules-admin"
import { authClient } from "@/lib/auth-client"
import type { GroupType } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { CardFrame } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteAlert } from "@/components/ui/delete-alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { GrupoEditButton } from "./grupo-form"

declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    updateGroup: (args: { id: string; data: GroupType }) => Promise<unknown>
    updatingGroup: boolean
    removeGroup: (id: string) => Promise<unknown>
    removingGroup: boolean
    setGroupModules: (args: { groupId: string; moduleIds: string[] }) => Promise<unknown>
    settingGroupModules: boolean
    setGroupUsers: (args: { groupId: string; userIds: string[] }) => Promise<unknown>
    settingGroupUsers: boolean
  }
}

// ── Dialog: Gerenciar Módulos ─────────────────────────────────────────────────

function GerenciarModulosDialog({
  group,
  setGroupModules,
  settingGroupModules,
}: {
  group: Group
  setGroupModules: (args: { groupId: string; moduleIds: string[] }) => Promise<unknown>
  settingGroupModules: boolean
}) {
  const [open, setOpen] = useState(false)
  const { modules, fetchingModules } = useModulesAdmin()
  const { groupModules, fetchingGroupModules } = useGroupModules(open ? group.id : null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!open) {
      setInitialized(false)
      return
    }
    if (groupModules && !initialized) {
      setSelected(new Set(groupModules.map((m) => m.id)))
      setInitialized(true)
    }
  }, [open, groupModules, initialized])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const formId = `grupo-modulos-form-${group.id}`

  async function handleSave() {
    await setGroupModules({ groupId: group.id, moduleIds: Array.from(selected) })
    setOpen(false)
  }

  const loading = fetchingModules || fetchingGroupModules

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="flex w-full flex-row items-center justify-start gap-4"
          >
            <LayoutDashboard />
            Gerenciar Módulos
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Módulos — {group.name}</DialogTitle>
          <DialogDescription>
            Selecione quais módulos este grupo pode acessar.
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault()
            void handleSave()
          }}
        />
        <div className="flex flex-col gap-2 py-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))
          ) : (
            (modules ?? []).map((mod) => (
              <label
                key={mod.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <Checkbox
                  checked={selected.has(mod.id)}
                  onCheckedChange={() => toggle(mod.id)}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{mod.name}</span>
                  {mod.description && (
                    <span className="text-xs text-muted-foreground">{mod.description}</span>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <LoadingButton
            form={formId}
            label="Salvar"
            loading={settingGroupModules}
            disabled={settingGroupModules}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Dialog: Gerenciar Usuários ────────────────────────────────────────────────

function GerenciarUsuariosDialog({
  group,
  setGroupUsers,
  settingGroupUsers,
}: {
  group: Group
  setGroupUsers: (args: { groupId: string; userIds: string[] }) => Promise<unknown>
  settingGroupUsers: boolean
}) {
  const [open, setOpen] = useState(false)
  const { groupUsers, fetchingGroupUsers } = useGroupUsers(open ? group.id : null)

  const { data: allUsersData, isPending: fetchingAllUsers } = useQuery({
    queryKey: ["all-users-for-groups"],
    queryFn: () =>
      authClient.admin.listUsers({ query: { limit: 1000 } }).then((r) => {
        if (r.error) throw new Error(r.error.message ?? "Erro ao buscar usuários")
        return r.data?.users ?? []
      }),
    enabled: open,
    staleTime: 60_000,
  })

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!open) {
      setInitialized(false)
      setSearch("")
      return
    }
    if (groupUsers && !initialized) {
      setSelected(new Set(groupUsers.map((u) => u.id)))
      setInitialized(true)
    }
  }, [open, groupUsers, initialized])

  const formId = `grupo-usuarios-form-${group.id}`

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    await setGroupUsers({ groupId: group.id, userIds: Array.from(selected) })
    setOpen(false)
  }

  const loading = fetchingGroupUsers || fetchingAllUsers

  const filteredUsers = (allUsersData ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="flex w-full flex-row items-center justify-start gap-4"
          >
            <Users />
            Gerenciar Usuários
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Usuários — {group.name}</DialogTitle>
          <DialogDescription>
            Selecione quais usuários pertencem a este grupo.
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault()
            void handleSave()
          }}
        />
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Buscar por nome ou e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto py-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))
          ) : filteredUsers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <Checkbox
                  checked={selected.has(user.id)}
                  onCheckedChange={() => toggle(user.id)}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <LoadingButton
            form={formId}
            label="Salvar"
            loading={settingGroupUsers}
            disabled={settingGroupUsers}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Cell de ações ─────────────────────────────────────────────────────────────

function ActionsCell({ group, table }: { group: Group; table: ReturnType<typeof useReactTable<Group>> }) {
  const {
    updateGroup,
    updatingGroup,
    removeGroup,
    removingGroup,
    setGroupModules,
    settingGroupModules,
    setGroupUsers,
    settingGroupUsers,
  } = table.options.meta!

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
          <GrupoEditButton
            defaultValues={{ name: group.name, description: group.description ?? "" }}
            onSubmit={(data) => updateGroup({ id: group.id, data })}
            loading={updatingGroup}
          />
          <GerenciarModulosDialog
            group={group}
            setGroupModules={setGroupModules}
            settingGroupModules={settingGroupModules}
          />
          <GerenciarUsuariosDialog
            group={group}
            setGroupUsers={setGroupUsers}
            settingGroupUsers={settingGroupUsers}
          />
          <DropdownMenuSeparator />
          <DeleteAlert
            variant="destructive-outline"
            disabled={removingGroup}
            onAccept={() => removeGroup(group.id)}
            label="Excluir grupo"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ── Colunas ───────────────────────────────────────────────────────────────────

const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    size: 200,
  },
  {
    accessorKey: "description",
    enableSorting: false,
    header: "Descrição",
    cell: ({ row }) => row.original.description ?? <span className="text-muted-foreground/40">—</span>,
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
    header: "Criado em",
    size: 120,
  },
  {
    cell: ({ row, table }) => <ActionsCell group={row.original} table={table} />,
    enableSorting: false,
    header: "",
    id: "actions",
    size: 60,
  },
]

// ── Tabela ────────────────────────────────────────────────────────────────────

export function GruposTable({
  groups,
  updateGroup,
  updatingGroup,
  removeGroup,
  removingGroup,
  setGroupModules,
  settingGroupModules,
  setGroupUsers,
  settingGroupUsers,
}: {
  groups: Group[] | undefined
  updateGroup: (args: { id: string; data: GroupType }) => Promise<unknown>
  updatingGroup: boolean
  removeGroup: (id: string) => Promise<unknown>
  removingGroup: boolean
  setGroupModules: (args: { groupId: string; moduleIds: string[] }) => Promise<unknown>
  settingGroupModules: boolean
  setGroupUsers: (args: { groupId: string; userIds: string[] }) => Promise<unknown>
  settingGroupUsers: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([{ desc: false, id: "name" }])

  const table = useReactTable({
    columns,
    data: groups ?? [],
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateGroup,
      updatingGroup,
      removeGroup,
      removingGroup,
      setGroupModules,
      settingGroupModules,
      setGroupUsers,
      settingGroupUsers,
    },
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
                Nenhum grupo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardFrame>
  )
}
