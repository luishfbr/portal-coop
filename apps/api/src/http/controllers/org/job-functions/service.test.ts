import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));
const userProfilesFindFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      jobFunctions: { findMany, findFirst },
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

import { JobFunctionsService } from "./service";
import { makeJobFunction } from "@/tests/helpers/fixtures";

describe("JobFunctionsService", () => {
  describe("findAll", () => {
    test("returns all job functions with userCount", async () => {
      const raw = [
        { ...makeJobFunction(), userProfiles: [] },
        { ...makeJobFunction({ id: "jf-2" }), userProfiles: [] },
      ];
      findMany.mockResolvedValueOnce(raw);
      const expected = [
        { ...makeJobFunction(), userCount: 0 },
        { ...makeJobFunction({ id: "jf-2" }), userCount: 0 },
      ];
      expect(await JobFunctionsService.findAll()).toEqual(expected);
    });

    test("returns empty array when none exist", async () => {
      findMany.mockResolvedValueOnce([]);
      expect(await JobFunctionsService.findAll()).toEqual([]);
    });
  });

  describe("findById", () => {
    test("returns job function when found", async () => {
      const jf = makeJobFunction();
      findFirst.mockResolvedValueOnce(jf);
      expect(await JobFunctionsService.findById("jf-1")).toEqual(jf);
    });

    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await JobFunctionsService.findById("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Job function not found" } });
    });
  });

  describe("create", () => {
    test("inserts and returns the created job function", async () => {
      const jf = makeJobFunction();
      insertReturning.mockResolvedValueOnce([jf]);
      expect(await JobFunctionsService.create({ name: "Test" })).toEqual(jf);
    });
  });

  describe("update", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await JobFunctionsService.update("non-existent", { name: "New" });
      expect(result).toMatchObject({ code: 404, response: { message: "Job function not found" } });
    });

    test("updates and returns updated job function", async () => {
      const updated = makeJobFunction({ name: "Updated" });
      findFirst.mockResolvedValueOnce({ id: "jf-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await JobFunctionsService.update("jf-1", { name: "Updated" })).toEqual(updated);
    });
  });

  describe("remove", () => {
    test("returns status 404 when not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await JobFunctionsService.remove("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Job function not found" } });
    });

    test("returns 409 when users are linked", async () => {
      findFirst.mockResolvedValueOnce({ id: "jf-1" });
      userProfilesFindFirst.mockResolvedValueOnce({ id: "profile-1" });
      const result = await JobFunctionsService.remove("jf-1");
      expect(result).toMatchObject({ code: 409, response: { message: "Job function has linked users and cannot be deleted" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      findFirst.mockResolvedValueOnce({ id: "jf-1" });
      userProfilesFindFirst.mockResolvedValueOnce(null);
      expect(await JobFunctionsService.remove("jf-1")).toEqual({ deleted: true });
    });
  });
});
