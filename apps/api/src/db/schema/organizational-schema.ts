import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const agencies = pgTable("agencies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const sectors = pgTable("sectors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const areas = pgTable("areas", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  sectorId: text("sector_id")
    .notNull()
    .references(() => sectors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const jobFunctions = pgTable("job_functions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    agencyId: text("agency_id").references(() => agencies.id, {
      onDelete: "set null",
    }),
    sectorId: text("sector_id").references(() => sectors.id, {
      onDelete: "set null",
    }),
    areaId: text("area_id").references(() => areas.id, {
      onDelete: "set null",
    }),
    jobFunctionId: text("job_function_id").references(() => jobFunctions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("uq_user_profiles_user_id").on(table.userId)],
);

export const agenciesRelations = relations(agencies, ({ many }) => ({
  userProfiles: many(userProfiles),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  areas: many(areas),
  userProfiles: many(userProfiles),
}));

export const areasRelations = relations(areas, ({ one, many }) => ({
  sector: one(sectors, { fields: [areas.sectorId], references: [sectors.id] }),
  userProfiles: many(userProfiles),
}));

export const jobFunctionsRelations = relations(jobFunctions, ({ many }) => ({
  userProfiles: many(userProfiles),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [userProfiles.agencyId],
    references: [agencies.id],
  }),
  sector: one(sectors, {
    fields: [userProfiles.sectorId],
    references: [sectors.id],
  }),
  area: one(areas, {
    fields: [userProfiles.areaId],
    references: [areas.id],
  }),
  jobFunction: one(jobFunctions, {
    fields: [userProfiles.jobFunctionId],
    references: [jobFunctions.id],
  }),
}));
