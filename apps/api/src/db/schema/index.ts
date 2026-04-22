import {
  users,
  usersRelations,
  accounts,
  accountsRelations,
  sessions,
  sessionsRelations,
  twoFactors,
  twoFactorsRelations,
  verifications,
} from "./auth-schema";
import {
  groups,
  groupPermissions,
  groupPermissionsRelations,
  groupsRelations,
  modules,
  modulesRelations,
  permissions,
  permissionsRelations,
  userGroups,
  userGroupsRelations,
} from "./rbac-schema";
import { siteConfig } from "./config-schema";

export * from "./auth-schema";
export * from "./rbac-schema";
export * from "./config-schema";

export const schema = {
  users,
  usersRelations,
  accounts,
  accountsRelations,
  sessions,
  sessionsRelations,
  twoFactors,
  twoFactorsRelations,
  verifications,
  groups,
  groupPermissions,
  groupPermissionsRelations,
  groupsRelations,
  modules,
  modulesRelations,
  permissions,
  permissionsRelations,
  userGroups,
  userGroupsRelations,
  siteConfig,
};
