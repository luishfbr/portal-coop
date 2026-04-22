import { randomUUIDv7 } from "bun";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  companyName: text("company_name").notNull(),
  companyLogo: text("company_logo"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  companyAddress: text("company_address"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
