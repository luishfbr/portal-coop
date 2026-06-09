import { api } from "@/lib/axios-client"
import type { CatalogType } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type Agency = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useAgencies() {
  const queryClient = useQueryClient()

  const { data: agencies, isPending: fetchingAgencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: () => api.get<Agency[]>("/agencies").then((r) => r.data),
  })

  const { mutateAsync: createAgency, isPending: creatingAgency } = useMutation({
    mutationFn: (data: CatalogType) =>
      api.post("/agencies", data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Agência criada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateAgency, isPending: updatingAgency } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CatalogType }) =>
      api.patch(`/agencies/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Agência atualizada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleAgency, isPending: togglingAgency } = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/agencies/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Status da agência atualizado!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeAgency, isPending: removingAgency } = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/agencies/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Agência removida com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    agencies,
    fetchingAgencies,
    createAgency,
    creatingAgency,
    updateAgency,
    updatingAgency,
    toggleAgency,
    togglingAgency,
    removeAgency,
    removingAgency,
  }
}
