import { Elysia } from "elysia";
import { z } from "zod";
import { env } from "./lib/env";
import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import { modulesController } from "./http/controllers/modules";
import { orgController } from "./http/controllers/org";
import { groupsController } from "./http/controllers/groups";

const app = new Elysia()
  .onError(({ code, error, request, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
    if (code === "NOT_FOUND") return status(404, { message: "Not found" });
    console.error(
      JSON.stringify({
        level: "error",
        code,
        path: new URL(request.url).pathname,
        message: error.message,
        ts: new Date().toISOString(),
      }),
    );
    return status(500, { message: "Internal server error" });
  })
  .get("/health", () => ({ status: "ok", uptime: process.uptime() }))
  .use(
    cors({
      origin: env.VITE_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
      mapJsonSchema: { zod: z.toJSONSchema },
    }),
  )
  .use(betterAuthPlugin)
  .use(modulesController)
  .use(orgController)
  .use(groupsController)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
