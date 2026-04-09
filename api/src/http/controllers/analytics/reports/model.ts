import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { analyticsReports } from "@/db/schema";

const slugSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(
    /^[a-z_][a-z0-9_]*$/,
    "Slug must be a valid SQL identifier (lowercase letters, digits, underscores; must start with letter or underscore)"
  );

const _insert = createInsertSchema(analyticsReports, {
  name: z.string().min(2).max(200),
  slug: slugSchema,
});

const _update = createUpdateSchema(analyticsReports, {
  name: z.string().min(2).max(200),
  slug: slugSchema,
});

const _select = createSelectSchema(analyticsReports);

export const ReportModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
};

export type CreateReport = z.infer<typeof ReportModel.create>;
export type UpdateReport = z.infer<typeof ReportModel.update>;
export type ReportResponse = z.infer<typeof ReportModel.response>;
