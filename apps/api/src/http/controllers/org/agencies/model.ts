import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { agencies } from "@/db/schema";

const _insert = createInsertSchema(agencies, {
  name: z.string().trim().min(2).max(100),
});

const _update = createUpdateSchema(agencies, {
  name: z.string().trim().min(2).max(100),
});

const _select = createSelectSchema(agencies);

const _selectWithCount = _select.extend({ userCount: z.number() });

export const AgenciesModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  responseWithCount: _selectWithCount,
  params: z.object({ id: z.string() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateAgency = z.infer<typeof AgenciesModel.create>;
export type UpdateAgency = z.infer<typeof AgenciesModel.update>;
export type AgencyResponse = z.infer<typeof AgenciesModel.response>;
