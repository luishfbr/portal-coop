import { describe, test, expect, mock } from "bun:test";

const userFindFirst = mock(() => Promise.resolve(null));
const agencyFindFirst = mock(() => Promise.resolve(null));
const sectorFindFirst = mock(() => Promise.resolve(null));
const areaFindFirst = mock(() => Promise.resolve(null));
const jobFunctionFindFirst = mock(() => Promise.resolve(null));
const profileFindFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

// txDb is the transaction context — same mocks as outer db so mockResolvedValueOnce chaining works
const txDb = {
  query: {
    users: { findFirst: userFindFirst },
    agencies: { findFirst: agencyFindFirst },
    sectors: { findFirst: sectorFindFirst },
    areas: { findFirst: areaFindFirst },
    jobFunctions: { findFirst: jobFunctionFindFirst },
    userProfiles: { findFirst: profileFindFirst },
  },
  insert: mock(() => ({
    values: mock(() => ({ returning: insertReturning })),
  })),
  update: mock(() => ({
    set: mock(() => ({
      where: mock(() => ({ returning: updateReturning })),
    })),
  })),
};

mock.module("@/db/client", () => ({
  db: {
    ...txDb,
    transaction: mock((fn: any) => fn(txDb)),
  },
}));

mock.module("@/db/schema/auth-schema", () => ({
  users: { id: "users.id" },
}));

import { UserProfilesService } from "./service";
import { makeUserProfile } from "@/tests/helpers/fixtures";

describe("UserProfilesService", () => {
  describe("findByUser", () => {
    test("returns status 404 when user not found", async () => {
      userFindFirst.mockResolvedValueOnce(null);
      const result = await UserProfilesService.findByUser("non-existent");
      expect(result).toMatchObject({ code: 404, response: { message: "User not found" } });
    });

    test("returns null when user exists but has no profile", async () => {
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      profileFindFirst.mockResolvedValueOnce(null);
      expect(await UserProfilesService.findByUser("user-1")).toBeNull();
    });

    test("returns profile with relations when both exist", async () => {
      const profile = makeUserProfile();
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      profileFindFirst.mockResolvedValueOnce(profile);
      expect(await UserProfilesService.findByUser("user-1")).toEqual(profile);
    });
  });

  describe("upsert", () => {
    test("returns status 404 when user not found", async () => {
      userFindFirst.mockResolvedValueOnce(null);
      const result = await UserProfilesService.upsert("non-existent", {});
      expect(result).toMatchObject({ code: 404, response: { message: "User not found" } });
    });

    test("returns status 422 when agencyId given and agency not found", async () => {
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      agencyFindFirst.mockResolvedValueOnce(null);
      const result = await UserProfilesService.upsert("user-1", { agencyId: "bad-agency" });
      expect(result).toMatchObject({ code: 422, response: { message: "Agency not found" } });
    });

    test("skips agency check when agencyId is null", async () => {
      const profile = makeUserProfile();
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      profileFindFirst.mockResolvedValueOnce(null);
      insertReturning.mockResolvedValueOnce([profile]);
      expect(await UserProfilesService.upsert("user-1", { agencyId: null })).toEqual(profile);
    });

    test("returns status 422 when sectorId given and sector not found", async () => {
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      sectorFindFirst.mockResolvedValueOnce(null);
      const result = await UserProfilesService.upsert("user-1", { sectorId: "bad-sector" });
      expect(result).toMatchObject({ code: 422, response: { message: "Sector not found" } });
    });

    test("returns status 422 when areaId given and area not found", async () => {
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      areaFindFirst.mockResolvedValueOnce(null);
      const result = await UserProfilesService.upsert("user-1", { areaId: "bad-area" });
      expect(result).toMatchObject({ code: 422, response: { message: "Area not found" } });
    });

    test("returns status 422 when area does not belong to given sector", async () => {
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      sectorFindFirst.mockResolvedValueOnce({ id: "sector-1" });
      areaFindFirst.mockResolvedValueOnce({ id: "area-1", sectorId: "OTHER-sector" });
      const result = await UserProfilesService.upsert("user-1", { sectorId: "sector-1", areaId: "area-1" });
      expect(result).toMatchObject({ code: 422, response: { message: "Area does not belong to the given sector" } });
    });

    test("passes when area belongs to given sector", async () => {
      const profile = makeUserProfile({ sectorId: "sector-1", areaId: "area-1" });
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      sectorFindFirst.mockResolvedValueOnce({ id: "sector-1" });
      areaFindFirst.mockResolvedValueOnce({ id: "area-1", sectorId: "sector-1" });
      profileFindFirst.mockResolvedValueOnce(null);
      insertReturning.mockResolvedValueOnce([profile]);
      expect(await UserProfilesService.upsert("user-1", { sectorId: "sector-1", areaId: "area-1" })).toEqual(profile);
    });

    test("returns status 422 when jobFunctionId given and job function not found", async () => {
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      jobFunctionFindFirst.mockResolvedValueOnce(null);
      const result = await UserProfilesService.upsert("user-1", { jobFunctionId: "bad-jf" });
      expect(result).toMatchObject({ code: 422, response: { message: "Job function not found" } });
    });

    test("inserts new profile when no existing profile (CREATE path)", async () => {
      const created = makeUserProfile();
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      profileFindFirst.mockResolvedValueOnce(null);
      insertReturning.mockResolvedValueOnce([created]);
      expect(await UserProfilesService.upsert("user-1", {})).toEqual(created);
    });

    test("updates existing profile when profile already exists (UPDATE path)", async () => {
      const updated = makeUserProfile({ agencyId: "agency-1" });
      userFindFirst.mockResolvedValueOnce({ id: "user-1" });
      agencyFindFirst.mockResolvedValueOnce({ id: "agency-1" });
      profileFindFirst.mockResolvedValueOnce({ id: "profile-1" });
      updateReturning.mockResolvedValueOnce([updated]);
      expect(await UserProfilesService.upsert("user-1", { agencyId: "agency-1" })).toEqual(updated);
    });
  });
});
