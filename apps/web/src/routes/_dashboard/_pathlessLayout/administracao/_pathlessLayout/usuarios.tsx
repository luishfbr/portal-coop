import type { User } from "@/auth"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { UsersTable } from "@/components/pages/administracao/user/users-table"
import { UsersToolsBar } from "@/components/pages/administracao/user/users-tools-bar"
import { DefaultHeader } from "@/components/ui/header-component"
import { useAdmin } from "@/hooks/use-admin"
import { createFileRoute, useRouter } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/usuarios"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const loggedUser = useRouter().options.context.auth.user

  const {
    fetchingUsers,
    totalUsers,
    users,
    createUser,
    addingUser,
    deletingUser,
    deleteUser,
  } = useAdmin()

  const loading = fetchingUsers || addingUser || deletingUser

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Usuários cadastrados no sistema"
        description="Gerencie contas, permissões e acesso ao sistema."
      />
      <UsersToolsBar totalUsers={totalUsers ?? 0} createUser={createUser} />
      <UsersTable
        users={users}
        loggedUser={loggedUser as User}
        deleteUser={deleteUser}
      />
    </div>
  )
}
