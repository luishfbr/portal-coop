import { status } from "elysia";
import { eq, not } from "drizzle-orm";
import { db } from "@/db/client";
import { jobFunctions } from "@/db/schema";
import type { CreateJobFunction, UpdateJobFunction } from "./model";

export abstract class JobFunctionsService {
  static findAll() {
    return db.query.jobFunctions.findMany();
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

  static async toggle(id: string) {
    const exists = await db.query.jobFunctions.findFirst({
      where: eq(jobFunctions.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Job function not found" });

    const [updated] = await db
      .update(jobFunctions)
      .set({ isActive: not(jobFunctions.isActive) })
      .where(eq(jobFunctions.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.jobFunctions.findFirst({
      where: eq(jobFunctions.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, { message: "Job function not found" });

    await db.delete(jobFunctions).where(eq(jobFunctions.id, id));
    return { deleted: true };
  }
}
