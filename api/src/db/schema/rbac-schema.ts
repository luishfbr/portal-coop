import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const groups = pgTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userGroups = pgTable("user-groups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  moduleId: text("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const groupPermissions = pgTable("group-permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, {
      onDelete: "cascade",
    }),
  permissionId: text("permission_id")
    .notNull()
    .references(() => permissions.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  userGroups: many(userGroups),
  groupPermissions: many(groupPermissions),
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

export const modulesRelations = relations(modules, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  module: one(modules, {
    fields: [permissions.moduleId],
    references: [modules.id],
  }),
  groupPermissions: many(groupPermissions),
}));

export const groupPermissionsRelations = relations(groupPermissions, ({ one }) => ({
  group: one(groups, {
    fields: [groupPermissions.groupId],
    references: [groups.id],
  }),
  permission: one(permissions, {
    fields: [groupPermissions.permissionId],
    references: [permissions.id],
  }),
}));
