import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { EditUser } from "@/components/pages/administracao/user/edit-user"
import { Button } from "@/components/ui/button"
import { DefaultHeader } from "@/components/ui/header-component"
import { useAdmin } from "@/hooks/use-admin"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/usuario/$userId"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const { updateUser, updatingUser } = useAdmin()

  const { data: userData, isPending } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      return await authClient.admin.getUser({
        query: {
          id: userId,
        },
      })
    },
  })

  if (isPending) {
    return <LoadingComponent />
  }

  const user = userData?.data

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col gap-2">
          <h1>Usuário não encontrado!</h1>
          <Button
            onClick={() => {
              navigate({
                to: "/administracao/usuarios",
              })
            }}
          >
            <ArrowLeft />
            Retornar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title={`Painel de Edição`}
        description={`Gerencie a conta, permissões e acesso de ${user.name} ao sistema.`}
      />
      <EditUser user={user} updateUser={updateUser} updatingUser={updatingUser} />
    </div>
  )
}
