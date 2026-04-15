import { UnauthorizedPage } from "@/components/customs-pages/errors-page"
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
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { authClient } from "@/lib/auth-client"
import { password } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { ShieldAlert } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const enableSchema = z.object({
  password,
})

type Enable = z.infer<typeof enableSchema>

export const EnableTwoFactor = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const user = router.options.context.auth.user

  if (!user) {
    return <UnauthorizedPage />
  }

  const form = useForm<Enable>({
    resolver: zodResolver(enableSchema),
    defaultValues: {
      password: "",
    },
  })

  async function onSubmit({ password }: Enable) {
    await authClient.twoFactor.enable({
      password,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: () => {
          navigate({
            to: "/",
          })
        },
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <ShieldAlert />
          <span>Habilitar autenticação 2FA</span>
        </CardTitle>
        <CardDescription>
          Configuração obrigatória...Siga os passos abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="enable-two-factor-form"
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="pass">Senha</FieldLabel>
                  <Input
                    id="pass"
                    {...field}
                    type="password"
                    placeholder="Digite sua senha"
                  />
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
        <Field>
          <LoadingButton
            disabled={form.formState.disabled}
            form="enable-two-factor-form"
            label="Habilitar"
            loading={form.formState.isSubmitting}
          />
        </Field>
      </CardFooter>
    </Card>
  )
}
