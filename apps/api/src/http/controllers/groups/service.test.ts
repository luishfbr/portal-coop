import { describe, test, expect, mock } from "bun:test";

const groupsFindMany = mock(() => Promise.resolve([]));
const groupsFindFirst = mock(() => Promise.resolve(null));

// select chain: supports up to 2 innerJoins (.from().innerJoin().innerJoin().where())
const selectWhere = mock(() => Promise.resolve([]));
const selectJoin2 = mock(() => ({ where: selectWhere }));
const selectJoin1 = mock(() => ({ innerJoin: selectJoin2, where: selectWhere }));
const selectFrom = mock(() => ({ innerJoin: selectJoin1 }));
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
    select: selectFn,
    transaction,
  },
}));

import { GroupsService } from "./service";
import { makeGroup, makePermission, makeUser } from "@/tests/helpers/fixtures";

describe("GroupsService", () => {
  describe("findAll", () => {
    test("returns all groups", async () => {
      const groups = [makeGroup(), makeGroup({ id: "group-2" })];
      groupsFindMany.mockResolvedValueOnce(groups);
      expect(await GroupsService.findAll()).toEqual(groups);
    });
  });

  describe("findPermissions", () => {
    test("returns 404 when group not found", async () => {
      groupsFindFirst.mockResolvedValueOnce(null);
      const result = await GroupsService.findPermissions("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "Group not found" } });
    });

    test("returns permissions with moduleSlug for group", async () => {
      const perms = [{ ...makePermission(), moduleSlug: "test-module" }];
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      selectWhere.mockResolvedValueOnce(perms);
      expect(await GroupsService.findPermissions("group-1")).toEqual(perms);
    });

    test("returns empty array when group has no permissions", async () => {
      groupsFindFirst.mockResolvedValueOnce({ id: "group-1" });
      selectWhere.mockResolvedValueOnce([]);
      expect(await GroupsService.findPermissions("group-1")).toEqual([]);
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
