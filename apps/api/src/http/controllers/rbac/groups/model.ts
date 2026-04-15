import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { groups } from "@/db/schema";

const _insert = createInsertSchema(groups, {
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

const _update = createUpdateSchema(groups, {
  name: z.string().min(2).max(100),
  description: z.string().max(500).nullish(),
});

const _select = createSelectSchema(groups);

export const GroupModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
};

export type CreateGroup = z.infer<typeof GroupModel.create>;
export type UpdateGroup = z.infer<typeof GroupModel.update>;
export type GroupResponse = z.infer<typeof GroupModel.response>;
