import { status } from "elysia";
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import { modules, permissions, groupPermissions, userGroups } from "@/db/schema";

export abstract class ModulesService {
  static findAll() {
    return db.query.modules.findMany();
  }

  static async findById(id: string) {
    const item = await db.query.modules.findFirst({
      where: eq(modules.id, id),
    });

    if (!item) return status(404, { message: "Module not found" });
    return item;
  }

  static findActive(userId: string) {
    return db
      .selectDistinct(getTableColumns(modules))
      .from(modules)
      .innerJoin(permissions, eq(permissions.moduleId, modules.id))
      .innerJoin(groupPermissions, eq(groupPermissions.permissionId, permissions.id))
      .innerJoin(userGroups, eq(userGroups.groupId, groupPermissions.groupId))
      .where(eq(userGroups.userId, userId));
  }

  static async findMyPermissions(userId: string): Promise<Record<string, string[]>> {
    const rows = await db
      .selectDistinct({
        moduleSlug: modules.slug,
        permissionSlug: permissions.slug,
      })
      .from(permissions)
      .innerJoin(modules, eq(modules.id, permissions.moduleId))
      .innerJoin(groupPermissions, eq(groupPermissions.permissionId, permissions.id))
      .innerJoin(userGroups, eq(userGroups.groupId, groupPermissions.groupId))
      .where(eq(userGroups.userId, userId));

    return rows.reduce<Record<string, string[]>>((acc, { moduleSlug, permissionSlug }) => {
      (acc[moduleSlug] ??= []).push(permissionSlug);
      return acc;
    }, {});
  }
}
