import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { LoadingButton } from "@/components/ui/loading-button"
import { loginSchema, type LoginType } from "@/lib/validations"
import { Rocket } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useNavigate } from "@tanstack/react-router"

export const LoginForm = () => {
  const navigate = useNavigate()
  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit({ email, password }: LoginType) {
    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: async (ctx) => {
          if (!ctx.data.twoFactorRedirect) {
            navigate({
              to: "/",
            })
          }
        },
      },
    })
  }

  return (
    <Card className="w-full max-w-100">
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <Rocket />
          <span>Acesse sua conta!</span>
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo com suas credenciais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    {...field}
                    placeholder="exemplo@dominio.com.br"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <Input id="password" {...field} type="password" />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation={"responsive"}>
          <LoadingButton
            disabled={form.formState.disabled}
            form="login-form"
            label="Entrar"
            loading={form.formState.isSubmitting}
          />
          <Button
            type="button"
            variant={"link"}
            onClick={() => {
              navigate({
                to: "/redefinicao-de-senha",
              })
            }}
          >
            Esqueci minha senha
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
