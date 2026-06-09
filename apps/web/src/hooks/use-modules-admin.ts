import { api } from "@/lib/axios-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type ModuleItem = {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useModulesAdmin() {
  const queryClient = useQueryClient()

  const { data: modules, isPending: fetchingModules } = useQuery({
    queryKey: ["modules-admin"],
    queryFn: () => api.get<ModuleItem[]>("/modules").then((r) => r.data),
  })

  const { mutateAsync: toggleModule, isPending: togglingModule } = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/modules/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Status do módulo atualizado!")
      queryClient.invalidateQueries({ queryKey: ["modules-admin"] })
      queryClient.invalidateQueries({ queryKey: ["modules", "active"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    modules,
    fetchingModules,
    toggleModule,
    togglingModule,
  }
}
