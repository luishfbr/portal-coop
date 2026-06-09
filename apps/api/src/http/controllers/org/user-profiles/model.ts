import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userProfiles } from "@/db/schema";

const _select = createSelectSchema(userProfiles);

const _upsert = z.object({
  agencyId: z.string().nullable().optional(),
  sectorId: z.string().nullable().optional(),
  areaId: z.string().nullable().optional(),
  jobFunctionId: z.string().nullable().optional(),
});

export const UserProfilesModel = {
  response: _select,
  upsert: _upsert,
  params: z.object({ userId: z.string() }),
  errorResponse: z.object({ message: z.string() }),
};

export type UpsertUserProfile = z.infer<typeof UserProfilesModel.upsert>;
export type UserProfileResponse = z.infer<typeof UserProfilesModel.response>;
