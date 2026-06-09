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

import { userProfilesController } from "./index";
import { UserProfilesService } from "./service";
import { makeUserProfile, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return userProfilesController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}

describe("User Profiles Controller", () => {
  describe("GET /api/v1/users/:userId/org-profile", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", "/api/v1/users/user-1/org-profile")).status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", "/api/v1/users/user-1/org-profile")).status).toBe(403);
    });

    test("returns 200 with profile when admin", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(UserProfilesService, "findByUser").mockResolvedValue(makeUserProfile());
      expect((await req("GET", "/api/v1/users/user-1/org-profile")).status).toBe(200);
    });

    test("returns 200 with null when user has no profile", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(UserProfilesService, "findByUser").mockResolvedValue(null);
      expect((await req("GET", "/api/v1/users/user-1/org-profile")).status).toBe(200);
    });

    test("proxies 404 when user not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(UserProfilesService, "findByUser").mockResolvedValue(status(404, { message: "User not found" }) as never);
      expect((await req("GET", "/api/v1/users/bad-id/org-profile")).status).toBe(404);
    });

    test("passes userId to UserProfilesService.findByUser", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const spy = spyOn(UserProfilesService, "findByUser").mockResolvedValue(null);
      await req("GET", "/api/v1/users/user-1/org-profile");
      expect(spy).toHaveBeenCalledWith("user-1");
    });
  });

  describe("PUT /api/v1/users/:userId/org-profile", () => {
    test("returns 200 when upserting profile", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(UserProfilesService, "upsert").mockResolvedValue(makeUserProfile());
      expect((await req("PUT", "/api/v1/users/user-1/org-profile", {})).status).toBe(200);
    });

    test("proxies 404 when user not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(UserProfilesService, "upsert").mockResolvedValue(status(404, { message: "User not found" }) as never);
      expect((await req("PUT", "/api/v1/users/bad-id/org-profile", {})).status).toBe(404);
    });

    test("proxies 422 on business rule violation (area-sector mismatch)", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(UserProfilesService, "upsert").mockResolvedValue(
        status(422, { message: "Area does not belong to the given sector" }) as never
      );
      const res = await req("PUT", "/api/v1/users/user-1/org-profile", { sectorId: "s1", areaId: "a1" });
      expect(res.status).toBe(422);
    });

    test("passes userId and body to UserProfilesService.upsert", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const spy = spyOn(UserProfilesService, "upsert").mockResolvedValue(makeUserProfile());
      await req("PUT", "/api/v1/users/user-1/org-profile", { agencyId: "agency-1" });
      expect(spy).toHaveBeenCalledWith("user-1", { agencyId: "agency-1" });
    });
  });
});
