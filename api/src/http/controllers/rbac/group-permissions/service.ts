import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { groupPermissions } from "@/db/schema";
import type { CreateGroupPermission } from "./model";

export abstract class GroupPermissionService {
  static findAll() {
    return db.query.groupPermissions.findMany({
      with: {
        group: true,
        permission: {
          with: { module: true },
        },
      },
    });
  }

  static findByGroup(groupId: string) {
    return db.query.groupPermissions.findMany({
      where: eq(groupPermissions.groupId, groupId),
      with: {
        permission: {
          with: { module: true },
        },
      },
    });
  }

  static async create(data: CreateGroupPermission) {
    const [groupPermission] = await db
      .insert(groupPermissions)
      .values(data)
      .returning();
    return groupPermission;
  }

  static async remove(id: string) {
    const exists = await db.query.groupPermissions.findFirst({
      where: eq(groupPermissions.id, id),
      columns: { id: true },
    });

    if (!exists) return status(404, "Group permission not found");

    await db.delete(groupPermissions).where(eq(groupPermissions.id, id));
    return { deleted: true };
  }
}
