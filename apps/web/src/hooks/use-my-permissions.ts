import { api } from "@/lib/axios-client"
import { useQuery } from "@tanstack/react-query"

export function useMyPermissions() {
  const { data, isPending } = useQuery({
    queryKey: ["modules", "my-permissions"],
    queryFn: () =>
      api.get<Record<string, string[]>>("/modules/my-permissions").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
  return { permissions: data ?? null, isPending }
}
