import { status } from "elysia";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { sectors, areas, userProfiles } from "@/db/schema";
import type { CreateSector, UpdateSector } from "./model";

export abstract class SectorsService {
  static async findAll() {
    const items = await db.query.sectors.findMany({
      with: {
        areas: {
          with: { userProfiles: { columns: { id: true } } },
        },
        userProfiles: { columns: { id: true } },
      },
    });
    return items.map(({ userProfiles: sectorProfiles, areas, ...rest }) => ({
      ...rest,
      userCount: sectorProfiles.length,
      areas: areas.map(({ userProfiles: areaProfiles, ...areaRest }) => ({
        ...areaRest,
        userCount: areaProfiles.length,
      })),
    }));
  }

  static async findById(id: string) {
    const item = await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
      with: { areas: true },
    });
    if (!item) return status(404, { message: "Sector not found" });
    return item;
  }

  static async findUsersBySector(id: string) {
    const exists = await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Sector not found" });

    const profiles = await db.query.userProfiles.findMany({
      where: eq(userProfiles.sectorId, id),
      columns: { userId: true },
      with: { user: { columns: { id: true, name: true, email: true } } },
    });
    return profiles.map((p) => p.user);
  }

  static async create(data: CreateSector) {
    const [item] = await db.insert(sectors).values(data).returning();
    return item;
  }

  static async update(id: string, data: UpdateSector) {
    const exists = await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Sector not found" });

    const [updated] = await db
      .update(sectors)
      .set(data)
      .where(eq(sectors.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Sector not found" });

    const linkedDirect = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.sectorId, id),
      columns: { id: true },
    });
    if (linkedDirect) return status(409, { message: "Sector has linked users and cannot be deleted" });

    const sectorAreas = await db.query.areas.findMany({
      where: eq(areas.sectorId, id),
      columns: { id: true },
    });
    if (sectorAreas.length > 0) {
      const areaIds = sectorAreas.map((a) => a.id);
      const linkedViaArea = await db.query.userProfiles.findFirst({
        where: inArray(userProfiles.areaId, areaIds),
        columns: { id: true },
      });
      if (linkedViaArea) return status(409, { message: "Sector has areas with linked users and cannot be deleted" });
    }

    await db.delete(sectors).where(eq(sectors.id, id));
    return { deleted: true };
  }
}
