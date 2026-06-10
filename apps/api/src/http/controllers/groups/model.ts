import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { groups } from "@/db/schema";
import { modules } from "@/db/schema";

const _insert = createInsertSchema(groups, {
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
});

const _update = createUpdateSchema(groups, {
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
});

const _select = createSelectSchema(groups);
const _moduleSelect = createSelectSchema(modules);

export const GroupsModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  moduleResponse: _moduleSelect,
  userResponse: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string().nullable(),
  }),
  setModulesBody: z.object({ moduleIds: z.array(z.string()) }),
  setUsersBody: z.object({ userIds: z.array(z.string()) }),
  params: z.object({ id: z.string() }),
  updatedResponse: z.object({ updated: z.boolean() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateGroup = z.infer<typeof GroupsModel.create>;
export type UpdateGroup = z.infer<typeof GroupsModel.update>;
export type GroupResponse = z.infer<typeof GroupsModel.response>;
