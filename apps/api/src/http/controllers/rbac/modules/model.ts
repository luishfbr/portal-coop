import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { modules } from "@/db/schema";

const _insert = createInsertSchema(modules, {
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

const _update = createUpdateSchema(modules, {
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

const _select = createSelectSchema(modules);

export const ModuleModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
};

export type CreateModule = z.infer<typeof ModuleModel.create>;
export type UpdateModule = z.infer<typeof ModuleModel.update>;
export type ModuleResponse = z.infer<typeof ModuleModel.response>;
