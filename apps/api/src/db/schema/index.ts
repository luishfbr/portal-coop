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
};
