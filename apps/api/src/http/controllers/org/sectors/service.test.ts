import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: { sectors: { findMany, findFirst } },
    insert: mock(() => ({
      values: mock(() => ({ returning: insertReturning })),
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({ returning: updateReturning })),
      })),
    })),
    delete: mock(() => ({
      where: mock(() => Promise.resolve()),
    })),
  },
}));

import { SectorsService } from "./service";
import { makeSector } from "@/tests/helpers/fixtures";

describe("SectorsService", () => {
  describe("findAll", () => {
    test("returns sectors with areas relation", async () => {
      const sectors = [makeSector(), makeSector({ id: "sector-2" })];
      findMany.mockResolvedValueOnce(sectors);
      expect(await SectorsService.findAll()).toEqual(sectors);
    });

    test("returns empty array when none exist", async () => {
      findMany.mockResolvedValueOnce([]);
      expect(await SectorsService.findAll()).toEqual([]);
    });
  });

  describe("findById", () => {
    test("returns sector with areas when found", async () => {
      const sector = makeSector();
      findFirst.mockResolvedValueOnce(sector);
      expect(await SectorsService.findById("sector-1")).toEqual(sector);
    });

    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await SectorsService.findById("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });
  });

  describe("create", () => {
    test("inserts and returns created sector", async () => {
      const sector = makeSector();
      insertReturning.mockResolvedValueOnce([sector]);
      expect(await SectorsService.create({ name: "Test Sector" })).toEqual(sector);
    });
  });

  describe("update", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await SectorsService.update("non-existent", { name: "New" });
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });

    test("updates and returns updated sector", async () => {
      const updated = makeSector({ name: "Updated" });
      findFirst.mockResolvedValueOnce({ id: "sector-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await SectorsService.update("sector-1", { name: "Updated" })).toEqual(updated);
    });
  });

  describe("toggle", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await SectorsService.toggle("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });

    test("returns updated sector with flipped isActive", async () => {
      const toggled = makeSector({ isActive: false });
      findFirst.mockResolvedValueOnce({ id: "sector-1" });
      updateReturning.mockResolvedValueOnce([toggled]);
      expect(await SectorsService.toggle("sector-1")).toEqual(toggled);
    });
  });

  describe("remove", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await SectorsService.remove("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      findFirst.mockResolvedValueOnce({ id: "sector-1" });
      expect(await SectorsService.remove("sector-1")).toEqual({ deleted: true });
    });
  });
});
