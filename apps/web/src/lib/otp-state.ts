export const STORAGE_KEY = "2fa_otp_state"
export const MAX_ATTEMPTS = 5
export const TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutos
export const RESEND_COOLDOWN_MS = 2 * 60 * 1000 // 2 minutos

export interface OtpState {
  attempts: number
  tokenIssuedAt: number
  lastResendAt: number | null
}

export function persistOtpState(state: OtpState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearOtpState() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function loadOtpState(): OtpState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as OtpState
  } catch {}
  const initial: OtpState = { attempts: 0, tokenIssuedAt: Date.now(), lastResendAt: null }
  persistOtpState(initial)
  return initial
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}
