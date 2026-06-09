import type { CatalogType } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type Area = {
  id: string
  sectorId: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Sector = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  areas: Area[]
}

const BASE = "http://localhost:8080/api/v1/sectors"

export function useSectors() {
  const queryClient = useQueryClient()

  const { data: sectors, isPending: fetchingSectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const res = await fetch(BASE, { credentials: "include" })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<Sector[]>
    },
  })

  // ── Setores ──────────────────────────────────────────────────────────────

  const { mutateAsync: createSector, isPending: creatingSector } = useMutation({
    mutationFn: async (data: CatalogType) => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Setor criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateSector, isPending: updatingSector } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CatalogType }) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Setor atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleSector, isPending: togglingSector } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Status do setor atualizado!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeSector, isPending: removingSector } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Setor removido com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  // ── Áreas ────────────────────────────────────────────────────────────────

  const { mutateAsync: createArea, isPending: creatingArea } = useMutation({
    mutationFn: async ({ sectorId, data }: { sectorId: string; data: CatalogType }) => {
      const res = await fetch(`${BASE}/${sectorId}/areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Área criada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateArea, isPending: updatingArea } = useMutation({
    mutationFn: async ({
      sectorId,
      id,
      data,
    }: { sectorId: string; id: string; data: CatalogType }) => {
      const res = await fetch(`${BASE}/${sectorId}/areas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Área atualizada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleArea, isPending: togglingArea } = useMutation({
    mutationFn: async ({ sectorId, id }: { sectorId: string; id: string }) => {
      const res = await fetch(`${BASE}/${sectorId}/areas/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Status da área atualizado!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeArea, isPending: removingArea } = useMutation({
    mutationFn: async ({ sectorId, id }: { sectorId: string; id: string }) => {
      const res = await fetch(`${BASE}/${sectorId}/areas/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Área removida com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    sectors,
    fetchingSectors,
    createSector,
    creatingSector,
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
  }
}
