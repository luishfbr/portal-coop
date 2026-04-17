import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { Button } from "@/components/ui/button"
import { DefaultHeader } from "@/components/ui/header-component"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, PencilIcon } from "lucide-react"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/administracao/_pathlessLayout/usuario/$userId"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()

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
        icon={PencilIcon}
        title={`Painel de edição do usuário: ${user.name}`}
        description="Gerencie contas, permissões e acesso ao sistema."
      />
    </div>
  )
}
