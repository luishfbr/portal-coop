import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { permissions } from "@/db/schema";
import type { CreatePermission, UpdatePermission } from "./model";

export abstract class PermissionService {
  static findAll() {
    return db.query.permissions.findMany({
      with: { module: true },
    });
  }

  static async findById(id: string) {
    const permission = await db.query.permissions.findFirst({
      where: eq(permissions.id, id),
      with: { module: true },
    });

    if (!permission) return status(404, "Permission not found");
    return permission;
  }

  static findByModule(moduleId: string) {
    return db.query.permissions.findMany({
      where: eq(permissions.moduleId, moduleId),
      with: { module: true },
    });
  }

  static async create(data: CreatePermission) {
    const [permission] = await db.insert(permissions).values(data).returning();
    return permission;
  }

  static async update(id: string, data: UpdatePermission) {
    const exists = await db.query.permissions.findFirst({
      where: eq(permissions.id, id),
      columns: { id: true },
    });

    if (!exists) return status(404, "Permission not found");

    const [updated] = await db
      .update(permissions)
      .set(data)
      .where(eq(permissions.id, id))
      .returning();

    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.permissions.findFirst({
      where: eq(permissions.id, id),
      columns: { id: true },
    });

    if (!exists) return status(404, "Permission not found");

    await db.delete(permissions).where(eq(permissions.id, id));
    return { deleted: true };
  }
}
