import type { CatalogType } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type JobFunction = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const BASE = "http://localhost:8080/api/v1/job-functions"

export function useJobFunctions() {
  const queryClient = useQueryClient()

  const { data: jobFunctions, isPending: fetchingJobFunctions } = useQuery({
    queryKey: ["job-functions"],
    queryFn: async () => {
      const res = await fetch(BASE, { credentials: "include" })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<JobFunction[]>
    },
  })

  const { mutateAsync: createJobFunction, isPending: creatingJobFunction } = useMutation({
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
      toast.success("Função criada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["job-functions"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateJobFunction, isPending: updatingJobFunction } = useMutation({
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
      toast.success("Função atualizada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["job-functions"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: toggleJobFunction, isPending: togglingJobFunction } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Status da função atualizado!")
      queryClient.invalidateQueries({ queryKey: ["job-functions"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeJobFunction, isPending: removingJobFunction } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Função removida com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["job-functions"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    jobFunctions,
    fetchingJobFunctions,
    createJobFunction,
    creatingJobFunction,
    updateJobFunction,
    updatingJobFunction,
    toggleJobFunction,
    togglingJobFunction,
    removeJobFunction,
    removingJobFunction,
  }
}
