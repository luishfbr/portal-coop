import { api } from "@/lib/axios-client"
import { useQuery } from "@tanstack/react-query"

export type ModuleItem = {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  createdAt: string
  updatedAt: string
}

export function useModulesAdmin() {
  const { data: modules, isPending: fetchingModules } = useQuery({
    queryKey: ["modules-admin"],
    queryFn: () => api.get<ModuleItem[]>("/modules").then((r) => r.data),
  })

  return {
    modules,
    fetchingModules,
  }
}
