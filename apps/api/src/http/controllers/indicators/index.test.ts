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

import { indicatorsController } from "./index";
import { IndicatorsService } from "./service";
import { makeIndicator, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

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

describe("IndicatorsController", () => {
  describe("GET /api/v1/indicators", () => {
    test("returns 401 when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      expect((await req("GET", "/api/v1/indicators")).status).toBe(401);
    });

    test("returns 403 when non-admin", async () => {
      mockGetSession.mockResolvedValueOnce(USER);
      expect((await req("GET", "/api/v1/indicators")).status).toBe(403);
    });

    test("returns 200 with list", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(IndicatorsService, "findAll").mockResolvedValue([makeIndicator()]);
      expect((await req("GET", "/api/v1/indicators")).status).toBe(200);
    });
  });

  describe("GET /api/v1/indicators/:id", () => {
    test("returns 404 from service", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(IndicatorsService, "findById").mockResolvedValue(
        status(404, { message: "Indicator not found" }) as never,
      );
      expect((await req("GET", "/api/v1/indicators/bad-id")).status).toBe(404);
    });

    test("returns 200 when found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(IndicatorsService, "findById").mockResolvedValue(
        makeIndicator() as never,
      );
      expect((await req("GET", "/api/v1/indicators/indicator-1")).status).toBe(200);
    });
  });

  describe("POST /api/v1/indicators", () => {
    test("returns 422 on invalid body", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      expect((await req("POST", "/api/v1/indicators", {})).status).toBe(422);
    });

    test("returns 409 when slug taken", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(IndicatorsService, "create").mockResolvedValue(
        status(409, { message: "Slug already in use" }) as never,
      );
      expect(
        (
          await req("POST", "/api/v1/indicators", {
            name: "Test",
            slug: "test-indicator",
            categoria: "metas_comerciais",
            direcao: "crescente",
            periodicidade: "mensal",
            metodoConsolidacao: "acumulado",
            unidadeMedida: "inteiro",
          })
        ).status,
      ).toBe(409);
    });

    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(IndicatorsService, "create").mockResolvedValue(
        makeIndicator() as never,
      );
      expect(
        (
          await req("POST", "/api/v1/indicators", {
            name: "Test",
            slug: "test-indicator",
            categoria: "metas_comerciais",
            direcao: "crescente",
            periodicidade: "mensal",
            metodoConsolidacao: "acumulado",
            unidadeMedida: "inteiro",
          })
        ).status,
      ).toBe(200);
    });
  });

  describe("PATCH /api/v1/indicators/:id", () => {
    test("returns 404 when not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(IndicatorsService, "update").mockResolvedValue(
        status(404, { message: "Indicator not found" }) as never,
      );
      expect((await req("PATCH", "/api/v1/indicators/bad-id", { name: "New" })).status).toBe(404);
    });

    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(IndicatorsService, "update").mockResolvedValue(makeIndicator() as never);
      expect((await req("PATCH", "/api/v1/indicators/indicator-1", { name: "New" })).status).toBe(200);
    });
  });

  describe("DELETE /api/v1/indicators/:id", () => {
    test("returns 404 when not found", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      const { status } = await import("elysia");
      spyOn(IndicatorsService, "remove").mockResolvedValue(
        status(404, { message: "Indicator not found" }) as never,
      );
      expect((await req("DELETE", "/api/v1/indicators/bad-id")).status).toBe(404);
    });

    test("returns 200 on success", async () => {
      mockGetSession.mockResolvedValueOnce(ADMIN);
      spyOn(IndicatorsService, "remove").mockResolvedValue({ deleted: true });
      expect((await req("DELETE", "/api/v1/indicators/indicator-1")).status).toBe(200);
    });
  });
});
