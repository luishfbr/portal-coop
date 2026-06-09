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

import { areasController } from "./index";
import { AreasService } from "./service";
import { makeArea, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return areasController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}

const BASE = "/api/v1/sectors/sector-1/areas";

describe("Areas Controller", () => {
  describe("GET /api/v1/sectors/:sectorId/areas", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", BASE)).status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", BASE)).status).toBe(403);
    });

    test("returns 200 with areas when admin", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AreasService, "findBySector").mockResolvedValue([makeArea()]);
      expect((await req("GET", BASE)).status).toBe(200);
    });

    test("proxies 404 when sector not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AreasService, "findBySector").mockResolvedValue(status(404, { message: "Sector not found" }) as never);
      expect((await req("GET", BASE)).status).toBe(404);
    });

    test("passes sectorId to AreasService.findBySector", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const spy = spyOn(AreasService, "findBySector").mockResolvedValue([]);
      await req("GET", BASE);
      expect(spy).toHaveBeenCalledWith("sector-1");
    });
  });

  describe("POST /api/v1/sectors/:sectorId/areas", () => {
    test("returns 200 and creates area", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AreasService, "create").mockResolvedValue(makeArea());
      expect((await req("POST", BASE, { name: "Test Area" })).status).toBe(200);
    });

    test("returns 422 on invalid body", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      expect((await req("POST", BASE, { name: "X" })).status).toBe(422);
    });

    test("proxies 404 when sector not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AreasService, "create").mockResolvedValue(status(404, { message: "Sector not found" }) as never);
      expect((await req("POST", BASE, { name: "Test Area" })).status).toBe(404);
    });
  });

  describe("PATCH /api/v1/sectors/:sectorId/areas/:id", () => {
    test("returns 200 when updating area", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AreasService, "update").mockResolvedValue(makeArea({ name: "Updated" }));
      expect((await req("PATCH", `${BASE}/area-1`, { name: "Updated Area" })).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AreasService, "update").mockResolvedValue(status(404, { message: "Area not found" }) as never);
      expect((await req("PATCH", `${BASE}/bad-id`, { name: "Updated Area" })).status).toBe(404);
    });
  });

  describe("PATCH /api/v1/sectors/:sectorId/areas/:id/toggle", () => {
    test("returns 200 with toggled area", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AreasService, "toggle").mockResolvedValue(makeArea({ isActive: false }));
      expect((await req("PATCH", `${BASE}/area-1/toggle`)).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AreasService, "toggle").mockResolvedValue(status(404, { message: "Area not found" }) as never);
      expect((await req("PATCH", `${BASE}/bad-id/toggle`)).status).toBe(404);
    });
  });

  describe("DELETE /api/v1/sectors/:sectorId/areas/:id", () => {
    test("returns 200 with { deleted: true }", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(AreasService, "remove").mockResolvedValue({ deleted: true });
      expect((await req("DELETE", `${BASE}/area-1`)).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(AreasService, "remove").mockResolvedValue(status(404, { message: "Area not found" }) as never);
      expect((await req("DELETE", `${BASE}/bad-id`)).status).toBe(404);
    });
  });
});
