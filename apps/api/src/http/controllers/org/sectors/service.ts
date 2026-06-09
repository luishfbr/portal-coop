import { status } from "elysia";
import { eq, not } from "drizzle-orm";
import { db } from "@/db/client";
import { sectors } from "@/db/schema";
import type { CreateSector, UpdateSector } from "./model";

export abstract class SectorsService {
  static findAll() {
    return db.query.sectors.findMany({
      with: { areas: true },
    });
  }

  static async findById(id: string) {
    const item = await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
      with: { areas: true },
    });
    if (!item) return status(404, { message: "Sector not found" });
    return item;
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

  static async toggle(id: string) {
    const exists = await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Sector not found" });

    const [updated] = await db
      .update(sectors)
      .set({ isActive: not(sectors.isActive) })
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

    await db.delete(sectors).where(eq(sectors.id, id));
    return { deleted: true };
  }
}
