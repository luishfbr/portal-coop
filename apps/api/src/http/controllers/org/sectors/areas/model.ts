import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { areas } from "@/db/schema";

const _insert = createInsertSchema(areas, {
  name: z.string().trim().min(2).max(100),
});

const _update = createUpdateSchema(areas, {
  name: z.string().trim().min(2).max(100),
});

const _select = createSelectSchema(areas);

const _usersResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const AreasModel = {
  create: _insert.omit({ id: true, sectorId: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, sectorId: true, createdAt: true, updatedAt: true }),
  response: _select,
  usersResponse: _usersResponse,
  params: z.object({ id: z.string(), areaId: z.string() }),
  sectorParams: z.object({ id: z.string() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateArea = z.infer<typeof AreasModel.create>;
export type UpdateArea = z.infer<typeof AreasModel.update>;
export type AreaResponse = z.infer<typeof AreasModel.response>;
