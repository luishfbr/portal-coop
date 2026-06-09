import { describe, test, expect, mock, spyOn, afterEach } from "bun:test";

const mockGetSession = mock(() => Promise.resolve(null));

mock.module("@/lib/auth", () => ({
  auth: {
    handler: async () => new Response("ok"),
    api: {
      getSession: mockGetSession,
      generateOpenAPISchema: mock(() => Promise.resolve({ paths: {}, components: {} })),
    },
  },
}));

mock.module("@/lib/env", () => ({
  env: {
    PORT: 8080, NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost/test",
    BETTER_AUTH_SECRET: "a".repeat(32), BETTER_AUTH_URL: "http://localhost:8080",
    SMTP_HOST: "localhost", SMTP_PORT: 587, SMTP_USER: "u",
    SMTP_PASS: "p", SMTP_MAIL_FROM: "test@example.com",
    ADMIN_NAME: "Admin", ADMIN_EMAIL: "admin@example.com",
    ADMIN_PASSWORD: "password123", VITE_URL: "http://localhost:3000",
  },
}));

afterEach(() => mock.restore());

import { jobFunctionsController } from "./index";
import { JobFunctionsService } from "./service";
import { makeJobFunction, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return jobFunctionsController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}

describe("Job Functions Controller", () => {
  describe("GET /api/v1/job-functions", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", "/api/v1/job-functions")).status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", "/api/v1/job-functions")).status).toBe(403);
    });

    test("returns 200 with job functions list", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(JobFunctionsService, "findAll").mockResolvedValue([makeJobFunction()]);
      expect((await req("GET", "/api/v1/job-functions")).status).toBe(200);
    });
  });

  describe("POST /api/v1/job-functions", () => {
    test("returns 200 and creates job function", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(JobFunctionsService, "create").mockResolvedValue(makeJobFunction());
      expect((await req("POST", "/api/v1/job-functions", { name: "Test JF" })).status).toBe(200);
    });

    test("returns 422 on invalid body", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      expect((await req("POST", "/api/v1/job-functions", { name: "X" })).status).toBe(422);
    });
  });

  describe("PATCH /api/v1/job-functions/:id", () => {
    test("returns 200 when updating", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(JobFunctionsService, "update").mockResolvedValue(makeJobFunction({ name: "Updated" }));
      expect((await req("PATCH", "/api/v1/job-functions/jf-1", { name: "Updated JF" })).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(JobFunctionsService, "update").mockResolvedValue(status(404, { message: "Job function not found" }) as never);
      expect((await req("PATCH", "/api/v1/job-functions/bad-id", { name: "Updated JF" })).status).toBe(404);
    });
  });

  describe("PATCH /api/v1/job-functions/:id/toggle", () => {
    test("returns 200 with toggled job function", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(JobFunctionsService, "toggle").mockResolvedValue(makeJobFunction({ isActive: false }));
      expect((await req("PATCH", "/api/v1/job-functions/jf-1/toggle")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(JobFunctionsService, "toggle").mockResolvedValue(status(404, { message: "Job function not found" }) as never);
      expect((await req("PATCH", "/api/v1/job-functions/bad-id/toggle")).status).toBe(404);
    });
  });

  describe("DELETE /api/v1/job-functions/:id", () => {
    test("returns 200 with { deleted: true }", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(JobFunctionsService, "remove").mockResolvedValue({ deleted: true });
      expect((await req("DELETE", "/api/v1/job-functions/jf-1")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(JobFunctionsService, "remove").mockResolvedValue(status(404, { message: "Job function not found" }) as never);
      expect((await req("DELETE", "/api/v1/job-functions/bad-id")).status).toBe(404);
    });
  });
});
