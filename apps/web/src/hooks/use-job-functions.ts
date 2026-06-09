import { api } from "@/lib/axios-client"
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

export function useJobFunctions() {
  const queryClient = useQueryClient()

  const { data: jobFunctions, isPending: fetchingJobFunctions } = useQuery({
    queryKey: ["job-functions"],
    queryFn: () => api.get<JobFunction[]>("/job-functions").then((r) => r.data),
  })

  const { mutateAsync: createJobFunction, isPending: creatingJobFunction } =
    useMutation({
      mutationFn: (data: CatalogType) =>
        api.post("/job-functions", data).then((r) => r.data),
      onSuccess: () => {
        toast.success("Função criada com sucesso!")
        queryClient.invalidateQueries({ queryKey: ["job-functions"] })
      },
      onError: (err) => toast.error(err.message),
    })

  const { mutateAsync: updateJobFunction, isPending: updatingJobFunction } =
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: CatalogType }) =>
        api.patch(`/job-functions/${id}`, data).then((r) => r.data),
      onSuccess: () => {
        toast.success("Função atualizada com sucesso!")
        queryClient.invalidateQueries({ queryKey: ["job-functions"] })
      },
      onError: (err) => toast.error(err.message),
    })

  const { mutateAsync: toggleJobFunction, isPending: togglingJobFunction } =
    useMutation({
      mutationFn: (id: string) =>
        api.patch(`/job-functions/${id}/toggle`).then((r) => r.data),
      onSuccess: () => {
        toast.success("Status da função atualizado!")
        queryClient.invalidateQueries({ queryKey: ["job-functions"] })
      },
      onError: (err) => toast.error(err.message),
    })

  const { mutateAsync: removeJobFunction, isPending: removingJobFunction } =
    useMutation({
      mutationFn: (id: string) =>
        api.delete(`/job-functions/${id}`).then((r) => r.data),
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
