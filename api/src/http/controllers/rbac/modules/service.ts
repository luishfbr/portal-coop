import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { modules } from "@/db/schema";
import type { CreateModule, UpdateModule } from "./model";

export abstract class ModuleService {
  static findAll() {
    return db.query.modules.findMany({
      with: { permissions: true },
    });
  }

  static async findById(id: string) {
    const module = await db.query.modules.findFirst({
      where: eq(modules.id, id),
      with: { permissions: true },
    });

    if (!module) return status(404, "Module not found");
    return module;
  }

  static async create(data: CreateModule) {
    const [module] = await db.insert(modules).values(data).returning();
    return module;
  }

  static async update(id: string, data: UpdateModule) {
    const exists = await db.query.modules.findFirst({
      where: eq(modules.id, id),
      columns: { id: true },
    });

    if (!exists) return status(404, "Module not found");

    const [updated] = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();

    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.modules.findFirst({
      where: eq(modules.id, id),
      columns: { id: true },
    });

    if (!exists) return status(404, "Module not found");

    await db.delete(modules).where(eq(modules.id, id));
    return { deleted: true };
  }
}
