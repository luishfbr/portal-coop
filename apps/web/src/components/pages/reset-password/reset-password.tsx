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
import { password } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { Unlock } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useState, useEffect, useRef } from "react"

const TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutos

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

const newPasswordSchema = z.object({
  newPassword: password,
})

type NewPass = z.infer<typeof newPasswordSchema>

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const navigate = useNavigate()
  // eslint-disable-next-line react-compiler/react-compiler
  const tokenIssuedAt = useRef(Date.now())
  const [, tick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // eslint-disable-next-line react-compiler/react-compiler
  const now = Date.now()
  const tokenRemainingMs = Math.max(
    0,
    TOKEN_EXPIRY_MS - (now - tokenIssuedAt.current),
  )
  const isTokenExpired = tokenRemainingMs === 0

  useEffect(() => {
    if (isTokenExpired) {
      toast.error("O link de redefinição expirou. Solicite um novo.")
      navigate({ to: "/redefinicao-de-senha" })
    }
  }, [isTokenExpired, navigate])

  const form = useForm<NewPass>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {},
  })

  async function onSubmit({ newPassword }: NewPass) {
    await authClient.resetPassword({
      newPassword,
      token,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: () => {
          toast.success("Senha redefinida com sucesso!")
          navigate({
            to: "/login",
          })
        },
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <Unlock />
          <span>Redefina sua senha</span>
        </CardTitle>
        <CardDescription>
          Preencha o campo abaixo com a nova senha.{" "}
          <span className="text-muted-foreground text-xs">
            Link expira em {formatCountdown(tokenRemainingMs)}.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="reset-form"
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <FieldGroup>
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="new-pass">Nova Senha</FieldLabel>
                  <Input id="new-pass" {...field} type="password" />
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
            disabled={form.formState.disabled || isTokenExpired}
            form="reset-form"
            label="Redefinir Senha"
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
