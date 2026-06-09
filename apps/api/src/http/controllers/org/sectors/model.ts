import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { sectors, areas } from "@/db/schema";

const _insert = createInsertSchema(sectors, {
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
});

const _update = createUpdateSchema(sectors, {
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
});

const _select = createSelectSchema(sectors);

const _selectWithAreas = _select.extend({
  areas: z.array(createSelectSchema(areas)),
});

export const SectorsModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  responseWithAreas: _selectWithAreas,
  params: z.object({ id: z.string() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateSector = z.infer<typeof SectorsModel.create>;
export type UpdateSector = z.infer<typeof SectorsModel.update>;
export type SectorResponse = z.infer<typeof SectorsModel.response>;
