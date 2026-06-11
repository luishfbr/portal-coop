import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { groups, permissions } from "@/db/schema";

const _select = createSelectSchema(groups);
const _permissionSelect = createSelectSchema(permissions);

export const GroupsModel = {
  response: _select,
  permissionResponse: _permissionSelect.extend({ moduleSlug: z.string() }),
  userResponse: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string().nullable(),
  }),
  setUsersBody: z.object({ userIds: z.array(z.string()) }),
  params: z.object({ id: z.string() }),
  updatedResponse: z.object({ updated: z.boolean() }),
  errorResponse: z.object({ message: z.string() }),
};

export type GroupResponse = z.infer<typeof GroupsModel.response>;
