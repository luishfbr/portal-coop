import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { agencies, userProfiles } from "@/db/schema";
import type { CreateAgency, UpdateAgency } from "./model";

export abstract class AgenciesService {
  static async findAll() {
    const items = await db.query.agencies.findMany({
      with: { userProfiles: { columns: { id: true } } },
    });
    return items.map(({ userProfiles: profiles, ...rest }) => ({
      ...rest,
      userCount: profiles.length,
    }));
  }

  static async findById(id: string) {
    const item = await db.query.agencies.findFirst({
      where: eq(agencies.id, id),
    });
    if (!item) return status(404, { message: "Agency not found" });
    return item;
  }

  static async create(data: CreateAgency) {
    const [item] = await db.insert(agencies).values(data).returning();
    return item;
  }

  static async update(id: string, data: UpdateAgency) {
    const exists = await db.query.agencies.findFirst({
      where: eq(agencies.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Agency not found" });

    const [updated] = await db
      .update(agencies)
      .set(data)
      .where(eq(agencies.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.agencies.findFirst({
      where: eq(agencies.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Agency not found" });

    const linked = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.agencyId, id),
      columns: { id: true },
    });
    if (linked) return status(409, { message: "Agency has linked users and cannot be deleted" });

    await db.delete(agencies).where(eq(agencies.id, id));
    return { deleted: true };
  }
}
