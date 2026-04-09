import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userGroups } from "@/db/schema";

const _insert = createInsertSchema(userGroups);
const _select = createSelectSchema(userGroups);

export const UserGroupModel = {
  create: _insert.omit({ id: true, createdAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
  groupParams: z.object({ groupId: z.string() }),
  userParams: z.object({ userId: z.string() }),
};

export type CreateUserGroup = z.infer<typeof UserGroupModel.create>;
export type UserGroupResponse = z.infer<typeof UserGroupModel.response>;
