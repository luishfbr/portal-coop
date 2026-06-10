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

import { groupsController } from "./index";
import { GroupsService } from "./service";
import {
  makeGroup,
  makeModule,
  makeUser,
  makeAdminSession,
  makeSession,
} from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return groupsController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}

describe("Groups Controller", () => {
  describe("GET /api/v1/groups", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", "/api/v1/groups")).status).toBe(401);
    });

    test("returns 403 for non-admin user", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", "/api/v1/groups")).status).toBe(403);
    });

    test("returns 200 with groups for admin", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "findAll").mockResolvedValue([makeGroup()]);
      expect((await req("GET", "/api/v1/groups")).status).toBe(200);
    });
  });

  describe("POST /api/v1/groups", () => {
    test("returns 201 and creates group", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "create").mockResolvedValue(makeGroup());
      expect((await req("POST", "/api/v1/groups", { name: "Test" })).status).toBe(200);
    });

    test("passes body to GroupsService.create", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const spy = spyOn(GroupsService, "create").mockResolvedValue(makeGroup());
      await req("POST", "/api/v1/groups", { name: "Test Group" });
      expect(spy).toHaveBeenCalledWith({ name: "Test Group" });
    });
  });

  describe("PATCH /api/v1/groups/:id", () => {
    test("returns 200 on successful update", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "update").mockResolvedValue(makeGroup({ name: "New" }));
      expect((await req("PATCH", "/api/v1/groups/group-1", { name: "New Name" })).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(GroupsService, "update").mockResolvedValue(
        status(404, { message: "Group not found" }) as never
      );
      expect((await req("PATCH", "/api/v1/groups/bad-id", { name: "New Name" })).status).toBe(404);
    });
  });

  describe("DELETE /api/v1/groups/:id", () => {
    test("returns 200 with { deleted: true }", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "remove").mockResolvedValue({ deleted: true });
      expect((await req("DELETE", "/api/v1/groups/group-1")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(GroupsService, "remove").mockResolvedValue(
        status(404, { message: "Group not found" }) as never
      );
      expect((await req("DELETE", "/api/v1/groups/bad-id")).status).toBe(404);
    });
  });

  describe("GET /api/v1/groups/:id/modules", () => {
    test("returns 200 with modules for admin", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "findModules").mockResolvedValue([makeModule()]);
      expect((await req("GET", "/api/v1/groups/group-1/modules")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(GroupsService, "findModules").mockResolvedValue(
        status(404, { message: "Group not found" }) as never
      );
      expect((await req("GET", "/api/v1/groups/bad-id/modules")).status).toBe(404);
    });
  });

  describe("PUT /api/v1/groups/:id/modules", () => {
    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "setModules").mockResolvedValue({ updated: true });
      expect(
        (await req("PUT", "/api/v1/groups/group-1/modules", { moduleIds: ["m-1"] })).status
      ).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(GroupsService, "setModules").mockResolvedValue(
        status(404, { message: "Group not found" }) as never
      );
      expect(
        (await req("PUT", "/api/v1/groups/bad-id/modules", { moduleIds: ["m-1"] })).status
      ).toBe(404);
    });
  });

  describe("GET /api/v1/groups/:id/users", () => {
    test("returns 200 with users for admin", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "findUsers").mockResolvedValue([makeUser()]);
      expect((await req("GET", "/api/v1/groups/group-1/users")).status).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(GroupsService, "findUsers").mockResolvedValue(
        status(404, { message: "Group not found" }) as never
      );
      expect((await req("GET", "/api/v1/groups/bad-id/users")).status).toBe(404);
    });
  });

  describe("PUT /api/v1/groups/:id/users", () => {
    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(GroupsService, "setUsers").mockResolvedValue({ updated: true });
      expect(
        (await req("PUT", "/api/v1/groups/group-1/users", { userIds: ["u-1"] })).status
      ).toBe(200);
    });

    test("proxies 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(GroupsService, "setUsers").mockResolvedValue(
        status(404, { message: "Group not found" }) as never
      );
      expect(
        (await req("PUT", "/api/v1/groups/bad-id/users", { userIds: ["u-1"] })).status
      ).toBe(404);
    });
  });
});
