import { authClient } from "@/lib/auth-client"
import type { AddUser } from "@/lib/validations"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useAdmin() {
  const queryClient = useQueryClient()
  const limit = 12

  const { data: usersData, isPending: fetchingUsers } = useQuery({
    queryKey: ["data-users"],
    queryFn: async () => {
      return await authClient.admin.listUsers({
        query: {
          limit,
        },
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

  const users = usersData?.data?.users
  const totalUsers = usersData?.data?.total

  return {
    users,

    totalUsers,

    createUser,
    deleteUser,

    fetchingUsers,
    addingUser,
    deletingUser,
  }
}
