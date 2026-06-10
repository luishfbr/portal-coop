import { api } from "@/lib/axios-client"
import type { CatalogType } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type Area = {
  id: string
  sectorId: string
  name: string
  description: string | null
  isActive: boolean
  userCount: number
  createdAt: string
  updatedAt: string
}

export type Sector = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  userCount: number
  createdAt: string
  updatedAt: string
  areas: Area[]
}

export type SectorUser = {
  id: string
  name: string
  email: string
}

export function useSectorUsers(id: string | null) {
  const { data: users, isPending: fetchingUsers } = useQuery({
    queryKey: ["sectors", id, "users"],
    queryFn: () =>
      api.get<SectorUser[]>(`/sectors/${id}/users`).then((r) => r.data),
    enabled: !!id,
    staleTime: 60_000,
  })
  return { users, fetchingUsers }
}

export function useAreaUsers(sectorId: string | null, areaId: string | null) {
  const { data: users, isPending: fetchingUsers } = useQuery({
    queryKey: ["sectors", sectorId, "areas", areaId, "users"],
    queryFn: () =>
      api
        .get<SectorUser[]>(`/sectors/${sectorId}/areas/${areaId}/users`)
        .then((r) => r.data),
    enabled: !!sectorId && !!areaId,
    staleTime: 60_000,
  })
  return { users, fetchingUsers }
}

export function useSectors() {
  const queryClient = useQueryClient()

  const { data: sectors, isPending: fetchingSectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: () => api.get<Sector[]>("/sectors").then((r) => r.data),
    staleTime: 60_000,
  })

  // ── Setores ──────────────────────────────────────────────────────────────

  const { mutateAsync: createSector, isPending: creatingSector } = useMutation({
    mutationFn: (data: CatalogType) =>
      api.post("/sectors", data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Setor criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateSector, isPending: updatingSector } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CatalogType }) =>
      api.patch(`/sectors/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Setor atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleSector, isPending: togglingSector } = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/sectors/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Status do setor atualizado!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeSector, isPending: removingSector } = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/sectors/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Setor removido com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  // ── Áreas ────────────────────────────────────────────────────────────────

  const { mutateAsync: createArea, isPending: creatingArea } = useMutation({
    mutationFn: ({ sectorId, data }: { sectorId: string; data: CatalogType }) =>
      api.post(`/sectors/${sectorId}/areas`, data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Área criada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateArea, isPending: updatingArea } = useMutation({
    mutationFn: ({
      sectorId,
      id,
      data,
    }: {
      sectorId: string
      id: string
      data: CatalogType
    }) =>
      api.patch(`/sectors/${sectorId}/areas/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Área atualizada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleArea, isPending: togglingArea } = useMutation({
    mutationFn: ({ sectorId, id }: { sectorId: string; id: string }) =>
      api
        .patch(`/sectors/${sectorId}/areas/${id}/toggle`)
        .then((r) => r.data),
    onSuccess: () => {
      toast.success("Status da área atualizado!")
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeArea, isPending: removingArea } = useMutation({
    mutationFn: ({ sectorId, id }: { sectorId: string; id: string }) =>
      api.delete(`/sectors/${sectorId}/areas/${id}`).then((r) => r.data),
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
