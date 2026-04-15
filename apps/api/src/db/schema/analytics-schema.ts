import { randomUUIDv7 } from "bun";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const analyticsReports = pgTable("analytics_reports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),

  name: text("name").notNull(),

  slug: text("slug").notNull().unique(),

  rowCount: integer("row_count").notNull().default(0),

  columnCount: integer("column_count").notNull().default(0),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
