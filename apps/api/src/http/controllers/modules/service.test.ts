import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));
const returning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      modules: { findMany, findFirst },
    },
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({ returning })),
      })),
    })),
  },
}));

import { ModulesService } from "./service";
import { makeModule } from "@/tests/helpers/fixtures";

describe("ModulesService", () => {
  describe("findAll", () => {
    test("returns array of modules", async () => {
      const modules = [makeModule(), makeModule({ id: "module-2" })];
      findMany.mockResolvedValueOnce(modules);
      expect(await ModulesService.findAll()).toEqual(modules);
    });

    test("returns empty array when no modules exist", async () => {
      findMany.mockResolvedValueOnce([]);
      expect(await ModulesService.findAll()).toEqual([]);
    });
  });

  describe("findActive", () => {
    test("returns only active modules", async () => {
      const active = [makeModule({ isActive: true })];
      findMany.mockResolvedValueOnce(active);
      expect(await ModulesService.findActive()).toEqual(active);
    });
  });

  describe("toggle", () => {
    test("returns status 404 when module not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await ModulesService.toggle("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Module not found" } });
    });

    test("returns updated module when found", async () => {
      const updated = makeModule({ isActive: false });
      findFirst.mockResolvedValueOnce(makeModule());
      returning.mockResolvedValueOnce([updated]);
      expect(await ModulesService.toggle("module-1")).toEqual(updated);
    });
  });
});
