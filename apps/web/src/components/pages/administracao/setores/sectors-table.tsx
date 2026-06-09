import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CornerDownRightIcon,
  Layers2Icon,
  MoreHorizontalIcon,
} from "lucide-react"
import { Fragment, useState } from "react"
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
import { AreaEditButton } from "./area-form"
import { SectorEditButton } from "./sector-form"

declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    updateSector: (args: { id: string; data: CatalogType }) => Promise<unknown>
    updatingSector: boolean
    toggleSector: (id: string) => Promise<unknown>
    togglingSector: boolean
    removeSector: (id: string) => Promise<unknown>
    removingSector: boolean
    updateArea: (args: { sectorId: string; id: string; data: CatalogType }) => Promise<unknown>
    updatingArea: boolean
    toggleArea: (args: { sectorId: string; id: string }) => Promise<unknown>
    togglingArea: boolean
    removeArea: (args: { sectorId: string; id: string }) => Promise<unknown>
    removingArea: boolean
  }
}

// ── Painel de áreas (sempre visível, dentro de colSpan) ───────────────────────

function AreasPanel({
  sector,
  updateArea,
  updatingArea,
  toggleArea,
  togglingArea,
  removeArea,
  removingArea,
}: {
  sector: Sector
  updateArea: (args: { sectorId: string; id: string; data: CatalogType }) => Promise<unknown>
  updatingArea: boolean
  toggleArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  togglingArea: boolean
  removeArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  removingArea: boolean
}) {
  return (
    <div className="mx-3 mb-2.5 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
      {sector.areas.length === 0 ? (
        <p className="px-4 py-2.5 text-xs italic text-muted-foreground/60">
          Nenhuma área cadastrada neste setor.
        </p>
      ) : (
        <div className="divide-y divide-border/40">
          {sector.areas.map((area: Area) => (
            <div
              key={area.id}
              className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent/40"
            >
              <CornerDownRightIcon
                aria-hidden="true"
                className="ml-1 size-3.5 shrink-0 text-muted-foreground/40"
              />

              <span className="w-44 shrink-0 truncate text-sm font-medium">
                {area.name}
              </span>

              <span className="flex-1 truncate text-sm text-muted-foreground">
                {area.description ?? (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </span>

              <Badge variant="outline" className="shrink-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full",
                    area.isActive ? "bg-emerald-500" : "bg-red-500"
                  )}
                />
                {area.isActive ? "Ativa" : "Inativa"}
              </Badge>

              <div className="flex shrink-0 items-center gap-0.5">
                <AreaEditButton
                  defaultValues={{ name: area.name, description: area.description ?? "" }}
                  onSubmit={(data) => updateArea({ sectorId: sector.id, id: area.id, data })}
                  loading={updatingArea}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={togglingArea}
                  onClick={() => toggleArea({ sectorId: sector.id, id: area.id })}
                  title={area.isActive ? "Desativar área" : "Ativar área"}
                >
                  <span className="sr-only">
                    {area.isActive ? "Desativar área" : "Ativar área"}
                  </span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Colunas da tabela de setores ──────────────────────────────────────────────

const COLUMNS_COUNT = 5

const columns: ColumnDef<Sector>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    size: 220,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Layers2Icon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground/50"
        />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    cell: ({ row }) => row.original.description ?? "—",
    enableSorting: false,
    header: "Descrição",
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
      const {
        updateSector,
        updatingSector,
        toggleSector,
        togglingSector,
        removeSector,
        removingSector,
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

// ── Tabela principal ──────────────────────────────────────────────────────────

export function SectorsTable({
  sectors,
  updateSector,
  updatingSector,
  toggleSector,
  togglingSector,
  removeSector,
  removingSector,
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
  updateArea: (args: { sectorId: string; id: string; data: CatalogType }) => Promise<unknown>
  updatingArea: boolean
  toggleArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  togglingArea: boolean
  removeArea: (args: { sectorId: string; id: string }) => Promise<unknown>
  removingArea: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([{ desc: false, id: "name" }])

  const table = useReactTable({
    columns,
    data: sectors ?? [],
    getRowId: (row) => row.id,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateSector,
      updatingSector,
      toggleSector,
      togglingSector,
      removeSector,
      removingSector,
      updateArea,
      updatingArea,
      toggleArea,
      togglingArea,
      removeArea,
      removingArea,
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
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
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
              <Fragment key={row.id}>
                {/* Linha do setor */}
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Painel de áreas (sempre visível) */}
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMNS_COUNT}
                    className="p-0 bg-transparent!"
                  >
                    <AreasPanel
                      sector={row.original}
                      updateArea={updateArea}
                      updatingArea={updatingArea}
                      toggleArea={toggleArea}
                      togglingArea={togglingArea}
                      removeArea={removeArea}
                      removingArea={removingArea}
                    />
                  </TableCell>
                </TableRow>
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={COLUMNS_COUNT}>
                Nenhum setor encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardFrame>
  )
}
