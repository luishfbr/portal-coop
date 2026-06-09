import { status } from "elysia";
import { eq, not } from "drizzle-orm";
import { db } from "@/db/client";
import { modules } from "@/db/schema";

export abstract class ModulesService {
  static findAll() {
    return db.query.modules.findMany();
  }

  static findActive() {
    return db.query.modules.findMany({
      where: eq(modules.isActive, true),
    });
  }

  static async toggle(id: string) {
    const existing = await db.query.modules.findFirst({
      where: eq(modules.id, id),
      columns: { id: true, isActive: true },
    });

    if (!existing) return status(404, { message: "Module not found" });

    const [updated] = await db
      .update(modules)
      .set({ isActive: not(modules.isActive) })
      .where(eq(modules.id, id))
      .returning();

    return updated;
  }
}
