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
import { useRouter } from "@tanstack/react-router"
import { ShieldAlert } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { VerifyTotpForm } from "./verify-totp-form.tsx"

const enableSchema = z.object({
  password,
})

type EnableType = z.infer<typeof enableSchema>

export const EnableTwoFactor = () => {
  const router = useRouter()
  const user = router.options.context.auth.user
  const [totpURI, setTotpURI] = useState<string | null>(null)

  if (!user) {
    return <UnauthorizedPage />
  }

  const enableForm = useForm<EnableType>({
    resolver: zodResolver(enableSchema),
    defaultValues: {
      password: "",
    },
  })

  async function handleEnable({ password }: EnableType) {
    await authClient.twoFactor.enable({
      password,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: (context) => {
          if (context.data.totpURI) {
            setTotpURI(context.data.totpURI)
          }
        },
      },
    })
  }

  const EnableCardForm = () => {
    return (
      <>
        <CardContent>
          <form
            id="enable-two-factor-form"
            autoComplete="off"
            onSubmit={enableForm.handleSubmit(handleEnable)}
          >
            <FieldGroup>
              <Controller
                name="password"
                control={enableForm.control}
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
              disabled={enableForm.formState.disabled}
              form="enable-two-factor-form"
              label="Habilitar"
              loading={enableForm.formState.isSubmitting}
            />
          </Field>
        </CardFooter>
      </>
    )
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
      {!totpURI ? <EnableCardForm /> : <VerifyTotpForm totpURI={totpURI} />}
    </Card>
  )
}
