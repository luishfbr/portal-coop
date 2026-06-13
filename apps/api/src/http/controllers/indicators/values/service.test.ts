import { describe, test, expect, mock } from "bun:test";

const indicatorFindFirst = mock(() => Promise.resolve(null));
const valuesFindMany = mock(() => Promise.resolve([]));
const valuesFindFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      indicators: { findFirst: indicatorFindFirst },
      indicatorValues: { findMany: valuesFindMany, findFirst: valuesFindFirst },
    },
    insert: mock(() => ({ values: mock(() => ({ returning: insertReturning })) })),
    update: mock(() => ({
      set: mock(() => ({ where: mock(() => ({ returning: updateReturning })) })),
    })),
    delete: mock(() => ({ where: mock(() => Promise.resolve()) })),
  },
}));

import { ValuesService } from "./service";
import { makeIndicator, makeIndicatorValue } from "@/tests/helpers/fixtures";

describe("ValuesService", () => {
  describe("findByIndicator", () => {
    test("returns 404 when indicator not found", async () => {
      indicatorFindFirst.mockResolvedValueOnce(null);
      const result = await ValuesService.findByIndicator("bad-id", {});
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator not found" } });
    });

    test("returns values when indicator exists", async () => {
      const value = makeIndicatorValue();
      indicatorFindFirst.mockResolvedValueOnce(makeIndicator());
      valuesFindMany.mockResolvedValueOnce([value]);
      expect(await ValuesService.findByIndicator("indicator-1", {})).toEqual([value]);
    });

    test("applies year and type filters", async () => {
      indicatorFindFirst.mockResolvedValueOnce(makeIndicator());
      valuesFindMany.mockResolvedValueOnce([]);
      await ValuesService.findByIndicator("indicator-1", { year: 2024, type: "meta" });
      expect(valuesFindMany).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    test("returns 404 when indicator not found", async () => {
      indicatorFindFirst.mockResolvedValueOnce(null);
      const result = await ValuesService.create("bad-id", {
        type: "realizado",
        value: 100,
        referenceDate: "2024-01-01",
      });
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator not found" } });
    });

    test("returns 409 when duplicate exists", async () => {
      indicatorFindFirst.mockResolvedValueOnce(makeIndicator());
      valuesFindFirst.mockResolvedValueOnce({ id: "value-1" });
      const result = await ValuesService.create("indicator-1", {
        type: "realizado",
        value: 100,
        referenceDate: "2024-01-01",
      });
      expect(result).toMatchObject({ code: 409 });
    });

    test("creates value when valid", async () => {
      const value = makeIndicatorValue();
      indicatorFindFirst.mockResolvedValueOnce(makeIndicator());
      valuesFindFirst.mockResolvedValueOnce(null);
      insertReturning.mockResolvedValueOnce([value]);
      expect(
        await ValuesService.create("indicator-1", {
          type: "realizado",
          value: 100,
          referenceDate: "2024-01-01",
        }),
      ).toEqual(value);
    });
  });

  describe("update", () => {
    test("returns 404 when value not found", async () => {
      valuesFindFirst.mockResolvedValueOnce(null);
      const result = await ValuesService.update("indicator-1", "bad-id", { value: 200 });
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator value not found" } });
    });

    test("updates value when valid", async () => {
      const updated = makeIndicatorValue({ value: 200 });
      valuesFindFirst.mockResolvedValueOnce({ id: "value-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await ValuesService.update("indicator-1", "value-1", { value: 200 })).toEqual(updated);
    });
  });

  describe("remove", () => {
    test("returns 404 when value not found", async () => {
      valuesFindFirst.mockResolvedValueOnce(null);
      const result = await ValuesService.remove("indicator-1", "bad-id");
      expect(result).toMatchObject({ code: 404, response: { message: "Indicator value not found" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      valuesFindFirst.mockResolvedValueOnce({ id: "value-1" });
      expect(await ValuesService.remove("indicator-1", "value-1")).toEqual({ deleted: true });
    });
  });
});
