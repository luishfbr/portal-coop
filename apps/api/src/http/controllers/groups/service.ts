import { status } from "elysia";
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import { groups, groupModules, userGroups, modules } from "@/db/schema";
import { users } from "@/db/schema/auth-schema";
import type { CreateGroup, UpdateGroup } from "./model";

export abstract class GroupsService {
  static findAll() {
    return db.query.groups.findMany();
  }

  static async create(data: CreateGroup) {
    const [group] = await db.insert(groups).values(data).returning();
    return group;
  }

  static async update(id: string, data: UpdateGroup) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    const [updated] = await db
      .update(groups)
      .set(data)
      .where(eq(groups.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    await db.delete(groups).where(eq(groups.id, id));
    return { deleted: true };
  }

  static async findModules(groupId: string) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    return db
      .selectDistinct(getTableColumns(modules))
      .from(modules)
      .innerJoin(groupModules, eq(groupModules.moduleId, modules.id))
      .where(eq(groupModules.groupId, groupId));
  }

  static async setModules(groupId: string, moduleIds: string[]) {
    const exists = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Group not found" });

    return db.transaction(async (tx) => {
      await tx.delete(groupModules).where(eq(groupModules.groupId, groupId));
      if (moduleIds.length > 0) {
        await tx
          .insert(groupModules)
          .values(moduleIds.map((moduleId) => ({ groupId, moduleId })));
      }
      return { updated: true };
    });
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
