import { describe, test, expect, mock } from "bun:test";

const findFirst = mock(() => Promise.resolve(null));
const findMany = mock(() => Promise.resolve([]));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      indicators: { findFirst, findMany },
    },
    insert: mock(() => ({ values: mock(() => ({ returning: insertReturning })) })),
    update: mock(() => ({
      set: mock(() => ({ where: mock(() => ({ returning: updateReturning })) })),
    })),
    delete: mock(() => ({ where: mock(() => Promise.resolve()) })),
  },
}));

import { IndicatorsService } from "./service";
import { makeIndicator } from "@/tests/helpers/fixtures";

describe("IndicatorsService", () => {
  describe("findAll", () => {
    test("returns list of indicators", async () => {
      const indicator = makeIndicator();
      findMany.mockResolvedValueOnce([indicator]);
      expect(await IndicatorsService.findAll()).toEqual([indicator]);
    });
  });

  describe("findById", () => {
    test("returns 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await IndicatorsService.findById("bad-id");
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator not found" } });
    });

    test("returns indicator when found", async () => {
      const indicator = makeIndicator();
      findFirst.mockResolvedValueOnce(indicator);
      expect(await IndicatorsService.findById("indicator-1")).toEqual(indicator);
    });
  });

  describe("create", () => {
    test("returns 409 when slug already in use", async () => {
      findFirst.mockResolvedValueOnce({ id: "indicator-1" });
      const result = await IndicatorsService.create({
        name: "Test",
        slug: "test-indicator",
        categoria: "metas_comerciais",
        direcao: "crescente",
        periodicidade: "mensal",
        metodoConsolidacao: "acumulado",
        unidadeMedida: "inteiro",
      });
      expect(result).toMatchObject({ code: 409, response: { message: "Slug already in use" } });
    });

    test("creates indicator when slug is unique", async () => {
      const indicator = makeIndicator();
      findFirst.mockResolvedValueOnce(null);
      insertReturning.mockResolvedValueOnce([indicator]);
      const result = await IndicatorsService.create({
        name: "Test Indicator",
        slug: "test-indicator",
        categoria: "metas_comerciais",
        direcao: "crescente",
        periodicidade: "mensal",
        metodoConsolidacao: "acumulado",
        unidadeMedida: "inteiro",
      });
      expect(result).toEqual(indicator);
    });
  });

  describe("update", () => {
    test("returns 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await IndicatorsService.update("bad-id", { name: "New Name" });
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator not found" } });
    });

    test("returns 409 when slug is taken by another indicator", async () => {
      findFirst.mockResolvedValueOnce({ id: "indicator-1" }); // exists
      findFirst.mockResolvedValueOnce({ id: "indicator-2" }); // slug conflict
      const result = await IndicatorsService.update("indicator-1", { slug: "other-slug" });
      expect(result).toMatchObject({ code: 409, response: { message: "Slug already in use" } });
    });

    test("updates indicator when valid", async () => {
      const updated = makeIndicator({ name: "Updated" });
      findFirst.mockResolvedValueOnce({ id: "indicator-1" }); // exists
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await IndicatorsService.update("indicator-1", { name: "Updated" })).toEqual(updated);
    });
  });

  describe("remove", () => {
    test("returns 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await IndicatorsService.remove("bad-id");
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator not found" } });
    });

    test("deletes indicator and returns { deleted: true }", async () => {
      findFirst.mockResolvedValueOnce({ id: "indicator-1" });
      expect(await IndicatorsService.remove("indicator-1")).toEqual({ deleted: true });
    });
  });
});
