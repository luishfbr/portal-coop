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
import { ShieldAlert } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { VerifyTotpFormToEnable } from "./verify-totp-form-to-enable.tsx"
import { useRouter } from "@tanstack/react-router"

const enableSchema = z.object({
  password,
})

type EnableType = z.infer<typeof enableSchema>

export const EnableTwoFactor = () => {
  const router = useRouter()
  const user = router.options.context.auth.user

  const storageKey = `totp-uri-${user!.email}`
  const [totpURI, setTotpURI] = useState<string | null>(() =>
    localStorage.getItem(storageKey)
  )
  const form = useForm<EnableType>({
    resolver: zodResolver(enableSchema),
    defaultValues: {
      password: "",
    },
  })

  async function onSubmit({ password }: EnableType) {
    await authClient.twoFactor.enable({
      password,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: (context) => {
          if (context.data.totpURI) {
            localStorage.setItem(storageKey, context.data.totpURI)
            setTotpURI(context.data.totpURI)
          }
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
          Etapa de segurança de cunho obrigatório, realize os passos abaixo.
        </CardDescription>
      </CardHeader>
      {!totpURI ? (
        <>
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
                      <FieldLabel htmlFor="pass">
                        1° - Insira sua senha
                      </FieldLabel>
                      <Input id="pass" {...field} type="password" />
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
        </>
      ) : (
        <VerifyTotpFormToEnable
          totpURI={totpURI}
          onSuccess={() => localStorage.removeItem(storageKey)}
        />
      )}
    </Card>
  )
}
