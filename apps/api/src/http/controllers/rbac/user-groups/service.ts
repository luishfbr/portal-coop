import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userGroups } from "@/db/schema";
import type { CreateUserGroup } from "./model";

export abstract class UserGroupService {
  static findByGroup(groupId: string) {
    return db.query.userGroups.findMany({
      where: eq(userGroups.groupId, groupId),
      with: { user: true },
    });
  }

  static findByUser(userId: string) {
    return db.query.userGroups.findMany({
      where: eq(userGroups.userId, userId),
      with: {
        group: {
          with: {
            groupPermissions: {
              with: {
                permission: {
                  with: { module: true },
                },
              },
            },
          },
        },
      },
    });
  }

  static async create(data: CreateUserGroup) {
    const [userGroup] = await db.insert(userGroups).values(data).returning();
    return userGroup;
  }

  static async remove(id: string) {
    const exists = await db.query.userGroups.findFirst({
      where: eq(userGroups.id, id),
      columns: { id: true },
    });

    if (!exists) return status(404, "User group not found");

    await db.delete(userGroups).where(eq(userGroups.id, id));
    return { deleted: true };
  }
}
