import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));
const userProfilesFindFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      agencies: { findMany, findFirst },
      userProfiles: { findFirst: userProfilesFindFirst },
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

import { AgenciesService } from "./service";
import { makeAgency } from "@/tests/helpers/fixtures";

describe("AgenciesService", () => {
  describe("findAll", () => {
    test("returns all agencies with userCount", async () => {
      const raw = [
        { ...makeAgency(), userProfiles: [] },
        { ...makeAgency({ id: "agency-2" }), userProfiles: [] },
      ];
      findMany.mockResolvedValueOnce(raw);
      const expected = [
        { ...makeAgency(), userCount: 0 },
        { ...makeAgency({ id: "agency-2" }), userCount: 0 },
      ];
      expect(await AgenciesService.findAll()).toEqual(expected);
    });

    test("returns empty array when none exist", async () => {
      findMany.mockResolvedValueOnce([]);
      expect(await AgenciesService.findAll()).toEqual([]);
    });
  });

  describe("findById", () => {
    test("returns agency when found", async () => {
      const agency = makeAgency();
      findFirst.mockResolvedValueOnce(agency);
      expect(await AgenciesService.findById("agency-1")).toEqual(agency);
    });

    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await AgenciesService.findById("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Agency not found" } });
    });
  });

  describe("create", () => {
    test("inserts and returns the created agency", async () => {
      const agency = makeAgency();
      insertReturning.mockResolvedValueOnce([agency]);
      expect(await AgenciesService.create({ name: "Test Agency" })).toEqual(agency);
    });
  });

  describe("update", () => {
    test("returns status 404 when agency not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await AgenciesService.update("non-existent", { name: "New" });
      expect(result).toMatchObject({ code: 404, response: { message: "Agency not found" } });
    });

    test("updates and returns updated agency", async () => {
      const updated = makeAgency({ name: "Updated" });
      findFirst.mockResolvedValueOnce({ id: "agency-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await AgenciesService.update("agency-1", { name: "Updated" })).toEqual(updated);
    });
  });

  describe("remove", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await AgenciesService.remove("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Agency not found" } });
    });

    test("returns 409 when users are linked", async () => {
      findFirst.mockResolvedValueOnce({ id: "agency-1" });
      userProfilesFindFirst.mockResolvedValueOnce({ id: "profile-1" });
      const result = await AgenciesService.remove("agency-1");
      expect(result).toMatchObject({ code: 409, response: { message: "Agency has linked users and cannot be deleted" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      findFirst.mockResolvedValueOnce({ id: "agency-1" });
      userProfilesFindFirst.mockResolvedValueOnce(null);
      expect(await AgenciesService.remove("agency-1")).toEqual({ deleted: true });
    });
  });
});
