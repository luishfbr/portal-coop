import { describe, test, expect, mock } from "bun:test";

const groupsFindMany = mock(() => Promise.resolve([]));
const groupsFindFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

// selectDistinct chain: .from().innerJoin().where()
const selectDistinctWhere = mock(() => Promise.resolve([]));
const selectDistinctJoin = mock(() => ({ where: selectDistinctWhere }));
const selectDistinctFrom = mock(() => ({ innerJoin: selectDistinctJoin }));
const selectDistinct = mock(() => ({ from: selectDistinctFrom }));

// select chain: .from().innerJoin().where()
const selectWhere = mock(() => Promise.resolve([]));
const selectJoin = mock(() => ({ where: selectWhere }));
const selectFrom = mock(() => ({ innerJoin: selectJoin }));
const selectFn = mock(() => ({ from: selectFrom }));

// transaction mock — calls fn with a lightweight tx object
const txDeleteWhere = mock(() => Promise.resolve());
const txDelete = mock(() => ({ where: txDeleteWhere }));
const txInsertValues = mock(() => Promise.resolve([]));
const txInsert = mock(() => ({ values: txInsertValues }));
const transaction = mock(<T>(fn: (tx: unknown) => T) =>
  fn({ delete: txDelete, insert: txInsert })
);

mock.module("@/db/client", () => ({
  db: {
    query: {
      groups: { findMany: groupsFindMany, findFirst: groupsFindFirst },
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
    selectDistinct,
    select: selectFn,
    transaction,
  },
}));

import { GroupsService } from "./service";
import { makeGroup, makeModule, makeUser } from "@/tests/helpers/fixtures";

describe("GroupsService", () => {
  describe("findAll", () => {
    test("returns all groups", async () => {
      const groups = [makeGroup(), makeGroup({ id: "group-2" })];
      groupsFindMany.mockResolvedValueOnce(groups);
      expect(await GroupsService.findAll()).toEqual(groups);
    });
  });

  describe("create", () => {
    test("inserts and returns the created group", async () => {
      const group = makeGroup();
      insertReturning.mockResolvedValueOnce([group]);
      expect(await GroupsService.create({ name: "Test Group" })).toEqual(group);
    });
  });

  describe("update", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.update("non-existent", { name: "New" });
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("updates and returns updated group", async () => {
      const updated = makeGroup({ name: "Updated" });
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await GroupsService.update("group-1", { name: "Updated" })).toEqual(updated);
    });
  });

  describe("remove", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.remove("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("deletes and returns { deleted: true }", async () => {
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      expect(await GroupsService.remove("group-1")).toEqual({ deleted: true });
    });
  });

  describe("findModules", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.findModules("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("returns modules assigned to group", async () => {
      const modules = [makeModule()];
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      selectDistinctWhere.mockResolvedValueOnce(modules);
      expect(await GroupsService.findModules("group-1")).toEqual(modules);
    });
  });

  describe("setModules", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.setModules("non-existent", ["module-1"]);
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("returns { updated: true } on success", async () => {
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      expect(await GroupsService.setModules("group-1", ["module-1"])).toEqual({ updated: true });
    });

    test("returns { updated: true } when moduleIds is empty", async () => {
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      expect(await GroupsService.setModules("group-1", [])).toEqual({ updated: true });
    });
  });

  describe("findUsers", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.findUsers("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("returns users assigned to group", async () => {
      const users = [makeUser()];
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      selectWhere.mockResolvedValueOnce(users);
      expect(await GroupsService.findUsers("group-1")).toEqual(users);
    });
  });

  describe("setUsers", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.setUsers("non-existent", ["user-1"]);
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("returns { updated: true } on success", async () => {
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      expect(await GroupsService.setUsers("group-1", ["user-1"])).toEqual({ updated: true });
    });

    test("returns { updated: true } when userIds is empty", async () => {
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      expect(await GroupsService.setUsers("group-1", [])).toEqual({ updated: true });
    });
  });
});
