import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteConfig } from "@/db/schema";
import type { UpdateSiteConfig } from "./model";

export abstract class SiteConfigService {
  static async get() {
    const config = await db.query.siteConfig.findFirst();
    if (!config) return status(404, "Site config not found");
    return config;
  }

  static async update(data: UpdateSiteConfig) {
    const existing = await db.query.siteConfig.findFirst({
      columns: { id: true },
    });
    if (!existing) return status(404, "Site config not found");

    const [updated] = await db
      .update(siteConfig)
      .set(data)
      .where(eq(siteConfig.id, existing.id))
      .returning();
    return updated;
  }
}
