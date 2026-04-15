import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { permissions } from "@/db/schema";

const _insert = createInsertSchema(permissions, {
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9._-]+$/,
      "Slug must be lowercase alphanumeric with dots, hyphens or underscores (e.g. users.view)"
    ),
});

const _update = createUpdateSchema(permissions, {
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9._-]+$/),
});

const _select = createSelectSchema(permissions);

export const PermissionModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
  moduleParams: z.object({ moduleId: z.string() }),
};

export type CreatePermission = z.infer<typeof PermissionModel.create>;
export type UpdatePermission = z.infer<typeof PermissionModel.update>;
export type PermissionResponse = z.infer<typeof PermissionModel.response>;
