import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { indicatorValues } from "@/db/schema";

const _insert = createInsertSchema(indicatorValues, {
  value: z.coerce.number(),
  referenceDate: z.string().date(),
});

const _update = createUpdateSchema(indicatorValues, {
  value: z.coerce.number().optional(),
  referenceDate: z.string().date().optional(),
});

const _select = createSelectSchema(indicatorValues, {
  value: z.coerce.number(),
});

export const ValuesModel = {
  create: _insert.omit({ id: true, indicatorId: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, indicatorId: true, createdAt: true, updatedAt: true }),
  response: _select,
  params: z.object({ id: z.string(), valueId: z.string() }),
  indicatorParams: z.object({ id: z.string() }),
  query: z.object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    type: z.enum(["realizado", "meta"]).optional(),
  }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateIndicatorValue = z.infer<typeof ValuesModel.create>;
export type UpdateIndicatorValue = z.infer<typeof ValuesModel.update>;
export type IndicatorValueResponse = z.infer<typeof ValuesModel.response>;
