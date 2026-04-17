import type { User } from "@/auth"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { UsersTable } from "@/components/pages/administracao/user/users-table"
import { DefaultHeader } from "@/components/ui/header-component"
import { useAdmin } from "@/hooks/use-admin"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { UserIcon } from "lucide-react"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/usuarios"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const loggedUser = useRouter().options.context.auth.user

  const { fetchingUsers, totalUsers, users } = useAdmin()

  const loading = fetchingUsers

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        icon={UserIcon}
        title="Usuários cadastrados no sistema"
        description="Gerencie contas, permissões e acesso ao sistema."
      />
      <span className="text-xs text-muted-foreground">
        Total de usuários cadastrados: {totalUsers}
      </span>
      <UsersTable users={users} loggedUser={loggedUser as User} />
    </div>
  )
}
