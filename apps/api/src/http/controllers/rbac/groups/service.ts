import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { groups } from "@/db/schema";
import type { CreateGroup, UpdateGroup } from "./model";

export abstract class GroupService {
  static findAll() {
    return db.query.groups.findMany({
      with: {
        userGroups: {
          with: { user: true },
        },
        groupPermissions: {
          with: {
            permission: {
              with: { module: true },
            },
          },
        },
      },
    });
  }

  static async findById(id: string) {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, id),
      with: {
        userGroups: {
          with: { user: true },
        },
        groupPermissions: {
          with: {
            permission: {
              with: { module: true },
            },
          },
        },
      },
    });

    if (!group) return status(404, "Group not found");
    return group;
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

    if (!exists) return status(404, "Group not found");

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

    if (!exists) return status(404, "Group not found");

    await db.delete(groups).where(eq(groups.id, id));
    return { deleted: true };
  }
}
