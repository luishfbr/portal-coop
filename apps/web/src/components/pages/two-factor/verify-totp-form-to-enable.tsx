import { Button } from "@/components/ui/button"
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
import { CheckCircle2, Copy, KeyRound } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import QRCode from "react-qr-code"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

function extractSecret(totpURI: string): string {
  try {
    return new URL(totpURI).searchParams.get("secret") ?? ""
  } catch {
    return ""
  }
}

function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret
}

export const VerifyTotpFormToEnable = ({
  totpURI,
  backupCodes,
  onSuccess,
}: {
  totpURI: string
  backupCodes: string[]
  onSuccess?: () => void
}) => {
  const navigate = useNavigate()
  const [savedBackupCodes, setSavedBackupCodes] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

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
          if (backupCodes.length > 0) {
            setShowBackupCodes(true)
          } else {
            onSuccess?.()
            navigate({ to: "/pagina-inicial" })
          }
        },
      },
    })
  }

  function handleCopyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success("Códigos copiados!")
  }

  function handleConfirmBackupCodes() {
    onSuccess?.()
    navigate({ to: "/pagina-inicial" })
  }

  const secret = extractSecret(totpURI)

  if (showBackupCodes) {
    return (
      <>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="text-emerald-500 size-10" />
            <p className="font-medium">Autenticação 2FA ativada!</p>
            <p className="text-muted-foreground text-sm">
              Guarde estes códigos de recuperação em local seguro. Cada código
              só pode ser usado uma vez caso você perca acesso ao aplicativo.
            </p>
          </div>
          <div className="bg-muted rounded-md p-4">
            <div className="grid grid-cols-2 gap-1">
              {backupCodes.map((code, i) => (
                <span key={i} className="font-mono text-sm">
                  {code}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopyBackupCodes}
          >
            <Copy className="size-4" />
            Copiar todos os códigos
          </Button>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={savedBackupCodes}
              onChange={(e) => setSavedBackupCodes(e.target.checked)}
              className="size-4"
            />
            Já salvei meus códigos de recuperação
          </label>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!savedBackupCodes}
            onClick={handleConfirmBackupCodes}
          >
            Continuar para o portal
          </Button>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      <CardContent className="space-y-4">
        <Field>
          <div className="flex justify-center">
            <QRCode value={totpURI} />
          </div>
          <FieldDescription className="text-center">
            Leia o código QR com qualquer aplicativo autenticador (Google
            Authenticator, Microsoft Authenticator, Authy, etc.)
          </FieldDescription>
        </Field>

        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground list-none">
            <KeyRound className="size-4" />
            Não consigo escanear o QR code
          </summary>
          <div className="mt-2 rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Digite este código manualmente no aplicativo:
            </p>
            <code className="font-mono text-sm tracking-widest break-all">
              {formatSecret(secret)}
            </code>
          </div>
        </details>

        <form
          id="enable-two-factor-verify-form"
          autoComplete="off"
          onSubmit={verifyForm.handleSubmit(handleVerify)}
        >
          <FieldGroup>
            <Controller
              name="code"
              control={verifyForm.control}
              render={({ field, fieldState }) => (
                <Field>
                  <div className="flex w-full flex-col items-center justify-center gap-2 text-center">
                    <FieldLabel htmlFor="code">
                      2° - Insira o código de 6 dígitos
                    </FieldLabel>
                    <InputOTP
                      maxLength={6}
                      aria-label="Código de autenticação de 6 dígitos"
                      {...field}
                    >
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
            form="enable-two-factor-verify-form"
            label="Verificar e ativar"
            loading={verifyForm.formState.isSubmitting}
          />
        </Field>
      </CardFooter>
    </>
  )
}
