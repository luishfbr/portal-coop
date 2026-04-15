import { Elysia } from "elysia";
import { env } from "./lib/env";
import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import { rbacController } from "./http/controllers/rbac";

const app = new Elysia()
  .use(
    cors({
      origin: env.VITE_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(betterAuthPlugin)
  .use(rbacController)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
