import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import { randomUUIDv7 } from "bun";
import { SendOtpEmail, SendResetPasswordEmail } from "./emails-template";
import { admin, openAPI, twoFactor } from "better-auth/plugins";
import { env } from "./env";

export const auth = betterAuth({
  basePath: "/auth",
  trustedOrigins: [env.VITE_URL || "http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: () => randomUUIDv7(),
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
    resetPasswordTokenExpiresIn: 60 * 5,
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
      skipVerificationOnEnable: true,
      otpOptions: {
        allowedAttempts: 5,
        period: 60 * 5,
        sendOTP: async (data) => {
          await SendOtpEmail({
            email: data.user.email,
            otp: data.otp,
          });
        },
      },
    }),
    admin(),
    openAPI(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    expiresIn: 60 * 60 * 8,
  },
});
