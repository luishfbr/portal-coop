import { authClient } from "@/lib/auth-client"
import type { AddUser } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useAdmin({
  search,
  userId,
  page = 1,
}: { search?: string; userId?: string; page?: number } = {}) {
  const queryClient = useQueryClient()
  const limit = 10

  const { data: usersData, isPending: fetchingUsers } = useQuery({
    queryKey: ["data-users", search, page],
    queryFn: async () => {
      return await authClient.admin.listUsers({
        query: {
          limit,
          offset: (page - 1) * limit,
          sortBy: "name",
          sortDirection: "asc",
          ...(search && {
            searchField: "name",
            searchOperator: "contains",
            searchValue: search,
          }),
        },
      })
    },
  })

  const { data: sessionsData, isPending: fetchingSessions } = useQuery({
    queryKey: ["user-sessions", userId],
    enabled: !!userId,
    queryFn: async () => {
      return await authClient.admin.listUserSessions({
        userId: userId!,
      })
    },
  })

  const { mutateAsync: createUser, isPending: addingUser } = useMutation({
    mutationFn: async (data: AddUser) => {
      return await authClient.admin.createUser(
        { ...data },
        {
          onError(context) {
            toast.error(context.error.message)
          },
        }
      )
    },
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["data-users"] })
    },
  })

  const { mutateAsync: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.removeUser(
        { userId },
        {
          onError(context) {
            toast.error(context.error.message)
          },
        }
      )
    },
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["data-users"] })
    },
  })

  const { mutateAsync: banUser, isPending: banningUser } = useMutation({
    mutationFn: async (data: {
      userId: string
      banReason: string | undefined
      banExpiresIn: number | undefined
    }) => {
      return await authClient.admin.banUser(
        { ...data },
        {
          onError(context) {
            toast.error(context.error.message)
          },
        }
      )
    },
    onSuccess: (_, variables) => {
      toast.success("Situação do usuário atualizada!")
      queryClient.invalidateQueries({ queryKey: ["data-users"] })
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] })
    },
  })

  const { mutateAsync: unbanUser, isPending: unbanningUser } = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.unbanUser(
        { userId },
        {
          onError(context) {
            toast.error(context.error.message)
          },
        }
      )
    },
    onSuccess: (_, userId) => {
      toast.success("Usuário reativado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["data-users"] })
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
    },
  })

  const { mutateAsync: updateUser, isPending: updatingUser } = useMutation({
    mutationFn: async (data: {
      userId: string
      data: { name?: string; email?: string; role?: string }
    }) => {
      return await authClient.admin.updateUser(
        { userId: data.userId, data: data.data },
        {
          onError(context) {
            toast.error(context.error.message)
          },
        }
      )
    },
    onSuccess: (_, variables) => {
      toast.success("Usuário atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["data-users"] })
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] })
    },
  })

  const { mutateAsync: setUserPassword, isPending: settingPassword } =
    useMutation({
      mutationFn: async (data: { userId: string; newPassword: string }) => {
        return await authClient.admin.setUserPassword(
          { userId: data.userId, newPassword: data.newPassword },
          {
            onError(context) {
              toast.error(context.error.message)
            },
          }
        )
      },
      onSuccess: () => {
        toast.success("Senha atualizada com sucesso!")
      },
    })

  const { mutateAsync: revokeUserSession, isPending: revokingSession } =
    useMutation({
      mutationFn: async (data: { sessionToken: string; userId: string }) => {
        return await authClient.admin.revokeUserSession(
          { sessionToken: data.sessionToken },
          {
            onError(context) {
              toast.error(context.error.message)
            },
          }
        )
      },
      onSuccess: (_, variables) => {
        toast.success("Sessão revogada!")
        queryClient.invalidateQueries({
          queryKey: ["user-sessions", variables.userId],
        })
      },
    })

  const { mutateAsync: revokeUserSessions, isPending: revokingAllSessions } =
    useMutation({
      mutationFn: async (targetUserId: string) => {
        return await authClient.admin.revokeUserSessions(
          { userId: targetUserId },
          {
            onError(context) {
              toast.error(context.error.message)
            },
          }
        )
      },
      onSuccess: (_, targetUserId) => {
        toast.success("Todas as sessões revogadas!")
        queryClient.invalidateQueries({
          queryKey: ["user-sessions", targetUserId],
        })
      },
    })

  const users = usersData?.data?.users
  const totalUsers = usersData?.data?.total
  const userSessions = sessionsData?.data?.sessions

  return {
    users,
    totalUsers,
    userSessions,

    createUser,
    deleteUser,
    banUser,
    unbanUser,
    updateUser,
    setUserPassword,
    revokeUserSession,
    revokeUserSessions,

    fetchingUsers,
    fetchingSessions,
    addingUser,
    deletingUser,
    banningUser,
    unbanningUser,
    updatingUser,
    settingPassword,
    revokingSession,
    revokingAllSessions,
  }
}
