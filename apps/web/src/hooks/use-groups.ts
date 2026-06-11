import { api } from "@/lib/axios-client"
import type { GroupType } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type Group = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type GroupModule = {
  id: string
  name: string
  slug: string
  icon: string
  description: string
}

export type GroupUser = {
  id: string
  name: string
  email: string
}

export function useGroupModules(groupId: string | null) {
  const { data: groupModules, isPending: fetchingGroupModules } = useQuery({
    queryKey: ["groups", groupId, "modules"],
    queryFn: () =>
      api.get<GroupModule[]>(`/groups/${groupId}/modules`).then((r) => r.data),
    enabled: !!groupId,
  })
  return { groupModules, fetchingGroupModules }
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

  const { mutateAsync: createGroup, isPending: creatingGroup } = useMutation({
    mutationFn: (data: GroupType) =>
      api.post("/groups", data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Grupo criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: updateGroup, isPending: updatingGroup } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GroupType }) =>
      api.patch(`/groups/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Grupo atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: removeGroup, isPending: removingGroup } = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/groups/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Grupo removido com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { mutateAsync: setGroupModules, isPending: settingGroupModules } = useMutation({
    mutationFn: ({ groupId, moduleIds }: { groupId: string; moduleIds: string[] }) =>
      api.put(`/groups/${groupId}/modules`, { moduleIds }).then((r) => r.data),
    onSuccess: (_, { groupId }) => {
      toast.success("Módulos do grupo atualizados!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "modules"] })
      queryClient.invalidateQueries({ queryKey: ["modules", "active"] })
    },
    onError: (err) => toast.error(err.message),
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
    createGroup,
    creatingGroup,
    updateGroup,
    updatingGroup,
    removeGroup,
    removingGroup,
    setGroupModules,
    settingGroupModules,
    setGroupUsers,
    settingGroupUsers,
  }
}
