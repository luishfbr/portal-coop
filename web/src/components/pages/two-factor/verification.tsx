import { RefreshCwIcon, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { LoadingButton } from "@/components/ui/loading-button"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { code } from "@/lib/validations"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

const STORAGE_KEY = "2fa_otp_state"
const MAX_ATTEMPTS = 5
const TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutos
const RESEND_COOLDOWN_MS = 2 * 60 * 1000 // 2 minutos

interface OtpState {
  attempts: number
  tokenIssuedAt: number
  lastResendAt: number | null
}

function loadOtpState(): OtpState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as OtpState
  } catch {}
  return { attempts: 0, tokenIssuedAt: Date.now(), lastResendAt: null }
}

function persistOtpState(state: OtpState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

const verifySchema = z.object({
  code,
})

type Verify = z.infer<typeof verifySchema>

export function TwoFactorVerificationForm() {
  const navigate = useNavigate()
  const [resending, setResending] = useState<boolean>(false)
  const [otpState, setOtpState] = useState<OtpState>(() => loadOtpState())
  const [, tick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const form = useForm<Verify>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  })

  function updateOtpState(updates: Partial<OtpState>) {
    setOtpState((prev) => {
      const next = { ...prev, ...updates }
      persistOtpState(next)
      return next
    })
  }

  const now = Date.now()
  const tokenRemainingMs = Math.max(
    0,
    TOKEN_EXPIRY_MS - (now - otpState.tokenIssuedAt),
  )
  const isTokenExpired = tokenRemainingMs === 0

  const resendCooldownMs = otpState.lastResendAt
    ? Math.max(0, RESEND_COOLDOWN_MS - (now - otpState.lastResendAt))
    : 0
  const isResendOnCooldown = resendCooldownMs > 0

  const attemptsExhausted = otpState.attempts >= MAX_ATTEMPTS
  const canSubmit = !attemptsExhausted && !isTokenExpired

  async function onSubmit({ code }: Verify) {
    await authClient.twoFactor.verifyOtp({
      code,
      fetchOptions: {
        onError(context) {
          const newAttempts = otpState.attempts + 1
          updateOtpState({ attempts: newAttempts })
          if (newAttempts >= MAX_ATTEMPTS) {
            toast.error("Máximo de tentativas atingido. Reenvie o código.")
          } else {
            toast.error(
              `${context.error.message} (${MAX_ATTEMPTS - newAttempts} tentativa${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} restante${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"})`,
            )
          }
        },
        onSuccess: () => {
          sessionStorage.removeItem(STORAGE_KEY)
          navigate({ to: "/" })
        },
      },
    })
  }

  async function resendCode() {
    try {
      setResending(true)
      await authClient.twoFactor.sendOtp({
        fetchOptions: {
          onError(context) {
            toast.error(context.error.message)
            setResending(false)
          },
          onSuccess() {
            updateOtpState({
              attempts: 0,
              tokenIssuedAt: Date.now(),
              lastResendAt: Date.now(),
            })
            form.reset()
            toast.success("Código reenviado com sucesso!")
            setResending(false)
          },
        },
      })
    } catch (error) {
      console.error(error)
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-100">
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <ShieldCheck />
          <span>Verificação de Login</span>
        </CardTitle>
        <CardDescription>
          Insira no campo abaixo, o código que lhe foi enviado por email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="verify-otp-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="otp-verification">
                      Código de verificação
                    </FieldLabel>
                    <Button
                      variant="outline"
                      size="xs"
                      type="button"
                      disabled={resending || isResendOnCooldown}
                      onClick={resendCode}
                    >
                      {resending ? (
                        <Spinner />
                      ) : (
                        <>
                          <RefreshCwIcon />
                          {isResendOnCooldown
                            ? `Reenviar (${formatCountdown(resendCooldownMs)})`
                            : "Reenviar"}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <InputOTP
                      maxLength={6}
                      id="otp-verification"
                      disabled={!canSubmit}
                      {...field}
                    >
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator className="mx-2" />
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {attemptsExhausted && (
                    <p className="text-destructive text-sm">
                      Máximo de tentativas atingido. Reenvie o código para
                      continuar.
                    </p>
                  )}
                  {!attemptsExhausted && isTokenExpired && (
                    <p className="text-destructive text-sm">
                      O código expirou. Reenvie um novo código para continuar.
                    </p>
                  )}
                  {!attemptsExhausted && !isTokenExpired && (
                    <p className="text-muted-foreground text-xs">
                      Código expira em {formatCountdown(tokenRemainingMs)} —{" "}
                      {MAX_ATTEMPTS - otpState.attempts} tentativa
                      {MAX_ATTEMPTS - otpState.attempts === 1 ? "" : "s"}{" "}
                      restante
                      {MAX_ATTEMPTS - otpState.attempts === 1 ? "" : "s"}
                    </p>
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
            disabled={form.formState.disabled || !canSubmit}
            form="verify-otp-form"
            label="Verificar"
            loading={form.formState.isSubmitting}
          />
        </Field>
      </CardFooter>
    </Card>
  )
}
