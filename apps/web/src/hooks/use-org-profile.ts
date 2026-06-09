import { api } from "@/lib/axios-client"
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
    queryFn: () =>
      api
        .get<OrgProfile | null>(`/users/${userId}/org-profile`)
        .then((r) => r.data),
    enabled: !!userId,
  })

  const { mutateAsync: saveOrgProfile, isPending: savingProfile } = useMutation(
    {
      mutationFn: (data: OrgProfileType) =>
        api.put(`/users/${userId}/org-profile`, data).then((r) => r.data),
      onSuccess: () => {
        toast.success("Vínculo organizacional salvo com sucesso!")
        queryClient.invalidateQueries({ queryKey: ["org-profile", userId] })
      },
      onError: (err) => toast.error(err.message),
    }
  )

  return {
    orgProfile,
    fetchingProfile,
    saveOrgProfile,
    savingProfile,
  }
}
