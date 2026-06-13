import { status } from "elysia";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { indicators } from "@/db/schema";
import type { CreateIndicator, UpdateIndicator } from "./model";

export abstract class IndicatorsService {
  static findAll() {
    return db.query.indicators.findMany({
      with: {
        sector: { columns: { id: true, name: true } },
      },
    });
  }

  static async findById(id: string) {
    const item = await db.query.indicators.findFirst({
      where: eq(indicators.id, id),
      with: {
        sector: { columns: { id: true, name: true } },
      },
    });
    if (!item) return status(404, { message: "Indicator not found" });
    return item;
  }

  static async create(data: CreateIndicator) {
    const slugExists = await db.query.indicators.findFirst({
      where: eq(indicators.slug, data.slug),
      columns: { id: true },
    });
    if (slugExists) return status(409, { message: "Slug already in use" });

    const [item] = await db.insert(indicators).values(data).returning();
    return item;
  }

  static async update(id: string, data: UpdateIndicator) {
    const exists = await db.query.indicators.findFirst({
      where: eq(indicators.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Indicator not found" });

    if (data.slug) {
      const slugExists = await db.query.indicators.findFirst({
        where: and(eq(indicators.slug, data.slug), ne(indicators.id, id)),
        columns: { id: true },
      });
      if (slugExists) return status(409, { message: "Slug already in use" });
    }

    const [updated] = await db
      .update(indicators)
      .set(data)
      .where(eq(indicators.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.indicators.findFirst({
      where: eq(indicators.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Indicator not found" });

    await db.delete(indicators).where(eq(indicators.id, id));
    return { deleted: true };
  }
}
