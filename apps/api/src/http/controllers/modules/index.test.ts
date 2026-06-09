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

import { modulesController } from "./index";
import { ModulesService } from "./service";
import { makeModule, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN_SESSION = makeAdminSession();
const USER_SESSION = makeSession({ role: "user" });

function get(path: string) {
  return modulesController.handle(new Request(`http://localhost${path}`));
}
function patch(path: string) {
  return modulesController.handle(new Request(`http://localhost${path}`, { method: "PATCH" }));
}

describe("Modules Controller", () => {
  describe("GET /api/v1/modules/active", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const res = await get("/api/v1/modules/active");
      expect(res.status).toBe(401);
    });

    test("returns 200 for authenticated user (any role)", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      spyOn(ModulesService, "findActive").mockResolvedValue([makeModule()]);
      const res = await get("/api/v1/modules/active");
      expect(res.status).toBe(200);
    });

    test("delegates to ModulesService.findActive", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      const spy = spyOn(ModulesService, "findActive").mockResolvedValue([]);
      await get("/api/v1/modules/active");
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/v1/modules", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const res = await get("/api/v1/modules");
      expect(res.status).toBe(401);
    });

    test("returns 403 when authenticated as non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      const res = await get("/api/v1/modules");
      expect(res.status).toBe(403);
    });

    test("returns 200 with all modules when admin", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN_SESSION);
      spyOn(ModulesService, "findAll").mockResolvedValue([makeModule()]);
      const res = await get("/api/v1/modules");
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/modules/:id/toggle", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const res = await patch("/api/v1/modules/module-1/toggle");
      expect(res.status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      const res = await patch("/api/v1/modules/module-1/toggle");
      expect(res.status).toBe(403);
    });

    test("returns 200 with toggled module", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN_SESSION);
      spyOn(ModulesService, "toggle").mockResolvedValue(makeModule({ isActive: false }));
      const res = await patch("/api/v1/modules/module-1/toggle");
      expect(res.status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN_SESSION);
      const { status } = await import("elysia");
      spyOn(ModulesService, "toggle").mockResolvedValue(status(404, { message: "Module not found" }) as never);
      const res = await patch("/api/v1/modules/bad-id/toggle");
      expect(res.status).toBe(404);
    });
  });
});
