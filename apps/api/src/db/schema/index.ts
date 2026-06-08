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
};
