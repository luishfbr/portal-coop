import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userProfiles, agencies, sectors, areas, jobFunctions } from "@/db/schema";
import { users } from "@/db/schema/auth-schema";
import type { UpsertUserProfile } from "./model";

export abstract class UserProfilesService {
  static async findByUser(userId: string) {
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });
    if (!userExists) return status(404, { message: "User not found" });

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
      with: { agency: true, sector: true, area: true, jobFunction: true },
    });

    return profile ?? null;
  }

  static async upsert(userId: string, data: UpsertUserProfile) {
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });
    if (!userExists) return status(404, { message: "User not found" });

    return db.transaction(async (tx) => {
      if (data.agencyId) {
        const agency = await tx.query.agencies.findFirst({
          where: eq(agencies.id, data.agencyId),
          columns: { id: true },
        });
        if (!agency) return status(422, { message: "Agency not found" });
      }

      if (data.sectorId) {
        const sector = await tx.query.sectors.findFirst({
          where: eq(sectors.id, data.sectorId),
          columns: { id: true },
        });
        if (!sector) return status(422, { message: "Sector not found" });
      }

      if (data.areaId) {
        const area = await tx.query.areas.findFirst({
          where: eq(areas.id, data.areaId),
          columns: { id: true, sectorId: true },
        });
        if (!area) return status(422, { message: "Area not found" });

        if (data.sectorId && area.sectorId !== data.sectorId) {
          return status(422, { message: "Area does not belong to the given sector" });
        }
      }

      if (data.jobFunctionId) {
        const jobFunction = await tx.query.jobFunctions.findFirst({
          where: eq(jobFunctions.id, data.jobFunctionId),
          columns: { id: true },
        });
        if (!jobFunction) return status(422, { message: "Job function not found" });
      }

      const existing = await tx.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
        columns: { id: true },
      });

      if (existing) {
        const [updated] = await tx
          .update(userProfiles)
          .set(data)
          .where(eq(userProfiles.userId, userId))
          .returning();
        return updated;
      }

      const [created] = await tx
        .insert(userProfiles)
        .values({ userId, ...data })
        .returning();
      return created;
    });
  }
}
