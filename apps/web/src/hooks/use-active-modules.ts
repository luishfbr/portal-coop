import { api } from "@/lib/axios-client"
import { useQuery } from "@tanstack/react-query"
import type { ModuleItem } from "./use-modules-admin"

export function useActiveModules() {
  const { data, isPending } = useQuery({
    queryKey: ["modules", "active"],
    queryFn: () =>
      api.get<ModuleItem[]>("/modules/active").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return {
    activeSlugs: data?.map((m) => m.slug) ?? null,
    isPending,
  }
}
