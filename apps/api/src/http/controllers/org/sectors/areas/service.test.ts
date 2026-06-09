import { describe, test, expect, mock } from "bun:test";

const sectorFindFirst = mock(() => Promise.resolve(null));
const areaFindMany = mock(() => Promise.resolve([]));
const areaFindFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      sectors: { findFirst: sectorFindFirst },
      areas: { findMany: areaFindMany, findFirst: areaFindFirst },
    },
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

import { AreasService } from "./service";
import { makeArea } from "@/tests/helpers/fixtures";

describe("AreasService", () => {
  describe("findBySector", () => {
    test("returns status 404 when sector not found", async () => {
      sectorFindFirst.mockResolvedValueOnce(null);
      const result = await AreasService.findBySector("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });

    test("returns areas when sector exists", async () => {
      const areas = [makeArea(), makeArea({ id: "area-2" })];
      sectorFindFirst.mockResolvedValueOnce({ id: "sector-1" });
      areaFindMany.mockResolvedValueOnce(areas);
      expect(await AreasService.findBySector("sector-1")).toEqual(areas);
    });

    test("returns empty array when sector has no areas", async () => {
      sectorFindFirst.mockResolvedValueOnce({ id: "sector-1" });
      areaFindMany.mockResolvedValueOnce([]);
      expect(await AreasService.findBySector("sector-1")).toEqual([]);
    });
  });

  describe("create", () => {
    test("returns status 404 when sector not found", async () => {
      sectorFindFirst.mockResolvedValueOnce(null);
      const result = await AreasService.create("non-existent", { name: "Area" });
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });

    test("inserts area with sectorId and returns created area", async () => {
      const area = makeArea();
      sectorFindFirst.mockResolvedValueOnce({ id: "sector-1" });
      insertReturning.mockResolvedValueOnce([area]);
      expect(await AreasService.create("sector-1", { name: "Test Area" })).toEqual(area);
    });
  });

  describe("update", () => {
    test("returns status 404 when area not found or does not belong to sector", async () => {
      areaFindFirst.mockResolvedValueOnce(null);
      const result = await AreasService.update("sector-1", "non-existent", { name: "New" });
      expect(result).toMatchObject({ code: 404, response: { message: "Area not found" } });
    });

    test("updates and returns updated area", async () => {
      const updated = makeArea({ name: "Updated" });
      areaFindFirst.mockResolvedValueOnce({ id: "area-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await AreasService.update("sector-1", "area-1", { name: "Updated" })).toEqual(updated);
    });
  });

  describe("toggle", () => {
    test("returns status 404 when area not found under that sector", async () => {
      areaFindFirst.mockResolvedValueOnce(null);
      const result = await AreasService.toggle("sector-1", "non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Area not found" } });
    });

    test("flips isActive and returns updated area", async () => {
      const toggled = makeArea({ isActive: false });
      areaFindFirst.mockResolvedValueOnce({ id: "area-1" });
      updateReturning.mockResolvedValueOnce([toggled]);
      expect(await AreasService.toggle("sector-1", "area-1")).toEqual(toggled);
    });
  });

  describe("remove", () => {
    test("returns status 404 when area not found under that sector", async () => {
      areaFindFirst.mockResolvedValueOnce(null);
      const result = await AreasService.remove("sector-1", "non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Area not found" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      areaFindFirst.mockResolvedValueOnce({ id: "area-1" });
      expect(await AreasService.remove("sector-1", "area-1")).toEqual({ deleted: true });
    });
  });
});
