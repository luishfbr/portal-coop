import { CardContent, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { LoadingButton } from "@/components/ui/loading-button"
import { authClient } from "@/lib/auth-client"
import { codeSchema, type CodeType } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import QRCode from "react-qr-code"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export const VerifyTotpFormToEnable = ({
  totpURI,
  onSuccess,
}: {
  totpURI: string
  onSuccess?: () => void
}) => {
  const navigate = useNavigate()

  const verifyForm = useForm<CodeType>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  })

  async function handleVerify({ code }: CodeType) {
    await authClient.twoFactor.verifyTotp({
      code,
      fetchOptions: {
        onError(context) {
          toast.error(context.error.message)
        },
        onSuccess: () => {
          onSuccess?.()
          navigate({ to: "/pagina-inicial" })
        },
      },
    })
  }

  return (
    <>
      <CardContent className="space-y-4">
        <Field>
          <QRCode value={totpURI} />
          <FieldDescription className="text-center">
            Leia o Código QR acima com o aplicativo autenticador. (Microsoft
            Authenticator)
          </FieldDescription>
        </Field>
        <form
          id="enable-two-factor-form"
          autoComplete="off"
          onSubmit={verifyForm.handleSubmit(handleVerify)}
        >
          <FieldGroup>
            <Controller
              name="code"
              control={verifyForm.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <div className="flex w-full flex-col items-center justify-center gap-2 text-center">
                    <FieldLabel htmlFor="code">
                      2° - Insira o código de 6 dígitos
                    </FieldLabel>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <LoadingButton
            disabled={verifyForm.formState.disabled}
            form="enable-two-factor-form"
            label="Verificar"
            loading={verifyForm.formState.isSubmitting}
          />
        </Field>
      </CardFooter>
    </>
  )
}
