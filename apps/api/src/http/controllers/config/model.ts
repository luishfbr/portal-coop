import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { siteConfig } from "@/db/schema";

const _update = createUpdateSchema(siteConfig, {
  companyName: z.string().min(2).max(100),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().max(30).optional(),
  companyLogo: z.string().url().optional(),
  companyAddress: z.string().max(255).optional(),
});

const _select = createSelectSchema(siteConfig);

export const SiteConfigModel = {
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
};

export type UpdateSiteConfig = z.infer<typeof SiteConfigModel.update>;
export type SiteConfigResponse = z.infer<typeof SiteConfigModel.response>;
