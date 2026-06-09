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

const BASE = "http://localhost:8080/api/v1/agencies"

export function useAgencies() {
  const queryClient = useQueryClient()

  const { data: agencies, isPending: fetchingAgencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const res = await fetch(BASE, { credentials: "include" })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<Agency[]>
    },
  })

  const { mutateAsync: createAgency, isPending: creatingAgency } = useMutation({
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
      toast.success("Agência criada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateAgency, isPending: updatingAgency } = useMutation({
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
      toast.success("Agência atualizada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleAgency, isPending: togglingAgency } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Status da agência atualizado!")
      queryClient.invalidateQueries({ queryKey: ["agencies"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeAgency, isPending: removingAgency } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
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
