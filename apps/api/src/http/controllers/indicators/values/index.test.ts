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
    PORT: 8080,
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost/test",
    DATABASE_SSL: false,
    BETTER_AUTH_SECRET: "a".repeat(32),
    BETTER_AUTH_URL: "http://localhost:8080",
    SMTP_HOST: "localhost",
    SMTP_PORT: 587,
    SMTP_USER: "u",
    SMTP_PASS: "p",
    SMTP_MAIL_FROM: "test@example.com",
    ADMIN_NAME: "Admin",
    ADMIN_EMAIL: "admin@example.com",
    ADMIN_PASSWORD: "password123",
    VITE_URL: "http://localhost:3000",
  },
}));

afterEach(() => mock.restore());

import { indicatorsController } from "../index";
import { ValuesService } from "./service";
import { makeIndicatorValue, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return indicatorsController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

describe("ValuesController", () => {
  describe("GET /api/v1/indicators/:id/values", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", "/api/v1/indicators/indicator-1/values")).status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", "/api/v1/indicators/indicator-1/values")).status).toBe(403);
    });

    test("returns 404 when indicator not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(ValuesService, "findByIndicator").mockResolvedValue(
        status(404, { message: "Indicator not found" }) as never,
      );
      expect((await req("GET", "/api/v1/indicators/bad-id/values")).status).toBe(404);
    });

    test("returns 200 with values", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(ValuesService, "findByIndicator").mockResolvedValue([makeIndicatorValue()]);
      expect((await req("GET", "/api/v1/indicators/indicator-1/values")).status).toBe(200);
    });
  });

  describe("POST /api/v1/indicators/:id/values", () => {
    test("returns 422 on invalid body", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      expect((await req("POST", "/api/v1/indicators/indicator-1/values", {})).status).toBe(422);
    });

    test("returns 409 on duplicate", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(ValuesService, "create").mockResolvedValue(
        status(409, { message: "A value of this type already exists for this reference date" }) as never,
      );
      expect(
        (
          await req("POST", "/api/v1/indicators/indicator-1/values", {
            type: "realizado",
            value: 100,
            referenceDate: "2024-01-01",
          })
        ).status,
      ).toBe(409);
    });

    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(ValuesService, "create").mockResolvedValue(makeIndicatorValue() as never);
      expect(
        (
          await req("POST", "/api/v1/indicators/indicator-1/values", {
            type: "realizado",
            value: 100,
            referenceDate: "2024-01-01",
          })
        ).status,
      ).toBe(200);
    });
  });

  describe("PATCH /api/v1/indicators/:id/values/:valueId", () => {
    test("returns 404 when value not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(ValuesService, "update").mockResolvedValue(
        status(404, { message: "Indicator value not found" }) as never,
      );
      expect(
        (await req("PATCH", "/api/v1/indicators/indicator-1/values/bad-id", { value: 200 })).status,
      ).toBe(404);
    });

    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(ValuesService, "update").mockResolvedValue(makeIndicatorValue() as never);
      expect(
        (await req("PATCH", "/api/v1/indicators/indicator-1/values/value-1", { value: 200 })).status,
      ).toBe(200);
    });
  });

  describe("DELETE /api/v1/indicators/:id/values/:valueId", () => {
    test("returns 404 when value not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(ValuesService, "remove").mockResolvedValue(
        status(404, { message: "Indicator value not found" }) as never,
      );
      expect((await req("DELETE", "/api/v1/indicators/indicator-1/values/bad-id")).status).toBe(404);
    });

    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(ValuesService, "remove").mockResolvedValue({ deleted: true });
      expect((await req("DELETE", "/api/v1/indicators/indicator-1/values/value-1")).status).toBe(200);
    });
  });
});
