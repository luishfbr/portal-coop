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

import { agenciesController } from "./index";
import { AgenciesService } from "./service";
import { makeAgency, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return agenciesController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}

describe("Agencies Controller", () => {
  describe("GET /api/v1/agencies", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", "/api/v1/agencies")).status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", "/api/v1/agencies")).status).toBe(403);
    });

    test("returns 200 with agencies list", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AgenciesService, "findAll").mockResolvedValue([makeAgency()]);
      expect((await req("GET", "/api/v1/agencies")).status).toBe(200);
    });

    test("delegates to AgenciesService.findAll", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const spy = spyOn(AgenciesService, "findAll").mockResolvedValue([]);
      await req("GET", "/api/v1/agencies");
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/v1/agencies", () => {
    test("returns 200 and creates agency", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AgenciesService, "create").mockResolvedValue(makeAgency());
      expect((await req("POST", "/api/v1/agencies", { name: "Test Agency" })).status).toBe(200);
    });

    test("returns 422 on invalid body (name too short)", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      expect((await req("POST", "/api/v1/agencies", { name: "X" })).status).toBe(422);
    });

    test("passes body to AgenciesService.create", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const spy = spyOn(AgenciesService, "create").mockResolvedValue(makeAgency());
      await req("POST", "/api/v1/agencies", { name: "Test Agency" });
      expect(spy).toHaveBeenCalledWith({ name: "Test Agency" });
    });
  });

  describe("PATCH /api/v1/agencies/:id", () => {
    test("returns 200 when updating agency", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AgenciesService, "update").mockResolvedValue(makeAgency({ name: "Updated" }));
      expect((await req("PATCH", "/api/v1/agencies/agency-1", { name: "Updated Agency" })).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AgenciesService, "update").mockResolvedValue(status(404, { message: "Agency not found" }) as never);
      expect((await req("PATCH", "/api/v1/agencies/bad-id", { name: "Updated Agency" })).status).toBe(404);
    });
  });

  describe("PATCH /api/v1/agencies/:id/toggle", () => {
    test("returns 200 with toggled agency", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AgenciesService, "toggle").mockResolvedValue(makeAgency({ isActive: false }));
      expect((await req("PATCH", "/api/v1/agencies/agency-1/toggle")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AgenciesService, "toggle").mockResolvedValue(status(404, { message: "Agency not found" }) as never);
      expect((await req("PATCH", "/api/v1/agencies/bad-id/toggle")).status).toBe(404);
    });
  });

  describe("DELETE /api/v1/agencies/:id", () => {
    test("returns 200 with { deleted: true }", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AgenciesService, "remove").mockResolvedValue({ deleted: true });
      expect((await req("DELETE", "/api/v1/agencies/agency-1")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AgenciesService, "remove").mockResolvedValue(status(404, { message: "Agency not found" }) as never);
      expect((await req("DELETE", "/api/v1/agencies/bad-id")).status).toBe(404);
    });
  });
});
