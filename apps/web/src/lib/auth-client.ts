import { createAuthClient } from "better-auth/react"
import { twoFactorClient, adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:8080",
  plugins: [
    twoFactorClient({
      twoFactorPage: "http://localhost:3000/verificar-2fa",
    }),
    adminClient(),
  ],
})
