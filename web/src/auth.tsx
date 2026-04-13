import * as React from "react"
import { authClient } from "./lib/auth-client"
import type { UserWithTwoFactor } from "better-auth/client/plugins"
import { LoadingPage } from "./components/customs-pages/loading-page"

export interface AuthContext {
  isAuthenticated: boolean
  user: UserWithTwoFactor | null
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession()

  if (isPending) return <LoadingPage />

  const user = data?.user as UserWithTwoFactor
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
