import { status } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { areas, sectors, userProfiles } from "@/db/schema";
import type { CreateArea, UpdateArea } from "./model";

export abstract class AreasService {
  static async findBySector(sectorId: string) {
    const sectorExists = await db.query.sectors.findFirst({
      where: eq(sectors.id, sectorId),
      columns: { id: true },
    });
    if (!sectorExists) return status(404, { message: "Sector not found" });

    return db.query.areas.findMany({
      where: eq(areas.sectorId, sectorId),
    });
  }

  static async create(sectorId: string, data: CreateArea) {
    const sectorExists = await db.query.sectors.findFirst({
      where: eq(sectors.id, sectorId),
      columns: { id: true },
    });
    if (!sectorExists) return status(404, { message: "Sector not found" });

    const [item] = await db
      .insert(areas)
      .values({ ...data, sectorId })
      .returning();
    return item;
  }

  static async update(sectorId: string, id: string, data: UpdateArea) {
    const exists = await db.query.areas.findFirst({
      where: and(eq(areas.id, id), eq(areas.sectorId, sectorId)),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Area not found" });

    const [updated] = await db
      .update(areas)
      .set(data)
      .where(and(eq(areas.id, id), eq(areas.sectorId, sectorId)))
      .returning();
    return updated;
  }

  static async findUsersByArea(sectorId: string, id: string) {
    const exists = await db.query.areas.findFirst({
      where: and(eq(areas.id, id), eq(areas.sectorId, sectorId)),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Area not found" });

    const profiles = await db.query.userProfiles.findMany({
      where: eq(userProfiles.areaId, id),
      columns: { userId: true },
      with: { user: { columns: { id: true, name: true, email: true } } },
    });
    return profiles.map((p) => p.user);
  }

  static async remove(sectorId: string, id: string) {
    const exists = await db.query.areas.findFirst({
      where: and(eq(areas.id, id), eq(areas.sectorId, sectorId)),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Area not found" });

    const linked = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.areaId, id),
      columns: { id: true },
    });
    if (linked) return status(409, { message: "Area has linked users and cannot be deleted" });

    await db
      .delete(areas)
      .where(and(eq(areas.id, id), eq(areas.sectorId, sectorId)));
    return { deleted: true };
  }
}
