import { status } from "elysia";
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import { modules, groupModules, userGroups } from "@/db/schema";

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
      .innerJoin(groupModules, eq(groupModules.moduleId, modules.id))
      .innerJoin(userGroups, eq(userGroups.groupId, groupModules.groupId))
      .where(eq(userGroups.userId, userId));
  }
}
