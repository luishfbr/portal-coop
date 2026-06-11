import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));

// selectDistinct chain: supports up to 3 innerJoins (.from().innerJoin().innerJoin().innerJoin().where())
const selectDistinctWhere = mock(() => Promise.resolve([]));
const selectDistinctJoin3 = mock(() => ({ where: selectDistinctWhere }));
const selectDistinctJoin2 = mock(() => ({
  innerJoin: selectDistinctJoin3,
  where: selectDistinctWhere,
}));
const selectDistinctJoin1 = mock(() => ({
  innerJoin: selectDistinctJoin2,
  where: selectDistinctWhere,
}));
const selectDistinctFrom = mock(() => ({ innerJoin: selectDistinctJoin1 }));
const selectDistinct = mock(() => ({ from: selectDistinctFrom }));

mock.module("@/db/client", () => ({
  db: {
    query: {
      modules: { findMany, findFirst },
    },
    selectDistinct,
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

  describe("findById", () => {
    test("returns status 404 when module not found", async () => {
      findFirst.mockResolvedValueOnce(null);
      const result = await ModulesService.findById("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Module not found" } });
    });

    test("returns module when found", async () => {
      const module = makeModule();
      findFirst.mockResolvedValueOnce(module);
      expect(await ModulesService.findById("module-1")).toEqual(module);
    });
  });

  describe("findActive", () => {
    test("returns empty array when user has no group assignments", async () => {
      selectDistinctWhere.mockResolvedValueOnce([]);
      expect(await ModulesService.findActive("user-1")).toEqual([]);
    });

    test("returns accessible modules for user with groups", async () => {
      const modules = [makeModule(), makeModule({ id: "module-2" })];
      selectDistinctWhere.mockResolvedValueOnce(modules);
      expect(await ModulesService.findActive("user-1")).toEqual(modules);
    });
  });

  describe("findMyPermissions", () => {
    test("returns empty object when user has no permissions", async () => {
      selectDistinctWhere.mockResolvedValueOnce([]);
      expect(await ModulesService.findMyPermissions("user-1")).toEqual({});
    });

    test("groups permissions by module slug", async () => {
      selectDistinctWhere.mockResolvedValueOnce([
        { moduleSlug: "dashboards-internos", permissionSlug: "view" },
        { moduleSlug: "dashboards-internos", permissionSlug: "edit" },
        { moduleSlug: "relatorios", permissionSlug: "view" },
      ]);
      expect(await ModulesService.findMyPermissions("user-1")).toEqual({
        "dashboards-internos": ["view", "edit"],
        relatorios: ["view"],
      });
    });
  });
});
