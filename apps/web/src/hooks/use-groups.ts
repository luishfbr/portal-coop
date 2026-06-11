import { api } from "@/lib/axios-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type Group = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type GroupPermission = {
  id: string
  slug: string
  name: string
  description: string | null
  moduleSlug: string
  createdAt: string
  updatedAt: string
}

export type GroupUser = {
  id: string
  name: string
  email: string
}

export function useGroupPermissions(groupId: string | null) {
  const { data: groupPermissions, isPending: fetchingGroupPermissions } = useQuery({
    queryKey: ["groups", groupId, "permissions"],
    queryFn: () =>
      api.get<GroupPermission[]>(`/groups/${groupId}/permissions`).then((r) => r.data),
    enabled: !!groupId,
  })
  return { groupPermissions, fetchingGroupPermissions }
}

export function useGroupUsers(groupId: string | null) {
  const { data: groupUsers, isPending: fetchingGroupUsers } = useQuery({
    queryKey: ["groups", groupId, "users"],
    queryFn: () =>
      api.get<GroupUser[]>(`/groups/${groupId}/users`).then((r) => r.data),
    enabled: !!groupId,
  })
  return { groupUsers, fetchingGroupUsers }
}

export function useGroups() {
  const queryClient = useQueryClient()

  const { data: groups, isPending: fetchingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: () => api.get<Group[]>("/groups").then((r) => r.data),
  })

  const { mutateAsync: setGroupUsers, isPending: settingGroupUsers } = useMutation({
    mutationFn: ({ groupId, userIds }: { groupId: string; userIds: string[] }) =>
      api.put(`/groups/${groupId}/users`, { userIds }).then((r) => r.data),
    onSuccess: (_, { groupId }) => {
      toast.success("Usuários do grupo atualizados!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "users"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    groups,
    fetchingGroups,
    setGroupUsers,
    settingGroupUsers,
  }
}
