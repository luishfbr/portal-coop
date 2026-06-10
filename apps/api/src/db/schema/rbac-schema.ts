import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { randomUUIDv7 } from "bun";
import { users } from "./auth-schema";
import { modules } from "./modules-schema";

export const groups = pgTable("groups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const groupModules = pgTable(
  "group_modules",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_group_modules").on(table.groupId, table.moduleId),
  ]
);

export const userGroups = pgTable(
  "user_groups",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_user_groups").on(table.userId, table.groupId),
  ]
);

export const modulesRelations = relations(modules, ({ many }) => ({
  groupModules: many(groupModules),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  groupModules: many(groupModules),
  userGroups: many(userGroups),
}));

export const groupModulesRelations = relations(groupModules, ({ one }) => ({
  group: one(groups, {
    fields: [groupModules.groupId],
    references: [groups.id],
  }),
  module: one(modules, {
    fields: [groupModules.moduleId],
    references: [modules.id],
  }),
}));

export const userGroupsRelations = relations(userGroups, ({ one }) => ({
  user: one(users, {
    fields: [userGroups.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [userGroups.groupId],
    references: [groups.id],
  }),
}));
