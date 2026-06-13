import { Elysia } from "elysia";
import { z } from "zod";
import { randomUUIDv7 } from "bun";
import { env } from "./lib/env";
import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import { orgController } from "./http/controllers/org";
import { indicatorsController } from "./http/controllers/indicators";
import { pool } from "./db/client";
import { transporter } from "./lib/transporter";

const app = new Elysia()
  .derive(() => ({ requestId: randomUUIDv7() }))
  .onAfterHandle(({ set, requestId }) => {
    set.headers["X-Request-Id"] = requestId;
  })
  .onError(({ code, error, request, status, requestId }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
    if (code === "NOT_FOUND") return status(404, { message: "Not found" });
    console.error(
      JSON.stringify({
        level: "error",
        requestId,
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
  .use(orgController)
  .use(indicatorsController)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

pool.connect().then((client) => {
  client.query("SELECT 1").then(() => {
    client.release();
    console.log("[startup] Database connection OK");
  }).catch((err: Error) => {
    client.release();
    console.error(JSON.stringify({ level: "error", component: "db", message: err.message, ts: new Date().toISOString() }));
  });
}).catch((err: Error) => {
  console.error(JSON.stringify({ level: "error", component: "db", message: err.message, ts: new Date().toISOString() }));
});

transporter.verify().then(() => {
  console.log("[startup] SMTP connection OK");
}).catch((err: Error) => {
  console.error(JSON.stringify({ level: "error", component: "smtp", message: err.message, ts: new Date().toISOString() }));
});
