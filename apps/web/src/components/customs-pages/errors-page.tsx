import { useNavigate } from "@tanstack/react-router"
import { Button } from "../ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card"
import { Field } from "../ui/field"
import { Separator } from "../ui/separator"

export const DefaultErrorPage = () => {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>Error inesperado</CardTitle>
          <CardDescription>Encontramos um erro inesperado.</CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter>
          <Field orientation={"responsive"}>
            <Button
              variant={"default"}
              onClick={() =>
                navigate({
                  to: "/",
                  reloadDocument: true,
                })
              }
            >
              Retornar à página inicial
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}

export const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>404 - Página não encontrada</CardTitle>
          <CardDescription>
            Infelizmente não encontramos a página com base na URL fornecida.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter>
          <Field orientation={"responsive"}>
            <Button
              variant={"default"}
              onClick={() =>
                navigate({
                  to: "/",
                  reloadDocument: true,
                })
              }
            >
              Retornar à página inicial
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}

export const UnauthorizedPage = () => {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>401 - Não autorizado</CardTitle>
          <CardDescription>
            Você não está autorizado a acessar essa página.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter>
          <Field orientation={"responsive"}>
            <Button
              variant={"default"}
              onClick={() =>
                navigate({
                  to: "/login",
                  reloadDocument: true,
                })
              }
            >
              Realizar login
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}

export const ForbiddenPage = () => {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>403 - Proibido</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar essa página.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter>
          <Field orientation={"responsive"}>
            <Button
              variant={"default"}
              onClick={() =>
                navigate({
                  to: "/",
                  reloadDocument: true,
                })
              }
            >
              Retornar à página inicial
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}

export const EnableTwoFactorPage = () => {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>403 - Habilite o 2FA</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar essa página. Necessário que
            habilite a autenticação de dois fatores.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter>
          <Field orientation={"responsive"}>
            <Button
              variant={"default"}
              onClick={() =>
                navigate({
                  to: "/habilitar-2fa",
                  reloadDocument: true,
                })
              }
            >
              Habilitar 2FA
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}
