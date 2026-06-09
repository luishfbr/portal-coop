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
    queryFn: async () => {
      const res = await fetch("http://localhost:8080/api/v1/modules", {
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<ModuleItem[]>
    },
  })

  const { mutateAsync: toggleModule, isPending: togglingModule } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:8080/api/v1/modules/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Status do módulo atualizado!")
      queryClient.invalidateQueries({ queryKey: ["modules-admin"] })
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
