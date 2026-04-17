import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"

export function useAdmin() {
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

  const users = usersData?.data?.users
  const totalUsers = usersData?.data?.total

  return {
    users,

    totalUsers,

    fetchingUsers,
  }
}
