import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { jobFunctions, userProfiles } from "@/db/schema";
import type { CreateJobFunction, UpdateJobFunction } from "./model";

export abstract class JobFunctionsService {
  static async findAll() {
    const items = await db.query.jobFunctions.findMany({
      with: { userProfiles: { columns: { id: true } } },
    });
    return items.map(({ userProfiles, ...rest }) => ({
      ...rest,
      userCount: userProfiles.length,
    }));
  }

  static async findById(id: string) {
    const item = await db.query.jobFunctions.findFirst({
      where: eq(jobFunctions.id, id),
    });
    if (!item) return status(404, { message: "Job function not found" });
    return item;
  }

  static async create(data: CreateJobFunction) {
    const [item] = await db.insert(jobFunctions).values(data).returning();
    return item;
  }

  static async update(id: string, data: UpdateJobFunction) {
    const exists = await db.query.jobFunctions.findFirst({
      where: eq(jobFunctions.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Job function not found" });

    const [updated] = await db
      .update(jobFunctions)
      .set(data)
      .where(eq(jobFunctions.id, id))
      .returning();
    return updated;
  }

  static async findUsers(id: string) {
    const exists = await db.query.jobFunctions.findFirst({
      where: eq(jobFunctions.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Job function not found" });

    const profiles = await db.query.userProfiles.findMany({
      where: eq(userProfiles.jobFunctionId, id),
      columns: { userId: true },
      with: { user: { columns: { id: true, name: true, email: true } } },
    });
    return profiles.map((p) => p.user);
  }

  static async remove(id: string) {
    const exists = await db.query.jobFunctions.findFirst({
      where: eq(jobFunctions.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Job function not found" });

    const linked = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.jobFunctionId, id),
      columns: { id: true },
    });
    if (linked) return status(409, { message: "Job function has linked users and cannot be deleted" });

    await db.delete(jobFunctions).where(eq(jobFunctions.id, id));
    return { deleted: true };
  }
}
