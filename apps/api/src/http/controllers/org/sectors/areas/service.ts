import { status } from "elysia";
import { and, eq, not } from "drizzle-orm";
import { db } from "@/db/client";
import { areas, sectors } from "@/db/schema";
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

  static async toggle(sectorId: string, id: string) {
    const exists = await db.query.areas.findFirst({
      where: and(eq(areas.id, id), eq(areas.sectorId, sectorId)),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Area not found" });

    const [updated] = await db
      .update(areas)
      .set({ isActive: not(areas.isActive) })
      .where(and(eq(areas.id, id), eq(areas.sectorId, sectorId)))
      .returning();
    return updated;
  }

  static async remove(sectorId: string, id: string) {
    const exists = await db.query.areas.findFirst({
      where: and(eq(areas.id, id), eq(areas.sectorId, sectorId)),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Area not found" });

    await db
      .delete(areas)
      .where(and(eq(areas.id, id), eq(areas.sectorId, sectorId)));
    return { deleted: true };
  }
}
