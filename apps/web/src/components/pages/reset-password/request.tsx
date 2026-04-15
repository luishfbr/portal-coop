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
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { authClient } from "@/lib/auth-client"
import { email } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { LockIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const sendReset = z.object({
  email,
})

type SendReset = z.infer<typeof sendReset>

export const RequestResetPassForm = () => {
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(sendReset),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit({ email }: SendReset) {
    await authClient.requestPasswordReset({
      email,
      redirectTo: "http://localhost:3000/redefinir-senha",
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: () => {
          toast.success("Link enviado com sucesso!")
        },
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <LockIcon />
          <span>Redefinição de Senha</span>
        </CardTitle>
        <CardDescription>
          Preencha o campo abaixo e solicite o link de redefinição.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="request-form"
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <LoadingButton
            disabled={form.formState.disabled}
            form="request-form"
            label="Solicitar Link"
            loading={form.formState.isSubmitting}
          />
          <Button
            variant={"link"}
            onClick={() => {
              navigate({
                to: "/login",
              })
            }}
          >
            Retornar à página de login
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
