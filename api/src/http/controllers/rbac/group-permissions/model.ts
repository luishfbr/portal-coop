import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { groupPermissions } from "@/db/schema";

const _insert = createInsertSchema(groupPermissions);
const _select = createSelectSchema(groupPermissions);

export const GroupPermissionModel = {
  create: _insert.omit({ id: true, createdAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
  groupParams: z.object({ groupId: z.string() }),
};

export type CreateGroupPermission = z.infer<typeof GroupPermissionModel.create>;
export type GroupPermissionResponse = z.infer<typeof GroupPermissionModel.response>;
