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
import { makeModule, makeSession } from "@/tests/helpers/fixtures";

const USER_SESSION = makeSession({ role: "user" });

function get(path: string) {
  return modulesController.handle(new Request(`http://localhost${path}`));
}

describe("Modules Controller", () => {
  describe("GET /api/v1/modules", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const res = await get("/api/v1/modules");
      expect(res.status).toBe(401);
    });

    test("returns 200 for authenticated user", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      spyOn(ModulesService, "findAll").mockResolvedValue([makeModule()]);
      const res = await get("/api/v1/modules");
      expect(res.status).toBe(200);
    });

    test("delegates to ModulesService.findAll", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      const spy = spyOn(ModulesService, "findAll").mockResolvedValue([]);
      await get("/api/v1/modules");
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/v1/modules/my-permissions", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const res = await get("/api/v1/modules/my-permissions");
      expect(res.status).toBe(401);
    });

    test("returns 200 with permission map for authenticated user", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      spyOn(ModulesService, "findMyPermissions").mockResolvedValue({
        "dashboards-internos": ["view"],
      });
      const res = await get("/api/v1/modules/my-permissions");
      expect(res.status).toBe(200);
    });

    test("delegates to ModulesService.findMyPermissions with user id", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      const spy = spyOn(ModulesService, "findMyPermissions").mockResolvedValue({});
      await get("/api/v1/modules/my-permissions");
      expect(spy).toHaveBeenCalledWith(USER_SESSION.user.id);
    });
  });

  describe("GET /api/v1/modules/active", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const res = await get("/api/v1/modules/active");
      expect(res.status).toBe(401);
    });

    test("returns 200 with accessible modules for authenticated user", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      spyOn(ModulesService, "findActive").mockResolvedValue([makeModule()]);
      const res = await get("/api/v1/modules/active");
      expect(res.status).toBe(200);
    });

    test("delegates to ModulesService.findActive with user id", async () => {
      mockGetSession.mockResolvedValueOnce(USER_SESSION);
      const spy = spyOn(ModulesService, "findActive").mockResolvedValue([]);
      await get("/api/v1/modules/active");
      expect(spy).toHaveBeenCalledWith(USER_SESSION.user.id);
    });
  });
});
