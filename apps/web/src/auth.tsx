import * as React from "react"
import { authClient } from "./lib/auth-client"
import type {
  UserWithRole,
  UserWithTwoFactor,
} from "better-auth/client/plugins"
import { LoadingPage } from "./components/customs-pages/loading-page"
import { useQuery } from "@tanstack/react-query"

export type User = UserWithRole & UserWithTwoFactor

export interface AuthContext {
  isAuthenticated: boolean
  user: User | null
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession()

  // Bypasses the 5-minute cookie cache to detect revoked sessions from the server.
  const { data: serverSession, isSuccess: serverChecked } = useQuery({
    queryKey: ["session-server-check"],
    queryFn: () =>
      authClient.getSession({
        query: { disableCookieCache: true },
      }),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    enabled: !isPending,
  })

  if (isPending) return <LoadingPage />

  const user = (
    serverChecked
      ? (serverSession?.data?.user ?? null)
      : (data?.user ?? null)
  ) as User | null

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
