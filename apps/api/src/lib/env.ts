import z from "zod";

const envSchema = z.object({
  PORT: z.string().transform((e) => Number(e)),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  DATABASE_SSL: z.enum(["true", "false"]).transform((v) => v === "true").default("false"),
  NODE_ENV: z.string().trim().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  SMTP_HOST: z.string().trim().min(1),
  SMTP_PORT: z.string().transform((e) => Number(e)),
  SMTP_USER: z.string().trim().min(1),
  SMTP_PASS: z.string().trim().min(1),
  SMTP_MAIL_FROM: z.email(),
  ADMIN_NAME: z.string().trim().min(1),
  ADMIN_EMAIL: z.string().trim().min(1),
  ADMIN_PASSWORD: z.string().trim().min(1),
  VITE_URL: z.url()
});

export const env = envSchema.parse(Bun.env);
