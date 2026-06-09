import type { OrgProfileType } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type OrgProfile = {
  id: string
  userId: string
  agencyId: string | null
  sectorId: string | null
  areaId: string | null
  jobFunctionId: string | null
  createdAt: string
  updatedAt: string
}

export function useOrgProfile(userId: string) {
  const queryClient = useQueryClient()

  const { data: orgProfile, isPending: fetchingProfile } = useQuery({
    queryKey: ["org-profile", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:8080/api/v1/users/${userId}/org-profile`,
        { credentials: "include" }
      )
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<OrgProfile | null>
    },
  })

  const { mutateAsync: saveOrgProfile, isPending: savingProfile } = useMutation({
    mutationFn: async (data: OrgProfileType) => {
      const res = await fetch(
        `http://localhost:8080/api/v1/users/${userId}/org-profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Vínculo organizacional salvo com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["org-profile", userId] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    orgProfile,
    fetchingProfile,
    saveOrgProfile,
    savingProfile,
  }
}
