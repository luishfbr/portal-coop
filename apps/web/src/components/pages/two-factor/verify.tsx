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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { LoadingButton } from "@/components/ui/loading-button"
import { authClient } from "@/lib/auth-client"
import { codeSchema, type CodeType } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { ShieldCheck } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

export const VerifyTotpForm = () => {
  const navigate = useNavigate()

  const form = useForm<CodeType>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onSubmit({ code }: CodeType) {
    await authClient.twoFactor.verifyTotp({
      code,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: () => {
          navigate({
            to: "/pagina-inicial",
          })
        },
      },
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <ShieldCheck />
          <span>Verificar identidade</span>
        </CardTitle>
        <CardDescription>
          Digite o código do seu aplicativo autenticador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="code-verify-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="otp-verification">
                    Código de Verificação
                  </FieldLabel>
                  <InputOTP maxLength={6} id="otp-verification" aria-label="Código de autenticação de 6 dígitos" {...field}>
                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-13 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="mx-2" />
                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-13 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
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
            form="code-verify-form"
            label="Verificar"
            loading={form.formState.isSubmitting}
          />
        </Field>
      </CardFooter>
    </Card>
  )
}
