import {
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Area, Sector } from "@/hooks/use-sectors"
import type { CatalogType } from "@/lib/validations"
import { Badge } from "@/components/ui/badge"
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
import { AreaCreateButton, AreaEditButton } from "./area-form"
import { SectorEditButton } from "./sector-form"

declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    updateSector: (args: { id: string; data: CatalogType }) => Promise<unknown>
    updatingSector: boolean
    toggleSector: (id: string) => Promise<unknown>
    togglingSector: boolean
    removeSector: (id: string) => Promise<unknown>
    removingSector: boolean
    createArea: (args: { sectorId: string; data: CatalogType }) => Promise<unknown>
    creatingArea: boolean
    updateArea: (args: { sectorId: string; id: string; data: CatalogType }) => Promise<unknown>
    updatingArea: boolean
    toggleArea: (args: { sectorId: string; id: string }) => Promise<unknown>
    togglingArea: boolean
    removeArea: (args: { sectorId: string; id: string }) => Promise<unknown>
    removingArea: boolean
  }
}

// ── Sub-tabela de áreas ───────────────────────────────────────────────────────

function AreasSubTable({
  sector,
  createArea,
  creatingArea,
  updateArea,
  updatingArea,
  toggleArea,
  togglingArea,
  removeArea,
  removingArea,
}: {
  sector: Sector
  createArea: (args: { sectorId: string; data: CatalogType }) => Promise<unknown>
  creatingArea: boolean
  updateArea: (args: { sectorId: string; id: string; data: CatalogType }) => Promise<unknown>
  updatingArea: boolean
  toggleArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  togglingArea: boolean
  removeArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  removingArea: boolean
}) {
  return (
    <div className="bg-muted/30 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Áreas de <strong className="text-foreground">{sector.name}</strong>{" "}
          <span className="ml-1 tabular-nums">({sector.areas.length})</span>
        </p>
        <AreaCreateButton
          sectorName={sector.name}
          onSubmit={(data) => createArea({ sectorId: sector.id, data })}
          loading={creatingArea}
        />
      </div>

      {sector.areas.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhuma área cadastrada neste setor.
        </p>
      ) : (
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead style={{ width: "200px" }}>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead style={{ width: "100px" }}>Status</TableHead>
                <TableHead style={{ width: "60px" }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sector.areas.map((area: Area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {area.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          area.isActive ? "bg-emerald-500" : "bg-red-500"
                        )}
                      />
                      {area.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <AreaEditButton
                        defaultValues={{
                          name: area.name,
                          description: area.description ?? "",
                        }}
                        onSubmit={(data) =>
                          updateArea({ sectorId: sector.id, id: area.id, data })
                        }
                        loading={updatingArea}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={togglingArea}
                        onClick={() => toggleArea({ sectorId: sector.id, id: area.id })}
                        title={area.isActive ? "Desativar" : "Ativar"}
                      >
                        <span className="sr-only">{area.isActive ? "Desativar" : "Ativar"}</span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-2 rounded-full",
                            area.isActive ? "bg-emerald-500" : "bg-red-500"
                          )}
                        />
                      </Button>
                      <DeleteAlert
                        variant="ghost"
                        disabled={removingArea}
                        onAccept={() => removeArea({ sectorId: sector.id, id: area.id })}
                        label="Excluir área"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ── Tabela principal de setores ───────────────────────────────────────────────

const columns: ColumnDef<Sector>[] = [
  {
    id: "expander",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? "Recolher áreas" : "Expandir áreas"}
      >
        {row.getIsExpanded() ? (
          <ChevronDownIcon className="size-4" />
        ) : (
          <ChevronRightIcon className="size-4" />
        )}
      </Button>
    ),
    enableSorting: false,
    header: "",
    size: 48,
  },
  {
    accessorKey: "name",
    header: "Nome",
    size: 200,
  },
  {
    accessorKey: "description",
    cell: ({ row }) => row.original.description ?? "—",
    enableSorting: false,
    header: "Descrição",
    size: 240,
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
    id: "areasCount",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.areas.length} áreas</Badge>
    ),
    enableSorting: false,
    header: "Áreas",
    size: 90,
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
      const {
        updateSector, updatingSector, toggleSector, togglingSector, removeSector, removingSector,
      } = table.options.meta!
      const sector = row.original
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
              <SectorEditButton
                defaultValues={{
                  name: sector.name,
                  description: sector.description ?? "",
                }}
                onSubmit={(data) => updateSector({ id: sector.id, data })}
                loading={updatingSector}
              />
              <Button
                variant="ghost"
                className="flex w-full flex-row items-center justify-start gap-4"
                disabled={togglingSector}
                onClick={() => toggleSector(sector.id)}
              >
                {sector.isActive ? "Desativar" : "Ativar"}
              </Button>
              <DropdownMenuSeparator />
              <DeleteAlert
                variant="destructive-outline"
                disabled={removingSector}
                onAccept={() => removeSector(sector.id)}
                label="Excluir setor"
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

export function SectorsTable({
  sectors,
  updateSector,
  updatingSector,
  toggleSector,
  togglingSector,
  removeSector,
  removingSector,
  createArea,
  creatingArea,
  updateArea,
  updatingArea,
  toggleArea,
  togglingArea,
  removeArea,
  removingArea,
}: {
  sectors: Sector[] | undefined
  updateSector: (args: { id: string; data: CatalogType }) => Promise<unknown>
  updatingSector: boolean
  toggleSector: (id: string) => Promise<unknown>
  togglingSector: boolean
  removeSector: (id: string) => Promise<unknown>
  removingSector: boolean
  createArea: (args: { sectorId: string; data: CatalogType }) => Promise<unknown>
  creatingArea: boolean
  updateArea: (args: { sectorId: string; id: string; data: CatalogType }) => Promise<unknown>
  updatingArea: boolean
  toggleArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  togglingArea: boolean
  removeArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  removingArea: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([{ desc: false, id: "name" }])
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useReactTable({
    columns,
    data: sectors ?? [],
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateSector, updatingSector, toggleSector, togglingSector, removeSector, removingSector,
      createArea, creatingArea, updateArea, updatingArea, toggleArea, togglingArea, removeArea, removingArea,
    },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    state: { sorting, expanded },
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
              <>
                <TableRow key={row.id} data-state={row.getIsExpanded() ? "expanded" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow key={`${row.id}-expanded`} className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="p-0">
                      <AreasSubTable
                        sector={row.original}
                        createArea={createArea}
                        creatingArea={creatingArea}
                        updateArea={updateArea}
                        updatingArea={updatingArea}
                        toggleArea={toggleArea}
                        togglingArea={togglingArea}
                        removeArea={removeArea}
                        removingArea={removingArea}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                Nenhum setor encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardFrame>
  )
}
