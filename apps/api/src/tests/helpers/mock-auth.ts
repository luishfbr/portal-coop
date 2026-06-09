import { Elysia, status } from "elysia";
import { makeAdminSession, makeSession } from "./fixtures";

export const mockEnv = {
  PORT: 8080,
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://test:test@localhost/test",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:8080",
  SMTP_HOST: "localhost",
  SMTP_PORT: 587,
  SMTP_USER: "user",
  SMTP_PASS: "pass",
  SMTP_MAIL_FROM: "test@example.com",
  ADMIN_NAME: "Admin",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "password123",
  VITE_URL: "http://localhost:3000",
};

export type AuthScenario = "admin" | "user" | "unauth";

export function makeMockAuthPlugin(scenario: AuthScenario) {
  return new Elysia({ name: "better-auth" }).macro({
    auth: {
      resolve() {
        if (scenario === "unauth") return status(401, "Unauthorized");
        return makeSession({ role: scenario });
      },
    },
    adminOnly: {
      resolve() {
        if (scenario === "unauth") return status(401, "Unauthorized");
        if (scenario !== "admin") return status(403, "Forbidden");
        return makeAdminSession();
      },
    },
  });
}
