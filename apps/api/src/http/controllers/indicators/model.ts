import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { indicators } from "@/db/schema";

const _insert = createInsertSchema(indicators, {
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().trim().min(1).optional(),
  defasagem: z.number().int().min(0).optional(),
});

const _update = createUpdateSchema(indicators, {
  name: z.string().trim().min(2).max(150).optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens").optional(),
  description: z.string().trim().min(1).optional(),
  defasagem: z.number().int().min(0).optional(),
});

const _select = createSelectSchema(indicators);

const _selectWithSector = _select.extend({
  sector: z.object({ id: z.string(), name: z.string() }).nullable(),
});

export const IndicatorsModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  responseWithSector: _selectWithSector,
  params: z.object({ id: z.string() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateIndicator = z.infer<typeof IndicatorsModel.create>;
export type UpdateIndicator = z.infer<typeof IndicatorsModel.update>;
export type IndicatorResponse = z.infer<typeof IndicatorsModel.responseWithSector>;
