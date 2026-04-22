import type { User } from "@/auth"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { UsersTable } from "@/components/pages/administracao/user/users-table"
import { UsersToolsBar } from "@/components/pages/administracao/user/users-tools-bar"
import { DefaultHeader } from "@/components/ui/header-component"
import { useAdmin } from "@/hooks/use-admin"
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router"
import { z } from "zod"

const usuariosSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
})

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/usuarios"
)({
  validateSearch: (search) => usuariosSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const loggedUser = useRouter().options.context.auth.user
  const { search } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const {
    fetchingUsers,
    totalUsers,
    users,
    createUser,
    addingUser,
    deletingUser,
    deleteUser,
    banUser,
    banningUser,
    unbanUser,
    unbanningUser,
  } = useAdmin({ search })

  const loading = fetchingUsers || addingUser || deletingUser || banningUser || unbanningUser

  const handleSearch = (value: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined }),
    })
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Usuários cadastrados no sistema"
        description="Gerencie contas, permissões e acesso ao sistema."
      />
      <UsersToolsBar createUser={createUser} onSearch={handleSearch} />
      {loading ? (
        <LoadingComponent />
      ) : (
        <UsersTable
          totalUsers={totalUsers || 0}
          users={users}
          loggedUser={loggedUser as User}
          deleteUser={deleteUser}
          banUser={banUser}
          unbanUser={unbanUser}
          banningUser={banningUser}
          unbanningUser={unbanningUser}
        />
      )}
    </div>
  )
}
