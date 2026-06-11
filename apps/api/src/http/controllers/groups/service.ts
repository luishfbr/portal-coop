import { status } from "elysia";
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import { groups, permissions, groupPermissions, userGroups, modules } from "@/db/schema";
import { users } from "@/db/schema/auth-schema";

export abstract class GroupsService {
  static findAll() {
    return db.query.groups.findMany();
  }

  static async findPermissions(groupId: string) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    return db
      .select({ ...getTableColumns(permissions), moduleSlug: modules.slug })
      .from(permissions)
      .innerJoin(modules, eq(modules.id, permissions.moduleId))
      .innerJoin(groupPermissions, eq(groupPermissions.permissionId, permissions.id))
      .where(eq(groupPermissions.groupId, groupId));
  }

  static async findUsers(groupId: string) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .innerJoin(userGroups, eq(userGroups.userId, users.id))
      .where(eq(userGroups.groupId, groupId));
  }

  static async setUsers(groupId: string, userIds: string[]) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    return db.transaction(async (tx) => {
      await tx.delete(userGroups).where(eq(userGroups.groupId, groupId));
      if (userIds.length > 0) {
        await tx
          .insert(userGroups)
          .values(userIds.map((userId) => ({ groupId, userId })));
      }
      return { updated: true };
    });
  }
}
