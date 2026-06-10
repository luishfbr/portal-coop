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
  rateLimits,
} from "./auth-schema";
export * from "./modules-schema";
import { modules } from "./modules-schema";

export * from "./organizational-schema";
import {
  agencies,
  agenciesRelations,
  sectors,
  sectorsRelations,
  areas,
  areasRelations,
  jobFunctions,
  jobFunctionsRelations,
  userProfiles,
  userProfilesRelations,
} from "./organizational-schema";

export * from "./rbac-schema";
import {
  groups,
  groupsRelations,
  groupModules,
  groupModulesRelations,
  userGroups,
  userGroupsRelations,
  modulesRelations,
} from "./rbac-schema";

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
  rateLimits,
  modules,
  modulesRelations,
  agencies,
  agenciesRelations,
  sectors,
  sectorsRelations,
  areas,
  areasRelations,
  jobFunctions,
  jobFunctionsRelations,
  userProfiles,
  userProfilesRelations,
  groups,
  groupsRelations,
  groupModules,
  groupModulesRelations,
  userGroups,
  userGroupsRelations,
};
