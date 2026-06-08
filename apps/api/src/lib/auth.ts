import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import { randomUUIDv7 } from "bun";
import { SendResetPasswordEmail } from "./emails-template";
import { admin, openAPI, twoFactor } from "better-auth/plugins";
import { env } from "./env";

export const auth = betterAuth({
  appName: "Portal Coop",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/auth",
  trustedOrigins: [env.VITE_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: () => randomUUIDv7(),
    },
    useSecureCookies: env.NODE_ENV === "production",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
      disableIpTracking: false,
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email":   { window: 60, max: 5 },
      "/sign-up/email":   { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 32,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async (data) => {
      await SendResetPasswordEmail({
        email: data.user.email,
        url: data.url,
      });
    },
  },
  plugins: [
    twoFactor({
      issuer: "Portal Coop",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
        storeBackupCodes: "encrypted",
      },
      twoFactorCookieMaxAge: 60 * 10,
    }),
    admin(),
    openAPI(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "compact",
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          console.log(`[audit] session.created user=${session.userId}`);
        },
      },
    },
    user: {
      update: {
        after: async (user) => {
          console.log(`[audit] user.updated id=${user.id} email=${user.email}`);
        },
      },
    },
  },
});
