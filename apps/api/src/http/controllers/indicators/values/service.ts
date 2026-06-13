import { status } from "elysia";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { indicators, indicatorValues } from "@/db/schema";
import type { CreateIndicatorValue, UpdateIndicatorValue } from "./model";

export abstract class ValuesService {
  static async findByIndicator(
    indicatorId: string,
    filters: { year?: number; type?: "realizado" | "meta" },
  ) {
    const exists = await db.query.indicators.findFirst({
      where: eq(indicators.id, indicatorId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Indicator not found" });

    const conditions = [eq(indicatorValues.indicatorId, indicatorId)];

    if (filters.year) {
      conditions.push(
        gte(indicatorValues.referenceDate, `${filters.year}-01-01`),
        lte(indicatorValues.referenceDate, `${filters.year}-12-31`),
      );
    }

    if (filters.type) {
      conditions.push(eq(indicatorValues.type, filters.type));
    }

    return db.query.indicatorValues.findMany({
      where: and(...conditions),
      orderBy: [asc(indicatorValues.referenceDate)],
    });
  }

  static async create(indicatorId: string, data: CreateIndicatorValue) {
    const exists = await db.query.indicators.findFirst({
      where: eq(indicators.id, indicatorId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Indicator not found" });

    const duplicate = await db.query.indicatorValues.findFirst({
      where: and(
        eq(indicatorValues.indicatorId, indicatorId),
        eq(indicatorValues.type, data.type),
        eq(indicatorValues.referenceDate, data.referenceDate),
      ),
      columns: { id: true },
    });
    if (duplicate)
      return status(409, {
        message: "A value of this type already exists for this reference date",
      });

    const [item] = await db
      .insert(indicatorValues)
      .values({ ...data, indicatorId, value: String(data.value) })
      .returning();
    return item;
  }

  static async update(
    indicatorId: string,
    valueId: string,
    data: UpdateIndicatorValue,
  ) {
    const exists = await db.query.indicatorValues.findFirst({
      where: and(
        eq(indicatorValues.id, valueId),
        eq(indicatorValues.indicatorId, indicatorId),
      ),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Indicator value not found" });

    const updateData = {
      ...data,
      ...(data.value !== undefined ? { value: String(data.value) } : {}),
    };

    const [updated] = await db
      .update(indicatorValues)
      .set(updateData)
      .where(
        and(
          eq(indicatorValues.id, valueId),
          eq(indicatorValues.indicatorId, indicatorId),
        ),
      )
      .returning();
    return updated;
  }

  static async remove(indicatorId: string, valueId: string) {
    const exists = await db.query.indicatorValues.findFirst({
      where: and(
        eq(indicatorValues.id, valueId),
        eq(indicatorValues.indicatorId, indicatorId),
      ),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Indicator value not found" });

    await db
      .delete(indicatorValues)
      .where(
        and(
          eq(indicatorValues.id, valueId),
          eq(indicatorValues.indicatorId, indicatorId),
        ),
      );
    return { deleted: true };
  }
}
