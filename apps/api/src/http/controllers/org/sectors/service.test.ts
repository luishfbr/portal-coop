import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));
const userProfilesFindFirst = mock(() => Promise.resolve(null));
const areasFindMany = mock(() => Promise.resolve([]));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      sectors: { findMany, findFirst },
      userProfiles: { findFirst: userProfilesFindFirst },
      areas: { findMany: areasFindMany },
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

import { SectorsService } from "./service";
import { makeSector } from "@/tests/helpers/fixtures";

describe("SectorsService", () => {
  describe("findAll", () => {
    test("returns sectors with userCount and areas", async () => {
      const raw = [
        { ...makeSector(), userProfiles: [], areas: [] },
        { ...makeSector({ id: "sector-2" }), userProfiles: [], areas: [] },
      ];
      findMany.mockResolvedValueOnce(raw);
      const expected = [
        { ...makeSector(), userCount: 0 },
        { ...makeSector({ id: "sector-2" }), userCount: 0 },
      ];
      expect(await SectorsService.findAll()).toEqual(expected);
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

  describe("remove", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await SectorsService.remove("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Sector not found" } });
    });

    test("returns 409 when sector has direct user link", async () => {
      findFirst.mockResolvedValueOnce({ id: "sector-1" });
      userProfilesFindFirst.mockResolvedValueOnce({ id: "profile-1" });
      const result = await SectorsService.remove("sector-1");
      expect(result).toMatchObject({ code: 409, response: { message: "Sector has linked users and cannot be deleted" } });
    });

    test("returns 409 when a sector area has linked users", async () => {
      findFirst.mockResolvedValueOnce({ id: "sector-1" });
      userProfilesFindFirst.mockResolvedValueOnce(null);
      areasFindMany.mockResolvedValueOnce([{ id: "area-1" }]);
      userProfilesFindFirst.mockResolvedValueOnce({ id: "profile-1" });
      const result = await SectorsService.remove("sector-1");
      expect(result).toMatchObject({ code: 409, response: { message: "Sector has areas with linked users and cannot be deleted" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      findFirst.mockResolvedValueOnce({ id: "sector-1" });
      userProfilesFindFirst.mockResolvedValueOnce(null);
      areasFindMany.mockResolvedValueOnce([]);
      expect(await SectorsService.remove("sector-1")).toEqual({ deleted: true });
    });
  });
});
